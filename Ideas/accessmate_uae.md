# AccessMate UAE — The Accessibility Recovery Agent

**Prepared:** 22 October 2026  
**Purpose:** Detailed concept brief for a candidate in the UAE AI Agents Championship  
**Concept:** An autonomous accessibility recovery agent for People of Determination in the UAE.

> **Evidence note:** The cited sources support the existence and importance of the problem area; they do not prove that no solution exists. Existing UAE services and commercial/research systems already address parts of these problems. The proposed opportunity is the specific gap described below, which must be validated with users and competitor/prior-art research.

## 1 The problem

A person with a disability may be able to plan a journey or service request successfully, but an unexpected barrier can make the plan unusable. Examples include a reported lift outage, a blocked step-free entrance, an inaccessible last stretch of a route, or a suitable accessible taxi not being available when needed.

The problem AccessMate should focus on is **not that the UAE has no accessibility services**. The UAE has accessible-transport provisions, facilities and dedicated taxi options. The more specific opportunity is helping an individual recover when the expected accessible path or service fails: identify a verified alternative, coordinate the next action, and continue supporting the person until the task is completed or a human helper takes over.

The exact frequency and severity of these journey failures must be validated through interviews and pilot data. Do not claim that lift outages or inaccessible routes are widespread based only on the sources below.

## 2 Evidence that accessibility remains an important area

1. **UAE digital accessibility policy.** The UAE's National Digital Accessibility Policy aims to improve access to government digital products and services for People of Determination and older people. This establishes accessibility as a recognised public-service priority. It does not itself prove that all services are inaccessible. [2]
2. **Accessibility provisions already exist.** UAE government guidance describes accessible transport and parking facilities. Dubai RTA documents features such as lifts, tactile paths, audio and visual alerts, accessible ticket booths and accessible transport facilities. These are important existing solutions that AccessMate should build on rather than duplicate. [3][4]
3. **Research on participation barriers.** A peer-reviewed paper published in *Disability & Society* in 2023 examined barriers to participation in higher education and employment in the UAE. Based on interviews conducted in 2016–2018, it identified problems including weak enforcement/accountability and insufficient accessibility measures or support in some institutional settings. The research is older and addresses higher education and employment, not specifically public-transport outages, so it is contextual evidence rather than proof of the precise AccessMate use case. [5]
4. **Government feedback has been sought on digital access.** In 2025, the Ministry of Energy and Infrastructure ran a consultation to assess People of Determination's satisfaction with website accessibility and identify possible technical barriers. This indicates that accessibility needs and user feedback remain part of ongoing service improvement. [6]

## 3 What AccessMate will solve

**Proposed solution:** an action-taking personal agent that responds when a person's planned accessible route or service stops being workable.

AccessMate would maintain a user-controlled profile of requirements, for example:

- Step-free route required.
- Avoid stairs or escalators.
- Prefer audio guidance, large text, high contrast, or simplified instructions.
- Need wheelchair-accessible transport or a companion.
- Preferred emergency or trusted contact, if the user chooses to provide one.

When a disruption occurs, the agent would:

1. **Detect or receive the barrier.** Accept a user report, use a reliable transit/facility status feed, or consume an official alert. It must distinguish verified service information from unconfirmed reports.
2. **Recalculate around the user's actual needs.** Find a route or service that satisfies the chosen accessibility requirements, not merely the shortest route.
3. **Check feasibility.** Verify available data about lifts, entrances, transport options, operating hours and the final stretch of the journey. If a critical segment is unverified, the agent must say so rather than promising accessibility.
4. **Act within permission.** Update the route, provide accessible audio/text instructions, prepare a service request, or contact a facility. It may book transport only through an authorised integration and within the user's pre-approved rules; otherwise, ask the user to confirm.
5. **Recover if the first action fails.** If the route is blocked or a booking fails, search for another feasible option or escalate to a designated assistance service or trusted contact, with the user's consent.
6. **Verify progress.** Ask whether the user reached the next safe/accessible point, use a confirmed service status when available, and keep helping if a new barrier appears.

## 4 Example of how it works

**Scenario:** A wheelchair user is travelling to an appointment. A verified alert says the lift at the planned station is unavailable.

- AccessMate identifies that the planned route depends on that lift.
- It searches for an alternative route with verified step-free access.
- If a suitable route is available, it updates directions in the user's preferred format.
- If no suitable route can be verified, it checks a supported accessible-taxi option and presents the cost and estimated arrival information available from the booking provider.
- It asks for approval if the booking falls outside the user's pre-authorised limits.
- It confirms the booking result and continues to offer a fallback if the service fails.

This is a proposed workflow, not a claim that all UAE transport systems currently expose APIs that allow these actions. A prototype can use mocked service responses first; a live pilot requires permission and usable integrations.

## 5 What problems could improve because of AccessMate?

If the agent works as designed, it could:

- Reduce the time and effort required to recover from an unexpected accessibility barrier.
- Reduce dependence on a stranger having to work out the next step.
- Help people make more informed choices by presenting the accessibility status and uncertainty of alternatives.
- Reduce failed trips or missed appointments caused by disruptions, if those are confirmed as common in user research.
- Give facilities structured feedback about recurring access barriers and allow users to track responses.

These are **intended outcomes**; they must be measured in a pilot rather than presented as already proven benefits.

## 6 Guardrails and limits

- Never label a path “accessible” unless required route details are verified to an appropriate standard.
- Do not infer a person's disability or disclose disability-related information without consent.
- Ask permission before sharing location or personal details with another person or provider, except where a user-configured emergency procedure lawfully permits action.
- Make bookings only through authorised integrations and clear spending rules.
- If no safe alternative can be verified, clearly say so and offer supported human assistance; do not invent a route.
- Keep the user in control of their preferences and allow them to stop tracking or withdraw permissions.

## 7 Prototype plan

Build a small demonstrator with a map-like test network, accessibility constraints, mock lift status, a simulated accessible-taxi booking tool, and a notification tool. Test at least three scenarios: lift outage, blocked entrance, and failed accessible-taxi booking. The agent should make a plan, call tools, handle failure and report the verified status.

**Suggested evaluation metrics:**

- Percentage of scenarios in which it finds a feasible alternative.
- Time to recovery after a disruption is reported.
- Rate of false accessibility claims.
- Number of manual steps required from the user.
- Percentage of bookings/requests with a confirmed outcome.
- User-reported confidence and usability from testing with people with disabilities.

## 8 Competition fit and main risk

**Possible category:** Best Personal Agent or Best Societal Agent.  
**Strength:** A clear personal goal and a demonstrable action loop.  
**Main risk:** RTA, taxi, map and accessibility-service features already exist. AccessMate must demonstrate a genuine cross-service recovery gap and must be co-designed and tested with People of Determination. A general accessibility chatbot or route planner is not enough.

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

**Accessibility policy, services and research**

[2] UAE Government, *National Digital Accessibility Policy*: https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/policies/government-services-and-digital-transformation/national-digital-accessibility-policy

[3] UAE Government, *Protection, support and assistance of People of Determination*: https://u.ae/en/information-and-services/social-affairs/people-of-determination/protection-support-and-assistance-of-people-of-determination

[4] Roads and Transport Authority, Dubai, *People of Determination*: https://rta.ae/wps/portal/rta/ae/home/people-of-determination?lang=en

[5] Morgan, C. (2023), *The experiences of disabled people in the United Arab Emirates: Barriers to participation in higher education and employment*, **Disability & Society**. The interviews discussed were conducted in 2016–2018: https://doi.org/10.1080/09687599.2021.1930520

[6] UAE Ministry of Energy and Infrastructure, *Survey of People of Determination's satisfaction of the digital accessibility to the ministry's website* (consultation, May–July 2025): https://www.moei.gov.ae/en/digital-participation/digital-participation-topics/details?id=3904
