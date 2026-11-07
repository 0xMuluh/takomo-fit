"""Accuracy and calibration gates on the full dev split (slow)."""
import pandas as pd
import pytest

from pocketfit.evidence import from_tables
from takomo_fit import score as S

COLS = ["golfer_id", "head", "shaft", "length_in", "lie_deg", "grip", "purchase", "handedness"]


@pytest.mark.slow
def test_dev_accuracy_and_calibration(model, dev):
    ds = model.decide_batch(from_tables(dev))
    pred = pd.DataFrame([d.flat() for d in ds])
    s = S.summary(pred[COLS], dev["labels"])
    assert s["n_unbuildable_or_missing"] == 0
    assert s["spec_agreement_score"] >= 87.5
    assert s["full_spec_exact_pct"] >= 38.0
    L = dev["labels"].set_index("golfer_id").loc[pred.golfer_id]
    lie_hit = (pred.lie_deg.to_numpy() == L.ref_lie_deg.to_numpy()).mean()
    assert abs(pred.conf_lie.mean() - lie_hit) < 0.02
