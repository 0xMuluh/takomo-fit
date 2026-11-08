# Architecture

**App:** Takomo Pocket Fitter · Next.js client + FastAPI engine (`pocketfit`)

---

## 1. Topology

```mermaid
flowchart TD
    subgraph Client["Browser"]
        UI["Next.js / React"]
        WASM["MediaPipe WASM Pose & Hands"]
        Audio["Mic → ElevenLabs WS"]
    end

    subgraph Edge["Hosting"]
        Proxy["Next proxy /api/pf/*"]
    end

    subgraph Engine["FastAPI"]
        API["REST"]
        Fusion["Linear-Gaussian fusion + HGB"]
        MC["decide.py N=800"]
        Store["Fit store"]
        Handoff["In-memory handoff codes"]
    end

    subgraph Voice["ElevenLabs"]
        Agent["Conversational agent"]
    end

    Audio <--> Agent
    Agent -- "client tools" --> UI
    UI --> WASM
    UI --> Proxy --> API
    API --> Fusion --> MC --> Store
    API <--> Handoff
    UI <--> Handoff
```

Routes of interest: `/fit` (voice), `/fit/guided`, `/m/[code]` (phone handoff). Screenshots not checked into `docs/assets/`.

---

## 2. Client vision

Pose, hands, card edge fit, swing timing, and ball-line geometry run in the browser. The API receives structured evidence (`BodyPhoto`, `HandPhoto`, `SwingVideo`, `ball_line_tilts_deg`, …) — not video blobs for those paths.

Launch-monitor **screen photo / video import** is a separate server path (`/v1/launch-monitor/*`) that reads displayed numbers via a vision API when configured.

---

## 3. Voice

1. Browser calls **`GET /v1/voice/session`** (optional `fit_id`).
2. Engine returns `{ signed_url, fit_id }` from ElevenLabs; API key stays server-side.
3. Rate limit: `PF_VOICE_SESSIONS_PER_HOUR` (default 20 / IP).
4. Agent uses client tools in the browser; server tools under `/v1/agent/*` need `X-Agent-Secret`.

---

## 4. Desktop → phone handoff

```mermaid
sequenceDiagram
    actor Golfer
    participant Desktop
    participant Engine as /v1/handoff
    participant Phone

    Golfer->>Desktop: Measure with phone
    Desktop->>Engine: POST /v1/handoff {kind, lang, units}
    Engine-->>Desktop: {code, expires_in_s}
    Desktop->>Golfer: QR …/m/{code}
    Desktop->>Engine: GET /v1/handoff/{code}/events?after=0

    Phone->>Engine: GET /v1/handoff/{code}
    Engine-->>Desktop: opened=true
    Phone->>Engine: POST {cue} / {evidence}
    Engine-->>Desktop: cues / evidence
    Desktop->>Engine: POST /v1/fits/{id}/evidence
```

Handoffs are in-memory with TTL; expired code → 404. Evidence payload matches `Evidence` in `schemas.py`.

---

## 5. Fitting flow

1. **Questionnaire** → `POST /v1/fits` (`FitRequest`).
2. **Add evidence** → `POST /v1/fits/{id}/evidence`.
3. **Fusion + decide** → `FitResponse` (spec, components, stock_advice, estimates, probabilities, next_tests).
4. **What-if** → `POST /v1/fits/{id}/what-if` (`Overrides`).

Shopify cart injection is **not implemented**; treat as a planned storefront step.

---

## 6. Ops notes (from `api.py`)

| Control | Behavior |
|---|---|
| Voice URL | Ephemeral signed URL; key not in client |
| Voice / handoff / import rate limits | Per-IP hourly counters |
| Request validation | Pydantic bounds in `schemas.py` |
| Fit persistence | Service store (memory or file-backed depending on deploy) |
