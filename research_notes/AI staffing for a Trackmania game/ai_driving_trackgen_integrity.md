# AI for Trackmania-style genre jobs (driving, track building, handling, leaderboard integrity), state as of Oct 2026

Research date: 2026-10-10. Labels: [2026] = 2026 source or activity; [older: YYYY] = older information that still describes the current state as far as I found. Several items came from search-engine summaries rather than full page reads; these are marked "(search summary, not full read)".

## 1. AI drivers in Trackmania: Linesight, Yosh, TMRL, academic work. Records, hardware, training time, generalization

### Takeaway
Purpose-built reinforcement-learning (RL) agents can now beat human world records on short official Trackmania tracks. Linesight beat 10 of 12 campaign world records it tested against in TMNF (May 2024), and Yosh's agent beat the A01 world record in 2025. This is per-track, superhuman optimisation, not general driving skill. Each map needs its own reference line and tens of hours of sped-up training on a single consumer GPU PC. Agents trained across many maps (for example PedroAI) stay mostly below bronze-medal level. Every record-beating result relies on a tool (TMInterface) that speeds up the game and injects inputs, so the runs are tool-assisted and not eligible for leaderboards.

### Cited Findings
**Linesight (open source; TMNF; authors pb4 and Agade)**
- Self-described as "by far the most advanced AI in Trackmania." It "was the first to demonstrate human-level driving around May 2023, with Wirtual playing against it in June," and "In May 2024, Linesight was the first to showcase beating world records on official campaign tracks" (video "I Trained an AI for 2 Years on Trackmania. It's Breaking Records.", youtube.com/watch?v=cUojVsCJ51I) — [Linesight GitHub README](https://github.com/Linesight-RL/linesight)
- The documentation says the AI beat 10 of 12 "prestigious" world records in the official campaign. It also states: "All runs produced by this project are Tool Assisted. They must not be submitted to the Official Leaderboards." The docs are for version 3.0.1, © 2024, credited to pb4 and Agade — [Linesight docs](https://linesight-rl.github.io/linesight/build/html/)
- Map names for the 10 of 12 records were not on the pages I could read. One blog says the notable record was on **A02**, "beating a record that had stood for 6 years," and that the AI "found a faster route." It also says the model found shortcuts "within hours" that took the community up to 20 years to find. The blog is dated 2024-03-12, which conflicts with the README's May 2024 date for the record video — [Dakota Marshall blog](https://dakotamarshall.net/content/drafts/ai-the-death-of-human-discovery/); date conflict with [Linesight README](https://github.com/Linesight-RL/linesight)
- **Interface:** Linesight runs Trackmania Nations Forever through TMInterface, built by donadigo and Kim. TMInterface lets code "send inputs, get car states, get screenshots." Requirements: Python 3.10–3.11, PyTorch with CUDA, **20 GB RAM**, TMNF with ModLoader/TMLoader and **TMInterface 2.1.0**. Runs on Windows or Linux. The authors use Nvidia GPUs, and users report that AMD GPUs also work — [Linesight installation docs (repo source)](https://github.com/Linesight-RL/linesight/blob/main/docs/source/installation.rst)
- **Reference hardware:** Ryzen 7 5700G, 64 GB RAM, RTX 4070 Ti. Training is 58% faster on Linux than on Windows. Throughput peaks at 4 parallel game instances on Linux and 2 on Windows — [Linesight user FAQ (repo source)](https://github.com/Linesight-RL/linesight/blob/main/docs/source/user_faq.rst)
- **Learning curve on the default map (ESL-Hockolicious):** about 300k steps to learn to press forward at the start, about 500k steps to finish the map once, and about 1M steps to finish regularly — [Linesight first-training docs](https://github.com/Linesight-RL/linesight/blob/main/docs/source/first_training.rst)
- **Per-map setup:** each new map needs a "Reference Line," a trajectory sampled every 50 cm from a replay. It "does not need to be fast"; the authors usually drive the centerline. A configurable `map_cycle` lets the agent "train on some maps, test blindly on others" — [Linesight second-training docs](https://github.com/Linesight-RL/linesight/blob/main/docs/source/second_training.rst)
- **Architecture:** an IQN (Implicit Quantile Network). A small convolutional head reads one greyscale image channel, alongside 184 numeric features, and the network chooses among **12 discrete actions** (keyboard-style inputs). The network is printed in the training banner — [Linesight docs source, wall_text.rst](https://github.com/Linesight-RL/linesight/blob/main/docs/source/wall_text.rst)
- [older: Jan 2024] The input is 160x120 greyscale images. The reward is distance progressed along the reference trajectory over the next 7 seconds. Training on ESL-Hockolicious took **80 hours at 9x game speed, about one month of human-equivalent play**, and reached 54.06 s, roughly 20th in the no-shortcut category. Humans did not reach that time until the map was six years old — [Hall of Dreams, "History of ML in Trackmania"](https://hallofdreams.org/posts/trackmania-1/)
- [2026] The repo is still active. Recent commits merged community PRs: 2026-06-08 (removed WMIC dependency), 2026-06-17, and 2026-09-30 (fix for use_jit=False). I found no new record announcements from 2025–2026 — [Linesight GitHub commits](https://github.com/Linesight-RL/linesight) (verified via git clone, 2026-10-10)
- A community fork replaces the network trunk with a fruit-fly connectome. It reports 55.34 s on ESL-Hockolicious, against 53.83 s for the standard dense trunk and a 49.47 s human world record (that WR probably includes shortcuts). Not an official Linesight result (search summary, not full read) — [vicho-btw/linesight fork](https://github.com/vicho-btw/linesight)
- In 2023, donadigo (the TMInterface author) praised Linesight for attempting "real maps instead of just constraining the agent to simple tracks," while noting the run was "a result of hours of training on the same map" — [donadigo on X](https://twitter.com/donadigo/status/1704189648719802557)

**Yosh (YouTube creator; projects since May 2020)**
- [Sept 2025] Yosh's RL agent beat the A01 world record of **23.79 s** (held by a player Dexerto calls "Eddie," unbeaten for about 2 years) with an **unassisted 23.75 s**. It reached the author/target time after more than 3,000 attempts and was consistently within hundredths of the record "by the 400-hour mark." An "auto-drift" helper that holds the optimal drift angle gave **23.72 s**, beating the record about half the time. Segmented training plus TAS-style brute force gave **23.64 s**, using a misaligned road seam that allows an earlier downhill jump. Human player Rollin set 23.78 s in Aug 2025. The article does not state the game version — [Dexerto, 6 Sept 2025](https://www.dexerto.com/gaming/youtuber-uses-ai-to-shatter-trackmanias-untouchable-record-3246676/)
- The video summary says the AI acted only 20 times per second. The record result combined AI driving with a manually built TAS that used a hole in the track, and the TAS community later improved on it. The AI was then being trained on the rest of the campaign — [pean.ai video summary of "AI just Broke Trackmania's Greatest World Record"](https://pean.ai/youtube/zFLQU70QstY)
- [older] Yosh's techniques included NEAT, DQN and SAC, and a "training wheels" reward for neo-slides that is removed once learned. An earlier network set 29.00 s on a simple map, and Wirtual needed more than 10 hours to beat it (28.98 s) — [Hall of Dreams](https://hallofdreams.org/posts/trackmania-1/)
- Press coverage describes Yosh's bot as struggling to generalize to other tracks (search summary, not full read) — [The Drive](https://www.thedrive.com/news/this-ai-driven-trackmania-bot-cant-be-beat); [The Autopian](https://theautopian.com/how-a-youtuber-spent-years-teaching-ai-how-to-beat-him-at-virtual-racing)

**TMRL (Polytechnique Montréal; TM2020)**
- tmrl is a distributed real-time RL framework with a TM2020 Gymnasium environment. It supports SAC and REDQ, and observations are either raw screenshots or a simpler 19-beam "LIDAR." It hosts the "TrackMania Roborace League" vision-based AI competition. [older: 2022] On the French show Underscore_ (2022-06-08) a LIDAR policy "lost by far" to TM world champions: about 45.5 s average against a superhuman target of about 32 s on the tmrl-test track. tmrl gave a talk at Ubisoft Montréal in 2023 — [tmrl README](https://github.com/trackmania-rl/tmrl)
- Latest release v0.7.1 (2025-05-05). I saw no 2026 commits on the default branch — [tmrl GitHub](https://github.com/trackmania-rl/tmrl) (verified via git clone)
- That televised policy trained for about **200 hours** — [Hall of Dreams](https://hallofdreams.org/posts/trackmania-1/)

**Academic and other projects**
- [older: Feb 2023] A University of Twente thesis added Sophy-style track-curvature lookahead to a TMRL agent: 38.402 s against TMRL's 44.413 s, an average human's 36.985 s and the best human's 34.308 s — [Hall of Dreams](https://hallofdreams.org/posts/trackmania-1/); [Neinders thesis](https://essay.utwente.nl/96153/1/Neinders_BA_EEMCS.pdf)
- **Generalist attempt (PedroAI, deep Q-learning across many maps):** over 169 days it finished all 100 white/blue-difficulty maps from 2020–2022, earning 11 author and 49 gold medals, but "average performance on most maps stayed worse than bronze," and training plateaued — [Hall of Dreams](https://hallofdreams.org/posts/trackmania-1/)
- Bluemax666 (VAE plus RL, TM2020) came within 0.3 s of the WR on a *training* map by 2021, using only screen and speed — [Hall of Dreams](https://hallofdreams.org/posts/trackmania-1/)
- [2024 preprint, not peer-reviewed] Authier-Carcelen & Zadourian trained PPO on pixels plus physics, using a custom training circuit built from all available blocks. The aim was a track-independent driver. I did not see held-out-track evaluation (search summary) — [Preprints.org 202409.0778](https://preprints.org/manuscript/202409.0778/v1)
- arXiv papers that mention Trackmania are few. **OfflineMania** (Jul 2024) is a Unity-built, Trackmania-inspired offline-RL benchmark — [arXiv 2407.09415](https://arxiv.org/abs/2407.09415). **[2026] "Pixels to Keys"** (Sept 2026) trains inverse-dynamics models that infer key presses from Trackmania gameplay video — [arXiv 2609.37907](http://arxiv.org/abs/2609.37907v2). "TrackMania is NP-complete" (2014) proves that completing an untimed, unbounded TMNF track is NP-complete — [arXiv 1411.5765](https://arxiv.org/abs/1411.5765)

### Inferences
- The record-beating results rest on a simulator that can be **sped up and scripted**: TMInterface in TMNF gives 9x speed, input injection and state reads. tmrl on TM2020 has no such hook, trains in real time, and stays far from superhuman. A studio that owns its engine can expose a headless, deterministic, fast-forward physics API, which would make the Linesight approach cheaper and parallelisable.
- Rough cost per track for a near-WR or superhuman time on short tracks: tens to hundreds of hours of sped-up simulation on one consumer GPU PC (80 h at 9x for Hockolicious; about 400 h for Yosh's A01). For QA purposes, "finishes the map regularly" comes far earlier, around 1M steps.
- Generalization is the main weakness. Per-map training gives superhuman times, while cross-map generalists perform at roughly bronze level. A shipped AI driver for unseen user maps would currently be weak unless fine-tuned per map.

### Gaps
- Exact map names and times for Linesight's "10 of 12" world records, and the video date: the YouTube page and description could not be retrieved. The A02 claim comes from a single blog with a conflicting date.
- Game version (TMNF vs TM2020) for Yosh's 2025 A01 record, and his hardware.
- I found no peer-reviewed 2025–2026 paper that uses real Trackmania as an RL benchmark with held-out-track generalization results.
- Unverified: the earlier A01 record holder "Eddie" (Dexerto) and the "Eddy Reising" alias that Wirtual attributes to Riolu (see section 6) may be the same person. I found no source linking them, so they should not be treated as linked.

## 2. Superhuman racing AI elsewhere: GT Sophy (Nature 2022; 2.0/2.1 in GT7), Forza Drivatars, others

### Takeaway
GT Sophy is the only superhuman racing RL agent shipped as a permanent feature of a commercial game. It went from a Nature paper (Feb 2022) to a limited GT7 release (early 2023), then Sophy 2.0 (Nov 2023, 340+ cars, 9 tracks), then Sophy 2.1 (Mar 27 2025, custom races with player-tuned cars). Getting there took years of Sony AI and Polyphony collaboration, roughly 1,000 consoles of distributed training, weekly agent drops and a large test pipeline. Forza Motorsport (2023) moved its Drivatar AI to machine learning.

### Cited Findings
- [older: 2022] GT Sophy was the Nature cover in Feb 2022. Its original goal was to beat top Gran Turismo Sport drivers — [Sony AI announcement](https://ai.sony/articles/sonyai022/)
- [older: 2022] News coverage of Wurman's remarks: training ran across about 1,000 PS4 consoles. GT Sophy learned to drive a track in about 1 hour, matched an average human in about 4 hours, and reached the top 1% in 24–48 hours. One outlet adds that about 10 more days were needed to beat the best humans (secondary report). Search summary; the NPR page returned 503 on fetch — [NPR, 23 Feb 2022](https://www.npr.org/2022/02/23/1080976330/ai-video-games-sony-playstation-gran-turismo-autonomous-car); [KUNC/NPR, 11 Feb 2022](https://www.kunc.org/2022-02-11/artificial-intelligence-beats-top-human-players-in-popular-racing-game)
- [older: Nov 2023] The earlier limited release offered 4 cars on 4 tracks and was used "to test the neural network in-game." **GT Sophy 2.0** went live 2 Nov 2023 in the GT7 Spec II update (patch 1.40), in Quick Race, with **340+ cars on 9 tracks, about 95% of car models**. It is PS5 only and **requires an internet connection**; the article does not say whether inference runs locally or in the cloud — [Sony AI](https://ai.sony/articles/sonyai022/)
- [2025] **GT Sophy 2.1** shipped in GT7 update 1.57 on **27 Mar 2025**. It adds Custom Races with player-tuned cars and garage one-make races. It is PS5 only and limited to supported tracks — [Sony AI 2.1 announcement](https://ai.sony/articles/Sony-AI-Expands-Capabilities-of-Breakthrough-AI-Agent-Gran-Turismo-Sophy-Offering-Players-a-More-Flexible-and-Personalized-Experience); [Gran Turismo news](https://www.gran-turismo.com/us/news/00_4957003.html)
- [2025] Details from a Sony AI interview (Kaushik Subramanian, Takuma Seno):
  - The 2.1 observations include the car's **tuning parameters**.
  - A new training scheme adapts data collection, giving more data to scenarios where Sophy struggles and to hard-to-drive cars.
  - Engine-swapped cars are used as edge-case tests, and the "testing pipeline is large."
  - **Sony AI ships new Sophy versions to Polyphony every week.**
  - Sophy "can't drive some player tunes" but its range is "pretty good."

  — [GTPlanet, 18 Apr 2025](https://www.gtplanet.net/gran-turismo-sophy-2-1-behind-the-scenes-with-sony-ai)
- [older: Jul 2023] Turn 10 rebuilt Forza Motorsport's Drivatar system with machine learning. It no longer copies friends' driving styles, and Turn 10 says it uses no cheats, hacks or rubber-banding. The AI follows optimal driving lines that set braking points and entry and exit speeds. A later update (Update 20) added "multi-line" AI trained on several traffic lines for better side-by-side racing (search summary) — [Forza.net, Drivatars and tire physics](https://forza.net/news/forza-motorsport-drivatars-tire-physics); [Forza.net, Update 20 Drivatar changes](https://forza.net/news/forza-motorsport-drivatar-changes)

### Inferences
- The GT Sophy timeline (about 2–3 years from research result to a broad shipped feature, plus continuing weekly iteration) suggests that an RL opponent or ghost covering *all* user content is a dedicated multi-year team effort. Trackmania-style user-generated maps are a much harder generalization target than GT7's fixed set of 9 supported tracks.
- Sophy 2.1's tuning-aware observations show that agents can condition on vehicle parameters. That supports the idea of an RL driver as an evaluator during handling changes (section 5).

### Gaps
- Exact GT Sophy training compute and duration from the Nature paper itself (Wurman et al. 2022), and whether in-game inference runs on the PS5 or on servers.
- iRacing AI: I found no sourced material.
- I found no public data on player engagement with Sophy.

## 3. Could general agents (Claude/GPT/Gemini computer-use agents, SIMA 2, NitroGen) drive a Trackmania-style game in real time?

### Takeaway
No, not at competitive level. Current vision-language and computer-use agents take seconds to tens of seconds per action, and they fail real-time games. Benchmarks only become tractable when the game is paused between actions. Generalist embodied agents (SIMA 2, NitroGen) act in real time but target navigation and combat tasks, not precise racing lines. A Trackmania-quality driver still requires a specialised, fast policy (RL or imitation). An LLM agent is better suited to orchestrating tools than to holding the controller.

### Cited Findings
- [2025] **VideoGameBench** (23 Game Boy and MS-DOS games, raw screen input) found model latency means "the game state has already substantially changed" by the time an action arrives. Top model Gemini 2.5 Pro completed **0.48%** of the real-time benchmark and **1.6%** of the "Lite" version, where the emulator pauses while the agent thinks — [arXiv 2505.18134](https://arxiv.org/abs/2505.18134v2)
- [2025] **Orak**: when switched from paused to real-time mode, all models scored 0 on the hard level. Average per-step latency was 19.6 s (GPT-4o-mini), 27.2 s (GPT-4o) and 99.2 s (Gemini 2.5 Pro) (search summary) — [arXiv 2506.03610](https://arxiv.org/pdf/2506.03610)
- [Nov 2025] **SIMA 2** (Google DeepMind, Gemini-based) was evaluated on commercial games: ASKA, Goat Simulator 3, Hydroneer, No Man's Sky, Satisfactory and Space Engine. **No racing title** is listed. Held-out-game task completion was reported as roughly 45–75%, against 15–30% for SIMA 1 (search summary) — [SIMA 2 paper, arXiv 2512.04797](https://arxiv.org/pdf/2512.04797); [DeepMind blog, 13 Nov 2025](https://deepmind.google/blog/sima-2-an-agent-that-plays-reasons-and-learns-with-you-in-virtual-3d-worlds/)
- [Dec 2025 / CVPR 2026] **NVIDIA NitroGen** is an open vision-to-action foundation model trained on gameplay video. The model card says it works best on gamepad games "(e.g., action, platformer, and racing games)." Racing is only about 4% of the training data. It gives up to 52% relative task-success improvement over training from scratch when fine-tuned on unseen games. The authors call it a fast "system-1" model that cannot plan over long horizons or follow language instructions. I found no racing lap-time results (search summary) — [NitroGen arXiv 2601.02427](https://arxiv.org/pdf/2601.02427); [Hugging Face model card](https://huggingface.co/nvidia/NitroGen); [CVPR 2026 paper](https://openaccess.thecvf.com/content/CVPR2026/papers/Magne_NitroGen_An_Open_Foundation_Model_for_Generalist_Gaming_Agents_CVPR_2026_paper.pdf)
- [2026] Inverse-dynamics models that turn Trackmania video into key presses are an active research topic, but the authors report rare-action failures and ambiguity from camera motion and delayed effects — [Pixels to Keys, arXiv 2609.37907](http://arxiv.org/abs/2609.37907v2)
- For comparison, Yosh's specialised agent acted at only 20 Hz, yet beat a world record — [pean.ai summary](https://pean.ai/youtube/zFLQU70QstY)

### Inferences
- The gap is several orders of magnitude. Trackmania needs decisions about every 50 ms (20 Hz) or faster, while frontier LLM agents need seconds to tens of seconds per step. Real-time driving by a frontier LLM is not feasible in Oct 2026. Pausing the game ("Lite mode") does not fix this, because Trackmania skill depends on frame-precise inputs.
- Plausible roles for general agents: writing and running RL training configs, analysing replays and telemetry, building maps through tools (section 4), and triaging QA outputs. The actual driving should stay with specialised policies.

### Gaps
- I found no METR or other formal evaluation of frontier agents (Claude, GPT, Gemini) on a 3D racing game, and no 2026 frontier-agent latency figures for real-time games. A Sept 2026 survey, "AI for Games in the Foundation Model Era" ([arXiv 2609.16679](https://arxiv.org/pdf/2609.16679)), exists but I did not read it.

## 4. Track generation: PCG research, LLM-generated levels, Trackmania-specific generators, GBX tooling, community views

### Takeaway
Trackmania map generation by AI is still hobbyist and experimental. Examples: donadigo's TMTrackNN neural generator (about 2019–2021, trained on about 3,500 TMX tracks), random-block generators, and an Oct 2026 LLM/MCP map generator whose own author calls its output "very basic and mostly unviable." The file-format tooling is mature: GBX.NET reads and writes Map.Gbx, so generation is not blocked by format access. The missing piece is generating maps with good *flow* that are physically valid, which requires driving them (sections 1 and 7). I found little organised community discussion of AI-generated maps.

### Cited Findings
- **GBX.NET [2026]:** a C#/.NET library for Nadeo Gbx files covering "400+ Gbx classes." It can **read and write Map.Gbx/Challenge.Gbx**, read Replay.Gbx (no write), and read and write Ghost.Gbx. It describes itself as "a modding platform" for bulk processing. GBX.NET itself is MIT licensed, but reading or writing compressed Gbx needs GBX.NET.LZO, which forces GPLv3. Last activity 2026-09-17 — [GBX.NET GitHub](https://github.com/BigBang1112/gbx-net)
- **LLM/MCP generator [2026]:** "Trackmania GBX MCP Server & Map Generator (Experiment)" lets LLMs (Claude Desktop, Cursor, Antigravity) build TMNF maps through a relative "Turtle DSL" compiled with GBX.NET. The author's warning: output is "**very basic and mostly unviable for competitive or realistic driving**" because the LLM produces "naive, linear block sequences." The author lists the missing pieces: retrieval of multi-block modules (loops, wallrides, jumps), and **"No Physics or Momentum Validation"** (the validator checks geometry only). Commits run Sept 18 to Oct 7, 2026 — [cheatoskar/llm-trackmania-map-generator](https://github.com/cheatoskar/llm-trackmania-map-generator); [cheatoskar/trackmania-map-mcp](https://github.com/cheatoskar/trackmania-map-mcp)
- **TMTrackNN (donadigo):** neural networks (a block model plus a position model, in Keras) trained on about **3,500 technical tracks from Trackmania Exchange**. They output a GeneratedTrack.Challenge.Gbx. Last commit Nov 2023 — [TMTrackNN GitHub](https://github.com/donadigo/TMTrackNN); [donadigo Medium write-up](https://medium.com/@donadigo/tmtracknn-generating-trackmania-tracks-with-neural-networks-146db058e7cb)
- An aggregator write-up says TMTrackNN was "well-received" and was used in the True Talents Cup competition. It says the tracks imitate technical style but "may lack the flow and testing that human builders incorporate" (aggregator source; low confidence) — [toolify.ai](https://www.toolify.ai/ai-news/from-humancreated-to-ai-generated-racing-tracks-in-trackmania-1318656)
- **Procedural (non-ML):**
  - TheMaster1127's alpha toolset (last updated Aug 2025) generates TM2020 maps by first generating a TMNF map and then converting it, "because the complexity of the format proved difficult" — [GitHub](https://github.com/TheMaster1127/programmatically-making-a-trackmania-map)
  - ipidev's TrackGen produces random TM2020 layouts that the user rebuilds by hand in the editor — [GitHub](https://github.com/ipidev/TrackGen)
- One TMX mappack author, using the "Track Generator Extended" Openplanet plugin, reportedly said some generated tracks were "impossible or stupidly and annoyingly difficult to the point that I don't even want to validate them." This is a search summary; the page I fetched (mappack 4555, "AI Generated Tracks," 13 maps, tags LOL and Endurance) showed no such text, so the quote is unverified — [TMX mappack 4555](https://trackmania.exchange/mappack/view/4555/ai-generated-tracks)
- On community attitudes, a speedrunning blogger worries that AI route-finding (citing Linesight) could take away "the excitement of human discovery," while admitting uncertainty — [Dakota Marshall blog](https://dakotamarshall.net/content/drafts/ai-the-death-of-human-discovery/)

### Inferences
- The obvious design for a production track generator combines three parts: an LLM or ML proposer working on a structured, relative DSL; a library of proven multi-block modules; and an RL or physics-sim validator that drives each candidate. Each part exists separately (MCP generator, GBX.NET, Linesight-style agents), but I found no project that connects them.
- Trackmania's own rule that a map must be validated by driving it before publishing (the author time) is the natural quality gate for AI-generated maps.

### Gaps
- I found no peer-reviewed PCG paper specific to Trackmania, and no 2025–2026 academic racing-track PCG results (my arXiv query for "track generation" plus "racing" returned nothing relevant).
- I found no Nadeo or TMX policy on AI-generated maps, and no measured community sentiment (polls, threads).

## 5. Physics and handling tuning: can AI tune handling or judge "feel"?

### Takeaway
There is solid evidence that RL "test drivers" can evaluate setup and handling changes and find optimal lines quickly: NetEase (GDC 2022), Toyota Research Institute (2024), and Sony's tuning-aware Sophy 2.1 (2025). These are performance and balance tools. I found no evidence that AI can judge subjective handling "feel."

### Cited Findings
- [older: GDC 2022] Minggao Wei of NetEase Games AI Lab presented "Reinforcement Learning for Efficient Cars and Tracks Design in Racing Games." The talk says manually verifying car performance on every track is "time-consuming." With deep RL, "the optimal racing trace for all cars can be figured out in less than an hour," and "the drift area, which is highly related to the track difficulty, can be visualized to help the assessment" — [GDC Vault](https://gdcvault.com/play/1028060/Reinforcement-Learning-for-Efficient-Cars)
- [older: Dec 2024] Toyota Research Institute's "Towards an Autonomous Test Driver": a deep-RL driver "capable of evaluating changes in vehicle setup on racing performance while driving at the level of the best human drivers." The authors warn that agents can **hyper-specialise**, so that lap time "can actually increase slightly when tire grip is increased." They propose imitation learning to shape a human-like style for driver-specific setup optimisation (search summary) — [arXiv 2412.03803](https://arxiv.org/abs/2412.03803)
- [2025] GT Sophy 2.1 receives car tuning parameters as observations, yet "can't drive some player tunes" — [GTPlanet](https://www.gtplanet.net/gran-turismo-sophy-2-1-behind-the-scenes-with-sony-ai)
- [older: 2022–2023] Physics changes can be driven by competitive-integrity concerns, not only by feel. Nadeo reworked ice physics to reduce the advantage of analog input devices — [Wikipedia, Wirtual](https://en.wikipedia.org/wiki/Wirtual)

### Inferences
- In a Trackmania-like project, AI can realistically do regression testing of handling changes: re-run agents on a track corpus, compare lap times, drift areas and finish rates, and flag maps whose author or medal times shift. "Feel" sign-off would still rest with human designers and playtesters.
- The hyper-specialisation finding means an agent trained on old physics can mis-rank new physics, so agents must be retrained or fine-tuned after each handling change before their judgments are trusted.

### Gaps
- I found no published study validating AI judgments of handling "feel" against player ratings, and no Trackmania-specific physics-tuning work.

## 6. Leaderboard integrity: ML for detecting cheated runs; AI/TAS as a cheating threat; the 2021 scandal; what Nadeo does now

### Takeaway
The 2021 scandal was exposed by community **statistical analysis of replay inputs** (steering "spikes per second," which reveal slowed-down play), not by machine learning. Nadeo then ran its own undisclosed sweep of about 400k TMUF records, removed thousands of cheated records and banned Riolu. Nadeo has since ruled against steering-value software and keeps its detection methods private. AI is now a credible threat on its own: specialised RL agents beat human world records (Yosh's unassisted 23.75 s on A01). The current safeguard is the norm that these runs are labelled tool-assisted and not submitted, not a technical barrier.

### Cited Findings
**How the 2021 scandal was uncovered [older: 2021]**
- In May 2021, Wirtual and donadigo investigated top players suspected of using slow motion. The report was published on **23 May 2021** after Riolu accused Wirtual of blackmail on stream. Riolu had cheated "thousands of records over more than a decade" — [Wikipedia, Wirtual](https://en.wikipedia.org/wiki/Wirtual); date per Liquipedia (search summary) — [Liquipedia, Riolu](https://liquipedia.net/trackmania/Riolu)
- **Method (primary report):** inputs were extracted from replay files with scripts (gbxtools) to build a dataset "based on objective factors." The metric was "**spikes per second**," meaning changes of steering direction, on a steering range of [-65536, 65536], with changes under a threshold of **2000 (1.5% of range)** ignored. Data: **19,977 United Forever replays analysed** (33,641 scraped) and 5,691 Nations replays scraped. Suspect runs were checked by injecting the inputs with a custom tool and comparing against video. Seven players were flagged, including riolu (acceleracer_01) and Techno (self-admitted). The authors admit the metric "may favour certain play styles" and that "official mode does not detect slowing down the game." They recommended making the community **Competition Patch** (which logs input-injection metadata) mandatory — [donadigo & Wirtual, TMX Replay Investigation](https://donadigo.com/tmx1)
- **Nadeo's response (Jul 2021):** Florent Castelnérac (Hylis): "We ran anticheat detection for **400k records made over the last 15 years** on TMUF." Most cheated records belonged to **10 logins**, and fair records were "above 99% and closer to 100%." Nadeo would not disclose methods "as it is best for anticheat development" — [NME, 13 Jul 2021](https://www.nme.com/news/gaming-news/trackmania-developers-use-400000-records-to-find-major-cheating-logins-2992519)
- About 5,400 cheated Official Mode records were removed from TMUF leaderboards, and Riolu was banned from all Trackmania games (search summary) — [TMNF Wiki, 2021 Cheating Scandal](https://tmnf.miraheze.org/wiki/2021_Cheating_Scandal); [PC Gamer](https://www.pcgamer.com/trackmania-dev-analyses-15-years-worth-of-records-to-root-out-the-cheaters/)

**Later events and current practice**
- Nadeo stated on social media that "using software to set specific steering values" is an unfair advantage and not allowed (the cited post is dated 2023-12-13). Nadeo also reworked ice physics against analog-device advantages. Wikipedia's dating of this controversy is internally inconsistent (July 2022 vs Dec 2023) — [Wikipedia, Wirtual](https://en.wikipedia.org/wiki/Wirtual)
- [2025] In March 2025, Wirtual published a further investigation alleging that Riolu had used sock-puppet aliases ("92BOB," "Eddy Reising") since 2021 to flood leaderboards and harass people. Nadeo reportedly purged Riolu's records for a fair-play violation; the supporting citation is weak — [Wikipedia, Wirtual](https://en.wikipedia.org/wiki/Wirtual)
- In TM2020 (Spring 2021 campaign), hacked world records appeared on tracks 1 and 2 ("warp to ground," teleportation). A staff reply said cheated records "are always removed" and infractions issued, but cleanup takes time; it did not address anticheat or a competition patch — [devtrackers, Trackmania](https://devtrackers.gg/trackmania/p/3525de14-spring-1-2-currently-have-hacked-world-records)
- An early TM2020 anticheat scan ("a new released tool") wiped legitimate top runs, including a world record. Staff asked for video or screenshots to check false positives — [devtrackers, Trackmania](https://devtrackers.gg/trackmania/p/b1c5ba74-false-positive-runs-wiped-out)
- Nadeo's reporting page says cases go to Nadeo, but reporters "will not receive details as to which actions were taken, if any" (search summary) — [Trackmania docs, how to report a player](https://doc.trackmania.com/general/how-to-report-player/)

**AI and TAS as a cheating threat**
- Linesight: "All runs produced by this project are Tool Assisted. They must not be submitted to the Official Leaderboards" — [Linesight docs](https://linesight-rl.github.io/linesight/build/html/)
- Yosh's unassisted RL run (23.75 s) beat the human A01 WR (23.79 s). Helper-assisted and TAS runs went faster still (23.72 s and 23.64 s) — [Dexerto](https://www.dexerto.com/gaming/youtuber-uses-ai-to-shatter-trackmanias-untouchable-record-3246676/)
- Inverse-dynamics models can now recover key presses from Trackmania video (2026 research). This could help verification by cross-checking video against replay inputs. It also shows how much input-level information leaks from footage — [arXiv 2609.37907](http://arxiv.org/abs/2609.37907v2)

### Inferences
- The 2021 detection succeeded because cheaters produced *physically human-impossible input statistics*. RL bots and slowed-down play driven by bots could produce input streams with human-like timing, so a heuristic like spikes per second may not catch them. Defences would need client attestation (signed or patched clients, as with the Competition Patch), server-side re-simulation of replays, and ML anomaly models trained on known-bot and known-human input distributions.
- An RL agent that the studio trains itself is useful for integrity as well: it gives a "superhuman ceiling" per map, against which suspicious human times can be checked.

### Gaps
- What Nadeo's current (2025–2026) TM2020 anticheat does (server-side replay checks, client protection, any ML) is undisclosed. I found no official technical description.
- I found no public case of an RL bot being caught submitting runs to official Trackmania leaderboards.

## 7. Using an AI driver for QA: shortcuts, softlocks, unfinishable tracks, author and medal times

### Takeaway
The evidence base is indirect but consistent. Per-track RL agents finish maps after about 1M steps, then optimise to near or beyond world-record pace, and they find unintended routes and exploits (A02 route, A01 road-seam jump). Studios (NetEase, EA SEED) have used RL agents to compute optimal lines in under an hour and to maximise exploration coverage. No studio has published a full "AI validates every user map" pipeline for a Trackmania-like game. Formal verification of finishability does not scale in general (NP-complete).

### Cited Findings
- Finishability as a QA signal: Linesight needs about 500k steps for its first finish and about 1M for regular finishes on Hockolicious — [Linesight docs](https://github.com/Linesight-RL/linesight/blob/main/docs/source/first_training.rst)
- Shortcut discovery: Linesight's model reportedly found shortcuts "within hours" and a faster A02 route behind a 6-year-old record — [Dakota Marshall blog](https://dakotamarshall.net/content/drafts/ai-the-death-of-human-discovery/). Yosh's AI pipeline used a misaligned road seam on A01 — [Dexerto](https://www.dexerto.com/gaming/youtuber-uses-ai-to-shatter-trackmanias-untouchable-record-3246676/)
- Setting medal and author times across many maps with one generalist agent: PedroAI over 169 days earned 11 author and 49 gold medals across 100 maps, but averaged worse than bronze on most maps — [Hall of Dreams](https://hallofdreams.org/posts/trackmania-1/)
- Per-map cost: reference line (a centerline drive is enough), plus a map cycle that supports "test blindly on others" — [Linesight docs](https://github.com/Linesight-RL/linesight/blob/main/docs/source/second_training.rst)
- Industry precedent:
  - NetEase: RL finds optimal traces for all cars in under 1 hour, and drift-area visualisation shows track difficulty — [GDC 2022](https://gdcvault.com/play/1028060/Reinforcement-Learning-for-Efficient-Cars)
  - EA SEED: curiosity-driven RL agents rewarded for novelty, to maximise playtest state coverage — [EA SEED, CoG 2021](https://www.ea.com/seed/news/cog2021-curiosity-driven-rl-agents)
  - CARMI: RL agents that imitate player styles on unseen levels for difficulty assessment, needing "little human data" — [arXiv 2211.17188](https://arxiv.org/abs/2211.17188v1)
- Theory: completing an untimed, unbounded TMNF track is NP-complete, so there is no general efficient finishability checker — [arXiv 1411.5765](https://arxiv.org/abs/1411.5765)
- Validation gap in generators: the 2026 LLM map generator validates geometry only and has no physics or momentum checks — [cheatoskar repo](https://github.com/cheatoskar/llm-trackmania-map-generator)

### Inferences
- A practical QA stack for a new Trackmania-like game would have three layers:
  - **Cheap layer:** an exploration or curiosity agent plus a "can it finish?" RL run on a fast headless sim. This catches unfinishable maps, softlocks and missing checkpoints.
  - **Expensive layer:** per-map optimisation (Linesight-style) to estimate a superhuman ceiling and detect shortcuts, where the agent finishes much faster than the intended line or skips the reference line.
  - **Medal times:** derived from the agent's ceiling with human calibration. Current generalist agents are too weak for author times on unseen maps.
- The cost is mostly compute, at tens of GPU-PC-hours per map for near-WR results. Finish checks at about 1M steps are much cheaper, and both costs drop if the engine supports faster-than-real-time simulation (inference from section 1).

### Gaps
- I found no published Nadeo or Ubisoft use of AI drivers for campaign QA or medal-time setting, and no softlock-detection results specific to racing games.
