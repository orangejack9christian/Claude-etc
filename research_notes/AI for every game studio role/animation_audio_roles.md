# AI for Animation, Cinematics & Audio Roles in Professional Game Development (state as of October 2026)

Research date: 2026-10-10. Sources from before 2026 are tagged **[2025]** or **[2024]**. "Secondary" means an aggregator or blog rather than a vendor, union or major trade outlet. The web-search budget ran out partway through. Gaps that further searching could close are listed in each section.

---

## 1. Character animator (keyframe, locomotion, combat)

### Takeaway
No single AI tool replaces a keyframe or gameplay animator in October 2026. The best assistive tool for hand-keyed work is **Cascadeur 2026.2** (Nekki, Aug 2026), which offers AI inbetweening, "Motion Generation" from trajectories, AutoPosing and AutoPhysics. For runtime locomotion, the production standard is **Unreal Engine's Motion Matching (Pose Search)**. It is a data-driven selection system, not generative AI, and still needs a human-built, root-motion-authored animation database. Text-to-motion tools (Uthana, Unity AI generators) are useful for prototyping, previs, and filler or background NPC motion. They are not yet hero combat animation.

### Cited Findings
- **Cascadeur 2026.1** (released Apr 9, 2026): added "Root Motion", "a new generative tool" that creates animation from a character's trajectory once the animator supplies a draft and at least two keyframes. It also rebuilt the Live Link for UE 5.5–5.7 and improved quadruped AutoPosing. — [Digital Production](https://digitalproduction.com/2026/04/09/cascadeur-2026-1-adds-unreal-live-link-filament-rendering-and-ai-root-motion/)
- CG Channel on 2026.1: the Root Motion system "doesn't fully adhere to the source keyframes, so the results it generates are more varied, but also harder to control." — [CG Channel (Apr 2026)](https://www.cgchannel.com/?p=175211)
- **Cascadeur 2026.2** (Aug 6, 2026): Root Motion was renamed "Motion Generation", and it and AI inbetweening are now trained on larger datasets. AutoPosing now accounts for the environment for hands and feet and handles quadrupeds better. Other additions: additive animation layers (alpha), easing controls, BVH import, a "simple" MCP server for connecting external AI tools, and CJK UI. Runs on Windows 10+, Ubuntu 20.04+ and macOS 13.3+. — [CG Channel](https://www.cgchannel.com/2026/08/nekki-releases-cascadeur-2026-2-with-animation-layers/); [Cascadeur blog](https://cascadeur.com/blog/view/cascadeur-2026-2-animation-layers-easing-new-languages)
- **Cascadeur pricing:**
  - Free: non-commercial, .casc export only, 300 frames and 120 joints per scene.
  - Indie: $19/mo or $96/yr, commercial use under $100k revenue, adds FBX/DAE export.
  - Pro: $49/mo or $396/yr, unlimited commercial use, adds retargeting and quadruped autoposing.
  - Teams: $33–49/user/mo.
  - Indie and Pro are rent-to-own, with a perpetual license after one year.
  - Sources: [Cascadeur plans](https://cascadeur.com/plans); [CG Channel](https://www.cgchannel.com/2026/08/nekki-releases-cascadeur-2026-2-with-animation-layers/)
- A May 2026 UE5/Blender test rated Cascadeur's animation export quality highest of the tools tested and recommended it "for hero-character custom animations". One custom 2-second pose-to-pose animation took about 30 minutes, against about 3 minutes for Tripo's canned first-pass animation. The author sells UE5 tools, so treat this as opinion. — [StraySpark (May 14, 2026)](https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo)
- **Unreal Motion Matching:**
  - It is "a query-based animation pose selection system" in the Pose Search plugin, an alternative to state machines and blend spaces.
  - Locomotion animations "must contain root motion".
  - It needs a Pose Search Schema, a Database of authored sequences or blendspaces, and Pose History/trajectory nodes.
  - Some parts are flagged experimental: the VPTree/PCAKDTree search modes, Motion Matched Stitching, and montage playback via Motion Matching.
  - Source: [Epic docs (UE 5.8)](https://dev.epicgames.com/documentation/en-us/unreal-engine/motion-matching-in-unreal-engine)
- Epic's **Game Animation Sample** project ships "a fully built Motion Matching setup for character locomotion" with mocap assets, introduced with a GDC 2024 talk **[2024]**. — [Epic docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/motion-matching-in-unreal-engine)
- **ML Deformer** (UE): trains a model to approximate high-fidelity mesh deformation (skin, muscle, cloth) for runtime use.
  - Neural Morph is the general-purpose and production-oriented model.
  - Nearest Neighbor (clothing) is "still considered in an experimental stage".
  - Vertex Delta "should not be used during production".
  - Source: [Epic docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/ml-deformer-framework-in-unreal-engine)
- **MetaHuman 5.8** removed root motion from the locomotion animations in MetaHuman Creator. — [Epic MetaHuman 5.8 release notes](https://dev.epicgames.com/documentation/metahuman/metahuman-5-8-release-notes-in-unreal-engine)
- **Uthana** (text-to-motion, video-to-motion and a motion library):
  - Raised a $4.3M seed led by IA Ventures in Mar 2025 **[2025]**, targeting indie and mid-size studios.
  - Says it is "collaborating with over 10 studios" on style transfer and APIs.
  - Its text-to-motion runs inside **Unity AI** and produces animation "in about three seconds for any bipedal character".
  - Sources: [PocketGamer.biz](https://www.pocketgamer.biz/uthana-raises-43m-with-open-beta-for-ai-powered-animation-platform) **[2025]**; [Uthana blog](https://uthana.com/blog/uthana-in-unity-ai)
- **Unity Muse is retired.** Its replacement, **Unity AI** (Unity 6.2+), includes "Generators" for texture, material, sound and animation. Muse Animate generated motion from text and filled gaps between pose keyframes. — [Unity Muse Animate docs](https://docs.unity3d.com/Packages/com.unity.muse.animate@1.2/manual/index.html); [Unity AI Generators docs](https://docs.unity3d.com/Packages/com.unity.ai.generators@1.6/manual/index.html)
- **Mixamo** (Adobe): free but humanoid-only, and "hasn't been substantially updated since the late 2010s". Its animations "look dated", though it keeps built-in Mixamo-to-Manny retargeting in UE. — [StraySpark](https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo); [Cinevva guide](https://app.cinevva.com/guides/free-character-animations-rigging)

### Inferences
- **Closest to shippable:** Cascadeur's physics-aware assist (AutoPhysics, AutoPosing, inbetweening). An animator stays in control of keys, and the output exports as normal FBX with retarget-ready bones. It is a productivity multiplier, not a replacement.
- **Generative motion.** Cascadeur Motion Generation, Uthana and Unity AI produce first-pass or background-quality clips. They were not shown to meet the gameplay-animation constraints that combat and locomotion need: exact contact frames, root-motion distances matched to gameplay values, loopability, blend-tree and motion-matching coverage, and hit-frame timing. I found no named AAA title shipping generative-AI combat animation.
- **Gameplay animation remains human-led.** Motion matching shifts the work from authoring blend trees to curating large mocap databases with root motion. That raises the value of mocap and data cleanup, which is partly AI-assisted.

### Gaps
- No 2026 data was found on **Kinetix**, **DeepMotion SayMotion**, or Autodesk's AI animation (e.g., Maya MotionMaker). Search budget was exhausted.
- No named AAA studio confirmed using Cascadeur or Uthana in a shipped 2026 title.
- I could not confirm from a fetched source that Motion Matching is used in Fortnite or other shipped Epic titles, or which UE version declared it production-ready (my background knowledge says around UE 5.4 in 2024, unverified here).

---

## 2. Motion capture / mocap cleanup (markerless video-to-mocap)

### Takeaway
The biggest 2026 change is that markerless capture is now built into the engine: **MetaHuman Animator Markerless Motion Capture in UE 5.8** captures body, or body and face, from a single camera, but is experimental. Among independent vendors, **Move AI** (multi-camera Move Pro, single-iPhone Move One, Move Live) remains the most "pro" option. **RADiCAL was absorbed by Autodesk** and its portal shut on July 6, 2026. Single-camera AI mocap (Rokoko Vision, DeepMotion, UE 5.8 mono) is good for previs, indie work and reference. Hero performance, finger detail, contacts and props still come from optical stages or from multi-camera markerless capture plus human cleanup.

### Cited Findings
- **UE 5.8 MetaHuman Animator Markerless Motion Capture plugin:**
  - Experimental and Windows-only for body or face+body.
  - Captures one actor from a single camera, including webcams and supported smartphones, with an offline solve.
  - Output is "standard animation sequences".
  - Sources: [Epic docs: mono video capture](https://dev.epicgames.com/documentation/metahuman/metahuman-animation-from-mono-video-capture-in-unreal-engine); [MetaHuman 5.8 release notes](https://dev.epicgames.com/documentation/metahuman/metahuman-5-8-release-notes-in-unreal-engine)
- **Other MetaHuman 5.8 capture changes:**
  - New real-time and offline models handle more capture conditions (camera angles, lens distortion, IR lighting), with "cleaner curves on key poses".
  - RTSP video streaming input.
  - Batch-processing API covering solve through export.
  - Source: [MetaHuman 5.8 release notes](https://dev.epicgames.com/documentation/metahuman/metahuman-5-8-release-notes-in-unreal-engine)
- A community tutorial (June 18, 2026; covered by CGWorld July 5, 2026) shows the single-video dance-capture workflow. Ingest runs through Live Link Hub Capture Manager, then a MetaHuman Performance asset, then export to Sequencer. — [CGWorld](https://cgworld.jp/flashnews/01-202607-UE58-Mocap.html)
- Early UE 5.8 users reported problems retargeting finger, hand and facial animation to MetaHumans. — [Unreal forums](https://forums.unrealengine.com/t/metahuman-retargeting-issues-in-unreal-engine-5-8/2836907)
- **Autodesk fully acquired RADiCAL's core technology and IP** (Motion, which powers Radical Core/Live, and the Canvas browser editor). The RADiCAL portal closed **July 6, 2026**, and user data was not transferred to Autodesk. Autodesk first invested in 2022. — [CG Channel (Apr 9, 2026)](https://www.cgchannel.com/?p=175200); [80.lv on 2022 investment](https://80.lv/articles/autodesk-invests-in-3d-mocap-solution-radical) **[2022]**
- **Move AI product line:**
  - Move One: single iPhone.
  - Move Pro: multi-camera, up to 12 cameras, GoPro/Sony/Blackmagic support, multi-person capture up to 22 people.
  - Move Live: real-time.
  - The vendor says it is used by "leading game studios" but names none in the material found.
  - Sources: [FitGap product listing](https://us.fitgap.com/products/009161/move-ai); [Move AI "How game studios use Move"](https://move.ai/how-game-studios-use-move-ai) (page now 404)
- Move AI's seed round of about $10M was led by Play Ventures, with Warner Music Group participating **[older; undated in source]**. — [Maginative](https://www.maginative.com/article/move-ai-raises-10-million-in-seed-funding-to-make-3d-animation-more-accessible/)
- Third-party 2026 roundups (secondary, unverified):
  - Move AI pricing is quoted inconsistently: pay-as-you-go from $0.012/sec vs. plans from $15/mo.
  - **Rokoko Vision** is free with a 15-second cap.
  - **DeepMotion** has a free tier, paid plans from about $9/mo, and a Roblox R15 export.
  - Sources: [Neolemon roundup](https://www.neolemon.com/blog/best-ai-motion-capture-tools-for-character-animation/); [NoCap Mocap (2026)](https://www.nocapmocap.com/blog/mixamo-alternatives-2026)
- Older reporting on Move's multi-phone setup noted "it's not a realtime process, the data is processed in the cloud" **[older]**. — [RedShark News](https://www.redsharknews.com/moving-into-markerless-motion-capture)

### Inferences
- **Mocap cleanup is the most "AI-ready" animation job in 2026.** Markerless solves produce ordinary animation sequences, and Epic's 5.8 update targets cleaner curves. The remaining work is the classic cleanup list: foot-slide and contact fixing, finger and prop work, retargeting (where 5.8 still has reported finger/face retarget bugs), root-motion extraction and looping.
- **Consolidation risk is real.** RADiCAL's shutdown shows vendor fragility, and studios should keep raw data exportable.
- **Shippable quality:**
  - Single-camera solves are fine for previs, crowds, background NPCs and indie work.
  - Multi-camera markerless (Move Pro) can reach game-usable body data with cleanup.
  - Optical (marker) stages remain the reference standard for hero cinematics and combat. This is an inference; no 2026 head-to-head accuracy benchmark was found.

### Gaps
- No official 2026 Move AI product announcements, Gen-2/Gen-3 model details or named game-studio customers were found.
- No independent 2026 accuracy benchmark (e.g., joint error vs. Vicon/OptiTrack) was found for any markerless tool.
- Autodesk's post-acquisition plans for RADiCAL tech (e.g., Maya or Flow Studio integration) were not found.

---

## 3. Rigger (auto-rigging)

### Takeaway
AI auto-rigging is production-useful for **the bottom half of the rig stack**: skeleton placement, body skin weights and humanoid locomotion-ready rigs. It is not useful for the top half: facial rigs, secondary dynamics (capes, hair), gameplay sockets and control-rig logic. In the one hands-on 2026 comparison found, **Reallusion AccuRIG** had the cleanest humanoid weights and **Tripo** handled non-humanoids and retargeting best. Meshy and Mixamo lagged.

### Cited Findings
- **StraySpark comparison (May 14, 2026).** One ~30k-tri mesh was run through Blender 5.1 to UE 5.7, retargeted to SK_Mannequin and tested under Mover 2.0.
  - AccuRIG produced "the cleanest pure rigs" with tight weights, but no non-humanoids and scale-sensitive import.
  - Tripo had over-smoothed shoulder/chest weights and noisy jaw weights, but handled a stylized robot with no manual fixes and had the cleanest retarget.
  - Meshy had hip pivots 5–15 cm off, causing foot-IK sliding, and needed manual bone remapping for non-standard spine and clavicle names.
  - Cascadeur needs an existing rig.
  - Mixamo assumes tight mesh conventions.
  - Source: [StraySpark](https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo)
- The same article concludes that AI auto-rigging is a real gain for "the bottom half of the rig stack (skeleton, body weights, locomotion)", while "the top half (face, secondary, gameplay logic) is still humans". It recommends manual rigging or outsourcing for capes, prop attachment and facial close-ups. Caveats: a single mesh and a vendor-interested author. — [StraySpark](https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo)
- Time to a first shipped test animation: Tripo about 3 min, Meshy about 8, AccuRIG about 10, Mixamo about 12. — [StraySpark](https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo)
- Pricing: AccuRIG is free with a Reallusion account and Mixamo is free. Meshy's free tier is 100 credits/month (secondary). Vendor-authored comparisons from Meshy and Tripo are not neutral. — [StraySpark](https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo); [Meshy blog](https://www.meshy.ai/blog/best-ai-auto-rigging-tool); [Ludo.ai comparison](https://ludo.ai/compare/best-ai-auto-rigging-tools)
- Mixamo remains "the go-to for humanoid characters", but expects a T or A pose, so creatures and mechs are out of scope. — [Cinevva](https://app.cinevva.com/guides/free-character-animations-rigging)

### Inferences
- For a professional studio, auto-riggers are best for **outsourced, NPC, crowd and prototype characters** and for jump-starting skin weights. Hero characters still need a technical animator to:
  - match the studio's skeleton standard and naming,
  - add corrective shapes or ML Deformer training data,
  - build Control Rig / IK and facial rigs (for MetaHuman-compatible faces, MetaHuman Creator's own rig is the de facto "auto-rig"),
  - set up gameplay sockets and physics assets.
- **Shippable quality:** close for standard humanoid body rigs; far for faces, creatures with unusual topology, and secondary motion.

### Gaps
- No independent multi-character benchmark was found. No 2026 data was found on Anything World, AutoRig Pro AI features, or Adobe updates to Mixamo.
- No source on whether AAA studios use AI auto-rigging in production pipelines.

---

## 4. Facial animation / lip sync

### Takeaway
Audio-driven facial animation is the most production-proven AI animation category. **Speech Graphics (SGX / SG Com)** has the longest AAA track record, with shipped credits in The Last of Us Part II, Hogwarts Legacy, Resident Evil Village, Fortnite and Gears of War. **NVIDIA Audio2Face** (open-sourced Sep 2025, diffusion v3.0) has the broadest free and engine-integrated adoption. **MetaHuman Animator** (UE 5.7/5.8) leads for performance capture from a phone or mono video, and 5.8 added a new real-time audio-driven model. Systemic and background dialogue at scale is effectively shippable today. Close-up hero cinematic faces still rely on performance capture plus animator polish.

### Cited Findings
- **NVIDIA Audio2Face open-source release (Sep 24, 2025)** **[2025]**:
  - Audio2Face SDK (on-device or cloud).
  - Maya plugin v2.0 and UE5 plugin v2.5 (UE 5.5/5.6).
  - Training Framework v1.0 with sample data.
  - Lip-sync models: regression v2.2 and **diffusion v3.0**.
  - Audio2Emotion models: production v2.2 and experimental v3.0.
  - Source: [NVIDIA Developer Blog](https://developer.nvidia.com/blog/nvidia-open-sources-audio2face-animation-model)
- **Named Audio2Face integrators:**
  - Convai, Codemasters, GSC Game World, Inworld AI, NetEase, Perfect World Games, Streamlabs, UneeQ.
  - Reallusion, in iClone and Character Creator.
  - Survios, for *Alien: Rogue Incursion Evolved Edition*.
  - The Farm 51, for *Chernobylite 2: Exclusion Zone*: "saving countless hours of animation work".
  - A demo video captioned "Audio2Face technology in F1 25".
  - Sources: [NVIDIA Developer Blog](https://developer.nvidia.com/blog/nvidia-open-sources-audio2face-animation-model); [AWN](https://www.awn.com/news/nvidia-open-sources-audio2face-animation-model) **[2025]**
- **Speech Graphics SGX:** converts audio into animation for the eyebrows, eyes, lips, jaw, cheeks and tongue.
  - Credits: The Last of Us Part II, Hogwarts Legacy, Resident Evil Village, Fortnite and several Gears of War titles.
  - Its launch customer, The Coalition, animated more than 35,000 lines for Gears of War 4.
  - Has a universal any-language model plus per-language modules; SG Com is the real-time version.
  - Sources: [80.lv deep dive](https://80.lv/articles/a-deep-dive-into-speech-graphics-facial-animation-solutions) **[older]**; [80.lv on any-language model](https://80.lv/articles/breaking-language-barriers-audio-driven-facial-animation-for-any-language/) **[older]**
- **MetaHuman 5.8:**
  - "New real-time model targets audio-driven animation".
  - Offline and real-time facial animation now run on **Linux and macOS** (body remains Windows-only).
  - RTSP streaming from Live Link Face on iOS and Android.
  - Source: [MetaHuman 5.8 release notes](https://dev.epicgames.com/documentation/metahuman/metahuman-5-8-release-notes-in-unreal-engine)
- MetaHuman 5.7 shipped with UE 5.7 on Nov 12, 2025, adding a Blueprint interface for Live Link real-time animation **[2025]**. — [MetaHuman 5.7 release](https://www.metahuman.com/releases/metahuman-5-7-is-now-available)
- A 2026 tool test flags facial close-ups and close-up dialogue as a weak spot for AI pipelines that remains a human job. — [StraySpark](https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo)

### Inferences
- **Best by use case:**
  - Thousands of lines in many languages (RPG barks, localization): Speech Graphics or Audio2Face, both shipped in AAA.
  - Cinematic hero performance: MetaHuman Animator from a head-mounted camera or iPhone capture, plus a facial animator's polish pass.
  - Real-time AI NPCs: Audio2Face (open SDK) or the MetaHuman real-time audio model.
- **Shippable quality:** lip sync for gameplay dialogue is at or near shippable. Emotional micro-expression, eye darts and acting choices in close-up still need captured performance. Audio2Emotion v3.0 being "experimental" suggests emotion inference is not production-grade.

### Gaps
- No 2026-specific Speech Graphics news (new credits, pricing) or JALI updates were found.
- No objective lip-sync quality benchmark comparing SGX, Audio2Face 3.0 and MetaHuman audio-driven output.
- No pricing found for Speech Graphics. Audio2Face's license terms were not stated on NVIDIA's blog.

---

## 5. Cinematics / trailer & cutscene director (video generation)

### Takeaway
As of late Sep/Oct 2026 the frontier text-to-video models are Chinese and Google ones:
- **Artificial Analysis (AA-Video-T2V v2.0, with audio):** Alibaba **Wan 3.0** (Aug 2026) leads, ahead of Utopai X, ByteDance **Seedance 2.5** and **MiniMax H3**.
- **LMArena/Arena text-to-video (Sep 21, 2026):** Google's **Gemini Omni 1.1 Flash** leads.
- **Veo 3.1** has dropped to the low teens/high teens of the rankings.
- **OpenAI Sora was discontinued.** The shutdown was announced Mar 24, 2026, and the API was retired Sep 24, 2026 per secondary sources.
- Runway Gen-4.5, Luma Ray 3 and Kling 3.0 sit mid-table.

For game trailers specifically, 2026 has seen repeated public backlash and takedowns (SNK, System 3, Level-5, Jagex, Crimson Desert). In practice, AI video is a **previs, storyboard and pitch tool**, not a shippable marketing or cutscene asset for reputable studios.

### Cited Findings
- **Artificial Analysis Text-to-Video leaderboard (AA-Video-T2V v2.0, models generating with audio; page shows no explicit date, newest model Sep 2026):**

  | Rank | Model | Creator | Elo | Released | Price (1080p) |
  |---|---|---|---|---|---|
  | 1 | Wan 3.0 | Alibaba | 1156 | Aug 2026 | $12.00/min |
  | 2 | Utopai X | Utopai Studios | 1149 | Sep 2026 | no API |
  | 3 | Dreamina Seedance 2.5 | ByteDance | 1143 | Jul 2026 | $34.12/min |
  | 4 | MiniMax H3 (768p) | MiniMax | 1137 | — | $4.80/min |
  | 5 | MiniMax H3 Max | MiniMax | 1130 | — | — |
  | 6 | FLUX 3 | Black Forest Labs | 1128 | — | $17.40/min |
  | 7 | Seedance 2.0 | ByteDance | 1116 | Mar 2026 | — |
  | 8 | Gemini Omni Flash 1.1 | Google | 1113 | Aug 2026 | $9.12/min |
  | 15 | Kling 3.0 Omni 1080p Pro | Kling | 1015 | Feb 2026 | $8.40/min |
  | 19 | Veo 3.1 | Google | — | — | — |

  **Sora, Runway and Luma are not listed.** The silent (no-audio) board is led by Wan 3.0 (1129), MiniMax H3 Max (1118) and H3 (1117). — [Artificial Analysis T2V leaderboard](https://artificialanalysis.ai/video/leaderboard/text-to-video)
- **Arena (LMArena) Text-to-Video, Sep 21, 2026** (718,577 votes, 48 models):

  | Rank | Model | Score |
  |---|---|---|
  | 1 | gemini-omni-1.1-flash | 1516 |
  | 2 | gemini-omni-flash | 1513 |
  | 3 | flux-3-video (preliminary) | 1493 |
  | 4 | grok-imagine-video-1.5-agent | 1492 |
  | 5 | seedance-2.0-720p | 1479 |
  | 6 | wan3.0 | 1476 |
  | 7 | seedance-2.5-720p | 1474 |
  | 8 | minimax-h3 | 1460 |
  | 9 | Meta muse-video | 1456 |
  | 11 | sora-2-pro | 1368 |
  | 12 | veo-3.1-audio | 1364 |
  | 27 | runway-gen-4.5 | — |
  | 28, 29, 33, 40 | Kling models | — |
  | 31 | Luma ray-3 | — |

  Arena's scale is not comparable to AA's. — [Arena leaderboard](https://arena.ai/leaderboard/video/text-to-video)
- A conflicting aggregator (llm-stats, "Oct 2026") claims Kling v3 leads with a score of 1934. This is inconsistent with both primary boards and should be treated as unreliable. — [llm-stats](https://llm-stats.com/leaderboards/best-ai-for-video-creation)
- **Google Gemini Omni:**
  - Gemini Omni Flash launched May 19, 2026 at I/O as the first of the "Omni" family.
  - Inputs are text, image, audio and video, with multi-turn conversational editing.
  - Produces up to 10-second clips with native audio, at $0.10/sec via the Gemini API.
  - **Gemini Omni 1.1 Flash** (late Aug 2026) adds scene extension and 4K upscaling.
  - Coverage does not explicitly call Omni a "Veo successor".
  - Sources: [IT Brief UK](https://itbrief.co.uk/story/google-launches-gemini-omni-flash-for-video-editing); [ETV Bharat](https://www.etvbharat.com/en/technology/google-gemini-omni-1-dot-1-flash-google-flow-enn26082900548)
- **OpenAI Sora discontinued:**
  - OpenAI said on Mar 24, 2026 it "decided to discontinue Sora in the consumer app and API", citing compute demand. The research team is refocusing on world simulation for robotics.
  - Disney exited its late-2025 deal and will not invest $1B.
  - Secondary sources give dates of app shutdown Apr 26, 2026 and API discontinuation Sep 24, 2026.
  - Sources: [Engadget (Mar 24, 2026)](https://engadget.com/ai/openai-is-shutting-down-its-sora-video-generation-app-211023358.html); [Wikipedia](https://en.wikipedia.org/wiki/Sora_(text-to-video_model)); [Zilliz timeline](https://zilliz.com/ai-faq/what-is-the-sora-shutdown-timeline)
- **Kling 3.0** (Kuaishou, announced Feb 4, 2026; API from Feb 5):
  - Video 3.0 and 3.0 Omni, clips up to 15 s, multi-reference consistency.
  - Native multi-language audio with speaker designation.
  - Up to 6 cuts per generation (secondary).
  - Sources: [Bernama wire](https://mrem.bernama.com/viewsm.php?idm=53441); [Gaga.art guide](https://gaga.art/blog/kling-3-0/)
- **2026 game-trailer backlash cases:**
  - SNK, *Fatal Fury: City of the Wolves* Season 2 trailer (Jan 2026). — [EventHubs](https://www.eventhubs.com/news/2026/jan/16/fatal-fury-ai-controversy/); [TechRadar](https://www.techradar.com/gaming/snk-faces-backlash-over-heavy-handed-generative-ai-usage-in-fatal-fury-city-of-the-wolves-season-2-trailer)
  - System 3, *James Pond Legacy* (Aug 2026; denied, but a character had different finger counts per hand). — [Nintendo Life](https://www.nintendolife.com/news/2026/08/james-pond-publisher-denies-ai-generated-trailer-but-no-ones-buying-it)
  - Level-5 CEO apologized for genAI in a Yo-kai Watch / Professor Layton showcase (Sep 2026). — [GamesRadar](https://www.gamesradar.com/games/puzzle/i-deeply-apologize-after-global-backlash-level-5-ceo-admits-new-yo-kai-watch-and-professor-layton-showcase-uses-generative-ai/)
  - Jagex pulled a RuneScape *Dragon Slayer 2* trailer (Oct 2026) after a six-fingered hand was spotted. An external partner had "explicitly confirmed that GenAI would not be used". — [Games.gg](https://games.gg/news/jagex-generative-ai-dragon-slayer-2/)
- At Gamescom Opening Night Live 2026 (Aug 26, 2026), Kotaku flagged genAI use in multiple titles. *Crimson Desert*'s developers apologized and promised to remove assets. A *Humankind 2* trailer accused of being AI was, per the developer, filmed at Nu Boyana Film Studios. — [Kotaku](https://kotaku.com/opening-night-live-2026-genai-slop-games-geoff-keighley-2000728477)
- **Professional trailer editors on AI (Aug 28, 2026):**
  - Derek Lieu (Half-Life: Alyx, Psychonauts 2): "utterly ridiculous to even consider using it in creative works".
  - Suzanne Wallace (IndieBard): tools "replicate adequacy — not ingenuity".
  - Cited defects: character inconsistency across shots, anatomy errors, and outputs resembling existing IP.
  - Source: [Slyther Games](https://www.slythergames.com/2026/08/28/game-trailer-editors-describe-generative-ai-as-poison/)

### Inferences
- **"Best" depends on the leaderboard.**
  - AA (with audio): Wan 3.0, then Seedance 2.5 / MiniMax H3.
  - Arena: Google Gemini Omni 1.1 Flash.
  - For a Western studio wary of data provenance and API stability, Google (Omni / Veo 3.1 via Vertex/Gemini API) and Black Forest Labs FLUX 3 are the top-tier non-Chinese options. Sora's shutdown is a cautionary tale about building pipelines on a single vendor's video API.
- **Cutscene and trailer use.** Clips max out around 10–15 s with weak multi-shot consistency, and there is no control over in-engine assets, rigs, or exact game-character likeness. Real game cinematics are rendered in-engine from game assets. AI video is therefore best for animatics, pitch reels, mood/tone tests, and VFX plates or backgrounds. Shipping AI footage in marketing currently carries clear reputational risk.
- MiniMax's "H3" models are likely the successor to its Hailuo line. This is inferred from the company; it was not confirmed in a source.

### Gaps
- No source confirmed Wan 3.0's license or open-weights status, or what "Utopai X" is.
- No source on Runway's 2026 game-industry deals or Gen-5, or on Luma Ray 3's 2026 updates.
- No named AAA studio publicly confirmed using AI video in a shipped cutscene in 2026.
- AA's leaderboard page shows no explicit update date. The newest model listed is from Sep 2026.

---

## 6. Composer / music (adaptive / interactive game music)

### Takeaway
Among generators, **Suno v6** (Sep 9, 2026) and **Google Lyria 3 / Lyria 3 Pro** lead on full-song quality, with **ElevenLabs Eleven Music** the most "licensed-by-design" alternative. Udio is in a walled-garden transition with downloads disabled. Licensing risk is still the gating factor for professional game studios:
- Warner settled with both Suno and Udio, and Universal settled with Udio.
- **Universal and Sony filed a second lawsuit against Suno on Sep 18, 2026**, specifically targeting v6.
- Leading game composers report contracts requiring no-AI declarations.

None of these tools natively produce **adaptive** scores (stems, layers, loop points, transition markers for Wwise/FMOD). The closest is **Google Lyria RealTime**, a 2025 streaming/steerable model, plus middleware like Reactional. Adaptive game scoring is therefore still a human composer plus audio-implementer job.

### Cited Findings
- **Suno v6** (Sep 9, 2026), built "with Warner Music Group, BMG, and Believe":
  - Models: v6 (flagship, Pro/Premier), v6-wild (exploratory, Pro/Premier) and v6-mini (free).
  - Features: plain-language editing of song sections, mashups, sampling/isolating sections, generation from text, audio, image or video.
  - Suno Studio 2.0 (browser DAW) launched Aug 2026. v5.5 launched Mar 2026.
  - Secondary sources say v6 retires all earlier models.
  - Sources: [MGMT Boston](https://mgmtboston.com/news/suno-v6-music-models); [DataNorth](https://datanorth.ai/news/suno-launches-v6-v6-wild-and-v6-mini); [Choosely](https://choosely.ai/ai-radar/suno-v6-vs-v5-5-what-changed)
- **Universal and Sony v. Suno (second suit, filed Sep 18, 2026, D. Mass.):**
  - Alleges copying of 60,202 recordings; theoretical maximum statutory damages are about $9B.
  - Argues v6 was built via knowledge distillation on outputs of earlier unlicensed models, "fruit of the same poisoned tree".
  - Suno's product chief said v6 training excluded UMG and Sony material.
  - The original 2024 suit continues. Warner is not a party, having settled.
  - Sources: [Music Business Worldwide](https://www.musicbusinessworldwide.com/universal-and-sony-sue-suno-for-a-second-time-claiming-platforms-v6-models-are-the-fruit-of-the-same-poisoned-tree/); [Boston.com (Sep 27, 2026)](https://www.boston.com/news/local-news/2026/09/27/major-record-labels-sue-cambridge-based-ai-platform-again/); [Variety AU](https://au.variety.com/2026/music/global/sony-music-universal-music-sue-suno-label-backed-model-40495/)
- **Settlement timeline:**
  - UMG–Udio: settled and licensed Oct 29, 2025 **[2025]**. — [Digital Music News](https://www.digitalmusicnews.com/2025/10/29/umg-udio-deal-everything-we-know/)
  - WMG–Udio: Nov 19, 2025 **[2025]**.
  - WMG–Suno: Nov 25, 2025 **[2025]**. Terms: licensed models in 2026, deprecation of unlicensed models, downloads behind paid accounts with caps.
  - Sony has settled with neither.
  - Sources for the settlement terms are secondary and partly conflicting; one claims Warner–Udio was Apr 2026. — [Dynamoi timeline](https://dynamoi.com/learn/ai-music-distribution/ai-music-copyright-cases-timeline); [AI Vortex](https://www.aivortex.io/legal/ai-case-law/suno-udio-music-ai/); [Colapietro Substack](https://jasoncolapietro.substack.com/p/the-suno-and-udio-settlements-explained)
- **Udio:** audio, video and stem downloads were disabled after the UMG deal. A licensed "walled garden" subscription relaunch had no confirmed date as of Sep 2026 (secondary). — [OrcaRouter](https://www.orcarouter.ai/blog/suno-v6-vs-udio); [Sonilo](https://sonilo.com/blog/comparisons/udio-v4-warner-music-licensing-explained)
- The American Federation of Musicians reportedly sued UMG and Warner on Jun 5, 2026 over member recordings being licensed into AI deals without compensation (secondary, unverified). — [Dynamoi](https://dynamoi.com/learn/ai-music-distribution/ai-music-copyright-cases-timeline)
- **ElevenLabs Eleven Music:**
  - Launched Aug 2025 with **Merlin** and **Kobalt** licensing deals, with artist opt-in and revenue share **[2025]**. — [MBW 2025](https://musicbusinessworldwide.com/eleven-music-new-ai-rival-to-suno-launches-with-merlin-kobalt-licensing-deals-in-the-bag)
  - **ElevenMusic** streaming and remix platform: iOS app Apr 1, 2026, launched with more than 4,000 indie artists.
  - Believe signed a licensing deal on Apr 30, 2026.
  - Source: [MBW (May 1, 2026)](https://www.musicbusinessworldwide.com/elevenlabs-officially-launches-elevenmusic-as-streaming-and-ai-creation-platform-with-licensed-remix-model/)
- **Google Lyria:**
  - **Lyria 3** reached the Gemini app on Feb 18, 2026 (30-s tracks from text, image or video).
  - **Lyria 3 Pro** (Mar 25 or 30, 2026) produces songs up to about 3 min (184 s on Vertex preview).
  - Reported pricing is $0.04 per song (Clip) and $0.08 per song (Pro).
  - Flow Music studio launched Apr 2026. A "Lyria 3.5" claim is unverified.
  - **Lyria RealTime** (2025) is the interactive, steerable streaming model, documented in arXiv:2508.04651.
  - Sources: [Pasquale Pillitteri](https://pasqualepillitteri.it/en/news/311/google-lyria-3-ai-music-gemini-guide); [InVideo Lyria guide (Aug 2026)](https://invideo.io/blog/lyria-ai-music-generator/); [CometAPI](https://www.cometapi.com/what-is-lyria-3-pro-/); [arXiv 2508.04651](https://arxiv.org/abs/2508.04651) **[2025]**
- **Composer stance (NME, May 29, 2026):**
  - Austin Wintory says copyright uncertainty over generated music makes it "a non-starter for most big publishers".
  - Every contract he has signed recently includes a declaration that no AI was used.
  - The notable adaptive score of 2026 is human-built: Woodkid's reactive, procedural *Death Stranding 2* soundtrack runs on his own engine that rearranges songs by harmonic theory.
  - Source: [NME](https://www.nme.com/features/gaming-features/video-game-music-2026-interview-austin-wintory-lena-raine-ai-vinyl-3947766)
- **Impersonation harms:** Final Fantasy Crystal Chronicles composer Kumi Tanioka disavowed an AI-generated album released under her name (Aug 2026). The same reporting found AI-generated OSTs for non-existent games on streaming services. — [Time Extension](https://www.timeextension.com/news/2026/08/definitely-not-something-i-made-final-fantasy-composer-warns-against-ai-generated-album-released-under-her-name)
- **Reactional Music** is generative/adaptive music middleware used by composers with programmers; it can also send commands back to the game. It has partnerships with Hipgnosis and APM **[~2025 article]**. — [AudioCipher](https://www.audiocipher.com/post/adaptive-music-machine-learning)
- An AI-music vendor's 30-day experiment concluded AI was "practically good enough" for many indie games but "not a composer". The author is commercially interested. — [Medium (Jul 2026)](https://medium.com/@musicarthub.com/ai-game-music-30-days-honest-review-c3a3f950de78)

### Inferences
- **Best raw quality:** Suno v6 and Lyria 3 Pro.
- **Lowest legal risk:** ElevenLabs Music (indie-licensed) and Google Lyria (Google indemnity norms, though no game-specific terms were verified).
- **Highest litigation exposure:** Suno, given the active UMG/Sony suits even against v6.
- **For adaptive game scores, none of these is shippable as-is.** Game music needs stems, intensity layers, beat-accurate loop points, stingers and transition rules authored in Wwise/FMOD. Generators output stereo songs or clips. Real-time streaming (Lyria RealTime) is promising for experimental or ambient systems but unproven in shipped AAA titles.
- **Realistic professional use:** temp tracks, pitch mockups, idea generation, and filler or menu music in small or mobile games. AAA scores remain human-composed, and publisher contracts increasingly forbid AI.

### Gaps
- The Artificial Analysis music leaderboard URL returned 404, so no Oct 2026 music-arena ranking is available.
- No 2026 information on Stable Audio (any version 3.0 claims are unreliable) or Meta AudioCraft/MusicGen updates.
- No named 2026 commercial game confirmed to ship AI-generated score music.
- Unverified secondary claims: ElevenLabs self-serve commercial clearance reportedly excludes film, TV and "Studio Games" (Enterprise only), and Eleven Music v2 shipped May 26, 2026. Both need checking against ElevenLabs' terms.
- No 2026 status update was found for Reactional.

---

## 7. Sound designer / SFX

### Takeaway
**ElevenLabs Sound Effects** (SFX v2) is the most-cited text-to-SFX tool for games. It offers 0.1–30 s clips, seamless looping and 48 kHz WAV, at 40 credits/sec. Stable Audio is cited for longer ambient beds. Engine-native generators (Unity AI) now also make sounds. Video-to-audio "foley" models (Tencent HunyuanVideo-Foley, the MIT-licensed Foley-Omni) are improving but carry license and sample-rate caveats. AI SFX is usable for prototypes, UI sounds, ambience layers and variation material. Signature, repeated gameplay sounds still need a sound designer's editing, layering and mixing.

### Cited Findings
- **ElevenLabs Sound Effects API:**
  - Duration 0.1–30 s, with looping support for seamless ambience.
  - MP3 output, plus 48 kHz WAV for non-looping effects.
  - 40 credits per second when duration is specified.
  - Source: [ElevenLabs docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects)
- Secondary 2026 guides date SFX v2 to Sep 2025, list looping as unique to ElevenLabs among compared tools, and position Stable Audio for longer ambient and musical textures. One reviewer notes that a signature sound players hear thousands of times "often needs a trim, an EQ pass, or a layer of a second sound". — [ElevenLabs Magazine (secondary)](https://elevenlabsmagazine.com/elevenlabs-sfx-v2-soundboard-guide-2026/); [SummerEngine](https://www.summerengine.com/blog/ai-sound-effect-generator-for-games); [Undetectr](https://undetectr.com/blog/ai-sound-effect-generator)
- **Unity AI Generators** (Unity 6.2+) create "texture, material, sound, and animation" assets from prompts. — [Unity docs](https://docs.unity3d.com/Packages/com.unity.ai.generators@1.6/manual/index.html)
- **Video-to-audio models:**
  - **HunyuanVideo-Foley** (Tencent): open source since Aug 2025, 48 kHz **[2025]**. A secondary guide says its license excludes the EU, UK and South Korea.
  - **MMAudio:** reportedly non-commercial weights (CC-BY-NC).
  - **Foley-Omni** (NJU, Jun 2026): MIT license, generates speech, SFX and music from video, but outputs 16 kHz, "suitable for reference/scratch audio".
  - **LTX-2.3 Foley LoRA:** paid license above $10M revenue.
  - Sources: [HunyuanVideo-Foley GitHub](https://github.com/Tencent-Hunyuan/HunyuanVideo-Foley); [AI Films on Foley-Omni](https://studio.aifilms.ai/blog/foley-omni-video-soundtrack-generation); [LTX docs](https://docs.ltx.io/open-source-model/usage-guides/video-to-audio-foley)
- **Audiokinetic (Wwise)** states its AI use supports human creation of audio and aligns with Sony Group's responsible-AI initiatives. Its described AI is a **non-generative, local CLAP model** for "Similar Sound Search". — [Audiokinetic AI page](https://www.audiokinetic.com/en/solutions/use-of-ai/) (via search snippet; direct fetch returned 403)

### Inferences
- **Best tool:** ElevenLabs SFX v2 for prompt-to-one-shot and loops, with Stable Audio for beds. Neither replaces a sound designer for:
  - weapon and creature "signature" sounds,
  - material-based foley sets with round-robin variations,
  - synced cinematic sound design,
  - final mix, loudness and spatial work.
- **Video-to-audio** is most relevant to cinematics and trailers, generating scratch foley for animatics. Current open models have license or quality limits that make them unsuitable for final AAA delivery.
- **Shippable quality:** UI blips, ambience layers and prototype placeholders are often shippable after light editing. Hero gameplay SFX are not.

### Gaps
- No 2026 primary information on Stability AI's Stable Audio roadmap, Meta AudioCraft/AudioGen updates, or Adobe Firefly sound effects.
- No AAA studio publicly confirmed using AI SFX in a shipped 2026 title.
- No arena or benchmark exists for SFX quality.

---

## 8. Voice actor / voice direction (TTS, voice cloning, real-time NPC voice)

### Takeaway
**ElevenLabs Eleven v4 / v4 Turbo** (launched Sep 28, 2026) is #1 and #2 on the Artificial Analysis Speech Arena (Elo 1327 and 1323). Behind it are Alibaba Qwen-Audio-3.1, Cartesia Sonic 3.6, Google Gemini 3.8 Flash TTS and **Inworld Realtime TTS-2** (the game-focused real-time option). OpenAI's dedicated TTS models rank far lower, Replica Studios shut down in June 2025, and Sonantic is not a game vendor in 2026.

The legal framework in the US is the **SAG-AFTRA 2025 Interactive Media Agreement** (ratified Jul 9, 2025, 95.04%), which requires informed consent and disclosure for digital replicas, plus the right to suspend consent during strikes.

Real-world 2025–26 use shows the ceiling:
- **Arc Raiders** shipped licensed TTS lines and then re-recorded some with humans. CEO Söderlund: "a real professional actor is better than AI".
- Fortnite's AI Darth Vader drew a SAG-AFTRA unfair labor practice charge.
- Epic's UEFN "Conversations" AI NPCs (Gemini + ElevenLabs) are still experimental.

Verdict: AI voice is shippable for barks, pings, placeholder or scratch VO, and consented, licensed replica lines. It is not at parity for lead performances.

### Cited Findings
- **Artificial Analysis Speech Arena (Provider Voice Arena), current page:**

  | Rank | Model | Creator | Elo | Price per 1M chars | Released |
  |---|---|---|---|---|---|
  | 1 | Eleven v4 Turbo | ElevenLabs | 1327 | $40 | Sep 2026 |
  | 2 | Eleven v4 | ElevenLabs | 1323 | $80 | Sep 2026 |
  | 3 | Qwen-Audio-3.1-TTS-Plus | Alibaba | 1298 | $19.3 | — |
  | 4 | Sonic 3.6 | Cartesia | 1284 | $49 | — |
  | 5 | Gemini 3.8 Flash TTS | Google | 1272 | $16.5 | — |
  | 7 | Realtime TTS-2 | Inworld | 1257 | $20.8 | Aug 2026 |
  | 9 | Simba 3.2 | Speechify | 1243 | $6.6 | — |
  | 12 | Realtime TTS-2 Flash | Inworld | 1217 | $10.4 | — |
  | 15 | v3 Conversational | ElevenLabs | 1207 | — | — |
  | 18 | Eleven v3 | ElevenLabs | 1176 | $100 | Feb 2026 |
  | 19 | Speech 2.8 HD | MiniMax | 1173 | — | — |
  | 36 | TTS-1 HD | OpenAI | 1105 | — | — |
  | 48 | GPT-Realtime-2 | OpenAI | 1078 | — | May 2026 |
  | 63 | Octave 2 | Hume | 1051 | — | — |
  | 71 | MAI-Voice-1 | Microsoft | 1031 | — | — |

  — [Artificial Analysis TTS leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard)
- The #1 spot changed hands repeatedly in 2026:
  - May: Realtime TTS 1.5 Max.
  - June 3: Fun-Realtime-TTS (1219) ahead of Gemini 3.1 Flash TTS.
  - July: Simba 3.2 and Qwen 3.0 effectively tied.
  - Source: [Artificial Analysis article (Jun 3, 2026)](https://artificialanalysis.ai/articles/fun-realtime-tts-new-text-to-speech-model-topping-artificial-analysis-leaderboard)
- **Eleven v4 / v4 Turbo (Sep 28, 2026):**
  - New architecture that infers tone, pacing and emotion from text, with scene-level context.
  - Inline natural-language audio tags; SSML `<break>` is disabled.
  - 90+ languages, with cross-lingual accent retention.
  - Turbo: ~100 ms median inference and ~150 ms median time-to-first-speech (company-measured).
  - Instant clones from 10 s of audio. **All clones require verified consent.** Pre-launch clones must be retrained.
  - Up to 10,000 characters per generation. Paid plans from $6/mo.
  - Named customers are non-game (Salesforce, Accenture).
  - Sources: [Unite.AI](https://www.unite.ai/elevenlabs-launches-eleven-v4-with-low-latency-turbo-variant); [ProPakistani (Sep 29, 2026)](https://propakistani.pk/2026/09/29/elevenlabs-unveils-its-fastest-most-expressive-voice-ai-models-yet/amp/)
- Eleven v3 went GA on Feb 2, 2026 with audio tags and multi-speaker dialogue, but is not real-time (secondary). — [Coval review](https://www.coval.ai/blog/elevenlabs-review-2026-voice-cloning-and-synthesis-capabilities-explained)
- **Inworld:**
  - Realtime TTS-2 released Aug 31, 2026 (secondary listing).
  - TTS-1.5 (Jan 2026) had P90 latency of 130 ms (Mini) and 250 ms (Max).
  - Inworld's games page targets Unreal, Unity and custom engines.
  - A German 2026 guide argues Inworld has pivoted from an NPC studio to B2B infrastructure.
  - Sources: [Morphic listing](https://morphic.com/resources/models/inworld-tts-2); [Inworld games page](https://inworld.ai/games); [Cinevva DE guide](https://app.cinevva.com/de/guides/ai-npcs-dialogue)
- **SAG-AFTRA 2025 Interactive Media Agreement:**
  - Tentative deal Jun 9, 2025; ratified Jul 9, 2025 with 95.04% in favor, ending a 320-day strike.
  - Companies must disclose all planned AI uses of voice, likeness or movement and obtain written consent.
  - Performers can suspend consent for new replica material during a strike.
  - Pay rises 15.17% up front plus 3% annually.
  - Signatories include Activision, Disney Character Voices, EA, Epic Games, Formosa, Insomniac, Llama Productions, Take-Two, VoiceWorks and WB Games.
  - Sources: [TheWrap](https://www.thewrap.com/sag-aftra-ratify-interactive-media-agreement-video-game-strike/) **[2025]**; [AWN](https://awn.com/news/sag-aftra-ratifies-new-deal-video-game-companies) **[2025]**; [Wikipedia](https://en.wikipedia.org/wiki/2024%E2%80%932025_SAG-AFTRA_video_game_strike)
- Earlier, the companies' "best, last and final" offer (May 2025) dropped the unlimited digital-replica buyout for pre-generated content **[2025]**. — [Variety](https://variety.com/2025/gaming/news/video-game-companies-strike-ai-actors-contract-1236395206/)
- **Fortnite Darth Vader** (May 2025):
  - Dialogue came from Gemini 2.0 Flash, voiced by ElevenLabs as James Earl Jones with his estate's approval.
  - SAG-AFTRA filed an NLRB unfair labor practice charge against Epic's subsidiary **Llama Productions** on May 19, 2025, alleging unilateral changes without bargaining.
  - A withdrawal was reported on Jul 31, 2025 via social posts; no official confirmation was found.
  - Sources: [SAG-AFTRA statement](https://www.sagaftra.org/sag-aftra-statement-fortnites-use-ai-darth-vader-voice-and-ulp-filing) **[2025]**; [Engadget](https://engadget.com/gaming/fortnite-is-about-to-unleash-ai-powered-npcs-172728548.html) **[2025]**; [Gaming Amigos](https://www.gamingamigos.com/post/sag-aftra-fortnit-ai-darth-vader-voice) (unconfirmed)
- **Epic UEFN "Conversations"** (formerly the "Persona Device"):
  - Shipped in Fortnite v40.20 on Apr 16, 2026 as an **experimental** feature.
  - Gemini 3.1 Flash Lite handles audio input and responses; ElevenLabs provides the voice.
  - Islands with AI NPCs cannot be published until beta. Epic says voice models are not final and latency is slower than expected; Epic currently covers costs.
  - Banned: medical or mental-health personas and romantic companions.
  - Source: [Wccftech (Apr 19, 2026)](https://wccftech.com/fortnite-uefn-ai-npc-conversations-gemini-elevenlabs/amp/)
- **Arc Raiders (Embark Studios):**
  - Its Steam page disclosed TTS for segments of voice acting.
  - Embark said contracts explicitly state that a model is trained on the actor's voice, and that actors are paid for booth time and paid again for approving TTS licensing.
  - TTS is limited to lines "not as essential to immersion", mostly the ping system.
  - Post-launch, Embark re-recorded some lines with humans over a "quality difference". CEO Patrick Söderlund: "A real professional actor is better than AI".
  - Sources: [Push Square (Mar 16, 2026, citing GamesIndustry.biz)](https://www.pushsquare.com/news/2026/03/arc-raiders-replacing-some-of-its-controversial-ai-voices-with-better-human-ones); [Hitmarker](https://hitmarker.net/news/embark-studios-defends-and-explains-its-use-of-ai-in-arc-raiders-ahead-of-launch-1561355) **[2025]**; [Windows Report](https://windowsreport.com/embark-replaces-ai-dialogue-in-arc-raiders-with-human-voice-actors-after-controversy/)
- **Replica Studios:**
  - Signed a SAG-AFTRA digital-voice-replica agreement in Jan 2024, which drew member backlash **[2024]**. — [Forbes (Jan 10, 2024)](https://www.forbes.com/sites/conormurray/2024/01/10/video-game-voice-actors-criticize-sag-aftra-over-agreement-with-ai-company/)
  - Shut down service on Jun 30, 2025, citing inability to reach profitability **[2025]**. — [MultiLingual](https://multilingual.com/replica-studios-shutdown-2025/)

### Inferences
- **Best options:**
  - Offline or narrative TTS quality: ElevenLabs Eleven v4.
  - Real-time NPC voice: Eleven v4 Turbo, Cartesia Sonic 3.6 or Inworld Realtime TTS-2.
  - Cheapest high-ranking options: Gemini 3.8 Flash TTS and Speechify Simba 3.2.
- **Shippable vs. human:** blind arena wins measure naturalness on short prompts, not sustained character acting. Arc Raiders, a commercially huge 2025–26 title, still found a "quality difference" and replaced lines. AI VO is shippable for low-salience systemic lines, scratch/temp VO, localization previews and consented replica extensions. It is not shippable for leads or cinematics at AAA quality.
- **Union compliance is a hard constraint for SAG-AFTRA signatories.** Any replica use requires disclosure plus written consent and payment. Unilateral AI substitution invites NLRB charges, as in the Darth Vader case.
- **Vendor risk:** Replica shut down and Sora was discontinued. The ElevenLabs v4 requirement to retrain older clones also has pipeline implications for live games.

### Gaps
- The expiry date of the 2025 IMA was not found; one low-quality source says "through 2026".
- No 2026 SAG-AFTRA disputes or Equity (UK) game-AI actions were found.
- Sonantic's status: Spotify acquired it in 2022 (background knowledge, not verified here). No evidence it serves game studios in 2026.
- The TTS vendor used by Embark is not named in fetched sources.
- Unattributed secondary claims: ElevenLabs default voices expire Dec 31, 2026, and a May 7, 2026 price cut lowered TTS by 55%. Verify on ElevenLabs.
- OpenAI's newest TTS (e.g., a gpt-4o-mini-tts successor) does not appear on the AA board.

---

## 9. Audio implementation (Wwise / FMOD integration)

### Takeaway
No major **generative** AI features were found in Wwise or FMOD as of Oct 2026. Audiokinetic (Sony-owned) has publicly constrained itself to **non-generative**, local ML (a CLAP model powering "Similar Sound Search"), aligned with Sony's responsible-AI policy. AI touches implementation mainly indirectly:
- engine-side generators (Unity AI sound),
- AI-voiced NPC pipelines that stream TTS at runtime (UEFN Conversations, Inworld and ElevenLabs SDKs),
- generic coding assistants writing integration and Verse/Blueprint glue.

Audio implementation remains a human technical-audio job.

### Cited Findings
- Audiokinetic's AI policy describes a **non-generative, local CLAP model** that "is not updated", tied to **Similar Sound Search**, aims to "support human creation of audio", and aligns with Sony Group's responsible-AI initiatives. — [Audiokinetic AI page](https://www.audiokinetic.com/en/solutions/use-of-ai/) (search snippet; direct fetch 403)
- A 2026 middleware overview describes Wwise as Sony-owned. The overview dates the acquisition to May 2024, which conflicts with my background knowledge that Sony acquired Audiokinetic in 2019, so treat the date as unreliable. It found no generative features for FMOD, which is described as sample-based with parameter-driven variation. — [youngju.dev (May 16, 2026)](https://www.youngju.dev/blog/culture/2026-05-16-game-audio-middleware-2026-wwise-sony-fmod-steam-audio-resonance-tempest-3d-metasounds-deep-dive.en); [StraySpark middleware comparison](https://www.strayspark.studio/blog/wwise-fmod-metasounds-audio-middleware-comparison)
- Unity AI Generators (Unity 6.2+) produce sound assets inside the editor. — [Unity docs](https://docs.unity3d.com/Packages/com.unity.ai.generators@1.6/manual/index.html)
- Runtime AI voice integration in shipped tooling: Epic's UEFN Conversations streams LLM output (Gemini 3.1 Flash Lite) through ElevenLabs TTS. It is experimental, with latency still "slower than expected". — [Wccftech](https://wccftech.com/fortnite-uefn-ai-npc-conversations-gemini-elevenlabs/amp/)
- Reactional's middleware can send music-driven commands back to the game, positioning it as an adaptive-music implementation layer **[~2025]**. — [AudioCipher](https://www.audiocipher.com/post/adaptive-music-machine-learning)
- GDC 2026: of respondents using genAI, code assistance is a top use (47%). — [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)

### Inferences
- **Where AI helps today:**
  - LLM coding assistants for Wwise/FMOD API glue, Blueprint/Verse scripting and batch tooling (e.g., WAAPI scripts that rename or import thousands of assets).
  - ML search and tagging of sound libraries.
  - TTS pipelines feeding dialogue systems.
- **What AI does not do:** design interactive mix states, RTPC curves, music transition matrices, occlusion and spatialization tuning, or memory/CPU budgets.
- Runtime TTS adds new implementation burdens: latency budgets (100–250 ms TTFA for the best models), streaming buffers, loudness normalization of generated lines, content moderation, and compliance logging for union consent.

### Gaps
- Wwise 2025.x/2026 and FMOD 2.03+/2026 release notes were not checked (search budget exhausted). An AI feature added in 2026 could have been missed.
- No GDC 2026 talk or postmortem on AI in audio implementation was found.

---

## 10. Cross-cutting: where AI falls short, adoption and sentiment (all roles)

### Takeaway
In 2026, professional game-developer sentiment toward generative AI is at a record low:
- 52% say it harms the industry and only 7% say it helps.
- Only 30% of studio-based respondents use it, versus 58% at publishers and marketing firms.
- Public backlash forces retractions of AI trailers, voices and art (Arc Raiders, Crimson Desert, Jagex, Level-5).

Technically, AI is closest to shippable in assistive, high-volume, low-salience work: lip sync at scale, mocap cleanup, auto-rig first passes, barks and ping VO, UI SFX, and temp music. It is furthest from shippable in hero performance (lead VO, cinematic faces, combat animation feel), game-specific structural constraints (root motion, blend-tree and motion-matching coverage, adaptive music stems and transitions), and legal or union-compliant provenance.

### Cited Findings
- **GDC 2026 State of the Game Industry** (2,300+ respondents):
  - 36% personally use genAI: 30% at game studios vs. 58% at publishers, support and marketing firms.
  - 52% say genAI has a negative impact, up from 30% in 2025 and 18% in 2024. 7% say positive.
  - Most negative disciplines: visual and technical art (64%), design and narrative (63%), programming (59%).
  - Tools: ChatGPT 74%, Gemini 37%, Copilot 22%.
  - Uses: research and brainstorming 81%, emails 47%, code 47%, prototyping 35%.
  - Source: [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)
- A third-party analysis of the GDC data says only about 5% of AI-using developers put AI output in front of players (secondary). — [Ziva](https://ziva.sh/blogs/gdc-2026-generative-ai-game-development-data)
- Gamescom ONL 2026 coverage lists multiple games with Steam genAI disclosures (Aion 2, Train Sim World 7, PUBG-related titles) and *Crimson Desert*'s apology. — [Kotaku](https://kotaku.com/opening-night-live-2026-genai-slop-games-geoff-keighley-2000728477)
- Root motion is a hard requirement for motion-matching locomotion data. Generated clips must satisfy it to be usable. — [Epic docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/motion-matching-in-unreal-engine)
- Facial, secondary and gameplay-logic rigging "is still humans". — [StraySpark](https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo)
- "A real professional actor is better than AI" (Embark CEO, Mar 2026). — [Push Square](https://www.pushsquare.com/news/2026/03/arc-raiders-replacing-some-of-its-controversial-ai-voices-with-better-human-ones)
- Major-publisher composer contracts require no-AI declarations (Wintory). — [NME](https://www.nme.com/features/gaming-features/video-game-music-2026-interview-austin-wintory-lena-raine-ai-vinyl-3947766)

### Inferences
**Readiness scorecard** (my synthesis of the above; 5 = shippable at AAA quality with minimal human touch):

| Role | Score | Notes |
|---|---|---|
| Facial lip sync at scale | 4 | |
| Mocap cleanup / markerless capture | 3 | Body previs/NPC 3–4; hero 2 |
| Auto-rigging | 3 | Body 3–4; face/secondary 1–2 |
| SFX | 2–3 | UI/ambience 3–4; signature 1–2 |
| Voice/TTS | 2–3 | Barks/pings 4; leads 1–2 |
| Character keyframe/combat animation | 2 | |
| Music | 2 | Temp/indie 3–4; adaptive AAA 1 |
| Cinematic video generation | 1–2 | Previs/pitch 3 |
| Audio implementation | 1 | AI as coding assistant only |

- **Structural pattern:** AI is strongest where output is a *standard intermediate format* that humans then integrate (animation curves, FBX rigs, WAV one-shots, TTS lines). It is weakest where the deliverable is a *system* (blend trees, adaptive music logic, interactive mix) or a *performance* that audiences scrutinize.
- **Licensing and union constraints** (the SAG-AFTRA IMA, label suits against Suno, Steam AI disclosure, player backlash) are as limiting as technical quality for AAA in 2026.

### Gaps
- No studio postmortem (GDC 2026 or 80.lv) quantifying time or cost savings from AI in animation or audio was found.
- No objective benchmark of game-specific animation quality (e.g., foot-skate or contact metrics) across AI tools.
