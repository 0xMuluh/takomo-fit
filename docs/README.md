<div align="center">

<a href="../README.md">
  <img alt="Takomo Fit" src="assets/takomo_fit_header.png" height="52">
</a>

<p align="center">
  <strong>The AI Pro-Fitter in Your Pocket · Documentation Index</strong><br>
  <em>Since AI Hackathon 2026 · Turku, Finland · In partnership with Takomo Golf</em>
</p>

<p align="center">
  <a href="../README.md">« Main Repo</a> ·
  <a href="https://takomo-fitter.web.app/">Live App</a> ·
  <a href="https://github.com/0xMuluh/takomo-fit">GitHub</a> ·
  <a href="01_ONE_PAGE_EXECUTIVE_SUMMARY.md">Executive Summary</a>
</p>

</div>

---

### Challenge Benchmark Overview

* **Challenge:** *The Fitter in Your Pocket* · Since AI Hackathon 2026 (Turku, 6–8 Nov)
* **Partner:** Takomo Golf (Turku, Finland)
* **Dev Split Benchmark** (`pocket-fitter/engine/artifacts/model.json`, $n=3000$):
  * **Overall Agreement Score:** `87.91 / 100`
  * **Exact Full-Spec Match:** `39.0%` (~3x questionnaire baseline)
  * **Unbuildable Recommendations:** `0` (100% catalog feasible)
  * **Component Lie Exact:** `58.3%`
  * **Calibration ECE:** `< 0.015` across all components
* **Lab Baselines** (from challenge `START_HERE.md`):
  * Baseline 1 (Questionnaire only): `77.1` score / `13.7%` exact
  * Baseline 2 (Evidence substitution): `83.6` score / `25.3%` exact

> [!NOTE]
> The synthetic benchmark measures parameter recovery under the lab simulator. It serves as engineering verification, not a substitute for pro-fitter clinical trials on human golfers.

---

## Technical Deliverables & Documentation Index

| Document | Contents & Focus | Target Audience |
|---|---|---|
| [**Hackathon Submission Portal Entry**](00_HACKATHON_SUBMISSION.md) | Official portal fields: project tagline, about narrative, tech stack, verified URLs | Organizers |
| [**Executive Summary (1-Pager)**](01_ONE_PAGE_EXECUTIVE_SUMMARY.md) | Challenge brief 1-pager: core thesis, PoC evidence, honest validation | Judges & Evaluators |
| [**Architecture & System Specification**](02_ARCHITECTURE_AND_SYSTEM_SPEC.md) | Client/engine topology, handoff protocol, zero-egress edge vision pipeline | Engineering |
| [**Fitting Engine Mathematics & Calibration**](03_FITTING_ENGINE_MATHEMATICS_AND_CALIBRATION.md) | Linear-Gaussian fusion, Monte Carlo sampling ($N=800$), ECE calibration proofs | Data / Engine |
| [**Computer Vision & Biomechanics Pipeline**](04_COMPUTER_VISION_AND_BIOMECHANICS.md) | ISO card scaling, MediaPipe pose/hands, tempo extraction, 4-point ball-line | CV & Biomechanics |
| [**API Reference & Integration Guide**](05_API_REFERENCE_AND_INTEGRATION.md) | OpenAPI contracts matching `schemas.py`, Shopify headless integration | Integration |
| [**Production Pilot & Business Case**](06_PRODUCTION_PILOT_AND_BUSINESS_CASE.md) | D2C economic models, return reduction economics, pilot rollout gates | Product & Executive |
| [**Finals Pitch Deck Script**](07_FINALS_PITCH_DECK.md) | 10-slide championship finals script and presenter notes | Presenters |
| [**Demo Video & Voiceover Script**](08_DEMO_VOICE_OVER.md) | 3-minute video pitch: trust gap, build decisions, demo journey, honest validation | Presenters & Video |
| [**Championship Pitch Deck (16:9 PPTX)**](presentation/Takomo_Pocket_Fitter_Finals.pptx) | Generated deck (rebuild via `presentation/generate_deck.py`) | Presenters |
| [**Benchmark Test Predictions (5,000 Golfers)**](test_predictions/takomo_test_predictions.csv) | Offline model predictions for lab `data/test` benchmark golfers | Evaluation |

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
