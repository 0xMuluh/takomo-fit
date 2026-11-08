<div align="center">

<p align="center">
  <a href="../README.md"><img alt="Takomo Fit" src="assets/takomo_fit_header.png" height="34" align="absmiddle"></a> &nbsp;•&nbsp; <strong>The Fitter in Your Pocket</strong>
</p>

<p align="center">
  <a href="../README.md">Home</a> ·
  <a href="README.md">Docs</a> ·
  <a href="https://takomo-fitter.web.app/">Live App</a> ·
  <a href="https://github.com/0xMuluh/takomo-fit">GitHub</a> ·
  <a href="01_ONE_PAGE_EXECUTIVE_SUMMARY.md">Executive summary</a>
</p>

</div>

---

### Challenge benchmark overview

* **Challenge:** *The Fitter in Your Pocket* · Since AI Hackathon 2026 (Turku, 6–8 Nov)
* **Partner:** Takomo Golf (Turku, Finland)
* **Dev split benchmark** (`pocket-fitter/engine/artifacts/model.json`, $n=3000$):
  * **Overall agreement score:** `87.91 / 100`
  * **Exact full-spec match:** `39.0%` (~3x questionnaire baseline)
  * **Unbuildable recommendations:** `0` (100% catalog feasible)
  * **Component lie exact:** `58.3%`
  * **Calibration ECE:** `< 0.015` across all components
* **Lab baselines** (from challenge `START_HERE.md`):
  * Baseline 1 (questionnaire only): `77.1` score / `13.7%` exact
  * Baseline 2 (evidence substitution): `83.6` score / `25.3%` exact

> [!NOTE]
> The synthetic benchmark measures parameter recovery under the lab simulator. It serves as engineering verification, not a substitute for pro-fitter clinical trials on human golfers.

---

## Technical deliverables & documentation index

| Document | Contents & focus | Target audience |
|---|---|---|
| [**Hackathon submission portal entry**](00_HACKATHON_SUBMISSION.md) | Official portal fields: project tagline, about narrative, tech stack, verified URLs | Organizers |
| [**Executive summary (1-pager)**](01_ONE_PAGE_EXECUTIVE_SUMMARY.md) | Challenge brief 1-pager: core thesis, PoC evidence, honest validation | Judges & evaluators |
| [**Architecture & system specification**](02_ARCHITECTURE_AND_SYSTEM_SPEC.md) | Client/engine topology, handoff protocol, zero-egress edge vision pipeline | Engineering |
| [**Fitting engine mathematics & calibration**](03_FITTING_ENGINE_MATHEMATICS_AND_CALIBRATION.md) | Linear-Gaussian fusion, Monte Carlo sampling ($N=800$), ECE calibration proofs | Data & engine |
| [**Computer vision & biomechanics pipeline**](04_COMPUTER_VISION_AND_BIOMECHANICS.md) | ISO card scaling, MediaPipe pose/hands, tempo extraction, 4-point ball-line | CV & biomechanics |
| [**API reference & integration guide**](05_API_REFERENCE_AND_INTEGRATION.md) | OpenAPI contracts matching `schemas.py`, Shopify headless integration | Integration |
| [**Production pilot & business case**](06_PRODUCTION_PILOT_AND_BUSINESS_CASE.md) | D2C economic models, return reduction economics, pilot rollout gates | Product & executive |
| [**Finals pitch deck script**](07_FINALS_PITCH_DECK.md) | 10-slide championship finals script and presenter notes | Presenters |
| [**Demo video & voiceover script**](08_DEMO_VOICE_OVER.md) | 3-minute video pitch: trust gap, build decisions, demo journey, honest validation | Presenters & video |
| [**Championship pitch deck (PDF)**](presentation/Takomo_Pocket_Fitter_Finals.pdf) | 10-slide championship finals presentation ([PPTX source](presentation/Takomo_Pocket_Fitter_Finals.pptx)) | Presenters |
| [**Benchmark test predictions (5,000 golfers)**](test_predictions/takomo_test_predictions.csv) | Offline model predictions for lab `data/test` benchmark golfers | Evaluation |

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built with ❤️ for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
