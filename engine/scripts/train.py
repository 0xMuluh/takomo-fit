"""Train the artifact, validate it on dev, and record the evidence next to it.

python scripts/train.py --data ../lab/data --out artifacts/model.joblib [--test-out predictions.csv]
"""
import argparse
import json
import time
from pathlib import Path

import numpy as np
import pandas as pd

from pocketfit.decide import shaft_attrs
from pocketfit.evidence import TIERS, from_tables, load_split, mask_sources
from pocketfit.model import FitModel
from takomo_fit import score as S

SCORE_COLS = ["golfer_id", "head", "shaft", "length_in", "lie_deg", "grip", "purchase", "handedness",
              "est_7i_speed_mph", "est_height_cm", "est_wrist_to_floor_cm", "est_hand_length_cm", "est_lie_need_deg",
              *[f"est_carry_yd_{h}" for h in ["101-mkii", "201-mkii", "201t-mkii", "301-cb", "301-mb"]]]
BINS = np.array([0, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0001])


def calibration(pred: pd.DataFrame, labels: pd.DataFrame) -> dict:
    L = labels.set_index("golfer_id").loc[pred.golfer_id].reset_index()
    flex = pred.shaft.map(lambda s: shaft_attrs(s)[0]).to_numpy()
    same = lambda a, b: np.asarray(pred[a]).astype(str) == np.asarray(L[b]).astype(str)
    hits = {
        "head": (pred.conf_head, same("head", "ref_head")),
        "flex": (pred.conf_flex, flex == L.ref_flex.to_numpy()),
        "length": (pred.conf_length, pred.length_in.to_numpy() == L.ref_length_in.to_numpy()),
        "lie": (pred.conf_lie, pred.lie_deg.to_numpy() == L.ref_lie_deg.to_numpy()),
        "grip": (pred.conf_grip, same("grip", "ref_grip")),
        "whole spec": (pred.conf_whole, same("head", "ref_head") & same("shaft", "ref_shaft")
                       & (pred.length_in.to_numpy() == L.ref_length_in.to_numpy())
                       & (pred.lie_deg.to_numpy() == L.ref_lie_deg.to_numpy()) & same("grip", "ref_grip")),
    }
    out = {}
    for k, (conf, hit) in hits.items():
        conf, hit = np.asarray(conf, float), np.asarray(hit, float)
        idx = np.digitize(conf, BINS) - 1
        rows, ece = [], 0.0
        for b in range(len(BINS) - 1):
            m = idx == b
            if m.any():
                rows.append({"bin": f"{BINS[b]:.2f}-{min(BINS[b + 1], 1):.2f}", "n": int(m.sum()),
                             "said": round(float(conf[m].mean()), 3), "was_right": round(float(hit[m].mean()), 3)})
                ece += m.mean() * abs(conf[m].mean() - hit[m].mean())
        out[k] = {"said": round(float(conf.mean()), 3), "was_right": round(float(hit.mean()), 3),
                  "ECE": round(float(ece), 4), "bins": rows}
    return out


def predict_frame(model: FitModel, e: pd.DataFrame) -> pd.DataFrame:
    return pd.DataFrame([d.flat() for d in model.decide_batch(e)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default="../lab/data")
    ap.add_argument("--out", default="artifacts/model.joblib")
    ap.add_argument("--test-out", default=None)
    ap.add_argument("--no-ladder", action="store_true")
    a = ap.parse_args()
    data = Path(a.data)

    t0 = time.time()
    model = FitModel.train(data / "train")
    print(f"trained {model.version} in {time.time() - t0:.1f}s", flush=True)

    dev = load_split(data / "dev")
    e_dev = from_tables(dev)
    t0 = time.time()
    pred = predict_frame(model, e_dev)
    print(f"dev: {len(pred)} golfers in {time.time() - t0:.1f}s", flush=True)
    summary = S.summary(pred[SCORE_COLS], dev["labels"])
    cal = calibration(pred, dev["labels"])
    validation = {"dev": summary, "calibration": cal}
    print(json.dumps({k: summary[k] for k in ["spec_agreement_score", "full_spec_exact_pct", "component_pct"]}),
          flush=True)
    for k, v in cal.items():
        print(f"  calibration {k:10s} said {v['said']:.3f} right {v['was_right']:.3f} ECE {v['ECE']:.4f}", flush=True)

    if not a.no_ladder:
        ladder = {}
        for tier, keep in TIERS.items():
            p = predict_frame(model, mask_sources(e_dev, keep))
            s = S.summary(p[SCORE_COLS], dev["labels"])
            ladder[tier] = {"score": s["spec_agreement_score"], "whole_spec_pct": s["full_spec_exact_pct"],
                            "components": s["component_pct"], "mean_whole_confidence": round(float(p.conf_whole.mean()), 3)}
            print(f"  ladder {tier:16s} score {s['spec_agreement_score']:.2f} whole {s['full_spec_exact_pct']:.1f}%",
                  flush=True)
        validation["ladder"] = ladder

    model.meta["validation"] = validation
    path = model.save(a.out)
    print(f"saved {path}", flush=True)

    if a.test_out:
        pt = predict_frame(model, from_tables(load_split(data / "test")))
        pt[SCORE_COLS].to_csv(a.test_out, index=False)
        print(f"wrote {len(pt)} test predictions to {a.test_out}", flush=True)


if __name__ == "__main__":
    main()
