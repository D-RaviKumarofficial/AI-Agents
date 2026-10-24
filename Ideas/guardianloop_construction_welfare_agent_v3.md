# GuardianLoop AI — Autonomous Construction Welfare & Resolution Agent

| | |
|---|---|
| **Product** | GuardianLoop AI — v3.0 "Agent-Core" Edition |
| **Target Category** | Best Business AI Agent (societal impact as the *why*, business as the *category*) |
| **One-line thesis** | Detecting a missing helmet is commodity software. **Closing the loop — deciding why it keeps happening, acting on it, and proving the action worked — is not.** GuardianLoop is an autonomous resolution agent for Gulf construction sites. |
| **Core claim** | The agent's *reasoning, tool use, evidence rejection and replanning* are the product. Vision is one sensor input, not the product. |
| **Prepared** | 22 October 2026 |
| **Supersedes** | `guardianloop_ai_construction_worker_welfare_agent_upgraded.md` (v2.0) and `Construction Site Safety Agent_Requirements.md` (v1.0) |

---

## 0. Scorecard against the competition's own criteria

The Championship asks three questions: **Identify** (real problem, people, outcome) · **Build** (how it reasons, plans, uses tools, acts) · **Validate** (need, business potential, measurable impact). This table is a self-assessment with the evidence location for each claim — deliberately not a "9.6/10" headline.

| Pillar | Claim | Where it is evidenced | Jury artefact |
|---|---|---|---|
| **Identify** | Unacted and unexplained safety violations are the real failure on Gulf sites, not undetected ones | §2, §3 | Live demo beat 3: agent falsifies its own first hypothesis |
| **Build** | 3 autonomous agents + 1 deterministic policy engine; agent reads documents, calls external systems, rejects evidence, replans, degrades safely | §4, §5, §6, §7 | Live demo: Agent Decision Trail on screen (§8.2) |
| **Validate** | 6 published metrics on a built test harness; before/after recurrence delta; priced business model with a named buyer | §9, §10 | Metrics slide + unit economics slide |

---

## 1. Competitive reality: what is commodity, what we own

This section is load-bearing. Most construction-AI pitches fail because they sell what already ships.

**Commodity — do not claim it as differentiation:**

| Already sold in the UAE/GCC market | Who |
|---|---|
| PPE detection, polygon zones, sub-second alerts, audit-grade evidence, on-device/edge inference | **viAct** (UAE-based, industrial safety; also ships heat-stress & fatigue indicators, WhatsApp/SMS alerts, and an "EHS AI Agent" layer) |
| PPE detection, camera hardware + software, Procore / Autodesk construction-cloud integrations | **TrueLook TrueAI** |
| Hardhat detection with ~20k annotated images, 5-frame confirmation, <500ms p99, on-device | **SafeSight** / safesight-ai.app |
| 24/7 site monitoring, PPE detection, dashboards | **Forsight.ai** |
| City/enterprise-scale video intelligence | **Presight AI** (Abu Dhabi), **Safe City Group** |

**Ours — the defensible four.** No competitor ships any of these:

| # | Capability | Why it is hard to copy |
|---|---|---|
| **C1** | **Native-language voice response loop** — supervisor speaks Hindi/Urdu/Arabic by voice note; the agent *asks follow-up questions*, extracts structured corrective action, and triggers re-verification | Needs dialect STT + agent dialogue + structured extraction + WhatsApp media pipeline. Vendors send *alerts*; nobody closes the loop by voice. |
| **C2** | **Evidence rejection** — the agent refuses to close a case on a claim, and states which independent evidence is missing | Requires a formal evidence taxonomy (§7) and seeded adversarial tests (§9.3). Vendors assume the alert *is* the record. |
| **C3** | **Root-cause autonomy** — correlates recurrence with weather, PPE stock, shift roster and handover records, then *acts* (restock, schedule cooling, brief crew) | Cross-system reasoning over 4 heterogeneous sources, with a safe action layer. Vendors count violations; none explains or remediates. |
| **C4** | **Permit-to-work rule derivation** — parses the day's permit/schedule documents and *mutates its own zone rules* for that window | Document→config autonomy. Static rule engines cannot do this. |

**Positioning sentence (use verbatim on the title slide):**
> *viAct tells you the helmet is off. We tell you the PPE rack is empty because a new crew started at 2 PM in 43°C heat — we fix it, and we prove it was fixed.*

---

## 2. The problem, stated as an operator would state it

A HSE officer on a Gulf site does not lack alerts. viAct, TrueLook and SafeSight all generate thousands. What the operator actually cannot do today:

1. **Get an answer in the field.** Supervisors work in 42–46°C heat, in safety gloves, on a site where typing free-text corrective action into an English web dashboard is a real barrier. Most corrective-action fields end up empty.
2. **Know why it recurs.** If 15 workers in Zone C remove helmets at 13:30, the usual conclusion is "worker negligence". The usual cause is something else: no spare PPE at the zone gate, a new subcontractor crew with no safety handover, or heat stress driving behaviour.
3. **Trust the closure.** "Done" is a text message. A thumbs-up to the camera is a gesture. Neither is evidence that the hazard stopped. Vendors' dashboards cannot tell the difference between *reported* and *resolved*.
4. **Prove compliance.** Midday-break (12:30–3:00, 15 June – 15 September, MoHRE) obligations are enforced, but the evidence a contractor holds is scattered across WhatsApp threads and spreadsheets.

**Outcome the agent is accountable for:** *a reduction in recurrence of the same violation class after an intervention, with a timestamped, auditable trail of who did what and what evidence closed it.*

---

## 3. Why this is an agent problem, not a vision problem

Detection produces a *candidate*. A candidate is not a problem statement. The work that matters is:

- **Interpret** a candidate against context (what permit was in force? which crew? what was the weather? was PPE in stock?).
- **Decide** whether this is a worker behaviour issue, a capacity issue, a heat issue, an onboarding issue, or a camera/rule misconfiguration — and be willing to **falsify its own first hypothesis**.
- **Act** through systems that are not yours (vendor messaging, inventory, rosters, work orders) inside explicit limits.
- **Verify** with independent evidence, not the claimant's word.
- **Learn operationally**: after the intervention, measure whether that violation class came back.

A rule engine can do none of steps 3–5. A dashboard can do none of them. **This is why the agent is the product.**

---

## 4. Architecture: three agents, one deterministic policy engine

```
┌─ SENSORS (interchangeable, replaceable, none is the product) ────────────┐
│  Camera frames + detector output   Permit-to-Work / schedule PDF        │
│  Supervisor WhatsApp voice note     Weather feed (air temp + humidity)  │
│  Site photo (EXIF)                 PPE inventory / stock register      │
│  Shift roster & handover record     Zone configuration (human-owned)    │
└───────────────┬─────────────────────────────────────────────────────────┘
                ▼
┌─ POLICY ENGINE (deterministic, NOT an LLM, cannot be overridden) ──────┐
│  Thresholds · escalation timers · spend caps · safety interlocks      │
│  Sunbreak enforcement · redaction rules · retention · kill-switch      │
└───────────────┬─────────────────────────────────────────────────────────┘
                ▼
┌─ AGENT LAYER ──────────────────────────────────────────────────────────┐
│                                                                        │
│  AGENT 1  RESOLUTION ORCHESTRATOR  (the brain)                         │
│    hypothesis formation → tool selection → replan → degrade safely      │
│        │                                                               │
│        ├──► AGENT 2  DIALOGUE AGENT (the field channel)                │
│        │      outbound voice note (native language) · multi-turn         │
│        │      dialogue · inbound STT + translation · structured         │
│        │      corrective action · vendor negotiation                    │
│        │                                                               │
│        └──► AGENT 3  EVIDENCE & VERIFICATION AGENT (the truth layer)   │
│               evidence taxonomy (§7) · staleness & spoof checks ·        │
│               re-verification requests · escalation to human review      │
│                                                                        │
│  AUDIT + AGENT DECISION TRAIL (append-only; every hypothesis, tool      │
│  call, rejected evidence, pivot and action is recorded)                 │
└───────────────┬─────────────────────────────────────────────────────────┘
                ▼
        Contractor systems: inventory · rosters · work orders · vendor WhatsApp
```

**Design rules that make this agentic and not a workflow:**

| Rule | Consequence in the demo |
|---|---|
| **The orchestrator holds no rules** — it holds *hypotheses*. Rules live in the policy engine. | You can watch the agent change its mind. |
| **Every action must be justified by a tool result** | No narration without evidence. |
| **Failure of any sensor or tool degrades the agent, it does not stop it** | Tool-down beat (§8.2) shows `MONITORING DEGRADED`, never `ALL CLEAR`. |
| **The agent may not close its own case** | Closure requires Evidence Agent sign-off (§7). |
| **The agent may not spend, notify outside policy, or contact workers' personal numbers** | Spend caps and contact allowlists in the policy engine. |

---

## 5. The agent loop

```
  OBSERVE     Gather candidate + context. Tag every input with source, timestamp, freshness.
  INTERPRET   Build a structured observation. Record confidence and explicit unknowns.
  HYPOTHESISE Form a named hypothesis about cause ("capacity", "heat", "onboarding", "behaviour", "misconfiguration").
  INVESTIGATE Call tools to test the hypothesis. Rule out before ruling in.
  ACT         Execute within policy limits: notify, brief, restock, schedule, record.
  VERIFY      Demand independent evidence of the state change. Reject claims without it.
  RECUR       After the window, re-measure recurrence for that violation class.
  AUDIT       Append everything to the decision trail. Escalate to human if policy says so.
```

**The pivots that must appear on stage (these are the product):**

| Pivot | Trigger | Result |
|---|---|---|
| **Behaviour → Capacity** | 6 violations in Zone C in 45 min | Inventory query returns `0 helmets at Gate C` → hypothesis "capacity" replaces "behaviour" → restock dispatched. *No disciplinary output is ever produced.* |
| **Violation → Noise** | Same detector pattern, 4 cameras | Camera angle/lighting analysis shows a crane shadow → the agent *withdraws* its own event and marks the rule as needing retuning. Demonstrates the agent correcting itself. |
| **Claim → Open** | Supervisor voice note "done" | Evidence Agent finds no independent evidence → case stays open, re-alert with the specific missing evidence. |
| **Beat → Graceful degradation** | Inventory API returns 500 | Agent cannot test the capacity hypothesis → records `UNKNOWN`, asks the human instead of guessing, dashboard shows degraded. |

---

## 6. Tool catalogue

| Tool | Purpose | Guardrail |
|---|---|---|
| `read_sensor_feed` | Pull detector output, camera frames, photo metadata | Frame cap, freshness TTL, no facial recognition, no biometric ID |
| `parse_permit_documents` | Parse the day's permit-to-work / schedule / handover PDF into structured windows and zones | Read-only. Output feeds the *policy engine*, which validates before any rule changes. Agent proposes, engine disposes. |
| `read_zone_config` | Current zone polygons, required PPE, schedules, severity | Read-only |
| `query_weather` | Air temperature, humidity, and a **declared heat-stress proxy index** with its formula and source | Must NOT be labelled WBGT unless sourced from a WBGT-grade provider (see §13 R3) |
| `query_ppe_inventory` | Stock by zone, gate, and item; consumption rate | Read-only. Must handle failure as `UNKNOWN`, never as `0` |
| `query_shift_roster` | Crew composition, joining dates, briefing records | **Crew/company level only.** No individual scoring, no discipline output, no biometric ID |
| `record_hypothesis` | Log candidate cause, supporting/contradicting evidence | Agent cannot write a disciplinary conclusion |
| `send_multilingual_voice_alert` | Outbound voice note in the supervisor's configured language | Approved language set; pre-rendered TTS cache; **cannot be a WhatsApp template** (see §13 R2); spend/contact allowlist |
| `receive_voice_reply` | Inbound voice note → STT → translation → structured extraction | Media fetched on arrival (7-day ID expiry); PII redaction before storage; text fallback always offered |
| `ask_clarifying_question` | Multi-turn agent dialogue to disambiguate the corrective action | Max turn budget to prevent loops |
| `dispatch_work_order` | Create restock / cooling / briefing task in site systems | Spend cap per day; approval required above threshold; idempotency key to prevent duplicates |
| `negotiate_vendor_slot` | Multi-turn WhatsApp negotiation with a maintenance vendor for a slot/quote | Pre-approved vendor allowlist; hard price ceiling; no binding commitment without human approval |
| `evaluate_evidence` | Apply the evidence taxonomy (§7) to a candidate proof | Only the Evidence Agent may return `SUFFICIENT` |
| `request_reverification` | Ask for a specific missing artefact (fresh photo, different camera, sensor state) | Bounded retries (max 2) then escalate |
| `measure_recurrence` | Re-count the violation class in the zone over a trailing window | Fixed window definition; separates observed from estimated |
| `emit_compliance_log` | Timestamped midday-break / permit-compliance evidence record | Labelled **"system-generated record"** — never "certificate", never "compliance certification" |
| `escalate_to_human` | Hand to HSE review queue with full decision trail | Terminal state until a human acts; auto-escalates on timer |

---

## 7. Evidence taxonomy — the truth layer

This is the core of C2 and the most defensible part of the system. A case may close only on `SUFFICIENT` evidence for the specific hazard class.

| Evidence type | Example | Acceptable to close? |
|---|---|---|
| **Direct state observation** | Camera frame shows helmet on head, in-zone, within tolerance, after the action | **Yes** — subject to freshness + geometry |
| **Sensor state** | Gate/lock sensor reads `LOCKED`; water dispenser reads `RESTOCKED` | **Yes**, if the sensor is not the same subsystem being gamed |
| **Third-party confirmation** | Approved vendor system confirms job completion with timestamp + reference | **Yes**, if the vendor reference is independently retrievable |
| **Fresh photo with metadata** | EXIF timestamp within window, geofence matches zone, subject visible | **Conditional** — requires subject/geometry check |
| **Voice/text claim** | "Done", "gave him a spare helmet", "handled" | **No** — claim only |
| **Gesture** | Thumbs-up, nod, peace sign | **No** — explicitly rejected, by design |
| **Stale evidence** | Photo from 6 hours ago, frame from before the action window | **No** — must be `STALE` |
| **Ambiguous evidence** | Head occluded, worker out of frame, low light, blur | **No** — must be `INCONCLUSIVE` → human review |
| **Absence of evidence** | No new frame, camera offline | **No** — must be `NO_EVIDENCE` → never `RESOLVED` |

**Rule:** `NO_EVIDENCE` and `INCONCLUSIVE` may never transition to `CLOSED` automatically. They route to human review with a named list of what is missing.

---

## 8. Demonstration design

### 8.1 Four beats, two minutes

| Beat | Time | What the audience sees | What it proves |
|---|---|---|---|
| **1. Voice-native response** | 0:00–0:30 | Detector fires in Zone C. The agent sends a **Hindi voice note** to the supervisor. The supervisor (a real phone on stage, or a pre-recorded reply as fallback) answers: *"Maine use pehle se hi helmet de diya tha"* ("I already gave him a helmet"). The agent asks a **follow-up question** — *"Was the Gate C rack stocked?"* — because the reply did not tell it. | Agent conducts dialogue, not form-filling. It knows what it still does not know. |
| **2. Claim rejected** | 0:30–0:55 | The supervisor's reply contains "done". The Evidence Agent requests fresh proof, gets an image, evaluates it, and **rejects closure** on two stated grounds (stale timestamp / subject not in frame). Case stays open. | The system does not believe people. |
| **3. Root-cause pivot** | 0:55–1:25 | Agent opens a case on 6 violations in Zone C. Hypothesis #1: *worker behaviour*. It queries inventory → `0 helmets at Gate C`. **Hypothesis falsified on screen.** It queries weather → 43°C. It queries roster → new crew joined 13:00, no handover record. New hypothesis: *capacity + onboarding + heat*. It dispatches a restock work order (under spend cap) and books a cooling break. **No disciplinary artefact is produced.** | Cross-system autonomous reasoning + a visible pivot + safe action. |
| **4. Degradation + value** | 1:25–2:00 | A tool fails. The agent marks the affected hypothesis `UNKNOWN`, requests a human answer, and the dashboard shows `MONITORING DEGRADED`. Cut to the metrics + unit-economics slide. | The system fails safe and is honest about it. |

### 8.2 The Agent Decision Trail — the highest-leverage UI decision

Beside the dashboard, show a live **decision trail**: every hypothesis, every tool call with arguments and result, every rejected evidence item and the reason, every pivot, every action with its policy check, every escalation. It updates as the demo runs.

Judges must *see the thinking*. A dashboard that just changes state proves a workflow. A trail that shows the agent falsifying its own hypothesis proves an agent.

### 8.3 Demo harness and failure fallback

- **Real**: WhatsApp Cloud API on a Meta-approved test number; one real phone on stage; live detector on staged clips; live policy engine.
- **Mocked with a clean seam**: PPE inventory, shift roster, work-order system (local SQLite services with realistic latency and one injectable failure).
- **Real third-party**: weather (public feed).
- **Fallback**: every beat has a **pre-recorded capture** with a single hotkey. If the network or the phone dies, the judge sees the same beat from the recording and the agent continues narrating. Never let a live failure end the demo.
- **Outbound TTS**: pre-rendered and cached per (language, incident type). Only the **inbound** leg is live. Do not generate TTS on stage.

---

## 9. Evaluation plan — the "Validate" pillar

Built harness, real numbers, reproducible. All figures below are **to be produced**, not claimed.

### 9.1 Test sets

| Set | Size | Contents |
|---|---|---|
| **Detector set** | 100 annotated clips (30 in-frame helmet-absent, 30 helmet-present, 40 hard negatives: caps, hoods, distant, occluded, low light, crane shadow) | Precision, recall, false alerts per camera-hour |
| **Seed set** | 20 deliberately seeded fake closures — text claim, thumbs-up gesture, stale photo, photo of the wrong object, cropped frame, correct-looking but wrong zone | % correctly rejected (target: ≥ 18/20) |
| **Dialogue set** | 30 scripted supervisor replies in Hindi/Urdu/Arabic + 10 code-mixed + 5 noisy | Transcription accuracy, translation accuracy, structured-extraction accuracy, clarifying-question rate |
| **Site-week simulation** | 1 simulated week, 3 zones, injected violation classes, one intervention | Recurrence delta before vs. after intervention |
| **Permission set** | 20 attempts to make the agent exceed scope (spend beyond cap, contact a personal number, contact an individual worker, close without evidence) | % correctly blocked (target: 20/20) |

### 9.2 Metrics

| Metric | Definition | Baseline to compare against |
|---|---|---|
| Detection precision / recall | On the detector set | The stock detector's own reported numbers, re-measured on your clips |
| False alerts per camera-hour | Raised but not agreed as valid | Same |
| **Acknowledgement time** | Detection → recorded corrective action | Manual WhatsApp thread (reconstructed) vs. agent loop |
| **Documented-action rate** | Events closed with a structured, human-attributable action | Baseline: vendor dashboards (claim-only) |
| **False-closure rejection rate** | % of seeded fake closures rejected | Target ≥ 90% |
| **Recurrence delta** | Violations per zone per day, 7 days before vs. 7 days after the intervention | Pre-intervention baseline |
| **Tool-call efficiency** | Median tool calls per resolved case | — |
| **Degradation correctness** | % of induced tool failures where the agent asked for human input instead of guessing | Target 100% |

### 9.3 What the numbers must never be used to claim

Not safety certification, not regulatory compliance, not "site is safe", not a clinical/industrial incident reduction rate without a controlled pilot, and no individual worker performance scoring (§13 R6).

---

## 10. Business model

**Buyer:** the contractor's HSE / project management lead. **Budget line:** safety compliance, and increasingly the insurance premium and the cost of a recordable incident.

| | |
|---|---|
| **Model** | B2B SaaS, per site, per zone tier |
| **Price** | AED X per zone per month (set after first 5 paid design-partner quotes; benchmark against viAct / SafeSight enterprise quotes — **do not publish a number you have not validated**) |
| **Cost to serve** | Edge inference hardware on site (amortised), WhatsApp conversation charges, STT minutes, support hours |
| **Modules** | M1 Welfare & Root-Cause (flagship) · M2 Permit & Compliance Evidence · M3 Incident & Insurance Evidence Pack |
| **Expansion** | Additional zones, additional sites, then the developer's portfolio as a single contract (Emaar, Aldar, Nakheel, and the Tier-1 contractors who build for them) |
| **Moat** | C1–C4 (§1) plus the accumulated recurrence dataset: the longer it runs, the better it explains *why* violations recur on Gulf sites. That dataset is the real asset. |
| **Wedge for the first 3 customers** | Free/low-cost design-partner pilot on one live site for 60 days, in exchange for the recurrence dataset and a reference. |

**Pilot is the validation.** One real contractor, one real site, 60 days, one measured recurrence delta. That single number is worth more to a jury than any slide.

---

## 11. Risks and mitigations

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| **R1** | Live WhatsApp/STT fails on stage | **High** | Pre-recorded fallback per beat, single hotkey; cached outbound TTS; text reply path always available |
| **R2** | **Voice notes cannot be sent as WhatsApp templates** — an outbound voice alert only works inside an open 24-hour service window | **High** | Design the flow so the supervisor's shift-start message opens the window; the agent replies inside it. Verify this in a sandbox **now**, before building anything else |
| **R3** | Weather feed is not WBGT-grade | **High** | Call it a declared heat-stress proxy with the formula shown; never label it WBGT. Use WBGT only from a WBGT-grade source |
| **R4** | Competitors (viAct, SafeSight, TrueLook) ship a big feature set fast | **High** | Compete only on C1–C4; publish the §9 metrics that vendors do not publish (false-closure rejection rate, recurrence delta) |
| **R5** | Scope explodes; nothing is finished by Jan 2027 | **High** | §12 scope freeze is binding. Anything not in it is a "later capability" |
| **R6** | Worker-surveillance perception / misuse for discipline | **High** | Crew-level only; no disciplinary artefact is ever produced; no individual scoring; no facial recognition by default; publish the data policy |
| **R7** | "Compliance certificate" overclaim | Medium | Always "system-generated record"; never certification. §6 `emit_compliance_log` |
| **R8** | Autonomous procurement is unacceptable to HSE | Medium | Per-site daily spend cap; approval above threshold; idempotency keys; full audit |
| **R9** | Detector quality below incumbents | Medium | Do not compete on detection. Buy/open-source a proven detector; the demo's credibility comes from the agent loop. Report honest numbers on your own 100 clips |
| **R10** | Deterministic policy engine is bypassed by the LLM | Medium | Policy checks live in code, not prompts; the agent cannot write policy; every action passes through the engine and is logged |
| **R11** | Midday-break enforcement is legally the contractor's, not the agent's | Medium | The agent schedules and logs; it does not adjudicate compliance. Say so plainly |
| **R12** | Nobody on site will speak into a phone for a demo | Medium | Pre-recorded reply fallback + a staged real supervisor |

---

## 12. Build plan and scope freeze

### 12.1 Frozen scope — the MVP is exactly this and nothing else

**IN:** 1 site, 3 zones, 1 violation class (helmet), 3 languages (Hindi, Urdu, Arabic), 1 detector (open-source, off-the-shelf), 1 permit-document parser, 1 dialogue loop, 1 evidence/verification layer, 1 root-cause investigation over 3 mocked systems, 1 work-order dispatcher with spend cap, decision trail, metrics harness, dashboard.

**OUT (explicitly later, and said so on stage):** facial recognition; individual worker tracking; 4+ languages; edge hardware optimisation; >1 site; drone/LiDAR; contractor-bidding; full ERP integration; SMS/voice-call fallback channel (WhatsApp only); formal ERP/Oracle/SAP connectors; automatic hiring or performance decisions.

### 12.2 Phases

| Phase | Weeks | Deliverable | Gate |
|---|---|---|---|
| **P0 Sandbox proof** | W1–W2 | WhatsApp Cloud API sandbox: send an outbound voice note; receive an inbound voice note; STT in 3 languages | **Hard gate. If R2 (template/window constraint) fails, redesign the channel before writing any agent code.** |
| **P1 Agent core** | W3–W6 | Orchestrator + policy engine + decision trail + 4 mocked tools + detector feed | Agent falsifies one hypothesis on a scripted scenario |
| **P2 Dialogue + evidence** | W7–W10 | Voice loop, structured extraction, evidence taxonomy, seeded fake-closure rejection | ≥ 18/20 seeded closures rejected |
| **P3 Root cause + actions** | W11–W13 | Inventory/roster/weather, hypothesis pivot, work-order dispatch under spend cap | Pivot visible on the decision trail |
| **P4 Harness + metrics** | W14–W16 | Detector set, dialogue set, permission set, site-week sim | §9 metrics reproducible |
| **P5 Demo hardening** | W17–W19 | Recorded fallbacks, hotkeys, dress rehearsal, 3x run-through | Zero unrecorded failure paths |
| **P6 Submission** | W20 | Pitch deck, demo video, one-page business model | **Registration closes January 2027** |

### 12.3 Team shape (max 6 per the rules)

| Role | Focus |
|---|---|
| Agent/backend lead | Orchestrator, policy engine, tool layer, audit trail |
| Vision/ML engineer | Detector integration, evaluation harness, false-negative analysis |
| Frontend/UX | Dashboard, decision trail, review queue, demo visuals |
| WhatsApp/integration engineer | Cloud API, STT, vendor flows, sandbox setup (owns R1/R2) |
| HSE domain advisor (part-time) | Rule set, intervention design, metric validity, pilot site access |
| Pitch/comms (part-time) | Deck, video, business model, demo script |

---

## 13. Out-of-scope commitments and honesty rules

State these on stage; they are credibility assets with a safety-literate jury:

1. The agent **does not certify safety**, does not certify regulatory compliance, and never displays "site safe".
2. The agent **never closes a case on a human claim** — claims are inputs, not evidence.
3. The agent **never produces a disciplinary artefact** and never scores an individual worker.
4. The agent **does not diagnose heat illness** and does not tell a worker to continue working.
5. When any sensor or tool is unavailable, the agent says so and asks a human. It never infers a safe state from missing data.
6. Heat indices are **declared proxies** with their formula, not WBGT unless WBGT-sourced.
7. Every figure on the metrics slide comes from the harness in §9 and is reproducible.

---

## 14. Sources

**Competition**
- Dubai Chambers, *Create AI Agents Championship*: https://www.dubaichambers.com/en/web/dubai-chamber-of-digital-economy/create-ai-agents

**UAE regulation and safety**
- UAE Government, *Health and safety at workplace* (midday break 12:30–15:00, 15 June – 15 September): https://u.ae/en/information-and-services/jobs/health-and-safety-at-workplace
- UAE Ministry of Human Resources and Emiratisation, rest stations for delivery workers (June 2025): https://absher.mohre.gov.ae/en/media-centre/news/10/6/2025/over-10000-rest-stations-provided-for-delivery-workers-across-the-uae-throughout-the-midday-break-period.aspx
- UAE Ministry of Human Resources and Emiratisation, *Social Protection and Well-Being Assurance*: https://observatory.mohre.gov.ae/en/uae-labour-market-priorities/social-protection-and-well-being-assurance
- WHO, *Workplace heat stress* (22 August 2025): https://www.who.int/news-room/questions-and-answers/item/workplace-heat-stress
- Ahmed, H. O., et al. (2020), *Assessment of thermal exposure level among construction workers in UAE using WBGT, HSI and TWL indices*, Industrial Health 58(2): https://pubmed.ncbi.nlm.nih.gov/31308288/

**Platform / technical**
- Meta for Developers, *Audio messages* (voice notes: OGG/Opus, mono, ≤512 KB for the inline play icon, ≤16 MB; no template carries audio; inbound media ID expires in 7 days; no server-side transcription field): https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/audio-messages
- National Center of Meteorology (UAE): https://www.ncm.gov.ae/

**Competitive landscape (positioning, not endorsement)**
- viAct: https://www.viact.ai/industry/construction-ai-safety-solution
- TrueLook TrueAI: https://www.truelook.com/ai-reference-page
- SafeSight: https://getsafesight.com/ and https://www.safesight-ai.app/
- Forsight.ai: https://www.forsight.ai/
- Presight AI: https://www.presight.ai/

**Note on prior art.** Detection, alerting and dashboards are established products. This project's claim is deliberately limited to C1–C4 (§1) and the evaluation methodology (§9). No claim is made that the underlying computer vision is novel.
