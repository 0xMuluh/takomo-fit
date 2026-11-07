"""Measure how wrong each evidence source is, against the truth, on the train split."""
import sys
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / "lab" / "data" / "train"
sys.path.insert(0, str(ROOT / "lab"))
from takomo_fit import baseline as BL, products as PR  # noqa: E402

q = pd.read_csv(D / "questionnaire.csv").set_index("golfer_id")
ph = pd.read_csv(D / "phone_measurements.csv").set_index("golfer_id")
L = pd.read_csv(D / "labels.csv").set_index("golfer_id")
g = pd.read_csv(D / "golfers.csv").set_index("golfer_id")
sh = pd.read_csv(D / "shots.csv")
te = pd.read_csv(D / "home_tests.csv")


def stats(name, err):
    err = pd.Series(err).dropna()
    q = err.quantile([0.05, 0.5, 0.95]).round(2).tolist()
    print(f"{name:38s} n={len(err):6d} bias={err.mean():+.2f} sd={err.std():.2f} "
          f"mad*1.48={1.4826 * (err - err.median()).abs().median():.2f} q05/50/95={q}")


print("--- body")
stats("height self", q.height_cm - L.true_height_cm)
stats("height photo good", (ph.height_photo_cm - L.true_height_cm)[ph.body_photo_quality == "good"])
stats("height photo poor", (ph.height_photo_cm - L.true_height_cm)[ph.body_photo_quality == "poor"])
stats("wtf self", q.wrist_to_floor_cm - L.true_wrist_to_floor_cm)
stats("wtf photo good", (ph.wrist_to_floor_photo_cm - L.true_wrist_to_floor_cm)[ph.body_photo_quality == "good"])
stats("wtf photo poor", (ph.wrist_to_floor_photo_cm - L.true_wrist_to_floor_cm)[ph.body_photo_quality == "poor"])
stats("wtf prior from true height", L.true_wrist_to_floor_cm - (0.4855 * L.true_height_cm + 2.0))
stats("hand photo", ph.hand_length_photo_cm - L.true_hand_length_cm)
stats("hand prior 0.108*h", L.true_hand_length_cm - 0.108 * L.true_height_cm)
print("glove self == true:", (q.glove == L.true_glove).mean().round(3),
      " guessed:", (q.glove == L.true_glove)[q.glove_was_guessed].mean().round(3))

print("--- speed")
stats("reported speed", q.reported_7i_speed_mph - L.true_7i_speed_mph)
c = q.reported_7i_carry_yd
stats("reported carry - true own carry", c - L.own_true_mean_carry_yd)
own = sh[sh.club == "own_7i"]
for sess in ["trackman_fitting", "home_radar"]:
    m = own[own.session == sess].groupby("golfer_id").club_speed_mph.median()
    stats(f"{sess} own median speed", m - L.true_7i_speed_mph.reindex(m.index))
stats("video 240fps speed", ph.clubhead_speed_video_mph - L.true_7i_speed_mph)
print("swing bucket from answer == true:", (q.swing_bucket == L.ref_swing_bucket).mean().round(3))
print("score bucket self == true:", (q.score_bucket == L.ref_score_bucket).mean().round(3))
print(pd.crosstab(q.score_bucket, L.ref_score_bucket, normalize="index").round(2))

print("--- lie")
stats("static chart(true body) - need", BL.lie_continuous(L.true_height_cm, L.true_wrist_to_floor_cm) - L.true_lie_need_deg)
tk = sh[sh.club.str.startswith("takomo_")].groupby("golfer_id").impact_toe_up_deg.mean()
stats("-takomo toe_up mean - need", -tk - L.true_lie_need_deg.reindex(tk.index))
ow = own[own.session == "trackman_fitting"].groupby("golfer_id").impact_toe_up_deg.mean()
stats("own adj - own toe_up - need", (L.true_own_club_lie_adj_deg.reindex(ow.index) - ow) - L.true_lie_need_deg.reindex(ow.index))
stats("-own toe_up - need (adj unknown)", -ow - L.true_lie_need_deg.reindex(ow.index))
stats("own club lie adj", L.true_own_club_lie_adj_deg)
bl = te[te.test == "ball_line_tilt"].groupby("golfer_id").value
blm, bln = bl.mean(), bl.count()
stats("-ball line mean - need", -blm - L.true_lie_need_deg.reindex(blm.index))
print("ball line shots per golfer:", bln.value_counts().to_dict())
x = blm
y = L.true_lie_need_deg.reindex(x.index) - L.true_own_club_lie_adj_deg.reindex(x.index)
print("ball line slope (need-ownadj ~ tilt):", np.polyfit(x, y, 1).round(3))
print("ref lie dist:", L.ref_lie_deg.value_counts(normalize=True).sort_index().round(3).to_dict())

print("--- flight / tempo")
print("flight self == need:", (q.flight == L.needed_flight).mean().round(3))
print("tempo self == true:", (q.tempo == L.true_tempo).mean().round(3))
tot = ph.backswing_video_s + ph.downswing_video_s
vt = np.where(tot < 1.05, "quick", np.where(tot > 1.35, "smooth", "moderate"))
vt = pd.Series(vt, index=ph.index)[tot.notna()]
print("tempo video == true:", (vt == L.true_tempo.reindex(vt.index)).mean().round(3))
tm = sh[(sh.session == "trackman_fitting") & sh.club.str.startswith("takomo_201")].groupby("golfer_id").landing_angle_deg.mean()
print("landing angle 201 vs needed landing corr:", np.corrcoef(tm, L.needed_flight_landing_angle_deg.reindex(tm.index))[0, 1].round(3))
print("needed flight dist:", L.needed_flight.value_counts(normalize=True).round(3).to_dict())
print(pd.crosstab(q.flight, L.needed_flight, normalize="index").round(2))
