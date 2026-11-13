# DriveGuard — Use Case Document

**"Catch the sleep before the crash."**

| Field | Detail |
|---|---|
| Product name | DriveGuard |
| One-line pitch | A phone on the dashboard watches the driver's eyes with validated sleep science (PERCLOS), detects drowsiness before microsleep — and an AI agent that plans the safe trip, not just beeps an alarm |
| Competition | Create AI Agents Championship — Dubai Chamber of Digital Economy (dubaichamberdigital.com/en/create-ai-agents) |
| Category | Best Personal AI Agent (safety and wellbeing) — with a strong B2B fleet story |
| Stage | Prototype build phase — submission (prototype + pitch deck + demo video) due January 2027 |
| Document date | 13 November 2026 |

---

## 1. Use Case in 3 Lines

- **Current problem:** Drivers fall asleep at the wheel on long highway drives and night shifts, and built-in drowsiness alerts exist only in expensive new cars. Millions of cars on the road — taxis, delivery vans, family sedans — have nothing at all.
- **Agent solution:** A phone camera mounted on the dashboard watches the driver's eyes and head using the same science US highway researchers validated (PERCLOS — the measure of how long the eyes stay 80% closed). The AI agent detects rising drowsiness *before* the dangerous moment, speaks a voice alert, plans rest stops, and learns the driver's sleep debt.
- **Outcome:** Every old car becomes a safety-monitored car for free — fewer accidents for families, night drivers, and delivery fleets.

---

## 2. The Current Problem

**Problem 1 — Drowsy driving is invisible until it is too late.** A tired driver does not look drunk. There is no test, no alarm in the car, no warning light. The body gives early signals — slower blinking, heavy eyelids, head nods — but nobody is watching for them. By the time the driver "feels" sleepy, the reaction time is already damaged.

**Problem 2 — Safety tech is locked inside expensive cars.** Modern luxury cars include driver-monitoring cameras. But the huge majority of cars on UAE roads — older family cars, taxis, delivery vans, trucks — have zero driver monitoring. The people who drive the most hours for work (delivery riders, taxi drivers, truck drivers on night routes) drive exactly the cars with no protection.

**Problem 3 — Existing apps stop at a beep.** Some apps show a warning tone when eyes close. A beep is not safety: it does not know the driver slept 4 hours, it does not plan where to rest, it does not alert anyone, and it cannot adjust to the driver's history. A single beep at the dangerous moment is already too late.

**Problem 4 — Long Gulf drives are a daily reality.** Dubai–Abu Dhabi commutes, inter-emirate deliveries, night shifts that end at 3 am. Long straight highways at night are exactly the conditions where drowsiness wins. Road safety is a standing priority of UAE authorities — this idea aligns with it directly.

---

## 3. The Agent Solution

### 3.1 The setup (10 seconds)

Driver places any phone on the dashboard mount (the same place a navigation phone already sits), front camera facing the driver. DriveGuard starts automatically when the trip starts.

### 3.2 What DriveGuard measures (in simple words)

Every time we get sleepy, our eyelids close slowly and stay closed longer. Researchers measure this precisely:

| Measurement | What it means in simple words |
|---|---|
| PERCLOS | The percentage of time the eyes are at least 80% closed. More eyelid closure = more drowsiness. This is the core signal |
| Blink rate and blink speed | Slow, heavy blinks are an early drowsiness sign — before the driver even "feels" sleepy |
| Head pose and nodding | The head dropping forward or drifting is a late-stage danger signal |
| Yawning frequency | A supporting signal of fatigue |
| Time-of-day and trip length | Driving at 3 am after a 2-hour trip is statistically the risk zone |

### 3.3 The AI agent — this is what makes it win

A beep app stops at the beep. DriveGuard has an agent (Claude) that works like a safety co-pilot with four abilities, exactly matching the competition judging framework ("reason, plan, use tools, take action"):

1. **Reasons** — combines eye signals with context: "Your PERCLOS trend is rising fast, it is 1:40 am, and this is your third trip tonight. You slept 4.5 hours yesterday — you are in the high-risk zone."
2. **Plans** — "Next service station is 7 km ahead on E311. Take a 15-minute break there. If you skip it, I will escalate."
3. **Uses tools** — spoken voice alerts (ElevenLabs, calm voice, in the driver's language), rest-stop finder, navigation handoff, family/fleet-manager alert, trip safety report, morning "sleep debt" summary.
4. **Acts** — speaks at the *early* stage ("you look tired, plan a break"), escalates at the *mid* stage (loud alert + suggests stop), and at the *critical* stage alerts the chosen contact or fleet supervisor automatically with the location.

### 3.4 One example night (the demo story)

Ravi, 28, a delivery driver, starts his fourth trip at 1:20 am.

- 1:35 am — DriveGuard: "Blink pattern shows early fatigue. Next break option in 7 km. I suggest a 10-minute rest."
- 1:52 am — eye-closure score climbs into the risk zone: a firm spoken alert — "Pull over safely. You are showing strong drowsiness signs." Rest stop is announced with distance.
- Ravi ignores it and keeps driving.
- 2:01 am — critical threshold: DriveGuard sends an automatic alert to the fleet supervisor with location and a safety report, and keeps speaking until the driver stops.
- Next morning: Ravi and the supervisor receive the trip safety report: risk levels across the night, where drowsiness peaked, what happened.

That is the loop: **Watch → Detect early → Speak → Escalate → Learn the driver's pattern.** The escalation ladder — not the beep — is the product.

---

## 4. The Science Behind It (and why it is already proven)

**The method is called PERCLOS** (PERcent of eyelid CLOSure): the proportion of time the eyes are at least 80% closed. This is not a startup fantasy — it is one of the most studied drowsiness measures in traffic research:

- US Department of Transportation (FHWA) research on drowsy drivers found PERCLOS **the most reliable and valid** drowsiness measure among all the metrics they tested — the basis for real-time drowsiness detection.
- Published research (2022-2023, including driving studies) confirms eyelid closure percentage rises consistently with sleep-loss drowsiness, and PERCLOS-based detection systems are used in fatigue research worldwide.
- Eye and head tracking from a normal camera is solved engineering: open-source face-tracking (MediaPipe Face Mesh) gives precise eyelid geometry at 30+ frames per second on a phone.

**What this means for the pitch:** the science is validated by government transportation research, the tracking tools are open-source, and the market gap is the millions of cars without any monitoring. No judge can call the physics fantasy — and nobody has wrapped it in an agent that plans and escalates.

**Important honesty rule (used everywhere in deck, app, and video):** DriveGuard is a *driver assistance and safety-alert tool — it does not drive the car and does not replace rest.* The only real cure for drowsiness is sleep; DriveGuard's job is to make sure the driver takes it in time.

---

## 5. What Makes DriveGuard Different

| | New luxury cars with driver monitoring | Simple beep apps | DriveGuard |
|---|---|---|---|
| Eye-based drowsiness detection | Yes | Basic | Yes — PERCLOS, the validated measure |
| Works in ANY existing car | No — only built into new models | Yes | Yes — any phone, any car |
| Knows the driver's sleep history | No | No | Yes — sleep debt is tracked |
| Early warning BEFORE the danger zone | Partial | No — fires late | Yes — graded early alerts |
| Plans the rest stop | No | No | Yes — with distance and escalation |
| Escalates to family or fleet supervisor | No | No | Yes — automatic, with location |
| Trip safety report | No | No | Yes — daily/weekly |
| Cost | AED thousands (new car) | Cheap | Free app on a phone you already carry |

Pitch line to remember: **"The science is 30 years old and government-validated. What's missing is putting an agent on it — in every car, not just new ones."**

---

## 6. Target Users

**Direct users (B2C):**
- Long-distance commuters (Dubai–Abu Dhabi and inter-emirate drives)
- Night-shift workers driving home at 2-4 am
- Families on long holiday road trips
- Students and young drivers (highest-risk group for late-night driving)

**Business customers (B2B) — the path to the AED 1M "AI Agent of the Year" title:**
- Delivery and last-mile fleets (riders and drivers on 10-hour shifts — every logistics company in the UAE)
- Taxi and ride-hailing operators (night-shift safety compliance)
- Truck and bus companies (long-haul routes across the Emirates)
- Rental car companies (safety add-on service)

For fleets the agent becomes a safety manager: live risk dashboard, automatic escalation when a driver hits the critical zone, and weekly compliance reports. This is where companies already pay for safety — and where the measurable impact story lives.

---

## 7. Key Features (MVP scope for the submission)

1. Dashboard phone mount mode: front camera faces the driver, runs during the trip
2. Live PERCLOS + blink + head-pose tracking (on-device)
3. Graded voice alerts: early gentle reminder → firm spoken warning → critical alert
4. Rest-stop suggestions with distance (highway service areas)
5. Sleep-debt log: the driver answers 2 questions at trip start ("hours slept, how long driving today") — the agent combines it with live signals
6. Escalation: automatic alert with location to a chosen family member or fleet supervisor at the critical threshold
7. Trip safety report: risk timeline of the trip, shareable PDF
8. Privacy-first: all video processing on the device; no video stored, no video uploaded — only drowsiness scores and events

Explicitly out of MVP scope (says so in the deck): controlling the car, emergency braking, medical-grade sleep disorder diagnosis.

---

## 8. How the Agent Works (flow)

```
[1] WATCH         Front camera tracks eyes, eyelids, head pose (on device, 30 fps)
        |
[2] MEASURE       PERCLOS score + blink speed + head nods -> drowsiness level
        |         Level 0 fresh / 1 mild / 2 elevated / 3 critical
        v
[3] CONTEXT       Agent receives: drowsiness level + trip length + time of day
        |         + declared sleep hours + driving history of this driver
        v
[4] REASON        Is this normal fatigue or a dangerous pattern?
        |         How fast is it rising? How far is the next rest stop?
        v
[5] PLAN          Graded response ladder + rest plan + escalation decision
        |
[6] ACT           Speaks (voice alert) / finds rest stop / alerts supervisor
        |         or family (with location) / logs the event
        v
[7] LEARN         Each trip updates the driver's risk profile ->
                  tomorrow's warnings start earlier for a sleep-deprived driver
```

**Sample agent dialogue (from the demo):**

> **DriveGuard:** "Third trip tonight, and your eyelid pattern is slowing down. Rest stop in 7 km. Say 'break' and I guide you there."
> **Driver:** "I'm fine, five more minutes."
> **DriveGuard:** "Understood — but if the score rises one more level, I alert your supervisor. That's the rule you set." (Two minutes later, level rises.) "Alert sent to Nasser with your location. Please take the next exit."

---

## 9. Business Model

- **Free:** live drowsiness alerts for personal drivers (acquisition, and a public-safety goodwill story)
- **Premium (B2C):** trip reports, sleep-debt coaching, family escalation features
- **B2B fleet safety:** per-driver/per-vehicle monthly price — supervisor dashboard, automatic escalation, compliance reports, API integration with existing fleet-management software
- Why fleets pay: one prevented accident pays for years of the service; night-shift driver safety is an operational cost they already carry in insurance and liability

---

## 10. Measurable Impact (the "Validate" slide of the pitch)

Targets to reach before submission in January 2027:

| Metric | Target |
|---|---|
| Detection accuracy | In test drives (passenger role, closed circuit or simulator app), PERCLOS detection matches manual video review within an agreed tolerance; demonstrate on-stage in daylight and night mode |
| False alarm rate | Below an agreed threshold across pilot drives (report honestly) |
| Pilot | 10-20 drivers across personal + one delivery fleet, 3-4 weeks |
| Habit/usage proof | App active on 80%+ of pilot trips; alert response rate recorded |
| Business validation | 1-2 letters of intent: a delivery fleet manager, a taxi operator, or a rental company |
| Safety events | Documented cases: "alert fired → driver took a break" (the single most convincing story) |

---

## 11. Build Plan (13 November 2026 → submission in January 2027)

**Week 1-2 (mid-Nov to end-Nov):** Register on the official championship site immediately. Build the core pipeline: MediaPipe Face Mesh → eye aspect ratio → PERCLOS computation at real-time speed on a phone/laptop. Test in daylight and at night in a car.

**Week 3-4 (early Dec):** Add the agent: Claude API with tools (rest-stop lookup, escalation contact, trip report). Add the graded voice alert ladder with ElevenLabs voice. Add the sleep-debt intake (2 questions at trip start).

**Week 5-6 (mid-Dec):** Pilot: 10-20 drivers, including one small delivery fleet if possible. Log alert events and responses. Build the fleet supervisor dashboard (simple web page with live risk status).

**Week 7 (end-Dec to early Jan):** Record the demo video, build the pitch deck (Identify → Build → Validate framework), rehearse the live stage demo (a team member acts drowsy; the escalation alert visibly fires).

**January 2027:** Submit prototype + pitch deck + demo video. Registration closes January 2027 — register early.

---

## 12. Technology Stack

| Layer | Tools |
|---|---|
| Face and eye tracking | MediaPipe Face Mesh, OpenCV (on-device) |
| Drowsiness signal | Eye aspect ratio → PERCLOS computation (Python/SciPy) |
| Agent brain | Claude API (Anthropic) with tool use |
| Voice alerts | ElevenLabs (calm voice, Arabic + English + driver's language) |
| App | Android app (phone on dashboard mount) or laptop prototype for the stage demo |
| Fleet dashboard | Next.js web page with live driver risk status |
| Storage | Local-first; only scores and events stored, never video |
| Validation | Manual video review of pilot drives as reference |

Note on the competition rule "must not be copied from existing repositories": face-tracking libraries are standard components (like using a database). The product — the escalation ladder, sleep-debt reasoning, fleet tools, the agent loop — is original.

---

## 13. Risks and Ready Answers (judge questions)

**"A phone in front of the driver — is that itself a distraction?"**
Answer: it sits exactly where the navigation phone already sits, screen off, audio only. The driver never looks at it; it looks at the driver. All interaction is spoken.

**"Cars already have this."**
Answer: only new premium models — a small fraction of the cars on the road. We cover the other 90%+ for free, plus fleets. And we add what no car does: sleep history, rest planning, and escalation.

**"What about privacy — a camera on my face for hours?"**
Answer: everything runs on the device. No video is stored or uploaded — only drowsiness scores and safety events. This matches the competition's data-protection requirement and is a core design principle.

**"Night driving — can a camera see in the dark?"**
Answer: phones' front cameras handle dashboard-lit faces; the app switches to infrared-assisted mode where the phone supports it, and we report honestly how performance varies. (Test this in the pilot and show real numbers.)

**"What if it alarms wrongly and annoys drivers?"**
Answer: false alarms are the make-or-break metric — we report our measured rate, drivers tune sensitivity, and escalation only fires at the critical level or after the driver ignores two earlier warnings.

**"Does it diagnose sleep disorders?"**
Answer: no. It is a safety assistant, not a medical device. (If the trip report shows chronic high drowsiness even after full sleep, it suggests discussing with a doctor — carefully worded.)

---

## 14. Demo Plan

**Live stage demo (strong and easy to stage):**
A volunteer "driver" sits on a chair with a laptop/phone on a dashboard mount. He "drives" (a subtle road video or simulator behind him). He slowly acts drowsy — blinks slow down, head nods — and the audience watches the live PERCLOS meter rise on the big screen, then the calm voice warning, then the firm alert, then the supervisor's phone visibly receiving the escalation with location. Sixty seconds, no cuts, fully live.

**Demo video script beats (60-90 seconds):**
1. Hook (0-10 s): "His eyes closed for 2 seconds at 90 km/h. The car covered 50 meters. Nobody was watching. Until now."
2. Problem (10-25 s): drowsiness is invisible; safety cameras exist only in new cars; beep apps are too late.
3. Solution (25-55 s): the live eye tracking → rising score → graded voice alerts → rest-stop plan → automatic escalation.
4. Proof (55-75 s): validated science (US transportation research), pilot stats, fleet letter of intent.
5. Close (75-90 s): "Catch the sleep before the crash." + team + call to action.

---

## 15. Future Roadmap (after the championship)

- Arabic-first voice coach and multi-language driver support (Dubai advantage)
- Fleet safety API integrated with UAE logistics and ride-hailing platforms
- Phone-based heat/fatigue combo for outdoor and delivery workers (bridge to the CoolDown idea)
- Optional OBD/car Bluetooth integration: trip auto-start, speed context
- Partnership with road-safety campaigns and insurance (safe-driver premium discounts)

---

## 16. Key Pitch Lines (memorize these)

- "Your phone is already on the dashboard. Let it watch the driver, not just the map."
- "The science was validated by US highway researchers. The car industry put it in premium cars. We put it in every car."
- "A beep is not safety. A co-pilot is."
- "We don't stop the sleep. We catch it — three levels before it stops the driver."
- "For fleets: one prevented accident pays for the product forever."

---

## 17. Glossary (simple words, no jargon)

| Term | Simple meaning |
|---|---|
| PERCLOS | The percentage of time the eyes are at least 80% closed — the most validated camera-based drowsiness signal |
| Microsleep | A 1-3 second unintentional sleep episode — at highway speed the car travels far, blind |
| Blink speed | How slowly the eyelid moves; slow blinks signal rising fatigue |
| Head pose | The direction/angle of the head; nodding and drifting are late danger signs |
| Sleep debt | The accumulated lack of sleep over days; a driver with high sleep debt is risky even if "feeling okay" |
| Escalation ladder | Graded response: gentle reminder → firm warning → automatic alert to a supervisor/family |
| MediaPipe Face Mesh | A free Google library that maps the face in 3D from a normal camera — the tool that measures eyelids |
| Fleet | A company's set of vehicles and drivers (delivery, taxi, trucks) |
| Validation | Proving with real tests that the measurement is accurate — our pilot compares app output with human review of the video |

---

*Prepared for the Create AI Agents Championship (Dubai Chamber of Digital Economy) — Best Personal AI Agent category. Registration closes January 2027; register early.*
