<div align="center">

<a href="../README.md">
  <img alt="Takomo Fit" src="assets/takomo_fit_header.png" height="42">
</a>

<p align="center">
  <strong>The AI Pro-Fitter in Your Pocket</strong><br>
  <em>Multimodal Voice Consultation · Zero-Print Smartphone Vision · Calibrated Bayesian Fitting</em>
</p>

<p align="center">
  <a href="../README.md">« Home</a> ·
  <a href="README.md">Docs Index</a> ·
  <a href="https://takomo-fitter.web.app/">Live App</a> ·
  <a href="https://github.com/0xMuluh/takomo-fit">GitHub</a>
</p>

</div>

---

# Hackathon Submission Portal Entry

**Challenge:** The Fitter in Your Pocket · Takomo Golf  
**Live app:** [https://takomo-fitter.web.app/](https://takomo-fitter.web.app/)  
**Portal:** Since AI Platform (`sincesi.ai`)

---

## 1. Project information

### Project Name *
```text
Takomo Pocket Fitter
```

### Tagline * (max 140 characters)
```text
Phone vision + voice fit for Takomo irons: measured evidence, N=800 Monte Carlo specs, calibrated confidence.
```
*(~105 / 140)*

---

### About the Project * (max 5,000 characters)
```text
PROBLEM
Takomo sells D2C forged clubs (€70M+, 109 countries). Over 25% of iron orders go through the online fitter; 600k+ fittings in six months. The live tool is a questionnaire: height, wrist-to-floor, glove, speed or 7-iron carry, score, flight. Self-report is noisy — lab SIMULATOR: median carry over-report 15 yd; brand loft gaps can move carry ~12 m. The tool returns a spec without measured evidence or a clear why. Custom builds have no 30-day return.

SOLUTION
Pocket Fitter runs on the phone/browser:

1. Voice (ElevenLabs): optional interview in en/fi/sv/de; browser client tools open measurements; engine agent endpoints explain and what-if.
2. On-device vision: MediaPipe Pose/Hands in WASM. Hand scale uses any ISO/IEC 7810 ID-1 card (no print sheet). Body can use stated height + wrist-to-floor ratio, or a reference object. Only scalars leave the device.
3. Desktop→phone handoff: POST /v1/handoff → QR /m/[code]; cues and evidence poll via /v1/handoff/{code}/events.
4. Evidence: ball-line tilts (manual 4-point tap on face photo), impact spray, swing video timing, launch-monitor CSV / screen photo / TrackMan report import.
5. Engine: linear-Gaussian fusion over evidence masks + HistGradientBoosting for discrete fields; decide.py draws N_DRAWS=800 from the posterior through Takomo product rules. Confidence is empirical draw frequency. UI labels ≥95% (and not a close call) as Confirmed. Stock vs custom follows return-policy rules when stock is viable.

STACK
Next.js / React / TypeScript / MediaPipe WASM · FastAPI / Python 3.12 / scikit-learn / NumPy / Pydantic · Docker.

LAB NUMBERS (dev, model.json)
Score 87.91 / 100 · full-spec exact 39.0% · unbuildable 0 · n=3000.
Component exact includes lie 58.3%, head 94.8%, flex 90.8%, length 92.7%, grip 90.5%.
Baselines (START_HERE): B1 questionnaire 77.1 / 13.7%; B2 evidence substitution 83.6 / 25.3%.
This score is recovery under the synthetic lab simulator, not agreement with a pro fitter on real golfers.

NEXT
Shopify cart line-item handoff (not shipped). Full-bag (driver/wedge) later. Optional Bluetooth radar later.
```

---

## 2. Built With *
```text
Next.js, FastAPI, MediaPipe, ElevenLabs, Scikit-learn, TypeScript, Python, Docker
```

---

## 3. Links

- **Repository:** [https://github.com/0xMuluh/takomo-fit](https://github.com/0xMuluh/takomo-fit)
- **Demo:** [https://takomo-fitter.web.app/](https://takomo-fitter.web.app/)
- **Demo video:** not published (no YouTube URL yet)

---

## 4. Upload checklist

| Field | Path | Notes |
|---|---|---|
| Source | repo / zip excluding `node_modules`, `.venv` | Clean GitHub repository |
| Demo video | — | Walkthrough recording (optional) |
| Pitch deck | [Finals Pitch Deck (PPTX)](presentation/Takomo_Pocket_Fitter_Finals.pptx) | Regenerate from `generate_deck.py` if needed |
| Supporting doc | [Executive Summary (1-Pager)](01_ONE_PAGE_EXECUTIVE_SUMMARY.md) | Official 1-page writeup |
| Test predictions | [Benchmark Test Predictions (CSV)](test_predictions/takomo_test_predictions.csv) | Lab `data/test` (5,000 unlabelled) |

---

## 5. Partner tech

- **ElevenLabs:** `GET /v1/voice/session` returns a signed URL; browser opens the conversation; client tools drive UI measurements.
- **Firebase Hosting:** `https://takomo-fitter.web.app/`.

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
