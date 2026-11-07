"""Fitting service: request in, explained fit out, with sessions for progressive capture and what-ifs."""
from __future__ import annotations

import sqlite3
import threading
import time
import uuid
from collections import OrderedDict
from typing import Protocol

from takomo_fit import products as PR

from .advice import next_tests
from .decide import shaft_attrs
from .evidence import from_request
from .explain import FLEX_NAMES, components, head_name
from .i18n import Loc
from .model import FitModel
from .schemas import (Estimate, Evidence, FitRequest, FitResponse, Locale, NextTest, Overrides, Shaft, Spec,
                      StockAdvice)

FLIGHTS = ["low", "mid", "high"]
TEMPOS = ["smooth", "moderate", "quick"]


class FitStore(Protocol):
    def put(self, fit_id: str, req: FitRequest, resp: FitResponse) -> None: ...
    def get(self, fit_id: str) -> tuple[FitRequest, FitResponse] | None: ...


class MemoryStore:
    """Bounded, expiring in-process store. Swap for Redis behind the same two methods when scaling out."""

    def __init__(self, max_items: int = 50_000, ttl_s: int = 7 * 24 * 3600):
        self._d: OrderedDict[str, tuple[float, FitRequest, FitResponse]] = OrderedDict()
        self._lock = threading.Lock()
        self.max_items, self.ttl_s = max_items, ttl_s

    def put(self, fit_id, req, resp):
        with self._lock:
            self._d[fit_id] = (time.time(), req, resp)
            self._d.move_to_end(fit_id)
            while len(self._d) > self.max_items:
                self._d.popitem(last=False)

    def get(self, fit_id):
        with self._lock:
            item = self._d.get(fit_id)
            if not item:
                return None
            if time.time() - item[0] > self.ttl_s:
                del self._d[fit_id]
                return None
            return item[1], item[2]


class SqliteStore:
    """Fits on disk, so result links survive restarts and redeploys. One file, one instance."""

    def __init__(self, path: str, ttl_s: int = 180 * 24 * 3600):
        self._db = sqlite3.connect(path, check_same_thread=False)
        self._db.execute("PRAGMA journal_mode=WAL")
        self._db.execute("CREATE TABLE IF NOT EXISTS fits (id TEXT PRIMARY KEY, at REAL, req TEXT, resp TEXT)")
        self._lock = threading.Lock()
        self.ttl_s = ttl_s

    def put(self, fit_id, req, resp):
        with self._lock, self._db:
            self._db.execute("INSERT OR REPLACE INTO fits VALUES (?, ?, ?, ?)",
                             (fit_id, time.time(), req.model_dump_json(), resp.model_dump_json()))

    def get(self, fit_id):
        with self._lock:
            row = self._db.execute("SELECT at, req, resp FROM fits WHERE id = ?", (fit_id,)).fetchone()
        if not row or time.time() - row[0] > self.ttl_s:
            return None
        return FitRequest.model_validate_json(row[1]), FitResponse.model_validate_json(row[2])


class FitNotFound(KeyError):
    pass


def _merge_evidence(old: Evidence, new: Evidence) -> Evidence:
    merged = old.model_dump()
    merged.update({k: v for k, v in new.model_dump().items() if v is not None})
    return Evidence.model_validate(merged)


class FitService:
    def __init__(self, model: FitModel, store: FitStore | None = None):
        self.model = model
        self.store = store or MemoryStore()

    def _compute(self, req: FitRequest, fit_id: str) -> FitResponse:
        loc = Loc(req.locale.lang, req.locale.units)
        evidence = from_request(req, fit_id)
        d, post = self.model.decide_single(evidence, req.overrides)
        comps, advice = components(d, post, loc)
        s = PR.shaft(d.shaft)
        tp = s["tempo_profile"] if isinstance(s["tempo_profile"], list) else ["any"]
        spec = Spec(head=d.head, head_name=head_name(d.head),
                    shaft=Shaft(slug=d.shaft, model=s["model"], flex=s["flex"], material=s["material"],
                                weight_g=s.get("weight_g"), flight_profile=s["flight_profile"], tempo_profile=tp),
                    length_in=d.length_in, lie_deg=d.lie_deg, grip=d.grip, handedness=d.handedness,
                    purchase=d.purchase)
        runner = comps[0].alternative
        estimates = {k: Estimate(mean=round(float(post[f"{k}_mu"]), 2), sd=round(float(post[f"{k}_sd"]), 3),
                                 sources=str(post[f"{k}_sources"])) for k in ["speed", "height", "wtf", "hand", "lie"]}
        estimates.update({f"carry_{h}": Estimate(mean=round(float(post[f"carry_{h}"]), 1),
                                                 sd=round(float(post.speed_sd) * self.model.fusion.carry[h][0], 2),
                                                 sources="ball-flight model at your estimated speed")
                          for h in PR.HEAD_ORDER})
        probs = {"score_bucket": {str(c): round(float(post[f"p_score_{c}"]), 3) for c in range(1, 6)},
                 "flight": {c: round(float(post[f"p_flight_{c}"]), 3) for c in FLIGHTS},
                 "tempo": {c: round(float(post[f"p_tempo_{c}"]), 3) for c in TEMPOS},
                 "head": {k: round(v, 3) for k, v in d.p_head_first.items()},
                 "lie": {f"{k:+d}": round(v, 3) for k, v in d.p_lie.items()},
                 "length": {f"{k:+.1f}": round(v, 3) for k, v in d.p_length.items()},
                 "grip": {k: round(v, 3) for k, v in d.p_grip.items()},
                 "flex": {k: round(v, 3) for k, v in d.p_flex.items()}}
        warnings = []
        if req.evidence.body_photo and req.evidence.body_photo.method == "ratio":
            warnings.append(loc.t("warn.body_ratio"))
        tests = [] if req.overrides else next_tests(self.model.fusion, post, d, loc=loc)
        return FitResponse(fit_id=fit_id, model_version=self.model.version, spec=spec, runner_up_head=runner,
                           whole_spec_confidence=round(d.whole, 3), components=comps,
                           stock_advice=StockAdvice(**advice), estimates=estimates, probabilities=probs,
                           next_tests=[NextTest(**t) for t in tests], warnings=warnings)

    def create(self, req: FitRequest) -> FitResponse:
        fit_id = uuid.uuid4().hex[:16]
        resp = self._compute(req, fit_id)
        self.store.put(fit_id, req, resp)
        return resp

    def get(self, fit_id: str) -> tuple[FitRequest, FitResponse]:
        item = self.store.get(fit_id)
        if item is None:
            raise FitNotFound(fit_id)
        return item

    def read(self, fit_id: str, locale: Locale | None = None) -> FitResponse:
        """The stored fit, re-worded if the golfer now reads in another language or units."""
        req, resp = self.get(fit_id)
        if locale is None or locale == req.locale:
            return resp
        return self._compute(req.model_copy(update={"locale": locale}), fit_id)

    def add_evidence(self, fit_id: str, evidence: Evidence, locale: Locale | None = None) -> FitResponse:
        req, _ = self.get(fit_id)
        new_req = req.model_copy(update={"evidence": _merge_evidence(req.evidence, evidence),
                                         "locale": locale or req.locale})
        resp = self._compute(new_req, fit_id)
        self.store.put(fit_id, new_req, resp)
        return resp

    def what_if(self, fit_id: str, overrides: Overrides,
                locale: Locale | None = None) -> tuple[FitResponse, FitResponse]:
        req, _ = self.get(fit_id)
        base = self.read(fit_id, locale)
        alt = self._compute(req.model_copy(update={"overrides": overrides, "locale": locale or req.locale}), fit_id)
        return base, alt


def spec_line(r: FitResponse) -> str:
    s = r.spec
    length = "standard length" if s.length_in == 0 else f"{s.length_in:+.1f} inch length"
    if s.lie_deg == 0:
        lie = "standard lie"
    else:
        lie = f"{abs(s.lie_deg)} degree{'s' if abs(s.lie_deg) > 1 else ''} {'upright' if s.lie_deg > 0 else 'flat'}"
    return (f"{s.head_name} with {s.shaft.model} {FLEX_NAMES[s.shaft.flex]} {s.shaft.material}, {length}, {lie}, "
            f"{s.grip} grip, {s.purchase} build")


def diff_specs(a: FitResponse, b: FitResponse, loc: Loc = Loc()) -> list[str]:
    out = []
    if a.spec.head != b.spec.head:
        out.append(loc.t("diff.head", a=a.spec.head_name, b=b.spec.head_name))
    fa, fb = shaft_attrs(a.spec.shaft.slug), shaft_attrs(b.spec.shaft.slug)
    if a.spec.shaft.slug != b.spec.shaft.slug:
        out.append(loc.t("diff.shaft", a=f"{a.spec.shaft.model} {loc.t(f'flex.{fa[0]}')}",
                         b=f"{b.spec.shaft.model} {loc.t(f'flex.{fb[0]}')}"))
    if a.spec.length_in != b.spec.length_in:
        out.append(loc.t("diff.length", a=loc.signed(a.spec.length_in), b=loc.signed(b.spec.length_in)))
    if a.spec.lie_deg != b.spec.lie_deg:
        out.append(loc.t("diff.lie", a=f"{a.spec.lie_deg:+d}", b=f"{b.spec.lie_deg:+d}"))
    if a.spec.grip != b.spec.grip:
        out.append(loc.t("diff.grip", a=loc.t(f"grip.{a.spec.grip}"), b=loc.t(f"grip.{b.spec.grip}")))
    if a.spec.purchase != b.spec.purchase:
        out.append(loc.t("diff.build", a=loc.t(f"build.{a.spec.purchase}"), b=loc.t(f"build.{b.spec.purchase}")))
    return out
