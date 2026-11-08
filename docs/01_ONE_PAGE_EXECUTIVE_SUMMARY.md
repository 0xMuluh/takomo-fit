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

# Executive summary (1-pager)

**Challenge:** The Fitter in Your Pocket · Since AI Hackathon 2026 (Turku, Finland)  
**Live:** [https://takomo-fitter.web.app/](https://takomo-fitter.web.app/) · **Repo:** [https://github.com/0xMuluh/takomo-fit](https://github.com/0xMuluh/takomo-fit)  
**Dev benchmark:** Score **87.91 / 100** · full-spec exact **39.0%** · unbuildable **0** · $n=3000$ (`model.json`)

---

### 1. The core idea

Takomo D2C: €70M+, 109 countries; 600k+ fittings / 6 months; >25% of iron orders via the online fitter. Today’s tool is a questionnaire. Lab SIMULATOR: median self-report carry over-report **15 yd**; loft/model gaps ~**12 m** carry. Golfers get a spec without measured evidence.

Pocket Fitter adds phone measurements and optional voice, fuses evidence in the Python engine, and returns a buildable Takomo iron spec with per-component confidence, reasons, and stock/custom advice.

---

### 2. What the proof of concept shows

| Key claim | Measured evidence |
|---|---|
| **Superior simulator recovery vs questionnaire** | Dev **87.91** vs Baseline 1 **77.1** / Baseline 2 **83.6**; exact **39.0%** vs 13.7% / 25.3% |
| **Guaranteed buildable catalog output** | **0 unbuildable specs** across 3,000 synthetic test golfers |
| **Calibrated lie angle recovery** | Component lie exact **58.3%** (vs Baseline 1 ~41% in fitting lab) |
| **Frictionless hand scale calibration** | Any ISO/IEC 7810 ID-1 card in-browser; zero print sheets required |
| **Seamless cross-device handoff** | Desktop QR `/v1/handoff` $\to$ mobile capture `/m/[code]` via SSE |
| **Privacy-first zero-egress computer vision** | MediaPipe WASM on-device; only numerical scalars transmitted to API |

> [!NOTE]
> Synthetic benchmark scores measure recovery under lab simulator assumptions. They serve as engineering verification, not a clinical trial against human pro fitters on physical golfers.

---

### 3. Accuracy & calibration validation

* Train and evaluate on Fitting Lab synthetic golfers; verified metrics in `pocket-fitter/engine/artifacts/model.json`.
* Decision sampling: `N_DRAWS = 800` in `decide.py` for empirical posterior distribution.
* ECE (Expected Calibration Error on dev split): Head `0.014`, Flex `0.0064`, Length `0.0085`, Lie `0.0098`, Grip `0.0145`, Whole Spec `0.0094`.
* UI “Confirmed” badge: component confidence $\ge 95\%$ and margin over runner-up $\ge 15\%$.

---

### 4. Trust mechanics & commercial safety

* **Transparent explanations:** Real-time rationale from `explain.py` with physical dispersion context (e.g. lateral yards per lie degree).
* **Visible close calls:** Explicitly surfaces runner-up specs when posterior probability mass is split.
* **Commercial stock advice:** Recommends standard stock builds whenever custom specs lack overwhelming evidence, preserving the golfer's 30-day return policy.

---

### 5. Roadmap & next steps

1. **Headless Shopify cart injection:** Prefilled cart permalinks with custom build line items.
2. **Full-bag extension:** Expand Bayesian fusion models to drivers, fairway woods, and wedges.
3. **Consumer radar integration:** Optional direct BLE streaming from popular consumer launch monitors.

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built with ❤️ for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
