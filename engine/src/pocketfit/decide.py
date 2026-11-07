"""Push the posterior through Takomo's rules and choose the spec.

Many plausible true golfers are drawn from the posterior and today's rules are
applied to each. The chosen spec maximises expected agreement with the rules on
the true values; the share of draws that agree is the confidence shown.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from functools import lru_cache

import numpy as np
import pandas as pd

from takomo_fit import baseline as BL, products as PR

N_DRAWS = 800
RULES = PR.load()["current_tool_rules"]
LENGTH_ROWS = RULES["length_by_height_cm"]
LENGTH_EDGES = np.array([r["below_cm"] for r in LENGTH_ROWS if r["below_cm"] is not None], dtype=float)
LENGTH_VALUES = np.array([r["length_in"] for r in LENGTH_ROWS], dtype=float)
LADY_ADD = RULES["lady_flex_length_adjustment_in"]
GRIP_BY_GLOVE_IDX = np.array([RULES["grip_by_glove_size"][g] for g in PR.GLOVE_ORDER])
SCORES = [1, 2, 3, 4, 5]
FLIGHTS = ["low", "mid", "high"]
TEMPOS = ["smooth", "moderate", "quick"]
OVERRIDE_SD = 1e-6


def swing_bucket(speed):
    speed = np.asarray(speed, float)
    return np.select([speed < 60, speed <= 70, speed <= 80, speed <= 90], [1, 2, 3, 4], 5)


def length_from_height(height, lady):
    base = LENGTH_VALUES[np.searchsorted(LENGTH_EDGES, np.asarray(height, float), side="right")]
    return np.clip(np.round((base + np.where(lady, LADY_ADD, 0.0)) * 2) / 2, -1.5, 1.5)


def grip_from_hand(hand):
    return GRIP_BY_GLOVE_IDX[np.digitize(np.asarray(hand, float), PR.GLOVE_EDGES_CM)]


def lie_from_need(need):
    return np.clip(np.round(np.asarray(need, float)), -3, 3).astype(int)


@lru_cache(maxsize=500_000)
def shaft_for_head(head_slug: str, age: int, sex: str, score_b: int, swing_b: int, chars: tuple, flight: str, tempo: str) -> str:
    a = BL.Answers(age=age, sex=sex, score_bucket=score_b, swing_bucket=swing_b, characteristics=list(chars),
                   flight=flight, tempo=tempo, height_cm=175.0, wrist_to_floor_cm=86.0, glove="M")
    return BL.pick_shaft(head_slug, a, [])["slug"]


@lru_cache(maxsize=500_000)
def rules_for(age: int, sex: str, score_b: int, swing_b: int, chars: tuple, flight: str, tempo: str):
    a = BL.Answers(age=age, sex=sex, score_bucket=score_b, swing_bucket=swing_b, characteristics=list(chars),
                   flight=flight, tempo=tempo, height_cm=175.0, wrist_to_floor_cm=86.0, glove="M")
    ranked = BL.score_heads(a)
    return ranked[0][0], ranked[1][0], BL.pick_shaft(ranked[0][0], a, [])["slug"]


@lru_cache(maxsize=None)
def shaft_attrs(slug: str) -> tuple[str, str, str]:
    s = PR.shaft(slug)
    return s["flex"], s["material"], s["model"]


def _dist(values) -> dict:
    c = Counter(values)
    n = sum(c.values())
    return {k: v / n for k, v in c.most_common()}


@dataclass
class Decision:
    golfer_id: str
    head: str
    shaft: str
    length_in: float
    lie_deg: int
    grip: str
    purchase: str
    handedness: str
    p_head_first: dict
    head_credit: dict
    p_shaft: dict
    p_flex: dict
    p_material: dict
    p_length: dict
    p_lie: dict
    p_grip: dict
    p_stock: float
    whole: float
    post: dict = field(repr=False, default_factory=dict)

    def conf(self, part: str) -> float:
        return {
            "head": self.p_head_first.get(self.head, 0.0),
            "shaft": self.p_shaft.get(self.shaft, 0.0),
            "flex": self.p_flex.get(shaft_attrs(self.shaft)[0], 0.0),
            "material": self.p_material.get(shaft_attrs(self.shaft)[1], 0.0),
            "length": self.p_length.get(self.length_in, 0.0),
            "lie": self.p_lie.get(self.lie_deg, 0.0),
            "grip": self.p_grip.get(self.grip, 0.0),
            "purchase": self.p_stock if self.purchase == "stock" else 1 - self.p_stock,
        }[part]

    def flat(self) -> dict:
        return dict(golfer_id=self.golfer_id, head=self.head, shaft=self.shaft, length_in=self.length_in,
                    lie_deg=self.lie_deg, grip=self.grip, purchase=self.purchase, handedness=self.handedness,
                    est_7i_speed_mph=self.post["speed_mu"], est_height_cm=self.post["height_mu"],
                    est_wrist_to_floor_cm=self.post["wtf_mu"], est_hand_length_cm=self.post["hand_mu"],
                    est_lie_need_deg=self.post["lie_mu"],
                    **{f"est_carry_yd_{h}": self.post[f"carry_{h}"] for h in PR.HEAD_ORDER},
                    **{f"conf_{p}": round(self.conf(p), 4) for p in
                       ["head", "shaft", "flex", "material", "length", "lie", "grip", "purchase"]},
                    conf_whole=round(self.whole, 4), p_stock=round(self.p_stock, 4))


def apply_overrides(post: pd.Series, ov) -> pd.Series:
    if ov is None:
        return post
    p = post.copy()
    for field_, (mu, sd) in {"speed_mph": ("speed_mu", "speed_sd"), "height_cm": ("height_mu", "height_sd"),
                             "hand_length_cm": ("hand_mu", "hand_sd"), "lie_need_deg": ("lie_mu", "lie_sd")}.items():
        v = getattr(ov, field_)
        if v is not None:
            p[mu], p[sd] = float(v), OVERRIDE_SD
    for field_, name, classes in [("score_bucket", "score", SCORES), ("flight", "flight", FLIGHTS),
                                  ("tempo", "tempo", TEMPOS)]:
        v = getattr(ov, field_)
        if v is not None:
            for c in classes:
                p[f"p_{name}_{c}"] = float(c == v)
    if ov.characteristics is not None:
        p["chars"] = "|".join(ov.characteristics)
    return p


def decide_one(post: pd.Series, rng: np.random.Generator, n: int = N_DRAWS) -> Decision:
    chars = tuple(x for x in str(post.chars).split("|") if x and x != "nan")
    speed = rng.normal(post.speed_mu, post.speed_sd, n)
    height = rng.normal(post.height_mu, post.height_sd, n)
    hand = rng.normal(post.hand_mu, post.hand_sd, n)
    need = rng.normal(post.lie_mu, post.lie_sd, n)
    probs = {name: np.array([post[f"p_{name}_{c}"] for c in classes], float)
             for name, classes in [("score", SCORES), ("flight", FLIGHTS), ("tempo", TEMPOS)]}
    score_b = rng.choice(SCORES, n, p=probs["score"] / probs["score"].sum())
    flight = rng.choice(FLIGHTS, n, p=probs["flight"] / probs["flight"].sum())
    tempo = rng.choice(TEMPOS, n, p=probs["tempo"] / probs["tempo"].sum())
    swing_b = swing_bucket(speed)

    age, sex = int(post.age), str(post.sex)
    draws = [rules_for(age, sex, int(s), int(w), chars, f, t) for s, w, f, t in zip(score_b, swing_b, flight, tempo)]
    h1 = np.array([d[0] for d in draws])
    h2 = np.array([d[1] for d in draws])
    sh = np.array([d[2] for d in draws])

    head_credit = {h: float(np.mean((h1 == h) + 0.5 * (h2 == h))) for h in PR.HEAD_ORDER}
    head = max(head_credit, key=head_credit.get)

    sh_head = np.array([d[2] if d[0] == head else shaft_for_head(head, age, sex, int(s), int(w), chars, f, t)
                        for d, s, w, f, t in zip(draws, score_b, swing_b, flight, tempo)])
    attrs = np.array([shaft_attrs(s) for s in sh_head])
    flex_s, mat_s, model_s = attrs[:, 0], attrs[:, 1], attrs[:, 2]
    cand = {s["slug"]: float(np.mean(20 * (flex_s == s["flex"]) + 10 * (mat_s == s["material"])
                                     + 5 * (model_s == s["model"]) + 0.5 * (sh_head == s["slug"])))
            for s in PR.shafts_for_head(head)}
    shaft = max(cand, key=cand.get)

    length_s = length_from_height(height, flex_s == "lady")
    lie_s = lie_from_need(need)
    grip_s = grip_from_hand(hand)
    p_length, p_lie, p_grip = _dist(length_s.tolist()), _dist(lie_s.tolist()), _dist(grip_s.tolist())
    length, lie, grip = next(iter(p_length)), next(iter(p_lie)), next(iter(p_grip))
    purchase = BL.purchase_for(head, PR.shaft(shaft), float(length), int(lie), grip)
    stock_draw = ((mat_s == "steel") & (length_s == 0) & (lie_s == 0) & np.isin(grip_s, BL.STOCK_GRIPS)
                  & np.array([m in PR.head(h)["stock_shafts"] for h, m in zip(h1, model_s)]))
    whole = (h1 == head) & (sh_head == shaft) & (length_s == length) & (lie_s == lie) & (grip_s == grip)

    return Decision(
        golfer_id=str(post.name), head=head, shaft=shaft, length_in=float(length), lie_deg=int(lie), grip=str(grip),
        purchase=purchase, handedness=str(post.handedness),
        p_head_first=_dist(h1.tolist()), head_credit=head_credit, p_shaft=_dist(sh_head.tolist()),
        p_flex=_dist(flex_s.tolist()), p_material=_dist(mat_s.tolist()),
        p_length={float(k): v for k, v in p_length.items()}, p_lie={int(k): v for k, v in p_lie.items()},
        p_grip=p_grip, p_stock=float(stock_draw.mean()), whole=float(whole.mean()), post=post.to_dict())


def decide(post: pd.DataFrame, seed: int = 7, n: int = N_DRAWS) -> list[Decision]:
    rng = np.random.default_rng(seed)
    return [decide_one(r, rng, n) for _, r in post.iterrows()]
