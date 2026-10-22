# HeatShield AI — The Outdoor Worker Heat-Protection Agent

**Prepared:** 22 October 2026  
**Purpose:** Detailed concept brief for a candidate in the UAE AI Agents Championship  
**Concept:** An agent that coordinates timely, trackable heat-safety interventions for outdoor workers in the UAE.

> **Evidence note:** The cited sources support the existence and importance of the problem area; they do not prove that no solution exists. Existing UAE services and commercial/research systems already address parts of these problems. The proposed opportunity is the specific gap described below, which must be validated with users and competitor/prior-art research.

## 1 The problem

Outdoor workers in the UAE can face significant heat exposure. Environmental conditions alone do not tell the full story: heat stress also depends on physical workload, clothing, acclimatisation and the duration and context of the work. Safety rules and rest facilities are essential, but a company may still need a practical way to turn approved environmental and work-context data into an intervention and confirm that the intervention occurred.

HeatShield is **not** intended to replace UAE regulations, occupational health professionals or the worker's right to stop unsafe work. It is a support agent for earlier warnings, better coordination and documented follow-through.

## 2 Evidence that the problem is real

1. **UAE field study.** A peer-reviewed study published in *Industrial Health* in 2020 assessed thermal exposure among construction workers in the UAE using Wet Bulb Globe Temperature (WBGT), Heat Stress Index (HSI) and Thermal Work Limit (TWL) indices. The monitored site showed readings above the study's recommended WBGT threshold, and the assessment classified workers at medium or high risk under the indices used. The paper recommends appropriate scheduling, cool shaded rest areas and other controls. The findings are site-specific and should not be generalized to every UAE worksite. [7]
2. **WHO workplace heat guidance.** The World Health Organization's 22 August 2025 guidance describes workplace heat stress as a condition in which body heat accumulation can lead to exhaustion, illness and death. It cites global estimates of more than 2.4 billion workers exposed to excessive heat, and over 22.85 million occupational injuries annually associated with excessive heat. These are global figures, not UAE-specific statistics. [8]
3. **Existing UAE protections.** UAE government guidance states that outdoor work under direct sunlight is prohibited during the summer midday break, from 12:30 p.m. to 3:00 p.m. between 15 June and 15 September each year, with defined exceptions. This means HeatShield must complement existing controls rather than pretend none exist. [9]
4. **Existing support for delivery workers.** In June 2025, MoHRE said more than 10,000 rest stations were being provided for delivery workers during the midday-break period, and noted that workers could use interactive maps in apps to find nearby stations. MoHRE also reported that around 99% of companies complied with the midday-break policy over several years. These facts show that programmes already exist and that the proposed gap should be narrower than “workers have no heat protection.” [10][11]

## 3 What HeatShield will solve

**Proposed solution:** an agent that turns approved heat-risk information into a timely, trackable protective intervention at the worker or work-team level.

HeatShield would combine, where available and authorised:

- On-site environmental sensor data, such as WBGT or relevant temperature/humidity inputs.
- Weather forecasts and warnings from trusted sources.
- Task type, shift timing and approximate exposure duration.
- Whether a suitable rest/cooling location is available and reachable.
- Worker check-ins or voluntarily supplied signs of discomfort.
- A workplace's approved safety thresholds and escalation rules.

The agent would then:

1. **Evaluate a risk signal.** Use validated occupational-health thresholds and the employer's approved safety programme. Do not rely on a generic temperature number or an LLM's opinion to make safety decisions.
2. **Choose the appropriate action.** Depending on the rule set, notify the worker, recommend a rest/cooling location, remind the supervisor to adjust a task, or trigger a mandatory stop/escalation rule.
3. **Make the intervention actionable.** Share the closest verified rest station, send a check-in request, alert the designated safety officer, or create a safety task.
4. **Track acknowledgement.** Record whether the worker or supervisor received the alert and whether the action was acknowledged.
5. **Escalate when necessary.** If a high-risk alert is unacknowledged or a worker reports severe symptoms, follow the organisation's pre-approved emergency protocol and provide appropriate emergency instructions. The agent must not diagnose heat illness.
6. **Learn operationally, not by overriding safety limits.** Summarise recurring high-risk periods or locations so a safety professional can improve planning. Do not autonomously loosen safety thresholds based on productivity data.

## 4 Example of how it works

**Scenario:** A delivery rider is working on a hot day. An approved heat-risk feed reaches a company-defined trigger, and the rider has been outside for a prolonged period.

- HeatShield checks the current readings and the organisation's approved procedure.
- It sends the rider a clear alert and recommends an available nearby rest station based on verified location data.
- It notifies the designated supervisor if required by policy.
- It checks whether the alert was acknowledged and whether the rider reported reaching the rest location.
- If the worker reports serious symptoms, it follows the configured emergency process rather than merely sending another reminder.
- It records the intervention for a safety review, using the minimum necessary personal data.

The prototype should initially use simulated sensor values and a test rest-station map. Real-world deployment requires occupational-health and employer validation.

## 5 What problems could improve because of HeatShield?

If properly validated and adopted, the agent could:

- Reduce the time between a defined risk trigger and a safety intervention.
- Make rest stations and cooling options easier to act on, not just discover.
- Reduce missed or unacknowledged safety alerts.
- Help supervisors identify recurring risk patterns and improve shift planning.
- Produce auditable evidence that a protective action was initiated and acknowledged.

HeatShield cannot guarantee that no worker will suffer heat illness, and a recorded acknowledgement does not prove that a worker is medically safe. Health outcomes would need to be evaluated through a carefully designed, ethically approved pilot.

## 6 Guardrails and limits

- Safety thresholds must be approved by qualified occupational-health and safety personnel and align with applicable UAE requirements.
- Use validated heat-stress measurements where possible; ordinary air temperature alone is not a complete heat-risk assessment.
- Do not make medical diagnoses or tell a symptomatic worker to continue working.
- Do not use the system to punish workers for taking breaks, reporting symptoms or declining unsafe work.
- Minimise location and health data; explain what is collected, who can see it and why.
- Separate safety escalation from productivity scoring.
- Tool outages must fail safely: tell the user when data are unavailable and follow a documented manual safety procedure.

## 7 Prototype plan

Build a simulated operations dashboard with a small number of worker profiles, mock WBGT/environmental data, a list of cooling stations, a supervisor notification tool and an event log. Demonstrate a normal day, a threshold crossing, an unacknowledged alert, a cooling station becoming unavailable, and a worker reporting severe symptoms. Show the agent following policy—not improvising medical advice.

**Suggested evaluation metrics:**

- Time from a rule-defined risk trigger to notification.
- Percentage of high-priority alerts acknowledged within the policy window.
- Accuracy of recommended cooling locations.
- Rate of false or missed triggers against a validated labelled test set.
- Successful fallback when a data source or notification tool fails.
- Worker comprehension, trust and perceived surveillance burden.

## 8 Competition fit and main risk

**Possible category:** Best Societal Agent or Best Business Agent.  
**Strength:** A measurable action workflow with clear organisational users and potential for a credible sensor-driven demonstration.  
**Main risk:** A generic heat dashboard already overlaps with existing worker-safety programmes. The stronger proposition is a policy-governed agent that coordinates an intervention and verifies acknowledgement while respecting worker rights. The model and thresholds need expert review before any live safety use.

---


## Agent architecture and guarded autonomy

Use one transparent action loop:

1. **Observe:** gather user input, sensor readings or trusted status feeds with source and timestamp.
2. **Interpret:** convert inputs into structured observations with confidence and explicit uncertainty.
3. **Plan:** the agent proposes an action sequence toward a specific goal.
4. **Enforce guardrails:** deterministic application code checks permissions, safety rules, budgets, data access and emergency rules before action.
5. **Execute:** invoke authorised tools, such as routing, notifications, incident management or booking integrations.
6. **Verify:** inspect actual tool results and evidence. A tool call is not proof that the task succeeded.
7. **Recover and escalate:** retry safely, offer a fallback, ask for approval or hand over to a human according to the policy.
8. **Audit:** retain a proportionate event record showing the observation, decision, tool result and outcome.

### General guardrails

- Use least-privilege access and explicit permissions.
- Ask for approval before actions with financial, legal, medical or significant privacy consequences unless the user has provided clear pre-approval.
- Follow predefined emergency procedures promptly for urgent conditions; do not put critical alerts behind a lengthy conversational step.
- Prevent duplicate actions such as repeated bookings, notifications or cases.
- Treat external content and tool responses as untrusted data; validate them before using them to trigger actions.
- Minimise personal data, restrict access and establish retention limits.
- Display uncertainty and stale or unavailable data.
- Provide a manual fallback when tools or integrations fail.
- Test failure cases and adversarial inputs as well as successful scenarios.

## Research and validation checklist

1. Interview at least 5–10 intended users and relevant professionals in an exploratory discovery round. This is not a statistically representative sample.
2. Ask about recent real incidents, what the person did, which services they used, and where the current process failed.
3. Review commercial products, UAE public services, academic literature, patents and open-source implementations before claiming originality.
4. Build one narrow workflow end to end, including tool execution, failure recovery and outcome verification.
5. Compare performance with a baseline using measurable results.
6. Get specialist review before any real-world deployment in a safety-critical setting.


## Sources and evidence

**Championship context**

[1] Dubai Chambers, *Create AI Agents Championship*: https://www.dubaichambers.com/en/web/dubai-chamber-of-digital-economy/create-ai-agents

**Heat exposure, worker safety and existing UAE protections**

[7] Ahmed, H. O., et al. (2020), *Assessment of thermal exposure level among construction workers in UAE using WBGT, HSI and TWL indices*, **Industrial Health**, 58(2), 170–181: https://pubmed.ncbi.nlm.nih.gov/31308288/ and https://pmc.ncbi.nlm.nih.gov/articles/PMC7118060/

[8] World Health Organization (22 August 2025), *Workplace heat stress*: https://www.who.int/news-room/questions-and-answers/item/workplace-heat-stress

[9] UAE Government, *Health and safety at workplace* (midday break rule and occupational safety guidance): https://u.ae/en/information-and-services/jobs/health-and-safety-at-workplace

[10] UAE Ministry of Human Resources and Emiratisation (10 June 2025), *Over 10,000 rest stations provided for delivery workers across the UAE throughout the Midday Break period*: https://absher.mohre.gov.ae/en/media-centre/news/10/6/2025/over-10000-rest-stations-provided-for-delivery-workers-across-the-uae-throughout-the-midday-break-period.aspx

[11] UAE Ministry of Human Resources and Emiratisation, *Social Protection and Well-Being Assurance* (reports around 99% company compliance with the heat-stress prevention policy over several years; review date 13 November 2025): https://observatory.mohre.gov.ae/en/uae-labour-market-priorities/social-protection-and-well-being-assurance
