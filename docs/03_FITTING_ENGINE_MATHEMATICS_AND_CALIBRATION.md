# Fitting engine — fusion, decide, calibration

**Code:** `pocketfit.fusion`, `pocketfit.decide`, `pocketfit.advice`, `pocketfit.explain`  
**Artifact:** `pocket-fitter/engine/artifacts/model.json` (version `pf-0.1.0-202611070240`)

Synthetic lab score shows recovery under simulator assumptions, not agreement with a pro fitter on real golfers.

---

## 1. Setup

Observed evidence \(\mathbf{x}\) may be partial (questionnaire only, plus phone, plus radar, …). Latent continuous targets include 7i speed, height, wrist-to-floor, hand length, lie need; discrete: score bucket, flight, tempo.

Pipeline:

1. Estimate posteriors \(p(\theta \mid \mathbf{x})\) (fusion + classifiers).
2. Draw \(N = 800\) samples (`N_DRAWS` in `decide.py`), push each through Takomo product rules, take modal components and empirical confidences.

---

## 2. Continuous fusion (linear-Gaussian)

For each continuous target, evidence is grouped. For every trained subset mask \(M\) with enough rows, OLS:

\[
\theta = \beta_0^M + \sum_{j \in M \cup A} \beta_j^M x_j + \varepsilon, \quad \varepsilon \sim \mathcal{N}(0, (\sigma^M)^2)
\]

At inference, if the exact observed mask is unavailable, pick a trained submask minimizing residual \(\hat\sigma^M\) (preferring richer masks when tied). Always returns a mean and SD.

---

## 3. Discrete fields

`HistGradientBoostingClassifier` for score / flight / tempo (native missing-value handling). Softmax over class scores for categorical sampling in decide.

---

## 4. Monte Carlo decide (\(N = 800\))

Draw continuous latents from independent Normal(\(\mu,\sigma^2\)); sample discrete categoricals. Per draw, rules assign head, shaft, length, lie, grip, purchase.

Grip from hand length via glove edges in `takomo_fit.products`:

```text
GLOVE_EDGES_CM = [16.8, 17.8, 18.59, 19.4, 20.22]
GLOVE_ORDER    = XS, S, M, M/L, L, XL
grip_by_glove  = XS/S/M → standard; M/L/L → midsize; XL → oversize
```

`np.digitize(hand, GLOVE_EDGES_CM)` → glove index → grip. Effective grip cuts: standard below 18.59 cm; midsize from 18.59 up to but not including 20.22; oversize from 20.22 (`advice.GRIP_EDGES`).

Component probability = fraction of draws choosing that value; confidence = probability of the mode. Whole-spec confidence = fraction of draws matching the full chosen spec.

---

## 5. Lateral dispersion from lie

`explain.yards_per_lie_degree(loft_deg, carry_yd)`:

\[
\Delta y_{1^\circ} = d_{\text{carry}} \cdot \tan\!\big(\arctan(\tan\alpha \cdot \sin 1^\circ)\big)
\]

For a multi-degree miss \(\Delta\theta\), use the same form with \(\sin(\Delta\theta)\) (not \(n \times\) the 1° value if you need exact consistency).

Example: 101 MKII loft \(29^\circ\), carry 160 yd, \(\Delta\theta = 2^\circ\):

\[
\Delta y \approx 160 \cdot \tan\!\big(\arctan(\tan 29^\circ \cdot \sin 2^\circ)\big) \approx 3.1 \text{ yd}
\]

(Do not cite a conflicting “4.2 yd” example.)

---

## 6. ECE (dev, from `model.json`)

Bins: [0,0.5), [0.5,0.6), …, [0.95,1].  
\(\mathrm{ECE} = \sum_b \frac{|B_b|}{M} |\mathrm{acc}_b - \mathrm{conf}_b|\).

| Component | Mean said | Mean was right | ECE |
|---|---|---|---|
| Head | 0.882 | 0.871 | 0.014 |
| Flex | 0.835 | 0.836 | 0.0064 |
| Length | 0.898 | 0.893 | 0.0085 |
| Lie | 0.494 | 0.490 | 0.0098 |
| Grip | 0.860 | 0.874 | 0.0145 |
| Whole spec | 0.285 | 0.280 | 0.0094 |

Dev component **exact** rates (same file): head 94.8%, flex 90.8%, material 97.2%, shaft_model 88.5%, length 92.7%, **lie 58.3%**, grip 90.5%, purchase 90.6%, handedness 100%. Spec agreement score **87.91**, full-spec exact **39.0%**, n=3000, unbuildable 0.

UI “Confirmed”: confidence ≥ 0.95 and not marked close call.

---

## 7. Next tests (EVOI)

`advice.next_tests` ranks optional measurements by expected confidence gain given current posterior SDs (samples prospective means, re-evaluates bin confidence). Returned as `NextTest` on `FitResponse`.
