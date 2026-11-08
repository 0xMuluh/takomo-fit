# Takomo Pocket Fitter — one-page summary

**Challenge:** The Fitter in Your Pocket · Since AI Hackathon 2026  
**Live:** [https://takomo-fitter.web.app/](https://takomo-fitter.web.app/) · **Repo:** [https://github.com/0xMuluh/takomo-fit](https://github.com/0xMuluh/takomo-fit)  
**Dev score:** 87.91 / 100 · full-spec exact 39.0% · unbuildable 0 · n=3000 (`model.json`)

---

### 1. Idea

Takomo D2C: €70M+, 109 countries; 600k+ fittings / 6 months; >25% of iron orders via the online fitter. Today’s tool is a questionnaire. Lab SIMULATOR: median self-report carry over-report **15 yd**; loft/model gaps ~**12 m** carry. Golfers get a spec without measured evidence.

Pocket Fitter adds phone measurements and optional voice, fuses evidence in the Python engine, and returns a buildable Takomo iron spec with per-component confidence, reasons, and stock/custom advice.

---

### 2. What the PoC shows

| Claim | Evidence |
|---|---|
| Better lab recovery than questionnaire | Dev 87.91 vs B1 77.1 / B2 83.6; exact 39.0% vs 13.7% / 25.3% |
| Buildable catalog output | 0 unbuildable on 3000 |
| Lie still hard | Component lie exact **58.3%** (B1 lie match ~41% per START_HERE) |
| Card-scale hand measure | ISO/IEC 7810 ID-1 in-browser; no print sheet |
| Desktop→phone | `/v1/handoff` + `/m/[code]` |
| Privacy for pose/hand/swing frames | MediaPipe WASM on device; scalars to API |

Synthetic score = recovery under lab simulator assumptions. Not proof of match to a pro fitter on real golfers.

---

### 3. Accuracy validation

- Train/eval on Fitting Lab synthetic golfers; metrics in `pocket-fitter/engine/artifacts/model.json`.
- Decision sampling: `N_DRAWS = 800` in `decide.py`.
- ECE (dev calibration): head 0.014, flex 0.0064, length 0.0085, lie 0.0098, grip 0.0145, whole spec 0.0094.
- UI “Confirmed” = component confidence ≥ 0.95 and not a close call (`web/src/lib/format.ts`).

---

### 4. Trust mechanics (product behavior)

- Explanations from `explain.py` (evidence lists, dispersion via `yards_per_lie_degree`).
- Close calls when probability mass is split; runner-up shown.
- Stock advice when custom does not justify losing the 30-day return window.

---

### 5. Next

1. Shopify cart line items from a resolved fit (planned; not in this codebase).
2. Driver / wedge models.
3. Optional direct consumer-radar streaming.
