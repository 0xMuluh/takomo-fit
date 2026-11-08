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

# Demo video & voiceover script

**Live application:** [https://takomo-fitter.web.app/](https://takomo-fitter.web.app/)  
**Main presentation cut:** Up to 3 minutes  
**Short teaser cut:** ~45 seconds

The narrative follows a dual journey: why the D2C trust gap matters to an online golfer, and how Pocket Fitter connects conversational voice, smartphone vision measurements, and a Bayesian fitting engine.

---

## Main cut (up to 3 minutes)

| Timestamp | Visual track | Voiceover track |
|---|---|---|
| **0:00–0:25** | Open on a golfer hesitating over online fitting forms. Close-up on the swing speed question and Takomo product page. | *“Imagine buying irons online. The fitter asks your swing speed; you don't know it, so you guess. The result gives a spec without showing why. If it calls for custom, it can't be returned. Takomo had over 600,000 online fittings in six months; more than 25 percent of iron orders already use the fitter.”* |
| **0:25–0:54** | Cut to the challenge brief, Takomo product catalog, the five fitting dimensions, and real build clips. | *“The challenge: make online fitting feel closer to an hour with a professional. From Takomo's catalog and fitting rules, we mapped five choices: head, shaft, length, lie and grip. Ilmari gathers the golfer's context, phone tools add measurements, and the engine turns both into a buildable spec. Keeping the engine as the source of truth means its reasons match what the voice and screen say.”* |
| **0:54–1:22** | Live fitting flow. Ilmari asks questions, golfer responds, first spec updates in real-time. Hand beside bank card with measurement HUD. | *“Follow one golfer. They tell Ilmari what they want from new irons and their usual miss. A first 7-iron read appears. A bank card gives the camera a known scale for hand length, which helps set grip size. Three swings add tempo. Each measurement recomputes the fit; you can see what changes and what stays. Body measurements or launch monitor data can add evidence too.”* |
| **1:22–1:51** | Marked ball sequence: shots taken, clubface macro photo, guided 4-point registration. On-device processing indicator. | *“For lie, draw a line on a ball, hit at least three 7-irons, photograph the clubface, then tap the line ends, heel and toe. Four points estimate whether the toe was up or down at impact. Body, hand and swing images are analyzed on the phone; only measurements go to the engine.”* |
| **1:51–2:20** | Final spec screen: confidence badges, close-call alert, EVOI next-test prompt, and stock vs custom advice card. | *“At the end, the golfer sees a buildable Takomo spec: head, shaft, length, lie and grip. Each part has a reason and a confidence level. Close calls and runner-ups stay visible, with a suggested next measurement. The screen explains the trade-off: stock sets keep the 30-day return window; custom is made to order and can't be returned. The golfer can inspect the explanation or ask why.”* |
| **2:20–2:45** | Benchmark card showing verified metrics: 87.91 score, 39% exact, zero unbuildable. Synthetic evaluation disclaimer legible. | *“On 3,000 synthetic challenge golfers, the score was 87.91 out of 100, with 39 percent exact full specs and zero unbuildable recommendations. That measures recovery under the simulator, not agreement with a professional fitter. Lie remains the weakest component at 58.3 percent exact. Next, validate with real golfers and fitters, then connect the fit to a prefilled cart.”* |
| **2:45–3:00** | End card with Takomo Pocket Fitter branding and live URL. | *(No voice-over; dynamic brand card displayed.)* |

---

## Short teaser cut (~45 seconds)

> *“Imagine buying irons online and having to guess your swing speed. Pocket Fitter starts with a conversation, then adds measurements from your phone. A bank card helps measure hand length; three swings add tempo. For lie, mark a ball, hit a few shots, photograph the clubface and tap four points. The result is a buildable Takomo spec with reasons and confidence; close calls stay visible. Testing on synthetic challenge golfers is promising, but it isn't pro-fitter validation. Real-golfer testing and a direct cart handoff are next.”*

---

## Recording & production guidelines

1. **Chronological structure:** Golfer uncertainty $\to$ engineered solution $\to$ measurement journey $\to$ verified spec $\to$ roadmap.
2. **Honest footage:** Capture real UI interactions from the running Next.js application; avoid fabricated mockups.
3. **Privacy assurance:** Emphasize that all MediaPipe landmark extraction runs locally via WebAssembly on the device.
4. **Benchmark context:** Ensure the synthetic simulator evaluation disclaimer is legible whenever benchmark metrics are cited.

---

<div align="center">
  <sub>Takomo Pocket Fitter · Built with ❤️ for the <strong>Since AI Hackathon 2026</strong> in partnership with <strong>Takomo Golf</strong></sub>
</div>
