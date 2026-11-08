# Demo video pitch — Takomo Pocket Fitter

**Live app:** https://takomo-fitter.web.app/  
**Main cut:** up to 3 minutes  
**Short cut:** about 45 seconds

The main cut follows both journeys: why the trust gap matters to a golfer, and how the build connects conversation, phone measurements and a fitting engine. Let the footage breathe; the exact edit can run shorter than three minutes.

## Main cut (up to 3 minutes)

| Time | Picture | Voice-over |
|---|---|---|
| 0:00–0:25 | Open on a golfer facing the fitting page. Show the speed question or a moment of hesitation, then the Takomo fitter. | “Imagine buying irons online. The fitter asks your swing speed; you don't know it, so you guess. The result gives a spec without showing why. If it calls for custom, it can't be returned. Takomo had over 600,000 online fittings in six months; more than 25 percent of iron orders already use the fitter.” |
| 0:25–0:54 | Cut to the challenge brief, Takomo product data, a simple view of the five fitting decisions, then actual build or app clips. | “The challenge: make online fitting feel closer to an hour with a professional. From Takomo's catalog and fitting rules, we mapped five choices: head, shaft, length, lie and grip. Ilmari gathers the golfer's context, phone tools add measurements, and the engine turns both into a buildable spec. Keeping the engine as the source of truth means its reasons match what the voice and screen say.” |
| 0:54–1:22 | Start a live fit. Show Ilmari asking questions, the golfer answering, and the first spec appearing. Then hand beside a bank card and the measurement result. | “Follow one golfer. They tell Ilmari what they want from new irons and their usual miss. A first 7-iron read appears. A bank card gives the camera a known scale for hand length, which helps set grip size. Three swings add tempo. Each measurement recomputes the fit; you can see what changes and what stays. Body measurements or launch monitor data can add evidence too.” |
| 1:22–1:51 | Show a marked ball, a few actual shots, the clubface photo and the four taps. Include the on-device measurement screen. | “For lie, draw a line on a ball, hit at least three 7-irons, photograph the clubface, then tap the line ends, heel and toe. Four points estimate whether the toe was up or down at impact. Body, hand and swing images are analyzed on the phone; only measurements go to the engine.” |
| 1:51–2:20 | Show the final spec, reasons and confidence labels. Pause on a close call, next-test suggestion, then stock/custom advice. | “At the end, the golfer sees a buildable Takomo spec: head, shaft, length, lie and grip. Each part has a reason and a confidence level. Close calls and runner-ups stay visible, with a suggested next measurement. The screen explains the trade-off: stock sets keep the 30-day return window; custom is made to order and can't be returned. The golfer can inspect the explanation or ask why.” |
| 2:20–2:45 | Show a simple benchmark card with the caveat legible. Finish on the fit result and a “Next: real-golfer validation + cart handoff” end card. | “On 3,000 synthetic challenge golfers, the score was 87.91 out of 100, with 39 percent exact full specs and zero unbuildable recommendations. That measures recovery under the simulator, not agreement with a professional fitter. Lie remains the weakest component at 58.3 percent exact. Next, validate with real golfers and fitters, then connect the fit to a prefilled cart.” |
| 2:45–3:00 | Hold on Takomo Pocket Fitter and the live app address. | *(No voice-over; leave the result on screen.)* |

## Short cut (~45 seconds)

> “Imagine buying irons online and having to guess your swing speed. Pocket Fitter starts with a conversation, then adds measurements from your phone. A bank card helps measure hand length; three swings add tempo. For lie, mark a ball, hit a few shots, photograph the clubface and tap four points. The result is a buildable Takomo spec with reasons and confidence; close calls stay visible. Testing on synthetic challenge golfers is promising, but it isn't pro-fitter validation. Real-golfer testing and a direct cart handoff are next.”

## Recording and editing notes

- Keep the story in this order: golfer's uncertainty → what we built → a golfer's fitting journey → result and trade-offs → evidence and next step.
- Use real project footage for the build section: the challenge brief or product catalog, actual app screens, measurement work and fitting output. Avoid invented hackathon anecdotes or staged claims about iteration.
- Let screens carry detail. Don't narrate every button or answer. If a beat is missing from the footage, cut that line rather than implying the feature was shown.
- The ball-line test needs a marked ball, actual shots, a clubface photo and four manual taps. If the edit doesn't show that sequence, omit the beat; the app does not infer lie from a swing clip.
- Body, hand and swing image analysis runs on-device; those frames are not sent to the fitting API. Voice is handled by ElevenLabs. The privacy claim applies to those phone camera paths.
- The fitting covers 7-irons. Shopify cart line-item handoff is not implemented. Do not imply a direct-to-cart order flow or validation against professional fitters.

## Benchmark context

The score comes from the challenge lab's synthetic simulator, not real-golfer or pro-fitter agreement. On the development evaluation (`n=3,000`), Pocket Fitter scored 87.91 / 100, achieved 39.0% exact full-spec matches, and produced zero unbuildable specs. Lie was the weakest component at 58.3% exact. The questionnaire baseline scored 77.1 / 100 with 13.7% exact full-spec matches. Keep the synthetic-evaluation caveat attached to any metric shown.

**Live app:** https://takomo-fitter.web.app/  
**Repository:** https://github.com/0xMuluh/takomo-fit  
**Demo video link:** not yet listed in the project documentation.
