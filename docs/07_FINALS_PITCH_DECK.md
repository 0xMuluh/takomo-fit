# Finals pitch outline (10 slides)

**Live:** [https://takomo-fitter.web.app/](https://takomo-fitter.web.app/)  
**Repo:** [https://github.com/0xMuluh/takomo-fit](https://github.com/0xMuluh/takomo-fit)  
Rebuild PPTX from `docs/presentation/generate_deck.py` after note fixes. `docs/assets/` is empty here — drop missing image slots.

---

## Slide 1 — Title

- **Takomo Pocket Fitter**
- Online iron fitting with phone evidence and calibrated confidence
- Notes: Takomo D2C €70M+, 109 countries; 600k+ fittings / 6 months; >25% iron orders via fitter. Goal: capture home data and explain the result.

---

## Slide 2 — Problem

- Questionnaire self-report: lab median carry over-report **15 yd**; loft/model ~**12 m**
- Spec without measured evidence or why
- Custom = no 30-day return → hesitation
- Notes: Fitters listen, watch, measure, explain, flag close calls. Forms skip that.

---

## Slide 3 — Solution

1. Optional ElevenLabs voice + client tools  
2. On-device MediaPipe + ID-1 card hand scale; desktop→phone `/m/[code]`  
3. Evidence fusion + `N_DRAWS=800` through Takomo rules  
- Notes: Scalars to API for pose/hand/swing; ball-line is four taps on a face photo.

---

## Slide 4 — Vision

- Card 85.60×53.98 mm; grip via `GLOVE_EDGES_CM`, not fake 17.5/19.5 bands  
- Pose for height / WTF ratio; tempo from wrist timing  
- Handoff: QR, cues, evidence poll  
- Notes: No printer sheet required for hand measure.

---

## Slide 5 — Dynamic evidence

- Ball-line: manual 4-point `tiltDeg` (not Hough)  
- Launch-monitor CSV / screen photo / report import when configured  
- Lie remains the hard part: **58.3%** component exact on dev  
- Notes: B1 lie ~41% (START_HERE). Dynamic evidence helps; do not claim 88.4%.

---

## Slide 6 — Engine

- Linear-Gaussian fusion over evidence masks; HGB for discrete fields  
- 800 posterior draws → modal spec + empirical confidence  
- ECE from `model.json` (listed components around 0.006–0.015)  
- Confirmed in UI = ≥95% and not a close call  
- Notes: Spec numbers come from rules + fusion, not LLM invention.

---

## Slide 7 — Benchmark (dev n=3000)

| Metric | B1 | B2 | Pocket Fitter |
|---|---|---|---|
| Spec agreement score | 77.1 | 83.6 | **87.91** |
| Full-spec exact % | 13.7 | 25.3 | **39.0** |
| Unbuildable | — | — | **0** |
| Lie exact % | ~41 (START_HERE) | — | **58.3** |
| Flex exact % | — | — | **90.8** |

Notes: Score = recovery under synthetic simulator assumptions, not pro-fitter agreement on real golfers. Do not show invented B2 lie/flex cells.

---

## Slide 8 — Explanations & stock

- Dispersion from `yards_per_lie_degree` (e.g. ~3.1 yd for 160 yd / 29° / 2° — not “4.2 yd”)  
- Close calls + runner-ups  
- `stock_advice` when stock preserves returns  
- Notes: One factual mention of stock vs custom is enough.

---

## Slide 9 — Pilot

- Live at takomo-fitter.web.app  
- Brief facts only for market size  
- Conversion/AOV/return € models = **illustrative assumptions if shown at all**  
- Next: storefront embed, then Shopify line items (not shipped)  
- Notes: Avoid fake €3.8–7.4M / NPS / P95 claims as facts.

---

## Slide 10 — Demo

- Open live app; show voice or guided path, one measurement, result confidence  
- Links: app + GitHub  
- Q&A
