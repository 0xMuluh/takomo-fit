"""The served request path must build exactly the evidence the validated table path builds."""
import numpy as np
import pandas as pd
import pytest

from pocketfit.evidence import NUMERIC, TEXT, from_request, from_tables, request_from_tables


def _sample_ids(t, n_each=6):
    e = from_tables(t)
    picks = set()
    for col in ["tm_speed", "radar_speed", "ball_line_tilt", "hand_photo", "wtf_photo", "video_speed", "rep_speed",
                "rep_carry"]:
        picks |= set(e.index[e[col].notna()][:n_each])
    picks |= set(e.index[e.glove_guessed == 1][:n_each])
    picks |= set(e.index[e.wtf_photo.isna() & e.height_photo.notna()][:n_each])
    return sorted(picks)


@pytest.mark.parametrize("split", ["dev", "demo"])
def test_request_path_matches_table_path(split, dev, demo):
    t = {"dev": dev, "demo": demo}[split]
    table = from_tables(t)
    ids = _sample_ids(t) if split == "dev" else list(table.index)
    assert len(ids) >= 16
    for gid in ids:
        served = from_request(request_from_tables(t, gid), gid).iloc[0]
        ref = table.loc[gid]
        for c in NUMERIC:
            a, b = served[c], ref[c]
            if pd.isna(b):
                assert pd.isna(a), f"{gid} {c}: served {a}, expected missing"
            else:
                assert np.isclose(float(a), float(b), rtol=0, atol=1e-9), f"{gid} {c}: {a} != {b}"
        for c in TEXT:
            assert served[c] == ref[c], f"{gid} {c}"
