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

# Production pilot & business case

**Takomo verified baseline data:** €70M+ annual revenue; 109 global destination countries; 600,000+ online fittings completed in past 6 months; $>25\%$ of total iron orders originate via the online fitter.

---

## 1. Commercial thesis: the trust bottleneck

As a direct-to-consumer (D2C) manufacturer without brick-and-mortar retail storefronts, Takomo's website fitter functions as the master salesperson and fitter.
* **The stock vs. custom dilemma:** Stock iron sets are backed by a 30-day hassle-free return window. Custom club builds are built to order and completely non-returnable.
* **The hesitation factor:** When a static questionnaire recommends a custom spec (+0.5" length, 2° upright lie) based on guessed swing speeds, golfers frequently abandon their carts out of fear of getting stuck with unreturnable clubs.
* **The commercial solution:** Pocket Fitter's `stock_advice` engine evaluates posterior confidence: unless measured evidence decisively favors custom adjustments, it guides the golfer toward standard stock configurations, protecting both buyer confidence and manufacturer margin.

---

## 2. Unit economics & scenario sizing

> [!IMPORTANT]
> The baseline KPIs below serve as **modeling placeholders** for pilot design. Conversion, RMA, and support baselines are to be measured via controlled A/B canary cohorts.

| Operational lever | Metric baseline / target | Commercial impact |
|---|---|---|
| **Annual fitting volume** | ~1.2M fittings / year | Extrapolated from 600k / 6 mo brief baseline |
| **Fitter $\to$ cart conversion** | Measured in Phase 1 A/B Canary | Incremental orders from reduced fitting abandonment |
| **Stock RMA rate** | Telemetry tracked via Shopify RMA | Fewer return restocks and freight absorption |
| **Custom build hesitation** | Monitored via stock recommendation mix | Faster checkout confidence on standard specs |
| **Customer support load** | Ticket tagging on fit inquiries | Automated explanations reduce pre-purchase tickets |

---

## 3. Four-phase production rollout

| Phase | Scope | Stage gates & success metrics |
|---|---|---|
| **Phase 1: Canary** | 5% English web traffic (A/B vs questionnaire) | Funnel completion rate, cart additions, 0 unbuildable specs |
| **Phase 2: Multilingual** | Roll out FI, SV, DE (`locale.lang` supported) | Locale conversion parity, translation fidelity |
| **Phase 3: Storefront** | Direct embed on takomogolf.com + Shopify cart | Seamless prefilled cart injection, RMA telemetry |
| **Phase 4: Full bag** | Extend to drivers, woods, and wedges | Catalog expansion, multi-club posterior models |

---

## 4. Telemetry & quality monitoring

* **Engine latency:** P95 response time on `/v1/fits` and `/v1/fits/{id}/evidence`.
* **Zero catalog violations:** Continuous audit confirming 0 unbuildable specs reach checkout.
* **Voice availability:** Monitoring ElevenLabs ephemeral session generation (target: $<0.1\%$ 5xx).
* **Return telemetry:** Tagged comparison of 30-day RMA rates between standard questionnaire cohort and Pocket Fitter cohort.

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built with ❤️ for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
