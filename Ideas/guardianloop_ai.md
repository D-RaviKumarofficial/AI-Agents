# GuardianLoop AI — The Child and Home Hazard-Response Agent

**Prepared:** 22 October 2026  
**Purpose:** Detailed concept brief for a candidate in the UAE AI Agents Championship  
**Concept:** A multi-hazard child and home safety agent for the UAE, with immediate alerts and resolution tracking.

> **Evidence note:** The cited sources support the existence and importance of the problem area; they do not prove that no solution exists. Existing UAE services and commercial/research systems already address parts of these problems. The proposed opportunity is the specific gap described below, which must be validated with users and competitor/prior-art research.

## 1 The problem

Young children can approach hazards quickly. The initial GuardianLoop concept focuses on three environments: windows and balconies, swimming-pool access, and visible household hazards such as damaged electrical fittings. An incident may develop in the short time between a caregiver's attention moving elsewhere and a child reaching a dangerous area.

GuardianLoop should not claim that parents are careless or that cameras can prevent every accident. Its purpose is to provide an additional layer of detection, alerts and follow-through alongside physical safety measures and adult supervision.

## 2 Evidence that the problem is real

1. **UAE study of falls from windows and balconies.** A peer-reviewed retrospective study published in 2017 examined newspaper reports of unintentional child falls in the UAE from 2005–2016. The researchers included 81 cases: 66 were reported as fatal and 15 children were hospitalised and survived. Furniture near windows or balconies was involved in 22 cases (27%). Because the study used newspaper reports, it is not a complete national registry and should not be read as the current annual incidence rate. It nevertheless documents serious historical incidents and associated environmental risks. [12]
2. **Official UAE child-safety guidance.** The Abu Dhabi Public Health Centre's *Safety of Children at Home Guide* advises families to move climbable furniture away from windows, secure windows or install appropriate guards, limit opening width to 10 cm in multi-level homes, keep balcony doors closed, and supervise young children. The guide also addresses child protection from electricity and other household hazards. This establishes that physical prevention measures are essential. [13]
3. **Recent pool tragedy reported in Fujairah.** In an article published on 29 October 2025, *Khaleej Times* reported that a two-year-old boy drowned in a private pool during a family gathering at a farm in Dibba Al-Fujairah. The report described the child disappearing during a brief gap in direct observation. This is an individual reported case, not a national statistical estimate. [14]
4. **Existing pool-detection research already exists.** The UAE University's 2025 FATEEN research project proposed an AI-powered camera/IoT system that detects toddlers near pools, triggers a local alarm, notifies parents and deploys a flotation device. Its reported controlled tests had a 6–8 second average floaty response time, with slower performance in low light and for darker skin. This is crucial prior art: GuardianLoop cannot claim that AI-based toddler pool detection is new. We should also not reproduce its risky physical deployment idea without extensive independent safety engineering and approvals. [15]
5. **Existing official warnings.** Abu Dhabi Police has urged families to secure windows and balconies, remove climbable furniture and supervise children around these areas. This confirms that conventional prevention guidance and public-awareness efforts already exist. [16]

## 3 What GuardianLoop will solve

**Proposed solution:** an integrated hazard-to-resolution agent that uses suitable, safely installed cameras and sensors to detect defined events, activate immediate warnings for urgent risks, coordinate routine hazard repair, and record what is known about resolution.

The system has two different response paths:

### A. Immediate child-safety events

1. **Observe safely.** Use a fixed, safely mounted camera or appropriate sensor in a defined area. Never mount a camera around an infant's neck or within reach where it could create choking, strangulation, entanglement or battery hazards.
2. **Detect a relevant event.** Computer vision may identify a child-sized person in a configured risk zone, a pool-entry event, or a visible condition such as an open access point. Detection is not the same as knowing a child is in immediate danger.
3. **Assess context and uncertainty.** Combine available signals such as zone, movement, access status and sensor input. If confidence is low, provide an appropriately cautious alert or request caregiver verification, according to the hazard policy.
4. **Trigger the configured protective response.** For high-risk pool-area events or clear imminent hazards, activate a local alarm and notify the designated caregiver promptly. Do not wait for a conversational model to finish reasoning before executing a pre-approved emergency rule.
5. **Escalate if unanswered.** For urgent alerts, escalate according to a pre-agreed emergency plan without a five-hour delay. Do not claim that a caregiver or emergency service has been reached unless delivery/connection is confirmed.

### B. Household maintenance hazards

1. Detect or allow a resident to report visible damage, for example a cracked switch cover or exposed-looking wiring.
2. Classify it as a **potential hazard**, not as proof that wiring is live or that the whole electrical system is unsafe.
3. Warn the household and create a maintenance case with a qualified electrician or other appropriate professional.
4. Track the case through states such as `open`, `acknowledged`, `assigned`, `in_progress`, `reported_complete`, and `verified_or_unconfirmed`.
5. Follow up on routine, non-urgent requests after a configurable interval—for example, five hours. Do not use that delay for sparks, smoke, exposed live wiring, a suspected active electrical emergency or any other urgent situation.
6. Keep the case open or mark it unverified if there is no suitable evidence of resolution. A text message saying “done” is not the same as an independent safety inspection.

## 4 Example of how it works

**Scenario 1: a child approaches a pool access point.**

- A fixed camera detects a person in a configured pool-risk zone.
- The policy engine checks the configured event and available supporting signals.
- If the emergency threshold is met, the local alarm and caregiver alert fire immediately.
- If the caregiver does not acknowledge the urgent alert, the system follows the emergency escalation plan.
- The event log records detection, alert delivery and acknowledgement status. It never declares the child safe merely because a notification was sent.

**Scenario 2: a damaged switch is reported.**

- GuardianLoop labels the image as a possible electrical hazard with a confidence level and limitation note.
- It notifies the responsible adult and creates a case for a qualified electrician.
- It tracks technician acknowledgement and appointment status.
- If the routine case is unanswered after the configured interval, it follows up and escalates according to the household's policy.
- Resolution remains unverified until an appropriate record or inspection supports closure.

## 5 What problems could improve because of GuardianLoop?

If validated and deployed appropriately, GuardianLoop could:

- Reduce the time between a defined hazard event and caregiver notification.
- Provide an extra alert layer when a child enters a configured risk zone.
- Help households track hazards that otherwise might be forgotten after the first report.
- Reduce unanswered maintenance requests through assignment, follow-up and escalation.
- Distinguish between an alert being sent, a person acknowledging it, and a hazard actually being resolved.

GuardianLoop cannot guarantee prevention of falls or drowning, cannot prove safety from a single camera frame, and cannot replace direct supervision or physical safety measures.

## 6 Guardrails and limits

- **Physical prevention first:** recommend and retain window locks/guards, safe pool barriers/gates, appropriate electrical repairs, and continuous adult supervision. AI is an additional layer, not the primary barrier.
- **No unsafe wearable camera:** the prototype uses fixed cameras, safely mounted sensors or staged footage. Use a mannequin for the live competition demo.
- **Urgent alert rules must be deterministic:** safety-critical alarms should not depend solely on an LLM. Use a tested policy engine and fail-safe notification logic.
- **Calibrate for different conditions:** test lighting, occlusion, camera angles, skin tones and child/adult confusion. FATEEN's published limitations reinforce the need for fairness and environmental tests.
- **Minimise video collection:** prefer local processing where practical, avoid facial identification, retain only short event clips or metadata when necessary, restrict access and explain recording clearly.
- **Avoid false reassurance:** the UI must say when detection is uncertain or cameras/sensors are offline.
- **Qualified professionals only:** do not instruct unqualified household members to inspect or repair electrical hazards.
- **Correct escalation timing:** urgent child-safety events get prompt escalation; five-hour follow-up is reserved only for non-urgent routine maintenance.

## 7 Prototype plan

Build a controlled simulated home with three scenarios: (1) a mannequin approaching a window-risk zone, (2) a mannequin approaching a pool-risk zone using staged footage or a dry mock environment, and (3) a simulated damaged switch image. Use mocked caregiver and maintenance contacts so no real emergency call is made.

The demo should show the full sequence: detect event, apply policy, send the right alert, handle an unanswered message, open a maintenance case, track acknowledgements and show whether resolution is verified. Never expose a real child to a hazard for testing.

**Suggested evaluation metrics:**

- Precision, recall and false alerts per hour for each defined test scenario.
- Time from a labelled high-risk event to local alarm and phone notification.
- Notification delivery and caregiver acknowledgement rate.
- Successful escalation when the primary contact does not respond.
- Correct separation of urgent events from routine maintenance.
- Percentage of maintenance cases with verified versus unverified closure.
- Performance under low light, occlusion, network loss and sensor failure.

## 8 Competition fit and main risk

**Possible category:** Best Societal Agent or Best Personal Agent.  
**Strength:** Clear human impact, computer vision, agentic actions, escalation and measurable end-to-end tests.  
**Main risk:** Considerable prior art exists for individual parts. FATEEN specifically addresses AI-based toddler pool safety, and existing fire-monitoring products cover some home hazards. GuardianLoop's defensible distinction would need to be the carefully defined multi-hazard workflow, safe differentiation between emergency and routine response, and evidence-based resolution tracking—not a claim to invent pool detection or child monitoring.

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

**Child falls, pool safety and prevention guidance**

[12] Grivna, M., et al. (2017), *Pediatric falls from windows and balconies: incidents and risk factors as reported by newspapers in the United Arab Emirates*, **World Journal of Emergency Surgery**, 12:32: https://pmc.ncbi.nlm.nih.gov/articles/PMC5644057/ and https://link.springer.com/article/10.1186/s13017-017-0156-z

[13] Abu Dhabi Public Health Centre, *Safety of Children at Home Guide* (includes prevention guidance for windows, balconies and electricity): https://www.adphc.gov.ae/-/media/Project/ADPHC/ADPHC/PDF/Child-Injury-prevention/Child-Safety-Home-En.pdf

[14] Khaleej Times (29 October 2025), *UAE: 2-year-old boy drowns in swimming pool at a private farm in Fujairah*: https://www.khaleejtimes.com/uae/emergencies/toddler-drowns-swimming-pool-dibba-al-fujairah

[15] United Arab Emirates University (2025), *FATEEN: An AI-Empowered Floating IoT System for Enhancing Toddler Pool Safety* (research project and findings): https://research.uaeu.ac.ae/en/publications/fateen-an-ai-empowered-floating-iot-system-for-enhancing-toddler-/

[16] Abu Dhabi Police (30 October 2020), *ADP calls to monitor children to prevent falling accidents*: https://www.adpolice.gov.ae/en/Media-Center/News/2021/07/01/ADP-calls-to-monitor-children-to-prevent-falling-accidents
