# HomeLoop AI — Autonomous Child & Home Hazard-to-Resolution Agent

| | |
|---|---|
| **Product** | HomeLoop AI — v3.0 "Agent-Core" Edition |
| **Target Category** | Best Societal AI Agent (secondary: Best Personal AI Agent) |
| **One-line thesis** | Every child-safety camera tells you a child reached the pool gate. **Nobody tells you the chair was left against the railing three hours earlier, or that the landlord's broken window restrictor is legally the landlord's job to fix.** HomeLoop is an autonomous resolution agent for the home. |
| **Core claim** | The agent's *reasoning, document reading, negotiation, and evidence verification* are the product. Vision is one sensor input. |
| **Prepared** | 22 October 2026 |
| **Supersedes** | `guardianloop_ai_child_home_safety_agent_upgraded.md` (v2.0) and `guardianloop_ai.md` (v1.0) |
| **Naming note** | Renamed from "GuardianLoop AI" to avoid a product-name collision with the construction entry. **Trademark check required before any public use.** |

---

## 0. Scorecard against the competition's own criteria

| Pillar | Claim | Where evidenced | Jury artefact |
|---|---|---|---|
| **Identify** | Child falls in UAE homes are documented and largely preventable; the *precondition* (climbable furniture near an unguarded opening, a defective restrictor, a propped gate) is detectable hours earlier than the incident | §1, §2 | Live demo: agent flags the precondition before the child appears |
| **Build** | 3 agents + 1 policy engine. The agent reads a tenancy contract, determines legal responsibility, negotiates with a contractor, issues scoped access, and verifies the repair against a building-code profile | §4, §5, §6, §7 | Live demo: agent refuses to accept a fake closure, and correctly re-routes liability |
| **Validate** | Built evaluation harness with a seeded-fake-repair set, a liability-classification accuracy set, and a claim-rejection rate | §9 | Metrics slide |

---

## 1. The problem, in the parent's voice

A parent in a Dubai villa or apartment faces two separate failures that current products do not touch.

**Failure 1 — the precondition.** 81 UAE child falls from windows and balconies were documented in a retrospective study of 2005–2016 newspaper reports (66 fatal, 15 hospitalised); climbable furniture near windows or balconies was involved in 27% of cases. The Dubai Building Code already requires guardrails ≥1200 mm with openings that do not admit a 100 mm sphere, no horizontal climbable elements within 865 mm, and gaps ≤100 mm; openable windows are subject to DDA Circular 239 (sill ≥865 mm, opening gap ≤125 mm). **The building is usually compliant on day one.** It stops being compliant when a chair is moved, a restrictor breaks, a gate is propped. Existing cameras only fire when the child is already there. The window of prevention is *hours earlier* and nobody is watching it.

**Failure 2 — the responsibility.** When something is broken, the parent does not know who must fix it, so it does not get fixed. In a Dubai tenancy, **Article 16 of Law No. (26) of 2007** puts maintenance and any defect affecting the tenant's intended use on the **landlord**, *unless otherwise agreed in the contract*. A contract's minor-repairs clause (commonly AED 500–1,000) is a **contractual term, not a statutory threshold** — and it does not displace Article 16 for structural or child-safety defects. Yet in practice a parent is asked to pay AED 280 for a broken child-safety restrictor, or chases a landlord for six weeks with a WhatsApp thread and no leverage.

**Outcome the agent is accountable for:** *the child-safety precondition is removed or the case is escalated to the party legally responsible — and the removal is verified against the applicable building-code profile, not assumed from a message.*

---

## 2. What prior art does, and where the gap actually is

| Prior art | What it does | What it does not do |
|---|---|---|
| **FATEEN** (UAE University, 2025) | AI toddler pool detection via a floating IoT device; local alarm; parent notification; reported 6–8 s floaty response | Detects the **child at the pool**. Does not detect the **precondition**, does not handle liability, does not verify a repair, and has documented limitations in low light and for darker skin |
| **Consumer baby monitors / home-safety AI monitors** (e.g. camera + AI category alerts, fall detection) | Real-time alerting, some anomaly detection | Alert-only; no responsibility routing, no tenancy reasoning, no repair verification, no code-compliance check |
| **ADPHC / Dubai Civil Defence guidance** | Prevention guidance (window guards, furniture placement, pool gates, supervision) | Guidance, not enforcement or follow-through. Nothing closes the loop |

**Our claim is deliberately narrow:** *precondition detection + legal-responsibility routing + verified repair*, in the specific Dubai tenancy context. We do not claim AI toddler-pool detection is new.

---

## 3. Why this is an agent problem

A camera that fires an alert has done one thing. The work that matters is:

- **Interpret** a detected hazard against the *actual* condition of the home and the *actual* terms of the tenancy.
- **Determine responsibility** by reading a legal document and citing the clause — separating *who pays* from *who must fix a safety defect*.
- **Act**: find a licensed contractor, negotiate a slot and a price, issue scoped access, escalate to the landlord with a citable notice.
- **Verify** that the repair actually satisfies the applicable building-code profile.
- **Track** it to verified closure, or leave it open with a named reason.

None of steps 2–5 is a rule engine's job. The contract is a document, the defect is ambiguous, and the contractor is a negotiation.

---

## 4. Architecture: three agents, one deterministic policy engine

```
┌─ SENSORS (interchangeable, none is the product) ────────────────────────┐
│  Safely mounted camera frames + object/proximity detector output       │
│  Pool-gate / door / lock sensor state                                 │
│  Parent photo upload (EXIF)      Tenant's Ejari contract PDF           │
│  Contractor messages             Building-code profile config (human)  │
└───────────────┬─────────────────────────────────────────────────────────┘
                ▼
┌─ POLICY ENGINE (deterministic, not an LLM, cannot be overridden) ──────┐
│  Safety-critical defect list · spend caps · contractor allowlist ·     │
│  access-token TTL · contact permissions · retention · kill-switch      │
└───────────────┬─────────────────────────────────────────────────────────┘
                ▼
┌─ AGENT LAYER ──────────────────────────────────────────────────────────┐
│  AGENT 1  RESOLUTION ORCHESTRATOR (the brain)                          │
│    classify hazard → determine responsibility → plan → act → verify     │
│        │                                                               │
│        ├──► AGENT 2  RESPONSIBILITY & NEGOTIATION AGENT (the channel)  │
│        │      reads the Ejari contract → cites the clause → drafts the  │
│        │      landlord notice → negotiates with contractors → scopes    │
│        │      a time-bound access token                                │
│        │                                                               │
│        └──► AGENT 3  EVIDENCE & VERIFICATION AGENT (the truth layer)   │
│               code-profile verification · freshness · spoof checks ·    │
│               re-verification requests → human review                   │
│  AUDIT + AGENT DECISION TRAIL (append-only)                            │
└───────────────┬─────────────────────────────────────────────────────────┘
                ▼
   Landlord · Licensed contractors · Building management · Family
```

**Non-negotiable rules encoded in the policy engine, not in prompts:**

| Rule | Why |
|---|---|
| The agent **may not** decide that a tenant must fix a child-safety defect | Article 16 puts structural/safety defects on the landlord unless the contract validly says otherwise |
| The agent **may not** instruct anyone to inspect or repair live wiring | Unqualified electrical work is not an agent's call |
| The agent **may not** close a case without Evidence Agent sign-off | Claims are inputs, not evidence |
| Access tokens are **single-use, TTL-bound, tied to a job ID, and auditable** | A leaked code is a physical security risk |
| The agent **may not** state that a child is safe, or that a home is safe | Absence of detection is not safety |
| The agent **may not** contact a landlord or contractor without a recorded basis | Consent and privacy |

---

## 5. The agent loop

```
  OBSERVE     Precondition scan + sensor state + parent report, each tagged with source/freshness
  CLASSIFY    Hazard class · severity · is this safety-critical? · which code profile applies?
  RESEARCH    Read the tenancy contract → locate the maintenance/liability clause → cite it
  DECIDE      Two separate answers: (a) who pays per contract  (b) who must fix a safety defect
  ACT         Draft the landlord notice · negotiate with a licensed contractor · scope access token
  VERIFY      Confirm the repair against the code profile with fresh evidence
  TRACK       Open until verified; escalate on timer; record who did what
  AUDIT       Append everything to the decision trail
```

### 5.1 The responsibility decision — the corrected logic

This is the agent's most important reasoning step and the one v2.0 got wrong.

```
INPUT: defect = broken child-safety window restrictor in a rented Dubai apartment
       estimated cost = AED 280
       contract clause = "tenant responsible for minor maintenance up to AED 500"

AGENT OUTPUT:
  (a) COST RESPONSIBILITY   -> Tenant, AED 280
      basis: contract clause, quoted verbatim, section reference
  (b) SAFETY REPAIR DUTY    -> LANDLORD
      basis: Law No. 26 of 2007, Article 16 - landlord is responsible for maintenance
             and for any defect affecting the tenant's intended use; a minor-repairs
             clause does not displace Article 16 for a child-safety defect on an
             unguarded opening.
  (c) ACTION                -> Notify landlord with a citable notice (RDC-ready pack).
                               Do NOT schedule the tenant to fix it. Do not bill the tenant.
  (d) IF LANDLORD DOES NOT RESPOND IN [window]
                             -> Prepare an RDC maintenance request pack (RDC charges
                                AED 500 where the value is unspecified).
```

**The demo beat:** the agent receives an AED 280 quote for a broken restrictor, *costs less than the tenant's AED 500 threshold*, and **still refuses to route it to the tenant** — because a safety defect on an unguarded opening is the landlord's duty under Article 16. It explains why, cites the clause, and drafts the notice. That is a moment no rule engine and no camera can produce, and it is exactly what a Dubai jury can verify.

**Guardrail against overreach:** the agent *proposes* the classification and cites its basis. It states it is not legal advice, and it offers the family the ability to confirm or contest before anything is sent to the landlord.

### 5.2 The precondition agent

| Check | Interval | Signal | Action on trigger |
|---|---|---|---|
| **Object in hazard buffer** | Every 10 min | A monitored object detected within the configured clearance of a guarded opening or pool access point | Non-alarm notice to the family: "chair moved next to the balcony railing" |
| **Guard gap compliance** | Weekly + on change | The guarded opening's clear width versus the applicable code profile | Report drift; if a repair case is open, verify it |
| **Access state** | Continuous (sensor) | Pool gate / door / lock state | Deterministic alarm path (below) |
| **Repair completion** | On completion | The guarded opening against the code profile | Evidence Agent sign-off or open case |

**The deterministic safety path** stays outside the LLM entirely: a child-sized person inside a configured pool-risk polygon while the access state reads `OPEN` triggers a local alarm and caregiver notification in ≤2 seconds from the sensor edge, with escalation if unacknowledged. **No LLM token generation sits in that path.** The agent handles everything after the alarm.

### 5.3 Evidence taxonomy

| Evidence | Acceptable to close? |
|---|---|
| Fresh photo of the installed repair, metadata within window, geofence matches, subject visible, **and** a measurable clearance check against the applicable profile | **Yes** |
| Sensor state change (gate now reports `LOCKED`) for access-type defects | **Yes**, if the sensor is not the subsystem being gamed |
| Approved contractor's completion record with timestamp and job reference | **Yes**, if independently retrievable |
| Contractor message "done" / "installed" | **No** — claim only |
| Parent photo of a different window | **No** — wrong subject |
| Photo older than the repair window | **No** — `STALE` |
| Photo where the opening is occluded or out of frame | **No** — `INCONCLUSIVE` → human review |
| No new evidence at all | **No** — `NO_EVIDENCE` → never `RESOLVED` |

**The measurable-clearance caveat (honesty rule).** Verifying a "gap ≤100 mm" or "≤125 mm" from a camera needs a **calibration reference** in frame. Two options, both acceptable, and the demo must state which is in use:
- **(A) Instrumented mode:** a printed calibration marker placed at the opening during the repair. Precise, and the contractor photographs it. *(MVP default.)*
- **(B) Presence mode:** verify the restrictor/guard is installed and engaged, and that the opening is visibly reduced. Less precise, honestly labelled.

The demo must never claim millimetre accuracy from Mode B.

---

## 6. Tool catalogue

| Tool | Purpose | Guardrail |
|---|---|---|
| `read_sensor_feed` | Camera frames, detector output, gate/lock state | Frame cap, freshness TTL, no facial recognition, no biometric identification, fixed mounting only |
| `read_hazard_config` | Monitored openings, buffers, code profile per property | Read-only; configured by a human, not the agent |
| `parse_tenancy_contract` | Read the Ejari PDF, extract maintenance/liability clauses, cite section | Read-only. Must return the quoted clause text plus a confidence; must not output a legal conclusion without its cited basis |
| `classify_defect` | Defect type, severity, safety-critical flag, applicable code profile | Low confidence → human review; never auto-classify live electrical as safe |
| `determine_responsibility` | Produce (a) cost responsibility and (b) safety repair duty, each with a cited basis | Policy engine enforces the safety-critical override; agent may not skip it |
| `search_contractor_panel` | Find licensed contractors for the defect class | Curated allowlist only; no open marketplaces |
| `negotiate_contractor_slot` | Multi-turn conversation for availability, scope and price | Price ceiling; no binding acceptance without family approval |
| `issue_scoped_access_token` | Time-bound, single-use access for the approved contractor to enter | TTL-bound, job-ID-bound, single-use, audited, revocable, never issued to an unverified party |
| `draft_landlord_notice` | Produce a citable notice + an RDC-ready request pack | Family must approve before sending. Never send without recorded consent |
| `request_reverification` | Ask for the specific missing artefact | Max 2 retries, then escalate to human |
| `verify_code_profile` | Apply the applicable clearance/presence check to fresh evidence | Only the Evidence Agent may return `SUFFICIENT` |
| `escalate_to_human` | Route to family/human review with the decision trail | Terminal until a human acts |
| `emit_compliance_record` | Timestamped evidence record of the repair state | "System-generated record" only. Never "certificate" or "certification" |

---

## 7. Demonstration design

### 7.1 Four beats, two minutes

| Beat | Time | What the audience sees | What it proves |
|---|---|---|---|
| **1. Precondition** | 0:00–0:25 | A chair is placed next to an unguarded balcony opening. Within the scan interval the agent raises a **non-alarm** notice: "climbable object within 1.0 m of a guarded opening." No child is involved. | The product is prevention, not reaction — and it beats FATEEN's paradigm |
| **2. Deterministic alarm** | 0:25–0:40 | A child-sized figure enters the pool risk zone while the gate sensor reads `OPEN`. Local alarm + caregiver notification in ≤2 s, escalation on no-acknowledgement. Dashboard never says "safe". | Safety path is deterministic and fast; the LLM is not in the loop |
| **3. The AED 280 trap** | 0:40–1:20 | A cracked socket and a broken restrictor are logged. The agent reads the tenancy contract, quotes the AED 500 clause — and **still refuses to route the restrictor to the tenant**, citing Article 16, because it is a safety defect on an unguarded opening. It drafts the landlord notice and a contractor negotiation. | Contract-reading legal reasoning. The best beat in the demo |
| **4. Fake closure rejected, then verified** | 1:20–2:00 | The contractor messages "installed". The Evidence Agent requests fresh evidence, receives a photo, evaluates it against the code profile, **rejects it** (subject not in frame / stale), keeps the case open, and names the missing artefact. Then a valid capture arrives with the calibration marker → verified closure. Cut to metrics + business model. | Claims are not evidence. The loop closes on proof. |

### 7.2 Agent Decision Trail

Live panel showing every hypothesis, contract clause quoted, tool call, rejected evidence and the reason, every pivot, and every consent-gated action. It updates through the demo.

### 7.3 Demo harness and failure fallback

- **Real**: camera on a staged mock apartment, sensor simulator, contract PDF, WhatsApp Cloud API on a Meta-approved test number.
- **Mocked with a clean seam**: contractor panel, landlord response, access-token service, messaging.
- **Fallback**: every beat has a pre-recorded capture on a hotkey; the family tablet keeps running.
- **Safety**: no real child is ever exposed to a hazard, no live pool, no live electrical work, no real landlord contacted, no real access code issued. A mannequin is used on stage. This must be stated to the jury.

---

## 8. Demonstration and scope freeze

### 8.1 Frozen MVP scope

**IN:** 1 mock apartment; 2 hazard classes — *precondition proximity* and *repair-work verification*; 1 code profile (Dubai Building Code B.4.2.5.2 + DDA Circular 239) plus one configurable alternative; 1 contract parser; 1 contractor negotiation loop; scoped access token (simulated); 1 verification layer; decision trail; metrics harness; dashboard; 2 languages for household messaging (Arabic + English).

**OUT (explicitly later):** live electrical-hazard classification (highest liability, weakest verifiability — deliberately deferred); facial or behavioural recognition; real pool deployment; real landlord or RDC submission (the agent prepares the pack, a human submits); wearable cameras of any kind; smart-home device control beyond a lock/gate state; multi-property portfolio management; 3+ languages.

### 8.2 Phases

| Phase | Weeks | Deliverable | Gate |
|---|---|---|---|
| **P0 Legal + code grounding** | W1–W2 | Contract parser against real Ejari templates; code profile with correct citations; liability-decision test set | **Hard gate: liability classification must be reviewed by a UAE property lawyer before anything else is built** |
| **P1 Agent core** | W3–W6 | Orchestrator + policy engine + decision trail + sensor feed + precondition scan | Precondition notice fires on a scripted scene change |
| **P2 Responsibility agent** | W7–W10 | Contract read → two-axis decision → notice drafting → family consent gate | 20/20 correct on the liability test set; zero safety-critical defect routed to tenant |
| **P3 Negotiation + verification** | W11–W14 | Contractor negotiation, scoped token, evidence taxonomy, code-profile verification | Seeded fake closures rejected |
| **P4 Harness + metrics** | W15–W17 | Detector set, fake-repair set, permission/consent set | §9 metrics reproducible |
| **P5 Demo hardening** | W18–W20 | Recorded fallbacks, dress rehearsal, safety script | Zero unrecorded failure paths |
| **P6 Submission** | W21 | Pitch deck, demo video, one-page business model | **Registration closes January 2027** |

---

## 9. Evaluation plan

| Set | Size | Contents | Metric |
|---|---|---|---|
| **Precondition set** | 60 staged scenes | Object present/absent within the hazard buffer; varied furniture, lighting, camera angles | Precision, recall, false alerts per scan-hour |
| **Fake-repair set** | 20 seeded fake completions — "installed" message, photo of wrong window, stale photo, occluded frame, uncalibrated photo, photo of an unmodified opening | % correctly rejected (target ≥ 18/20) |
| **Liability set** | 25 defect × contract scenarios, including AED 280 restrictor, AED 900 restrictor, landlord-stated obligation, no clause present, lease owned by family | Correct two-axis classification (target 25/25; **zero** safety-critical defects routed to tenant) |
| **Code-profile set** | 20 measured openings with reference markers | Clearance measurement error (Mode A) / presence-detection accuracy (Mode B) |
| **Consent & permission set** | 20 attempts to make the agent act without consent, exceed spend, issue a non-expiring token, or contact a third party | % correctly blocked (target 20/20) |
| **Usability** | 10–15 families (UAE, incl. People of Determination where possible) | Task completion, trust, perceived surveillance burden, comprehension of the notice |

**Never claimed:** prevention of any specific injury, child safety, medical or legal outcomes, or "the home is safe".

---

## 10. Business model

**Buyers, in order of realism:**

| Buyer | Why | Model |
|---|---|---|
| **Property managers / developers (Emaar, Aldar, Nakheel, DAMAC, and the building-management firms they use)** | They carry the liability for a defective guard, and they cannot inspect every unit. Fit-out/warranty period and snagging are exactly their pain | Per-unit-per-month SaaS, or per-unit onboarding + annual subscription |
| **Home insurers / home-protection providers** | A verified repair record reduces claim friction; a family that can prove the guard was compliant is a lower risk | Per-policy or per-family subscription, referral fee |
| **Building/facility management (BMS/FM vendors)** | Already service the balcony, pool gate and electrical assets | Per-site licence, white-label |
| **Families directly (B2C)** | Weakest payer, highest support cost, highest liability | Optional low tier, deferred — not the MVP business model |

| | |
|---|---|
| **Model** | B2B2C SaaS, per unit, per month. **Do not publish a price until 5 design-partner quotes are in hand.** |
| **Cost to serve** | Camera/edge hardware, WhatsApp conversation charges, STT, contractor commission (if any — disclose it, do not bury it), support |
| **Moat** | The liability-decision engine + the code-profile verifier + the accumulated defect-to-repair-outcome dataset, plus the property-manager relationships. Detection is not the moat. |
| **Wedge** | One developer or property manager, one building, 90 days: every unit's guarded opening and access state verified against the code profile, with a defensible audit trail. That is a procurement outcome, not a consumer app. |

**Disclose on stage:** if the agent earns a commission from contractor bookings, say so on the slide. A jury that discovers an undisclosed incentive in the resolution path will assume the agent closes cases rather than fixes them.

---

## 11. Risks and mitigations

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| **R1** | Legal classification is wrong, and a family relies on it | **High** | UAE property lawyer review before build (P0 gate). The agent cites its basis, states it is not legal advice, requires family confirmation before sending anything, and never closes a case itself |
| **R2** | A "wrongly routed to landlord" error delays a safety fix | **High** | Route the *safety* concern to the family and the property manager simultaneously; liability is about who pays, not about whether it gets fixed. Safety is never gated on the liability outcome |
| **R3** | Live electrical classification is unsafe and unverifiable | **High** | Deferred out of MVP (§8.1). Electrical items are flagged and routed to a licensed electrician — never classified, never diagnosed |
| **R4** | Consumer baby-monitor and home-safety-AI competitors move fast | Medium | Compete on precondition detection + liability routing + verified repair, none of which is a camera feature |
| **R5** | Millimetre claims from a camera are not credible | Medium | Instrumented Mode A with a calibration marker, or honestly-labelled Mode B presence check. State which is running |
| **R6** | Access tokens become a physical security risk | Medium | Single-use, TTL-bound, job-ID-bound, audited, revocable; simulated in MVP |
| **R7** | A child is exposed to a hazard during testing | **High** | Mannequin and staged footage only. Never a real child. Stated to the jury on stage |
| **R8** | Privacy perception: cameras in a home with a child | Medium | Fixed mounting only, no wearable, local/edge processing where possible, minimal retention, no facial recognition, encrypted evidence, visible indicator when recording |
| **R9** | B2C unit economics do not work | Medium | The business model is B2B2C with developers/insurers. B2C is explicitly not the MVP model |
| **R10** | Scope creep across 3 hazard classes | Medium | Frozen to 2 (§8.1). Electrical deferred on purpose |
| **R11** | "Protection guarantee" overclaim | Medium | Never state a home or child is safe. Say what the system does and does not monitor, on the product itself |
| **R12** | Landlord-notification harms the family relationship | Medium | Family consent gate before any landlord contact; the agent drafts, the family sends |

---

## 12. Out-of-scope commitments and honesty rules

1. The agent **does not guarantee a child's safety**, and never states that a home is safe.
2. The agent **does not provide legal advice** — it cites the clause and the article, and flags that a family should confirm.
3. The agent **does not classify electrical hazards**; it routes them to a licensed electrician.
4. The agent **does not send anything to a landlord or contractor without recorded family consent**.
5. The agent **does not close a repair without verified evidence**; "installed" is a claim, not evidence.
6. The agent **never measures clearance precisely without a calibration reference** in frame.
7. **No real child, no live pool, no live electrical work, no real landlord, no real access code** in any test or demo.

---

## 13. Sources

**Competition**
- Dubai Chambers, *Create AI Agents Championship*: https://www.dubaichambers.com/en/web/dubai-chamber-of-digital-economy/create-ai-agents

**Evidence for the problem**
- Grivna, M., et al. (2017), *Pediatric falls from windows and balconies: incidents and risk factors as reported by newspapers in the United Arab Emirates*, World Journal of Emergency Surgery 12:32: https://pmc.ncbi.nlm.nih.gov/articles/PMC5644057/
- Khaleej Times (29 October 2025), *UAE: 2-year-old boy drowns in swimming pool at a private farm in Fujairah*: https://www.khaleejtimes.com/uae/emergencies/toddler-drowns-swimming-pool-dibba-al-fujairah
- United Arab Dhabi Public Health Centre, *Safety of Children at Home Guide* (window width, furniture placement, pool gates, electrical safety): https://www.adphc.gov.ae/-/media/Project/ADPHC/ADPHC/PDF/Child-Injury-prevention/Child-Safety-Home-En.pdf
- UAE University (2025), *FATEEN: An AI-Empowered Floating IoT System for Enhancing Toddler Pool Safety* (prior art — includes reported 6–8 s response and documented lighting/skin-tone limitations): https://research.uaeu.ac.ae/en/publications/fateen-an-ai-empowered-floating-iot-system-for-enhancing-toddler-

**UAE law and building code (the corrected legal grounding)**
- Law No. (26) of 2007 Regulating the Relationship between Landlords and Tenants in the Emirate of Dubai, **Article 16** (landlord responsible for maintenance and for defects affecting the tenant's intended use, unless otherwise agreed) and Article 17: https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(26)%20of%202007.html
- Decree No. (45) of 2021 Concerning the Dubai Building Code: https://dlp.dubai.gov.ae/Legislation%20Reference/2021/Decree%20No.%20(45)%20of%202021%20Concerning%20the%20Dubai%20Building%20Code.pdf
- Dubai Building Code (2021 Edition), **B.4.2.5.2 Guardrails for fall protection** — guardrail ≥1200 mm; separation not permitting passage of a 100 mm sphere; no horizontal climbable elements within 865 mm; gap ≤100 mm: https://dmpmedia.dm.gov.ae/uploads/2021/12/Dubai%20Building%20Code_English_2021%20Edition_compressed.pdf
- Dubai Digital Authority, **Circular 239** — Openable Windows: opening gap ≤125 mm, sill ≥865 mm, no climbable features at the base: https://dda.gov.ae/-/media/F96E79E07DF5486CAD2A9614C3C7BDA8.pdf
- Dubai Rental Disputes Centre — maintenance request procedure and the AED 500 charge where the value is unspecified: https://www.rdc.gov.ae/

**Platform / technical**
- Meta for Developers, *Audio messages* (voice notes: OGG/Opus, mono, ≤512 KB inline, ≤16 MB; no template carries audio; inbound media ID expires in 7 days): https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/audio-messages

**Note on prior art.** FATEEN (UAEU 2025) and the consumer baby-monitor / home-safety-AI category are established. This project's claim is limited to precondition detection, the two-axis responsibility decision, and code-profile-verified repair. No claim is made that AI-based toddler-pool detection or child monitoring is novel.
