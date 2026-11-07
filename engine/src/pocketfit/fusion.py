"""Estimate each true golfer value with a calibrated uncertainty.

Continuous values use linear-Gaussian fusion. For every combination of available
evidence sources a regression truth ~ evidence is fitted on the training golfers
that have at least those sources; its coefficients are the weight each source
gets and its residual spread is the posterior standard deviation. Every
combination is fitted at training time, so serving needs only the coefficients.

Discrete values (score bucket, needed ball flight, tempo) use gradient-boosted
classifiers that accept missing evidence and return probabilities.
"""
from __future__ import annotations

from dataclasses import dataclass
from itertools import combinations

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier

from takomo_fit import baseline as BL, products as PR

MIN_ROWS = 40


@dataclass(frozen=True)
class Target:
    name: str
    truth: str
    always: tuple[str, ...]
    groups: tuple[tuple[str, tuple[str, ...]], ...]

    @property
    def group_names(self) -> list[str]:
        return [g for g, _ in self.groups]

    def cols(self, group: str) -> tuple[str, ...]:
        return dict(self.groups)[group]


SPEED = Target("speed", "true_7i_speed_mph", ("age", "female", "score_bucket_self"), (
    ("reported speed", ("rep_speed",)),
    ("reported carry", ("rep_carry",)),
    ("known loft", ("own_loft",)),
    ("carry with loft", ("carry_x_loft",)),
    ("slow-motion video", ("video_speed",)),
    ("home radar", ("radar_speed", "radar_carry")),
    ("TrackMan", ("tm_speed",)),
))
HEIGHT = Target("height", "true_height_cm", ("female", "height_self"), (
    ("body photo (good)", ("height_photo_good",)),
    ("body photo (poor)", ("height_photo_poor",)),
))
WTF = Target("wtf", "true_wrist_to_floor_cm", ("female", "wtf_self", "height_self"), (
    ("body photo (good)", ("wtf_photo_good",)),
    ("body photo (poor)", ("wtf_photo_poor",)),
    ("photo height", ("height_photo",)),
))
HAND = Target("hand", "true_hand_length_cm", ("female", "height_self", "glove_self"), (
    ("glove size known", ("glove_known",)),
    ("hand photo", ("hand_photo",)),
    ("finger length", ("finger_photo",)),
    ("photo height", ("height_photo",)),
))
LIE = Target("lie", "true_lie_need_deg", ("static_post",), (
    ("TrackMan, Takomo test club", ("tm_toe_up_takomo",)),
    ("TrackMan, own club", ("tm_toe_up_own",)),
    ("ball-line test", ("ball_line_tilt",)),
))
STAGE1 = [SPEED, HEIGHT, WTF, HAND]


def derive(e: pd.DataFrame) -> pd.DataFrame:
    e = e.copy()
    good, poor = e.photo_good == 1, e.photo_good == 0
    for v in ["height", "wtf"]:
        e[f"{v}_photo_good"] = e[f"{v}_photo"].where(good)
        e[f"{v}_photo_poor"] = e[f"{v}_photo"].where(poor)
    e["glove_known"] = e.glove_self.where(e.glove_guessed == 0)
    e["carry_x_loft"] = e.rep_carry * e.own_loft
    return e


class LinearFusion:
    def __init__(self, target: Target):
        self.target = target
        self.models: dict[tuple[str, ...], tuple[list[str], np.ndarray, float, int]] = {}
        self.route: dict[tuple[str, ...], tuple[str, ...]] = {}

    def _mask_key(self, groups) -> tuple[str, ...]:
        present = set(groups)
        return tuple(g for g in self.target.group_names if g in present)

    def fit(self, X: pd.DataFrame, y: pd.Series) -> "LinearFusion":
        t = self.target
        names = t.group_names
        all_masks = [self._mask_key(c) for k in range(len(names) + 1) for c in combinations(names, k)]
        for mask in all_masks:
            cols = list(t.always) + [c for g in mask for c in t.cols(g)]
            rows = X[cols].notna().all(axis=1) & y.notna()
            if rows.sum() < MIN_ROWS:
                continue
            A = np.column_stack([np.ones(rows.sum()), X.loc[rows, cols].to_numpy(float)])
            b = y[rows].to_numpy(float)
            coef, *_ = np.linalg.lstsq(A, b, rcond=None)
            resid = b - A @ coef
            sd = float(np.sqrt(resid @ resid / max(1, len(b) - A.shape[1])))
            self.models[mask] = (cols, coef, sd, int(rows.sum()))
        for mask in all_masks:
            if mask in self.models:
                self.route[mask] = mask
                continue
            subs = [m for m in self.models if set(m) <= set(mask)]
            self.route[mask] = min(subs, key=lambda m: (self.models[m][2], -len(m)))
        return self

    def available(self, e: pd.DataFrame) -> list[tuple[str, ...]]:
        t = self.target
        names = t.group_names
        have = np.column_stack([~np.isnan(e[list(t.cols(g))].to_numpy(float)).any(axis=1) for g in names])
        return [tuple(names[j] for j in np.flatnonzero(row)) for row in have]

    def predict(self, e: pd.DataFrame) -> pd.DataFrame:
        name = self.target.name
        masks = self.available(e)
        n = len(e)
        mu, sd = np.full(n, np.nan), np.full(n, np.nan)
        used = np.empty(n, dtype=object)
        rows: dict[tuple, list[int]] = {}
        for i, m in enumerate(masks):
            rows.setdefault(m, []).append(i)
        for mask, ii in rows.items():
            route = self.route[mask]
            cols, coef, s, _ = self.models[route]
            A = np.column_stack([np.ones(len(ii)), e[cols].to_numpy(float)[ii]])
            mu[ii], sd[ii] = A @ coef, s
            used[ii] = " + ".join(route) if route else "questionnaire"
        have = np.empty(n, dtype=object)
        have[:] = masks
        return pd.DataFrame({f"{name}_mu": mu, f"{name}_sd": sd, f"{name}_sources": used, f"{name}_have": have},
                            index=e.index)

    def sd_with(self, mask: tuple[str, ...], extra: str) -> float:
        return self.models[self.route[self._mask_key(set(mask) | {extra})]][2]

    def sd_of(self, mask: tuple[str, ...]) -> float:
        return self.models[self.route[self._mask_key(mask)]][2]


DISCRETE = {
    "score": ("ref_score_bucket", [1, 2, 3, 4, 5],
              ["score_bucket_self", "age", "female", "rounds", "speed_mu", "tm_offset_sd", "tm_side_sd",
               "tm_face_to_path_sd", "spray_sd", "rep_carry", "rep_speed"]),
    "flight": ("needed_flight", ["low", "mid", "high"],
               ["flight_self", "score_bucket_self", "speed_mu", "own_loft", "tm_land_201", "tm_land_own",
                "tm_dyn_loft", "tm_attack", "tm_launch_own", "radar_launch", "radar_carry", "radar_speed",
                "age", "female"]),
    "tempo": ("true_tempo", ["smooth", "moderate", "quick"],
              ["video_total_s", "video_fps", "tempo_self", "speed_mu", "age"]),
}


class Fusion:
    def fit(self, e: pd.DataFrame, labels: pd.DataFrame) -> "Fusion":
        L = labels.set_index("golfer_id").reindex(e.index)
        x = derive(e)
        self.linear: dict[str, LinearFusion] = {}
        for t in STAGE1:
            self.linear[t.name] = LinearFusion(t).fit(x, L[t.truth])
            x = x.join(self.linear[t.name].predict(x))
        x["static_post"] = BL.lie_continuous(x.height_mu, x.wtf_mu)
        self.linear["lie"] = LinearFusion(LIE).fit(x, L[LIE.truth])
        self.carry = {h: tuple(np.polyfit(L.true_7i_speed_mph, L[f"exp_carry_yd_{h}"], 1))
                      for h in PR.HEAD_ORDER}
        self.classifiers = {}
        for name, (truth, classes, feats) in DISCRETE.items():
            m = HistGradientBoostingClassifier(max_iter=400, learning_rate=0.1, max_leaf_nodes=24,
                                               l2_regularization=1.0, early_stopping=True,
                                               validation_fraction=0.15, n_iter_no_change=25, random_state=0)
            m.fit(x[feats].to_numpy(float), L[truth].to_numpy())
            self.classifiers[name] = (m, classes, feats)
        return self

    def posterior(self, e: pd.DataFrame) -> pd.DataFrame:
        x = derive(e)
        for name in ["speed", "height", "wtf", "hand"]:
            x = x.join(self.linear[name].predict(x))
        x["static_post"] = BL.lie_continuous(x.height_mu, x.wtf_mu)
        x = x.join(self.linear["lie"].predict(x))
        for h, (slope, icept) in self.carry.items():
            x[f"carry_{h}"] = slope * x.speed_mu + icept
        for name, (m, classes, feats) in self.classifiers.items():
            p = m.predict_proba(x[feats].to_numpy(float))
            for c in classes:
                x[f"p_{name}_{c}"] = p[:, list(m.classes_).index(c)]
        return x
