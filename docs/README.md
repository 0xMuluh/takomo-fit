# Takomo Pocket Fitter — docs

**Challenge:** The Fitter in Your Pocket · Since AI Hackathon 2026 (Turku, 6–8 Nov)  
**Partner:** Takomo Golf  
**Live app:** [https://takomo-fitter.web.app/](https://takomo-fitter.web.app/)  
**Repo:** [https://github.com/0xMuluh/takomo-fit](https://github.com/0xMuluh/takomo-fit)

**Dev split** (`pocket-fitter/engine/artifacts/model.json`, n=3000): score **87.91 / 100**, full-spec exact **39.0%**, unbuildable **0**. Component lie exact **58.3%**.

Lab baselines (questionnaire / evidence substitution): **77.1** / **13.7%** and **83.6** / **25.3%** (`TAKOMO_FITTING_LAB` `START_HERE.md`).

The synthetic score measures recovery under the lab simulator. It is not agreement with a pro fitter on real golfers.

---

## Documents

| File | Contents | Audience |
|---|---|---|
| [00_HACKATHON_SUBMISSION.md](00_HACKATHON_SUBMISSION.md) | Portal fields: name, tagline, about, stack, links | Organizers |
| [01_ONE_PAGE_EXECUTIVE_SUMMARY.md](01_ONE_PAGE_EXECUTIVE_SUMMARY.md) | Brief one-pager: idea, PoC, validation, next steps | Judges |
| [02_ARCHITECTURE_AND_SYSTEM_SPEC.md](02_ARCHITECTURE_AND_SYSTEM_SPEC.md) | Client/engine topology, handoff, pipeline | Engineering |
| [03_FITTING_ENGINE_MATHEMATICS_AND_CALIBRATION.md](03_FITTING_ENGINE_MATHEMATICS_AND_CALIBRATION.md) | Fusion, Monte Carlo (N=800), ECE from `model.json` | Data / engine |
| [04_COMPUTER_VISION_AND_BIOMECHANICS.md](04_COMPUTER_VISION_AND_BIOMECHANICS.md) | Card scale, pose/hands, tempo, 4-point ball-line | CV |
| [05_API_REFERENCE_AND_INTEGRATION.md](05_API_REFERENCE_AND_INTEGRATION.md) | FastAPI contracts matching `schemas.py` / `api.py` | Integration |
| [06_PRODUCTION_PILOT_AND_BUSINESS_CASE.md](06_PRODUCTION_PILOT_AND_BUSINESS_CASE.md) | Brief facts + illustrative pilot plan (assumptions labeled) | Product / ops |
| [07_FINALS_PITCH_DECK.md](07_FINALS_PITCH_DECK.md) | 10-slide outline and speaker notes | Presenters |
| [08_DEMO_VOICE_OVER.md](08_DEMO_VOICE_OVER.md) | Three-minute video pitch: trust gap, build decisions, demo journey and honest validation | Presenters / video |
| [presentation/Takomo_Pocket_Fitter_Finals.pptx](presentation/Takomo_Pocket_Fitter_Finals.pptx) | Generated deck (rebuild via `presentation/generate_deck.py`) | Presenters |
| [test_predictions/takomo_test_predictions.csv](test_predictions/takomo_test_predictions.csv) | Predictions for lab `data/test` (5,000 golfers) | Evaluation |

`docs/assets/` is empty in this workspace; screenshots and lab figures are not embedded here. Demo video URL is not available yet.
