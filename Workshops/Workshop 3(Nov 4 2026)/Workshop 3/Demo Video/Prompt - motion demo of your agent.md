# Prompt · Motion demo of your agent

1. Install the skill `Skills/motion-demo.zip` in Claude (Claude Code works best: it can create, render and check files).
2. Open the folder that holds your `co-founder-project.md` (made with the Co-Founder plugin).
3. Paste the prompt below. Everything in [square brackets] is a project variable: keep it for the Sandline Gifts demo, or replace it with your own project.

```
Use the motion-demo skill to make a motion design demo video of my agent, in English, in the Vox documentary collage style.
Read my agent design from [co-founder-project.md] in this folder. Ask me only about what is missing.
Agent: [Lead to Loyal]. Company or user: [Sandline Gifts, a fictional company in Dubai that sells branded corporate gifts].
Problem: [the same questions on WhatsApp, Instagram, email and the web form; some quotes are never followed up].
Three demos: normal ["200 notebooks with our logo for an event on 20 December"]; incomplete ["How much for the notebooks?"]; out of scope ["Can you do 30% off if I order today?"].
Never: [sends alone], [invents a price], [contacts anyone without consent].
Next step to test: [count one week of real enquiries]. Tagline: [From the first message to a loyal client.]
Length: [about 90 seconds]. Voice: [Gemini TTS, voice Puck] (if no key, a silent version). Outputs: [an interactive HTML file and an MP4].
Do not invent any figure, price or result. Show me the script before making the voice.
```

Expected result: a script to validate, then an interactive HTML video (play, chapters, subtitles, full screen) and an MP4 if Chrome and ffmpeg are available. Example: `lead_to_loyal_motion.mp4` in this folder.
