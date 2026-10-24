# LifeEvent Navigator AI
## Agentic document-coordination service for birth and bereavement in Dubai

**Document type:** Product requirements and evidence brief  
**Status:** Proposed concept — discovery and validation required  
**Target setting:** Dubai, UAE  
**Primary users:** Parents of newborns, family members handling a death, authorized family representatives, and (in a later deployment) participating service teams

---

## 1. Executive summary

**LifeEvent Navigator AI** is one personal-facing agentic service that helps a family navigate two major life events: **a child's birth** and **a family member's death**. For either event, the agent turns the applicable official requirements into a personalized, dependency-aware plan; checks which documents are available or missing; prepares forms and communications; coordinates authorized actions with relevant service providers; and tracks progress until the family's selected administrative tasks are complete.

The product is **one service with two separate workflows**, not a single workflow that treats birth and death as equivalent. Each route has different authorities, legal requirements, urgency, consent rules and emotional context.

> **Core value proposition:** Families should not have to manually reconstruct the sequence of documents, offices, approvals and follow-ups for every life event. The agent coordinates the steps while the family retains control over submissions and consequential decisions.

## 2. Evidence that the workflows are real

The official UAE Government portal documents both sets of procedures. These sources establish the existence and complexity of the service journeys; they do **not** establish that government services are ineffective or that no digital coordination already exists.

### Birth workflow evidence

- The official UAE Government's **Having a baby** guidance says UAE-resident parents must register a child's birth within **30 days**. For expatriate residents, formal documentation including birth certificate, passport, Emirates ID and residence visa is to be arranged within **120 days**. Required documents can include the hospital birth notification, parents' passports and an attested marriage certificate. The actual checklist depends on the family's circumstances. [Source 1](https://u.ae/information-and-services/social-affairs/having-a-baby)
- The same official guidance says UAE nationals can use **Mabrouk Ma Yak**, a bundle that can provide a newborn's birth certificate, family-data update, passport, Emirates ID, insurance and optional health card. This is an important existing-service boundary: the MVP should not simply recreate that integrated service. [Source 1](https://u.ae/information-and-services/social-affairs/having-a-baby)
- The Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) describes the residence-permit journey as application, data review/correction, document attachment where integration fails, fee payment, follow-up, and then residence-permit and Emirates ID issuance. [Source 2](https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e64)

### Death and bereavement workflow evidence

- The official UAE Government's **Deaths** guidance says that if a death occurs outside a hospital, the immediate step is to call police on **999**. For hospital deaths, the authorities prepare the initial report. The morgue issues a death-certificate declaration; police stamping and one or more no-objection certificates may be required before the official death certificate is issued. Requirements vary with the type and location of the death. [Source 3](https://u.ae/en/information-and-services/social-affairs/deaths)
- The same guidance says expatriate families should contact the relevant embassy or consulate in the UAE for further formalities. Depending on the case, separate procedures can apply to body release, embalming, and transport to the deceased's home country. [Source 3](https://u.ae/en/information-and-services/social-affairs/deaths)
- Dubai Health Authority has published circulars on birth and death certificate issuance procedures, including a procedure-update circular dated **20 April 2026**. This confirms that these processes are subject to official procedure updates and the product must retrieve current requirements rather than rely on hard-coded rules. [DHA circulars](https://services.dha.gov.ae/sheryan/wps/portal/home/circular-details?circularRefNo=CIR-2026-00000061&fromHome=true&isPublicCircular=true)

### Why this is relevant to Dubai's agentic-services direction

Dubai Future Foundation's Agentic AI for Government Services Accelerator calls for public-facing services that understand people's needs, coordinate actions and guide users through complete journeys. Its framework emphasizes service ownership, public value, data/integration readiness, security, governance, human oversight and measurable impact. [Source 4](https://www.dubaifuture.ae/dcai-accelerators/)

**Evidence boundary:** The sources prove that the documented steps and dependencies exist. They do not prove that there is no current end-to-end portal or agent for these tasks. A discovery phase must compare LifeEvent Navigator against existing government bundles, hospital processes, service portals and private providers before claiming a gap.

---

## 3. The problem to validate

People often experience a major life event while under time pressure or emotional stress. The same event can require several documents and actions across different organizations. Requirements may vary by nationality, place of birth/death, hospital or non-hospital setting, family status, and whether the family is staying in the UAE or arranging travel abroad.

A person may have to work out:

- which authority owns the next step;
- which documents are mandatory for this exact case;
- which steps depend on a previous certificate or approval;
- whether translations or attestations are required;
- what needs to be submitted, where, and by when;
- what to do if a document, service response or appointment is delayed.

### Hypothesis to test

A personal coordination agent could reduce repeated research, missing-document submissions, avoidable handoffs and follow-up burden by managing the entire case state across authorized channels.

Do **not** claim that the current government process is manual, broken or unintegrated without user research and confirmation from service owners.

---

## 4. Scope: one service, two distinct workflows

### Workflow A — Newborn documentation

**Example user:** An expatriate couple has a baby at a Dubai hospital and needs to complete the child's birth certificate and subsequent identity/travel/residency documents.

1. The user selects **Birth** and confirms relevant case details: place of birth, parents' nationality/residency status, marital/document status, intended country of passport issuance, and whether the child will reside in the UAE.
2. The agent obtains the current official checklist for the specific case and links each requirement to an official source.
3. The document agent checks provided files for legibility, completeness, expiry, name/date consistency and required translation/attestation indicators. It flags uncertainty for human confirmation.
4. The workflow planner creates a dependency graph. For example, it identifies which tasks depend on the birth certificate and which later tasks require the child's passport or other documents.
5. The agent prepares application data and draft communications. It must not submit an application or pay fees without explicit authorization.
6. Where official integrations exist and are permitted, the agent checks status and updates the task graph. Without integration, it provides the official link, submission instructions and a user-confirmed status update.
7. It tracks deadlines, reminds the parent, identifies blockers and regenerates the plan when an application is rejected or the requirements change.
8. The case closes when the user confirms the intended documents have been received, or clearly records outstanding tasks outside the service's control.

**Expected output:** A family-specific checklist, required-document status, ordered task plan, prepared forms/messages, official links, deadline reminders, missing-item explanations and case tracker.

### Workflow B — Death and bereavement documentation

**Example user:** A family member dies in a Dubai hospital and the family must understand the required certificates, release formalities and next administrative steps. A separate path handles a death outside a hospital.

1. The user selects **Bereavement** and identifies only the minimum necessary case details: whether the death occurred in a hospital, whether authorities are already involved, nationality, intended burial/repatriation preference, and whether an authorized representative is helping.
2. **Urgent safety rule:** If the death occurred outside a hospital and police have not been notified, the agent presents the official emergency instruction to call **999** immediately. It does not replace emergency services or delay the call with data collection.
3. The agent retrieves the current official procedure for the relevant case and explains which authority handles each step. It clearly separates confirmed requirements from questions that must be answered by police, health authorities, the mortuary, a consulate or another competent authority.
4. The document agent creates a checklist for identity documents, death-certificate declaration, police stamping/NOCs and any other requirements confirmed by the official source for the case.
5. The coordinator prepares authorized communications and tracks which documents/approvals have been obtained. It may provide links and contact details for the relevant authority, but must not claim an approval exists without evidence.
6. If the family requests repatriation or consular assistance, the agent creates a separate path for embassy/consulate requirements, translations/attestations and transport-related permissions, subject to official confirmation.
7. The agent tracks next steps, unresolved dependencies and the status the family or authorized representative reports. It explains when a requirement must be confirmed by an official.
8. It provides a concise handover summary for the authorized family representative, without exposing personal documents to unrelated parties.

**Expected output:** A verified case-specific checklist, authoritative next-step instructions, document inventory, prepared communications, dependency/status tracker, and if requested, a separately tracked consular/repatriation path.

**Not in the initial MVP:** Medical or forensic judgments, determining cause of death, deciding eligibility for release, issuing official certificates/NOCs, making legal determinations, authorizing body release/transport, or making decisions on behalf of a public authority.

---

## 5. Agent architecture

Use an orchestrated set of specialized agents with a shared, auditable case state. The agents should not independently invent rules or execute uncontrolled actions.

| Agent | Responsibility | Output |
|---|---|---|
| **Intake & routing agent** | Determines whether the user needs the Birth or Bereavement workflow and asks only case-relevant questions. | Structured case profile and route |
| **Official-source retrieval agent** | Retrieves current information from approved UAE/Dubai government and participating authority sources. | Source-linked requirements with retrieval date |
| **Document validation agent** | Extracts fields from uploaded files and flags missing, inconsistent, unreadable or expired data. | Document inventory and exceptions list |
| **Dependency planner agent** | Builds and updates a directed task graph based on prerequisites and the user's case. | Ordered action plan with blockers/deadlines |
| **Service coordination agent** | Prepares official forms, messages and requests; invokes only approved integrations and only at the permitted authorization level. | Drafts, submission receipts or explicit manual-next-step instructions |
| **Status & follow-up agent** | Tracks confirmed status, reminders, missing responses and revised dependencies. | Case tracker and next-action recommendations |
| **Policy/safety checker** | Checks source authority, data minimization, consent, deadlines, prohibited actions and emergency handling before execution. | Allow/block/escalate decision with reason |

### Architecture principle

The LLM may interpret and plan, but critical rules such as required fields, submission permissions, escalation triggers and state transitions should be enforced by deterministic workflow logic. Every consequential action must be recorded in an audit log.

---

## 6. Functional requirements

### FR-01 — Case routing
- Support two distinct case types: `BIRTH` and `BEREAVEMENT`.
- Ask only information needed for that workflow and jurisdiction.
- Support a human/authorized-representative mode with explicit authorization records.

### FR-02 — Official requirements retrieval
- Prefer approved official sources, with source URL, title, retrieval date and relevant excerpt stored for every material instruction.
- Indicate when a rule is case-dependent, ambiguous or unverified.
- Recheck source freshness before presenting deadlines or document requirements.

### FR-03 — Document intake and checks
- Accept PDF and image uploads in the MVP.
- Extract fields such as names, dates, document type, issuer and expiry date where applicable.
- Show extracted values for the user to confirm before using them.
- Never fabricate missing data or silently correct identity details.

### FR-04 — Dependency-aware planning
- Represent every task with prerequisites, owner, status, due date (if officially confirmed), evidence, source and next action.
- When a prerequisite is delayed or rejected, recompute the downstream plan.
- Distinguish official deadlines from internal reminder dates.

### FR-05 — Tool execution and approvals
- In MVP, prepare applications and draft requests; default to user-confirmed manual submission.
- For any later integration, use least-privilege authentication, user consent and explicit confirmation before submission, payment, appointment booking or sharing documents.
- Never claim that an application was submitted or approved unless a trusted integration or receipt confirms it.

### FR-06 — Case status and follow-up
- Track `NOT_STARTED`, `READY`, `AWAITING_USER`, `AWAITING_AUTHORITY`, `BLOCKED`, `COMPLETED`, and `NEEDS_HUMAN_REVIEW` states.
- Support reminders that users can configure and stop.
- Preserve a concise event log of completed actions and source evidence.

### FR-07 — Accessibility and tone
- Use clear, plain language and provide Arabic/English support in a later iteration if feasible.
- For bereavement, use a compassionate, low-pressure interface and avoid promotional messaging or unnecessary notifications.

---

## 7. Data inputs and integrations

### MVP inputs
- User-provided event details and family role/authorization.
- Scanned PDFs/images of relevant identity and event documents.
- Officially published checklists, forms, URLs and service instructions.
- User-confirmed status updates and submission receipts.

### Potential integrations (future; approval required)
- Hospital birth notification or discharge systems.
- Dubai Health Authority / other competent health-authority services.
- ICP identity, passport/residency and Emirates ID services.
- Police and morgue-related service channels for death procedures.
- UAE Ministry of Foreign Affairs and relevant consular/embassy channels.
- Authorized courier, appointment and document-attestation providers.

**No access is assumed.** Government or hospital system access would require explicit authorization, security review, approved technical integration and an agreed service owner. Do not scrape authenticated systems or automate access in violation of their terms.

---

## 8. Privacy, safety and governance requirements

Birth and death workflows process highly sensitive personal and family information. Trust and governance are core system requirements, not later enhancements.

- **Data minimization:** collect only the information needed for the chosen workflow and delete optional files when no longer needed under the approved retention policy.
- **Consent and authority:** verify that the user is a parent, authorized representative or otherwise permitted to access/submit the relevant information. Do not infer legal authority from possession of a document.
- **Secure storage:** encrypt data in transit and at rest, separate each family case, enforce role-based access, and log access to sensitive records.
- **No cross-case leakage:** no document, identity field or case detail may be visible to another family or used to answer unrelated users.
- **Human confirmation:** show extracted identity fields to the user before populating forms. Require approval before sharing documents or submitting requests.
- **Source-grounded guidance:** display official source links and last-checked dates. If source information conflicts or cannot be verified, pause and direct the user to the competent authority.
- **No legal/medical authority claims:** the agent explains administrative processes; it does not make medical, forensic, legal or official eligibility decisions.
- **Emergency behavior:** in a death-outside-hospital scenario where authorities have not been notified, show the official instruction to call 999 immediately; do not make completion of intake a prerequisite.
- **Bereavement sensitivity:** no false promises, speculative timelines, or automatic non-essential messages to grieving family members.
- **Auditability:** log what the agent read, inferred, recommended, drafted and executed, plus who approved consequential actions.

Before any real deployment, obtain legal, privacy, cybersecurity and service-owner review from the relevant UAE/Dubai authorities. This document is not legal advice.

---

## 9. MVP scope for a competition demo

### Build
1. A web/mobile-friendly interface with two entry points: **Register a birth** and **Handle a death in the family**.
2. A source-grounded rules library built from official public documentation.
3. Upload and OCR/extraction for sample documents, with the user confirming the extracted fields.
4. An orchestrator that creates a dependency graph and dynamically replans when a document or step is missing.
5. Mock service adapters for health authority, ICP, consular services and other channels.
6. Draft application/message generation, approval gates, case status tracker and an event audit log.
7. A clear “official submission required” state for every action not connected to a verified live integration.

### Do not build in the first demo
- Live submission to government systems without a formal integration.
- Automated legal or medical decisions.
- Live payment processing or document issuance.
- Real personal data from families; use synthetic, consented test data.
- Automated contact with embassies, police, hospitals or funeral providers without authorization.

### Demo scenario A — Birth
A sample expatriate family uploads a birth notification and parents' documents. The agent identifies missing/unclear items, generates a source-linked checklist, orders downstream steps, prepares the next application and replans when a document is marked unavailable.

### Demo scenario B — Bereavement
A sample user selects “death occurred in hospital.” The agent retrieves the relevant official procedure, produces a case-specific checklist, tracks confirmed documents and NOCs, then creates a separate consular/repatriation branch if requested. A second test confirms that a “death outside hospital / authorities not notified” selection immediately surfaces the official 999 instruction.

---

## 10. Success metrics

Compare the agent with a baseline in which test users follow official websites and checklists manually.

| Metric | How to measure |
|---|---|
| **Time to a correct action plan** | Minutes from first input to an authority-source-linked plan confirmed by a reviewer |
| **Checklist completeness** | Proportion of required case-specific items correctly identified against an expert-reviewed reference checklist |
| **Dependency accuracy** | Proportion of task prerequisites and sequence relationships correctly represented |
| **Unsupported-claim rate** | Count of deadline, document or process claims not supported by an approved source; target is zero for critical requirements |
| **Replanning quality** | Whether the agent correctly updates downstream tasks after a prerequisite fails or changes |
| **User effort** | Number of repeated questions, manual lookups and avoidable re-entry steps in a controlled test |
| **Safe execution** | Number of consequential actions executed without explicit authorization; target is zero |
| **User comprehension** | Whether test users can explain the next step and what's blocking completion after using the service |

Do not claim that the product reduces official processing time unless it has been tested with real service-owner data. An MVP can credibly measure preparation time, checklist quality and user effort.

---

## 11. Competitive differentiation and questions to validate

### Existing capabilities that must be respected
- UAE nationals already have **Mabrouk Ma Yak**, an integrated newborn-services bundle.
- Official government portals publish birth and death requirements; ICP provides a digital residency-application process.
- DHA and other competent health authorities issue birth/death notifications and certificates according to established procedures.

### Proposed differentiation to test
LifeEvent Navigator is not a new certificate issuer and not just a chatbot. Its proposed role is a **persistent cross-service coordinator** that:
1. personalizes the authoritative checklist to a family's circumstances;
2. tracks prerequisites across separate service owners;
3. validates documents and catches missing/inconsistent fields before submission;
4. prepares approved actions and tracks receipts/responses;
5. replans the remaining journey after delays, rejection or changing requirements.

### Questions for discovery interviews
- Which birth/death steps already exchange data automatically between authorities?
- Which user groups still need to coordinate separate channels, especially expatriate families?
- Where do applicants most often submit incomplete or inconsistent documents?
- Can an authorized third-party agent check status or prepare submissions through supported APIs?
- Which actions must remain entirely with the family or a licensed/authorized representative?
- What is the existing service's baseline for number of steps, repeat visits, document rejections and time spent by families?

**Proceed only if interviews and workflow mapping establish an unmet coordination gap.** If the current government bundle already covers a specific user group end-to-end, do not duplicate that workflow; focus on a validated underserved path or revise the concept.

---

## 12. Suggested technical architecture

- **Frontend:** responsive web application with a step-by-step case workspace.
- **Backend:** FastAPI service with authentication, case management and workflow orchestration.
- **Agent orchestration:** state-machine/graph workflow with specialized agents and explicit tool permissions.
- **Document processing:** OCR/document extraction service; extracted fields stored separately from raw files when practical.
- **Knowledge retrieval:** retrieval-augmented search over an approved, versioned set of official UAE/Dubai sources.
- **Structured state:** relational database for users, authorized representatives, tasks, dependencies, source citations, approvals and event logs.
- **File storage:** encrypted object storage with short-lived authorized download URLs and configurable retention.
- **Mock tools:** simulated authority endpoints for demo submission/status responses.
- **Monitoring:** full execution trace, source versions, agent errors, safety blocks and approval records.

### Guardrails for agent execution
1. Model-generated instructions are suggestions; a policy engine checks them before tool use.
2. Each task and action has an explicit permission level: `READ`, `DRAFT`, `SUBMIT_WITH_APPROVAL`, or `NOT_ALLOWED`.
3. The agent may not invent a completed status. A completion state needs a trusted service response, official receipt or user-confirmed evidence clearly labelled as such.
4. The workflow can pause and ask a human for clarification whenever eligibility or requirements are uncertain.

---

## 13. Source list

1. **UAE Government — Having a baby** (birth registration, deadlines, documentation and Mabrouk Ma Yak): https://u.ae/information-and-services/social-affairs/having-a-baby
2. **ICP — Issuing Residency Permit** (application, document, payment and follow-up steps): https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e64
3. **UAE Government — Deaths** (reporting a death, death-certificate declaration, police stamping/NOCs and expatriate consular formalities): https://u.ae/en/information-and-services/social-affairs/deaths
4. **Dubai Future Foundation — DCAI Accelerators / Agentic AI for Government Services Accelerator** (service journey, governance, human oversight and measurable-impact priorities): https://www.dubaifuture.ae/dcai-accelerators/
5. **Dubai Health Authority — Birth/death certificate procedure circular** (10 January 2025): https://services.dha.gov.ae/sheryan/wps/portal/home/circular-details%20?circularRefNo=CIR-2025-00000007&fromHome=true&isPublicCircular=1
6. **Dubai Health Authority — Procedure update: death notification issuance** (20 April 2026): https://services.dha.gov.ae/sheryan/wps/portal/home/circular-details?circularRefNo=CIR-2026-00000061&fromHome=true&isPublicCircular=true

---

## 14. Final recommendation

LifeEvent Navigator AI is a single personal-agent use case with two distinct modes: **Birth Documentation** and **Bereavement Documentation**. It is grounded in official UAE process documentation and fits the Dubai accelerator's stated interest in end-to-end public services.

Its strongest claim is not that the government lacks digital services. It is that a trusted agent may reduce the family’s coordination burden by creating and maintaining the correct end-to-end plan across existing services.

The next step is to map the actual current journeys for one expatriate birth scenario and one hospital-death scenario, interview a small number of affected users or service experts, and document exactly which coordination tasks remain manual or fragmented. Only then should the team make a novelty claim or commit to the full MVP.
