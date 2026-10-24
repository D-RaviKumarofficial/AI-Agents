# Championship Build Plan — GuardianLoop / HomeLoop

**Owner:** project lead · **Team cap:** 6 (competition rule) · **Compiled:** 22 October 2026
**Covers:** 22 Oct 2026 → Grand Final, first week of May 2027 (≈28 weeks)

---

## 1. What "10/10" means here

Ten out of ten is not a claim, it is a checklist. Every point below is either **built and measured** or **live on stage** by the Grand Final. A point that cannot be evidenced is a point lost.

| # | Point | Evidence artefact | Where |
|---|---|---|---|
| 1 | A **real, specific, painful** problem in Dubai, with primary sources | Evidence slide + one-page problem statement | Construction §2 / HomeLoop §1 |
| 2 | A problem the **jury can verify in 90 seconds** | Live demo beat 1 | Both §8 |
| 3 | The agent's **reasoning is visible**, not narrated | Agent Decision Trail panel | Both §8.2 |
| 4 | The agent **reads a real document** and acts on it | Permit-to-work parse / tenancy contract parse | Construction §6 / HomeLoop §6 |
| 5 | The agent **calls multiple external systems** | Inventory, roster, weather, contractor panel, work orders | Both §4 |
| 6 | The agent **changes its own plan** on evidence | Hypothesis falsification on stage | Construction §5 / HomeLoop §5 |
| 7 | The agent **rejects bad evidence** and says why | Seeded fake-closure set, ≥90% rejection | Both §9 |
| 8 | The agent **fails safe** when a tool breaks | Degradation beat + `MONITORING DEGRADED` | Construction §8.1 beat 4 |
| 9 | **Measured value** — numbers from a harness, not claims | Metrics slide, reproducible | Both §9 |
| 10 | A **priced business** with a named buyer and a pilot | Unit economics slide | Both §10 |

**The single number that wins the round:** *recurrence delta* — the same violation class per zone per day, seven days before vs. seven days after an agent-driven intervention. Nobody else in the market publishes it, because nobody else does the loop that produces it. Build it even if everything else slips.

---

## 2. Non-negotiable operating rules

1. **One product, one category.** Pick one entry. The other stays in the folder as a second submission only if the first is fully shipped and frozen.
2. **Scope freeze is binding.** Anything not in §8.1 (Construction) / §8.1 (HomeLoop) is a "later capability" slide. No exceptions in week 20.
3. **The demo must never die.** Every beat has a recorded fallback on a hotkey. No new feature is allowed into the demo after P5 (Week 19).
4. **Ship boring infrastructure early.** WhatsApp sandbox, model keys, deployment, and the recording harness are P0/P1 work, not "later".
5. **Use the Championship's free training.** Phase 01–02 (Nov–Dec 2026) includes 3 Agentic AI Series workshops, the Digital Academy, 4 build courses, 4 practical workshops and mentorship. It is explicitly recommended and it is free. Book it in week 1.
6. **One page per decision, not one document per document.** Keep a single `DECISIONS.md` with dated, reversible choices. The v3 docs are the source of truth for scope; the decision log is the source of truth for choices.

---

## 3. Week-by-week plan

### Phase A — Ground (22 Oct → 21 Nov 2026, W1–W5)

| Wk | Construction track | HomeLoop track | Both |
|---|---|---|---|
| W1 | Book every Championship workshop (Agentic AI Series ×3, Digital Academy, build courses, mentorship). Register for the platform. | Same | Same |
| W2 | **P0 sandbox proof**: WhatsApp Cloud API — send outbound voice note, receive inbound voice note, STT in 3 languages. **Hard gate R2** (no template carries audio). | **P0 legal grounding**: contract parser against real Ejari templates; code profile citations verified; **UAE property lawyer engaged** | Repo, CI, shared component library, decisions log |
| W3 | P1 agent core: orchestrator, policy engine, decision trail, 4 mocked tools | P1 agent core: orchestrator, policy engine, decision trail | Detectors selected; edge/device plan |
| W4 | P1 cont. + detector feed | P1 cont. + precondition scan | |
| W5 | P2 dialogue + evidence; seeded fake-closure set #1 | P2 responsibility agent + liability set | **Go/No-Go 1 (end W5)** |

**Go/No-Go 1 (W5).** If the WhatsApp voice loop (Construction) or the contract parser (HomeLoop) is not working end to end, **stop and reconsider the entry**. Do not push a broken channel into a January submission.

### Phase B — Build (Nov 2026 → Jan 2027, W6–W13)

| Wk | Milestone |
|---|---|
| W6–W7 | Evidence/verification layer complete. Seeded fake-closure rejection working. |
| W8–W9 | Root-cause pivot (Construction) / negotiation + scoped token (HomeLoop) working end to end |
| W10–W11 | Harness build: detector set, dialogue set, permission set, site-week simulation |
| W12 | Metrics reproducible. First full metrics run. **Go/No-Go 2 (end W12)** |
| W13 | Demo harness v1: all beats live, all fallbacks recorded, dress rehearsal 1 |
| **January 2027** | **Registration closes. Submit: working prototype, pitch deck, demo video.** |

**Go/No-Go 2 (W12).** If metrics are not reproducible, cut a demo beat and use the time. Do not submit an unreproducible number.

### Phase C — Accelerate & Compete (Jan → May 2027)

| When | What |
|---|---|
| **Jan 2027** | Semi-finalists announced (24). Tech Accelerator begins. |
| **Feb–Mar 2027** | Semi-final pitch training. Re-cut the deck to the feedback received. |
| **Mar 2027** | **Semi-final pitch day.** Demo live. |
| **Mar 2027** | 12 finalists announced. |
| **Apr 2027** | Intensive pitch training. **P5 hardening begins.** Close every gap a semi-finalist judge raised. |
| **Mar–May 2027** | Final countdown. Fully functional agent on stage — not an MVP. |
| **First week of May 2027** | **Grand Final.** |

---

## 4. Team shape (6 max)

| # | Role | Owns | Weeks |
|---|---|---|---|
| 1 | **Agent / backend lead** | Orchestrator, policy engine, tool layer, audit trail, decision trail | All |
| 2 | **Vision / ML engineer** | Detector integration, evaluation harness, false-negative analysis, metrics | All |
| 3 | **Frontend / UX** | Dashboard, decision trail, review queue, demo visuals | All |
| 4 | **WhatsApp & integrations** | Cloud API, STT/TTS, contractor/ERP flows, sandbox. **Owns the single biggest technical risk (R1/R2)** | W1–W6 critical, then support |
| 5 | **Domain advisor** (part-time) | HSE rules (Construction) or UAE property law + child safety (HomeLoop). Owns the P0 legal/code gate | W2 onward |
| 6 | **Pitch / comms** (part-time) | Deck, demo video, business model, script, rehearsal logistics | W8 onward |

**If you are short of people:** merge roles 5 and 6, and take the frontend as a template plus your own decision-trail component. Do **not** merge role 4 — that is the critical path.

---

## 5. Demo risk register

The most likely cause of losing this competition is a technical failure in front of the jury.

| Risk | Probability | Blast radius | Mitigation | Owner |
|---|---|---|---|---|
| WhatsApp API / business approval not granted in time | **High** | Total — the central demo beat | Apply for the test number in W1. If approval slips past W4, switch the demo to a local WhatsApp simulator with the identical message schema and say so | Integrations |
| Inbound voice note never arrives (media ID expiry, webhook misconfig, phone issue) | High | Beat 1 | Recorded fallback on hotkey. Also offer a **text reply path** as a designed alternative, not an improvisation | Integrations |
| TTS quality poor / wrong dialect | Medium | Beat 1 credibility | Pre-render and cache every (language × incident type) pair in W6. Never generate TTS on stage | Integrations |
| STT accuracy poor in a noisy dialect | Medium | Beat 1 | Measure it in the dialogue set; if a language is under 85%, drop it from the live demo and keep it in the product | ML |
| Detector fails on the staged clip (bad lighting) | Medium | Beat 1 | Use clips the detector has already been tuned on; pre-verify every demo clip before the rehearsal | ML |
| Model provider rate-limits or the model is down | Medium | Many beats | Abstract the model behind one interface. Keep one fallback provider configured | Agent lead |
| Laptop/network dies on stage | Low | Total | Run the whole demo on the local machine with a recorded fallback. Do not depend on venue wifi | Frontend |
| A tool error the agent mishandles | Medium | Credibility | The degradation beat is a *feature*: show the agent recovering. Never let an unhandled exception reach the UI | Agent lead |
| The jury asks something the demo cannot answer | Certain | — | Prepare a **Q&A bank**: who pays, what if the tool is wrong, what happens at 3am, is this a certification, what does it cost, who is the customer, what do competitors do | Pitch |

**Rehearsal protocol:** three full dress rehearsals, minimum. Run each with (a) a clean environment and (b) a deliberately broken environment, and record both. The broken-environment recording is the fallback.

---

## 6. Evaluation harness (build this once, reuse for both entries)

| Harness | Built in | Outputs |
|---|---|---|
| **Detector set** | W10 | precision, recall, false alerts per camera-hour |
| **Seeded adversarial set** | W6–W8 | % fake closures rejected (target ≥90%) |
| **Dialogue set** | W8–W10 | transcription / translation / extraction accuracy per language; clarifying-question rate |
| **Permission & consent set** | W9–W11 | % blocked (target 100%) |
| **Site-week simulation** | W11–W12 | recurrence delta pre/post intervention |
| **Degradation suite** | W11–W12 | % of induced failures where the agent asked a human instead of guessing (target 100%) |
| **Determinism check** | W12 | same input → same action, N=20 runs. Non-determinism in the *decision* is a bug, even if the *phrasing* varies |

**Reproducibility rule:** metrics come from versioned harness runs with a run ID on the slide. "Re-run the harness, get the same numbers" is a claim you can defend on stage.

---

## 7. Submission package (January 2027)

| Deliverable | Spec | Owner |
|---|---|---|
| **Working prototype** | Deployed URL + repo. The three beats must run for a stranger within 60 seconds. A judge who cannot reach it scores zero on "Validate". | Agent lead |
| **Pitch deck** | 12–15 slides max. Proposed order: 1 problem · 2 why now / why existing fails (competitor table) · 3 the agent loop (architecture) · 4 the four capabilities · 5 live demo anchor · 6 metrics · 7 business model · 8 pilot ask · 9 ask | Pitch |
| **Demo video** | 90–120 s, the four beats, no voiceover-required (add subtitles), no music bed, no marketing edits. Judges watch this while deciding who reaches the semi-final. | Pitch + Frontend |
| **One-pager** | Problem · agent · evidence · metrics · business model · the ask. Printed for judges. | Pitch |
| **Evidence appendix** | The citations in both docs, plus the competitor table, plus the metric definitions. Invites scrutiny rather than hiding from it. | Agent lead |

**On the video:** it is the single highest-leverage artefact in the whole competition and it is the most commonly neglected. A mediocre video with a strong agent loses to a strong video with an average agent, because most judges never see your live demo. Produce it in W12, not in the final week.

---

## 8. Judging preparation

| Pillar | Anticipated hard question | Your answer |
|---|---|---|
| **Identify** | "Isn't this just another PPE camera with a chatbot on top?" | "Correct — and that's why we don't compete on detection. [competitor table]. Here's the one number they can't produce: recurrence delta." |
| **Identify** | "Who is the customer, exactly? Name them." | Name the buyer role, the budget line, and the design-partner status honestly. If you have no pilot, say so and say when you will have one. |
| **Build** | "Is this an agent or a workflow?" | "Here's the moment it falsified its own hypothesis." Then the decision trail. |
| **Build** | "What if the model hallucinates?" | Point at the policy engine, the permission set (100% blocked), and the fact that the agent may not close its own case. |
| **Build** | "How is this different from your last three ideas in this folder?" | Show the scope freeze and the decision log. One product, frozen. |
| **Validate** | "Your metrics are on your own test set." | "Yes, and here are the hard negatives in it, and here is what I did not test." Name the limitation before they do. |
| **Validate** | "Is it a certification?" | "No. It is a system-generated record. Here is what it does not claim." |
| **Business** | "What if viAct ships this next quarter?" | "They'd have to build the dialogue loop, the evidence taxonomy and the recurrence dataset. The dataset takes months of site data. The evidence taxonomy takes an adversarial harness. Speed to copy is low; speed to *defend* is high." |
| **Societal/ethics** | "You're filming workers." | Lead with: no facial recognition, no individual scoring, no disciplinary output, crew-level analysis only, published data policy. Then the demo. |
| **Everything** | "What did you actually build?" | The prototype URL. Nothing else. |

---

## 9. Risk of the whole plan

| Risk | Mitigation |
|---|---|
| **Scope explosion** — every idea in the folder is attractive, and the competition rewards breadth | Freeze at W12. The v3 docs list OUT explicitly for this reason |
| **No real user access** — no contractor, no family, no pilot | Start the conversations in W2, not after the build. A signed "design-partner intent" letter is worth a lot to a jury and takes one email |
| **Legal exposure** on HomeLoop (tenant/landlord advice) | P0 lawyer gate. The agent cites its basis and requires family confirmation. Never auto-send |
| **Nothing built** — the folder currently contains documents, not software | W1 ends with a running repo, not a document. This is the single biggest threat to the whole entry |
| **Idea shopping** — swapping entries late | Set the go/no-go at W5 and W12, then stop. Both entries are viable; churning between them wastes the calendar |

---

## 10. Immediate next 7 days

| # | Task | Owner | Done when |
|---|---|---|---|
| 1 | Register on the Championship platform and book every Nov–Dec workshop | Lead | Booked |
| 2 | **Choose the entry**: Construction (Business) or HomeLoop (Societal). Commit. | Lead | Written decision, dated |
| 3 | Apply for a WhatsApp Business test number and Cloud API sandbox | Integrations | Outbound + inbound voice note proven end to end |
| 4 | Stand up the repo: agent core skeleton, policy engine, append-only decision trail | Agent lead | A "hello" hypothesis that logs and persists |
| 5 | Book 5 user conversations: 3 HSE officers/supervisors (Construction) or 3 families + 1 property manager + 1 UAE property lawyer (HomeLoop) | Domain advisor | 5 booked, 3 held |
| 6 | Get the 5 selected vision models and inference stack wired to a webcam | ML | Frame in, detector output out |
| 7 | Write `DECISIONS.md` and the scope-freeze list | Lead | Committed to git |
| 8 | Set up the **recording harness**: screen + phone capture, auto-clip per beat | Frontend | A 4-beat rehearsal recorded end to end |

---

## 11. Documents

| File | Status |
|---|---|
| `Ideas/guardianloop_construction_welfare_agent_v3.md` | **Current** — flagship entry candidate (Best Business AI Agent) |
| `Ideas/guardianloop_child_home_safety_agent_v3.md` | **Current** — second candidate (Best Societal AI Agent) |
| `Ideas/guardianloop_ai_construction_worker_welfare_agent_upgraded.md` | Superseded — archive |
| `Ideas/guardianloop_ai_child_home_safety_agent_upgraded.md` | Superseded — archive |
| `Ideas/Construction Site Safety Agent_Requirements.md` | Superseded — archive (keep for the §13 evaluation metrics, which are folded into v3) |
| `Ideas/guardianloop_ai.md` | Superseded — archive |
| `Ideas/CareGuard_AI_Requirements.md` | **Dropped** — out of the competition |
| `Ideas/AgentTrust.md` | Parked — strong second idea if the primary fails at W5 |
| `Ideas/CircleLoop.md` | Parked — viable third, has real datasets in `UAE Waste Classification(Circle Loop)/` |
| `Ideas/accessmate_uae.md`, `Ideas/heatshield_ai.md` | Parked / dropped |
| `Ideas/CHAMPIONSHIP_BUILD_PLAN.md` | **Current** — this file |
