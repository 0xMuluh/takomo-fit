"""Plain-language reasons for every part of the spec, built only from the decision and its evidence.

Nothing here invents a number: every figure comes from the posterior, the rules
or Takomo's product file, so the voice and chat layers can only rephrase it.
Wording and units come from the golfer's locale (i18n.Loc).
"""
from __future__ import annotations

import math

import numpy as np
import pandas as pd

from takomo_fit import baseline as BL, products as PR

from .decide import Decision, LENGTH_EDGES, shaft_attrs, swing_bucket
from .i18n import Loc
from .schemas import Component, EvidenceItem

FLIGHTS = ["low", "mid", "high"]
TEMPOS = ["smooth", "moderate", "quick"]
FLEX_NAMES = {"lady": "ladies", "senior": "senior", "regular": "regular", "stiff": "stiff", "x-stiff": "extra stiff"}
CLOSE_CALL = 0.65
EN = Loc()


def _num(v) -> bool:
    return v is not None and not (isinstance(v, float) and math.isnan(v))


def _mode(post: pd.Series, name: str, classes: list) -> tuple:
    p = {c: float(post[f"p_{name}_{c}"]) for c in classes}
    best = max(p, key=p.get)
    return best, p[best], p


def head_name(slug: str) -> str:
    return PR.head(slug)["name"]


def _second(dist: dict, chosen) -> tuple:
    rest = [(k, v) for k, v in dist.items() if k != chosen]
    return max(rest, key=lambda kv: kv[1]) if rest else (None, 0.0)


def yards_per_lie_degree(loft_deg: float, carry_yd: float) -> float:
    start = math.atan(math.tan(math.radians(loft_deg)) * math.sin(math.radians(1.0)))
    return carry_yd * math.tan(start)


def speed_evidence(post: pd.Series, loc: Loc = EN) -> list[EvidenceItem]:
    out = []
    if _num(post.get("rep_speed")):
        out.append(EvidenceItem(source=loc.t("ev.answer"), reading=loc.t("ev.speed", speed=loc.speed(post.rep_speed))))
    if _num(post.get("rep_carry")):
        loft = loc.t("ev.carry_loft", loft=loc.deg(post.own_loft)) if _num(post.get("own_loft")) else ""
        out.append(EvidenceItem(source=loc.t("ev.answer"),
                                reading=loc.t("ev.carry", carry=loc.dist(post.rep_carry), loft=loft)))
    if _num(post.get("video_speed")):
        out.append(EvidenceItem(source=loc.t("ev.video"), reading=loc.speed(post.video_speed, 1)))
    if _num(post.get("radar_speed")):
        out.append(EvidenceItem(source=loc.t("ev.radar"),
                                reading=loc.t("ev.radar_reading", speed=loc.speed(post.radar_speed, 1),
                                              carry=loc.dist(post.radar_carry))))
    if _num(post.get("tm_speed")):
        out.append(EvidenceItem(source=loc.t("ev.trackman"), reading=loc.t("ev.median", speed=loc.speed(post.tm_speed, 1))))
    return out


def head_component(d: Decision, post: pd.Series, loc: Loc = EN) -> Component:
    score_b, p_score, _ = _mode(post, "score", [1, 2, 3, 4, 5])
    flight, _, _ = _mode(post, "flight", FLIGHTS)
    tempo, _, _ = _mode(post, "tempo", TEMPOS)
    chars = [c for c in str(post.chars).split("|") if c and c != "nan"]
    sb = int(swing_bucket(post.speed_mu))
    a = BL.Answers(age=int(post.age), sex=str(post.sex), score_bucket=int(score_b), swing_bucket=sb,
                   characteristics=chars, flight=flight, tempo=tempo, height_cm=175, wrist_to_floor_cm=86, glove="M")
    scored = {slug: (total, parts) for slug, total, parts in BL.score_heads(a)}
    alt, p_alt = _second(d.p_head_first, d.head)
    alt = alt or max((h for h in PR.HEAD_ORDER if h != d.head), key=lambda h: d.head_credit[h])
    conf = d.conf("head")
    h, ha = PR.head(d.head), PR.head(alt)
    t, pt = scored[d.head]
    ta, pta = scored[alt]
    name, name_alt = h["name"], ha["name"]

    reasons = []
    self_b = int(post.score_bucket_self)
    if score_b != self_b:
        reasons.append(loc.t("head.score_optimism", said=loc.t(f"score.{self_b}"), real=loc.t(f"score.{score_b}"),
                             p=loc.pct(p_score)))
    else:
        reasons.append(loc.t("head.score_match", score=loc.t(f"score.{score_b}"), p=loc.pct(p_score)))
    reasons.append(loc.t("head.speed_points", speed=loc.speed(post.speed_mu), band=loc.speed_band(sb), a=name,
                         pa=pt["speed"], b=name_alt, pb=pta["speed"]))
    if chars:
        reasons.append(loc.t("head.priorities", chars=loc.listing([loc.t(f"char.{c}") for c in chars]), a=name,
                             pa=loc.num(pt["characteristics"]), b=name_alt, pb=loc.num(pta["characteristics"])))
    reasons.append(loc.t("head.total", a=name, ta=loc.num(t), b=name_alt, tb=loc.num(ta)))
    r, ra = h["ratings"], ha["ratings"]
    diffs = [loc.t("rating.vs", name=loc.t(f"rating.{k}"), a=r[k], b=ra[k])
             for k in ["forgiveness", "distance", "workability", "feel"] if r[k] != ra[k]]
    tied = t == ta
    close = conf < CLOSE_CALL or abs(t - ta) <= 1
    if tied:
        reasons.append(loc.t("head.tie_reason", a=name))
        summary = loc.t("head.tie_summary", a=name, b=name_alt)
    elif close:
        summary = loc.t("head.close_summary", a=name, b=name_alt, pa=loc.pct(conf),
                        pb=loc.pct(d.p_head_first.get(alt, 0.0)))
    else:
        summary = loc.t("head.summary", a=name, desc=loc.t(f"desc.{d.head}").rstrip("."))
    effect = loc.t("head.effect", b=name_alt, diffs=loc.listing(diffs)) if diffs else None
    return Component(part="head", value=d.head, confidence=round(conf, 3), alternative=alt,
                     alternative_probability=round(float(d.p_head_first.get(alt, 0.0)), 3), close_call=close,
                     summary=summary, reasons=reasons, effect=effect, evidence=speed_evidence(post, loc))


def shaft_component(d: Decision, post: pd.Series, loc: Loc = EN) -> Component:
    s = PR.shaft(d.shaft)
    flex, material, model = shaft_attrs(d.shaft)
    p_flex = d.p_flex.get(flex, 0.0)
    alt_flex, p_alt_flex = _second(d.p_flex, flex)
    flight, p_flight, _ = _mode(post, "flight", FLIGHTS)
    tempo, p_tempo, _ = _mode(post, "tempo", TEMPOS)
    sb = int(swing_bucket(post.speed_mu))
    reasons = [loc.t("shaft.speed", speed=loc.speed(post.speed_mu), sd=loc.speed_value(post.speed_sd, 1),
                     sources=loc.sources(post.speed_sources), band=loc.speed_band(sb), flex=loc.t(f"flex.{flex}"),
                     p=loc.pct(p_flex))]
    if alt_flex and p_alt_flex >= 0.15:
        reasons.append(loc.t("shaft.alt_flex", p=loc.pct(p_alt_flex), flex=loc.t(f"flex.{alt_flex}")))
    if material == "graphite":
        why = ("graphite_light" if flex in ("lady", "senior") else
               "graphite_women" if post.sex == "female" else
               "graphite_age" if post.age >= 70 else "graphite_profile")
        reasons.append(loc.t("shaft.graphite", why=loc.t(f"shaft.{why}")))
    else:
        reasons.append(loc.t("shaft.steel"))
    tempos = s["tempo_profile"] if isinstance(s["tempo_profile"], list) else ["any"]
    golfer_words = {"slow": "smooth", "mid": "moderate", "fast": "quick"}
    tempo_text = (loc.t("shaft.any_tempo") if "any" in tempos else
                  loc.t("shaft.tempos", list=loc.join([loc.t(f"tempo.{golfer_words.get(x, x)}") for x in tempos], "or")))
    reasons.append(loc.t("shaft.profile", model=model, launch="/".join(loc.t(f"launch.{x}") for x in s["flight_profile"]),
                         tempo_text=tempo_text, flight=loc.t(f"flight.{flight}"), pf=loc.pct(p_flight),
                         tempo=loc.t(f"tempo.{tempo}"), pt=loc.pct(p_tempo)))
    conf = d.conf("shaft")
    alt, p_alt = _second(d.p_shaft, d.shaft)
    close = p_flex < CLOSE_CALL
    effect = loc.t("shaft.effect", w=s["weight_g"])
    return Component(part="shaft", value=d.shaft, confidence=round(conf, 3), alternative=alt,
                     alternative_probability=round(p_alt, 3) if alt else None, close_call=close,
                     summary=loc.t("shaft.summary", model=model, flex=loc.t(f"flex.{flex}"),
                                   material=loc.t(f"material.{material}")),
                     reasons=reasons, effect=effect, evidence=speed_evidence(post, loc))


def length_component(d: Decision, post: pd.Series, loc: Loc = EN) -> Component:
    conf = d.conf("length")
    alt, p_alt = _second(d.p_length, d.length_in)
    edge = LENGTH_EDGES[np.argmin(np.abs(LENGTH_EDGES - post.height_mu))]
    ev = [EvidenceItem(source=loc.t("ev.answer"), reading=loc.t("ev.height", v=loc.cm(post.height_self, 0)))]
    if _num(post.get("height_photo")):
        ev.append(EvidenceItem(source=loc.t("ev.body"), reading=loc.t("ev.height", v=loc.cm(post.height_photo))))
    reasons = [loc.t("length.height", v=loc.cm(post.height_mu), sd=loc.num(post.height_sd, 1),
                     sources=loc.sources(post.height_sources)),
               loc.t("length.chart", len=loc.inches(d.length_in))]
    if abs(post.height_mu - edge) < 2 * post.height_sd:
        reasons.append(loc.t("length.edge", dist=loc.cm(abs(post.height_mu - edge)), edge=loc.cm(edge),
                             p=loc.pct(p_alt)))
    if shaft_attrs(d.shaft)[0] == "lady":
        reasons.append(loc.t("length.ladies"))
    summary = loc.t("length.summary_std") if d.length_in == 0 else loc.t("length.summary", len=loc.inches(d.length_in))
    return Component(part="length", value=f"{d.length_in:+.1f}", confidence=round(conf, 3),
                     alternative=f"{alt:+.1f}" if alt is not None else None,
                     alternative_probability=round(p_alt, 3) if alt is not None else None,
                     close_call=conf < CLOSE_CALL, summary=summary, reasons=reasons,
                     effect=loc.t("length.effect"), evidence=ev)


def lie_component(d: Decision, post: pd.Series, loc: Loc = EN) -> Component:
    conf = d.conf("lie")
    alt, p_alt = _second(d.p_lie, d.lie_deg)
    static = float(post.static_post)
    reasons = [loc.t("lie.static", v=loc.deg(static, 1, sign=True))]
    ev = [EvidenceItem(source=loc.t("ev.answer"), reading=loc.t("ev.wtf", v=loc.cm(post.wtf_self)))]
    if _num(post.get("wtf_photo")):
        ev.append(EvidenceItem(source=loc.t("ev.body"), reading=loc.t("ev.wtf", v=loc.cm(post.wtf_photo))))
    direct = False
    if _num(post.get("ball_line_tilt")):
        direct = True
        way = loc.t("lie.toward_toe") if post.ball_line_tilt > 0 else loc.t("lie.toward_heel")
        reasons.append(loc.t("lie.ball_line", v=loc.deg(abs(post.ball_line_tilt)), way=way))
        ev.append(EvidenceItem(source=loc.t("ev.ball_line"),
                               reading=loc.t("ev.tilt", v=loc.deg(post.ball_line_tilt, 1, sign=True))))
    if _num(post.get("tm_toe_up_takomo")):
        direct = True
        reasons.append(loc.t("lie.trackman", v=loc.deg(abs(post.tm_toe_up_takomo)),
                             dir=loc.t("lie.up") if post.tm_toe_up_takomo > 0 else loc.t("lie.down")))
        ev.append(EvidenceItem(source=loc.t("ev.trackman"),
                               reading=loc.t("ev.toe", v=loc.deg(post.tm_toe_up_takomo, 1, sign=True))))
    reasons.append(loc.t("lie.need", need=loc.deg(post.lie_mu, 1, sign=True), sd=loc.num(post.lie_sd, 1),
                         lie=f"{d.lie_deg:+d}°")
                   + (loc.t("lie.need_alt", alt=f"{alt:+d}°", p=loc.pct(p_alt)) if alt is not None
                      else loc.t("lie.need_end")))
    if not direct:
        reasons.append(loc.t("lie.no_direct"))
    loft = PR.head(d.head)["seven_iron_loft_deg"]
    carry = float(post[f"carry_{d.head}"])
    yd = yards_per_lie_degree(loft, carry)
    side = "left" if post.handedness == "right" else "right"
    effect = loc.t("lie.effect", carry=loc.dist_adj(carry), offset=loc.dist(yd, 1), side=loc.t(f"side.{side}"))
    summary = (loc.t("lie.summary_std") if d.lie_deg == 0 else
               loc.t("lie.summary_up" if d.lie_deg > 0 else "lie.summary_flat", n=abs(d.lie_deg)))
    return Component(part="lie", value=f"{d.lie_deg:+d}", confidence=round(conf, 3),
                     alternative=f"{alt:+d}" if alt is not None else None,
                     alternative_probability=round(p_alt, 3) if alt is not None else None,
                     close_call=conf < CLOSE_CALL, summary=summary, reasons=reasons, effect=effect,
                     evidence=ev)


def grip_component(d: Decision, post: pd.Series, loc: Loc = EN) -> Component:
    conf = d.conf("grip")
    alt, p_alt = _second(d.p_grip, d.grip)
    ev = []
    glove = PR.GLOVE_ORDER[int(post.glove_self)]
    if post.glove_guessed == 1:
        ev.append(EvidenceItem(source=loc.t("ev.answer"), reading=loc.t("ev.glove_unknown")))
    else:
        ev.append(EvidenceItem(source=loc.t("ev.answer"), reading=loc.t("ev.glove", v=glove)))
    if _num(post.get("hand_photo")):
        ev.append(EvidenceItem(source=loc.t("ev.hand"), reading=loc.t("ev.hand_length", v=loc.cm(post.hand_photo))))
    grip = loc.t(f"grip.{d.grip}")
    reasons = [loc.t("grip.hand", v=loc.cm(post.hand_mu), sd=loc.num(post.hand_sd, 2),
                     sources=loc.sources(post.hand_sources)),
               loc.t("grip.maps", grip=grip)]
    if alt is not None and p_alt >= 0.15:
        reasons.append(loc.t("grip.alt", alt=_cap(loc.t(f"grip.{alt}")), p=loc.pct(p_alt)))
    return Component(part="grip", value=d.grip, confidence=round(conf, 3), alternative=alt,
                     alternative_probability=round(p_alt, 3) if alt is not None else None,
                     close_call=conf < CLOSE_CALL, summary=_cap(loc.t("grip.summary", grip=grip)), reasons=reasons,
                     effect=loc.t("grip.effect"), evidence=ev)


def _cap(s: str) -> str:
    return s[:1].upper() + s[1:]


def custom_reasons(d: Decision, loc: Loc = EN) -> list[tuple[str, str]]:
    """Each non-stock part as (part, wording)."""
    s = PR.shaft(d.shaft)
    out = []
    if s["material"] != "steel" or s["model"] not in PR.head(d.head)["stock_shafts"]:
        out.append(("shaft", loc.t("custom.shaft", model=s["model"], material=loc.t(f"material.{s['material']}"))))
    if d.length_in != 0:
        out.append(("length", loc.t("custom.length", v=loc.inches(d.length_in))))
    if d.lie_deg != 0:
        out.append(("lie", loc.t("custom.lie", v=f"{d.lie_deg:+d}°")))
    if d.grip not in BL.STOCK_GRIPS:
        out.append(("grip", loc.t("custom.grip", grip=loc.t(f"grip.{d.grip}"))))
    return out


def purchase_component(d: Decision, post: pd.Series, loc: Loc = EN) -> tuple[Component, dict]:
    parts = custom_reasons(d, loc)
    because = [text for _, text in parts]
    p_stock = d.p_stock
    if d.purchase == "stock":
        msg = loc.t("purchase.stock")
    else:
        soft = []
        if d.lie_deg != 0 and d.p_lie.get(0, 0) >= 0.25:
            soft.append(loc.t("purchase.soft_lie", p=loc.pct(d.p_lie.get(0, 0))))
        if d.length_in != 0 and d.p_length.get(0.0, 0) >= 0.25:
            soft.append(loc.t("purchase.soft_length", p=loc.pct(d.p_length.get(0.0, 0))))
        msg = loc.t("purchase.custom", because=loc.listing(because))
        only_soft = all((part == "lie" and d.p_lie.get(0, 0) >= 0.25) or
                        (part == "length" and d.p_length.get(0.0, 0) >= 0.25) for part, _ in parts)
        if soft and only_soft:
            msg += loc.t("purchase.close", soft=loc.join(soft))
            msg += (loc.t("purchase.close_ball_line") if "ball-line test" not in tuple(post["lie_have"])
                    else loc.t("purchase.close_end"))
    reasons = ([loc.t("purchase.non_stock", list=loc.listing(because))] if because else [loc.t("purchase.all_stock")])
    reasons.append(loc.t("purchase.p_stock", p=loc.pct(p_stock)))
    reasons.append(loc.t("purchase.policy"))
    comp = Component(part="purchase", value=d.purchase, confidence=round(d.conf("purchase"), 3),
                     alternative="stock" if d.purchase == "custom" else "custom",
                     alternative_probability=round(p_stock if d.purchase == "custom" else 1 - p_stock, 3),
                     close_call=0.25 <= p_stock <= 0.75, summary=msg, reasons=reasons)
    return comp, {"recommendation": d.purchase, "probability_stock_is_right": round(p_stock, 3),
                  "custom_because": because, "message": msg}


def components(d: Decision, post: pd.Series, loc: Loc = EN) -> tuple[list[Component], dict]:
    purchase, advice = purchase_component(d, post, loc)
    return [head_component(d, post, loc), shaft_component(d, post, loc), length_component(d, post, loc),
            lie_component(d, post, loc), grip_component(d, post, loc), purchase], advice
