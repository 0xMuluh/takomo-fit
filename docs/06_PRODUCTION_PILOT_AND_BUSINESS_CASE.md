# Pilot plan & business notes

**Takomo brief facts (from challenge brief):** €70M+ revenue; 109 countries; 600k+ online fittings in six months; >25% of iron orders via the online fitter.

---

## 1. Why fitting matters commercially

D2C means the website fitter sets model, specs, and stock vs custom. Trust affects whether golfers complete an order and whether stock sets come back under the 30-day return window. Custom builds are not returnable; the engine’s `stock_advice` exists to say when stock is enough.

---

## 2. Unit economics — illustrative assumptions only

Takomo has **not** provided conversion rate, AOV, return rate, support-hours, or NPS figures for this project. Numbers below are **planning placeholders**, not measured Takomo KPIs. Do not quote them as facts.

| Placeholder | Example value | Use |
|---|---|---|
| Annual fittings (extrapolated from brief 600k / 6 mo) | ~1.2M | Scenario sizing |
| Fitting→order conversion | unknown | A/B measure in pilot |
| Iron-set AOV | unknown | Revenue scenarios |
| Stock return rate | unknown | RMA telemetry |
| Support contacts about fit | unknown | Ticket tagging |

Any €M “uplift” spreadsheet built from invented conversion/AOV/return rates is scenario math only.

---

## 3. Suggested rollout (process, not committed dates)

| Phase | Scope | Gate (measure, don’t invent targets) |
|---|---|---|
| 1 Canary | Small % EN traffic vs questionnaire | Funnel completion, cart add, RMA tags, error rate |
| 2 Locales | FI / SV / DE already in `locale.lang` | Same metrics by locale |
| 3 Storefront | Embed on takomogolf.com; **then** Shopify line items | Buildable-spec rate; stock/custom mix |
| 4 Full bag | Driver / wedge models | Separate model + catalog work |

Infra already demonstrated: live web app, Dockerizable FastAPI, Firebase-hosted frontend. Shopify injection remains future work.

---

## 4. What to monitor (no fake SLOs)

- Fit create / evidence latency and 5xx rate  
- Unbuildable or validation failures  
- Voice session 503/429 rates  
- Stock vs custom recommendation mix  
- Pilot cohort RMAs vs control (once tagged)

Latency/NPS/language-accuracy thresholds are not established in-repo; set them from production data after canary.
