"""HTTP API.

Public:   /health, /v1/model, /v1/catalog, /v1/fits (create, read, add evidence, what-if), /v1/voice/session,
          /v1/launch-monitor/photo, /video and /report (read a session from a photo or video of any launch
          monitor's screen, or a shared TrackMan link)
Agent:    /v1/agent/* are server tools for the ElevenLabs voice fitter. Each returns `say`
          (a short spoken answer built from the fit) and `data`; the agent may only rephrase `say`.
"""
from __future__ import annotations

import logging
import os
import time
from collections import defaultdict, deque
from typing import Annotated, Literal, Optional

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from takomo_fit import products as PR

from .i18n import Loc
from .launch_import import DEFAULT_VISION_MODEL, ImportFailed, ImportResult, read_photo, read_report, read_video
from .model import FitModel
from .schemas import Evidence, FitRequest, FitResponse, Locale, Overrides
from .service import FitNotFound, FitService, SqliteStore, diff_specs, spec_line

log = logging.getLogger("pocketfit")
ELEVEN_SIGNED_URL = "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"


class WhatIfResponse(BaseModel):
    changes: list[str]
    before: FitResponse
    after: FitResponse


class AgentFit(BaseModel):
    fit_id: str


class AgentExplain(AgentFit):
    part: Literal["head", "shaft", "length", "lie", "grip", "purchase"]


class AgentWhatIf(AgentFit, Overrides):
    pass


class AgentCompare(AgentFit):
    other_head: Optional[str] = None


class AgentReply(BaseModel):
    say: str
    data: dict = {}


class PhotoImport(BaseModel):
    image: str = Field(max_length=8_000_000, description="data:image/jpeg;base64,... of the launch-monitor screen")


class VideoImport(BaseModel):
    frames: list[Annotated[str, Field(max_length=1_500_000)]] = Field(
        min_length=2, max_length=12, description="JPEG data URLs of frames sampled evenly through the video, in order")


class ReportImport(BaseModel):
    # Shared TrackMan links carry the viewer's display settings after the report id and run past 700 characters.
    url: str = Field(max_length=4000)


IMPORT_STATUS = {"provider": 502, "report_not_found": 404, "report_private": 403}


def create_app(model_path: str | None = None, service: FitService | None = None) -> FastAPI:
    app = FastAPI(title="Takomo Pocket Fitter", version="1")
    if service is None:
        path = model_path or os.environ.get("PF_MODEL_PATH", "artifacts/model.joblib")
        store_path = os.environ.get("PF_STORE_PATH")
        service = FitService(FitModel.load(path), SqliteStore(store_path) if store_path else None)
    app.state.service = service
    origins = [o for o in os.environ.get("PF_CORS_ORIGINS", "http://localhost:3000").split(",") if o]
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"], allow_headers=["*"])

    @app.middleware("http")
    async def timing(request: Request, call_next):
        t0 = time.perf_counter()
        resp = await call_next(request)
        ms = (time.perf_counter() - t0) * 1000
        resp.headers["Server-Timing"] = f"app;dur={ms:.1f}"
        log.info("%s %s %s %.1fms", request.method, request.url.path, resp.status_code, ms)
        return resp

    def svc() -> FitService:
        return app.state.service

    def agent_auth(x_agent_secret: str | None = Header(default=None)):
        secret = os.environ.get("PF_AGENT_SECRET")
        if secret and x_agent_secret != secret:
            raise HTTPException(401, "bad agent secret")

    def lookup(s: FitService, fit_id: str):
        try:
            return s.get(fit_id)
        except FitNotFound:
            raise HTTPException(404, f"fit {fit_id} not found")

    @app.get("/health")
    def health(s: FitService = Depends(svc)):
        return {"status": "ok", "model_version": s.model.version}

    @app.get("/v1/model")
    def model_info(s: FitService = Depends(svc)):
        v = s.model.meta.get("validation", {})
        return {"version": s.model.version, **{k: s.model.meta[k] for k in ["trained_at", "train_rows", "products_sha"]},
                "dev": {k: v.get("dev", {}).get(k) for k in ["spec_agreement_score", "full_spec_exact_pct",
                                                            "component_pct", "measurement_mae"]},
                "calibration": {k: {"said": c["said"], "was_right": c["was_right"], "ECE": c["ECE"]}
                                for k, c in v.get("calibration", {}).items()},
                "ladder": {k: {"score": x["score"], "whole_spec_pct": x["whole_spec_pct"]}
                           for k, x in v.get("ladder", {}).items()}}

    def locale_q(lang: Optional[Literal["en", "fi", "sv", "de"]] = None,
                 units: Optional[Literal["imperial", "metric"]] = None) -> Optional[Locale]:
        """Optional ?lang=&units= on fit endpoints: reword the fit for the golfer's current language and units."""
        if lang is None and units is None:
            return None
        lang = lang or "en"
        return Locale(lang=lang, units=units or ("imperial" if lang == "en" else "metric"))

    @app.get("/v1/catalog")
    def catalog(lang: Literal["en", "fi", "sv", "de"] = "en"):
        d = PR.load()
        loc = Loc(lang)
        heads = d["heads"] if lang == "en" else [
            {**h, "description": loc.t(f"desc.{h['slug']}"), "target_score_label": loc.t(f"score.{h['target_score_bucket']}")}
            for h in d["heads"]]
        return {"heads": heads, "shafts": d["shafts"], "grips": d["grips"]}

    @app.post("/v1/fits", response_model=FitResponse)
    def create_fit(req: FitRequest, s: FitService = Depends(svc)):
        return s.create(req)

    @app.get("/v1/fits/{fit_id}", response_model=FitResponse)
    def read_fit(fit_id: str, s: FitService = Depends(svc), loc: Optional[Locale] = Depends(locale_q)):
        lookup(s, fit_id)
        return s.read(fit_id, loc)

    @app.post("/v1/fits/{fit_id}/evidence", response_model=FitResponse)
    def add_evidence(fit_id: str, ev: Evidence, s: FitService = Depends(svc),
                     loc: Optional[Locale] = Depends(locale_q)):
        lookup(s, fit_id)
        return s.add_evidence(fit_id, ev, loc)

    @app.post("/v1/fits/{fit_id}/what-if", response_model=WhatIfResponse)
    def what_if(fit_id: str, ov: Overrides, s: FitService = Depends(svc), loc: Optional[Locale] = Depends(locale_q)):
        req, _ = lookup(s, fit_id)
        before, after = s.what_if(fit_id, ov, loc)
        used = loc or req.locale
        return WhatIfResponse(changes=diff_specs(before, after, Loc(used.lang, used.units)), before=before, after=after)

    hits_by: dict[tuple[str, str], deque] = defaultdict(deque)

    def per_hour(request: Request, what: str, limit: int):
        fwd = request.headers.get("x-forwarded-for", "")
        ip = fwd.split(",")[0].strip() or (request.client.host if request.client else "unknown")
        hits, now = hits_by[(what, ip)], time.time()
        while hits and now - hits[0] > 3600:
            hits.popleft()
        if len(hits) >= limit:
            raise HTTPException(429, f"too many {what} requests; try again later")
        hits.append(now)

    @app.get("/v1/voice/session")
    async def voice_session(request: Request, fit_id: Optional[str] = None, s: FitService = Depends(svc)):
        if fit_id:
            lookup(s, fit_id)
        key, agent = os.environ.get("ELEVENLABS_API_KEY"), os.environ.get("ELEVENLABS_AGENT_ID")
        if not key or not agent:
            raise HTTPException(503, "voice fitter is not configured")
        per_hour(request, "voice session", int(os.environ.get("PF_VOICE_SESSIONS_PER_HOUR", "20")))
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(ELEVEN_SIGNED_URL, params={"agent_id": agent}, headers={"xi-api-key": key})
        if r.status_code != 200:
            raise HTTPException(502, f"voice provider error {r.status_code}")
        return {"signed_url": r.json()["signed_url"], "fit_id": fit_id}

    def import_error(e: ImportFailed) -> HTTPException:
        log.info("launch-monitor import failed: %s (%s)", e.code, e)
        return HTTPException(IMPORT_STATUS.get(e.code, 422), {"code": e.code, "message": str(e)})

    imports_per_hour = int(os.environ.get("PF_IMPORTS_PER_HOUR", "30"))

    @app.post("/v1/launch-monitor/photo", response_model=ImportResult)
    async def import_photo(body: PhotoImport, request: Request):
        key = os.environ.get("FEATHERLESS_API_KEY")
        if not key:
            raise HTTPException(503, {"code": "not_configured", "message": "photo reading is not configured"})
        per_hour(request, "launch-monitor import", imports_per_hour)
        try:
            return ImportResult(readings=[await read_photo(body.image, key,
                                                           os.environ.get("PF_VISION_MODEL", DEFAULT_VISION_MODEL))])
        except ImportFailed as e:
            raise import_error(e)
        except httpx.HTTPError as e:
            raise import_error(ImportFailed("provider", f"vision provider unreachable: {e}"))

    @app.post("/v1/launch-monitor/video", response_model=ImportResult)
    async def import_video(body: VideoImport, request: Request):
        key = os.environ.get("FEATHERLESS_API_KEY")
        if not key:
            raise HTTPException(503, {"code": "not_configured", "message": "video reading is not configured"})
        per_hour(request, "launch-monitor import", imports_per_hour)
        try:
            return ImportResult(readings=[await read_video(body.frames, key,
                                                           os.environ.get("PF_VISION_MODEL", DEFAULT_VISION_MODEL))])
        except ImportFailed as e:
            raise import_error(e)
        except httpx.HTTPError as e:
            raise import_error(ImportFailed("provider", f"vision provider unreachable: {e}"))

    @app.post("/v1/launch-monitor/report", response_model=ImportResult)
    async def import_report(body: ReportImport, request: Request):
        per_hour(request, "launch-monitor import", imports_per_hour)
        try:
            return ImportResult(readings=await read_report(body.url))
        except ImportFailed as e:
            raise import_error(e)
        except httpx.HTTPError as e:
            raise import_error(ImportFailed("provider", f"TrackMan unreachable: {e}"))

    # ---------------------------------------------------------------- agent tools
    @app.post("/v1/agent/summary", response_model=AgentReply, dependencies=[Depends(agent_auth)])
    def agent_summary(body: AgentFit, s: FitService = Depends(svc)):
        _, r = lookup(s, body.fit_id)
        close = [c.part for c in r.components if c.close_call]
        say = f"Your fit: {spec_line(r)}."
        if close:
            say += f" The close calls are {', '.join(close)}; I can walk you through each."
        if r.next_tests:
            t = r.next_tests[0]
            part, (a, b) = next(iter(t.improves.items()))
            say += f" The {t.test} would raise my confidence in your {part} from {round(a * 100)} to {round(b * 100)} percent."
        return AgentReply(say=say, data={"spec": r.spec.model_dump(), "whole_spec_confidence": r.whole_spec_confidence,
                                         "close_calls": close})

    @app.post("/v1/agent/explain", response_model=AgentReply, dependencies=[Depends(agent_auth)])
    def agent_explain(body: AgentExplain, s: FitService = Depends(svc)):
        _, r = lookup(s, body.fit_id)
        c = next(x for x in r.components if x.part == body.part)
        say = " ".join([c.summary, *c.reasons[:4], c.effect or ""]).strip()
        say += f" I'm {round(c.confidence * 100)} percent sure of this."
        if c.close_call and c.alternative:
            say += f" The alternative, {c.alternative}, is {round((c.alternative_probability or 0) * 100)} percent likely."
        return AgentReply(say=say, data=c.model_dump())

    @app.post("/v1/agent/what-if", response_model=AgentReply, dependencies=[Depends(agent_auth)])
    def agent_what_if(body: AgentWhatIf, s: FitService = Depends(svc)):
        lookup(s, body.fit_id)
        ov = Overrides(**body.model_dump(exclude={"fit_id"}))
        before, after = s.what_if(body.fit_id, ov)
        changes = diff_specs(before, after)
        say = ("Nothing in your spec would change." if not changes else
               "If that were true, the " + "; the ".join(changes) + ".")
        return AgentReply(say=say, data={"changes": changes, "after": after.spec.model_dump()})

    @app.post("/v1/agent/next-test", response_model=AgentReply, dependencies=[Depends(agent_auth)])
    def agent_next_test(body: AgentFit, s: FitService = Depends(svc)):
        _, r = lookup(s, body.fit_id)
        if not r.next_tests:
            return AgentReply(say="You've given me everything that would change this fit. No more tests needed.")
        t = r.next_tests[0]
        part, (a, b) = next(iter(t.improves.items()))
        say = (f"The most useful next step is the {t.test}. {t.how} It should take my confidence in your {part} from "
               f"{round(a * 100)} to about {round(b * 100)} percent.")
        return AgentReply(say=say, data={"next_tests": [x.model_dump() for x in r.next_tests]})

    @app.post("/v1/agent/compare-heads", response_model=AgentReply, dependencies=[Depends(agent_auth)])
    def agent_compare(body: AgentCompare, s: FitService = Depends(svc)):
        _, r = lookup(s, body.fit_id)
        a = r.spec.head
        b = body.other_head or r.runner_up_head
        if b not in PR.HEAD_ORDER:
            raise HTTPException(422, f"unknown head {b}")
        ha, hb = PR.head(a), PR.head(b)
        ca, cb = r.estimates[f"carry_{a}"].mean, r.estimates[f"carry_{b}"].mean
        ra, rb = ha["ratings"], hb["ratings"]
        traits = [f"{k.replace('_', ' ')} {ra[k]} versus {rb[k]}" for k in ["forgiveness", "distance", "workability",
                                                                           "feel", "offset"] if ra[k] != rb[k]]
        say = (f"{ha['name']} versus {hb['name']}: on Takomo's 5-point ratings, " + ", ".join(traits) +
               f". At your speed, expect about {ca:.0f} yards carry with {ha['name']} and {cb:.0f} with {hb['name']}"
               f" (7-iron lofts {ha['seven_iron_loft_deg']:.0f} and {hb['seven_iron_loft_deg']:.0f} degrees).")
        p = r.probabilities["head"]
        say += (f" Given what you've told me, {ha['name']} is the rules' pick {round(p.get(a, 0) * 100)} percent of the time"
                f" and {hb['name']} {round(p.get(b, 0) * 100)} percent.")
        return AgentReply(say=say, data={"a": a, "b": b, "carry": {a: ca, b: cb}})

    return app


def app_factory() -> FastAPI:
    logging.basicConfig(level=os.environ.get("PF_LOG_LEVEL", "INFO"))
    return create_app()
