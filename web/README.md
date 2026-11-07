# Pocket Fitter web app

See [../README.md](../README.md) for how to run the full system.

- `src/app` — landing page, fitting wizard (`/fit`) and results (`/fit/[id]`).
- `src/components/capture` — on-device measurement screens (body, hand + card, swing video, ball-line, launch monitor CSV).
- `src/components/results` — spec, per-part reasons and confidence, next-best tests, what-if, voice fitter.
- `src/lib/vision` — MediaPipe-based measurement (models and WASM served from `public/mediapipe`, fetched by `npm run assets`).
- `src/lib/api-types.ts` — generated from the engine's OpenAPI schema with `npm run gen:api` (engine must be running).
