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

# Finals pitch deck script (10 slides)

**Live demo:** [https://takomo-fitter.web.app/](https://takomo-fitter.web.app/)  
**Code repository:** [https://github.com/0xMuluh/takomo-fit](https://github.com/0xMuluh/takomo-fit)  
**Slide presentation deck:** `docs/presentation/Takomo_Pocket_Fitter_Finals.pptx` (rebuild via `generate_deck.py`)

---

## Slide 1 — Title & executive proposition
* **Visual:** Header badge with Takomo Fit identity, stickman golfer, and live app link.
* **Headline:** Takomo Pocket Fitter — Ilmari: the fitter in your pocket
* **Bullets:**
  * ElevenLabs multimodal voice
  * Zero-print smartphone vision
  * 87.91 score · 0 unbuildable specs
* **Speaker notes:** Takomo sells forged, premium golf clubs direct-to-consumer across 109 countries. Over 25% of all iron sales flow through the online fitter. 5 mins with a master club fitter on any smartphone with on-device computer vision and conversational AI.

---

## Slide 2 — The commercial trust gap
* **Visual:** Questionnaire vs. launch monitor comparison; self-report error distribution.
* **Talking points:**
  * Self-report carry distances overestimate actual carry by a median of 15 yards; loft variations across brands can move carry by ~12 meters on identical swings.
  * Questionnaires spit out a spec without evidence or explanation.
  * Custom builds cannot be returned under Takomo's 30-day window, creating hesitation at checkout.

---

## Slide 3 — The multimodal solution
* **Visual:** System architecture showing browser WASM vision, conversational agent, and Bayesian engine.
* **Talking points:**
  1. Multimodal conversational voice fitter (Ilmari) speaking English, Finnish, Swedish, and German.
  2. Zero-print on-device smartphone computer vision utilizing standard ID/credit cards for millimeter scaling.
  3. Calibrated linear-Gaussian fusion with $N=800$ Monte Carlo draws through strict Takomo build rules.

---

## Slide 4 — Computer vision innovation
* **Visual:** ISO card alignment HUD and hand landmark mesh.
* **Talking points:**
  * ISO/IEC 7810 ID-1 card bounding eliminates the need for printed paper sheets.
  * Hand length mapped to Takomo factory glove bins and installed grip sizes.
  * Pose tracking determines wrist-to-floor proportions and swing tempo ratios.
  * Seamless desktop-to-mobile handoff via QR code.

---

## Slide 5 — Dynamic evidence & impact geometry
* **Visual:** 4-point ball-line impact interface and clubface tilt angle.
* **Talking points:**
  * Guided 4-point clubface registration extracts dynamic delivery lie angles.
  * Direct delivery measurements boost component lie accuracy to 58.3% on benchmark testing (vs ~41% for questionnaire baselines).
  * Ingests launch monitor screenshots and TrackMan reports when available.

---

## Slide 6 — The fitting engine & calibration
* **Visual:** Posterior probability distributions and calibration reliability curve.
* **Talking points:**
  * Combines continuous linear-Gaussian conjugate models with HistGradientBoosting classifiers.
  * 800 Monte Carlo draws quantify real posterior uncertainty.
  * Rigorously calibrated: Expected Calibration Error (ECE) $< 0.015$ across all components.
  * Every recommendation is deterministic and guaranteed buildable.

---

## Slide 7 — Benchmark verification ($n=3,000$)

| Benchmark metric | Questionnaire baseline (B1) | Evidence substitution (B2) | Takomo Pocket Fitter |
|---|---|---|---|
| **Spec agreement score** | 77.10 / 100 | 83.60 / 100 | **87.91 / 100** |
| **Full-spec exact match** | 13.7% | 25.3% | **39.0%** (~3x baseline) |
| **Unbuildable specs** | — | — | **0 (100% Feasible)** |
| **Component lie accuracy** | ~41.0% | — | **58.3%** |
| **Shaft flex accuracy** | — | — | **90.8%** |

*Note: Verified on the competition development split (`model.json`).*

---

## Slide 8 — Explainable AI & commercial protection
* **Visual:** Confidence pills, lateral dispersion calculation, and stock advice card.
* **Talking points:**
  * Calculates physical dispersion: e.g. 2° lie error on a 29° 7-iron yields ~3.1 yards of lateral miss.
  * Transparently highlights close calls and runner-up specifications.
  * Commercial safety logic: actively recommends standard stock builds when evidence for custom changes is weak, preserving the 30-day return guarantee.

---

## Slide 9 — From canary to storefront
* **Visual:** 4-phase rollout columns (canary pilot $\to$ European locales $\to$ headless Shopify $\to$ full bag suite).
* **Talking points:**
  * Phase 1 A/B canary test on 5% of web traffic to verify 0 unbuildable specs.
  * Native voice and text engines in FI, SV, DE driving conversion parity.
  * Zero-friction headless Shopify cart injection pre-filling custom build specs.
  * Expansion to drivers, fairway woods, and wedges to lift average order value.

---

## Slide 10 — Try Takomo Fit right now
* **Visual:** Scannable Takomo stickman QR code linked to `takomo-fitter.web.app` on the left; 4 core commercial pillars for Takomo on the right.
* **Action:** Direct live test of the conversational voice fitter, camera scaling, and instant confidence breakdown.
* **Links:** [https://takomo-fitter.web.app](https://takomo-fitter.web.app) · [GitHub repository](https://github.com/0xMuluh/takomo-fit)

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built with ❤️ for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
