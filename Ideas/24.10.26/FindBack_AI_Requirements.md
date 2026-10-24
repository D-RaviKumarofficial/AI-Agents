# FindBack AI — Personal Lost-Property Recovery Agent

**Document type:** Product requirements / MVP specification  
**Target category:** Personal AI Agent  
**Initial geography:** Dubai, UAE  
**Version:** 1.0  
**Status:** Proposed concept; integrations and originality require validation

---

## 1. Product vision

FindBack AI helps a person recover a lost item by reconstructing where it may have been lost, searching connected lost-and-found channels, matching available evidence, and coordinating the recovery workflow until the owner receives the item or the case is closed.

It is not intended to replace Dubai Police, RTA, venue lost-and-found teams, or their existing services. Its proposed value is coordinating the user’s search across multiple providers so the user does not have to repeat the same process independently.

## 2. Evidence of the problem

- Dubai’s Roads and Transport Authority (RTA) reported **104,162 lost-property reports in taxis during 2025**, including around 35,000 electronic devices and approximately 3,000 passports and official documents. The RTA describes an established process involving trip verification, communication with drivers, and tracking through closure.
- Dubai Police reported **159,962 lost-belonging reports** and **171,490 items returned to their owners** in 2025. Its existing lost-and-found service already supports reporting and application-status tracking.

These figures establish a meaningful personal problem, but they also show that public agencies already have systems. FindBack must therefore prove that cross-provider coordination and evidence-based search add measurable value instead of duplicating existing services.

Sources:
- [Dubai RTA: Handling over 104,000 lost-property reports in taxis during 2025](https://rta.ae/wps/portal/rta/ae/home/news-and-media/all-news/NewsDetails/handling-over-104000-lost-property-reports-in-taxis-during-2025)
- [Dubai Police: Lost-and-found service catalogue](https://www.dubaipolice.gov.ae/app/services/)
- [Dubai Police: More than 171,000 lost items returned in 2025](https://cd1.mediaoffice.ae/en/news/2026/march/30-3/dubai-police-return-over-171000-lost-items-to-owners-in-2025)

## 3. Unique MVP use case

**Scenario:** A visitor leaves a backpack containing a phone and passport in an RTA taxi, then visits a shopping mall. After noticing the loss, the visitor does not know whether the bag is still in the taxi, was handed to the mall’s lost-property desk, or was submitted to an official lost-and-found service.

The user gives FindBack a photo or description of the backpack, their approximate journey timeline, taxi trip details if available, and permission to search the connected sources. FindBack builds a time-ordered search plan, queries authorised systems, scores possible matches, prepares missing reports, and tracks responses. If an authorised venue camera system is integrated, the agent may request a limited search of relevant footage through the venue’s approved process; it must not access CCTV without permission.

**Success outcome:** The user receives a verified recovery lead and a clear next step, or a consolidated record of where the item was reported and which searches remain open.

## 4. Goals and non-goals

### Goals
- Reduce the time and effort needed to search across multiple lost-and-found providers.
- Turn an unstructured loss story into a timeline, searchable description and actionable case.
- Rank possible matches using explainable evidence, not an unsupported claim of certainty.
- Prepare reports and messages, track case references and remind the user of pending steps.
- Protect sensitive item details and require proof of ownership before revealing or collecting a found item.

### Non-goals for MVP
- No direct, unrestricted access to police, taxi, airport, mall or private CCTV systems.
- No face recognition or public identification of people in video.
- No claim that the system can guarantee recovery.
- No autonomous release of a found passport, phone or other valuable property without the responsible provider’s identity-verification process.
- No scraping of private systems or circumventing access controls.

## 5. Target users

- Residents and visitors who lose a valuable item while travelling between places.
- People who have lost an item in a taxi, mall, public venue or other participating location.
- Venue or transport lost-and-found teams (future partner users), subject to consent and integration agreements.

## 6. Inputs and outputs

### Inputs
- User description of the item, item category and approximate replacement value (optional).
- Item photographs, distinctive visible features, brand/model and colour.
- Time window and likely locations or journey sequence.
- Taxi trip receipt/reference, ride-booking record, parking/ticket receipt or other travel evidence where available.
- Contact information and explicit permission to submit each report or contact a provider.
- Optional authorised venue camera footage or search result provided through a legitimate integration.

### Outputs
- A reconstructed timeline with confidence labels and the evidence behind each location.
- Search plan across relevant connected providers.
- Candidate matches with reasons, uncertainty and next action.
- Draft or submitted reports, only after user approval where submission is supported.
- Case references, responses, reminders and a recovery/collection plan.
- An audit log showing what data was accessed and which actions were taken.

## 7. Agent architecture

Use a **supervisor-and-specialists** pattern. Agents should perform defined tool calls and return structured results; a large number of agents is not itself the innovation.

1. **Intake Agent** — asks for missing details, extracts item attributes from text/images, and flags sensitive item data.
2. **Journey Reconstruction Agent** — creates a time-and-location timeline from user-supplied trip details, receipts and authorised records.
3. **Source Search Agents** — query separate adapters for participating transport, venue and official lost-and-found channels. Each adapter reports its source, timestamp, result and limitations.
4. **Visual Match Agent** — compares item-level features from user photos with authorised candidate images or test CCTV frames. It returns a match score and visual evidence; it does not identify bystanders.
5. **Evidence & Ownership Agent** — checks for contradictory details, keeps private proof-of-ownership fields hidden from public reports, and identifies what a provider needs to verify ownership.
6. **Case Coordinator Agent** — prioritises next actions, requests permission before external submissions, tracks responses, retries failed queries and updates the plan.
7. **Verification Agent** — checks that a reported action actually completed (for example, that a provider returned a receipt/reference or confirmed a handover), rather than treating a successful tool call as proof of recovery.

## 8. Main workflow

1. User creates a lost-item case and confirms consent and contact channel.
2. Intake Agent builds an item profile and asks only for essential missing details.
3. Journey Reconstruction Agent produces a time-ordered set of likely locations.
4. Coordinator selects relevant connected sources based on the item and journey; it queries sources in parallel where allowed.
5. Search agents return candidate records with source attribution and time stamps.
6. Visual Match Agent compares candidate item characteristics where images are available and lawful to process.
7. The system ranks candidates and explains why each is plausible. If evidence is weak or conflicting, it asks the user instead of guessing.
8. User approves a report, contact or data-sharing action before it is sent.
9. Coordinator tracks replies, deadlines and requested documents; it replans when a source has no result.
10. Recovery is closed only after an authorised provider or user confirms return, or the user closes the case.

## 9. Functional requirements

- **FR-01 Case creation:** Create, edit, pause and close a lost-property case.
- **FR-02 Structured intake:** Accept text, images and documents; extract candidate item attributes and let the user correct them.
- **FR-03 Timeline:** Represent time windows, locations and source confidence separately; never invent exact location/time.
- **FR-04 Search orchestration:** Query only configured, authorised source adapters and record unavailable sources honestly.
- **FR-05 Match ranking:** Rank candidates with visible evidence and uncertainty; allow the user to mark false matches.
- **FR-06 Reporting:** Generate provider-specific report drafts from confirmed details; require approval before external submission.
- **FR-07 Case tracking:** Save reference numbers, status, next action, timestamps and replies.
- **FR-08 Follow-up:** Recommend or trigger reminders based on case status; ask before sending messages to third parties.
- **FR-09 Ownership protection:** Keep secrets (serial number, hidden mark, document number) private and use them only for verification where necessary.
- **FR-10 Auditability:** Display a human-readable activity log and the source behind each factual claim.
- **FR-11 Multilingual support:** MVP should handle English; architecture should allow Arabic and other languages as later additions.
- **FR-12 CCTV adapter (optional):** Use only venue-authorised, purpose-limited search with explicit approval, narrow time/location range, retention limits and no facial identification.

## 10. MVP scope

### Build now
- Web/mobile-friendly case intake.
- A user-confirmed timeline builder.
- Synthetic lost-and-found databases and mock transport/venue adapters.
- Image-based matching between a user’s item photo and a small, labelled test collection.
- A multi-agent search planner, candidate ranking and explanation view.
- Report drafting, simulated submission, case tracker and audit log.
- A demo mode that shows what happens when a provider returns a match, no match, contradictory information or an unavailable service.

### Future integration, after permission is obtained
- RTA or taxi operator reporting/status interfaces.
- Dubai Police or participating venue workflows.
- Mall, airport, hotel and public-transport lost-and-found systems.
- Venue-authorised CCTV search service. No direct CCTV connection is assumed for the MVP.

## 11. Data model (minimum)

- `Case`: case_id, owner_id, created_at, status, language, consent_flags.
- `ItemProfile`: category, description, brand, colour, visible_features, private_verification_fields, image_refs.
- `JourneyEvent`: time_start, time_end, location, source, confidence, user_confirmed.
- `SearchTask`: provider, query_summary, status, attempted_at, result_ref, access_basis.
- `CandidateMatch`: candidate_id, source, item_similarity, time_fit, location_fit, evidence_notes, confidence, status.
- `ExternalAction`: action_type, recipient/provider, approval_time, submission_status, reference_id.
- `AuditEvent`: actor, action, data_category, timestamp, outcome.

Store images and sensitive documents with controlled access and short, explicit retention periods. Do not store full passport numbers or other sensitive values unless essential to the case and approved by the user.

## 12. Non-functional and safety requirements

- **Privacy by default:** collect only what is required; encrypt data in transit and at rest; support case deletion and consent withdrawal.
- **Least privilege:** integrations use scoped credentials and only query permitted records.
- **No unsupported certainty:** show evidence and confidence; use “possible match”, not “found”, until verified.
- **Human approval:** required for messages, external submissions, sharing personal data, bookings and handover arrangements.
- **Security:** authentication, role-based access, secrets management, rate limits, audit logs and safe file-upload handling.
- **Reliability:** use retries and idempotency for tool calls; never submit duplicate reports without checking status.
- **Accessibility:** plain-language progress, mobile-first interface and clear next actions.

## 13. Evaluation metrics

Test against a baseline where a user manually searches each source one by one.

- Top-1 and top-3 candidate-match precision on labelled test cases.
- Median time from case creation to first useful lead.
- Percentage of cases with a complete timeline and source attribution.
- Percentage of external actions with explicit approval and a recorded reference.
- False-positive rate, duplicate-report rate and unsupported-claim rate.
- Completion rate for simulated recoveries and successful re-planning after a source fails.
- User effort: number of separate forms or contacts the user must handle compared with the baseline.

**MVP acceptance target:** In a labelled simulation set, the agent produces a traceable search plan, ranks a true candidate within the top three in the agreed test cases, never treats an unverified candidate as a confirmed recovery, and requires approval for every external submission.

## 14. Demo plan

Use one scenario: a backpack with a distinctive blue tag is lost between a taxi and a mall. Provide synthetic taxi trip data, mock venue lost-property records, a small candidate-image set and one deliberately misleading match. Demonstrate timeline reconstruction, multi-source searches, visual ranking, rejection of the misleading match, user-approved report submission and follow-up until handover confirmation.

## 15. Key risks and mitigations

- **Restricted data/CCTV access:** use simulated footage initially; pursue formal partnerships later.
- **False visual matches:** rank candidates, expose evidence and require provider/owner verification.
- **Existing government systems:** position FindBack as a coordination layer, not a replacement; validate whether the added workflow measurably improves outcomes.
- **Sensitive documents:** mask private identifiers and do not expose them in messages or public search queries.
- **Unresponsive providers:** keep status honest and present alternate channels rather than claiming completion.

## 16. Research question to validate before competition submission

Can FindBack reduce the number of separate user actions and the time to a verified recovery lead compared with Dubai’s existing lost-and-found channels, while keeping false matches and privacy exposure low?

The concept should not be described as globally unprecedented until existing products, research papers and patent literature have been reviewed.
