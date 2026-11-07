# Takomo Pocket Fitter

A live Takomo 7-iron fitting from a phone. A voice fitter (ElevenLabs) interviews the golfer, opens camera
measurements as it goes (posture, live swing tempo, hand next to a bank card; ball-line test and launch monitor
CSV when available), and builds head, shaft, length, lie and grip with a calibrated confidence for each, the
reasons, close calls, stock vs custom advice, and the next test that would raise confidence most. Every number
the fitter says comes from the engine through its tools. Golfers who can't talk can type to the same fitter;
`/fit/guided` is a tap-through version that needs no voice provider.

When the engine says a part is at least 95% likely, it was right 98.8-99.7% of the time on dev golfers (head,
flex, length, lie, grip); the UI and the fitter call those parts "Confirmed" and nothing else.

```
engine/   Python fitting engine and API (FastAPI). Fusion of evidence, Monte Carlo through Takomo's rules.
web/      Next.js app. All photo and video analysis runs on the device (MediaPipe); only measurements are sent.
lab/      Takomo fitting lab data, simulator and baseline rules.
```

## Run locally

Engine (port 8077):

```bash
cd engine
python -m venv .venv && .venv/bin/pip install -e .
.venv/bin/python scripts/train.py            # writes artifacts/model.joblib (skip if it exists)
.venv/bin/python -m uvicorn pocketfit.api:app_factory --factory --port 8077
```

Web (port 3000):

```bash
cd web
npm install
npm run build && npm start                   # or: npm run dev
```

Open http://localhost:3000. The web app proxies `/api/pf/*` to the engine (`PF_API_URL`, default
`http://localhost:8077`). Camera capture needs HTTPS on a phone; use a tunnel (for example `cloudflared`)
or deploy.

## Live fitter

```bash
export ELEVENLABS_API_KEY=...                # server only, never sent to the browser
cd engine && .venv/bin/python scripts/setup_voice_agent.py   # prints ELEVENLABS_AGENT_ID
export ELEVENLABS_AGENT_ID=...
```

Restart the engine with both set. The browser asks the engine for a signed session URL (rate-limited per
visitor), so the key never leaves the server. The agent's tools are client tools: they run in the golfer's
browser against this engine (`web/src/lib/fitter/`), so no public webhook is needed. Without these variables
`/fit` offers the guided fitting instead.

`web/scripts/fitter-scenario.ts` plays the agent's side of a session through the real tools against a running
engine, with no ElevenLabs key: `cd web && PF_API_URL=http://localhost:8077 npx jiti scripts/fitter-scenario.ts`.

## Configuration

Each part has a commented `.env.example`: `engine/` (pass `--env-file .env` to uvicorn), `web/` (copy to
`.env.local`) and the top level (copy to `.env` for Docker Compose).

| Variable | Where | Purpose |
| --- | --- | --- |
| `PF_MODEL_PATH` | engine | Trained model (default `artifacts/model.joblib`) |
| `PF_STORE_PATH` | engine | SQLite file that keeps fits across restarts (default: in memory) |
| `PF_CORS_ORIGINS` | engine | Comma-separated allowed origins (default `http://localhost:3000`) |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID` | engine | Enable the live fitter (`/v1/voice/session`) |
| `PF_VOICE_SESSIONS_PER_HOUR` | engine | Voice sessions per visitor per hour (default 20) |
| `PF_AGENT_SECRET` | engine | Shared secret for the optional `/v1/agent/*` webhook tools |
| `PF_API_URL` | web | Engine base URL for the proxy; read at build time |

## Checks

```bash
cd engine && .venv/bin/python -m pytest -q
cd web && npx tsc --noEmit && npx eslint src && npm run build
cd web && PF_API_URL=http://localhost:8077 npx jiti scripts/fitter-scenario.ts   # engine running
```

## Deploy

`engine/Dockerfile` builds the API with the trained model baked in. The ML libraries are pinned to the versions the
model was trained with; retrain and re-pin together. Set `PF_STORE_PATH=/data/fits.db` with a volume on `/data` so
fits and result links survive redeploys. Run one instance: the store is one SQLite file (move to Redis or Postgres
behind the same `put`/`get` interface to scale out). `web/Dockerfile` builds the Next.js standalone server on
Node 24; pass the engine URL as the `PF_API_URL` build argument.

One server: `cp .env.example .env`, fill it in, `docker compose up -d --build`. That runs engine (with a volume for
fits), web and Caddy, which gets the HTTPS certificate camera and microphone need.

Managed: deploy `web` to Vercel with `PF_API_URL` set to the engine's URL, and `engine/Dockerfile` to Fly.io or
Render (one instance, port 8080, a volume on `/data` writable by uid 10001, `PF_STORE_PATH=/data/fits.db`) with
the ElevenLabs variables and `PF_CORS_ORIGINS` set to the web origin.
