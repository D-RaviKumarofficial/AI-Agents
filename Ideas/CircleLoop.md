# CircleLoop — Circular Resource Recovery and Reuse Coordination Agent

- **Proposed competition category:** Best Societal AI Agent (if scoped around community-wide resource recovery and environmental impact)
- **Alternative category:** Best Business AI Agent (if scoped primarily around cost savings for individual businesses)
- **Project type:** Waste prevention, reuse matching, and resource-recovery coordination
- **Status:** Research concept; local acceptance, safety, and material-routing rules need validation
- **Dependency model:** The first prototype can use synthetic listings and a simulated network of donors, recipients, repairers, and recyclers. Real organizations and collection partners are not required for the MVP.

## 1. Project summary

**CircleLoop helps keep usable materials in circulation by matching surplus items with a safe, appropriate next destination and tracking what actually gets reused or recovered.** It receives structured listings of surplus goods or material, checks reuse and handling constraints, ranks possible destinations, prepares a transfer or collection plan, and verifies the result within a sandbox.

The product is not merely a waste classifier or a directory. Its intended agentic behavior is to move from “this item may be reusable” to a feasible, constraint-checked match and a traceable outcome.

## 2. Problem being addressed

Materials can be discarded because the person who has them does not know who can reuse them, what handling requirements apply, or how to arrange a suitable transfer. Potential problems to investigate include:

- Usable goods or materials are not matched with a suitable recipient in time.
- Listings do not include enough information about condition, quantity, location, or handling needs.
- Reuse, repair, donation, and recycling options are considered separately rather than compared in a consistent workflow.
- A proposed match is not completed, and the final destination or recovered quantity is never recorded.
- Businesses and communities may lack a simple way to measure verified reuse and diversion outcomes.

These are hypotheses for product research, not claims that all these failures have been measured in Dubai.

### Why this connects to Dubai's priorities

Dubai Municipality announced Circle Dubai in October 2025, targeting 100% diversion of all waste types from landfills by 2041. The initiative includes strategic projects, performance indicators, sector involvement, and public education. This establishes waste reduction and circularity as documented priorities; it does not show that CircleLoop's proposed matching workflow is already needed or absent.

## 3. What CircleLoop will solve

CircleLoop will help a user choose the next feasible route for a surplus item—preventing waste where possible, then considering reuse, repair, donation, recycling, or appropriate disposal according to condition and local rules. It should explain why a destination is suitable and record whether the transfer actually occurred.

### Target users

- Community organizations and donation coordinators
- Hotels, offices, retailers, and event organizers with surplus items
- Reuse and repair organizations
- Recycling coordinators and circular-economy programmes
- Local sustainability initiatives

## 4. Core agent workflow

1. **Register surplus:** Capture material or item type, quantity, condition, approximate location, availability date, and restrictions.
2. **Classify the item:** Identify likely material categories and whether it is reusable, repairable, recyclable, regulated, hazardous, perishable, or unsuitable for ordinary transfer.
3. **Check constraints:** Apply configured safety, hygiene, handling, condition, and jurisdiction-specific rules. If the item is ambiguous or risky, stop for expert review.
4. **Find possible destinations:** Search a local mock directory of verified-in-test recipients, repairers, and recyclers. A later version may use public directories or opted-in partner data.
5. **Rank matches:** Compare accepted material types, capacity, distance, time window, handling needs, transport cost, and reuse potential.
6. **Plan the transfer:** Propose a pickup or handover plan and identify missing details. In the MVP this is simulated; nothing is booked in the real world.
7. **Confirm outcome:** Record simulated acceptance, quantity transferred, and destination receipt. If a match fails, propose the next feasible option.
8. **Measure impact:** Report item quantities matched, successfully transferred, reused, repaired, recycled, and still unresolved. Keep measured values separate from estimates.

## 5. Agent tools / callable functions

| Tool | Purpose | Guardrail |
|---|---|---|
| `register_surplus_item` | Create a structured surplus listing | Validate required fields and identify missing information |
| `classify_material_and_condition` | Propose item/material type and condition | Low-confidence or hazardous cases require human review |
| `check_handling_constraints` | Check configured reuse, hygiene, safety, and handling rules | Use versioned rules and disclose unknown jurisdictional requirements |
| `search_recipient_directory` | Find candidate destinations in a mock or approved directory | Do not describe an unverified recipient as vetted |
| `check_recipient_acceptance` | Check material type, capacity, time window, and condition requirements | Treat unsupported attributes as unknown rather than compatible |
| `estimate_transfer_cost` | Estimate distance, transport effort, or cost using available inputs | Label estimates; avoid claiming precise emissions without a defined method |
| `rank_recovery_options` | Rank reuse, repair, donation, recycling, or other permitted destinations | Explain ranking factors and obey safety constraints first |
| `create_transfer_plan` | Prepare a simulated handover/pickup plan | No real booking in the MVP; require confirmation before external actions |
| `record_transfer_outcome` | Record acceptance, quantity, and destination receipt | Only mark complete when the simulation or user provides confirmation |
| `replan_failed_match` | Find an alternate destination if the first option fails | Limit retries and avoid creating duplicate plans |
| `calculate_recovery_metrics` | Aggregate verified quantities and status by pathway | Separate actual outcomes, estimates, and unresolved material |
| `export_impact_report` | Produce an item-level trace and aggregate report | Do not claim landfill diversion without a defensible destination/outcome record |

## 6. Functional requirements

### MVP requirements

- A material taxonomy with a clearly bounded initial scope; start with non-hazardous, non-perishable items.
- Structured surplus records with condition, quantity, approximate location, and availability.
- A synthetic directory of recipients, repairers, and recyclers with acceptance and capacity attributes.
- A constraint engine that excludes unsafe or incompatible destinations.
- Explainable matching and ranking.
- A sandbox transfer workflow with accepted, rejected, completed, and failed states.
- A way to replan when a destination rejects a match.
- A report showing verified simulated outcomes and unresolved items.

### Later capabilities

- Image-assisted item categorization with human confirmation.
- Opt-in recipient network and real booking/collection integrations.
- Route grouping for multiple pickups.
- Public-sector or community-level summary dashboards.
- Material-specific rules and localized recycling guidance.
- Impact estimation for travel and avoided disposal, with published assumptions.

## 7. Technical approach

A practical implementation could use:

- **Backend:** Python, FastAPI, Pydantic
- **Agent orchestration:** Strands Agents or a controlled custom tool-calling loop
- **Matching engine:** Deterministic constraints first, followed by a transparent multi-factor ranking score
- **Data:** PostgreSQL for a deployed version; SQLite for a local MVP; generated listings and mock partner directory
- **Geospatial functions:** A local distance matrix or open mapping data if needed; the first demo can use generated distances
- **UI:** React / Next.js map/list view, item detail, match explanation, transfer tracker, and impact dashboard
- **Optional vision:** An image model to propose material categories, with user confirmation and low-confidence escalation
- **Evaluation:** Scenario simulator with controlled recipient capacity, rejection rates, time windows, and material constraints

The LLM should coordinate investigation and explain choices, while deterministic code enforces hard safety and compatibility constraints.

## 8. Self-contained demo plan

Create a fictional event venue or hotel with surplus furniture, cardboard, reusable containers, textiles, and selected non-hazardous equipment. Create mock recipients with different acceptance policies, capacities, distances, and opening windows.

Run scenarios where:

- The closest recipient does not accept the item.
- A recipient has no remaining capacity.
- A reusable item requires a repair step first.
- A listing lacks condition or quantity data.
- A first match fails and the agent must find an alternative.
- A material is unsuitable for ordinary reuse and should be escalated or routed only under the applicable handling rules.

Show the agent producing an explainable match, executing a simulated transfer, recording the outcome, and reporting only the quantities actually confirmed in the simulation.

## 9. Evaluation metrics

- Percentage of listings with a feasible destination
- Match acceptance and simulated completion rate
- Quantity successfully matched, transferred, reused, repaired, or recycled
- Number of unsafe or incompatible recommendations (target: zero on hard-rule tests)
- Time and number of tool calls needed to find a feasible match
- Replanning success after rejection or capacity changes
- Accuracy of outcome accounting and distinction between estimates and verified results

Do not claim real-world landfill diversion or carbon reduction from a simulation. Label simulated impact clearly and use a published methodology before estimating environmental benefits.

## 10. Safety, privacy, and limitations

- Begin with a narrow set of non-hazardous, non-perishable items.
- Escalate e-waste, chemicals, medical waste, food safety, and other regulated or risky categories unless verified handling rules are available.
- Do not expose private addresses or personal data from donors or recipients.
- Do not automatically schedule real pickups or transfer ownership without explicit confirmation.
- Verify outcomes before counting an item as reused or recycled.
- Apply local requirements and recipient acceptance rules; do not assume a destination accepts an item merely because it is labelled recyclable.

## 11. Differentiation hypothesis to validate

A possible differentiator is **closed-loop reuse matching with capacity and safety constraints**: discover a feasible destination, account for recipient requirements, replan when a match fails, and verify the final quantity and destination. Research existing surplus-exchange, donation, recycling, and waste-management platforms before making novelty claims.

## 12. Key risks

- Existing recycling and surplus marketplaces may provide similar listing/matching capabilities.
- Recipient capacity and acceptance data can become stale in real use.
- Environmental impact calculations are method-dependent and easy to overstate.
- A broad material taxonomy can make the first version too complex; start narrow.

## 13. Initial acceptance criteria

The MVP is ready for a competition demo when it can process at least 50 generated surplus listings, select only compatible destinations, explain why each match was chosen, handle rejection or capacity changes, complete a simulated handover, and generate a report that distinguishes verified simulated outcomes from estimates.

## 14. Research references

- Create AI Agents Championship: https://www.dubaichambers.com/en/web/dubai-chamber-of-digital-economy/create-ai-agents
- Dubai Municipality, Circle Dubai project announcement (27 October 2025): https://www.dm.gov.ae/dubai-municipality-launches-circle-dubai-project/

**Research note:** The source establishes Dubai's waste-diversion target and programme. It does not prove that CircleLoop is a unique solution or that a particular community partner would adopt it. Validate that gap separately.
