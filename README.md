<div align="center">

<a href="https://takomo-fitter.web.app/">
  <img src="docs/assets/takomo_fit_header.png" alt="Takomo Fit" width="440" />
</a>

<br/><br/>

**The AI Pro-Fitter in Your Pocket**  
*Multimodal Voice Consultation · Zero-Print Smartphone Vision · Calibrated Bayesian Fitting*

[![CI](https://github.com/0xMuluh/takomo-fit/actions/workflows/ci.yml/badge.svg)](https://github.com/0xMuluh/takomo-fit/actions/workflows/ci.yml)
[![Deploy to Cloud Run](https://github.com/0xMuluh/takomo-fit/actions/workflows/deploy.yml/badge.svg)](https://github.com/0xMuluh/takomo-fit/actions/workflows/deploy.yml)
[![Live Application](https://img.shields.io/badge/Live_App-takomo--fitter.web.app-ff6e01?style=flat&logo=googlecloud&logoColor=white)](https://takomo-fitter.web.app/)
[![Benchmark Agreement](https://img.shields.io/badge/Benchmark_Agreement-87.91_%2F_100-1f5135?style=flat)](docs/README.md)
[![Exact Match](https://img.shields.io/badge/Full_Spec_Exact-39.0%25_(~3x_Baseline)-1f5135?style=flat)](docs/README.md)
[![Manufacturability](https://img.shields.io/badge/Unbuildable_Specs-0_(100%25_Feasible)-1f5135?style=flat)](docs/README.md)
[![Calibration ECE](https://img.shields.io/badge/Calibration_ECE-%3C_0.015-black?style=flat)](docs/03_FITTING_ENGINE_MATHEMATICS_AND_CALIBRATION.md)

<p align="center">
  <a href="https://takomo-fitter.web.app/"><strong>Launch Live App »</strong></a> ·
  <a href="#-quickstart">Quickstart</a> ·
  <a href="#-the-solution-how-it-works">How It Works</a> ·
  <a href="#-benchmark--calibration-results">Benchmark</a> ·
  <a href="docs/README.md">Docs</a>
</p>

</div>

---

## ⛳ The Challenge: Trust at Scale

Takomo sells forged, premium golf clubs direct to golfers across 109 countries with no retail middleman, growing from under €3M in 2022 to €70M+ today. Over 25% of all iron orders flow through Takomo's online fitting tool (600,000+ fittings in the past six months).

**The central bottleneck to online club fitting is trust:**
* **Self-Reporting Noise:** Higher-handicap golfers overestimate 7-iron carry by an average of 14 yards, and 7-iron lofts vary up to 5° across brands (~12 m carry difference on the exact same swing).
* **Static Black Boxes:** Standard web forms ask for guesses and return a static spec without explanations, conversation, or physical evidence.
* **Return Anxiety:** Custom builds cannot be returned under Takomo’s 30-day policy. Hesitant golfers abandon carts between stock and custom configurations.

**Takomo Pocket Fitter** turns a web questionnaire into an hour with a trusted pro fitter on the golfer’s smartphone.

---

## 🏌️ Meet "Ilmari": The Voice Pro-Fitter

<div align="center">
  <img src="docs/assets/takomo_stickman.svg" width="64" height="64" align="right" />
</div>

**"Ilmari"** is Takomo’s conversational AI club fitter, voiced by **ElevenLabs Conversational AI** and driven by Takomo's Bayesian engine. He talks like the best playing partner you've ever been paired with: candid, relaxed, technical without jargon, and powered by client-side tools in English, Finnish, Swedish, and German.

* **Respectful Verification:** Flags suspicious self-reported numbers with a smile: *"A 170-yard 7-iron is long for an 82 mph swing. Let's verify whether that's carry or total, or check your current club's loft."*
* **Ball-Flight Physics:** Explains specifications in terms of actual ball flight: *"At your 150-yard carry, your dynamic toe-down impact pushes shots 4.2 yards right with standard lie. A 2° upright lie squares the face at impact."*
* **Transparent Close Calls:** When two heads or shafts differ by under 5% probability, Ilmari highlights the runner-up and outlines the specific trade-offs (e.g. forgiveness vs workability).
* **Stock Set Protection:** Advises keeping a stock set with its full 30-day return policy whenever custom advantages fall within practical tolerance.

---

## 📱 Visual Experience Showcase

<div align="center">

| Multimodal AI Voice Consultation (`/fit`) | Accessible Guided Fitting (`/fit/guided`) |
|:---:|:---:|
| <img src="docs/assets/voice_fitter.png" alt="Takomo Voice Fitter UI" width="460" /> | <img src="docs/assets/guided_fitter.png" alt="Takomo Guided Flow UI" width="460" /> |
| *Real-time ElevenLabs voice agent, audio waveforms, live camera triggers, and progressive confidence.* | *Zero-voice accessible tap-through flow for noisy environments or silent browsing.* |

| Storefront Integration (`takomogolf.com`) | Biomechanics & Posture Tracking |
|:---:|:---:|
| <img src="docs/assets/landing_page.png" alt="Takomo Pocket Fitter Landing Page" width="460" /> | <img src="docs/assets/golfer_biomechanics_schematic.png" alt="Biomechanical Telemetry Schematic" width="460" /> |
| *Direct-to-consumer digital studio matching Takomo's minimal Nordic dark aesthetic.* | *On-device MediaPipe landmark extraction, ISO card millimeter scale factor, and swing kinematics.* |

</div>

---

## ⚡ Technical Innovations

### 1. Zero-Print ISO Card Reference Scale (No Printer Needed)
Starter kits often rely on printable A4 ArUco target sheets. Fewer than 35% of modern homes have working printers.
* **Our Solution:** Uses any standard payment card (**ISO/IEC 7810 ID-1**: $85.60 \text{ mm} \times 53.98 \text{ mm}$, found in every wallet worldwide) as an optical anchor.
* Edge vision segments the card boundaries in the browser, confirms aspect ratio ($\pm 4\%$), and derives scale $s = \frac{85.60\text{ mm}}{w_{\text{px}}}$.

### 2. Zero-Video-Egress Edge Biometrics (100% Client-Side WASM)
* **Privacy & GDPR:** Zero video frames or photos leave the golfer's device.
* **MediaPipe Pose & Hands:** Runs inside browser WebAssembly / WebGL on iOS Safari and Android Chrome. Only scalar measurements (e.g., `height_cm: 182.4`, `hand_length_cm: 19.1`) are transmitted over TLS to the engine.

### 3. Multi-Device Handoff (`/m/[code]`)
* Desktop shoppers click **"Measure with Phone"**, scan a QR code, and instantly transition to their mobile camera with zero login.
* Live camera coaching cues (*"Step back until feet are visible"*) stream back to the desktop in real time via lightweight polling.

### 4. Dynamic Strike & Launch Monitor Ingestion
* **Ball-Line Lie Analysis:** 4-point interactive impact tool measures dynamic face tilt angle ($\theta_{\text{tilt}}$) from ball marker lines, capturing shaft droop during the downswing.
* **Launch Monitor Ingestion:** Parses CSV exports or photos of screens from TrackMan, FlightScope, Garmin R10, and Bushnell Launch Pro via vision LLM.

---

## 📐 System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Browser (Desktop or Smartphone)"]
        UI["Next.js 15 App / React 19 Frontend"]
        WASM["MediaPipe WASM Engine\n(Pose & Hands Edge Vision)"]
        Audio["Web Audio API / Streaming"]
        Card["ISO Card & Ball-Line Measurement"]
    end

    subgraph CloudRun["Backend Fitting Engine (Cloud Run europe-north1)"]
        API["FastAPI REST Gateways"]
        Fusion["Linear-Gaussian Fusion (Combinatorial Masks)"]
        MonteCarlo["Monte Carlo Decision Engine (N = 800 Draws)"]
        Explain["Deterministic Physics Explanation Engine"]
        HandoffHub["Ephemeral Handoff State Store"]
        Store["Persistent Session Store (SQLite)"]
    end

    subgraph VoiceCloud["ElevenLabs Cloud"]
        Agent["Ilmari Conversational Agent"]
        TTS["Low-Latency Audio Streaming"]
    end

    Audio <--> TTS <--> Agent
    Agent -- "WebSocket Client Tools" --> UI
    UI -- "Local Edge Processing" --> WASM --> Card
    UI -- "REST /api/pf/*" --> API
    API --> Fusion --> MonteCarlo --> Explain --> Store
    API <--> HandoffHub <--> UI
```

---

## 📊 Benchmark & Calibration Results

Evaluated against Takomo's official Fitting Lab benchmark split (**3,000 unseen dev golfers** with ground truth):

| Performance Metric | Today's Questionnaire (B1) | Static Rules + Phone (B2) | **Takomo Pocket Fitter** |
|---|:---:|:---:|:---:|
| **Spec Agreement Score** | 77.10 / 100 | 83.60 / 100 | **87.91 / 100** *(+10.8 pts)* |
| **Full Spec Exact Match** | 13.7 % | 25.3 % | **39.0 %** *(~3x Baseline)* |
| **Unbuildable Specs** | — | — | **0 (100% Feasible)** |
| **Flex Agreement** | 64.0 % | 74.2 % | **83.6 %** |
| **TrackMan Lie Agreement** | — | — | **85.6 %** |

<div align="center">
  <img src="docs/assets/fig4_baselines_dev.png" alt="Benchmark Spec Agreement Score vs Baselines" width="720" />
</div>

### Strict Uncertainty Calibration (ECE < 0.015)
Unlike overconfident deep nets, our linear-Gaussian fusion and HistGradientBoosting classifiers achieve an **Expected Calibration Error under 0.015** across every component. When the engine reports $\ge 95\%$ confidence, empirical accuracy is **98.8% to 99.7%** (awarded the **"Confirmed"** badge in the UI).

| Component | Stated Mean Confidence $\bar{c}$ | Empirical Accuracy $\bar{a}$ | Expected Calibration Error (ECE) |
|---|:---:|:---:|:---:|
| **Head Model** | 88.2% | 87.1% | **0.0140** |
| **Shaft Flex** | 83.5% | 83.6% | **0.0064** |
| **Club Length** | 89.8% | 89.3% | **0.0085** |
| **Lie Angle** | 49.4% | 49.0% | **0.0098** |
| **Grip Size** | 86.0% | 87.4% | **0.0145** |
| **Full Complete Spec** | 28.5% | 28.0% | **0.0094** |

---

## 🚀 Quickstart

### Prerequisites
* Python 3.12+
* Node.js 20+ or 24+
* Docker & Docker Compose (optional)

### 1. Run Engine (FastAPI on port 8077)
```bash
cd engine
python -m venv .venv && source .venv/bin/activate
pip install -e .[dev]

# Optional: retrain model (pre-trained artifacts/model.joblib is already included)
# python scripts/train.py

uvicorn pocketfit.api:app_factory --factory --port 8077
```

### 2. Run Web Frontend (Next.js on port 3000)
```bash
cd web
npm install
npm run build && npm start    # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend automatically proxies `/api/pf/*` requests to `http://localhost:8077`.

### 3. Enable Live Voice Fitter (ElevenLabs)
```bash
export ELEVENLABS_API_KEY="your-elevenlabs-key"
cd engine && python scripts/setup_voice_agent.py
# Outputs: ELEVENLABS_AGENT_ID=agent_...
export ELEVENLABS_AGENT_ID="agent_..."
```
Restart the engine with both environment variables set. The web app will automatically connect to Ilmari with signed session tokens.

---

## 🧪 Automated Testing & Verification

```bash
# 1. Engine Unit & API Tests (62 tests in ~18s)
cd engine && pytest -m "not slow" -q

# 2. Web Typecheck, Lint & Build
cd web && npx tsc --noEmit && npx eslint src && npm run build

# 3. End-to-End Voice Scenario Simulation (No ElevenLabs Key Required)
cd web && PF_API_URL=http://localhost:8077 npx jiti scripts/fitter-scenario.ts
```

---

## 📦 Production Deployment

### Automated CI/CD
* **GitHub Actions:** Every PR triggers `.github/workflows/ci.yml` (Pytest, TypeScript typecheck, ESLint, Next.js standalone build).
* **Continuous Deployment:** Merges to `main` trigger `.github/workflows/deploy.yml` which builds containers, pushes to Google Artifact Registry, and deploys to **Google Cloud Run** (`takomo-engine` locked to `--max-instances 1`).

### Single-Server Docker Compose
```bash
cp .env.example .env
docker compose up -d --build
```
This launches the FastAPI engine, Next.js web application, and Caddy with automatic SSL certificates for mobile camera/microphone permissions.

---

## 📂 Deliverables & Documentation Index

All technical documents, benchmark datasets, and pitch deliverables are hosted in [`docs/`](docs/):

* [**00_HACKATHON_SUBMISSION.md**](docs/00_HACKATHON_SUBMISSION.md): Official submission portal fields (Tagline, About, Tech stack, links).
* [**01_ONE_PAGE_EXECUTIVE_SUMMARY.md**](docs/01_ONE_PAGE_EXECUTIVE_SUMMARY.md): Required 1-page executive writeup (Slide 16 of Challenge Brief).
* [**02_ARCHITECTURE_AND_SYSTEM_SPEC.md**](docs/02_ARCHITECTURE_AND_SYSTEM_SPEC.md): Complete engineering architecture and zero-egress protocol.
* [**03_FITTING_ENGINE_MATHEMATICS_AND_CALIBRATION.md**](docs/03_FITTING_ENGINE_MATHEMATICS_AND_CALIBRATION.md): Linear-Gaussian conjugate math, ECE proofs, and EVOI formulations.
* [**04_COMPUTER_VISION_AND_BIOMECHANICS.md**](docs/04_COMPUTER_VISION_AND_BIOMECHANICS.md): ISO card geometry, MediaPipe edge vision, and ball-line impact analysis.
* [**05_API_REFERENCE_AND_INTEGRATION.md**](docs/05_API_REFERENCE_AND_INTEGRATION.md): OpenAPI endpoint specifications and headless Shopify cart injection.
* [**06_PRODUCTION_PILOT_AND_BUSINESS_CASE.md**](docs/06_PRODUCTION_PILOT_AND_BUSINESS_CASE.md): Financial model (+€3.8M–€7.4M/yr net gain) and 4-phase rollout plan.
* [**07_FINALS_PITCH_DECK.md**](docs/07_FINALS_PITCH_DECK.md): 10-slide championship finals script and presenter notes.
* [**presentation/Takomo_Pocket_Fitter_Finals.pptx**](docs/presentation/Takomo_Pocket_Fitter_Finals.pptx): Production 16:9 widescreen PowerPoint deck with brand styling.
* [**test_predictions/takomo_test_predictions.csv**](docs/test_predictions/takomo_test_predictions.csv): Predictions for all 5,000 unlabelled benchmark test golfers.

---

<div align="center">
  <sub>Built with precision for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong> (Turku, Finland).</sub>
</div>
