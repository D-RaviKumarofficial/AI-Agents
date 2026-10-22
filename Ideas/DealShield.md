# DealShield — Evidence-Based Business Transaction Verification Agent

- **Proposed competition category:** Best Business AI Agent
- **Project type:** Fraud-risk triage and transaction-verification workflow
- **Status:** Research concept; threat model and differentiation need validation
- **Dependency model:** Fully demoable using fictional invoices, purchase orders, supplier records, and simulated payment controls. No bank connection or real payment authority is required.

## 1. Project summary

**DealShield investigates suspicious business payment instructions before a transaction is approved.** It compares an invoice or payment request with trusted records, identifies changes and inconsistencies, gathers supporting evidence, and starts a verification workflow. It can place a transaction on hold in a sandbox, but it must never move real money or change bank details autonomously.

## 2. Problem being addressed

Businesses may receive fraudulent or compromised instructions through email, invoices, messaging, or convincing impersonation. Examples include:

- A request to change a supplier's bank details.
- An invoice that differs from an approved purchase order.
- A sender who impersonates an executive, supplier, or business partner.
- A false claim that an urgent payment is required immediately.
- A business deal whose company identity, terms, or payment destination cannot be corroborated.

A text classifier alone is not sufficient: legitimate messages can look unusual, and fraudulent messages can look professional. The proposed agent must compare records, apply policy, explain the evidence, and require independent verification when trust is insufficient.

### Why this connects to Dubai's priorities

The Economic Security Center of Dubai launched an economic-fraud awareness campaign in December 2025 that highlighted AI-generated deepfakes, phishing, fraudulent investment schemes, and deceptive commercial deals. This establishes fraud prevention as a documented public concern, but does not prove that any specific organization has a particular unresolved loss pattern.

## 3. What DealShield will solve

DealShield will help an accounts-payable or operations team identify payment requests that need extra scrutiny and make the next safe step clear. It should prioritize understandable evidence and safe handling over an opaque fraud score.

### Target users

- Small and medium-sized businesses
- Accounts-payable and procurement teams
- Finance operations and internal-control teams
- Businesses that process supplier invoices or payment-detail changes

## 4. Core agent workflow

1. **Receive a request:** Load a fictional invoice, email, payment-change request, purchase order, and supplier master record.
2. **Extract and normalize fields:** Identify supplier name, invoice number, dates, amount, purchase-order reference, and payment destination where available.
3. **Cross-check trusted records:** Compare details against the approved supplier profile, purchase order, past invoice patterns, and configured policy.
4. **Investigate anomalies:** Check changed bank details, duplicate invoice identifiers, amount differences, unusual urgency, missing purchase-order evidence, and sender mismatch.
5. **Gather evidence:** Link each alert to the exact fields or records that caused it.
6. **Choose a safe action:** Mark as normal, request clarification, require independent verification, or hold the case in the simulated workflow.
7. **Verify independently:** Generate a checklist for confirmation through a previously trusted contact channel; never use only the potentially compromised message to verify itself.
8. **Record the decision:** Produce an audit log and incident summary for a human reviewer.

## 5. Agent tools / callable functions

| Tool | Purpose | Guardrail |
|---|---|---|
| `parse_transaction_documents` | Extract fields from invoice, PO, email, and payment-change request | Preserve source references and extraction confidence |
| `get_supplier_profile` | Read the sandbox's approved supplier record | Read-only; record version and source |
| `compare_invoice_to_po` | Compare supplier, amount, currency, line items, and references | Use deterministic comparison rules |
| `check_payment_destination_change` | Detect a change from previously approved details | A change triggers verification; it is not by itself proof of fraud |
| `check_duplicate_invoice` | Search internal sample ledger for duplicate identifiers or amounts | Explain matching fields and uncertainty |
| `evaluate_transaction_policy` | Apply approval thresholds and risk rules | Policy rules must be visible and configurable |
| `assemble_evidence_bundle` | Link anomalies to the source records that support them | Do not invent evidence or hidden provenance |
| `create_verification_checklist` | Generate steps for trusted out-of-band confirmation | Never contact a changed number or address supplied only by the suspicious request |
| `hold_sandbox_transaction` | Change the state of a mock payment to “on hold” | Sandbox only; approval required for any real integration |
| `create_review_case` | Create an internal case with owner and next step | Log every state change |
| `generate_incident_report` | Summarize indicators, evidence, decisions, and unresolved questions | Separate confirmed facts from suspicion |

## 6. Functional requirements

### MVP requirements

- Synthetic supplier master data with trusted historical payment details.
- Synthetic invoices, purchase orders, and correspondence.
- Deterministic matching for supplier IDs, invoice IDs, amounts, currencies, and bank-detail changes.
- A transparent rules engine with configurable risk conditions.
- Evidence links from every alert to the fields or records involved.
- A triage state: clear, needs review, or hold for verification.
- A simulated hold / release workflow requiring human approval.
- A case timeline and downloadable incident report.

### Later capabilities

- OCR for scanned documents, with confidence-aware manual review.
- Integration adapters for accounting systems, subject to authorization.
- Optional analysis of voice or video authenticity signals, only when suitable media and authorized assessment methods are available.
- Organization-specific policies and approval thresholds.
- Multi-language document extraction.

## 7. Technical approach

A practical implementation could use:

- **Backend:** Python, FastAPI, Pydantic
- **Agent orchestration:** Strands Agents or a controlled custom tool-calling loop
- **Document parsing:** PDF/text extraction and OCR where necessary; retain field-level provenance
- **Rules:** Deterministic Python policy layer for critical matches and approval rules
- **Storage:** SQLite for a local demo; PostgreSQL for a hosted version
- **UI:** React / Next.js or a lightweight dashboard for case review
- **Optional retrieval:** Search indexed company policy and verified internal sample records; avoid treating arbitrary web search results as proof of identity
- **Testing:** Synthetic dataset generator, unit tests for exact mismatches, and scenario-based evaluation

The LLM can coordinate the investigation and explain results, but deterministic code should perform arithmetic, exact comparisons, and permission checks.

## 8. Self-contained demo plan

Generate 50–100 fictional transactions across clean and suspicious cases, including:

- A legitimate invoice that matches an approved purchase order.
- A payment-change request with new bank details.
- An invoice whose amount does not match the purchase order.
- A duplicate invoice number.
- A request that pressures staff to bypass an approval policy.
- A suspicious-looking but legitimate exception that should be sent for review rather than automatically blocked.

Demonstrate the agent collecting evidence, selecting a safe next step, placing a mock transaction on hold, and generating a review report. Make clear that the entire payment flow is simulated.

## 9. Evaluation metrics

- Detection recall for seeded high-risk scenarios
- False-positive rate on legitimate transactions
- Accuracy of extracted and matched fields
- Evidence completeness for each alert
- Percentage of decisions that comply with the configured policy
- Time to assemble an investigation bundle
- Rate of unsupported or overconfident fraud claims

Measure the system against labelled synthetic cases. Do not present synthetic test accuracy as real-world fraud-detection performance.

## 10. Safety, privacy, and limitations

- Never make or authorize real payments in the MVP.
- Never alter production bank details automatically.
- Treat model output as triage support, not a final legal or fraud determination.
- Do not classify an individual as fraudulent based only on a name, accent, writing style, or AI-generated risk guess.
- Preserve evidence provenance and support human review and appeal.
- Apply least-privilege access, encryption, redaction, retention limits, and audit logs in any real deployment.

## 11. Differentiation hypothesis to validate

A possible differentiator is **transaction verification through evidence-linked cross-checks and safe action control**. The agent does not simply label an email; it compares the request with approved business records, explains its reasoning, selects a safe workflow, and records an auditable decision. Research existing fraud, accounts-payable, and business-email-compromise products before claiming novelty.

## 12. Key risks

- Existing AP automation and fraud tools may already provide similar checks.
- Synthetic scenarios may not capture the complexity of real attacks.
- A false positive can delay a legitimate payment; a false negative can permit loss.
- External identity, bank, or domain verification may require data and integrations unavailable in the MVP.

## 13. Initial acceptance criteria

The MVP is ready for a competition demo when it can process a labelled synthetic transaction set, catch the intentionally seeded policy violations, explain each finding with record-level evidence, hold suspicious cases only in the sandbox, and correctly route ambiguous cases to a human rather than inventing a definitive conclusion.

## 14. Research references

- Create AI Agents Championship: https://www.dubaichambers.com/en/web/dubai-chamber-of-digital-economy/create-ai-agents
- Economic Security Center of Dubai, economic-fraud awareness campaign (15 December 2025): https://prod.mediaoffice.ae/en/news/2025/december/15-12/dubai-center-for-economic-security

**Research note:** The source supports the relevance of economic fraud as a public concern. It does not establish prevalence, losses, or a product gap for a specific customer segment; these should be researched separately.
