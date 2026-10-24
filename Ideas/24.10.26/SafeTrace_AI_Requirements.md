# SafeTrace AI — Requirements and Evidence

**Document type:** Product requirements / MVP specification  
**Use-case category:** Societal / Public Safety / Agentic AI  
**Target context:** Dubai, UAE, with potential applicability to other cities  
**Version:** 1.0  
**Prepared:** 24 October 2026  
**Status:** Proposed concept — evidence-backed problem, novelty and deployment access still require validation

---

## 1. Executive summary

**SafeTrace AI is a missing-person search coordination agent** designed to help authorized responders and families coordinate the early search for a missing child, an older adult with dementia, or another vulnerable person.

The system turns a report into a structured timeline, proposes prioritized search locations, prepares authorized requests for relevant CCTV or transport records, assesses incoming sighting leads, and tracks follow-up actions. It adapts the plan when new information arrives or an expected source is unavailable.

**The agent does not replace police, emergency services, or official missing-person reporting.** It is a proposed coordination layer intended to reduce fragmented manual work and make case follow-up more systematic. Any operational deployment would require approval by the responsible authorities, privacy/security review, and authorized integrations.

## 2. The real-world problem

When a person goes missing, useful information can be distributed across relatives, witnesses, transport providers, malls, hotels, hospitals, and public authorities. Families may not know which organization to contact or what details to provide. Different organizations may hold different parts of the timeline, and footage may be overwritten according to each operator's retention rules.

An official example of this cross-organization process is the **Consulate General of India in Dubai's missing-person procedure**. It asks relatives to supply identity and passport details, date and time the person went missing, UAE address and mobile number, employer information, and family/friend contacts. The Consulate explicitly states that it can search for a missing person only with the cooperation of local UAE authorities.

This is evidence of a multi-party process and a substantial information requirement. It **does not prove that Dubai Police's existing internal investigation or coordination is inadequate**. The specific gap SafeTrace aims to test is whether a governed agent can improve the speed, completeness, and traceability of coordination across participating organizations.

## 3. Evidence and source register

### Evidence A — Missing-person reports require structured information and cross-authority cooperation

The Consulate General of India in Dubai publishes a missing-person complaint procedure for people missing in Dubai or the Northern Emirates. Its form requests identifying details, passport information, the last-known date/time, UAE contact/address information, employer/sponsor information, and family contacts. It notes that searches require cooperation with local UAE authorities.

**Why this matters:** The process spans the family/consulate/local-authority boundary and depends on collecting sufficiently detailed information.

Source: [Consulate General of India, Dubai — Missing Person Complaints](https://www.cgidubai.gov.in/page/missing-person-complaints/)

### Evidence B — Dubai is actively exploring agentic AI for public-facing services

On 5 October 2026, Dubai Future Foundation announced the Agentic AI for Government Services Accelerator. Its first phase brings together 33 Dubai government entities and assesses more than 300 public-facing use cases. The programme describes designing, prototyping, testing and deploying agentic services, with attention to data integration, security, governance, human oversight and measurable impact.

**Why this matters:** SafeTrace is framed as a coordinated public-service workflow, not just a chatbot. This announcement is strategic context; it does not establish that missing-person response is one of the selected 300+ use cases.

Sources:
- [Dubai Future Foundation — Accelerator announcement, 5 October 2026](https://www.dubaifuture.ae/latest-news/dubai-future-foundation-launches-agentic-ai-for-government-services-accelerator/)
- [Dubai Future Foundation — DCAI Accelerators](https://www.dubaifuture.ae/dcai-accelerators/)

### Evidence C — CCTV access and privacy must be controlled

Dubai's Resolution No. 14 of 2020 concerning security cameras used by Dubai Police says recordings are confidential and restricts their transfer, disclosure, or access by third parties, except for official work or with the required prior approval. It also requires compliance with legislation protecting privacy and personal information.

**Why this matters:** SafeTrace must not scrape, access, or share private CCTV on its own. It should prepare and track authorized requests and process footage only when lawfully supplied to an approved case workflow.

Source: [Dubai Legislation Portal — Resolution No. 14 of 2020](https://dlp.dubai.gov.ae/Legislation%20Reference/2020/Resolution%20No.%20%2814%29%20of%202020%20Concerning%20the%20Use%20of%20Security%20Cameras%20in%20Documenting%20the%20Performance%20of%20the%20Duties%20of%20Police%20Staff%20Members.html)

### Evidence D — Emergency services remain the first route for urgent danger

The UAE Government's official emergency guidance lists **999 for police** and **998 for ambulance**. SafeTrace must not delay or divert an emergency call while gathering information.

Source: [UAE Government — Handling emergencies](https://u.ae/en/information-and-services/justice-safety-and-the-law/handling-emergencies)

### What the evidence does and does not establish

- **Established:** Official missing-person reporting can require detailed identity, timeline and contact information; consular searches depend on cooperation with UAE authorities.
- **Established:** Dubai's government is exploring agentic AI for public-facing services, including integrated workflows and measurable outcomes.
- **Established:** Police camera recordings are subject to confidentiality and authorization controls.
- **Not established:** That Dubai Police lacks an effective missing-person system, lacks inter-agency coordination, or currently fails to search CCTV effectively.
- **To validate:** Whether families and authorized responders experience avoidable delays, duplicated information requests, missed follow-ups, or fragmented evidence across participating organizations—and whether SafeTrace materially improves those outcomes.

---

## 4. Target users and stakeholders

### Primary users
- Authorized police or missing-person response personnel.
- Approved case coordinators who need to manage requests and updates.
- Family members or guardians who provide information and receive approved status updates.

### Participating stakeholders (only through formal approval and agreements)
- Police and emergency-response services.
- Relevant consulates or embassies, where appropriate.
- Participating transit operators, malls, hotels, hospitals, or other venue operators.
- Authorized CCTV/security teams.

The MVP must not represent that any of these organizations has agreed to participate. These are prospective integrations.

## 5. Unique use case

**Scenario:** An older tourist with dementia becomes separated from their family near a shopping mall and is not found at the last-known location.

1. A family member or authorized officer reports the incident through the approved route. If there is immediate danger, the system prominently instructs the user to contact emergency services; it does not hold the report until the AI intake is complete.
2. The intake agent structures the report and identifies missing essential details (for example: last-seen time, clothing, accessible photograph, known destination, mobility needs, and a callback contact).
3. The timeline agent combines confirmed observations and clearly labels estimates or unverified statements.
4. The search-planning agent ranks plausible nearby search zones using time, known destinations, walking/mobility constraints and confirmed sightings. It explains why each location is prioritized.
5. The coordination agent prepares authorized requests for relevant venue or transit operators to preserve and review appropriate footage or logs. It cannot retrieve footage unless an approved access path exists.
6. If footage or a public sighting is lawfully supplied, the visual-evidence agent identifies possible matches and records the timestamp/location and confidence factors. It does not declare identity based on a model score alone.
7. A human responder reviews the lead. If rejected, the coordinator records the reason and requests the next useful evidence source or revises the search plan.
8. The case manager tracks outstanding actions, response deadlines, confirmed sightings and approved family updates until an authorized closure decision is recorded.

---

## 6. Agent architecture

### Agent 1 — Case Intake Agent
**Responsibilities:** Collect facts, normalize dates/times and locations, identify missing mandatory fields, distinguish confirmed facts from assumptions, and create a structured case record.

**Inputs:** Authorized report, person description, optional photograph, last-known location/time, relevant medical/vulnerability information voluntarily supplied or lawfully available, and contact details.

**Outputs:** Structured case record, missing-information checklist, and an initial summary for human verification.

### Agent 2 — Timeline and Location Agent
**Responsibilities:** Build a time-ordered timeline from statements and approved records; reconcile time zones/timestamps; preserve source attribution; mark contradictions and uncertainty.

**Outputs:** Event timeline, confidence/uncertainty labels, unresolved conflicts, and an auditable list of sources.

### Agent 3 — Search Planner Agent
**Responsibilities:** Generate a transparent, ranked set of next search actions from verified information, practical travel constraints, and source availability. Replan when leads fail or new evidence changes priorities.

**Outputs:** Prioritized search zones and tasks, rationale, required information, and alternatives if a source is unavailable.

### Agent 4 — Request Coordination Agent
**Responsibilities:** Prepare requests to approved organizations using authorized channels; check required fields; track submission/acknowledgement/status; request missing information; escalate overdue requests to a human coordinator.

**Outputs:** Draft or submitted authorized requests, request IDs, status tracker, and follow-up tasks.

**Constraint:** During the MVP, integrations are simulated. Live submission is enabled only after a participating organization grants permission and approves the workflow.

### Agent 5 — Visual Sighting Review Agent
**Responsibilities:** If approved footage or images are provided, search for candidate sightings using the least intrusive method available. Return potential matches with source, time range, observable clothing/attributes and uncertainty; flag low-quality or ambiguous footage.

**Outputs:** Candidate sighting records for human review—not a final identity determination.

**Constraint:** No open-ended face recognition, public tracking, scraping, or searching private cameras without legal authority and an approved purpose. Prefer human-submitted sighting descriptions or non-biometric attributes where effective. Any identity matching requires explicit legal, ethical, and technical approval.

### Agent 6 — Evidence and Lead Verification Agent
**Responsibilities:** Check provenance, timestamps, file integrity, duplicate reports and contradictions; separate direct evidence from inference; prioritize leads that need human review.

**Outputs:** Evidence log, duplicate alerts, inconsistency warnings, and a review queue with reason codes.

### Agent 7 — Case Coordinator / Orchestrator
**Responsibilities:** Maintain shared case state, choose the next appropriate task, coordinate dependencies across agents, detect stalled actions, trigger replanning, and request human approval before consequential actions.

**Outputs:** Current case state, next-action plan, approvals required, follow-ups and closure checklist.

### Agent 8 — Safety, Privacy and Policy Guard
**Responsibilities:** Enforce access control, least-privilege permissions, data minimization, approved retention and disclosure rules, audit trails, and escalation conditions.

**Outputs:** Allow/deny decision for each tool action, access audit, redaction where needed, and a reason when a task must be blocked for human review.

---

## 7. Functional requirements

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| FR-01 | Create a structured missing-person case from the authorized intake | Must | Required fields and missing fields are visible; human confirms the summary |
| FR-02 | Keep facts, estimates and model inferences separate | Must | Every timeline entry has a source and an evidence status |
| FR-03 | Build and revise a prioritized search plan | Must | Adding or rejecting a lead changes the next-action plan and records why |
| FR-04 | Generate requests for approved organizations | Must | Request contains only approved fields and requires human approval before submission |
| FR-05 | Track requests and follow-up deadlines | Must | Every action has owner, state, timestamp and next step |
| FR-06 | Process authorized video/images in the demo | Must | Candidate sightings include source/time and are explicitly marked unverified until human review |
| FR-07 | Preserve evidence provenance and integrity | Must | Originals remain immutable; derived copies and transformations are logged |
| FR-08 | Provide role-based access and audit logging | Must | Unauthorized role cannot view sensitive case data; access attempts are logged |
| FR-09 | Support safe family updates | Must | Only an authorized user can approve release; sensitive operational details are withheld |
| FR-10 | Escalate to a human when confidence is low or actions are consequential | Must | System blocks automatic identity confirmation, public disclosure, or unauthorized action |
| FR-11 | Provide mock integrations for MVP demonstration | Must | At least three simulated organizations can acknowledge, reject, delay, or fulfill a request |
| FR-12 | Record case closure and unresolved work | Should | Closure is restricted to authorized roles and includes a reason and final audit record |

---

## 8. Inputs and outputs

### Required case inputs
- Case identifier and reporting channel.
- Person's name or authorized identifier (only as appropriate to the approved workflow).
- Recent photograph and description, if legally/appropriately available.
- Last-seen location and time, and time precision/source.
- Clothing and other non-sensitive distinguishing details.
- Known immediate needs (for example, mobility, language or vulnerability considerations) where relevant and lawfully supplied.
- Reporting person's verified contact details and relationship/authority.
- Known destinations, confirmed observations and witness contacts.

### Optional/conditional inputs
- Authorized venue/transit CCTV clips or still images.
- Authorized access logs or transport records.
- Witness statements, receipts or location records that the reporting person chooses to provide.
- Weather, venue opening hours or transport context if relevant to the search plan.

### Expected outputs
- A verified, source-linked timeline.
- A ranked set of search actions with explanations and uncertainty.
- Authorized requests for evidence preservation or review.
- A queue of candidate sightings for human assessment.
- A case dashboard showing owners, statuses, elapsed time and next action.
- Approved updates to the family/reporting person.
- Final case record documenting decisions, actions and outstanding uncertainties.

---

## 9. MVP scope

### Build for the competition demo
- A web dashboard for an authorized case coordinator.
- A simple case intake form and structured case record.
- An agent orchestrator with separate intake, timeline, planner, request, evidence and policy functions.
- A synthetic city map with mock locations such as a mall, metro station, taxi pickup point and hotel.
- A small, consented test-video dataset featuring an actor in a controlled setting; no real missing-person footage is required.
- Simulated organization APIs for mall security, transit operator and police liaison, each with different response times and statuses.
- A request-state engine that simulates accepted, rejected, delayed and completed requests.
- A visual review page that shows candidate sightings and requires a human reviewer to confirm or reject them.
- An audit log and metrics dashboard.

### Do not build for MVP
- Direct access to Dubai Police systems or private CCTV networks.
- Real facial-recognition search across public/private feeds.
- Automatic public alerts containing a missing person's image or sensitive location.
- Autonomous police dispatch or autonomous case closure.
- Production identity verification or real-world handling of children’s sensitive data.

These boundaries make the prototype demonstrable without misrepresenting integration permissions or exposing real people.

---

## 10. Suggested technical design

- **Frontend:** Web dashboard for authorized case coordinators; optional low-detail family status view.
- **Backend:** FastAPI or similar service with authenticated endpoints.
- **Agent orchestration:** Stateful workflow/graph with explicit tool permissions, checkpoints and human approval nodes.
- **Case storage:** Relational database for case/task/status records; encrypted object storage for approved evidence files.
- **Search/geospatial layer:** Mock venue/transport graph for MVP; approved geospatial services for a future pilot.
- **Video analysis:** Controlled video ingestion and person/attribute detection for the test dataset; every candidate is routed to a human reviewer.
- **Integrations:** Mock adapters in MVP. Any live adapter must have an agreement, identity/access controls, API contract, logging and data-processing approval.
- **Observability:** Traces of agent decisions, tool calls, retries, failure reasons, token/cost usage and latency.

The LLM should coordinate the workflow and interpret unstructured information, while deterministic code enforces mandatory fields, permissions, retention rules, deadlines and action approval.

---

## 11. Non-functional, safety and governance requirements

1. **Human oversight:** A qualified responder owns case prioritization and all consequential decisions. An AI-generated sighting is a lead, not proof of identity.
2. **Emergency handling:** Display a clear notice that the AI system does not replace official reporting. For an emergency in the UAE, call 999 for police or 998 for ambulance. Do not delay these actions to complete the app's intake.
3. **Lawful camera access:** The system may only process camera footage supplied via an approved, authorized channel for a valid purpose. It must not bypass access controls or encourage users to obtain footage unlawfully.
4. **Privacy by design:** Collect the minimum data necessary, segregate family-facing and investigator-only information, restrict access by role, encrypt data in transit and at rest, and follow approved retention/deletion schedules.
5. **Children and vulnerable persons:** Apply stricter permissions and disclosure controls; do not publish personal details or sightings openly.
6. **False-positive management:** Require human review for any visual candidate; show confidence factors and evidence quality; support rejection and correction; never automatically accuse or contact an unrelated person.
7. **Evidence integrity:** Keep original evidence immutable, record cryptographic hashes where appropriate, record provenance and time of receipt, and log every transformation and access.
8. **Auditability:** Every recommendation and action must have timestamps, sources, agent/tool identity, approval state and outcome.
9. **Security:** Strong authentication, least privilege, per-case access, secure secrets, rate limits, tamper-resistant logs and incident-response processes.
10. **Resilience:** The system must degrade safely if the model, a camera source or a partner API is unavailable; manual operation remains possible.
11. **No unsupported claims:** The MVP must not claim access to real police data, live CCTV, or government APIs unless access has actually been granted and tested.

Relevant legal baseline to review with Dubai counsel and the participating authority: [Dubai Resolution No. 14 of 2020 on police security-camera recordings](https://dlp.dubai.gov.ae/Legislation%20Reference/2020/Resolution%20No.%20%2814%29%20of%202020%20Concerning%20the%20Use%20of%20Security%20Cameras%20in%20Documenting%20the%20Performance%20of%20the%20Duties%20of%20Police%20Staff%20Members.html). This reference is not a complete legal assessment of every camera operator or use case.

---

## 12. Evaluation plan and success metrics

All thresholds below are **provisional prototype targets**, not externally validated benchmarks. Establish a baseline before claiming improvement.

| Metric | Measurement | Suggested MVP target |
|---|---|---:|
| Intake completeness | Required fields captured correctly | ≥95% on scripted test cases |
| Timeline traceability | Timeline statements linked to a source or marked as inference | 100% in test cases |
| Request preparation | Required fields correct in simulated organization requests | ≥95% |
| Task tracking | Requests, owners and next actions visible in the case record | 100% of simulated tasks |
| Replanning | Plan changes appropriately after a rejected/failed lead | ≥90% across scripted scenarios |
| False visual leads | Incorrect candidate sightings surfaced per test scenario | Measure and report; optimize without hiding failures |
| Human review | Candidate identity decisions requiring human confirmation | 100% |
| Privacy controls | Unauthorized test access blocked and logged | 100% of designed access-control tests |
| Efficiency | Time and human actions needed versus a manual workflow | Report comparative results; do not assume improvement |
| System reliability | Recovery from simulated API failure/timeouts | All scripted failures handled without losing case state |

### Demo scenarios
1. A missing person was last seen near a mall; mall camera request is fulfilled and a reviewer confirms a potential sighting.
2. Transit operator rejects a request because the time range is too broad; the agent asks for clarification, revises the request and resubmits after approval.
3. Two reports conflict on clothing or time; the timeline agent retains both with source labels instead of silently choosing one.
4. A video match has low quality; the system labels it inconclusive and seeks another source rather than raising an identity claim.
5. A user without the required case role tries to view private evidence; access is denied and logged.
6. A simulated partner API times out; the agent preserves the task, retries according to policy and routes an overdue task to a human coordinator.

---

## 13. Novelty hypothesis and validation plan

### Novelty hypothesis

SafeTrace's proposed differentiator is not simply person detection or missing-person reporting. It is a **governed, stateful coordination layer** that maintains one case timeline across authorized partners, selects the next evidence-gathering action, tracks request dependencies, verifies incoming leads and replans as responses change.

### Existing systems and duplication risk

- Police and government agencies already receive missing-person reports and coordinate investigations.
- Consulates already publish missing-person procedures that require detailed information and cooperation with local authorities.
- CCTV systems and video analytics may already support police investigations.
- The available public sources do not establish the full capabilities or limitations of Dubai Police's internal case management, evidence search or CCTV coordination systems.

### Validation required before calling it novel

1. Interview families, consular staff, authorized responders and venue/security operators about the current workflow and actual pain points.
2. Map every step of the current process, including which systems already share case IDs, footage requests, status and results.
3. Search existing case-management, missing-person search, video analytics and cross-agency orchestration products/patents.
4. Identify one measurable manual gap that is confirmed by stakeholders and not already solved by existing tools.
5. Run an MVP comparison against a defined manual/rule-based baseline.
6. Ask Dubai Future Foundation/DCAI or a relevant government service owner whether this challenge overlaps with a current government use case. The accelerator's public announcement of 300+ assessed use cases does not disclose a complete list.

**Do not claim “the first in the world” until a defensible prior-art review supports that wording.**

---

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| No access to real CCTV or police systems | Demonstrate with simulated integrations; design adapters so approved access can be added later |
| False positive visual match | Human review, clear uncertainty labels, no automatic identity confirmation |
| Privacy or unlawful data access | Approval gates, least privilege, retention policies, audit logs and legal review |
| Duplicate of existing police capability | Validate the exact current workflow and scope before investing further |
| Poor or contradictory descriptions | Keep source labels, ask clarifying questions, preserve uncertainty and seek independent corroboration |
| An agent delays urgent action | Prominent official emergency guidance; emergency call is never gated by AI completion |
| Partner fails to respond | Track deadlines, retry within policy and escalate to a human coordinator |
| Sensitive location leak | Separate family and investigator views, restrict sharing, do not publish public tracking feeds |

---

## 15. One-minute pitch

> SafeTrace AI is a proposed missing-person response coordination agent for Dubai. Once a report is submitted through the proper authority, SafeTrace builds a source-linked timeline, prioritizes search steps, prepares authorized requests to participating venues or transport operators, organizes potential sightings for human review, and replans when a lead fails. Its value is not another missing-person form or a camera detector: it is a governed agent workflow that keeps actions, evidence and follow-ups coordinated across a changing case. We will prove its value with simulated integrations and compare time-to-next-action, evidence completeness and task completion against a manual baseline. Any real deployment would require authority approval, lawful data access and human control of investigative decisions.

---

## 16. Evidence links

1. **Consulate General of India, Dubai — Missing Person Complaints** (official reporting requirements and cooperation with local UAE authorities): https://www.cgidubai.gov.in/page/missing-person-complaints/
2. **Consulate General of India, Dubai — Missing Persons** (official description of how the Consulate approaches local authorities): https://www.cgidubai.gov.in/page/missing-persons/
3. **Dubai Future Foundation — Agentic AI for Government Services Accelerator announcement** (5 October 2026; 33 entities and 300+ public-facing use cases assessed): https://www.dubaifuture.ae/latest-news/dubai-future-foundation-launches-agentic-ai-for-government-services-accelerator/
4. **Dubai Future Foundation — DCAI Accelerators** (programme stages, public value, integration, security and governance expectations): https://www.dubaifuture.ae/dcai-accelerators/
5. **Dubai Legislation Portal — Resolution No. 14 of 2020 concerning police security-camera recordings** (confidentiality and authorization requirements): https://dlp.dubai.gov.ae/Legislation%20Reference/2020/Resolution%20No.%20%2814%29%20of%202020%20Concerning%20the%20Use%20of%20Security%20Cameras%20in%20Documenting%20the%20Performance%20of%20the%20Duties%20of%20Police%20Staff%20Members.html
6. **UAE Government — Handling emergencies** (official emergency numbers and reporting guidance): https://u.ae/en/information-and-services/justice-safety-and-the-law/handling-emergencies
7. **UAE Government — Advanced Mobile Location** (official description of caller location technology connected to police services): https://u.ae/en/about-the-uae/digital-uae/digital-technology/advanced-mobile-location

**Evidence access date:** 24 October 2026. Public sources confirm the problem context and governance considerations, but do not prove that the proposed SafeTrace coordination gap is absent from existing Dubai Police systems.
