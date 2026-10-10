# AI Systems for Engineering & Technical Roles in Professional Game Development (state as of October 10, 2026)

> Source-quality warning for the report writer: most frontier-model benchmark numbers below come from vendor self-reports relayed by third-party aggregators (benchlm.ai, llm-stats.com, codersera, datacamp, morphllm). I did not reach primary Anthropic/OpenAI/Google announcement pages in this pass. llm-stats lists all 61 SWE-bench Pro entries as "self-reported, 0 verified." Treat exact numbers as provisional. Game-specific benchmarks are mostly 2026 arXiv preprints, not peer-reviewed yet, except GameDevBench (ICML 2026). Disclosure: these notes were compiled by an Anthropic model (Claude Opus 5.5), and several findings favor Anthropic models. Every claim is sourced so it can be checked.

---

## Q1. Which general coding agents and models lead as of Oct 2026, and which are best on C++, game engines, and large codebases?

### Takeaway
As of October 2026 the frontier is Anthropic (Claude Opus 5.5, released Sept 22, 2026; Fable 5/5.1; Sonnet 5.5) and OpenAI (GPT-6 Astra, Sept 3, 2026; GPT-6.1 Sol, Sept 29, 2026, the default model in Codex). Google's Gemini 4 Argon was announced Sept 30 but is in staged rollout and is not generally callable. Anthropic models lead the self-reported SWE-bench Pro rankings and the general coding composites. OpenAI leads the public Terminal-Bench boards and the largest game-engine benchmark (GameDevBench). On real Unreal C++ (GameEngineBench, July 2026), Claude Fable 5 in Claude Code led by a wide margin, but that run predates Opus 5.5 and GPT-6.

### Cited Findings
**Model releases and specs**
- Claude Opus 5 was announced July 24, 2026, with a 1M context window and $5/$25 per M tokens. It scored 96.0% on SWE-bench Verified and 79.2% on SWE-bench Pro (secondary sources relaying vendor numbers) — [DataNorth](https://datanorth.ai/news/claude-opus-5-by-anthropic); [Morph Claude benchmarks](https://www.morphllm.com/claude-benchmarks)
- Claude Opus 5.5 was released Sept 22, 2026 (`claude-opus-5-5`) with 1M context, 128K max output and adaptive thinking that is always on (effort levels low through max). It costs $4 in / $20 out per M tokens, with $0.20 cache reads, and is on the Claude API, Bedrock, Vertex AI and Microsoft Foundry — [Codersera Opus 5.5 guide](https://codersera.com/blog/claude-opus-5-5-complete-guide-2026/amp/)
- Opus 5.5 self-reported scores: SWE-bench Pro 89.9 (Opus 5: 79.2; Fable 5.1: 81.2); SWE-bench Multilingual 93.9; Terminal-Bench 4.0 66.4 (GPT-6 Astra 57.9; measured in Claude Code `--bare` at xhigh); FrontierCode v1.1 54.4 (Astra 53.3); CursorBench 4.0 57.8 (measured by Cursor). GPT-6 Astra leads FrontierSWE v2 (65.5 vs 62.3), Terminal-Bench-Science and AutomationBench. Anthropic published no SWE-bench Verified number for Opus 5.5 — [Codersera](https://codersera.com/blog/claude-opus-5-5-complete-guide-2026/amp/)
- Independent check: Artificial Analysis Intelligence Index v4.3.2 ranks Opus 5.5 (max) #1 of 224 models at 57.62, ahead of Fable 5.1 at 53.35 and GPT-6 Astra at 52.67. AA's own Terminal-Bench 4.0 run gives Opus 5.5 59.6%, lower than Anthropic's 66.4%. The public Terminal-Bench 4.0 leaderboard is led by GPT-6 Astra at 58.2% and does not yet list Opus 5.5 — [Codersera](https://codersera.com/blog/claude-opus-5-5-complete-guide-2026/amp/)
- GPT-6 Astra (released Sept 3, 2026) is the top OpenAI tier at $10/$50 per M tokens. GPT-6.1 Sol launched Sept 29, 2026 at DevDay at $2/$10 with $0.10 cached input and is the default Codex model. GPT-6 Luna costs $0.10/$0.50 — [Developers Digest (Astra)](https://www.developersdigest.tech/blog/gpt-6-astra-release-guide-2026); [DataCamp (6.1 Sol)](https://www.datacamp.com/blog/gpt-6-1-sol); [Kingy AI](https://kingy.ai/blog/gpt-6-1-sol-specs-benchmarks-pricing-task-costs/); [Yotta Labs](https://www.yottalabs.ai/post/gpt-6-release-date-rumors-what-is-known-2026)
- Gemini 4 Argon was announced Sept 30, 2026 and goes first to trusted cyber defenders, with no GA date. Google's own table reportedly shows DeepSWE v1.1 at 77.9%, FrontierSWE v2 at 55.0% and Terminal-Bench 4.0 at 57.4%. Bloomberg, via R&D World, reports some Google employees questioned its practical coding performance — [AIToolsReview](https://aitoolsreview.co.uk/insights/gemini-4-argon-launch); [ToolScout](https://toolscout.ai/news/gemini-4-argon-benchmarks); [R&D World](https://www.rdworldonline.com/googles-overdue-gemini-4-argon-reaches-the-frontier-with-mixed-results-for-science/); [OrcaRouter](https://www.orcarouter.ai/blog/gemini-4-release-date)

**Leaderboards**
- SWE-bench Pro, llm-stats (updated Oct 10, 2026; all entries self-reported):
  1. Claude Opus 5.5: 89.9
  2. Claude Sonnet 5.5: 81.3
  3. Claude Fable 5: 80.0
  4. Claude Mythos Preview: 77.8
  5. Claude Opus 4.8: 69.2
  6. Qwen3.8 Max: 67.7
  7. Tencent Hy4 preview: 65.7
  8. Claude Haiku 5.5: 64.8
  9. Grok 4.5: 64.7
  10. GPT-5.6 Sol: 64.6

  GPT-6 models do not appear in this list — [llm-stats SWE-Bench Pro](https://llm-stats.com/benchmarks/swe-bench-pro)
- SWE-bench Verified is now described as saturated (top scores 95–97%: Opus 5 at about 96%, GPT-5.6 Sol at 96.2%, Fable 5 at 95%). Sources disagree on the #1 slot — [BenchLM SWE-bench Verified](https://benchlm.ai/benchmarks/swe-bench-verified); [LLM Stats Verified](https://llm-stats.com/benchmarks/swe-bench-verified); [Local AI Master](https://localaimaster.com/models/swe-bench-explained-ai-benchmarks)
- BenchLM's weighted coding composite (Oct 10, 2026):
  1. Claude Sonnet 5.5: 84
  2. Claude Opus 5.5: 83.3
  3. Claude Fable 5.1: 77.3
  4. GPT-6 Astra: 76.1
  5. Gemini 4 Argon: 72.4
  6. Claude Fable 5: 71.6
  7. Claude Opus 5: 71.1
  8. GPT-6.1 Sol: 71

  SWE-bench Pro carries the most weight (26%) — [BenchLM coding](https://benchlm.ai/coding)
- Terminal-Bench 2.0 (older version, now superseded by 2.1 and 4.0): GPT-5.5 leads at 82–82.7% — [BenchLM TB2](https://benchlm.ai/benchmarks/terminal-bench-2); [LLM Stats TB2](https://llm-stats.com/benchmarks/terminal-bench-2); [tbench.ai 2.1 notice](https://www.tbench.ai/news/terminal-bench-2-1)
- Agent-harness leaderboard (Morph, Oct 2026): Claude Code + Opus 5.5 leads Terminal-Bench at 64.8%. Codex + GPT-6.1 Sol scores 58.2% at max effort, at $1.92 per task — [Morph best coding agents, via search snippet](https://www.morphllm.com/best-ai-coding-agents-2026)

**Game-engine / C++ specific**
- **GameEngineBench** (arXiv 2607.03525, July 3, 2026; Nitrode, Nexon Intelligence Labs, Dartmouth, Columbia, Cornell) has 110 native-C++ tasks from 9 real UE5 repos, graded by Play-in-Editor tests. Pass@1:
  - Claude Fable 5 + Claude Code (max): 55.5%
  - GPT-5.5 + Codex (xhigh): 29.1%
  - Claude Opus 4.8 + Claude Code (max): 23.6%
  - GPT-5.5 + Codex (high): 19.1%
  - Gemini 3.1 Pro + Antigravity CLI: 18.2%
  - GPT-5.5 + Codex (medium): 9.1%

  31 of 110 tasks were unsolved by every configuration. The run predates Opus 5/5.5 and GPT-6 — [GameEngineBench arXiv](https://arxiv.org/html/2607.03525v1); [GitHub](https://github.com/Nitrode-Research/GameEngineBench)
- **CraftBench-UE** (arXiv 2609.23142, Sept 19, 2026; RamenVR and Univ. of Rochester) uses UE 5.8, 70 tasks, deterministic checks and no LLM judge. All runs used the Claude Code runtime with different models. C++ completion within 40 minutes: 77.9% with file/shell only, 87.9% with MCP. Best C++ counts out of 33: Gemini 3.7 Flash 31 (MCP2); Claude Sonnet 5, GPT-5.6 Sol and Grok 4.6 30 each — [CraftBench-UE](https://arxiv.org/html/2609.23142)
- **GameDevBench** (Godot 4.4.1; ICML 2026 camera-ready; 333 tasks), Pass@1:
  1. GPT-6.1 Sol / Codex xhigh: 70.0% ±4.9
  2. GPT-6 Astra / Codex: 68.8%
  3. Claude Fable 5 / Claude Code xhigh: 67.3%
  4. GPT-5.6 Sol: 63.7%
  5. Muse Spark 1.2 / Muse Code: 61.0%
  6. Kimi K3: 58.0%
  7. Claude Opus 4.8: 55.9%
  8. Gemini 3 Pro / Gemini CLI: 53.8%

  Opus 5/5.5 are not listed — [BenchLM GameDevBench mirror](https://benchlm.ai/benchmarks/gamedevbench); [arXiv 2602.11103](https://arxiv.org/html/2602.11103v1)

### Inferences
- No single model wins every game-relevant evaluation. Claude-family agents (Opus 5.5 / Fable 5) are the strongest-evidenced choice for large-codebase and Unreal C++ work: SWE-bench Pro, GameEngineBench, the GameXpert-Bench sweep and the AA index. OpenAI's Codex with GPT-6.x is at least as good, and on the leaderboard better, for Godot / scene-and-script engine tasks (GameDevBench) and terminal/DevOps tasks (public Terminal-Bench 4.0). A studio would reasonably standardize on Claude Code or Codex (or Cursor, which fronts both) rather than on Gemini-based agents, given Gemini 4's limited availability.
- Harness and effort matter as much as the model. GPT-5.5 roughly triples from medium to xhigh effort on GameEngineBench (9.1% to 29.1%), and MCP editor access lifts UE C++ completion by about 10 pp (CraftBench-UE).

### Gaps
- No GameEngineBench, GameDevBench or CraftBench-UE results yet for Claude Opus 5.5, Claude Sonnet 5.5, GPT-6.1 Sol (except GameDevBench) or Gemini 4 Argon. The latest-generation head-to-head on game C++ is therefore unknown.
- I could not reach the official Scale SWE-bench Pro leaderboard (standardized scaffolding), and morphllm.com returned HTTP 429. Independent verification of the 89.9% Opus 5.5 figure is missing.
- Devin, Jules, GitHub Copilot coding agent, Windsurf and Amp had no game-specific evaluation results in my searches. One indie studio blog says Devin "handles small, well-defined tasks but struggles on complex engine codebases" ([Althera Games](https://altheragames.com/en/blog/ai-agents-game-development-2026), anecdotal).

---

## Q2. What engine-native AI assistants exist, and how good are they?

### Takeaway
By Oct 2026 every major engine had converged on the same design: expose the editor through an MCP server and let external frontier agents (Claude Code, Codex, Cursor) drive it. In-house assistants are kept as an optional extra. Unity has the most mature first-party offering, Roblox the most agentic first-party loop, and Epic has only an experimental UE 5.8 MCP plugin plus the Epic Developer Assistant, with UE6's AI layer not before 2027. Third-party tools (Aura, Ludus for Unreal; many Godot MCP plugins; Houdini add-ons) fill the gaps. No independent benchmark compares engine-native assistants with external agents.

### Cited Findings
**Unity**
- Unity AI open beta launched May 4, 2026 for all Unity 6 users. It includes an in-editor Assistant aware of the scene hierarchy, components, packages and target platform, which writes C#, builds scenes, explains console errors and suggests optimizations. It also includes an AI Gateway routing to Claude and GPT (Gateway calls don't consume Unity credits) and an MCP Server exposing the scene graph to Cursor, Claude Code, Antigravity and Windsurf. Bring-your-own-key is supported for Claude, Codex, Gemini and Cursor — [Vindler (vendor blog)](https://vindler.solutions/blog/unity-ai-open-beta); [Unity Discussions](https://discussions.unity.com/t/unity-ai-s-open-beta-now-live-for-unity-6/1718560)
- Unity shipped official first-party plugins for Claude Code on Sept 9, 2026 (29 skills: URP, UI Toolkit, multiplayer networking, LevelPlay, IAP) and Codex on Sept 16, 2026 (31 skills: UI Toolkit/uGUI, 2D, URP and Shader Graph, audio, navigation and physics, multiplayer, etc.). Each bundles the Unity CLI and an MCP server for live Editor control, is free and requires Unity 6+. Unity has published no adoption or error-reduction metrics — [Tech-Insider](https://tech-insider.org/unity-plugins-claude-code-codex-2026/); [GPTS24](https://www.gpts24.com/en/news/unity-ships-first-party-skills-for-claude-code-and-codex-to-replace-forum-sourced-code)
- Quality and price complaints: users report agent-mode prompts rising to "150-200+ credits PER PROMPT," and a reviewer burned the 1,000-credit monthly allotment in one working day. Developers on Unity Discussions argued Unity should focus on MCP and IDE integration, and one review says the biggest gains came from external agents driving Unity via MCP — [Unity Discussions (credit cost)](https://discussions.unity.com/t/ai-assistant-prompt-costs-quintupled-over-night/1722948); [Vindler](https://vindler.solutions/blog/unity-ai-open-beta)
- Research: "Unity Insight: A Production Code–Asset Index for LLM Coding Agents in Unity Projects" (arXiv 2609.27585) indicates code–asset linkage is a recognized gap for agents in Unity (title only; not fetched) — [arXiv](https://arxiv.org/pdf/2609.27585)

**Epic / Unreal**
- Epic (June 17, 2026, State of Unreal and UE website): for UE6, Epic sees "LLMs, generative AI models, and tools like Claude and Codex playing a central role." It is exposing engine capabilities "through the MCP protocol," "improving the Epic Developer Assistant (EDA) as an optional turnkey solution, available to all by default," and supporting bring-your-own-model. Epic has "recently opened up pretty broad usage" of code generation and AI analysis "across our backend, engine, and game development engineering teams." UE6 Early Access is not before 2027 — [Shacknews](https://www.shacknews.com/article/149693/unreal-engine-6-generative-ai-models-claude-codex)
- UE 5.8 ships an experimental MCP plugin. External clients (Claude Code, Cursor) connect to a local endpoint and call editor tools. It "discovers the project one tool call at a time." Source is the Ludus vendor blog, which also claims Ludus AI reads Blueprints and C++ natively on UE 5.4–5.8 — [Ludus blog (vendor)](https://ludusengine.com/blog/unreal-engine-built-in-ai-assistant)
- One reviewer says EDA works better as an Unreal guide than as a primary coding tool — [Vagon](https://vagon.io/blog/best-ai-assistant-for-unreal-engine-in-2026)
- UE6 announcement date conflict: one aggregator says Epic "officially announced Unreal Engine 6 on May 24, 2026," while Shacknews reports the AI statements on June 17, 2026 — [Tech-Insider UE6](https://tech-insider.org/unreal-engine-6-state-of-unreal-2026/); [Shacknews](https://www.shacknews.com/article/149693/unreal-engine-6-generative-ai-models-claude-codex)
- Aura (Ramen VR) launched Jan 2, 2026 (invite-only, 2-week free trial). It has an Editor-Use Agent (lighting, post-processing, mass-editing thousands of Blueprints) and a Coding Agent (C++ and Blueprint, self-correcting), with undisclosed underlying models. Sinn Studio (VR) claims Aura helped "halve production time" and ship *Zombonks* to early access in 5 months, with a "5X" content pipeline. All claims are vendor-reported — [PR Newswire](https://www.prnewswire.com/news-releases/aura-ai-assistant-for-unreal-engine-launches-vr-studio-ships-game-in-half-the-time-with-new-agent-capabilities-302651608.html)

**Roblox**
- "Roblox Studio is Going Agentic" (Apr 15, 2026, Nick Tornow, SVP Engineering): Assistant gains a Planning Mode (it analyzes code and data model, asks clarifying questions and writes an editable plan stored as a task manifest), Mesh Generation, code-controlled Procedural Models, and a Playtesting Agent (beta) that uses the player character as automated QA and feeds results back into planning. Parallel agents, long-form cloud agents and smarter NPCs are planned. Studio has a built-in MCP server for Claude, Cursor and Codex. "44% of the top 1,000 creators" used Assistant or MCP tools between Mar 6 and Apr 7, 2026. No LLM is named — [Roblox Newsroom](https://about.roblox.com/newsroom/2026/04/roblox-studio-going-agentic)
- Studio MCP tools include get_console_output, start_stop_play and run_script_in_play_mode. An August 2026 update requires a studio_id per call. Roblox maintains an official plugin connecting Claude and ChatGPT/Codex to Studio's MCP server — [Roblox DevForum](https://devforum.roblox.com/t/assistant-updates-studio-built-in-mcp-server-and-playtest-automation/4474643); [GitHub Roblox/roblox-studio-agent-plugin](https://github.com/Roblox/roblox-studio-agent-plugin); [BloxBot](https://bloxbot.ai/guide/roblox-studio-mcp-multi-agent-update-2026)
- Cube, Roblox's foundation model, underpins mesh generation and the 4D generation feature (Feb 2026) — [The Next Web](https://thenextweb.com/news/roblox-ai-assistant-agentic-tools-planning-procedural-models)

**Godot**
- Godot has no first-party assistant. Community MCP plugins include Godot MCP Toolkit (Asset Library v1.0.0, July 2026; scene/node/script edits, ClassDB lookups, playtest control, localhost-only, session-token auth), Godot MCP Native (155 tools, no Node.js), Godot AI (about 43 tools / 120 ops), Godot MCP Bridge (168 tools) and Coding-Solo/godot-mcp — [Godot Asset Library](https://www.godotengine.org/asset-library/asset/5375); [GitHub Godot-MCP-Native](https://github.com/yurineko73/Godot-MCP-Native); [Glama godot-ai](https://glama.ai/mcp/servers/hi-godot/godot-ai)

**SideFX Houdini**
- At SIGGRAPH 2026 (July), SideFX and NVIDIA previewed MCP support in Houdini 22 for APEX Script rigging, as a SideFX Labs sneak peek and not a finished tool — [Jon Peddie Research](https://www.jonpeddie.com/news/sidefx-and-nvidia-bring-mcp-powered-ai-agents-to-houdini-22s-rigging-workflow-at-siggraph-2026/)

### Inferences
- Engine-native assistants are best understood as context and tooling layers (editor state, play mode, logs, version-correct API docs). The intelligence comes from Claude/GPT models underneath. Their competitive value is grounding, which the CraftBench-UE MCP uplift supports, not raw reasoning.
- Roblox's Planning, Build and Playtest loop is the clearest first-party example of an agent that can verify gameplay in the running game. That self-verification is the capability the benchmarks identify as the main bottleneck (see Q4).

### Gaps
- No public benchmark compares Unity AI Assistant, Epic Developer Assistant, Roblox Assistant, Aura or Ludus against Claude Code or Codex on the same tasks.
- I found no EDA launch date, underlying model or pricing in primary sources.
- Rosebud AI and other prompt-to-game tools were not researched in this pass.

---

## Q3. Are there game-specific coding benchmarks? What do they show?

### Takeaway
2026 produced a wave of game-dev agent benchmarks: GameDevBench (Godot), GameEngineBench (UE5 C++), CraftBench-UE (UE 5.8), GameXpert-Bench (browser games), GameCraft-Bench (Godot), GameLogicBench, GameASG-Bench and GBQA. They agree that agents now produce plausible first implementations reliably. Runtime-verified, regression-free, integrated behavior is still far from solved: best scores are about 55–70% on bounded engine tasks and about 39% strict on bug-fixing.

### Cited Findings
- **GameDevBench** (arXiv 2602.11103; ICML 2026). The original 132-task version had a best agent at 54.5% (an earlier version said 47.0%). Gameplay tasks scored 46.9% and 2D-graphics tasks 31.6%. Image and video feedback lifted Claude Sonnet 4.5 from 33.3% to 47.7%. The camera-ready 333-task leaderboard is topped by GPT-6.1 Sol / Codex at 70.0% — [arXiv](https://arxiv.org/html/2602.11103v1); [BenchLM mirror](https://benchlm.ai/benchmarks/gamedevbench)
- **GameXpert-Bench** (arXiv 2608.21833, Aug 22, 2026; co-authored by Tencent Lightspeed Studios and Hunyuan, CAS, Tsinghua, HKUST, CUHK-SZ) uses browser-native HTML5/JS games. Claude Opus 5 ranks #1 on all three tracks:
  - GameGen (97 games, 15 models): 79.7 overall, with completeness 94.4 and richness 72.0 (model averages 77.5 and 46.1)
  - GameFix (bug diagnosis and repair, 17 models): strict 39.0, against a median model near 14
  - GameOpt (six-turn optimization chains): 93.96

  The central finding is that a "plausible first implementation is much easier than delivering a verified, regression-free game" — [arXiv HTML](https://arxiv.org/html/2608.21833); [project page](https://kwen-chen.github.io/GameXpert-Bench/)
- **GameEngineBench** (UE5 C++): best 55.5% (Claude Fable 5); 31/110 tasks unsolved by all 12 configurations — [arXiv](https://arxiv.org/html/2607.03525v1)
- **CraftBench-UE** (UE 5.8):
  - C++ completion reaches 87.9% with MCP.
  - Blueprint/asset tasks reach only 62.9%.
  - On 10 matched gameplay specs, C++ scored 71.4% against Blueprint's 28.6%, a 42.9 pp gap.
  - 42–50% of Blueprint submissions that passed asset checks failed runtime assertions.
  - Python editor-scripting tasks reached 78.6%.

  — [arXiv](https://arxiv.org/html/2609.23142)
- **GameCraft-Bench** (140 Godot tasks): Claude Opus 4.7 41.46% vs GPT-5.5 39.49% — [AI Weekly](https://aiweekly.co/alerts/claude-code-tops-ai-game-building-benchmark-at-41); [arXiv 2606.17861](https://arxiv.org/pdf/2606.17861)
- Other 2026 benchmarks, not fetched: GameLogicBench (tick-level state assertions, arXiv 2609.21562), GameASG-Bench (arXiv 2609.21293), GBQA (LLMs as QA engineers, arXiv 2604.02648). V-GameGym (2025, 2,219 Pygame samples) found top models at about 45% — [arXiv list via search](https://arxiv.org/pdf/2609.21562); [V-GameGym](https://arxiv.org/pdf/2509.20136)

### Inferences
- The best evidence-based summary: on bounded, well-specified engine tasks, the best agent completes roughly 55–70% unaided on first attempt. On open-ended "find and fix bugs in a game" work it reaches about 39% strict. A competent mid-level game programmer would be expected to complete nearly all such scoped tickets given time.
- Text-based engine representations (C++, GDScript, Luau, Python) are far more agent-friendly than visual or binary representations (Blueprints, .uasset). That favors studios whose gameplay lives in code.

### Gaps
- No game benchmark yet covers console platforms, rendering quality, frame-time budgets, or multiplayer under real latency at scale.
- Several benchmark tables (GameEngineBench full table, GameXpert per-model numbers beyond #1) were only partly accessible.

---

## Q4. Where do AI coding agents fail for game dev specifically?

### Takeaway
Failures cluster around anything that only shows up at runtime or on screen: authority and replication, state sync, object lifecycle and initialization order, visual/UI correctness, "feel," and performance against hardware limits. Visual or binary authoring (Blueprints) and NDA-gated platform knowledge are also weak spots. Compilation is mostly solved; behavioral correctness is not.

### Cited Findings
- GameEngineBench failure clusters: "authority mistakes, state-synchronization errors, object-lifecycle bugs, initialization errors, and incomplete integration." Examples include logic running on the wrong machine and an OnRep hook added without the replicated source state. Higher-performing agents "mostly compile and run" and their remaining errors are behavioral — [arXiv 2607.03525](https://arxiv.org/html/2607.03525v1)
- CraftBench-UE: Blueprint submissions often pass structural checks but fail gameplay. In one example a glide ability consumes Power, but the descent slowdown is missing. Agents "read back asset state more often than PIE state," which leaves behaviors untested. Agents also loop on repeated playtests. Visual-quality tasks were explicitly excluded as not deterministically gradable — [arXiv 2609.23142](https://arxiv.org/html/2609.23142)
- GameXpert-Bench:
  - 5.32% of events were coded but failed at runtime, 56% of those through load or crash.
  - About 15.2% of runs had UI overlap or misalignment, across every model.
  - Some models decline to fix bugs outside an explicit checklist.
  - A missing `</style>` tag blanked an entire game.

  — [arXiv 2608.21833](https://arxiv.org/html/2608.21833)
- GPU performance: on production GPU operators (Atrex-Bench, July 2026), the best vanilla model reaches "only about 10% of the hardware roofline." Correctness overstates capability because passes often come from "PyTorch fallbacks rather than kernels the model wrote" — [arXiv 2607.14541](https://arxiv.org/abs/2607.14541). CUDABench likewise finds high compile rates but weak functional correctness — [arXiv 2603.02236](https://arxiv.org/pdf/2603.02236)
- Houdini: general chatbots can hallucinate Houdini functions or miss version-specific APIs. One SideFX forum author says local models aren't reliable for complex HDA network generation — [Artivoxa](https://www.artivoxa.com/how-houdini-artists-are-using-chatgpt-and-claude-to-write-better-vex/); [SideFX forum](https://www.sidefx.com/forum/topic/102263/)
- Unreal practitioners: Claude is weak with Blueprints and binary .uasset and better on C++. AI-written UE C++ "compiles but doesn't do much inside the editor without human wiring" — [Medium survey (chierhu)](https://chierhu.medium.com/claude-code-for-game-development-7a88fcd19992); [Medium (aacloudguy)](https://medium.com/@aacloudguy/i-taught-claude-to-use-the-unreal-editor-my-new-thoughts-about-game-dev-tools-adad3f393a74)
- EA: internal reporting (late 2025) said AI-generated code "requires quite a bit of cleanup," and the internal ReefGPT tool hallucinated — [PC Gamer](https://www.pcgamer.com/gaming-industry/ea-employees-are-reportedly-frustrated-by-a-mandate-to-use-ai-mocking-the-policy-in-slack-and-suspecting-its-being-used-as-justification-for-layoffs/); [Game Rant](https://gamerant.com/electronic-arts-developers-use-ai-not-happy/)

### Inferences
- Console SDKs and TRC/TCR/Lotcheck requirements are under NDA, so public frontier models have little or no training exposure to them. Agents can only work there if a studio supplies the docs as context (skills, RAG, MCP). This is inferred; I found no source testing it directly.
- "Feel" bugs (input latency, camera smoothing, hit-stop, animation blending) need human perception. No benchmark grades them, and Roblox's playtesting agent and video-feedback methods are the earliest attempts.

### Gaps
- No published evaluation of agents on console SDKs, platform cert, or netcode under real latency, packet loss and rollback.
- No quantitative study of agent-introduced performance regressions in shipped games.

---

## Q5. Documented studio usage of AI for engineering

### Takeaway
Adoption is broad but shallow and contested. GDC 2026 finds 36% of industry professionals using gen-AI (30% at studios), 47% of those for code assistance, while 52% think gen-AI harms the industry (59% of game programmers unfavorable). The 2025 Google Cloud/Harris survey reported about 90% of developers using AI. Named engineering deployments are sparse: Epic (internal), EA (mandate and backlash), Krafton (AI-first), Roblox creators (44% of top 1,000), Tencent Lightspeed and Nexon research. I found no reliable reports for Ubisoft, Embark, Supercell or Square Enix engineering.

### Cited Findings
- **GDC 2026 State of the Game Industry** (2,300+ respondents):
  - 36% use gen-AI at work (30% at game studios; 58% at publishers, support and marketing).
  - Uses: research and brainstorming 81%, code assistance 47%, daily tasks 47%, prototyping 35%.
  - Tools: ChatGPT 74%, Gemini 37%, Microsoft Copilot 22%.
  - 52% say gen-AI hurts the industry (30% the year before); about 7% say positive.
  - Most negative disciplines: visual and technical art 64%, design and narrative 63%, game programming 59%.

  — [GDC official](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/). The 47% denominator is ambiguous; it is most likely the share of AI users — [GameDev Reports](https://gamedevreports.substack.com/p/gdc-the-state-of-the-game-industry-fcf). Upper management uses AI at about twice the rate of individual contributors (47% vs 29%) — [Gianty, secondary](https://www.gianty.com/gdc-2026-report-about-generative-ai/)
- **Google Cloud / Harris Poll** (released Aug 18, 2025; older than 2026): 615 developers in the US, South Korea, Norway, Finland and Sweden. 90% use AI in workflows and 87% use AI agents. 44% use agents for content optimization and 38% for dynamic balancing. 63% are concerned about data ownership — [Google Cloud Press Corner](https://www.googlecloudpresscorner.com/2025-08-18-90-of-Games-Developers-Already-Using-AI-in-Workflows,-According-to-New-Google-Cloud-Research); [Decrypt](https://decrypt.co/335721/ai-agents-taking-over-game-development)
- **Epic Games** (June 2026): broad internal use of code generation and AI analysis "across our backend, engine, and game development engineering teams" — [Shacknews](https://www.shacknews.com/article/149693/unreal-engine-6-generative-ai-models-claude-codex)
- **EA** (Business Insider report, about late 2025): leadership pushed roughly 15,000 staff to use AI "for just about everything," including the internal ReefGPT. Staff complain the generated code needs cleanup — [PC Gamer](https://www.pcgamer.com/gaming-industry/ea-employees-are-reportedly-frustrated-by-a-mandate-to-use-ai-mocking-the-policy-in-slack-and-suspecting-its-being-used-as-justification-for-layoffs/)
- **Krafton**: an "AI First" strategy with a roughly ₩100B GPU cluster for agentic AI, ₩30B (about $21M) a year from 2026 for employee AI tools, an agentic AI management platform targeted for H2 2026, and AI Forward Deployed Engineers hired from March 2026. No source names its coding tools — [Game Developer](https://www.gamedeveloper.com/business/subnautica-owner-krafton-outlines-plans-to-transform-into-an-ai-first-company); [PC Gamer](https://www.pcgamer.com/software/ai/krafton-is-now-an-ai-first-company-will-spend-usd70-million-on-a-gpu-cluster-to-serve-as-the-foundation-for-accelerating-the-implementation-of-agentic-ai/); [Seoul Economic Daily](https://en.sedaily.com/technology/2026/03/27/krafton-launches-first-ever-ai-transformation-engineer)
- **Roblox**: 44% of the top 1,000 creators used Assistant or MCP-connected AI tools (Mar–Apr 2026) — [Roblox Newsroom](https://about.roblox.com/newsroom/2026/04/roblox-studio-going-agentic)
- **Tencent (Lightspeed Studios, Hunyuan)** co-authored GameXpert-Bench, and **Nexon Intelligence Labs** co-authored GameEngineBench. This shows internal research interest in agentic game coding, not documented production rollout — [GameXpert](https://arxiv.org/html/2608.21833); [GameEngineBench](https://arxiv.org/html/2607.03525v1)
- **Sinn Studio** (VR, *Zombonks*) via Aura: "halve production time" (vendor claim) — [PR Newswire](https://www.prnewswire.com/news-releases/aura-ai-assistant-for-unreal-engine-launches-vr-studio-ships-game-in-half-the-time-with-new-agent-capabilities-302651608.html)
- Indie studio claim: Cursor, Copilot and ChatGPT cut routine UE5/C++ work by about 30–50%; Claude Code is its main terminal agent (self-reported, not a controlled study) — [Althera Games](https://altheragames.com/en/blog/ai-agents-game-development-2026)
- Non-games comparison: Amazon rolled out Claude Code and Codex to its corporate workforce — [The Daily Star](https://www.thedailystar.net/news/tech-startup/news/amazon-rolls-out-claude-code-and-codex-its-employees-report-4169101)

### Inferences
- Engineering usage is probably under-reported. Studios may adopt AI coding quietly because of player backlash (85% of surveyed players negative toward gen-AI, per a cited survey in [Vindler](https://vindler.solutions/blog/unity-ai-open-beta)), so absence of named case studies is not absence of use.

### Gaps
- No reliable 2026 reports found for Ubisoft, Embark, Supercell, Square Enix, NetEase, Nexon (production), Activision, or Microsoft first-party studios using coding agents. Targeted searches returned only vendor content farms.
- No Unity Gaming Report 2026 engineering-AI figures were retrieved.
- No engineer-only adoption rate in GDC 2026.

---

## Q6. Cost per seat / per token for leading tools (Oct 2026)

### Takeaway
Frontier API pricing has fallen. The best coding models cost $2–$10 input and $10–$50 output per M tokens, and Opus 5.5 is cheaper per token than Opus 5. Per-task cost at maximum effort is still about $2–6 because of token volume. Seat tools run $19–$120 per user per month, and every major vendor has moved to usage-based metering.

### Cited Findings
- **Anthropic API** (per M tokens in/out): Opus 5.5 $4/$20 (cache read $0.20; batch half price; fast mode $8/$40; US-only inference +10%); Opus 5 $5/$25; Fable 5.1 $10/$50; Sonnet 5 $2/$10 — [Codersera](https://codersera.com/blog/claude-opus-5-5-complete-guide-2026/amp/)
- **Per-task cost** (Artificial Analysis): Opus 5.5 costs about $5.98 per index task at max effort, $3.46 at xhigh and $1.82 at high. At max it emits about 119k output tokens per task against about 73k for Opus 5, so the per-token price cut does not lower cost per job at max — [Codersera](https://codersera.com/blog/claude-opus-5-5-complete-guide-2026/amp/). Codex + GPT-6.1 Sol: $1.92 per Terminal-Bench task at max — [Morph via search](https://www.morphllm.com/best-ai-coding-agents-2026)
- **OpenAI API**: GPT-6 Astra $10/$50; GPT-6.1 Sol $2/$10 ($0.10 cached); GPT-6 Luna $0.10/$0.50. An "Ultrafast" Sol tier for Codex is unpriced (reportedly about 6x) — [Yotta Labs](https://www.yottalabs.ai/post/gpt-6-release-date-rumors-what-is-known-2026); [Kingy AI](https://kingy.ai/blog/gpt-6-1-sol-specs-benchmarks-pricing-task-costs/); [Codersera 6.1 Sol](https://codersera.com/blog/gpt-6-1-sol-complete-guide-2026/)
- **OpenAI Codex**: bundled in ChatGPT Plus (about $20/mo) and Pro (about $200/mo) — [LaraCopilot](https://laracopilot.com/blog/openai-codex-pricing-2026/)
- **Cursor Teams** (June 2026 change): Standard $40/user/mo, Premium $120 (about 5x usage), $32/$96 annual. Includes a first-party pool for Auto/Composer and a separate third-party API pool. Enterprise is quote-only — [Cursor blog](https://cursor.com/blog/teams-pricing-june-2026); [StartupHub](https://www.startuphub.ai/ai-news/technology/2026/cursor-teams-upgrades-pricing-for-predictability)
- **GitHub Copilot**: Business $19 and Enterprise $39 per user/mo. It moved to usage-based billing (AI Credits) on June 1, 2026. Sources conflict on allowances and overage ($0.04 per premium request vs $0.01 per credit) — [GitHub Blog](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/); [Automation Atlas](https://automationatlas.io/answers/github-copilot-pricing-explained-2026/)
- **Unity AI**: Personal gets a 14-day trial with 1,000 credits, then $10/mo for 1,000 credits. Pro, Enterprise and Industry seats include credits and MCP. CLI, MCP server and the official plugins are free — [BuildFastWithAI](https://www.buildfastwithai.com/blogs/unity-ai-open-beta-guide-2026); [Unity AI features](https://unity.com/features/ai); [Tech-Insider](https://tech-insider.org/unity-plugins-claude-code-codex-2026/)
- **Houdini AI Assistant** (third-party, v0.2.0): $129 on Gumroad; supports OpenAI, DeepSeek, Anthropic and local models — [Gumroad](https://rart.gumroad.com/l/HoudiniAIAssistant); [GitBook](https://houdini-ai-assistant.gitbook.io/a)
- **Aura**: no public paid pricing; 2-week trial — [PR Newswire](https://www.prnewswire.com/news-releases/aura-ai-assistant-for-unreal-engine-launches-vr-studio-ships-game-in-half-the-time-with-new-agent-capabilities-302651608.html)

### Inferences
- For a 100-engineer studio, seat costs of $19–$120 per month are trivial next to salaries. The real cost driver is heavy agentic usage at xhigh or max effort, roughly $2–6 per substantial task. A heavy agent user could plausibly spend hundreds of dollars a month in API or usage overage. This is inferred, not sourced.

### Gaps
- Claude Code subscription tiers (Pro/Max/Team/Enterprise) for Oct 2026 were not retrieved.
- Devin, Jules and Windsurf pricing for 2026 was not retrieved.
- Ludus AI pricing was not found.

---

## Role 1: Gameplay programmer

### Takeaway
The best tools are Claude Code (Opus 5.5 / Fable 5) and OpenAI Codex (GPT-6.1 Sol), connected to the engine through official MCP plugins (Unity Claude Code/Codex plugins, Roblox Studio MCP, UE 5.8 MCP or Aura). On bounded, code-first gameplay tasks they complete roughly 55–90% on first try, depending on the benchmark. They fall well short of a competent gameplay programmer on integration, runtime verification, Blueprint-heavy work and game feel. Practical level: a fast junior or mid-level pair programmer that a human must direct and verify.

### Cited Findings
- GameDevBench (Godot, 333 tasks): GPT-6.1 Sol/Codex 70.0%, GPT-6 Astra 68.8%, Claude Fable 5/Claude Code 67.3%, with overlapping 95% CIs of about ±5 — [BenchLM](https://benchlm.ai/benchmarks/gamedevbench)
- GameXpert-Bench: Claude Opus 5 #1 on generation (79.7), fixing (39.0 strict) and multi-turn optimization (93.96) — [arXiv](https://arxiv.org/html/2608.21833)
- CraftBench-UE: matched gameplay specs reach 71.4% in C++ vs 28.6% in Blueprints with MCP. Interacting requirements (resource cost plus movement effect) are often half-implemented — [arXiv](https://arxiv.org/html/2609.23142)
- GameCraft-Bench (Godot): Opus 4.7 41.46%, GPT-5.5 39.49% (older models) — [AI Weekly](https://aiweekly.co/alerts/claude-code-tops-ai-game-building-benchmark-at-41)
- Roblox Assistant adds a planning plus playtesting-agent loop (beta), and 44% of the top 1,000 creators use Assistant or MCP tools — [Roblox](https://about.roblox.com/newsroom/2026/04/roblox-studio-going-agentic)
- Unity's official Claude Code (29 skills) and Codex (31 skills) plugins cover UI Toolkit, 2D/tilemaps, physics, navigation and IAP — [Tech-Insider](https://tech-insider.org/unity-plugins-claude-code-codex-2026/)

### Inferences
- Human-parity judgment: well-specified feature tickets in a code-first stack (C#, C++, Luau, GDScript) are approaching competent-junior throughput, much faster but needing review. Open-ended features where "fun" or "feel" is the acceptance criterion are far below human. No benchmark measures feel, and GameXpert's richness averages only 46.1 across models. Engine choice matters: Unity C#, Godot and Roblox Luau are more agent-friendly than Blueprint-heavy Unreal.

### Gaps
- No controlled study of gameplay-programmer productivity with these agents in a commercial studio.

---

## Role 2: Engine / systems programmer (C++, Unreal/Unity/Godot/custom engines)

### Takeaway
Claude-family agents have the strongest evidence for large-codebase and Unreal C++ work: SWE-bench Pro, SWE-bench Multilingual and GameEngineBench, where Fable 5 scored 55.5% against GPT-5.5's 29.1%. Even the best agent fails about 45% of scoped UE5 C++ runtime tasks. Engine and systems work (memory, threading, lifecycle, platform layers) is where agents are furthest from a senior engineer. They are useful for navigation, refactors, boilerplate and explaining unfamiliar subsystems.

### Cited Findings
- GameEngineBench (UE5 C++, 110 tasks): Fable 5 + Claude Code (max) 55.5%; GPT-5.5 + Codex (xhigh) 29.1%; Opus 4.8 (max) 23.6%; Gemini 3.1 Pro 18.2%. Failures include object-lifecycle and initialization-order bugs such as components registered before dependent systems and missing constructor defaults — [arXiv](https://arxiv.org/html/2607.03525v1)
- Opus 5.5 self-reported SWE-bench Pro 89.9 and SWE-bench Multilingual 93.9 (multi-language repo tasks) — [Codersera](https://codersera.com/blog/claude-opus-5-5-complete-guide-2026/amp/); [llm-stats](https://llm-stats.com/benchmarks/swe-bench-pro)
- CraftBench-UE: C++ completion with MCP is about 86–88%. Ten different models land at 27–31 of 33 C++ tasks, so frontier models are near parity on easier UE C++ — [arXiv](https://arxiv.org/html/2609.23142)
- Epic has opened AI code generation and analysis broadly to its own engine engineers — [Shacknews](https://www.shacknews.com/article/149693/unreal-engine-6-generative-ai-models-claude-codex)
- Practitioners pair JetBrains Rider with Claude Code for UE C++ scaffolding — [sharkpillow](https://sharkpillow.com/post/rider-claude/)

### Inferences
- Human-parity judgment: for proprietary custom engines, agents lack training exposure and depend on the context they can read. Long-context (1M token) models help with navigation but not with tacit invariants such as threading models or memory budgets. Parity is roughly a capable junior on scoped tasks; well below a senior engine programmer on architecture, concurrency and cross-platform work.

### Gaps
- No benchmark covers custom engines, multithreaded job systems, memory allocators or console platform layers.

---

## Role 3: Graphics / rendering programmer (shaders, GPU)

### Takeaway
No dedicated shader or rendering benchmark exists. Proxy evidence is weak: GPU-kernel benchmarks show frontier agents at about 10% of hardware roofline on production operators, 2D-graphics tasks score lowest on GameDevBench, and visual correctness is excluded from engine benchmarks. Best tools are frontier agents (Claude Opus 5.5 / GPT-6.x) plus RenderDoc MCP servers for capture analysis and Unity's URP/Shader Graph skills. They are useful for boilerplate shader code, porting (HLSL/GLSL/MSL) and explaining captures. They are far from a competent rendering engineer.

### Cited Findings
- Atrex-Bench (July 2026): the best vanilla agent reached about 10% of roofline on production GPU operators, and many "passes" were PyTorch fallbacks. An iterative measure-and-revise agent (Atrex-Kernel-Agent) matched hand-tuned baselines in a case study — [arXiv 2607.14541](https://arxiv.org/abs/2607.14541)
- CUDABench: high compile success but a large functional-correctness gap — [arXiv 2603.02236](https://arxiv.org/pdf/2603.02236)
- GameDevBench (original): 2D-graphics tasks 31.6% vs gameplay tasks 46.9%; visual feedback (screenshots, video) improves results — [arXiv 2602.11103](https://arxiv.org/html/2602.11103v1)
- CraftBench-UE explicitly excluded visual-quality tasks, and GameXpert found UI misalignment in about 15% of runs across all models — [CraftBench-UE](https://arxiv.org/html/2609.23142); [GameXpert](https://arxiv.org/html/2608.21833)
- RenderDoc MCP servers expose the RenderDoc replay API (about 40–62 tools) so Claude and Codex can analyze .rdc GPU captures. I found no Unreal Insights or PIX MCP server — [GitHub renderdoc-mcp](https://github.com/gh39666161/renderdoc-mcp); [PyPI](https://pypi.org/project/renderdoc-mcp/)
- Unity's Codex plugin includes URP and Shader Graph skills — [Tech-Insider](https://tech-insider.org/unity-plugins-claude-code-codex-2026/)
- Artificial Analysis runs a GLSL/Three.js interactive shader micro-eval (undated) — [Artificial Analysis](https://artificialanalysis.ai/microevals/llm-ultimate-challenge-interactive-glsl-shader-art-1756340323607)

### Inferences
- Human-parity judgment: lowest among engineering roles, alongside performance. Rendering correctness is judged visually and by GPU timing, both outside agents' reliable verification loop. Modern techniques (Nanite/Lumen internals, console GPU specifics, bindless and ray-tracing pipelines) need hardware-specific knowledge often under NDA.

### Gaps
- No benchmark for HLSL/GLSL/MSL shader correctness, visual fidelity or GPU frame-time optimization in game engines.

---

## Role 4: Network / multiplayer / backend & live-service engineer

### Takeaway
This role splits in two. Backend and live-service work (web services, databases, cloud, tooling) is standard software engineering, where agents are strongest: SWE-bench Pro around 80–90% self-reported, and Terminal-Bench 58–66% on 4.0. Real-time netcode (replication, authority, prediction, rollback) is a documented failure area. The best tools are Claude Code / Codex for both, plus Unity's multiplayer-networking skills. For backend, agents approach a mid-level engineer on scoped tickets. For netcode they are well short of a competent multiplayer engineer.

### Cited Findings
- GameEngineBench lists authority mistakes (logic on the wrong machine or controller) and state-synchronization errors (OnRep without replicated source state) as recurring failure clusters for the best agents — [arXiv](https://arxiv.org/html/2607.03525v1)
- Unity's Claude Code plugin includes "multiplayer networking" skills, and its Codex plugin includes "multiplayer" skills — [Tech-Insider](https://tech-insider.org/unity-plugins-claude-code-codex-2026/)
- General repo-level software engineering: Opus 5.5 at 89.9 on SWE-bench Pro (self-reported); GPT-6 Astra leads FrontierSWE v2 at 65.5 — [Codersera](https://codersera.com/blog/claude-opus-5-5-complete-guide-2026/amp/)
- Epic expanded AI code generation to its backend engineering teams — [Shacknews](https://www.shacknews.com/article/149693/unreal-engine-6-generative-ai-models-claude-codex)

### Inferences
- Human-parity judgment: backend and live-ops service code is the closest of any game role to the software-engineering benchmarks, so agents perform near those numbers. Netcode correctness only emerges under multi-client, latency and packet-loss conditions that agents rarely test, which keeps parity low.

### Gaps
- No benchmark tests netcode under simulated latency, packet loss or rollback. No per-model networking breakdown was available in the GameEngineBench text.

---

## Role 5: Game AI programmer (NPC behavior, pathfinding)

### Takeaway
There is very little direct evidence. No benchmark targets NPC behavior or pathfinding implementation, and LLM-generated behavior trees remain mostly research. The best tools are general frontier coding agents (Claude Code / Codex) with engine skills (Unity's navigation skills, Roblox's planned "more intelligent NPCs"). Inferred parity: capable at implementing standard algorithms (A*, steering, FSMs, BT nodes); weak at tuning emergent behavior, which needs playtesting.

### Cited Findings
- "Contract-Grounded Behavior Tree Synthesis via Coding Agents" (arXiv 2607.12220, 2026) is a preprint on coding agents generating behavior trees (title only; not fetched) — [arXiv](https://arxiv.org/pdf/2607.12220)
- Practitioner pattern: behavior trees remain the "backbone" for NPC decisions, with LLMs used for dialogue inside branches plus caching and fallbacks — [The Neural Base](https://theneuralbase.com/ai-for-gaming/learn/beginner/behavior-trees/)
- Unity's Codex plugin includes navigation and physics skills — [Tech-Insider](https://tech-insider.org/unity-plugins-claude-code-codex-2026/)
- Roblox lists "more intelligent NPCs that simulate player behavior" as in development — [Roblox](https://about.roblox.com/newsroom/2026/04/roblox-studio-going-agentic)
- GameXpert: balance and level design have the lowest cross-model means in the GameOpt track — [arXiv](https://arxiv.org/html/2608.21833)

### Inferences
- Standard game AI algorithms are well represented in training data, so code generation for them is probably reliable. Making AI "fun" and believable is a tuning and playtest loop with no automated metric, so parity there is low. Both points are inferred.

### Gaps
- No benchmark or case study measuring agents on NPC AI or pathfinding implementation; Ubisoft Teammates and NVIDIA ACE status not retrieved.

---

## Role 6: Tools & pipeline engineer

### Takeaway
This is probably the role where AI comes closest to a competent professional. The work is mostly Python, C#, C++ editor scripting, DCC integration and data-processing. That is well represented in training data, verifiable by scripts, and well served by MCP bridges into Unity, Unreal, Godot, Roblox, Houdini and RenderDoc. The best tools are Claude Code (Opus 5.5) and Codex (GPT-6.x) with engine and DCC MCP servers.

### Cited Findings
- CraftBench-UE Python editor-scripting tasks: 73.8–78.6% completion within 40 minutes — [arXiv](https://arxiv.org/html/2609.23142)
- MCP bridges exist for every major engine: Unity MCP Server, UE 5.8 MCP plugin, Roblox Studio built-in MCP, and 5+ Godot MCP plugins with 43–300 tools each — [Vindler](https://vindler.solutions/blog/unity-ai-open-beta); [Ludus](https://ludusengine.com/blog/unreal-engine-built-in-ai-assistant); [Roblox DevForum](https://devforum.roblox.com/t/studio-mcp-server-updates-and-external-llm-support-for-assistant/4415631); [Godot Asset Library](https://www.godotengine.org/asset-library/asset/5375)
- SideFX's Houdini 22 MCP preview (July 2026) — [Jon Peddie](https://www.jonpeddie.com/news/sidefx-and-nvidia-bring-mcp-powered-ai-agents-to-houdini-22s-rigging-workflow-at-siggraph-2026/)
- Aura can "mass-edit thousands of Blueprints through conversation" (vendor claim) — [PR Newswire](https://www.prnewswire.com/news-releases/aura-ai-assistant-for-unreal-engine-launches-vr-studio-ships-game-in-half-the-time-with-new-agent-capabilities-302651608.html)
- Practitioners recommend Claude for C++ logic and editor tooling rather than end-to-end builds — [Medium (chierhu)](https://chierhu.medium.com/claude-code-for-game-development-7a88fcd19992)

### Inferences
- Human-parity judgment: on scoped tool scripts, importers, validators and batch processors, agents likely match or exceed a competent mid-level tools engineer in speed. Design of pipeline architecture and artist UX, and studio-specific conventions, still need humans.

### Gaps
- No benchmark specifically on DCC and pipeline tooling (Maya, Blender, Houdini, Perforce) beyond CraftBench-UE's Python subset.

---

## Role 7: Build / DevOps / release engineer, platform certification (console TRCs)

### Takeaway
On generic build and DevOps (CI scripts, Docker, shell, cloud), agents are strong. Terminal-Bench 4.0 has Opus 5.5 at 66.4% self-reported and 59.6% by AA, and GPT-6 Astra at 58.2% on the public board. Terminal-Bench 2.0 had GPT-5.5 at about 82%. Nothing addresses console certification: TRC/TCR/Lotcheck requirements and platform SDKs are NDA-gated, and I found no AI cert tooling. Best tools are Claude Code and Codex for CI/CD and build scripting. Parity is decent for generic build scripting and low for cert.

### Cited Findings
- Terminal-Bench 4.0:
  - Opus 5.5 66.4 (vendor run in Claude Code); AA independent 59.6%
  - GPT-6 Astra 57.9 (vendor) / 58.2% (public leaderboard leader)
  - Gemini 4 Argon 57.4 (Google table)
  - GPT-5.6 Sol 37.3

  — [Codersera](https://codersera.com/blog/claude-opus-5-5-complete-guide-2026/amp/); [ToolScout](https://toolscout.ai/news/gemini-4-argon-benchmarks)
- Terminal-Bench 2.0: GPT-5.5 82%, GPT-5.3 Codex 77.3% — [BenchLM](https://benchlm.ai/benchmarks/terminal-bench-2)
- Console cert background (QA vendor sources): TRC (Sony), TCR/XR (Microsoft) and Lotcheck (Nintendo) acronyms vary by source. Failures can cost $5,000–$15,000+ per resubmission and rounds take about 4–8 weeks. Common failures are suspend/resume crashes, save handling, debug strings and deprecated APIs. Vendors recommend automating these scenarios in "pre-cert" pipelines — [Juego Studio](https://www.juegostudio.com/blog/video-game-console-development-blueprint); [iXie](https://ixiegaming.com/console-compliance-testing/); [NipsApp](https://nipsapp.com/console-certification-process/)

### Inferences
- Agents can write and maintain the automation harnesses for cert checks (suspend/resume, controller disconnect, user switching) if given NDA docs and devkits. Interpreting platform requirements and running on devkits remains human work. Parity for release management and cert submission is low; for build-farm scripting (UBT/BuildGraph, Jenkins, TeamCity, Horde) it is likely moderate to high. Both are inferred.

### Gaps
- No source found on AI tools for console certification, Sony/Microsoft/Nintendo SDK support for AI agents, or AI in UE BuildGraph/Horde pipelines.

---

## Role 8: Technical artist (shaders, procedural tools, Houdini)

### Takeaway
AI is a helpful scripting assistant for TAs (VEX, Python, HLSL snippets, Shader Graph and Blueprint scaffolding), but the work is visual and node-graph heavy, which agents handle poorly. Best options: frontier chat or agents (Claude / GPT) for VEX and Python; SideFX's Houdini 22 MCP preview for APEX rigging; third-party Houdini AI Assistant; Unity's Shader Graph skills; Aura for UE lighting and post-process; Roblox Cube for procedural meshes. Parity is low to moderate: it accelerates the scripting portion but cannot judge look and feel.

### Cited Findings
- SideFX and NVIDIA previewed MCP-powered agents for APEX Script rigging in Houdini 22 (SIGGRAPH, July 2026), drawing on a curated APEX syntax and examples library. It is a SideFX Labs sneak peek — [Jon Peddie Research](https://www.jonpeddie.com/news/sidefx-and-nvidia-bring-mcp-powered-ai-agents-to-houdini-22s-rigging-workflow-at-siggraph-2026/)
- The third-party Houdini AI Assistant v0.2.0 (Houdini 20.5–22.0) does scene and node-network analysis, error debugging and VEX/Python generation for $129. Its demo used GPT-5.5/5.4, and local models are not reliable for complex HDA networks — [SideFX forum](https://www.sidefx.com/forum/topic/102263/); [Gumroad](https://rart.gumroad.com/l/HoudiniAIAssistant)
- LLMs hallucinate Houdini functions and version-specific APIs — [Artivoxa](https://www.artivoxa.com/how-houdini-artists-are-using-chatgpt-and-claude-to-write-better-vex/)
- Blueprint (node-graph) tasks score far below C++ (28.6% vs 71.4% on matched specs) — [CraftBench-UE](https://arxiv.org/html/2609.23142)
- Aura's Editor-Use Agent lights scenes and configures post-processing (vendor claim) — [PR Newswire](https://www.prnewswire.com/news-releases/aura-ai-assistant-for-unreal-engine-launches-vr-studio-ships-game-in-half-the-time-with-new-agent-capabilities-302651608.html)
- Visual and technical art is the most negative discipline on gen-AI in GDC 2026, at 64% — [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)

### Inferences
- The node-graph gap (Blueprints, Shader Graph, Houdini networks) is the key limiter. Graph-to-text tooling (APEX Script, VEX, Python HOM) is how vendors are working around it.

### Gaps
- No benchmark for Houdini/VEX, Substance Designer or material-graph authoring. Unity AI "Generators" were not researched in detail.

---

## Role 9: Performance / optimization engineer

### Takeaway
This is the weakest-evidenced and likely lowest-parity role. Agents can read profiler output and suggest standard fixes (Unity Assistant "suggests optimizations"; RenderDoc MCP). The one hard benchmark on GPU performance puts the best vanilla agents at about 10% of hardware roofline. Iterative measure-and-revise agents can reach hand-tuned performance in case studies. Best approach: a frontier agent (Claude Opus 5.5 / GPT-6.x) in an agentic loop with profiler access. It is far below a competent performance engineer for frame-time work on consoles.

### Cited Findings
- Atrex-Bench: about 10% of roofline for the best vanilla model. The measure-and-revise Atrex-Kernel-Agent matched or beat hand-tuned production baselines in a case study — [arXiv 2607.14541](https://arxiv.org/abs/2607.14541)
- Unity AI Assistant "suggests optimizations" — [Vindler](https://vindler.solutions/blog/unity-ai-open-beta)
- RenderDoc MCP servers exist; I found no Unreal Insights or PIX MCP. A GitHub design proposal for a bounded profiling toolset uses PIX, Nsight and RenderDoc wrappers only for escalation — [renderdoc-mcp](https://github.com/gh39666161/renderdoc-mcp); [GitHub issue](https://github.com/karnalooch/YetAnotherCyclingSim/issues/376)
- GameXpert's bug taxonomy includes performance but reports no performance score — [arXiv](https://arxiv.org/html/2608.21833)
- Profiling workflow context: Unreal stat, ProfileGPU, Insights, then PIX/RenderDoc/Nsight/RGP — [Intel UE optimization guide](https://www.intel.com/content/www/us/en/developer/articles/technical/unreal-engine-optimization-profiling-fundamentals.html)

### Inferences
- Agent value here depends on profiler access. Without MCP access to Insights, PIX or console profilers, agents are limited to static suggestions. The Atrex result suggests performance parity improves sharply with tight measure-and-revise loops, which studios could build. That is inferred.

### Gaps
- No game-specific performance benchmark (frame-time, memory or streaming budgets).
- No source on AI with console profiling tools (Razor, PIX on Xbox, NX tools).
