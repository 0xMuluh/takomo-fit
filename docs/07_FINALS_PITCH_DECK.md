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

# Finals Pitch Deck Script (10 Slides)

**Live Demo:** [https://takomo-fitter.web.app/](https://takomo-fitter.web.app/)  
**Code Repository:** [https://github.com/0xMuluh/takomo-fit](https://github.com/0xMuluh/takomo-fit)  
**Slide Presentation Deck:** `docs/presentation/Takomo_Pocket_Fitter_Finals.pptx` (rebuild via `generate_deck.py`)

---

## Slide 1 — Title & Executive Proposition
* **Visual:** Header badge with Takomo Fit identity, stickman golfer, and live app link.
* **Headline:** Takomo Pocket Fitter — The AI Pro-Fitter in Your Pocket
* **Speaker Notes:** Takomo is a D2C success story (€70M+ revenue across 109 countries), with over 25% of all iron sales flowing through the online fitter. But today's online fitting is a questionnaire. Our goal is to bring the expertise of a professional master fitter into the golfer's pocket with on-device computer vision and conversational AI.

---

## Slide 2 — The Commercial Trust Gap
* **Visual:** Questionnaire vs. Launch Monitor comparison; self-report error distribution.
* **Talking Points:**
  * Self-report carry distances overestimate actual carry by a median of 15 yards; loft variations across brands can move carry by ~12 meters on identical swings.
  * Questionnaires spit out a spec without evidence or explanation.
  * Custom builds cannot be returned under Takomo's 30-day window, creating hesitation at checkout.

---

## Slide 3 — The Multimodal Solution
* **Visual:** System architecture showing browser WASM vision, conversational agent, and Bayesian engine.
* **Talking Points:**
  1. Multimodal conversational voice fitter (Ilmari) speaking English, Finnish, Swedish, and German.
  2. Zero-print on-device smartphone computer vision utilizing standard ID/credit cards for millimeter scaling.
  3. Calibrated linear-Gaussian fusion with $N=800$ Monte Carlo draws through strict Takomo build rules.

---

## Slide 4 — Computer Vision Innovation
* **Visual:** ISO card alignment HUD and hand landmark mesh.
* **Talking Points:**
  * ISO/IEC 7810 ID-1 card bounding eliminates the need for printed paper sheets.
  * Hand length mapped to Takomo factory glove bins and installed grip sizes.
  * Pose tracking determines wrist-to-floor proportions and swing tempo ratios.
  * Seamless desktop-to-mobile handoff via QR code.

---

## Slide 5 — Dynamic Evidence & Impact Geometry
* **Visual:** 4-point ball-line impact interface and clubface tilt angle.
* **Talking Points:**
  * Guided 4-point clubface registration extracts dynamic delivery lie angles.
  * Direct delivery measurements boost component lie accuracy to 58.3% on benchmark testing (vs ~41% for questionnaire baselines).
  * Ingests launch monitor screenshots and TrackMan reports when available.

---

## Slide 6 — The Fitting Engine & Calibration
* **Visual:** Posterior probability distributions and calibration reliability curve.
* **Talking Points:**
  * Combines continuous linear-Gaussian conjugate models with HistGradientBoosting classifiers.
  * 800 Monte Carlo draws quantify real posterior uncertainty.
  * Rigorously calibrated: Expected Calibration Error (ECE) $< 0.015$ across all components.
  * Every recommendation is deterministic and guaranteed buildable.

---

## Slide 7 — Benchmark Verification ($n=3,000$)

| Benchmark Metric | Questionnaire Baseline (B1) | Evidence Substitution (B2) | Takomo Pocket Fitter |
|---|---|---|---|
| **Spec Agreement Score** | 77.10 / 100 | 83.60 / 100 | **87.91 / 100** |
| **Full-Spec Exact Match** | 13.7% | 25.3% | **39.0%** (~3x Baseline) |
| **Unbuildable Specs** | Unknown | Unknown | **0 (100% Feasible)** |
| **Component Lie Accuracy** | ~41.0% | — | **58.3%** |
| **Shaft Flex Accuracy** | — | — | **90.8%** |

*Note: Verified on the competition development split (`model.json`).*

---

## Slide 8 — Explainable AI & Commercial Protection
* **Visual:** Confidence pills, lateral dispersion calculation, and stock advice card.
* **Talking Points:**
  * Calculates physical dispersion: e.g. 2° lie error on a 29° 7-iron yields ~3.1 yards of lateral miss.
  * Transparently highlights close calls and runner-up specifications.
  * Commercial safety logic: actively recommends standard stock builds when evidence for custom changes is weak, preserving the 30-day return guarantee.

---

## Slide 9 — Production Pilot & Rollout Roadmap
* **Visual:** 4-phase deployment timeline (Canary $\to$ Multilingual $\to$ Storefront $\to$ Full Bag).
* **Talking Points:**
  * Phase 1 A/B canary test on 5% of web traffic.
  * Zero-friction headless Shopify cart injection prefilling iron specs.
  * Expansion to drivers, fairway woods, and wedges.

---

## Slide 10 — Live System Demonstration
* **Visual:** Live interactive screen on mobile and desktop.
* **Action:** Live demo of conversational voice fit, mobile card calibration, and instant confidence breakdown.
* **Links:** [https://takomo-fitter.web.app](https://takomo-fitter.web.app) · [GitHub Repository](https://github.com/0xMuluh/takomo-fit)

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
