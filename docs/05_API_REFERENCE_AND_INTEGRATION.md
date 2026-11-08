<div align="center">

<p align="center">
  <a href="../README.md"><img alt="Takomo Fit" src="assets/takomo_fit_header.png" height="34" align="absmiddle"></a> &nbsp;•&nbsp; <strong>The Fitter in Your Pocket</strong>
</p>

<p align="center">
  <a href="../README.md">Home</a> ·
  <a href="README.md">Docs</a> ·
  <a href="https://takomo-fitter.web.app/">Live App</a> ·
  <a href="https://github.com/0xMuluh/takomo-fit">GitHub</a>
</p>

</div>

---

# API reference & integration guide

**Contracts:** `pocket-fitter/engine/src/pocketfit/schemas.py`, `api.py`  
**Base URL / proxy:** `https://takomo-fitter.web.app/api/pf` $\to$ FastAPI Engine

All field definitions match Pydantic strict schemas.

---

## 1. Core endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status and loaded model artifact metadata |
| `GET` | `/v1/model` | Version identifier and training calibration metrics |
| `GET` | `/v1/catalog` | Full Takomo product catalog specifications (`lang` supported) |
| `POST` | `/v1/fits` | Initial fit generation (`FitRequest` $\to$ `FitResponse`) |
| `GET` | `/v1/fits/{fit_id}` | Retrieve fit session state (`lang`, `units` params) |
| `POST` | `/v1/fits/{fit_id}/evidence` | Progressively ingest multimodal `Evidence` and update fit |
| `POST` | `/v1/fits/{fit_id}/what-if` | Evaluate hypothetical parameter `Overrides` |
| `GET` | `/v1/voice/session` | Request signed ElevenLabs WebSocket credentials |
| `POST` | `/v1/handoff` | Generate short-lived desktop $\to$ mobile handoff session |
| `GET` | `/v1/handoff/{code}` | Mobile client handshake and initialization |
| `POST` | `/v1/handoff/{code}` | Mobile measurement ingestion and UI synchronization cues |
| `GET` | `/v1/handoff/{code}/events` | Long-poll / SSE event streaming for desktop client |
| `POST` | `/v1/launch-monitor/photo` | OCR parsing of launch monitor screen snapshots |
| `POST` | `/v1/launch-monitor/video` | Launch monitor video extraction |
| `POST` | `/v1/launch-monitor/report` | Ingest external TrackMan / FlightScope shared report URL |

*Agent endpoints (protected by `X-Agent-Secret`):* `POST /v1/agent/summary`, `explain`, `what-if`, `next-test`, `compare-heads`.

---

## 2. Fit initiation — `POST /v1/fits`

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

*Requirements:* At least one of `speed_mph` or `carry_yd` must be supplied.

---

## 3. Multimodal evidence ingestion — `POST /v1/fits/{id}/evidence`

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

---

## 4. Conversational voice authentication — `GET /v1/voice/session`

* Returns ephemeral HMAC signature: `{"signed_url": "...", "fit_id": "..."}`.
* ElevenLabs API keys remain strictly quarantined in engine environment variables.
* Returns `503 Service Unavailable` if voice keys are unconfigured; `429 Too Many Requests` on rate limiting.

---

## 5. Headless Shopify cart integration (storefront roadmap)

Planned production handoff serializes the finalized `FitResponse.spec` into custom line-item properties for headless Shopify Cart API ingestion:
* `_fit_id`: Cryptographic fit session identifier
* `model`: e.g. "101 MKII"
* `shaft`: e.g. "KBS Tour Lite Stiff"
* `length`: e.g. "+0.5 in"
* `lie`: e.g. "2° Upright"
* `grip`: e.g. "Lamkin Crossline Midsize"
* `order_type`: "Stock" or "Custom"

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built with ❤️ for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
