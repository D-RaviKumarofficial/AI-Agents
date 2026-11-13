# VitalScan — Use Case Document

**"Everyone measures. Nobody acts. VitalScan acts."**

| Field | Detail |
|---|---|
| Product name | VitalScan |
| One-line pitch | Your camera is a stethoscope — a 30-second face scan reads your heart, breathing and stress, then an AI agent actually does something about it |
| Competition | Create AI Agents Championship — Dubai Chamber of Digital Economy (dubaichamberdigital.com/en/create-ai-agents) |
| Category | Best Personal AI Agent (health and wellbeing) |
| Stage | Prototype build phase — submission (prototype + pitch deck + demo video) due January 2027 |
| Document date | 13 November 2026 |

---

## 1. Use Case in 3 Lines

- **Current problem:** People do not check their health until something goes wrong, and even when an app shows a health number, nobody acts on it. The number is shown once and forgotten.
- **Agent solution:** VitalScan reads heart rate, breathing rate and stress level from a 30-second face video using any phone or laptop camera. Then an AI agent explains the numbers, watches the trends, and takes real actions: sets reminders, runs a guided breathing exercise, alerts a family member, and prepares a weekly report.
- **Outcome:** Daily health checking becomes free, instant and effortless on any phone — and for the first time, an agent acts on the numbers to reduce stress and catch problems early.

---

## 2. The Current Problem

**Problem 1 — Health checking happens too late.** Most people visit a doctor only after symptoms appear. Stress, poor sleep and burnout build silently for months. There is no simple daily habit that quietly watches your body's signals at home, for free.

**Problem 2 — Health devices are not for everyone.** Smartwatches and fitness bands cost money, need charging, and many people simply do not wear them. Yet almost every person owns a phone with a camera — a sensor that is already with you 24 hours a day but is not being used for daily health.

**Problem 3 — Numbers without action.** Even the apps that do measure (for example Google Fit on Pixel phones) leave the user alone with the number: "Heart rate: 78." So what? Should the user rest, breathe, sleep earlier, see a doctor? Nobody tells them, nothing changes, and the habit dies in a week. Measurement without action has zero impact on health.

**Problem 4 — Stress is invisible until it explodes.** Work pressure, late nights and screen fatigue slowly drain the body. A person can feel "a bit tired" for weeks while their body is actually in a stressed state the whole time — if only something could see it and speak up.

---

## 3. The Agent Solution

### 3.1 The 30-second scan

The user opens VitalScan and looks at the camera for 30 seconds. That is the whole effort. No wearable, no finger sensor, no waiting.

### 3.2 What VitalScan measures (in simple words)

Every heartbeat pushes blood into the face. This creates extremely small color changes in the skin that human eyes cannot see, but the camera can. Software reads these changes and calculates:

| Measurement | What it means in simple words |
|---|---|
| Heart rate | Beats per minute — the basic body signal |
| Breathing rate | Breaths per minute — also visible in the same signal |
| Stress / recovery index | The tiny variation in time between heartbeats. Low variation = body is stressed or tired. Good variation = body is relaxed and recovered |

### 3.3 The AI agent — this is what makes it win

A normal health app stops at the number. VitalScan has an agent (Claude) that works like a personal health assistant. The agent has four abilities, exactly what the competition judges look for ("define how your agent will reason, plan, use tools and take action"):

1. **Reasons** — combines today's scan with history and context. Example: "Your stress index was high 3 days in a row, you slept 5 hours, and your calendar shows a big meeting tomorrow."
2. **Plans** — builds a small, realistic plan for the day. Example: "Protect your evening: no work after 9 pm, breathing exercise at 8 pm, lights out by 11."
3. **Uses tools** — calendar, reminders, guided breathing exercise with a calm voice (ElevenLabs), family/caregiver alerts, weekly PDF report generator.
4. **Acts** — actually sends the reminder, plays the exercise, delivers the report, alerts the chosen family member if readings stay bad for several days.

### 3.4 One example day (the demo story)

Aisha, 32, a project manager, scans her face in the morning: 30 seconds.

- VitalScan: "Good morning Aisha. Heart rate 76 — normal. Stress index is high for the 3rd day in a row."
- Agent: "Your big client presentation is tomorrow at 10 am. I suggest a 2-minute breathing break at 4 pm today and sleep by 11. Want me to set both?"
- Aisha taps "Yes."
- 4 pm: the phone speaks with a calm voice and guides a 2-minute breathing exercise.
- Next morning: "Stress index dropped 18% after yesterday's plan. Keep the same evening routine today."
- Friday: Aisha receives a one-page PDF: her week in numbers, ready to share with a doctor or keep for herself.

That is the loop: **Scan → Understand → Act → See the change → Scan again.** The loop is the product, and the loop is what makes users come back daily.

---

## 4. The Science Behind It (and why it is already proven)

**The method is called rPPG (remote photoplethysmography)** — reading the pulse from video without touching the person. Simple version: light from the room hits your face, blood absorbs some of that light with every heartbeat, the camera sees the micro color changes, and signal processing turns them into a pulse waveform.

This is not a laboratory dream. It is official, commercial, and even government-approved today:

| Who | What they already do | Proof |
|---|---|---|
| Google (Google Fit) | Measures heart rate (finger on camera) and breathing rate (face video) on Pixel phones since 2021 | Official Google blog and support pages |
| NuraLogix (Anura) | 30-second selfie gives pulse and breathing rate; sold to insurers and telehealth platforms | FDA-cleared vital sign measurement |
| FaceHeart | Video vitals SDK for phones | US FDA 510(k) clearance — heart rate (2023), breathing rate (2025) |
| PanopticAI | rPPG pulse-rate software | FDA clearance, May 2026 |
| Binah.ai | Video-based vitals (HR, stress, breathing) sold to insurance, wellness and pharma companies | Active commercial B2B platform |

**What this means for the pitch:** the science is validated by Google and FDA-cleared companies, so no judge can call it fantasy. The open space is exactly what this competition rewards — nobody has turned it into an **agent that acts**.

**Important honesty rule (used everywhere in the deck and app):** VitalScan is *wellness monitoring based on published research — not a medical diagnosis.* This one sentence protects the project and shows maturity to the jury.

---

## 5. What Makes VitalScan Different

| | Google Fit / existing apps | VitalScan |
|---|---|---|
| Measures pulse and breathing | Yes | Yes |
| Works without any wearable | Yes (Pixel only for Fit) | Yes — any phone or laptop camera |
| Explains what the number means for YOUR day | No | Yes — daily, personalized |
| Watches trends across days and weeks | Basic | Yes — core design |
| Creates an action plan | No | Yes |
| Takes actions (reminders, breathing coach, alerts, reports) | No | Yes |
| Family / doctor-ready summary | No | Yes |
| Habit loop that keeps users coming back | Weak | Strong — the agent gives a reason to return every day |

Pitch line to remember: **"Google can measure your pulse. We are the one who does something about it."**

---

## 6. Target Users

**Direct users (B2C):**
- Busy professionals with high screen time and stress
- Students during exam seasons
- Parents who want a simple daily health habit for themselves
- Fitness users who want recovery tracking without buying a band

**Business customers (B2B) — the path to the AED 1M "AI Agent of the Year" title:**
- Corporate wellness programs (dashboards for HR: anonymized team stress trends)
- Gyms and fitness studios (recovery scan as part of membership)
- Clinics and telehealth (patients send weekly reports before the visit)
- Insurers and wellness platforms (companies in this space already pay for exactly this data — proven by Binah.ai's customer base)

---

## 7. Key Features (MVP scope for the submission)

1. Daily 30-second face scan via web camera (browser app first, phone-friendly)
2. Heart rate, breathing rate, stress index
3. Live pulse waveform on screen during the scan (the "wow" visual)
4. Trend charts: last 7 days and last 30 days
5. Agent conversation: explains today's reading, answers questions, suggests a plan
6. Agent tools: reminders, calendar check, guided 2-minute breathing exercise with calm voice, family alert, weekly PDF report
7. Privacy-first: video is processed on the device; only the final numbers are stored

Explicitly out of MVP scope (says so in the deck): blood pressure claims, disease diagnosis, medical advice.

---

## 8. How the Agent Works (flow)

```
[1] CAPTURE        30-second face video from phone/laptop camera
        |
[2] MEASURE        rPPG signal processing -> heart rate, breathing, stress index
        |          (runs on device; video never leaves the phone)
        v
[3] CONTEXT        Agent receives: today's numbers + past trends +
        |          sleep hours + calendar + user's diary note
        v
[4] REASON         Claude analyzes: is this normal FOR THIS USER?
        |          Is the trend moving the wrong way?
        v
[5] PLAN           Small, realistic daily plan (1-3 actions max)
        |
[6] ACT            Sets reminders / plays breathing exercise / alerts family /
        |          generates weekly PDF report
        v
[7] LEARN          Tomorrow's scan shows the result -> plan adjusts -> loop repeats
```

**Sample agent dialogue (from the demo):**

> **VitalScan:** Stress index high for the 3rd day. Meeting tomorrow at 10 am. I planned a 2-minute breathing break at 4 pm today. Set it?
> **User:** Yes.
> **VitalScan:** Done. I will also remind you to stop screens at 11 pm. Yesterday you followed the plan and your recovery improved by 18% — same plan again today?

---

## 9. Business Model

- **Free:** 1 daily scan + today's numbers (acquisition)
- **Premium subscription (B2C):** trend history, agent plans, weekly PDF reports, family alerts
- **B2B:** corporate wellness dashboard priced per employee per month; gym and clinic licenses; anonymized team-level stress trends for HR
- Why businesses already pay for this data: video-vitals companies (Binah.ai, NuraLogix) sell to insurers and wellness programs today — the demand is proven, the "agent" layer is the new product

---

## 10. Measurable Impact (the "Validate" slide of the pitch)

Targets to reach before submission in January 2027:

| Metric | Target |
|---|---|
| Accuracy vs a finger pulse oximeter (the small clip device that costs a few hundred rupees) | Heart rate within ±5 beats/min for most scans in normal indoor light |
| Pilot users | 20-30 real users for 4 weeks |
| Habit proof | 40%+ of pilot users scanning 5+ days per week in week 4 |
| Reported outcomes | Average stress-index improvement on planned days; collected user quotes |
| Business validation | 2-3 letters of intent (a gym, a corporate HR team, or a clinic) |
| Team stress insight (B2B demo) | Anonymized weekly trend chart from pilot data |

---

## 11. Build Plan (13 November 2026 → submission in January 2027)

**Week 1-2 (mid-Nov to end-Nov):** Register on the official championship site immediately (do not wait). Build the core pipeline: camera video → rPPG → heart rate + stress index. Use open-source rPPG toolkits (rPPG-Toolbox from Rice University, PyVHR) and compare readings against a finger oximeter. Decide and lock the "wellness, not diagnosis" wording.

**Week 3-4 (early Dec):** Add the agent: Claude API with tools (reminders, calendar, breathing exercise with ElevenLabs voice, PDF report). Add trend charts.

**Week 5-6 (mid-Dec):** Pilot with 20-30 real users. Track usage days, accuracy results, and quotes. Prepare the anonymized B2B trend demo. Request letters of intent.

**Week 7 (end-Dec to early Jan):** Record the demo video, build the pitch deck (mapped to the Identify → Build → Validate judging framework), rehearse the live stage scan in bright light and in dim light.

**January 2027:** Submit prototype + pitch deck + demo video. Registration officially closes in January 2027 (press mentions December — register early anyway).

---

## 12. Technology Stack

| Layer | Tools |
|---|---|
| Video capture and face tracking | OpenCV, MediaPipe |
| Pulse extraction (the science) | rPPG-Toolbox (open source) or PyVHR; signal filtering with SciPy |
| Agent brain | Claude API (Anthropic) with tool use |
| Voice (breathing coach, spoken reports) | ElevenLabs |
| App | Next.js web app (works on phone browser and laptop) |
| Storage | Local-first; only numeric results stored in database |
| Accuracy testing | Finger pulse oximeter as reference device |

Note on the competition rule "must not be copied from existing repositories": open-source signal-processing libraries are normal components (like using a database), used by every serious team. The product — the agent loop, the tools, the UX, the business logic — is original.

---

## 13. Risks and Ready Answers (judge questions)

**"Is this a medical device / diagnosis?"**
Answer: "No. VitalScan is wellness monitoring based on published research and FDA-cleared science. We show trends and wellbeing guidance, never a diagnosis." This line appears on the app, the deck and the video.

**"Does it work in bad lighting / all skin tones?"**
Answer: tested in normal indoor light; accuracy numbers from our pilot are shown with conditions; the app guides users to face a light source. (Do test this honestly during the pilot and report real numbers.)

**"What about face data privacy?"**
Answer: the video is processed on the device and never uploaded. Only three final numbers are stored. The competition rules explicitly require data protection — make it a strength slide, not a footnote.

**"Google already does this — why you?"**
Answer: "Google gives you a number and leaves. We are the agent that acts on it: plan, remind, coach, alert, report. Everyone measures. Nobody acts."

**"What if the user has no camera / refuses?"**
Answer: the free scan works on any phone browser; nothing is installed; nothing is stored except numbers.

---

## 14. Demo Plan

**Live stage demo (the strongest 60 seconds available to any team):**
A jury member or volunteer comes on stage, looks at the laptop camera for 30 seconds, and their live pulse waveform appears on the big screen — a heartbeat extracted from a face video, live, with no device touching them. Then the agent speaks its analysis and sets a reminder in front of everyone.

**Demo video script beats (60-90 seconds):**
1. Hook (0-10 s): "Your phone camera can see your heartbeat. Look." — waveform appears.
2. Problem (10-25 s): numbers get shown by apps every day, and nothing changes.
3. Solution (25-55 s): the scan → agent reasons → acts (reminder, breathing exercise, family alert, weekly report).
4. Proof (55-75 s): pilot stats, accuracy check against oximeter.
5. Close (75-90 s): "Everyone measures. Nobody acts. VitalScan acts." + team + call to action.

---

## 15. Future Roadmap (after the championship)

- Arabic language interface and voice coach (the Dubai advantage — first bilingual wellness scan agent)
- Additional signals from the same 30-second video (breathing irregularity flags, fatigue indicators) as research matures
- Optional integration with smartwatches for users who own both
- B2B API for insurers and telehealth platforms
- Partnerships with Dubai health and corporate wellness programs

---

## 16. Key Pitch Lines (memorize these)

- "Your camera is a stethoscope."
- "30 seconds a day. No watch, no wires, no waiting."
- "Everyone measures. Nobody acts. VitalScan acts."
- "The science is proven by Google and FDA-cleared companies. The agent is ours."
- "We are not selling measurements. We are selling the habit that changes them."

---

## 17. Glossary (simple words, no jargon)

| Term | Simple meaning |
|---|---|
| Biomarker | A body signal that tells about health (like fever is a signal of infection) |
| rPPG | Reading your pulse from a face video without touching you |
| Heart rate | Beats per minute |
| Breathing rate | Breaths per minute |
| HRV (heart rate variability) | The tiny variation in time between heartbeats; low = stressed/tired, good = relaxed/recovered |
| Stress index | A simple 0-100 score built from HRV and related signals |
| FDA clearance | Official approval from the US health authority that a health technology is valid — proof the science is accepted |
| Agent | An AI that does not just answer questions — it reasons, plans, uses tools and takes actions |
| Oximeter | The small clip device placed on a finger to show pulse — used in our pilot to check VitalScan's accuracy |
| Wellness monitoring | Watching general wellbeing trends; different from medical diagnosis |

---

*Prepared for the Create AI Agents Championship (Dubai Chamber of Digital Economy) — Best Personal AI Agent category. Registration closes January 2027; register early.*
