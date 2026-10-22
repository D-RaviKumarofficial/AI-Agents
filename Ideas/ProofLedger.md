# ProofLedger — Sustainability Claim-to-Evidence Verification Agent

- **Proposed competition category:** Best Business AI Agent
- **Project type:** ESG / sustainability data verification and reporting support
- **Status:** Research concept; accounting methodology and target segment need validation
- **Dependency model:** Can be prototyped with synthetic utility bills, waste records, invoices, and company policies. No organization needs to share private ESG data.

## 1. Project summary

**ProofLedger checks whether a company's sustainability claims are supported by traceable evidence.** It links each claim to source documents and calculations, identifies missing or conflicting evidence, asks for the information needed to close gaps, and prepares a transparent draft report.

Example claim: “Our office reduced water consumption by 20% this year.” ProofLedger checks the reporting periods, baseline, meter or utility-bill records, occupancy or activity changes if available, calculation method, and whether the evidence actually supports the stated percentage.

ProofLedger is a verification and reporting assistant. It is not an auditor, certifier, or guarantee of regulatory compliance.

## 2. Problem being addressed

Organizations may have sustainability data spread across invoices, meter readings, procurement records, waste collection tickets, and spreadsheets. Common process risks include:

- A claim has no source evidence or the evidence cannot be traced.
- Reporting periods or units differ between records.
- A calculation uses an unclear or inconsistent baseline.
- Different spreadsheets contain conflicting figures.
- A draft report presents an estimate as a measured fact.
- A company knows sustainability reporting matters but lacks resources or expertise to assemble a reliable evidence pack.

The exact frequency and cost of these issues need customer validation; they should not be assumed for every company.

### Why this connects to Dubai's priorities

Dubai Chamber of Commerce's 2024–2025 ESG Pulse Survey reports barriers such as resource constraints, difficulty measuring and reporting ESG, and insufficient knowledge or expertise. The report also indicates that a minority of surveyed businesses implementing ESG prepared ESG reports. This supports investigating reporting friction, but it does not prove that ProofLedger's proposed workflow is currently missing from the market.

## 3. What ProofLedger will solve

ProofLedger will help a business move from scattered sustainability records to an evidence-linked, reviewable report. Its primary unit is a **claim**: each reported figure or statement should have a defined calculation, period, source, and verification status.

### Target users

- SMEs preparing sustainability or ESG summaries
- Operations and facilities managers
- Sustainability consultants preparing evidence packs
- Finance or compliance teams reviewing non-financial metrics

## 4. Core agent workflow

1. **Define reporting scope:** Select the period, boundary, units, metric definitions, and the framework or internal policy being used.
2. **Ingest source records:** Read synthetic or uploaded invoices, meter readings, waste tickets, purchase records, and spreadsheets.
3. **Extract and normalize:** Identify dates, units, locations, categories, quantities, and source references.
4. **Build a claim ledger:** Store each proposed claim with its formula, baseline, calculation, supporting evidence, assumptions, and status.
5. **Reconcile evidence:** Find duplicate records, missing periods, inconsistent units, and conflicting figures.
6. **Calculate transparently:** Use deterministic formulas; retain the input values and calculation steps.
7. **Ask for missing evidence:** Create a task for an unresolved document or clarification instead of guessing.
8. **Draft the report:** Produce a report with supported claims, estimates clearly labelled, unresolved gaps, and traceable sources.
9. **Prepare a review pack:** Export supporting records and exceptions for a qualified human reviewer.

## 5. Agent tools / callable functions

| Tool | Purpose | Guardrail |
|---|---|---|
| `create_reporting_scope` | Define period, boundaries, units, and selected framework | Do not assume a framework or reporting obligation without user input |
| `ingest_evidence_document` | Read a bill, spreadsheet, invoice, or waste record | Retain source filename/page/row references |
| `extract_metric_fields` | Extract quantities, dates, units, and categories | Store extraction confidence and permit correction |
| `normalize_units_and_periods` | Convert compatible units and align periods | Log conversion factors and assumptions |
| `calculate_metric` | Calculate totals, intensities, or percentage changes | Use deterministic arithmetic with a visible formula |
| `link_claim_to_evidence` | Attach source references to a claim | Reject nonexistent or untraceable references |
| `reconcile_records` | Detect duplicates and conflicting data | Show matching fields and avoid silently deleting records |
| `check_claim_support` | Decide whether evidence supports, partially supports, or fails to support a claim | Explain limitations; do not call this external assurance |
| `create_evidence_gap_task` | Request missing values or source records | Ask for only the information needed |
| `generate_draft_report` | Generate a structured report with claim statuses | Label estimates, assumptions, and unsupported items distinctly |
| `export_evidence_pack` | Export claim ledger, formulas, sources, and open issues | Protect confidential data and log exports |

## 6. Functional requirements

### MVP requirements

- A defined set of metrics, such as electricity use, water use, waste weight, and a limited set of purchasing indicators.
- Synthetic datasets with correct values, missing rows, duplicate records, inconsistent units, and incorrect periods.
- Field-level provenance back to a file, page, or row.
- Transparent formulas and unit conversions.
- Claim statuses such as supported, partially supported, unsupported, and needs review.
- A missing-evidence task list.
- A draft report that never presents an unsupported number as a verified fact.
- An exportable claim-to-evidence ledger.

### Later capabilities

- Configurable mapping to selected ESG reporting frameworks.
- Connectors to authorized accounting, utility, or facilities-management sources.
- Multi-entity and multi-site reporting.
- Change tracking across reporting periods.
- Reviewer comments and sign-off workflow.

## 7. Technical approach

A practical implementation could use:

- **Backend:** Python, FastAPI, Pydantic
- **Agent orchestration:** Strands Agents or a controlled tool-calling workflow
- **Document ingestion:** PDF/text parsing, spreadsheet readers, and OCR for scanned records
- **Calculation engine:** Deterministic Python functions; decimal arithmetic where precision matters
- **Retrieval:** A curated, versioned collection of framework material and company policies, with source references
- **Storage:** PostgreSQL for claim/evidence relationships; SQLite for a local prototype
- **UI:** React / Next.js dashboard showing claims, evidence links, calculations, and unresolved gaps
- **Validation:** Unit tests for calculation logic and an adversarial dataset for broken provenance and inconsistent records

The LLM should interpret the task, route work to tools, summarize findings, and ask for missing information. It should not invent measurements, formulas, or source evidence.

## 8. Self-contained demo plan

Create fictional records for a small hotel or office across 12 months: electricity bills, water bills, waste collection records, and supplier purchases. Seed issues such as a missing month, an incorrect unit, duplicate invoices, a changed reporting boundary, and a claim whose percentage calculation is wrong.

Show ProofLedger tracing each claim to supporting evidence, correcting a calculation, marking an unsupported claim, and generating a draft report with an open-issues section.

## 9. Evaluation metrics

- Numeric calculation accuracy
- Percentage of claims with valid source provenance
- Precision and recall on seeded evidence gaps
- Unit and period normalization accuracy
- Number of unsupported claims incorrectly marked as supported
- Time taken to assemble a report versus a defined manual baseline
- Reviewer correction rate on generated summaries

Use a labelled benchmark to produce results; do not invent impact percentages in the pitch.

## 10. Safety, privacy, and limitations

- Do not present a draft as audited or certified.
- Do not assume a framework applies without confirming scope and jurisdiction.
- Keep estimates separate from measurements and disclose assumptions.
- Avoid double counting across sources or reporting boundaries.
- Retain an audit trail for every edit and calculation.
- Use synthetic data in the MVP; protect confidential commercial records in any later deployment.

## 11. Differentiation hypothesis to validate

A possible differentiator is **claim-level evidence verification**: every claim is linked to inputs, formula, period, units, assumptions, and unresolved issues. The agent actively investigates gaps and creates remediation tasks rather than generating a polished report from incomplete input. Compare against ESG reporting software and sustainability data platforms before claiming the feature is unique.

## 12. Key risks

- ESG reporting products and consultants already address portions of this workflow.
- The correct calculation may depend on a reporting framework or boundary choice.
- Poor OCR or missing source data can undermine reliability.
- A model may misinterpret a claim unless the permitted metrics and formulas are bounded.

## 13. Initial acceptance criteria

The MVP is ready for a competition demo when it handles a labelled synthetic dataset, reproduces a set of known calculations, identifies seeded missing/conflicting evidence, links every reported value to its source and formula, and clearly distinguishes supported claims from assumptions and unresolved issues.

## 14. Research references

- Create AI Agents Championship: https://www.dubaichambers.com/en/web/dubai-chamber-of-digital-economy/create-ai-agents
- Dubai Chamber of Commerce, ESG Pulse Survey Report 2024–2025: https://www.dubaichambers.com/documents/d/dubai-chamber-of-commerce-1/esg-pulse-survey-report-2024-2025

**Research note:** The survey indicates ESG measurement/reporting friction among respondents. It does not prove that a specific customer needs ProofLedger or that existing solutions are inadequate. Validate those questions before finalizing scope.
