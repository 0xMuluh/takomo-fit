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

# Fitting engine mathematics & calibration

**Code modules:** `pocketfit.fusion`, `pocketfit.decide`, `pocketfit.advice`, `pocketfit.explain`  
**Model artifact:** `pocket-fitter/engine/artifacts/model.json` (`pf-0.1.0-202611070240`)

> [!NOTE]
> Synthetic lab scores demonstrate parameter recovery under the competition simulator. They reflect mathematical convergence rather than clinical agreement with a master fitter on live human golfers.

---

## 1. Mathematical formulation

Observed evidence $\mathbf{x}$ is inherently heterogeneous and partially observed (ranging from self-reported questionnaires to card-calibrated computer vision or launch monitor feeds).

* **Latent continuous variables:** 7-iron clubhead speed, golfer height, wrist-to-floor distance, hand length, lie angle delta.
* **Latent discrete categoricals:** handicap/score bracket, typical ball flight, swing tempo profile.

### Pipeline workflow
1. Estimate continuous and discrete posteriors $p(\theta \mid \mathbf{x})$ via linear-Gaussian conjugate models and gradient-boosted trees.
2. Draw $N = 800$ Monte Carlo samples (`N_DRAWS` in `decide.py`), propagating each draw through deterministic Takomo manufacturing rules.
3. Compute empirical modes, component confidences, and whole-spec joint probability.

---

## 2. Continuous fusion (linear-Gaussian model)

For each continuous target, evidence is partitioned into trained subsets. For every observed feature mask $M$ with sufficient training density:

$$\theta = \beta_0^M + \sum_{j \in M \cup A} \beta_j^M x_j + \varepsilon, \quad \varepsilon \sim \mathcal{N}(0, (\sigma^M)^2)$$

At inference time, if an exact feature mask is missing, the engine evaluates available trained submasks and selects the submask that minimizes the empirical residual variance $\hat\sigma^M$, always returning a calibrated mean and standard deviation.

---

## 3. Discrete categoricals

Discrete attributes (handicap bracket, ball flight, swing tempo) are modeled via `HistGradientBoostingClassifier` with native missing-value support. Softmax output vectors define the multinomial sampling probabilities during Monte Carlo draws.

---

## 4. Monte Carlo decision engine ($N = 800$)

Continuous parameters are sampled from their respective posteriors $\mathcal{N}(\mu, \sigma^2)$, while discrete fields are drawn categorically. Each synthetic golfer vector is mapped through the Takomo product catalog:

### Hand length to grip boundary mapping
Grip sizes follow the official Takomo glove sizing specifications in `takomo_fit.products`:

```text
GLOVE_EDGES_CM = [16.8, 17.8, 18.59, 19.4, 20.22]
GLOVE_ORDER    = XS, S, M, M/L, L, XL
grip_by_glove  = XS/S/M → Standard; M/L/L → Midsize; XL → Oversize
```

* **Standard grip:** Hand length $< 18.59\text{ cm}$
* **Midsize grip:** $18.59\text{ cm} \le \text{Hand Length} < 20.22\text{ cm}$
* **Oversize grip:** $\ge 20.22\text{ cm}$

Component confidence represents the exact fraction of Monte Carlo draws selecting that winning specification.

---

## 5. Physical lateral dispersion model

Lateral yardage dispersion resulting from lie angle mismatch is calculated analytically in `explain.yards_per_lie_degree(loft_deg, carry_yd)`:

$$\Delta y = d_{\text{carry}} \cdot \tan\!\big(\arctan(\tan\alpha \cdot \sin\Delta\theta)\big)$$

* **Example:** Takomo 101 MKII 7-iron ($29^\circ$ loft), 160 yard carry, $2^\circ$ lie mismatch:

$$\Delta y \approx 160 \cdot \tan\!\big(\arctan(\tan 29^\circ \cdot \sin 2^\circ)\big) \approx 3.14\text{ yards lateral push/pull}$$

---

## 6. Expected calibration error (ECE)

Calibrated on the 3,000 synthetic golfers of the development split across 10 probability bins $[0, 0.5), [0.5, 0.6), \dots, [0.95, 1.0]$:

$$\mathrm{ECE} = \sum_{b=1}^B \frac{|B_b|}{M} \left| \mathrm{acc}_b - \mathrm{conf}_b \right|$$

| Component | Mean predicted conf | Empirical accuracy | Calibration ECE |
|---|---|---|---|
| **Head model** | 0.882 | 0.871 | **0.0140** |
| **Shaft flex** | 0.835 | 0.836 | **0.0064** |
| **Club length** | 0.898 | 0.893 | **0.0085** |
| **Lie angle** | 0.494 | 0.490 | **0.0098** |
| **Grip size** | 0.860 | 0.874 | **0.0145** |
| **Whole spec** | 0.285 | 0.280 | **0.0094** |

### Verified dev accuracy summary
* **Agreement score:** **87.91 / 100**
* **Full-spec exact:** **39.0%**
* **Unbuildable specs:** **0** (100% catalog feasible)
* **Component exact:** Head 94.8%, Flex 90.8%, Material 97.2%, Shaft Model 88.5%, Length 92.7%, Lie 58.3%, Grip 90.5%.

---

## 7. Expected value of information (EVOI)

`advice.next_tests` ranks prospective tests by projecting the expected reduction in posterior entropy. It simulates posterior variances for each candidate test and surfaces the single measurement that offers the highest expected confidence gain.

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built with ❤️ for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
