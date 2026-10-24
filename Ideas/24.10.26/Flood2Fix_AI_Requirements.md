# Flood2Fix AI — Personal Flood-Damaged Vehicle Recovery Agent

**Document type:** Product requirements / MVP specification  
**Target category:** Personal AI Agent  
**Initial geography:** Dubai, UAE  
**Version:** 1.0  
**Status:** Proposed concept; integrations and originality require validation

---

## 1. Product vision

Flood2Fix AI helps a vehicle owner manage the complicated aftermath of flood or severe-weather damage. It organises visual evidence, identifies official documentation steps, coordinates towing and inspection options, prepares insurance-claim materials, and tracks actions across the relevant providers.

It is not a damage adjuster, insurer, police service or repair shop. Its proposed value is coordinating a multi-step personal recovery case and verifying progress across separate services.

## 2. Evidence of the problem

- In March 2026, Dubai Police issued **720 “To Whom It May Concern” vehicle-damage certificates** following severe weather, according to Gulf News. These certificates were being used in the insurance-claim process for vehicles damaged during adverse weather.
- Dubai Police’s official services include requests for certificates and “To whom it may concern” services. Official channels and requirements must be checked at the time of use; Flood2Fix should not assume that the same steps apply to every policy or incident.

Sources:
- [Gulf News: Dubai Police issued 720 vehicle-damage certificates following severe weather](https://gulfnews.com/uae/emergencies/did-your-car-get-damaged-in-dubai-police-explain-how-to-claim-1.500489916)
- [Dubai Police: Official services portal](https://www.dubaipolice.gov.ae/app/services/)
- [Dubai Police: Certificate service information](https://www.dubaipolice.gov.ae/app/home/media/news/news-details?id=zy84ajpi50la1wklmgraqlpj)

These sources validate the existence of the recovery/documentation problem. They do not prove that all insurers share the same workflow or that an AI agent can automatically settle claims.

## 3. Unique MVP use case

**Scenario:** After heavy rain, a resident discovers their car has been flooded in an underground parking area. They have photos of the water level and visible interior damage but do not know whether to start the car, which evidence to preserve, how to obtain the relevant official certificate, how to arrange safe towing, or what their insurer needs next.

Flood2Fix first provides safety-first instructions: do not start a potentially water-damaged vehicle and do not enter floodwater or an unsafe parking area to collect evidence. It then asks for the minimum incident details, organises photos and timestamps, checks the current official documentation route, identifies the insurer’s stated requirements, and coordinates only those actions the owner approves. It tracks the claim and inspection until an outcome or explicit blocker is recorded.

**Success outcome:** The owner receives a traceable evidence package, completes the required authorised steps, and knows the verified status and next action at every stage.

## 4. Goals and non-goals

### Goals
- Reduce confusion and repeated data entry after weather-related vehicle damage.
- Preserve a time-ordered evidence record from photos, receipts, location and official documents.
- Identify missing documents and dependency order among police documentation, towing, inspection and insurance.
- Coordinate quotes, bookings and follow-ups with the owner's approval.
- Make case status and unresolved blockers clear.

### Non-goals for MVP
- No autonomous mechanical diagnosis or guarantee of repair cost.
- No guarantee that an insurer will accept a claim or that a policy covers a particular event.
- No emergency response or entry into unsafe/flooded locations.
- No direct access to insurer or police systems unless an authorised integration exists.
- No automatic towing order, payment, claim submission or acceptance of a settlement without the owner's explicit approval.

## 5. Target users

- Dubai residents whose vehicle was damaged by flooding or severe weather.
- Visitors or temporary residents managing a damaged rental or personally owned vehicle, subject to the rental contract and provider process.
- Future partner users: authorised insurers, towing providers, repair centres and vehicle inspectors.

## 6. Inputs and outputs

### Inputs
- Vehicle make/model/year, plate or VIN (only where necessary), owner contact and preferred language.
- Incident time window, location and description of conditions.
- Phone photos or video of the vehicle and visible damage; dashcam footage or parking CCTV clips only when lawfully obtained.
- Weather or location evidence from permitted sources, where available.
- Insurance policy schedule, relevant coverage wording, claim contact details and insurer instructions.
- Official reports/certificates, towing receipts, inspection estimates, repair quotes and communications.
- User consent for each external contact, data share, booking, submission or payment.

### Outputs
- Incident timeline and organised, timestamped evidence bundle.
- Safety and documentation checklist tailored to the known circumstances.
- Current official certificate/report route and verified requirements, with links and retrieval time.
- Insurer-specific missing-document checklist based on provided policy/instructions.
- Comparison of tow/inspection/repair options where reliable quotes are available.
- Drafted or user-approved requests/claims, reference numbers and case tracking.
- Status summary: completed, waiting, rejected, needs user action or blocked.

## 7. Agent architecture

1. **Incident Intake Agent** — captures incident facts, vehicle details, policy information and consent; flags immediate safety concerns.
2. **Visual Evidence Agent** — classifies visible evidence (for example, waterline or visible interior damage), timestamps and labels media, and notes uncertainty. It must not infer hidden mechanical safety from images.
3. **Official Requirements Agent** — checks current official Dubai Police/authority guidance and records the source, access time and relevant eligibility/requirements. It does not invent rules.
4. **Policy & Claim Agent** — extracts relevant user-provided policy language and insurer instructions, flags exclusions or ambiguities for human review, and generates a checklist. It does not make binding coverage decisions.
5. **Provider Coordination Agents** — separately identify eligible towing, inspection and repair options, compare available cost/timing information, and prepare quote or booking requests.
6. **Case Dependency Agent** — maintains the order of work, such as safety → evidence → required official documents → insurer notification/inspection → towing/repair as appropriate to insurer instructions.
7. **Follow-up & Verification Agent** — tracks submissions and replies, confirms reference numbers and appointment status, and replans when a provider is unavailable or requests more documents.
8. **User Approval Gate** — requires explicit approval for external communication, document sharing, bookings, payments and claim submissions.

## 8. Main workflow

1. User opens a “weather/flood vehicle damage” case.
2. Intake Agent checks for immediate danger and presents safety guidance; emergency incidents are directed to relevant official emergency services.
3. User provides photos/video and incident details when safe to do so. The system records timestamps and user-supplied context.
4. Visual Evidence Agent organises images and marks visible observations versus uncertain interpretations.
5. Official Requirements Agent verifies the current certificate/report path from official sources and explains what is known or still needs confirmation.
6. Policy & Claim Agent turns the owner’s provided policy and insurer instructions into a document checklist and highlights ambiguous clauses for insurer confirmation.
7. Case Dependency Agent creates a plan and shows which actions depend on other steps.
8. Provider agents obtain available towing, inspection and repair options through approved sources. Estimates are labelled as quoted, estimated or unavailable.
9. The user approves each external action; the agent submits or prepares the relevant request only through authorised channels.
10. Follow-up Agent tracks responses, requests missing documents and updates the plan after new information or rejection.
11. Close the case only when the owner confirms repair/recovery completion or explicitly chooses to stop. Keep the final summary and outstanding items available for export.

## 9. Functional requirements

- **FR-01 Case intake:** Create and manage a vehicle damage case with incident time, place, vehicle and user details.
- **FR-02 Safety-first:** Show clear safety guidance for potentially flooded vehicles and unsafe locations; never encourage starting a water-damaged vehicle or entering floodwater.
- **FR-03 Evidence management:** Upload photos, videos, PDFs and receipts; store original files and metadata, with a visible timeline.
- **FR-04 Visual triage:** Tag visible damage and possible water exposure, while explicitly distinguishing observations from assumptions.
- **FR-05 Official-source lookup:** Retrieve and cite current official requirements and links; display when a source was checked.
- **FR-06 Policy checklist:** Extract relevant policy clauses from user-provided documents and create a checklist, with uncertainty flags and no guarantee of coverage.
- **FR-07 Dependency planning:** Represent tasks, prerequisites, status, deadline if verified, owner and blocker.
- **FR-08 Provider options:** Compare available towing/inspection/repair options using quote source, price, ETA and availability where provided.
- **FR-09 Approval controls:** Obtain user approval before sharing personal/vehicle data, contacting a provider, booking, paying or submitting a claim.
- **FR-10 Case tracking:** Save claim/report references, response status, follow-up dates, required documents and provider communications.
- **FR-11 Replanning:** If a provider is unavailable or asks for new evidence, update dependencies and suggest the next feasible plan.
- **FR-12 Export:** Generate an evidence bundle and a human-readable event timeline for the owner, insurer, repairer or authorised adviser.
- **FR-13 Auditability:** Record source links, retrieval times, user approvals, actions and outcomes.
- **FR-14 Optional camera integration:** Process dashcam or parking CCTV footage only when supplied or accessed with proper authorisation; no assumed direct CCTV access.

## 10. MVP scope

### Build now
- Mobile-friendly case intake and evidence upload.
- Synthetic weather-damage cases with labelled images and documents.
- Evidence timeline and visual tagging for visible water damage.
- Official-source retrieval with source links and retrieval timestamp.
- User-supplied sample policy and insurer document extraction.
- Dependency-based task planner and simulated provider adapters for towing, inspection and repairs.
- Claim/document checklist, approval screens, mock submissions, follow-up tracker and exportable case bundle.
- Demo failure conditions: missing document, provider unavailable, insurer requests more evidence and contradictory timestamps.

### Future integration, after permission is obtained
- Live weather feeds and verified location data.
- Dubai Police certificate/report service flow, subject to official access rules.
- Participating insurer claim APIs or authorised portal workflow.
- Towing, vehicle inspection and repair providers with confirmed availability/quotes.
- Authorized parking/vehicle imagery sources where appropriate.

## 11. Data model (minimum)

- `DamageCase`: case_id, owner_id, vehicle_id, incident_time, incident_location, event_type, status, consent_flags.
- `Vehicle`: make, model, year, plate_or_vin_reference, ownership_or_rental_type.
- `EvidenceAsset`: file_ref, media_type, capture_time, upload_time, user_description, visible_observations, confidence, source.
- `PolicyRequirement`: insurer, source_document, requirement, source_location, verification_status, reviewed_by_user.
- `Task`: task_id, type, prerequisite_ids, status, owner, due_date_if_verified, blocker, next_action.
- `ProviderOption`: provider, service_type, quote, estimated_arrival, availability_status, source_time, user_selected.
- `ExternalAction`: action_type, recipient, approval_time, submission_status, reference_id.
- `CaseEvent`: timestamp, actor, event_type, evidence_refs, result, next_step.
- `AuditEvent`: actor, data_shared, recipient, purpose, approval and outcome.

## 12. Non-functional and safety requirements

- **Safety:** Prioritize official emergency guidance. Do not advise driving, starting or entering a potentially water-damaged vehicle based only on AI image analysis.
- **Privacy:** Encrypt evidence and policy documents; use least-privilege access; provide export and deletion controls.
- **Factuality:** Official rules and policy details must be linked to sources. Do not invent deadlines, claim entitlements or guarantee coverage.
- **Human control:** User approval is mandatory for submissions, data sharing, bookings, payments and settlement decisions.
- **Reliability:** Use idempotent operations and status checks to avoid duplicate submissions or bookings.
- **Traceability:** Keep a chronological record of evidence, recommendations, approvals, provider replies and status changes.
- **Resilience:** If live sources are unavailable, report that limitation and offer a preparation checklist instead of implying an action succeeded.

## 13. Evaluation metrics

Compare the agent with a baseline manual checklist and single chatbot workflow using a set of simulated incidents.

- Completeness and factual accuracy of the evidence bundle.
- Percentage of recommended actions supported by current source links or user-provided documents.
- Rate of correct identification of missing documents.
- Correct ordering of dependent tasks.
- Successful recovery from simulated blockers, provider rejection and missing evidence.
- Number of repeated user actions and time to reach a complete claim-ready package.
- Unsupported insurance-coverage claims, unsafe instructions and unapproved external actions (target: zero).
- Correct distinction between visible damage and unverified mechanical conclusions.

**MVP acceptance target:** For every test scenario, the system creates a timestamped evidence bundle and task plan, cites applicable official/insurer sources, flags uncertainty, never makes an unapproved external action, and successfully replans when a required document or provider is unavailable.

## 14. Demo plan

Use one scenario: heavy rain floods a vehicle in an underground car park. The owner has phone images, an insurer policy PDF and a towing receipt but lacks an official damage certificate and inspection report. Demonstrate safety-first guidance, evidence timeline creation, verified official-source lookup, policy checklist creation, task dependency planning, simulated certificate/insurer workflow, a provider-unavailable event, revised plan and export of the claim-ready evidence bundle.

## 15. Key risks and mitigations

- **Incorrect policy interpretation:** quote the relevant policy text, show uncertainty and direct the owner to confirm with the insurer.
- **Unsafe vehicle assumptions:** do not diagnose roadworthiness; use qualified inspection.
- **Changing official procedures:** retrieve current official information, show retrieval time and ask the user to confirm requirements when needed.
- **Unavailable integrations:** use simulated adapters for MVP and be transparent about what was not submitted.
- **Sensitive data:** mask unnecessary identifiers, limit retention and require consent before sharing documents.
- **Potentially ineligible claim:** describe this as a preparation/coordination tool, not a guarantee of reimbursement.

## 16. Research question to validate before competition submission

Can Flood2Fix reduce the time, missing-document rate and repeated manual coordination in a flood-damaged vehicle case compared with a checklist or chatbot, while maintaining zero unsafe advice and zero unapproved external actions?

The concept should not be described as globally unprecedented until existing products, research papers and patent literature have been reviewed.
