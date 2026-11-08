# API reference

**Contracts:** `pocket-fitter/engine/src/pocketfit/schemas.py`, `api.py`  
**Typical proxy:** `https://takomo-fitter.web.app/api/pf` → FastAPI

Field names below match Pydantic models. Do not invent flat request shapes.

---

## 1. Public endpoints

| Method | Path | Role |
|---|---|---|
| GET | `/health` | Liveness / model loaded |
| GET | `/v1/model` | Model version metadata |
| GET | `/v1/catalog` | Product catalog (`lang`) |
| POST | `/v1/fits` | Create fit (`FitRequest` → `FitResponse`) |
| GET | `/v1/fits/{fit_id}` | Read fit; optional `lang` / `units` |
| POST | `/v1/fits/{fit_id}/evidence` | Merge `Evidence`, recompute |
| POST | `/v1/fits/{fit_id}/what-if` | `Overrides` → what-if response |
| GET | `/v1/voice/session` | ElevenLabs signed URL (`fit_id` optional) |
| POST | `/v1/handoff` | Create phone handoff code |
| GET | `/v1/handoff/{code}` | Phone opens session |
| POST | `/v1/handoff/{code}` | Cue and/or evidence from phone |
| GET | `/v1/handoff/{code}/events` | Desktop poll (`after`) |
| POST | `/v1/launch-monitor/photo` | Screen photo → readings |
| POST | `/v1/launch-monitor/video` | Frame set → readings |
| POST | `/v1/launch-monitor/report` | TrackMan-style shared URL |

Agent tools (secret header): `POST /v1/agent/summary|explain|what-if|next-test|compare-heads`.

---

## 2. `POST /v1/fits` — `FitRequest`

```json
{
  "questionnaire": {
    "age": 42,
    "sex": "male",
    "handedness": "right",
    "rounds_per_year": "10-30",
    "score_bucket": 3,
    "speed_mph": 82.5,
    "carry_yd": null,
    "own_7i_loft_deg": 31.0,
    "characteristics": ["forgiveness", "distance"],
    "flight": "mid",
    "tempo": "moderate",
    "height_cm": 182.0,
    "wrist_to_floor_cm": 88.0,
    "glove": "M"
  },
  "evidence": {},
  "locale": { "lang": "en", "units": "imperial" }
}
```

Require `speed_mph` or `carry_yd`. Nested `evidence` / `overrides` / `locale` as in schemas.

### `FitResponse` (shape)

- `fit_id`, `model_version`
- `spec`: head, `Shaft`, `length_in`, `lie_deg`, grip, handedness, purchase
- `runner_up_head`, `whole_spec_confidence`
- `components[]`: part, value, confidence, alternative*, close_call, summary, reasons, effect*, evidence[]
- `stock_advice`, `estimates`, `probabilities`, `next_tests`, `warnings`

---

## 3. `POST /v1/fits/{id}/evidence` — `Evidence`

```json
{
  "body_photo": {
    "method": "ratio",
    "wrist_to_floor_ratio": 0.48,
    "quality": "good"
  },
  "hand_photo": {
    "method": "card",
    "hand_length_cm": 19.2,
    "finger_length_cm": 8.4
  },
  "swing_video": {
    "fps": 60,
    "backswing_s": 0.85,
    "downswing_s": 0.28
  },
  "ball_line_tilts_deg": [1.2, 0.8, 1.5],
  "impact_spray_offsets_mm": [-2.0, 1.0, 0.5],
  "launch_monitor": {
    "kind": "trackman",
    "source": "csv",
    "own_7i_summary": {
      "shots": 8,
      "mean": { "club_speed_mph": 83.1, "carry_yd": 158.0 },
      "sd": {}
    }
  }
}
```

`ball_line_tilts_deg` and `impact_spray_offsets_mm` require min length 3 when present. Launch monitor needs ≥3 `own_7i` shots or `own_7i_summary` with speed or carry.

---

## 4. Voice — `GET /v1/voice/session`

Not POST. Response: `{ "signed_url": "…", "fit_id": "…" }`. 503 if ElevenLabs env unset; 429 if over rate limit.

---

## 5. Client tools (browser ↔ ElevenLabs)

Configured on the agent (names may evolve with `setup_voice_agent.py`). Typical pattern: tools such as starting a measurement kind (`body` | `hand` | `swing` | `ball_line`) execute in the browser; explanations can call engine agent routes or local fit state.

---

## 6. Shopify cart

**Not implemented** in this repo (CDN URLs for product images only). Planned storefront work: map `FitResponse.spec` to Shopify line-item properties (`_fit_id`, model, shaft, length, lie, grip, order type). Do not describe as shipped.
