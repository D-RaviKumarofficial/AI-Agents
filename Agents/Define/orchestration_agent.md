# Dubai Police Orchestration Agent — What's There, What We Add, Why It Helps

**Frame:** Dubai Police already has every tool. We are not adding a tool — we are adding the **agentic orchestration layer** that makes them work together autonomously, with a human officer approving every consequential action. This is what the WAM article (24 Oct 2026) means by "advancing Agentic AI plans."

For each of the **7 capabilities Dubai already has**, this document covers:
1. What Dubai currently has
2. What our agent is going to do with it
3. How police benefit (concrete, measurable)
4. A real-time example scenario in basic terms

---

## 1. e-Crime Platform (citizen fraud complaint intake)

### What Dubai currently has
The e-Crime platform has accepted online fraud complaints from citizens and residents since 2018. A victim fills a web form, uploads screenshots and chat logs, and the complaint lands in a queue. An officer then opens it, reads it, and decides which unit investigates. The platform is the front door for fraud reporting — but it is a queue, not a triage engine. Complaints wait for a human to read them.

### Evidence (verified public sources)
- **Official Dubai Police e-Crime service page:** https://www.dubaipolice.gov.ae/app/services/ecrime — Dubai Police's own portal for reporting cybercrime.
- **Dubai Police eCrime Hub (public awareness portal):** https://ecrimehub.gov.ae — operated by Dubai Police.
- **Gulf News (Jan 28, 2026) — Dubai Police urge residents to report cybercrimes through the eCrime platform:** https://gulfnews.com/uae/crime/dubai-police-warn-residents-to-protect-personal-data-from-cyber-fraud-1.500423654

### What our agent is going to do
The moment a new complaint arrives, the **Triage Agent** reads it, extracts every indicator (IBAN, phone number, URL, app name, suspect handle), classifies the fraud type (phishing, vishing, fake-investment, romance scam, fake-app, deepfake-CEO), scores severity, and assigns it to the right unit — before any human reads it. The agent also checks whether any extracted indicator matches an existing complaint, and if so, links the new complaint to that case file automatically.

### How police benefit
- **Time saved per complaint:** 15–30 minutes of officer reading/extracting → under 60 seconds
- **No complaint sits unread:** today some complaints wait hours during peak scam waves; the agent processes them as they arrive, 24/7
- **Better data quality:** every complaint gets the same structured extraction (no officer-to-officer variation)
- **Earlier pattern detection:** because indicators are extracted instantly, a fraud ring using the same IBAN across 40 complaints is visible on complaint #2, not complaint #40
- **Officer time freed:** officers stop doing data-entry work and start doing investigation work

### Real-time example scenario (in basic terms)
A resident files an e-Crime complaint at 11pm on a Sunday: "I transferred AED 8,000 to a fake investment app called GrowDXB. The agent on WhatsApp told me to use IBAN AE12030... and called me from +971-50-xxx." Today, that complaint waits in the queue until Monday morning. With our agent: by 11:01pm the agent has extracted the IBAN, the phone number, the app name, classified it as fake-investment + vishing, scored it medium severity, AND checked whether that IBAN appears in any other complaint — it does, in two complaints filed last Thursday. The agent links all three complaints into one case file and notifies the Anti-Fraud Centre duty officer by 11:02pm. The officer wakes up Monday to a ready-made case, not a queue of unread complaints.

---

## 2. Anti-Fraud Centre (fraud investigations)

### What Dubai currently has
The Anti-Fraud Centre investigates fraud cases — reviewing evidence, tracing funds, identifying suspects, coordinating with banks and telecom operators. Officers handle each case individually. When two cases share a suspect, that connection is made when an investigator happens to notice it. The Centre has the people, the expertise, and the powers — what it lacks is an automated engine that connects related cases across the full caseload in real time.

### Evidence (verified public sources)
- **Dubai Police announce arrest of 2 suspects in AED 11,877,532 phone-scam case (Oct 2026):** https://www.facebook.com/JustDubaiLive/posts/1552460026895630 — confirms the Anti-Fraud Centre actively investigates multi-victim fraud.
- **Dubai Police public statement on the AED 11.8M phone-scam arrests:** https://www.facebook.com/uaecentre/videos/1462355995756192
- **Arabian Business — Dubai Police warning on fake apps stealing banking data (anti-fraud public messaging):** https://www.arabianbusiness.com/abnews/dubai-police-fake-app-warning-bank-account-cyber-fraud

### What our agent is going to do
The **Pattern Cluster Agent** continuously watches every case in the system. When a new complaint or a new piece of evidence arrives, the agent runs similarity scoring across the entire caseload: same IBAN, same phone, same URL, same MO, same suspect name, same app. When 2+ cases score above threshold, the agent forms a cluster — a first-class object with its own ID and lead brief — and notifies the senior investigator. The **Advisory Agent** drafts the bank-notification letter and the public advisory, which the investigator approves before anything goes public.

### How police benefit
- **Pattern detection time:** weeks/months (when a senior officer notices) → minutes (when the agent forms a cluster)
- **Higher hit rate per investigation:** investigators stop working isolated cases and start working connected rings
- **Bank notifications go out faster:** freezing a fraudster's IBAN within hours instead of days means more recovered funds
- **Public advisories go out before the scam peaks:** instead of warning the public after 40 victims, the agent recommends an advisory after 5
- **Measurable ROI:** each cluster intercepted early prevents further victim losses — a clean number for the pitch

### Real-time example scenario (in basic terms)
An investigator opens a new case on Tuesday: victim lost AED 12,000 to a "share dividend" scam, the money went to IBAN AE930021. The agent scans every other case in the system and finds the same IBAN in a case from last week (AED 5,000 loss) and three more complaints filed Monday (AED 1,500–3,000 each). Total: 5 victims, same IBAN, AED 25,500. The agent forms a cluster, drafts a freeze-request letter to the bank, and a draft public advisory ("Beware of share-dividend offers referencing IBAN AE930021"). The investigator reviews, edits one line, approves both. The bank freezes the account by Wednesday morning — before the fraudster can move the money. Today, that same connection might have taken three weeks of manual case review.

---

## 3. SARAAB (AI deepfake detection)

### What Dubai currently has
SARAAB is Dubai's AI model for detecting deepfakes, reported at ~91% accuracy, developed by the Dubai Electronic Security Center (DESC). It is a sophisticated tool. But today, an officer has to manually decide *when* to run SARAAB on a piece of evidence, manually upload the file, manually read the result, and manually record it in the case file. SARAAB exists; the workflow around SARAAB is manual.

### Evidence (verified public sources)
- **Gulf News (Oct 5, 2026) — New Dubai AI model spots deepfakes in seven-second clips:** https://gulfnews.com/uae/new-dubai-ai-model-spots-deepfakes-in-seven-second-clips-1.500698366 — confirms DESC launched SARAAB with up to 91% deepfake-detection accuracy.
- **BankInfoSecurity — Dubai Unveils Open-Source Deepfake Detection AI (SARAAB, unveiled at GISEC, Sept 16, 2026):** https://www.bankinfosecurity.com/dubai-unveils-open-source-deepfake-detection-ai-a-32894
- **Remio.ai — SARAAB Deepfake Detection Model Claims 91% Accuracy (Oct 5, 2026):** https://www.remio.ai/post/saraab-deepfake-detection-model-claims-91-accuracy-but-open-testing-comes-next

### What our agent is going to do
The **Triage Agent** automatically runs SARAAB on any uploaded video or image that appears in a complaint — no officer action required. The result (deepfake confidence score, anomaly flags) is written directly to the case file with a tamper-evident log entry. The **Pattern Cluster Agent** watches the SARAAB results across cases: if the same deepfake video surfaces in 5 different complaints (a common fraud-ring tactic — one fake CEO video sent to many targets), the agent flags it as a cluster immediately.

### How police benefit
- **SARAAB runs on every video, not just videos officers remember to check**
- **No officer time spent uploading/running/reading results** — the agent handles the full SARAAB workflow
- **Deepfake ring detection:** the same fake video used across multiple victims is caught at victim #2 instead of victim #50
- **Chain of custody is automatic:** every SARAAB result is logged with timestamp, file hash, and confidence score — defense lawyers cannot challenge the chain
- **Higher effective accuracy:** running SARAAB on 100% of uploads catches deepfakes that would have been missed because nobody ran the tool

### Real-time example scenario (in basic terms)
A victim uploads a video of "the CEO" asking them to transfer AED 50,000 to a new account. The complaint arrives at 8am. The agent immediately runs SARAAB on the video. By 8:02am SARAAB returns a 96% deepfake confidence score with the specific anomalies flagged (lip-sync mismatch, audio-visual desync, ear-edge artifacts). The agent writes this result to the case file and updates the case severity to "high — organised deepfake fraud." Separately, the Pattern Agent finds the same video file hash in two other complaints filed the previous day. By 8:05am the investigator has: the deepfake proof, the link to two other victims, and a draft advisory. Today, an officer might not have remembered to run SARAAB until the next day, by which time the same video could have hit another 20 victims.

---

## 4. Oyoon (CCTV facial recognition network)

### What Dubai currently has
Oyoon is Dubai's city-wide CCTV network with facial recognition, started in 2018. It is genuinely impressive — thousands of cameras, real-time face matching against watchlists. But Oyoon is a *detection* system. What happens *after* a match is human: a control-room officer sees the match alert, picks up the phone, dispatches a patrol, and starts the case file. Oyoon finds the face; humans do the rest.

### Evidence (verified public sources)
- **MENAbytes (Jan 28, 2018) — Dubai Police launch "Oyoon" (Eyes), an AI + data-analytics crime-prevention project:** https://www.menabytes.com/dubai-police-ai
- **Oxford Tech & Justice research — Oyoon uses facial recognition and behaviour analysis to identify suspects:** https://www.techandjustice.bsg.ox.ac.uk/research/united-arab-emirates
- **SAMENA Council — Dubai Police AI-powered surveillance system (facial recognition, microphone-enabled cameras):** https://www.samenacouncil.org/samena_daily_news?news=66585

### What our agent is going to do
When Oyoon produces a face match, the **Router Agent** instantly: creates a case file (or updates the existing one if the face belongs to an active case), dispatches the nearest patrol with the match photo and location on their tablet, and — if the case is cross-emirate (the face was matched by a camera outside Dubai) — opens a shared case file with the relevant emirate force. No phone call. The human officer supervises and approves the arrest.

### How police benefit
- **Time from match to patrol dispatch:** today 3–10 minutes (control room reads alert, picks up phone, briefs patrol) → under 30 seconds
- **No missed matches:** today if the control room is busy, a match alert can sit unread; the agent dispatches instantly
- **Cross-emirate matches handled automatically:** today a Sharjah Oyoon match on a Dubai case requires a phone call to Dubai; the agent opens the shared file in seconds
- **Patrol gets richer information:** photo, last known location, watchlist reason, related case file — all on the tablet, no verbal-only briefing
- **Full audit trail:** every match, every dispatch, every officer action is logged

### Real-time example scenario (in basic terms)
A suspect on the Dubai Police watchlist is wanted for a series of thefts. At 3:14am an Oyoon camera at a Sharjah City Centre entrance matches the face with 94% confidence. Today: the Sharjah control room sees the alert, calls Dubai control room, Dubai control room calls a Dubai patrol, the patrol drives to Sharjah — total elapsed time before anyone moves: 8–15 minutes. With our agent: at 3:14:01 the agent creates a cross-emirate case file (Dubai leads, Sharjah coordinates), at 3:14:15 the nearest Sharjah patrol gets the match photo and watchlist reason on their tablet, at 3:14:30 the patrol is moving toward the mall. The human officer in both control rooms supervises the agent's actions and approves the arrest. The suspect is in custody 20 minutes after the match instead of 45.

---

## 5. Interpol Notices (Yellow / Red / Black)

### What Dubai currently has
Dubai Police has an Interpol liaison and access to the Interpol Notices database: Yellow Notices (missing persons, ~11,700 active worldwide), Red Notices (wanted persons), Black Notices (unidentified bodies). Today, an officer manually queries this database when a case has an international angle — usually when they have already exhausted local options. Cross-checking is reactive and human-initiated.

### Evidence (verified public sources)
- **Interpol official — About Yellow Notices (global police alert for a missing person):** https://www.interpol.int/en/How-we-work/Notices/Yellow-Notices
- **Interpol official — View / search public Yellow Notices for missing persons:** https://www.interpol.int/en/How-we-work/Notices/Yellow-Notices/View-Yellow-Notices
- **Interpol — "Help us find" (public appeals for missing persons):** https://www.interpol.int/en/What-you-can-do/Help-us-find

### What our agent is going to do
The **Missing Person Agent** and **Router Agent** automatically check Interpol Notices as part of their normal flow: when a missing person is reported locally, the agent queries Interpol Yellow Notices for matching descriptions; when an unidentified person is found locally, the agent queries Yellow Notices (someone may be looking for them abroad); when a suspect is arrested locally, the agent checks Red Notices (are they wanted elsewhere?). The agent runs these checks as background operations and surfaces matches to the investigator.

### How police benefit
- **The reverse loop closes:** today a found-but-unidentified person may sit unmatched for weeks; the agent cross-checks against 11,700 Interpol Yellow Notices automatically
- **International matches surface early:** instead of being a last resort, Interpol cross-checking happens on every relevant case
- **Manual query time eliminated:** officers stop typing queries into the Interpol portal — the agent does it and surfaces only matches
- **Bigger picture:** patterns across borders become visible (same suspect wanted in 3 countries, same unidentified person description in 2 emirates + 1 Interpol notice)

### Real-time example scenario (in basic terms)
A man is found unconscious in Al Qusais with no ID. He's taken to hospital but can't communicate. Today, an officer files a found-person report and may or may not remember to manually check Interpol. With our agent: the moment the found-person report is filed, the agent cross-checks the physical description against all 11,700 active Yellow Notices. Two minutes later it surfaces a Yellow Notice filed 3 weeks ago by police in another country for a missing male of the same age, height, and distinctive tattoo. The investigator gets a match brief with the foreign case contact, and within the hour Interpol channels connect the two cases. Today, that connection might never have been made.

---

## 6. Smart Police Stations (24/7 self-service kiosks)

### What Dubai currently has
Dubai runs ~33 Smart Police Stations (SPS) offering 45+ services 24/7 without human staff — reporting crimes, applying for certificates, fingerprinting, traffic services. They are physical kiosks with touchscreens and biometric scanners. They are excellent for the services they offer — but a report filed at 3am at an SPS still waits for a human at headquarters to triage it in the morning.

### Evidence (verified public sources)
- **Official Dubai Police Smart Police Station portal:** https://sps.dubaipolice.gov.ae — "first fully smart government service center … 27 services … offered to the public 24 hours a day."
- **Dubai Police HQ (official) — 33 Smart Police Stations provide 24/7 services across Dubai:** https://www.facebook.com/dubaipolicehq.en/posts/1403354068499162
- **CIO.com (Dec 9, 2024) — Dubai Police to launch the Middle East's first floating Smart Police Station by 2026:** https://www.cio.com/article/3619620/dubai-police-will-have-its-first-floating-smart-police-station-in-2026.html

### What our agent is going to do
When a citizen files a report at an SPS, the **Triage Agent** picks it up instantly (same flow as e-Crime). For reports that need follow-up, the agent drafts the case file, schedules the next step, and notifies the citizen via the Dubai Police smart app with case-status updates — without any officer involvement for routine processing. For serious cases, the agent escalates immediately to the duty investigator.

### How police benefit
- **SPS reports stop waiting for morning:** a 3am fraud report is triaged at 3:01am, not 9am
- **Citizens get status updates automatically:** instead of calling to ask "what's happening with my case"
- **Officers arrive at work to triaged cases:** not a queue of overnight reports
- **SPS utilisation goes up:** when citizens see reports are acted on instantly, more use the SPS at night instead of waiting for the station to open
- **Honest framing:** the SPS already solves the *intake* problem; the agent solves the *follow-through* problem

### Real-time example scenario (in basic terms)
At 2:30am a tourist walks into a Smart Police Station in Al Barsha and reports a phone snatch. He files the report on the touchscreen, uploads a photo of the suspect taken by a bystander. Today, that report waits until morning when an officer opens it. With our agent: at 2:31am the agent has triaged the report (theft + tourist victim = priority), extracted the suspect description from the photo, queried Oyoon for any face match in the last 2 hours near Al Barsha (one match at 2:15am, the suspect was on camera 400m away), and opened a case file with that evidence attached. The duty investigator's phone buzzes at 2:32am with a case-ready file. The tourist gets an app notification at 2:33am: "Your case DXB-2026-4421 is open. Investigator Ahmed has been assigned. You can track status here." The tourist goes back to his hotel knowing someone is on it.

---

## 7. MOI Cross-Emirate Coordination

### What Dubai currently has
The Ministry of Interior (MOI) Federal Criminal Police Department coordinates between the 7 emirate police forces for cases that cross emirate borders. Today this is done by phone calls, emails, and formal written requests between control rooms. Each emirate has its own case management system; there is no shared case file. Coordination is real and works — but it is manual, slow, and produces parallel case files that drift apart.

### Evidence (verified public sources)
- **Official UAE Ministry of Interior services portal:** https://moi.gov.ae/en//home.html — federal authority coordinating the 7 emirate police forces.
- **Khaleej Times — Dubai Police advances Agentic AI plans (WAM, Oct 24, 2026):** the official wire article naming "shared digital service channels" and "business continuity" as federal priorities — the exact gap our orchestration layer addresses.

### What our agent is going to do
The **Router Agent** detects when a case has a cross-emirate element (suspect fled, evidence in another emirate, witness in another emirate — using the 5-signal detection layer), decides jurisdiction using UAE federal rules + LLM for edge cases (escalating to MOI for politically sensitive calls), opens one shared case file visible to all involved emirates, dispatches parallel instructions to lead and coordinating emirates, tracks every legal deadline and SLA, and produces one court-ready consolidated file at the end. Human officers in each emirate approve every arrest, custody transfer, and final court file.

### How police benefit
- **Coordination time:** hours-to-weeks (manual phone/email/MOI routing) → minutes (automated shared file + parallel dispatch)
- **One source of truth:** no more parallel case files that drift apart
- **Chain of custody airtight:** every action across emirates is in one tamper-evident log — defense lawyers can't exploit cross-emirate gaps
- **Deadlines never silently missed:** the agent watches every legal deadline across all emirates and auto-escalates
- **First-time visibility:** the agent generates cross-emirate coordination statistics that don't exist today
- **Emirate autonomy respected:** each emirate's officers approve every consequential action — the agent coordinates, humans decide

### Real-time example scenario (in basic terms)
A hit-and-run at 2am near the Dubai–Sharjah border. The driver hits a pedestrian and speeds toward Sharjah. A witness calls 999. Today: the Dubai dispatcher calls Sharjah control room, Sharjah takes notes, Sharjah dispatches a patrol, two separate case files open, evidence is emailed between forces, and if they catch the suspect the custody transfer paperwork takes another day. With our agent: at 2:00:30 the agent detects the cross-emirate element (999 transcript says "toward Sharjah" + ANPR reads the suspect plate on a Sharjah road 90 seconds later). At 2:01 the agent decides Dubai leads (crime happened in Dubai), Sharjah coordinates (suspect is there). At 2:01:15 it opens one shared case file. At 2:01:30 it dispatches in parallel: Dubai patrol to the scene, Sharjah patrol to intercept. At 2:08 Sharjah catches the suspect. The custody transfer paperwork is pre-filled and waiting for the prosecutor. The whole case — from crime to suspect in custody with a complete shared file — takes 8 minutes instead of 4–8 hours.

---

## Summary — The One Pitch

Dubai Police already has the e-Crime platform, the Anti-Fraud Centre, SARAAB, Oyoon, Interpol access, Smart Police Stations, and MOI cross-emirate coordination. **Seven great tools. What's missing is the agent that makes them work together autonomously** — triaging complaints instantly, clustering patterns across cases, running SARAAB on every upload, dispatching patrols the instant Oyoon matches, cross-checking Interpol automatically, following through on SPS reports overnight, and coordinating across emirates without phone calls. With a human officer approving every consequential action, every time.
