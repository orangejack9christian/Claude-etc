# AI Systems for Visual Art Roles on a Professional Game Development Team (state as of October 2026)

Research date: 10 October 2026. Sources are 2026 unless labeled [OLDER: date]. Many 2026 sources here are third-party guides, resellers, or vendor blogs. Each finding names the source type where reliability matters. Arena numbers come from live leaderboard pages fetched on 10 Oct 2026.

---

## Cross-cutting: Which image models lead the arenas, and which win for game-specific needs?

### Takeaway
As of early October 2026, OpenAI's GPT Image 2.5 (Sunburst and Flare variants, released 8 Sep 2026) holds #1 and #2 on both LMArena/Arena and Artificial Analysis for text-to-image. GPT Image 2 (Apr 2026) is #3. Google's Nano Banana 2.1 (6 Oct 2026), Microsoft MAI-Image-2.6, and xAI/"SpaceXAI" Grok Imagine Image 2.0 form the next tier. Arenas measure general aesthetic and prompt preference, not game-production fitness. For games, the key factors are style lock-in (custom-trained models on Scenario/Layer, multi-reference conditioning in FLUX.2 and Nano Banana), grid-true pixel output, transparent backgrounds, and licensing and provenance. Arena rank does not settle those.

### Cited Findings
**Arena standings (live)**
- Arena (formerly LMArena) Text-to-Image overall, snapshot dated 7 Oct 2026, 6,604,125 votes across 82 models. Top 15: (1) gpt-image-2.5-sunburst, OpenAI, 1425 ±7 (preliminary); (2) gpt-image-2.5-flare, 1398; (3) gpt-image-2 (medium), 1383, 93k votes; (4) grok-imagine-image-2.0 (canvas), listed under org "SpaceXAI", 1334 (preliminary); (5) mai-image-2.6, Microsoft AI, 1332; (6) gemini-nano-banana-2.1, Google, 1328 (preliminary); (7) reve-2.1, 1302; (8) grok-imagine-image-2.0 (20260801), 1294; (9) muse-image, Meta, 1274; (10) reve-2.0, 1269; (11) gemini-3.1-flash-image (nano-banana-2) [web-search], 1262; (12) seedream-5.0-pro, ByteDance, 1255; (13) qwen-image-3.0-pro, Alibaba, 1255; (14) mai-image-2.5, 1254; (15) nano-banana-2-lite, 1250 — [Arena text-to-image leaderboard](https://arena.ai/leaderboard/text-to-image)
- Artificial Analysis (AA-Image-T2I v2.0) top Elo, with price per 1k images at 1024²: GPT Image 2.5 Sunburst (max) 1198, Sep 2026, $210.7; GPT Image 2.5 Flare (max) 1191, $210.7; GPT Image 2 (high) 1172, Apr 2026, $211; Nano Banana 2.1 1161, Oct 2026, $33.6; Grok Imagine Image 2.0 1156, Aug 2026, $60; MAI-Image-2.6 1151, Aug 2026, $38.9; Nano Banana 2 1126, Feb 2026, $67; **FLUX 3 Image 1117, Oct 2026, $48**; Meta Muse Image 1114, Jul 2026, $10; GPT Image 1.5 (high) 1108, Dec 2025; MAI-Image-2.6-Flash 1107; Nano Banana Pro 1103, Nov 2025, $134. The top-1 and top-2 confidence intervals overlap (±9). The page does not state a snapshot date — [Artificial Analysis Text-to-Image Arena](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text)
- Midjourney, Adobe Firefly, Ideogram, Recraft, Scenario, Leonardo, and Layer did not appear in the top 15 of either arena page retrieved — [Arena](https://arena.ai/leaderboard/text-to-image); [Artificial Analysis](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text)
- [OLDER: Oct 2025] Tencent Hunyuan Image 3.0 briefly took #1 overall on the LMArena T2I board in Oct 2025, ahead of Seedream 4. This shows how quickly leadership turns over — [LMArena on X](https://x.com/arena/status/1974502371721162982)

**OpenAI GPT Image line**
- gpt-image-2 / ChatGPT Images 2.0 released 21 Apr 2026 in the API and Codex. It has a "thinking" or reasoning mode for paid tiers, up to 2K output, near-perfect multilingual text rendering, and up to 8 images per prompt with characters, objects, and style preserved across them. Reports say it took #1 in every Image Arena category within 12 hours, with a 242-Elo lead (single-source figure) — [TechWyse](https://www.techwyse.com/news/ai-search/openai-gpt-image-2-api-codex-launch); [Neurohive](https://neurohive.io/en/news/chatgpt-images-2-0-openai-launches-image-generation-model-with-reasoning-2k-resolution-and-multilingual-text/); [DataNorth](https://datanorth.ai/news/openai-launches-gpt-image-2-with-99-text-accuracy)
- GPT Image 2.5 released 8 Sep 2026 as two API variants. **Flare** (gpt-image-2.5-flare) is the default, reported higher quality than GPT Image 2 at about half the latency. **Sunburst** (gpt-image-2.5-sunburst) is slower and holds fine detail better for precise edits. Both are priced at the same token rates as GPT Image 2. Both support transparent backgrounds, output up to 3840px, and better preservation of reference subjects across repeated edits. These are third-party and provider pages. I found no primary OpenAI post — [Kanaries guide](https://docs.kanaries.net/articles/gpt-image-2-5); [fal.ai](https://fal.ai/gpt-image-2.5); [Grida docs](https://grida.co/docs/models/gpt-image-2.5)

**Google Nano Banana line**
- Nano Banana 2 (official name Gemini 3.1 Flash Image) launched 26 Feb 2026 and replaced Nano Banana Pro as the Gemini app default. It outputs 512px to 4K and keeps up to 5 characters and 14 objects consistent in one workflow. It is live in Search, Gemini, Lens, Flow, Ads, and the APIs — [NYU Shanghai RITS](https://rits.shanghai.nyu.edu/ai/google-launches-nano-banana-2-pro-quality-image-generation-at-flash-speed/)
- One third-party comparison gives 2K pricing of about $0.101 for Nano Banana 2 versus $0.134 for Nano Banana Pro — [Evolink](https://evolink.ai/de/blog/nano-banana-2-vs-pro-speed-quality-pricing-compared)
- Nano Banana 2.1 was announced 6 Oct 2026 and is rolling out in AI Mode, Flow, AI Studio, and **Google Stitch**. It is reported better than NB2 on visual design, mask-based editing, and subject consistency. Image output costs half of NB2 at shared resolutions, input tokens cost 3x, and there is no 512px tier or free API tier — [Jetstream](https://jetstream.blog/?p=225955); [Apidog](https://apidog.com/vi/blog/nano-banana-2-1/); [Digital Today](https://www.digitaltoday.co.kr/cn/view/111635/google-releases-nano-banana-21-with-4k-support-and-half-price). Contradicted by [DataLearner](https://www.datalearner.com/ai-models/pretrained-models/google-nano-banana-2-1), which calls it an unconfirmed rumor. Its presence on both arenas supports a real release.

**Midjourney**
- V8.0 alpha launched 17 Mar 2026. V8.1 was released on midjourney.com 30 Apr 2026 and is listed in official docs as the current release, about 4–5x faster, with native 2K "--hd" mode and better text and prompt adherence. Using it requires unlocking a V7/V8 Personalization Profile. Source: search snippet of official docs; a direct fetch returned 403 — [Midjourney docs](https://docs.midjourney.com/docs/models); [Framia review](https://framia.converge.ai/blog/midjourney-v8-review/)
- One third-party guide says Midjourney 8.2 became the default on 24 Jul 2026. Unverified against official docs — [VidMuse](https://vidmuse.ai/blog/midjourney-8-2)

**Black Forest Labs FLUX**
- FLUX.2 launched 25 Nov 2025 [OLDER]. It supports up to 4MP output, up to 10 reference images, and hex-color control. Tiers: klein 4B and 9B (Jan 2026), pro, flex, max, dev. Only klein-4B is Apache 2.0; dev-32B needs a commercial license. Third-party pricing is roughly $0.03 (Pro) to $0.07 (Max) per image. One guide says FLUX.2 trailed GPT Image 2 on arena Elo (1196 vs 1339, Aug 2026) but leads every open-weights size class — [InVideo](https://invideo.io/blog/flux-ai-image-generator/); [Moda](https://moda.app/resources/models/flux)
- FLUX 3 was announced 23 Jul 2026 as a multimodal model trained jointly on image, video, audio, and action. FLUX 3 Video (up to 20s with audio) and FLUX 3 Action are in gated early access. FLUX 3 Image was to roll out in the following weeks, and open-weight versions are planned for later in 2026 — [Let's Data Science](https://letsdatascience.com/news/black-forest-labs-releases-multimodal-flux-3-56455df8); [DataNorth](https://datanorth.ai/news/black-forest-labs-releases-flux-3). AA lists FLUX 3 Image at #8 (Oct 2026) — [Artificial Analysis](https://artificialanalysis.ai/text-to-image/arena/leaderboard-text)

**Game-specific platforms (style-locked generation)**
- Scenario: studios train private style models on their own art, with 15–50 reference images per style in one guide and 5–100 in another. It offers an API, a Unity plugin, and an MCP server, and aggregates many third-party image, video, 3D, and audio models. It reports 15,000+ customers, naming **Ubisoft, Unity, Scopely, InnoGames**. Free tier, paid from $29/month (secondary source) — [DataStudios](https://www.datastudios.org/post/scenario-custom-trained-ai-game-asset-generation-style-consistency-and-pricing-explained); [NeuronFeed](https://neuronfeed.com/startups/scenario)
- Layer.ai: custom models trained on studio art, export to Unity, Unreal, and Godot, and PSD export. It claims 300+ studios and 10,000+ users, naming **Zynga, SciPlay, Tripledot, Huuuge Games**, plus SSO/SCIM and no seat fees (vendor comparison page) — [Layer vs Scenario](https://www.layer.ai/vs/scenario)
- Unity's in-editor AI Generators ship Unity's own models plus third-party models from **Scenario, Inc. and Layer AI, Inc.**, with a proprietary tileable-texture model. Unity Muse is retired — [Unity AI Generators docs](https://docs.unity3d.com/Packages/com.unity.ai.generators@1.6/manual/index.html)

### Inferences
- For "best raw image quality and prompt adherence," the October 2026 answer is GPT Image 2.5 (Flare for throughput, Sunburst for detail-critical edits). It is also roughly 6x costlier per image than Nano Banana 2.1 on AA pricing ($210.7 vs $33.6 per 1k). For bulk asset ideation, Nano Banana 2.1, MAI-Image-2.6, or Meta Muse Image ($10/1k) are likely the better value.
- For a studio that needs everything on-model, a custom-trained or reference-conditioned pipeline (Scenario/Layer, FLUX.2 multi-reference, NB2 subject consistency) is likely more useful than the arena leader. Arena prompts are one-off and do not test consistency across a set.
- Midjourney's absence from both arenas most likely reflects that it has no public API on those boards, not low quality. I could not verify this.

### Gaps
- No official OpenAI blog post for GPT Image 2.5 was retrieved. The details come from API-provider pages.
- No independent benchmark measures game-specific needs such as consistency across 100+ assets, sprite-sheet coherence, or tileability.
- Adobe Firefly's current image model version and its 2026 arena standing were not found. Firefly's "commercially safe" training-data claim could not be re-verified for 2026.
- The image-edit arena leaderboard was not retrieved.

---

## Role 1: Art director / visual style consistency

### Takeaway
No AI system does art direction. The tools that help art directors most enforce a style they have already defined: custom-trained style models (Scenario, Layer), reference-conditioned generation (Midjourney style references and personalization profiles, FLUX.2's 10-reference conditioning, Nano Banana 2/2.1's multi-character and multi-object consistency, GPT Image 2's multi-image consistency), and in-engine generators that wrap those models (Unity AI). Studios using these keep humans as the final arbiters.

### Cited Findings
- SciPlay Senior Art Director Peter Franco (Goldfish Casino) uses AI for concept exploration, logos, single assets, and "progressive feature states" such as a farm growing in stages. SciPlay trains its own models and uses **Layer AI**. He says "AI never produces final game assets." Humans do photo-bashing, composition, color correction, and Unity draw-call optimization. He also says "AI might get some nice elements, but it might not solve the creative problem that you're there to solve." Style consistency is named as a deployment challenge without a solution. SciPlay runs bi-weekly AI training sessions — [Deconstructor of Fun, Feb 2026](https://www.deconstructoroffun.com/blog/2026/2/9/designing-games-in-the-age-of-ai)
- Scenario and Layer both sell private style-model training on a studio's own art, with Unity, Unreal, and Godot integrations — [DataStudios](https://www.datastudios.org/post/scenario-custom-trained-ai-game-asset-generation-style-consistency-and-pricing-explained); [Layer](https://www.layer.ai/vs/scenario)
- Nano Banana 2 keeps up to 5 characters and 14 objects consistent in one workflow. Nano Banana 2.1 claims better subject consistency and mask editing — [NYU RITS](https://rits.shanghai.nyu.edu/ai/google-launches-nano-banana-2-pro-quality-image-generation-at-flash-speed/); [Jetstream](https://jetstream.blog/?p=225955)
- FLUX.2 takes up to 10 reference images and exact hex colors, which is useful for locking palettes — [InVideo](https://invideo.io/blog/flux-ai-image-generator/)
- Midjourney V8.1 requires a V7/V8 personalization profile, Midjourney's per-user aesthetic-tuning mechanism — [Midjourney docs (search snippet)](https://docs.midjourney.com/docs/models)
- Epic's Fortnite team feeds hand-drawn sketches and Blender block-outs into "Nano Banana and GPT Image" to generate variations, with a custom genmedia bridge in Photoshop. AI is used only in the concept phase, and final assets are rebuilt by hand — [TweakTown](https://www.tweaktown.com/news/112228/epic-reveals-gen-ai-is-used-to-make-new-fortnite-concept-designs/index.html); [FRVR](https://frvr.com/blog/news/epic-games-confirms-fortnite-characters-skins-and-environments-are-now-being-made-with-ai-tools/)

### Inferences
- The practical art-director stack in 2026 is: define the style by hand (style guide plus a reference set), lock it into a custom model or reference pack, use AI for volume variation, and keep human approval and paintover. AI speeds up exploring and enforcing a style but does not create it.
- A shippable visual identity still depends on the human art director. AI output tends toward the "average" aesthetic that arenas reward, which works against a distinctive look.

### Gaps
- I found no quantitative study of style drift across large AI-generated asset sets, such as 500 icons or 200 props.
- I found no named AAA studio art director publicly describing a full style-model pipeline in 2026, apart from Epic (concept only) and SciPlay (social casino).

---

## Role 2: Concept artist (characters, environments, props)

### Takeaway
Concept and ideation is the most adopted visual-art use of gen AI in studios. It is also the most politically fraught. The best quality tools are GPT Image 2/2.5, Nano Banana 2/2.1, Midjourney V8.x, and FLUX.2/3, with Epic confirming Nano Banana and GPT Image use in Fortnite. Output is good enough for mood boards and variation passes at AAA quality. It is not a replacement for a concept artist's design problem-solving such as silhouette, function, or lore fit, and Larian publicly stopped using it for concept art after backlash.

### Cited Findings
- Epic confirmed generative AI is used for Fortnite skins and locations at the concept stage. Its workflow is hand sketch, then Blender scene, then Nano Banana / GPT Image variations, with final assets made by hand. Fans objected after the Chapter 7 update, which included AI-generated assets — [FRVR](https://frvr.com/blog/news/epic-games-confirms-fortnite-characters-skins-and-environments-are-now-being-made-with-ai-tools/); [TweakTown](https://www.tweaktown.com/news/112228/epic-reveals-gen-ai-is-used-to-make-new-fortnite-concept-designs/index.html)
- [OLDER: Dec 2025–Jan 2026] Larian CEO Swen Vincke told Bloomberg the studio used AI to explore ideas, develop concept art, and write placeholder text. After backlash he said in a Reddit AMA that Larian would refrain from using gen AI in concept-art development for Divinity "so there can be no discussion about the origin of the art," and no text generation touches dialogue — [VGC](https://www.videogameschronicle.com/news/holy-f-guys-were-not-replacing-artists-larian-boss-responds-to-ai-backlash); [Hitmarker](https://hitmarker.net/news/larian-confirms-that-it-will-no-longer-use-generative-ai-for-divinity-concept-art-and-writing-following-backlash-1615314); [Malay Mail, 10 Jan 2026](https://www.malaymail.com/news/tech-gadgets/2026/01/10/award-winning-baldurs-gate-studio-rejects-ai-art-for-new-divinity-project-amid-industry-backlash/204895)
- Pearl Abyss said AI tools "helped us rapidly explore tone and atmosphere" in early Crimson Desert iteration before some assets leaked into the shipped game — [Engadget, 22 Mar 2026](https://www.engadget.com/gaming/crimson-desert-developer-apologizes-and-promises-to-replace-ai-generated-art-183716439.html)
- The GDC 2026 State of the Industry survey (2,300+ respondents) found 36% use gen AI at work but only 30% of studio staff. The most common uses are research and brainstorming (81%) and prototyping (35%). 52% think gen AI harms the industry, up from 30% the year before — [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/); [BusinessWire](https://www.businesswire.com/news/home/20260129438528/en/2026-State-of-the-Game-Industry-Report-Reveals-Widening-Effect-of-Layoffs-Broader-Perspectives-on-Generative-AI-Unionization-Tariffs-and-More). A secondary source says only 19% of AI-using developers generate assets with it — [Cubix](https://www.cubix.co/blog/ai-in-game-development-how-studios-are-using-ai/)
- GPT Image 2 can output up to 8 consistent images per prompt (character turnarounds and variation sheets), and GPT Image 2.5 better preserves references across repeated edits — [Neurohive](https://neurohive.io/en/news/chatgpt-images-2-0-openai-launches-image-generation-model-with-reasoning-2k-resolution-and-multilingual-text/); [Kanaries](https://docs.kanaries.net/articles/gpt-image-2-5)

### Inferences
- On rendering polish, top models now match or exceed many professional concept paintings for mood and keyframe work. Concept art, though, is functional design: readable silhouettes, buildable parts, consistent rules across a faction. There, AI output still needs a skilled artist to curate, fix anatomy and logic, and design. The best fit is "AI as a variation generator under an artist's sketch," as Epic does, not prompt-only concept.
- For studios worried about provenance or community reaction, concept is where the reputational risk sits (Larian, Crimson Desert, Fortnite), even when nothing AI-made ships.

### Gaps
- I found no blind test comparing AI concept art against human concept artists judged by art directors.
- I could not confirm whether Epic's models are fine-tuned on internal Fortnite data. One secondary source claims this, and others name off-the-shelf Nano Banana and GPT Image.

---

## Role 3: 2D / illustration / sprite & pixel artist

### Takeaway
General 2D illustration (card art, key art, portraits) is the area where top models come closest to shippable quality, yet it is also where every 2026 backlash case originated. For pixel art, general models fail on true grid and palette constraints. The specialists **PixelLab** (animation, 4/8-direction rotation, tilesets, Aseprite plugin) and **Retro Diffusion** (grid-aligned, limited-palette, Aseprite extension, also on Scenario) are the recommended tools. Unity's AI Generators produce sprites and spritesheets in-editor.

### Cited Findings
- PixelLab offers skeleton animation, 4- and 8-direction rotation, tilesets, an Aseprite plugin, and an API, with paid plans from about $12/month and a 40-generation free trial. Retro Diffusion runs in Aseprite for a one-time $20 (Lite) or $65 (full). PixelLab, Retro Diffusion, Sprixen, and Sprite-AI produce output on a real pixel grid, while general image models need downscaling and cleanup. The guide was updated Sep 2026 and is written by a competing vendor — [Cinevva pixel-art guide](https://app.cinevva.com/guides/ai-pixel-art-generators)
- The Retro Diffusion models on Scenario were trained with experienced pixel artists and focus on grid-aligned, limited-palette output — [Scenario help center](https://help.scenario.com/articles/4202673551-retro-diffusion-models-the-essentials)
- Unity AI Generators create single sprites or spritesheets from prompts or reference images inside the editor, using Unity's own models plus Scenario and Layer models — [Unity AI Generators docs](https://docs.unity3d.com/Packages/com.unity.ai.generators@1.6/manual/index.html)
- GPT Image 2.5 supports native transparent backgrounds, which matters for sprites and cutouts — [fal.ai](https://fal.ai/gpt-image-2.5)
- 2D illustration is where shipped-AI controversies came from: Crimson Desert "2D visual props" (Mar 2026), 1666: Amsterdam demo portrait paintings and cover art (Jun 2026), and Clair Obscur background textures (Dec 2025) — [Engadget](https://www.engadget.com/gaming/crimson-desert-developer-apologizes-and-promises-to-replace-ai-generated-art-183716439.html); [StudioGlobal (lower-reliability)](https://www.studioglobal.ai/discover/answers/searching-for-what-happened-after-panache-digital-6a2a1f878f7e203b13825231); [Malay Mail](https://www.malaymail.com/news/tech-gadgets/2025/12/21/indie-game-awards-rescinds-honours-from-clair-obscur-expedition-33-for-genai-use/202718)

### Inferences
- Indie-quality static pixel sprites, icons, and tiles from PixelLab and Retro Diffusion are plausible after artist cleanup. Animated sprites at the polish of a professional pixel artist (for example Celeste or Dead Cells tier) are not, because frame-to-frame consistency and readable keyframes still need hand animation.
- For painted 2D (cards, portraits), a top model plus artist paintover can reach commercial quality. Players do detect AI hallmarks such as anatomy errors, text artifacts, and a generic aesthetic, so disclosure and backlash risk is the main constraint, not capability.

### Gaps
- I found no independent, non-vendor benchmark of PixelLab vs Retro Diffusion vs GPT Image for sprite animation.
- I found no named commercial studio publicly crediting PixelLab or Retro Diffusion in a shipped title.

---

## Role 4: 3D character modeler (topology/retopology, rigging-readiness)

### Takeaway
2026 image-to-3D tools (Meshy 6/7, Tripo P1.0/H3.1, Hyper3D Rodin Gen-2.5, Tencent Hunyuan3D 3.x, Microsoft TRELLIS.2) produce convincing textured characters in seconds to minutes, with quad and low-poly modes and auto-rigging. Their topology still lacks the deformation edge loops (face, shoulders, elbows) needed for animated hero characters. Consensus as of Sep 2026: auto-rigged AI meshes are fine for background or NPC crowds and blockouts. Hero characters still need human retopology, UV, and rigging.

### Cited Findings
- **Meshy**: Meshy 6 public preview Oct 2025, GA 18 Jan 2026, with Low Poly Mode, quad or triangle output chosen at generation time, and meshes up to about 600K faces. Later 2026 additions: Meshy 3D Agent beta (4 Jun), native 8K base color (22 Jul), multiview input with main view plus 3 auxiliary views (7 Aug), Meshy 6 Lite (Aug), and **Meshy 7** (12 Aug 2026, geometry alignment) — [Cinevva 3D timeline (updated 6 Sep 2026)](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026); [3D AI Studio](https://www.3daistudio.com/blog/hitem3d-vs-meshy-vs-tripo-comparison); [Cinevva Meshy 7 news](https://app.cinevva.com/hi/news/2026-08-14-meshy-7-geometry-alignment)
- Meshy 7.1 is listed by a reseller as a Sep 2026 model with tri or quad topology, symmetry, face-count control, PBR, and optional auto-rigging, at 172 credits per model (reseller price, unverified) — [Summer Engine](https://www.summerengine.com/models/meshy-7-1). Meshy 7 is also on Comfy Cloud — [Comfy](https://comfy.org/p/supported-models/meshy-7/)
- [OLDER: Aug 2025] Meshy 5 added multi-view input and 500+ animations for rigged characters — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- **Tripo (VAST)**: P1.0 (native 3D diffusion, low-poly in about 2s) and H3.1 (high detail) released 9 Mar 2026, with paid plans required for commercial use — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026). "Smart Mesh P1.0" produces structured quads in about 2–10s versus about 60s for Meshy 6 — [3D AI Studio](https://www.3daistudio.com/blog/hitem3d-vs-meshy-vs-tripo-comparison). An Indie Hackers tester ranks Tripo best for "game-ready topology, auto-rigging" — [Indie Hackers](https://www.indiehackers.com/post/best-ai-3d-model-generator-in-2026-i-tested-9-of-the-best-and-here-is-what-i-found-70ecab1a0a)
- Conflicting preference data: a Meshy-run comparison cites NetEase and Tencent artist blind tests preferring Meshy 6 over Tripo 3.1 63.8% of the time. This is vendor-sourced — [Meshy blog](https://www.meshy.ai/blog/hi3d-vs-meshy-vs-tripo)
- **Hyper3D Rodin**: Gen-2 (1 Oct 2025, 10B parameters, recursive part-based), Gen-2 Edit (31 Mar 2026, region-select text editing), Gen-2.5 (26 May 2026, raw output over 10M polygons, tri, quad, and "Smart Low-Poly" outputs, paid plans only) — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- **Tencent Hunyuan3D**: 3.0 (Sep 2025, hosted, 1536³ geometry, weights not released) and 3.1 (28 Jan 2026, hosted, 20 free generations per day). Hunyuan3D-Omni (Sep 2025, open) supports skeleton, point-cloud, and bbox control. Hunyuan3D-Part (Sep 2025, open) does part segmentation. The open Hunyuan3D 2.1 license excludes the EU, UK, and South Korea and caps at 1M MAU — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026). A "Hunyuan3D 3.5" with 8K PBR is claimed only on an unofficial site — [hunyuan3d.pro (unverified)](https://hunyuan3d.pro/)
- **Microsoft TRELLIS.2** (16 Dec 2025, MIT, 4B params, O-Voxel, native PBR base color, roughness, metallic, and opacity, 4096² textures, about 24GB VRAM, image-only input) is called "still the best model you can download and run" — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026); [3D AI Studio](https://www.3daistudio.com/blog/trellis-2-vs-hunyuan-3d-differences-explained)
- Rigging research: VAST UniRig (Apr 2025, MIT) predicts skeletons and skin weights. Meta SAM 3D Body (Nov 2025) produces parametric human meshes from a photo — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- Topology verdict: low-poly modes from Meshy, Tripo, and Rodin give evenly distributed quads or clean shells, but "none produce the concentrated edge loops a face or shoulder needs for deformation." Hero characters need a retopology pass, and auto-rigged AI meshes are fine for background characters only. Baked-in lighting in albedo is the most common texture defect — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- "You still need cleanup for hero assets, animation-heavy characters" — [BuildMVPFast (Sep 2026)](https://www.buildmvpfast.com/articles/best-llms-2026-guide/3d-modeling-ai); Hunyuan3D needs "GPU/infrastructure work, and manual cleanup" — [Blyth](https://blyth.ai/blog/best-ai-3d-model-generators-2026)
- Benchmarks: the 3D Arena (Hugging Face, image-to-3D pairwise) had 123,243 votes across 19 models as of its 2025 paper, but no current 2026 standings were retrievable — [3D Arena paper (2025)](https://arxiv.org/html/2506.18787v1). Pixazo's 2026 board (editorial or vision-judge scoring, not human votes) lists Hunyuan 3D Pro 1508, Rodin 2 1477, Meshy 6 Preview 1335, Rodin 2.5 1288, Tripo 2.5 1217 — [Pixazo](https://www.pixazo.ai/leaderboard/ai-3d-model-generation)

### Inferences
- Best picks by need. Rigged NPC or crowd characters: Meshy 7/7.1 (topology control plus auto-rig plus animation library) or Tripo P1.0 (speed, clean quads). Maximum sculpt detail to bake from: Rodin Gen-2.5 or Hunyuan3D 3.1. Self-hosted or on-prem for IP control: TRELLIS.2 (MIT). Hunyuan open weights carry EU/UK/Korea exclusions that matter for European studios.
- Versus a human character artist: AI output is roughly at the level of a high-poly sculpt starting point or a background NPC. It is not a hero-ready asset. AAA hero characters still need human retopo, UVs, facial topology, blendshapes, and rigging, so the realistic time savings sit in blockout and early sculpting.

### Gaps
- No independent, human-voted 3D arena standings for 2026 were found. The Hugging Face 3D Arena live board was not retrieved.
- Official Meshy 7/7.1 and Tripo P1.0 docs were not retrieved. Specs come from third parties.
- I found no shipped AAA game publicly confirmed to use AI-generated character meshes in final assets.

---

## Role 5: 3D environment / prop artist

### Takeaway
Static props are the most production-viable AI 3D use in 2026. One industry guide calls the static-prop pipeline "settled," with choice driven by license and cost rather than quality. Tripo P1.0, Meshy 6/7, Rodin Gen-2.5, Hunyuan3D 3.1, and TRELLIS.2 all produce usable props. Roblox Cube 3D and Unity's 3D Object Generator bring this into engines. Hero environment pieces, modular kits with exact grid snapping, and LOD and texel-density discipline still need artists.

### Cited Findings
- "Static props: the pipeline is settled" — once cleaned, the tool choice comes down to license and cost, not quality. Recommended web-game textures are 1K–2K (KTX2), not 8K — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- Unity AI open beta includes a **3D Object Generator** (static prefabs from text or image, announced 21 May 2026). Generators also cover materials, cubemaps, sprites, and textures. Unity 6.3 is a prerequisite for the Assistant — [Unity AI docs](https://docs.unity3d.com/Packages/com.unity.ai.generators@1.6/manual/index.html); [Unity AI Assistant docs](https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.1/manual/about/overview.html)
- [OLDER: Aug 2025] Unity 6.2 introduced AI tools and placed copyright liability on users — [Digital Production](https://digitalproduction.com/2025/08/22/unity-6-2-welcomes-ai-but-pace-caution-user-liability-on-copyright/)
- Roblox Cube 3D: announced and open-sourced Mar 2025 [OLDER], trained on Roblox meshes, used for prompt-to-mesh in Roblox Studio Assistant. 4D creation (objects that interact) reached public/open beta Feb 2026 with schemas "Car-5" (multi-mesh car) and "Body-1" (single mesh). 1.8M+ assets were generated by Apr 2026. One developer claims 64% longer playtime in *Wish Master* with 4D generation (single-dev figure) — [Roblox newsroom (2025)](https://corp.roblox.com/newsroom/2025/03/introducing-roblox-cube); [Roblox newsroom (Feb 2026)](https://about.roblox.com/de/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model); [Wikipedia: Cube 3D](https://en.wikipedia.org/wiki/Cube_3D); [TechCrunch (2025)](https://techcrunch.com/2025/03/17/roblox-releases-its-open-source-model-that-can-create-3d-objects-using-ai/)
- Rodin Gen-2 Edit (Mar 2026) allows region-select text edits of existing meshes, which helps prop variation — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- Tencent ARC Pixal3D (May 2026, MIT, pixel-aligned PBR; multi-view inference added Sep 2026) is a newer open option — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- Crimson Desert's AI-made 2D props shipped by accident and are being replaced. This shows prop-level AI is in AAA pipelines as placeholders — [Engadget](https://www.engadget.com/gaming/crimson-desert-developer-apologizes-and-promises-to-replace-ai-generated-art-183716439.html)

### Inferences
- For indie and mobile games, AI-generated background props (crates, rocks, furniture, debris) can likely reach shippable quality after decimation, UV checks, and de-lighting textures. For AAA, they work as blockout and kitbash sources, while final hero props, modular architecture, and anything needing strict texel density, trim sheets, or exact LODs remain human work.
- Baked lighting in AI albedo and inconsistent texel density are the most likely problems when AI props sit next to hand-made assets.

### Gaps
- I found no studio postmortem quantifying hours saved on props with AI 3D in a shipped title.
- No 2026 data on Roblox Cube versions after Feb 2026 was found.

---

## Role 6: Texture / material artist (PBR maps)

### Takeaway
The AI material space has fragmented rather than consolidated. Adobe's Substance 3D Sampler **removed its Generative AI panel** in version 6.0 (2026), shifting focus to OpenPBR and capture hardware. The 2026 options are 3D-texture painters inside image-to-3D tools (Meshy's PBR painting onto existing UVs, native 8K), standalone tileable-material generators (Polycam material generator, Unity's proprietary tileable-texture model, open-source Material Maker), and Firefly-era Text to Texture [2024]. AI materials are fine for indie and background surfaces. AAA material artists still author in Substance Designer/Painter.

### Cited Findings
- Substance 3D Sampler 6.0 release notes list as removed: "Remove 3D capture menu item," **"Remove Generative AI panel,"** and "Remove shader settings." New features are OpenPBR support, material presets (fuzz, translucency, clear coat), a redesigned Properties panel, and one-click HP Z Captis capture. Page last updated 24 Sep 2026 (patch 6.0.4). No reason is given for the removal — [Adobe Experience League](https://experienceleague.adobe.com/en/docs/substance-3d-sampler/using/release-notes/version-6-0)
- [OLDER: Mar 2024] Adobe first brought Firefly into Substance 3D: Sampler "Text to Texture" (tileable textures) and Stager "Generative Background," with Sampler's Image to Material producing normal, height, and roughness maps — [Adobe blog (2024)](https://blog.adobe.com/en/publish/2024/03/18/adobe-announces-firefly-powered-features-substance-3d-apps)
- Meshy paints full PBR sets (base color, normal, roughness, metallic) onto a model's existing UVs but is not built for standalone tileable materials. Polycam's material generator produces seamless base color, normal, roughness, and height maps. Material Maker is free and open-source (Sep 2026 guide, vendor-authored) — [Cinevva texture guide](https://app.cinevva.com/guides/ai-texture-generators)
- Meshy native 8K base color textures launched 22 Jul 2026 — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- Unity's AI Generators include materials generated from prompts with associated texture maps, plus Unity's own proprietary tileable-texture model — [Unity AI Generators docs](https://docs.unity3d.com/Packages/com.unity.ai.generators@1.6/manual/index.html)
- TRELLIS.2 outputs native PBR (base color, roughness, metallic, opacity) up to 4096² — [3D AI Studio](https://www.3daistudio.com/blog/trellis-2-vs-hunyuan-3d-differences-explained)
- Baked-in lighting in albedo is the most common texture defect across AI 3D tools — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- AI textures are the asset class most often caught in shipped games. Clair Obscur: Expedition 33's placeholder background textures led the Indie Game Awards to revoke GOTY and Debut Game in Dec 2025, and they were patched out within days — [Malay Mail (Dec 2025)](https://www.malaymail.com/news/tech-gadgets/2025/12/21/indie-game-awards-rescinds-honours-from-clair-obscur-expedition-33-for-genai-use/202718); [Push Square](https://www.pushsquare.com/news/2025/12/ps5-fave-expedition-33-stripped-of-indie-game-awards-but-not-for-the-reasons-you-may-think)

### Inferences
- Adobe pulling generative AI out of Sampler is a notable signal: the incumbent professional material tool chose not to keep gen-AI material creation front and center in 2026. The reason is unknown and could be quality, licensing, or customer sentiment.
- Height and normal maps inferred from a single image are approximations. For AAA surfaces that need physically plausible roughness response and procedural variation, human-authored Substance Designer graphs remain the standard. AI tileables are adequate for indie and background use and for look-dev.

### Gaps
- I could not confirm whether Substance 3D Painter or Designer gained or lost AI features in 2026, or whether Text to Texture survives elsewhere.
- I found no independent quality comparison of AI-generated PBR maps against scanned or procedural ground truth.
- No 2026 info on "Poly" (withpoly) was found.

---

## Role 7: UI/UX artist & designer (HUD, menus, icons)

### Takeaway
The general UI-generation tools are Google Stitch (now with Nano Banana 2.1, strongest for multi-screen 0-to-1 exploration) and Figma Make (stronger for refinement, design systems, and prototyping). Neither is game-HUD specific. For game UI art, GPT Image 2/2.5 (near-perfect text, transparent backgrounds) and Recraft V4 Vector (native SVG icons, $0.08/image) are the most useful generators, and Unity has an in-editor UI Generator. Game UX (readability during play, controller navigation, information hierarchy) remains human design work.

### Cited Findings
- Stitch "dominates the 0-to-1 innovation stage, creating ten concepts in minutes," while Figma dominates "1-to-100 refinement" with production design systems. Multi-screen generation is a major Stitch strength — [NxCode 2026](https://www.nxcode.io/ar/resources/news/google-stitch-vs-figma-ai-design-comparison-2026). [OLDER: Nov 2025] "Figma Make still leads for designers" on prototypes, interactions, and connected data — [Lilys](https://lilys.ai/es/notes/design-with-canva-20251118/google-stitch-vs-figma-make-ai-ui)
- Nano Banana 2.1 is integrated into Google Stitch (Oct 2026) — [Jetstream](https://jetstream.blog/?p=225955)
- Unity AI open beta includes a UI Generator for building interfaces inside Unity — [Unity blog](https://unity.com/de/blog/unity-ai-ui-generator)
- Recraft V4 Vector (released 13 May 2026) outputs SVG for icons and logos at $0.08 per image, up to 6 per request. Recraft claims V4.1 holds consistent style across 8-icon sets as editable vectors, while Ideogram output is raster-only (vendor claims) — [OpenRouter](https://openrouter.ai/recraft/recraft-v4-vector); [Recraft vs Ideogram](https://www.recraft.ai/blog/recraft-vs-ideogram)
- GPT Image 2 is marketed with "99% text accuracy" and multilingual text including CJK, Arabic, Hindi, and Bengali, which is relevant for localized UI mockups — [DataNorth](https://datanorth.ai/news/openai-launches-gpt-image-2-with-99-text-accuracy); [Neurohive](https://neurohive.io/en/news/chatgpt-images-2-0-openai-launches-image-generation-model-with-reasoning-2k-resolution-and-multilingual-text/)
- SciPlay uses AI for logo development. The article notes legibility for older players as a key UI constraint — [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2026/2/9/designing-games-in-the-age-of-ai)
- Game-HUD-specific AI guidance comes almost entirely from vendor blogs, for example one recommending HUD mockups to catch contrast and clipping problems early — [Sorceress (vendor)](https://sorceress.games/blog/nest-an-ai-ui-generator-hud-panel-pack-2026)

### Inferences
- Icon sets (inventory, abilities, achievements) are the UI art most likely to reach shippable quality with AI, especially vector (Recraft) or style-locked (Scenario/Layer) generation. Indie mobile and casual studios are already in this space.
- HUD and menu art can be mocked up fast, but the outputs are static images. Implementation in UMG, UI Toolkit, or Noesis, 9-slicing, state variants, and accessibility testing remain manual. Stitch and Figma Make generate web or app code, not game-engine UI.

### Gaps
- I found no documented case of Figma Make or Stitch used in a shipped game's HUD pipeline.
- No 2026 Ideogram version or pricing was confirmed. "Ideogram 4" is mentioned only in a Recraft comparison.

---

## Role 8: VFX artist (particles, effects)

### Takeaway
VFX is the least AI-served visual role. No mainstream production tool generates complete real-time effects. The available options are early agents that write Niagara systems from prompts (Aura VFX Agent, alpha; MCP-style "AI Niagara" extensions), a research system (ParticleGen, Aug 2026), and an Unreal Fab plugin that generates flipbook sprite sheets via OpenAI image models. Real-time VFX timing, readability, and performance budgets remain human craft.

### Cited Findings
- ParticleGen (arXiv cs.GR 2608.00629, Aug 2026) is a multi-agent system that generates editable UE5 Niagara particle effects from text. It plans, parameterizes, and refines from rendered feedback, was tested on spells, natural phenomena, and fireworks, and includes artifact diagnosis — [GameDev.net summary](https://gamedev.net/news/4871-particlegen-a-multi-agent-system-for-particle-effects-generation/)
- Aura VFX Agent creates Niagara systems, including materials and textures, from natural language. It is alpha, with limited support before UE 5.6, and has generated custom HLSL modules since v0.13.7 — [Aura docs](https://www.tryaura.dev/documentation/vfx-agent)
- "AI Niagara" is a 3-tool UE 5.5+ extension (list assets, inspect emitters, spawn components) that requires UnrealMCP — [ai-game.dev docs](https://ai-game.dev/docs-md/extensions-unreal-niagara.md)
- The "AI Flipbook Generator" UE5 plugin on Fab wraps OpenAI image models to paint 4x4, 6x6, or 8x8 flipbooks with a gutter-locked grid mask via the edits endpoint, then bakes them to a texture, material instance, and Niagara system. It takes about 2 minutes per effect, with camera-facing sprite and top-down decal presets (vendor listing, no reviews) — [Fab listing](https://www.fab.com/listings/695f3e5d-3aae-4ed8-9720-a4f65f9fe4ac)

### Inferences
- AI can help a VFX artist with texture elements (smoke, fire, and magic flipbooks, noise textures) and with scaffolding Niagara graphs. Game-quality effects still need hand timing, shaping, color scripting, and overdraw and performance tuning, so output from these tools is at best a prototype.
- Video models (FLUX 3 Video and others) could in principle generate flipbook sources, but I found no documented production use.

### Gaps
- No studio case study of AI-generated VFX in a shipped game was found.
- No Unity VFX Graph or Godot generative tool was found. I could not confirm whether one exists.
- I found no info on JangaFX (EmberGen) adding AI features in 2026.

---

## Role 9: Level art / world building (including generative world models)

### Takeaway
World models are not production level-art tools in October 2026. Google DeepMind's Genie 3 (Aug 2025) is available only as the Project Genie research prototype (Google AI Ultra, US, 60-second sessions). Google says it is not designed to make games. World Labs Marble 1.1 / 1.1 Plus (Apr 2026) is the most pipeline-compatible option, exporting Gaussian splats (SPZ/PLY), collider meshes, and visual meshes to Unreal, Unity, Blender, and Houdini. Its mesh topology is "still maturing," so it suits previs and blockout. Odyssey-3, Decart, and Microsoft Muse/WHAM are research or platform plays, not level-art tools.

### Cited Findings
**Google DeepMind Genie**
- Genie 3 was released Aug 2025 [OLDER], with higher-resolution worlds and multiple minutes of visual consistency — [Wikipedia: Genie](https://en.wikipedia.org/wiki/Genie_(world_model))
- Project Genie is a research prototype built from Genie 3, Nano Banana Pro, and Gemini. It rolled out 29 Jan 2026 to US adult Google AI Ultra subscribers with 60-second session limits — [Let's Data Science](https://letsdatascience.com/news/deepmind-opens-project-genie-for-interactive-worlds-eb2fec7e); [YourStory](https://yourstory.com/ai-story/google-deepmind-project-genie-launch). One source gives a conflicting date of 23 Jun 2026.
- "Google has clarified that Project Genie was not designed to make video games" — [HotHardware](https://hothardware.com/news/google-deepmind-launches-project-genie)
- No "Genie 4" announcement was found as of Oct 2026 — [Wikipedia: Genie](https://en.wikipedia.org/wiki/Genie_(world_model))

**World Labs Marble**
- Marble 1.1 and 1.1 Plus were released 2 Apr 2026. 1.1 is the new default with better fidelity, and 1.1 Plus adds automatic spatial expansion for larger environments in one pass — [NYU RITS](https://rits.shanghai.nyu.edu/ai/world-labs-releases-marble-1-1-auto-expanding-3d-world-generation); [MoguraVR](https://www.moguravr.com/?p=307971)
- The World API (Jan 2026) generates navigable 3D environments programmatically, including for game environments. World Labs raised $1B in Feb 2026 from investors including NVIDIA, AMD, and Autodesk — [Sacra](https://sacra.com/c/world-labs/); [NYU RITS](https://rits.shanghai.nyu.edu/ai/world-labs-releases-marble-1-1-auto-expanding-3d-world-generation)
- Exports: Gaussian splats SPZ or PLY (about 2M or 500K splats), a collider GLB (about 100–200k triangles), and a visual GLB (about 600k textured triangles or about 1M vertex-colored). Targets are Unreal, Unity, Blender, and Houdini, and the open-source Spark library renders splats in Three.js (Aug 2026 blog; secondary) — [InVideo](https://invideo.io/blog/world-labs-marble-3d-worlds/); [Radiance Fields](https://radiancefields.com/world-labs-formally-launches-marble-a-generative-world-model)
- One analysis says splat export suits visualization "but not for real-time game engines." Mesh export "is still maturing in topology quality," and for production-tomorrow needs, text-to-3D tools are "the pragmatic choice" — [Metavert](https://metavert.io/world-labs-vs-text-to-3d)

**Other world models**
- Odyssey-3 launched 15 Sep 2026 as a general-purpose world model (robots, vehicles, games), with demos carrying gaming policies between GTA V and RDR2 — [Dealroom](https://app.dealroom.co/news/note/odyssey-launches-odyssey-3-world-model)
- Microsoft Muse (WHAM) [OLDER: introduced Feb 2025] is "a generative model of a video game" that produces visuals, controller actions, or both, and is positioned for gameplay ideation, not asset production. A Microsoft Research WHAM news page dated 23 Sep 2026 says the WHAM team moved into the Microsoft.AI product group. A search summary also mentioned a Nature publication dated May 2026, which I could not verify — [Microsoft Research blog](https://www.microsoft.com/en-us/research/blog/introducing-muse-our-first-generative-ai-model-designed-for-gameplay-ideation/); [Microsoft Research WHAM news](https://www.microsoft.com/en-us/research/project/wham/news-and-awards/)
- Decart raised about $300M (Series C, May 2026, about $4B valuation, Radical Ventures lead). Its Oasis line has shifted toward physical AI and robotics, and "Lucy" is pitched as a sub-30ms interactive world model — [The Next Web](https://thenextweb.com/news/decart-300-million-radical-ventures-world-models); [Signals Inbox](https://signalsinbox.com/blogs/news/world-models-top-startups)
- Roblox 4D generation (Cube) entered public beta Feb 2026 for in-game object generation, which is generative world-building inside a live platform — [Roblox newsroom](https://about.roblox.com/de/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model)

### Inferences
- Pixel-generating world models (Genie, Odyssey, Decart) output video frames, not editable levels. They cannot hand a level designer collision, navmesh, gameplay metrics, or streaming-friendly assets, so they are at most previs or pitch tools. Marble is closer to usable because it outputs meshes and splats, but as of Oct 2026 it is suitable for concept, previs, and background vistas, not playable shipped levels.
- For practical AI level art in 2026, the more reliable path is AI props (Role 5) placed by humans or procedural tools (Houdini, PCG) inside conventional engines.

### Gaps
- No primary DeepMind source on Genie developments after Project Genie (for example a Genie 3.5 or 4) was found.
- No named game studio shipping Marble-derived environments was found.
- Dynamics Lab (Mirage) 2026 status was not found.

---

## Where AI art falls short (consistency, topology, art direction, provenance, platform rules)

### Takeaway
The main gaps in 2026 are consistency at scale across hundreds of assets, deformation-ready topology, baked lighting and texel discipline in AI 3D, the absence of genuine art direction, and above all provenance and reputation. Steam disclosures are now on about 31% of 2026 releases, and award bodies and players punish undisclosed AI content. The industry is also turning against AI: 52% of GDC 2026 respondents say gen AI harms the industry.

### Cited Findings
- Topology: no AI tool produces deformation edge loops, hero characters need retopology, and auto-rigging suits background characters only. Baked albedo lighting is the most common defect — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026)
- Consistency and creative problem-solving: AI "might not solve the creative problem," never produces final assets at SciPlay, and style consistency is an open challenge — [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2026/2/9/designing-games-in-the-age-of-ai)
- Steam rules: Valve's 16 Jan 2026 rewrite narrowed disclosure to AI used to create in-game or marketing assets. Developer efficiency tools such as code assistants are exempt. Pre-generated and live-generated content are distinguished, and live-generated adult sexual content is barred — [VGC](https://videogameschronicle.com/news/valve-has-significantly-rewritten-steams-rules-for-how-developers-much-disclose-ai-use); [Legal Moves](https://legalmoveslawfirm.com/steam-ai-policy/)
- Steam disclosure rates from Sulka Haro's census of about 53,600 releases: 10.9% of 2024 releases, 19.9% of 2025, and **30.8% of 2026 releases through July**. A projection suggests about half of all Steam games could be AI-flagged by 2027–2028. 22% of significant-revenue AI games added the flag after release — [PC Gamer](https://www.pcgamer.com/gaming-industry/steam-week-in-review-take-cover-because-it-looks-like-more-than-half-of-steam-games-will-have-an-ai-disclosure-by-2027-2028/). A lower estimate of about 1 in 5 (different denominator) comes from [Tech-Insider](https://tech-insider.org/steam-ai-disclosure-2026)
- Sentiment: 52% of 2,300+ GDC 2026 respondents see gen AI as negative for the industry, up from 30% (2025) and 18% (2024). Only 30% of studio staff use it, versus 58% at publishers and support firms — [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)
- Provenance and legal: Unity's terms place copyright liability for AI output on users [OLDER: Aug 2025] — [Digital Production](https://digitalproduction.com/2025/08/22/unity-6-2-welcomes-ai-but-pace-caution-user-liability-on-copyright/). Open 3D weights carry territorial and MAU restrictions (Hunyuan3D 2.1 excludes the EU, UK, and South Korea and caps at 1M MAU), and FLUX.2 [dev] requires a commercial license — [Cinevva timeline](https://app.cinevva.com/guides/ai-3d-model-generation-timeline-2026); [InVideo](https://invideo.io/blog/flux-ai-image-generator/)
- Detection is unreliable both ways. Studios struggle to prove assets are human-made, and a developer was falsely accused of AI use (Apr 2026) — [Plagiarism Today](https://www.plagiarismtoday.com/2026/04/07/game-developer-falsely-accused-of-using-ai/); [VG Times](https://vgtimes.com/articles/168308-ai-in-games-backlash-boycotts.html)
- Placeholder leakage is a recurring failure: AI placeholders shipped in Clair Obscur (Dec 2025), Crimson Desert (Mar 2026), and 1666: Amsterdam (Jun 2026 demo) — [Malay Mail](https://www.malaymail.com/news/tech-gadgets/2025/12/21/indie-game-awards-rescinds-honours-from-clair-obscur-expedition-33-for-genai-use/202718); [Engadget](https://www.engadget.com/gaming/crimson-desert-developer-apologizes-and-promises-to-replace-ai-generated-art-183716439.html); [StudioGlobal](https://www.studioglobal.ai/discover/answers/searching-for-what-happened-after-panache-digital-6a2a1f878f7e203b13825231)

### Inferences
- The biggest practical risk for a studio is not quality but asset tracking. Without provenance tagging in the asset pipeline, AI placeholders leak into shipped builds, as happened three times in about 6 months among notable titles. Studios that use AI for ideation need asset-management rules that flag AI-derived files.
- On quality: across roles, AI output is closest to shippable in static 2D illustration, icons, and background props, and furthest in animated characters, VFX, UX, and coherent level design.

### Gaps
- I found no 2026 court ruling specifically on AI-generated game art copyrightability.
- Console platform (Sony, Nintendo, Microsoft) AI-content policies for 2026 were not found.
- I found no data on how AI disclosure affects Steam sales or wishlists.

---

## Documented studio usage and backlash (2024–2026)

### Takeaway
Named studio usage in 2026 is mostly concept and ideation (Epic/Fortnite with Nano Banana and GPT Image, Pearl Abyss early iteration, SciPlay with Layer, Ubisoft, Scopely, and InnoGames as Scenario customers, Zynga, Tripledot, and Huuuge as Layer customers). The major AAA-adjacent controversies, Clair Obscur, Crimson Desert, Neverness to Everness, 1666: Amsterdam, and Fortnite Chapter 7, were mostly about AI art that shipped or was presented to players. Several studios (Larian, Capcom, NCSoft) made public "no AI in final assets" commitments.

### Cited Findings
- **Clair Obscur: Expedition 33 (Sandfall Interactive)** [Dec 2025]: the Indie Game Awards revoked Game of the Year and Debut Game two days after the ceremony over AI-generated placeholder background textures present at launch. The textures were patched out within days. The studio had told the IGA no gen AI was used, and the IGA said post-launch removal does not restore compliance — [Malay Mail](https://www.malaymail.com/news/tech-gadgets/2025/12/21/indie-game-awards-rescinds-honours-from-clair-obscur-expedition-33-for-genai-use/202718); [Push Square](https://www.pushsquare.com/news/2025/12/ps5-fave-expedition-33-stripped-of-indie-game-awards-but-not-for-the-reasons-you-may-think)
- **Crimson Desert (Pearl Abyss)** [Mar 2026]: AI-made 2D props shipped. The studio apologized on 22 Mar 2026, began an audit, is replacing them via patches, and added a Steam disclosure ("generative AI technology is used in a supplementary capacity during the creation of some 2D prop assets") — [Engadget](https://www.engadget.com/gaming/crimson-desert-developer-apologizes-and-promises-to-replace-ai-generated-art-183716439.html); [G2A News](https://www.g2a.com/news/latest/crimson-desert-ai-art-controversy-explained-pearl-abyss-responds/)
- **Neverness to Everness (Hotta Studio)** [May 2026]: players accused it of using AI art and video. VTuber Ironmouse ended her partnership, saying she had been told there would be no gen-AI assets — [Wikipedia: NTE](https://en.wikipedia.org/wiki/Neverness_to_Everness); [NTE Guide timeline](https://nteguide.com/en/blog/nte-ai-art-controversy-timeline/)
- **1666: Amsterdam (Panache Digital Games)** [Jun 2026]: demo portrait paintings, cover art, and marketing were identified as AI-generated. The studio said "early versions of AI-generated assets slipped into the prologue" (lower-reliability source) — [StudioGlobal](https://www.studioglobal.ai/discover/answers/searching-for-what-happened-after-panache-digital-6a2a1f878f7e203b13825231)
- **Fortnite (Epic)** [2026]: Epic confirmed gen AI (Nano Banana, GPT Image) in skin and location concepting after fans flagged AI-looking assets in Chapter 7. Epic also said Unreal Engine 6 will use LLMs and generative models as core pieces — [FRVR](https://frvr.com/blog/news/epic-games-confirms-fortnite-characters-skins-and-environments-are-now-being-made-with-ai-tools/); [TweakTown](https://www.tweaktown.com/news/112228/epic-reveals-gen-ai-is-used-to-make-new-fortnite-concept-designs/index.html); [Gfinity](https://www.gfinityesports.com/article/fortnites-ai-revelation-proves-epic-is-prioritizing-speed-over-soul)
- **Larian** [Dec 2025–Jan 2026]: walked back AI concept-art use for Divinity after backlash — [VGC](https://www.videogameschronicle.com/news/holy-f-guys-were-not-replacing-artists-larian-boss-responds-to-ai-backlash); [Hitmarker](https://hitmarker.net/news/larian-confirms-that-it-will-no-longer-use-generative-ai-for-divinity-concept-art-and-writing-following-backlash-1615314)
- **Capcom** [Oct 2026]: says it will not put AI-generated assets into finished games but will use AI to speed up production. The Resident Evil demo backlash partly involved visuals that looked upscaled rather than confirmed gen AI (lower-reliability source) — [Tech-Insider](https://tech-insider.org/capcom-ai-backlash-resident-evil-re-engine-response-2026/)
- **AION 2 (NCSoft)** [Oct 2026]: says about 99.9% of artwork is by human artists, in response to backlash — [GamingHQ](https://gaminghq.eu/2026/10/09/aion-2-ai-backlash-gaming-community)
- **SciPlay**: Layer AI with custom models for concept, logos, and feature states, with humans finalizing — [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2026/2/9/designing-games-in-the-age-of-ai)
- Platform customers (vendor-reported): Scenario lists Ubisoft, Unity, Scopely, and InnoGames — [DataStudios](https://www.datastudios.org/post/scenario-custom-trained-ai-game-asset-generation-style-consistency-and-pricing-explained). Layer lists Zynga, SciPlay, Tripledot, and Huuuge Games — [Layer](https://www.layer.ai/vs/scenario). Meshy cites NetEase and Tencent artists in blind tests — [Meshy blog](https://www.meshy.ai/blog/hi3d-vs-meshy-vs-tripo)

### Inferences
- The industry norm by late 2026: AI is acceptable to many studios internally for ideation and placeholders, but publicly unacceptable in final art without disclosure. AAA studios are converging on "AI for exploration, humans for final" statements (Epic, Capcom, Larian, NCSoft). Mobile and casual studios (SciPlay, Zynga, Tripledot via Layer) appear more open about AI-assisted production.
- Players and award bodies judge whether AI content is present, regardless of whether it was intended.

### Gaps
- I could not verify a reported Capcom prototype using Gemini and Imagen to draft background objects (seen only in a secondary summary without a pinned URL).
- No reliable 2026 information was found on Embark (Arc Raiders) visual-art AI use. Its known controversy concerns AI voices, which are outside this scope.
- I did not find original IGN interview text for Epic's claims, or confirmation of whether Epic's models are trained on internal assets.
