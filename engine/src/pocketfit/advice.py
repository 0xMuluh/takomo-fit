"""Which at-home test would raise confidence most, before the golfer does it.

For a test the golfer has not done, the fusion already knows how precise the
estimate becomes with that source added (the residual spread of the fitted model
for that evidence combination). The future estimate is not known yet, so we
average over where it could land: it scatters around today's estimate by the
variance the test removes. That gives the expected confidence after the test.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.stats import norm

from .decide import Decision, LENGTH_EDGES
from .fusion import Fusion
from .i18n import Loc
from takomo_fit import products as PR

N_FUTURE = 400
GRIP_EDGES = [PR.GLOVE_EDGES_CM[2], PR.GLOVE_EDGES_CM[4]]
LIE_EDGES = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]
SPEED_EDGES = [60.0, 70.0, 80.0, 90.0]

TESTS = [
    {"test": "ball-line test", "key": "ball_line", "target": "lie", "group": "ball-line test", "part": "lie",
     "edges": LIE_EDGES},
    {"test": "hand photo with a bank card", "key": "hand", "target": "hand", "group": "hand photo", "part": "grip",
     "edges": GRIP_EDGES},
    {"test": "slow-motion swing video", "key": "video", "target": "speed", "group": "slow-motion video", "part": "flex",
     "edges": SPEED_EDGES},
    {"test": "launch monitor upload", "key": "radar", "target": "speed", "group": "home radar", "part": "flex",
     "edges": SPEED_EDGES},
]


def _bin_conf(mu: np.ndarray, sd: float, edges: list[float]) -> np.ndarray:
    cdf = norm.cdf((np.asarray(edges)[None, :] - mu[:, None]) / sd)
    probs = np.diff(np.concatenate([np.zeros((len(mu), 1)), cdf, np.ones((len(mu), 1))], axis=1), axis=1)
    return probs.max(axis=1)


def next_tests(fusion: Fusion, post: pd.Series, d: Decision, limit: int = 3, loc: Loc = Loc()) -> list[dict]:
    out = []
    for t in TESTS:
        lf = fusion.linear[t["target"]]
        have = tuple(post[f"{t['target']}_have"])
        if t["group"] in have:
            continue
        sd_now, mu = float(post[f"{t['target']}_sd"]), float(post[f"{t['target']}_mu"])
        sd_new = lf.sd_with(have, t["group"])
        if sd_new >= sd_now * 0.98:
            continue
        rng = np.random.default_rng(11)
        future = rng.normal(mu, np.sqrt(sd_now ** 2 - sd_new ** 2), N_FUTURE)
        now_c = float(_bin_conf(np.array([mu]), sd_now, t["edges"])[0])
        after_c = float(_bin_conf(future, sd_new, t["edges"]).mean())
        before = d.conf(t["part"])
        after = float(np.clip(before + (after_c - now_c), 0, 1))
        if after - before < 0.02:
            continue
        whole_after = float(np.clip(d.whole * after / max(before, 1e-6), 0, 1))
        out.append({"test": t["test"], "how": loc.t(f"test.{t['key']}"),
                    "improves": {t["part"]: [round(before, 3), round(after, 3)]},
                    "whole_spec_confidence_after": round(whole_after, 3)})
    out.sort(key=lambda x: -x["whole_spec_confidence_after"])
    seen, unique = set(), []
    for x in out:
        part = next(iter(x["improves"]))
        if part not in seen:
            unique.append(x)
            seen.add(part)
    return unique[:limit]
