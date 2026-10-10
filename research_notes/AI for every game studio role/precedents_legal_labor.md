# AI-Heavy Game Studios: Precedents, Adoption Data, and Legal/IP/Labor/Platform/Player Constraints (as of October 2026)

Research note: compiled 10 Oct 2026. The shared web-search budget ran out partway through, so some threads (a16z / Totally Human surveys, Apple App Store rules, the outcome of the Getty appeal, Disney v. Midjourney in 2026, Sony v. Suno/Udio, Tencent/miHoYo specifics, Microsoft Muse in 2026) could not be checked. They are listed under Gaps. Dates are given for everything. Anything from before 2026 is labelled as background.

---

## 1. Industry adoption: what do the latest surveys say?

### Takeaway
How many developers use generative AI depends heavily on how the question is asked. Use for any task is near-universal: Unity reports about 95% and Google Cloud/Harris 87% using "AI agents". Personal use of gen-AI tools at work is a minority: GDC 2026 puts it at 36%, and at only 30% inside game studios. Most use is back-office work (brainstorming, code assistance, email), not shipped content. Developer sentiment is getting worse fast: 52% now say gen AI is hurting the industry, up from 18% two years earlier.

### Cited Findings
**GDC 2026 State of the Game Industry (published Jan 29, 2026; more than 2,300 industry professionals; fieldwork dates not stated)**
- 36% of professionals use gen-AI tools in their jobs. The figure is 30% at game studios and 58% at publishers, support/QA-type teams and marketing/PR firms. Business professionals are at 58%. — [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/); [BusinessWire release](https://www.businesswire.com/news/home/20260129438528/en/2026-State-of-the-Game-Industry-Report-Reveals-Widening-Effect-of-Layoffs-Broader-Perspectives-on-Generative-AI-Unionization-Tariffs-and-More)
- Tools: ChatGPT 74%, Google Gemini 37%, Microsoft Copilot 22%. Uses: research/brainstorming 81%, daily tasks such as email 47%, code assistance 47%, prototyping 35%. — [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)
- A third-party analysis puts asset generation at about 19% of users and player-facing features at about 5%. These are not GDC's own published figures. — [Ziva blog](https://ziva.sh/blogs/gdc-2026-generative-ai-game-development-data)
- 52% say gen AI is having a negative impact on the industry, up from 30% (2025 report) and 18% (2024). Only 7% say it is positive, down from 13%. The most negative disciplines are visual/technical art (64%), game design/narrative (63%) and programming (59%). Executives and business operations are the most positive, at 19% each. — [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/); [GamesBeat](https://gamesbeat.com/state-of-game-industry-survey-sheds-light-on-layoffs-genai-views-unionization-and-tariffs-gdc-survey/)
- One outlet says 52% reported gen AI is used at their company while only 36% use it personally. This may mix in the 2025 report's 52% "company uses gen AI" figure. — [AOL](https://www.aol.com/articles/generative-ai-gaming-facing-pushback-120100355.html); 2025 figure per [VGC](https://www.videogameschronicle.com/news/valve-has-significantly-rewritten-steams-rules-for-how-developers-much-disclose-ai-use)
- **Background, GDC 2025 report:** 52% said their companies used gen-AI tools. 9% said their companies were interested, down from 15%. 27% said their companies had no interest, up 9 points. — [VGC](https://www.videogameschronicle.com/news/valve-has-significantly-rewritten-steams-rules-for-how-developers-much-disclose-ai-use)
- Labor context in the same survey: 28% were laid off in the past two years (33% in the US). Half said their employer had layoffs in the past 12 months. Two-thirds of AAA respondents reported layoffs at their company. — [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)

**Google Cloud / The Harris Poll (background, 2025; 615 developers in the US, South Korea, Norway, Finland and Sweden; late June to early July 2025)**
- 87% of developers use AI agents to streamline or automate tasks, per Reuters as syndicated. Decrypt frames the 87% more narrowly, as agents that adapt to players. — [Decrypt](https://decrypt.co/335721/ai-agents-taking-over-game-development?amp=1); [KitGuru](https://www.kitguru.net/gaming/joao-silva/google-study-shows-87-of-game-devs-use-ai-now/)
- About 44% use agents to optimize content and process information. 94% expect AI to cut overall development costs in the long run. About 1 in 4 find AI ROI hard to measure. About 63–64% have data-ownership concerns, with the figure varying by outlet. — [Jordan News](https://www.jordannews.jo/Section-129/Technology/Study-Nearly-90-of-Video-Game-Developers-Use-Artificial-Intelligence-44221); [Mezha](https://mezha.ua/en/news/90-percent-videogame-devs-using-ai-304151/)
- Note: this is a vendor-commissioned survey. I did not locate the primary Google Cloud report; the figures come from Reuters syndication.

**Unity 2026 Game Development Report (published Mar 9, 2026; Cint survey of 300 developers in 2025, plus Unity telemetry from about 5M developers)**
- The most common back-end AI uses are coding assistance (62%) and writing/narrative (44%). The top benefits are efficiency (73%) and better decision-making (62%). 50% use MCP servers, mostly for engine/editor connectivity (90%) and production/project management (74%). Unity: "Studios are taking a prudent approach to AI tools." — [Unity blog](https://unity.com/blog/2026-unity-game-development-report-trends)
- Median Unity project development time fell 77%, from 91 to 21 hours, between Jan 2022 and Dec 2025. 52% prioritize smaller-scale projects to reduce risk. — [Unity blog](https://unity.com/blog/2026-unity-game-development-report-trends)
- About 95% report some AI adoption (only about 5% "do not use AI"). This comes from secondary summaries, not the Unity blog. — [Wccftech](https://wccftech.com/unity-2026-game-development-report-points-to-smaller-teams-making-games-in-less-time-with-ai/amp/); [Digital Today](https://www.digitaltoday.co.kr/jp/view/38784/unity-releases-2026-game-development-report)

### Inferences
- Everyday productivity use (brainstorming, code assistance) is mainstream. Using gen AI to make shipped creative content (art, voice, writing) is still a minority practice and the most contested one. A studio that is "mostly AI" across content roles would be a clear outlier compared with the industry norm.
- The split between executives and practitioners (19% positive among executives vs. 59–64% negative among artists, designers and programmers) points to likely internal resistance and retention risk in any AI-first restructuring.

### Gaps
- The a16z Games survey and the Totally Human survey could not be found before the search budget ran out. Their figures are not included.
- GDC 2026 fieldwork dates are not stated. Unity's 95% figure comes only from secondary outlets.

---

## 2. Precedents: AI-first or AI-heavy studios and games, and what happened

### Takeaway
No major hit has been made "mostly by AI." The precedents are of three kinds:
- **Large publishers announcing AI-first restructurings:** Krafton, Square Enix, EA, Nexon, Ubisoft. These come with layoffs, hiring freezes and staff anxiety.
- **Successful games that used AI selectively** (Arc Raiders, Crimson Desert, Clair Obscur) and then faced backlash, partial rollbacks or lost awards, with little visible damage to sales.
- **AI-native games and startups:** Whispers from the Star, inZOI's AI features, and small 2026 startups. These have been commercially modest so far, apart from inZOI.

The recurring pattern is undisclosed or "placeholder" AI being found by players, followed by an apology and a patch.

### Cited Findings
**Krafton (Korea), "AI First"**
- Krafton announced the "AI First" shift in Oct 2025. It plans to invest more than KRW 130B (about $88M) in agentic AI infrastructure starting in 2026. It launched a voluntary resignation program from Nov 12, 2025, after record profits, paying 6 to 36 months' salary depending on tenure. The company says it is "not a layoff plan." It froze hiring company-wide except for original IP and AI roles. — [Automaton](https://automaton-media.com/en/news/krafton-launches-voluntary-resignation-program-for-employees-as-it-transforms-into-an-ai-first-company/); [Insider Gaming](https://insider-gaming.com/after-pivot-ai-first-krafton-voluntary-resignations/); [PocketGamer.biz](https://www.pocketgamer.biz/krafton-is-offering-voluntary-resignations-to-employeesamid-ai-first-shift)
- Outcome: a provisional 271 employees left the Krafton group in Jan 2026, reportedly fewer than management planned. About KRW 40B in costs was booked in Q1 2026. Subsidiary RisingWings had 40% attrition. — [Inven Global](https://www.invenglobal.com/articles/20276/krafton-cuts-271-jobs-in-january-2026-as-risingwings-hit-by-40-attrition-rate-amid-voluntary-resignation-program)
- **inZOI (Krafton, Early Access Mar 2025, background):** sold 1M copies in 7 days at $39.99. It ships on-device gen-AI features (AI Texture, image-to-3D "3D Printer", "Smart Zoi" NPCs). Krafton says the models were trained only on company-owned and copyright-free data and run on-device. Community reaction was mixed. — [Krafton press](https://press.krafton.com/es/KRAFTON-LAUNCHES-INZOI-IN-GLOBAL-EARLY-ACCESS); [Daum](https://v.daum.net/v/20250411162730494?f=p); [fan wiki, lower reliability](https://thegameswiki.com/inzoi/wiki/reception-and-reviews/history/58d8641c-2652-4fbc-a2b9-8c86447c09f6)

**Square Enix (Japan)**
- Its Nov 2025 progress report on the "Reboots and Awakens" medium-term plan targets automating about 70% of QA/debugging with gen AI by the end of 2027. The work is with the University of Tokyo's Matsuo-Iwasawa Lab. Square Enix announced US/EU layoffs and a shift of development back to Japan at the same time. IGN's source said 137 jobs were at risk in London. — [Decrypt](https://decrypt.co/347824/final-fantasy-maker-square-enix-layoffs-ai-game-development); [Windows Central](https://www.windowscentral.com/gaming/square-enix-layoffs-ai-qa-testing); [PC Gamer](https://pcgamer.com/gaming-industry/square-enix-aims-to-have-ai-doing-70-percent-of-its-qa-work-by-the-end-of-2027-which-seems-like-itd-be-hard-to-achieve-without-laying-off-most-of-your-qa-workers/)

**EA (US)**
- EA agreed a $55B take-private led by Saudi PIF, Silver Lake and Affinity Partners (Sept 2025), expected to close in Q1 FY2027. Per the FT, investors are betting that AI-driven cost cuts will lift profits. The deal is financed partly with about $20B of debt. The $20B figure comes from a search summary of this cluster of articles, and I could not tie it to a specific article. — [Outlook Respawn](https://respawn.outlookindia.com/gaming/gaming-news/eas-new-owners-eye-ai-pivot-to-slash-costs); [Outlook Respawn (ReefGPT/debt)](https://respawn.outlookindia.com/esports/esports-news/eas-ai-tool-aimed-at-cutting-costs-creates-more-work-instead)
- Internal tool "ReefGPT" reportedly produces faulty code that staff must fix. Artists and designers fear they are training their own replacements. A June 2026 report describes a push to put AI across the whole pipeline with a promised 30% efficiency gain. Some QA staff were reportedly laid off after AI began summarizing playtest feedback, and a third 2026 layoff wave was reported. — [Hitmarker](https://hitmarker.net/news/eas-heavy-use-of-game-dev-ai-tools-is-reportedly-causing-issues-and-concern-for-employees-1552549); [People Matters](https://me.peoplemattersglobal.com/news/workforce-planning/ea-cuts-more-jobs-as-saudi-backed-dollar55-billion-acquisition-nears-50478); [TechSpot](https://www.techspot.com/news/109700-bioware-employees-fear-studio-future-after-ea-55.html)
- Whether the deal had closed by Oct 2026 was not confirmed.

**Nexon / Embark Studios (Korea/Sweden): Arc Raiders and The Finals**
- Arc Raiders (Oct 2025) uses text-to-speech voices built from licensed recordings of real actors. Embark says actors were paid for consent, mostly for "less essential" lines such as ping-system callouts. Eurogamer's review said the design was "overshadowed by the spectre of AI." — [TopGear](https://www.topgear.com/car-news/gaming/extraction-shooter-arc-raiders-already-a-hit-its-ai-voice-acting-has-ruffled-some); [PCGamesN](https://www.pcgamesn.com/arc-raiders/ai-voices-replaced)
- Commercial result: reportedly more than 14M copies sold (secondary source) and a Steam peak of nearly 500k concurrent players. — [KitGuru](https://www.kitguru.net/page/27/!https:/www.kitguru.net/gaming/mustafa-mahmoud/some-of-arc-raiders-ai-voices-have-been-replaced-by-real-professional-actors/); [aitopics/Engadget](https://aitopics.org/tag/embark%20studio)
- Rollback (Mar 2026): CEO Patrick Söderlund said some lines were re-recorded by humans and that "A real professional actor is better than AI; that's just how it is." He also said "It's also a way for us to work, not replace actors." — [PCGamesN](https://www.pcgamesn.com/arc-raiders/ai-voices-replaced)
- Nexon CEO Junghun Lee (Nov 2025): "it's important to assume that every game company is now using AI." He later called Arc Raiders a "Trojan Horse" showing how AI can be applied, and said Embark built its games with far fewer people at "a fraction of the cost" of AAA. Nexon is building an internal AI platform, "Mono Lake." — [Automaton](https://automaton-media.com/en/news/its-important-to-assume-every-game-company-is-now-using-ai-nexon-ceo-comments-on-role-of-human-creativity-as-ai-tools-become-the-norm/); [Hitmarker](https://hitmarker.net/news/arc-raiders-is-a-trojan-horse-for-ai-use-in-game-development-nexon-says-1685734)

**Sandfall Interactive: Clair Obscur: Expedition 33 (France)**
- It won Indie Game of the Year and Best Debut at the Indie Game Awards on Dec 18, 2025. Both awards were rescinded on Dec 20–22, 2025 (sources differ on the date) and given to Blue Prince (GOTY) and Sorry We're Closed (Debut). The IGA rules say games "developed using generative AI are strictly ineligible," and Sandfall had affirmed no gen-AI use at submission. The issue was gen-AI placeholder textures (newspaper-clipping style) left in the shipped game and patched out within days. — [AV Club](https://www.avclub.com/clair-obscur-genai-iga-awards-rescinded); [Malay Mail](https://www.malaymail.com/news/tech-gadgets/2025/12/21/indie-game-awards-rescinds-honours-from-clair-obscur-expedition-33-for-genai-use/202718); [Gfinity](https://www.gfinityesports.com/article/clair-obscurs-indie-game-awards-goty-win-is-revoked)

**Pearl Abyss: Crimson Desert (Korea), March 2026**
- Players found AI-generated 2D props within a day of launch. The Steam page had no AI disclosure at launch. Pearl Abyss (Mar 22, 2026) said "experimental AI generative tools" were used in early iteration, that "some of these assets were unintentionally included in the final release," and that it would carry out a "comprehensive audit of all in-game assets" and patch them out. Steam now discloses gen AI used "in a supplementary capacity" for some 2D props. — [Engadget](https://www.engadget.com/gaming/crimson-desert-developer-apologizes-and-promises-to-replace-ai-generated-art-183716439.html); [TechRadar](https://www.techradar.com/gaming/we-sincerely-apologize-for-these-oversights-and-we-take-full-responsibility-for-it-pearl-abyss-apologizes-for-unintentional-ai-assets-spotted-in-crimson-desert); [Insider Gaming](https://insider-gaming.com/crimson-desert-ai-art-scandal-apologize-pearl-abyss/)
- Sales were unaffected: reportedly more than 3M copies in 5 days (another source says 2M on launch day), with a Steam peak of 248,530. — [Outlook Respawn](https://respawn.outlookindia.com/gaming/gaming-news/do-gamers-care-about-genai-new-data-reveals-a-silent-majority); [Thred](https://thred.com/tech/crimson-desert-developers-apologise-for-using-ai-art/)
- The "placeholder" defense is drawing growing criticism. — [Techdirt, Mar 27, 2026](https://www.techdirt.com/2026/03/27/hey-game-devs-the-placeholder-assets-excuse-for-using-ai-is-running-really-thin/); [GameSpot](https://www.gamespot.com/articles/crimson-deserts-ai-scandal-should-bother-you-more/1100-6539362/)

**Activision: Call of Duty Black Ops 6 and Black Ops 7 (US)**
- The BO6, BO7 and Warzone Steam pages carry the note "Our team uses generative AI tools to help develop some in game assets." BO7 (Nov 2025) drew backlash over Ghibli-style calling cards that appeared AI-made. Activision said it uses "a variety of digital tools, including AI tools," and that its "creative process continues to be led by the talented individuals in our studios." It did not confirm the specific cards. Some players reported Steam refunds. — [MP1st](https://mp1st.com/news/activision-responds-to-ai-claims-in-black-ops-7); [Insider Gaming](https://insider-gaming.com/activision-responds-black-ops-7-ai-claims/); [Beebom](https://beebom.com/black-ops-7-faces-backlash-after-player-reports-ai-calling-cards-and-gets-refunded/amp/)
- Activision admitted gen-AI use for some BO6 assets after backlash, and reportedly sold an AI-generated Modern Warfare 3 cosmetic. — [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)

**Larian Studios (Belgium): Divinity**
- In a Dec 2025 Bloomberg interview after the Divinity reveal at The Game Awards, Swen Vincke said Larian uses gen AI for exploring ideas, presentations, concept-art exploration and placeholder text, with no AI content in the shipped game. Former employees disputed his claim of internal consensus. He then said Larian is "neither releasing a game with any AI components, nor... trimming down teams," citing 72 artists, 23 of them concept artists. — [VGC](https://www.videogameschronicle.com/news/holy-f-guys-were-not-replacing-artists-larian-boss-responds-to-ai-backlash); [Notebookcheck](https://www.notebookcheck.net/Larian-CEO-Swen-Vincke-defends-generative-AI-in-new-Divinity-title-sparking-fan-and-dev-backlash.1189455.0.html)
- Reversal: in a later Reddit AMA, Larian committed to no gen AI for Divinity concept art, so that "there can be no discussion about the origin of the art." Some reports say writing is also excluded. Larian remains open to gen AI in other areas. — [Hitmarker](https://hitmarker.net/news/larian-confirms-that-it-will-no-longer-use-generative-ai-for-divinity-concept-art-and-writing-following-backlash-1615314); [CGMagazine](https://www.cgmagonline.com/news/larian-generative-ai-divinity-reddit); [Notebookcheck](https://www.notebookcheck.net/Larian-Studios-walks-back-generative-AI-use-in-Divinity-after-fan-backlash-clarifies-future-AI-role.1201780.0.html)

**Ubisoft (France)**
- Neo NPC was shown at GDC 2024. "Teammates" (Nov 2025) is its first playable gen-AI research project: a Snowdrop-engine FPS with a voice-commanded AI assistant ("Jaspar") and AI squadmates. It was built by about 80 people using Google Gemini and internal middleware, and playtested with only "a few hundred players." A May 2026 report says Ubisoft is increasing investment while it faces a record €1.3B operating loss. Insider Gaming reported poor results from AI-prompt experiments in Far Cry 7 (unconfirmed by Ubisoft). — [Hitmarker](https://hitmarker.net/news/ubisoft-reveals-teammates-a-generative-ai-experiment-featuring-voice-controlled-npcs-1582502); [Decrypt](https://decrypt.co/349865/assassins-creed-maker-ubisoft-unveils-game-powered-generative-ai/); [Players.com.ua](https://players.com.ua/en/news/ubisoft-expands-ai-investments-and-confirms-new-assassin-s-creed-and-far-cry-games/); [Outlook Respawn](https://respawn.outlookindia.com/gaming/gaming-news/ubisoft-reportedly-using-far-cry-7-for-ai-tests)

**Microsoft / Xbox / King**
- Muse (Feb 2025, background) is a "World and Human Action Model" (WHAM) trained on more than 1B images and controller actions from Ninja Theory's Bleeding Edge. It is pitched for prototyping and ideation, not content generation. — [eWeek](https://www.eweek.com/fr/news/microsoft-muse-generative-ai-model-gameplay/); [ETCentric](https://www.etcentric.org/muse-could-be-a-gamechanger-for-xbox-players-developers/)
- King (Candy Crush, 2025, background): about 200 layoffs. Per anonymous sources via MobileGamer.biz, level designers, user researchers and narrative writers were replaced by AI tools they had helped build ("most of level design has been wiped"). Microsoft reportedly set targets of 70–80% daily AI usage, later raised to 100%. — [Hitmarker](https://hitmarker.net/news/candy-crush-developer-king-reportedly-forced-to-use-ai-tools-by-microsoft-following-mass-layoffs-1505619); [ScreenHub](https://www.screenhub.com.au/news/games/candy-crush-king-ai-2672994/); [LevelUp](https://www.levelup.com/en/news/candy-crush-king-layoffs-microsoft-ai)

**China: NetEase, Tencent, miHoYo/Anuttacon**
- **Whispers from the Star** (Anuttacon, founded by miHoYo co-founder Cai Haoyu; Steam release Aug 14, 2025) is an AI-driven conversational game. It is rated "Very Positive" (about 80% of about 1,677 reviews as of Aug 2026). Third-party estimates put sales at about 34.2K copies and about $290K gross, with an all-time peak of 208 concurrent players. These are estimates, not official figures. — [Raijin](https://raijin.gg/app/3730100/Whispers_from_the_Star/sales-revenue); [Notebookcheck RU](https://www.notebookcheck-ru.com/Zapusk-v-Steam-Novaja-interaktivnaja-fantasticheskaja-igra-debjutiruet-pod-ochen-polozhitelnymi-otzyvami-no-mozhet-razdelit-geimerov-iz-za-silnoi-integracii-II.1088283.0.html)
- **NetEase:** Suda51 told Eurogamer (reported Feb 2026) that NetEase told its studios not to use gen AI in games and shut an internal AI research division. This is single-source with no NetEase confirmation. — [LetsDataScience](https://www.letsdatascience.com/news/netease-orders-studios-to-ban-ai-usage-55b519d5)
- NetEase denied a rumored AI-driven purge of outsourced staff, acknowledging only "normal project adjustments" for some basic outsourced roles. — [GameGeeker](https://gamegeeker.com/zh/news/netease-ai-layoff-rumor-and-official-response)
- **Background (2023):** Chinese game illustrator jobs reportedly fell about 70% in a year, according to a recruiter's estimate. — [Rest of World](https://restofworld.org/2023/ai-china-video-game-layoffs-illustrators/); [Game World Observer](https://gameworldobserver.com/2023/04/12/game-artist-jobs-china-down-70-percent-gen-ai-adoption)
- In June 2026 DataEye/36Kr described Chinese firms as split between showcasing AI and cutting headcount, naming Tencent, NetEase and 37 Interactive. — [36Kr](https://eu.36kr.com/en/p/3839530647259397)

**Other 2025–2026 incidents**
- Frontier's Jurassic World Evolution 3 removed gen-AI scientist portraits after backlash (2025). Postal: Bullet Paradise was cancelled amid AI-art suspicion. GOG faced backlash for AI art in its own promotion. — [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)
- 1666: Amsterdam (Panache Digital Games) apologized for AI portraits and marketing assets in its prologue and promised removal. — [TheGamer](https://www.thegamer.com/1666-amsterdam-ai-art-response/)
- An indie developer pulled their entire game from Steam out of shame over AI use. Details are thin. — [Futurism](https://futurism.com/artificial-intelligence/indie-developer-deleting-entire-game-ai)

**AI-native startups in 2026: small raises, mostly mobile**
- Surge Games (Istanbul) raised a $3M pre-seed led by Play Ventures (Aug 2026). Arcustin Games raised $500K at a $10M valuation (Sept 2026). Mindtail raised $2M or $3.2M (May 2026; sources differ). Verse8 raised $5M (Apr 2026). Aippy (an AI-native game community app) raised "tens of millions" at a $250M valuation, with about 2M MAU (June 2026). — [PocketGamer.biz](https://pocketgamer.biz/surge-games-raises-3m-pre-seed-to-build-ai-native-mobile-games); [Tech.eu](https://tech.eu/2026/09/14/ai-native-game-studio-arcustin-games-raises-500k-from-webrazzi-gsyf/); [PocketGamer.biz](https://www.pocketgamer.biz/turkish-mobile-studio-mindtail-raises-2m-for-ai-driven-puzzle-games/); [GeneOnline](https://www.geneonline.com/verse8-secures-5-million-to-advance-ai-driven-game-development-in-200-billion-gaming-market/); [Macau Business](https://macaubusiness.com/aippy-raises-tens-of-millions-of-dollars-at-a-250-million-valuation-to-build-the-future-of-ai-native-interactive-entertainment/)

### Inferences
- The most commercially successful "AI-using" games of 2025–26 (Arc Raiders, Crimson Desert, Clair Obscur, Black Ops) used AI at the margins. Each suffered reputational damage (lost awards, review criticism, apologies) but no visible sales collapse. Games built around AI as the core experience (Whispers from the Star) got good reviews but sold small numbers.
- Publisher strategy is now set by executives and investors (Krafton, Square Enix, EA's buyers, Nexon), framed as cost and headcount reduction. That framing drives both labor tension and player suspicion.
- Recurring failure mode: AI "placeholders" left in shipped builds and discovered by players. Clair Obscur shows that a false "no AI" attestation is worse than the AI use itself.

### Gaps
- Tencent's in-house AI game pipelines, miHoYo's own AI use, Microsoft Muse in 2026 and the outcome of Activision's AI-related art layoffs could not be researched (search budget).
- No official sales numbers for Arc Raiders or Whispers from the Star. The EA buyout closing status is unconfirmed.

---

## 3. Platform rules: Steam/Valve, consoles, mobile stores, itch.io

### Takeaway
Steam is the only major storefront with a formal, mandatory gen-AI disclosure. It was narrowed in Jan 2026 to content players see or hear, and it now covers roughly one in three new releases. Sony, Microsoft and Nintendo have no public AI-disclosure rules but are purging low-quality "shovelware" (much of it AI-made). itch.io uses AI/No-AI tags. Panic's Playdate is the first storefront to ban gen-AI content outright. Mobile stores regulate gen-AI features (safety and reporting) rather than how content was made.

### Cited Findings
**Steam / Valve**
- History: in 2023 Valve rejected AI-made games over legal uncertainty. From Jan 2024 it required disclosure in two categories: pre-generated and live-generated content. — [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)
- Jan 17–20, 2026 rewrite: disclosure now covers AI used to generate content in the game, on the store page or in marketing, plus "AI content generated during gameplay." AI-powered dev tools such as code assistants are exempt: "efficiency gains through the use of [AI-powered dev tools] is not the focus." — [VGC](https://www.videogameschronicle.com/news/valve-has-significantly-rewritten-steams-rules-for-how-developers-much-disclose-ai-use); [Gigazine](https://gigazine.net/gsc_news/en/20260120-steam-updates-ai-disclosure-guidelines)
- Disclosure is a free-text field with no filterable tag. Enforcement after a failure to disclose is unclear. Epic CEO Tim Sweeney mocked it (late 2025): "Why stop at AI use? We could have mandatory disclosures for what shampoo brand the developer uses." — [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)
- Counts (methods differ, so figures are not directly comparable):
  - Sulka Haro's census (Jul 13, 2026) of 53,597 Steam game releases from Jul 2023 to Jul 2026 found about 9,400 AI-flagged, with about 1 in 3 new games AI-disclosed by mid-2026. AI-flagged launches went from about 13 to about 530 per month; non-AI launches went from about 1,030 to 1,320. Depending on the window, 60–90% of release growth is AI-flagged. — [Substack](https://fragwyz.substack.com/p/three-years-of-ai-on-steam)
  - Share of releases: 10.9% (2024), 19.9% (2025), 30.8% (2026). — [games.gg](https://games.gg/news/steam-ai-disclosure-games-2028-trend/)
  - 7,818 games, or about 7% of the catalog (Jan 2026). — [Gigazine](https://gigazine.net/gsc_news/en/20260120-steam-updates-ai-disclosure-guidelines)
  - SteamDB lists more than 15,000 games and software items with the label (Feb 2026; likely includes non-game items). — [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)
  - Nearly 8,000 disclosing titles released in H1 2025, versus about 1,000 in all of 2024. — [VGC](https://www.videogameschronicle.com/news/valve-has-significantly-rewritten-steams-rules-for-how-developers-much-disclose-ai-use)
  - About 1,700 of about 8,600 Steam Next Fest demos (about 20%) disclose gen AI (Eurogamer via SteamDB; exact festival date not confirmed). — [LetsDataScience](https://letsdatascience.com/news/over-1000-steam-next-fest-games-disclose-generative-ai-6c11ab90); [Tech-Insider](https://tech-insider.org/steam-ai-disclosure-2026)
- The Steam curator group "AI Check" tracks undisclosed AI. — [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)

**Consoles**
- PlayStation Store has no AI-disclosure requirement. Sony delisted about 1,200 titles in Jan 2026 and about 700 regional listings from Nostra Games in Mar 2026, many reportedly made with gen AI, without giving a reason. Nintendo has tightened eShop curation and changed rankings to de-emphasize knockoffs. No Xbox-specific AI policy was found. — [Notebookcheck](https://www.notebookcheck.net/Sony-delists-700-PS4-and-PS5-shovelware-games-from-PS-Store-with-many-using-generative-AI.1257171.0.html); [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)
- Epic Games Store and GOG have no clear AI-disclosure policy. — [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)

**Playdate (Panic)**
- From Apr 20, 2026 the Playdate Catalog bars third-party games containing gen-AI art, music or writing. AI coding tools are allowed but must be disclosed. Season 3 bans gen AI in any capacity, including code. Cabel Sasser said Steam, the eShop, the PS Store and itch "still permit" AI-generated work. — [Decrypt](https://decrypt.co/364960/playdate-gaming-handheld-maker-bans-generative-ai-tools)

**itch.io (background, Nov 2024)**
- A mandatory gen-AI disclosure field for asset pages applies an "AI Generated" tag (sub-tags: graphics, sound, text/dialog, code) or a "No AI" tag. Untagged gen-AI assets are de-indexed from browse pages. Traditional game AI and procedural generation are excluded. Sources conflict on whether disclosure is mandatory for game pages: The Conversation (2026) says it is not. — [80.lv](https://80.lv/articles/asset-creators-on-itch-io-now-have-to-disclose-the-use-of-generative-ai/); [GamingOnLinux](https://gamingonlinux.com/2024/11/itchio-store-now-requires-ai-generated-content-disclosures-for-assets); [GamesMarket](https://www.gamesmarket.global/itchio-now-requires-gen-ai-content-to-be-tagged-in-all-games-and-asset-packs-711e824843d410eab51fcd9436836294/)

**Mobile**
- Google Play's AI-Generated Content policy covers apps where gen AI is central (chatbots, image/voice generators, replicas of real people). It bans offensive or deceptive output and requires in-app flagging or reporting. Apps using AI only as a minor feature are not covered. In Aug 2026 Google reiterated stricter gen-AI requirements against NCII/"nudify" content and asked for reviewer access to AI features without paywalls. — [Google Play Help](https://support.google.com/googleplay/android-developer/answer/14094294); [Android Developers Blog](https://android-developers.googleblog.com/2026/08/ensuring-safety-genai-preventing-non-consensual-intimate-content.html); [TechCrunch 2024](https://techcrunch.com/2024/06/06/google-play-cracks-down-on-ai-apps-after-circulation-of-apps-for-making-deepfake-nudes)
- There is no AI-made-content disclosure requirement on mobile stores. — [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)

### Inferences
- A mostly-AI game can legally ship on Steam, consoles and mobile, but on Steam it must disclose. Once about a third of new releases carry the flag, the flag is not much of a differentiator. Console curation is moving toward quality-based delisting, which puts low-effort AI output at risk even without explicit AI rules.
- Any in-game, runtime gen-AI feature (NPC chat, generated images) triggers Steam's "live-generated" disclosure and, on mobile, Google Play's content-safety and reporting requirements.

### Gaps
- Apple App Store guidelines on AI content were not retrieved (search budget).
- No official Sony, Microsoft or Nintendo developer-policy documents were found, so the absence of rules rests on secondary reporting.
- The exact text of Valve's live-generated-content guardrail requirements was not retrieved.

---

## 4. Copyright: can you own an AI-made game?

### Takeaway
**US:** copyright requires a human author. This is settled for now: the D.C. Circuit decided Thaler in Mar 2025, the Supreme Court denied cert on Mar 2, 2026, and the Copyright Office's Part 2 report (Jan 2025) says prompts alone are not authorship. A game made mostly by AI would therefore have thin protection, covering only human-authored code, art, writing, selection/arrangement and modifications. AI-generated assets would be free for others to copy, and AI material must be disclaimed when registering.

**Training-data liability is split:**
- US courts (Bartz, Kadrey, 2025) found training on lawfully acquired works to be fair use. Using pirated libraries led to the record $1.5B Anthropic settlement (final approval Jul 20, 2026).
- The NYT/OpenAI MDL is at summary judgment (fall 2026).
- In the UK, Getty v. Stability (Nov 2025) found a model is not an "infringing copy"; that point is on appeal.
- Studio and media plaintiffs (Disney/Universal/WBD v. Midjourney) and the music labels are steering toward licensing deals.

### Cited Findings
**US: human authorship and registration**
- The Copyright Office's registration guidance (88 Fed. Reg. 16,190, Mar 16, 2023) requires applicants to identify and exclude AI-generated material. Zarya of the Dawn (Feb 21, 2023), Théâtre D'opéra Spatial (Sept 5, 2023) and SURYAST (Dec 11, 2023) are the key registration decisions. — [Copyright Office AI page](https://www.copyright.gov/ai/); [policy statement PDF](https://www.copyright.gov/ai/ai_policy_guidance.pdf)
- Part 2, Copyrightability (Jan 29, 2025): prompts alone don't give users enough control and "function as instructions that convey unprotectible ideas." Protection is available for human-authored expression visible in the output, creative selection/arrangement, and creative modifications of AI output, assessed case by case. No new legislation is needed. The door is left open if the technology changes. — [Part 2 PDF](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf); [IPWatchdog](https://ipwatchdog.com/2025/01/29/part-two-copyright-office-ai-report-says-creative-prompting-doesnt-constitute-authorship/); [Perkins Coie](https://perkinscoie.com/insights/update/copyright-office-solidifies-stance-copyrightability-ai-generated-works)
- Part 1, Digital Replicas (Jul 31, 2024) recommended a federal digital-replica law. — [Copyright Office AI page](https://www.copyright.gov/ai/)
- Thaler v. Perlmutter: the D.C. Circuit (Mar 18, 2025, No. 23-5233) held that the Copyright Act requires a human author. The Supreme Court denied cert on Mar 2, 2026 (No. 25-449), with no opinion. The constitutional question of whether Congress could protect non-human authorship remains open. — [Baker Donelson](https://www.bakerdonelson.com/supreme-court-denies-certiorari-in-thaler-v-perlmutter-ai-cannot-be-an-author-under-the-copyright-act); [Sterne Kessler](https://www.sternekessler.com/news-insights/client-alerts/ip-hot-topic-cert-denied-but-one-thing-is-cert-ain-the-human-authorship-requirement-for-copyright/); [Jones Day](https://www.jonesday.com/de/insights/2026/03/jones-day-talks-women-in-ip--supreme-court-denies-review-of-thaler-v-perlmutter-ai-authorship-questions-remain)

**US: training and fair use**
- Part 3, Generative AI Training: a pre-publication version came out May 9, 2025. It concluded that some, possibly most, training uses are likely not fair use, stressing market dilution. As of Oct 2026 no final version has been published; the Office says it expects no substantive changes. Register Shira Perlmutter was fired the day after release. On Jun 30, 2026 the Supreme Court denied the government's stay application in Blanche v. Perlmutter (No. 25A478), so she remains Register, which could clear the way for a final report. — [Copyright Office AI page](https://www.copyright.gov/ai/); [Lowenstein Sandler](https://www.lowenstein.com/news-insights/publications/client-alerts/scotus-ruling-re-opens-the-door-on-the-copyright-office-s-ai-training-report-ai); [Wiley](https://www.wiley.law/alert-Copyright-Office-Issues-Key-Guidance-on-Fair-Use-in-Generative-AI-Training)
- **Bartz v. Anthropic (N.D. Cal.):**
  - Judge Alsup's 2025 ruling held that training on lawfully purchased books was fair use, but building a central library from pirated copies was not.
  - The $1.5B class settlement covers about 400,000–500,000 pirated books, about $3,000 per work, and requires destruction of the pirated files.
  - Final approval came Jul 20, 2026 from Judge Araceli Martínez-Olguín (Alsup has retired). She overruled 53 objections and awarded $101.56M in attorneys' fees (about 6.8%). The claims rate was about 91–93%.
  - [Jurist](https://www.jurist.org/news/2026/07/judge-approves-record-1-5-billion-settlement-involving-anthropic/); [Authors Guild](https://authorsguild.org/news/court-grants-final-approval-anthropic-copyright-settlement/); [AAP](https://publishers.org/news/aap-welcomes-courts-final-settlement-approval-in-bartz-v-anthropic/)
- Kadrey v. Meta (2025) also found the training fair use. Both Kadrey and Bartz are reported to be on appeal. — [Lowenstein Sandler](https://www.lowenstein.com/news-insights/publications/client-alerts/scotus-ruling-re-opens-the-door-on-the-copyright-office-s-ai-training-report-ai); [ValueAddVC](https://valueaddvc.com/pulse/nyt-openai-microsoft-copyright-summary-judgment-2026)
- **NYT v. OpenAI/Microsoft** is consolidated in In re OpenAI Copyright Infringement Litigation, MDL No. 3143 (S.D.N.Y., Judge Stein). Summary-judgment cross-motions were filed Sept 4, 2026, with briefing to Nov 20, 2026 and no trial date. OpenAI argues fair use and that "dilution" harm is not cognizable. — [Open Class Actions](https://openclassactions.com/news/new-york-times-openai-microsoft-copyright-lawsuit.php); [OpenAI SJ memo (court filing copy)](https://chatgptiseatingtheworld.com/wp-content/uploads/2026/09/OpenAI-SJ-Mtn-News-Cases-gov.uscourts.nysd_.612697.1496.0.pdf)
- **Disney & Universal v. Midjourney** (C.D. Cal., filed June 2025) seeks up to $150K per infringed work plus an injunction. Warner Bros. Discovery sued in Sept 2025 and the cases were consolidated. The court suggested mediation in Nov 2025. No 2026 ruling or settlement was found. — [SAN](https://san.com/cc/disney-universal-seek-150k-per-image-in-new-ai-lawsuit/); [Graphic Policy](https://graphicpolicy.com/2025/11/14/court-suggests-disney-v-midjourney-go-to-mediation/)

**Music (relevant to AI soundtracks and SFX)**
- UMG settled with Udio in Oct 2025, after which Udio disabled downloads. WMG settled with Suno in Nov 2025, and Suno agreed to launch licensed models. Sony is still litigating against Suno (D. Mass.) and Udio (S.D.N.Y.). UMG/Sony–Suno talks reportedly hit an impasse in Apr 2026 over distributing generated tracks off-platform. On Jun 5, 2026 the American Federation of Musicians sued UMG and WMG over licensing members' recordings into AI deals without compensation. — [Complete Music Update](https://completemusicupdate.com/universal-has-settled-its-lawsuit-with-udio-and-signed-ai-deals-with-udio-and-stability/); [Digital Music News](https://www.digitalmusicnews.com/2026/04/09/suno-universal-music-lawsuit-settlement-impasse/); [Dubspot](https://blog.dubspot.com/suno-udio-ai-music-lawsuits-2026)

**UK**
- Getty Images v. Stability AI, [2025] EWHC 2863 (Ch), Joanna Smith J, judgment Nov 4, 2025:
  - Getty abandoned its primary training and database claims at trial.
  - The secondary-infringement claim failed. A model can be an "article," but Stable Diffusion does not store or contain infringing copies.
  - Trademark wins were narrow, limited to historic iStock/Getty watermark reproductions in early model versions.
  - Permission to appeal the secondary-infringement point was granted on Dec 16–17, 2025. AIPPI says Getty was granted permission; CMS's summary says Stability, likely an error, since Getty lost that point. Stability's bid to appeal the trademark finding was refused. No Court of Appeal outcome was found.
  - [AIPPI](https://www.aippi.org/news/getty-images-v-stability-ai-uk-high-court-finds-no-secondary-copyright-infringement-in-landmark-genai-ruling/); [CMS tracker](https://cms.law/en/aut/publication/artificial-intelligence-and-copyright-case-tracker/united-kingdom-getty-images-us-inc-ors-v-stability-ai-ltd3); [UCL commentary, 2026](https://www.ucl.ac.uk/laws/publications/2026/jul/why-getty-images-v-stability-ai-got-secondary-copyright-infringement-wrong)

**Platform-level IP signal**
- Krafton's defense for inZOI's AI was that its models were trained only on company-owned and copyright-free data and run on-device. Provenance claims like this are becoming a reputational necessity. — [Daum/Krafton coverage](https://v.daum.net/v/20250411162730494?f=p)

### Inferences
- **US IP ownership of a mostly-AI game:**
  - The studio could register the human-written parts: code, edited text, curated selection/arrangement of levels and assets, and substantial human modification of AI art.
  - Raw AI assets (textures, voice lines, music) would likely be unprotectable. Competitors or cloners could legally reuse them unless they are protected some other way (trademark on names/logos, contracts/EULAs, trade secret for unreleased material).
  - Registration applications must disclaim AI content. Under-disclosure risks invalidating the registration.
- **Training-data risk mostly sits with model vendors, but a game studio is exposed through outputs** that reproduce protected characters or styles (the theory in Disney v. Midjourney), through models trained on pirated data (the Bartz logic), and through music models trained without label licenses. Licensed or indemnified tools, and in-house models trained on owned data as Krafton claims, reduce this exposure.
- A final US Part 3 report, likely now that Perlmutter stays, plus fall-2026 summary-judgment rulings in the OpenAI MDL could shift the fair-use picture in late 2026 or 2027.

### Gaps
- UK CDPA s.9(3) "computer-generated works" (protection without a human author) and the status of the UK government's AI/copyright consultation in 2026 were not verified (search budget).
- Not verified: the EU (CJEU human-originality standard), China (Beijing Internet Court AI-image rulings), Japan (Art. 30-4 TDM exception), and any Getty Court of Appeal hearing date or result.
- Disney/Universal/WBD v. Midjourney developments in 2026, Sony v. Suno/Udio rulings and the NLRB outcome on Fortnite's AI Darth Vader were not found.

---

## 5. Labor: union contracts, AI clauses, and AI-linked layoffs

### Takeaway
Voice and performance work is the most tightly regulated area. The SAG-AFTRA Interactive Media Agreement, ratified Jul 2025 and running to Oct 2028, requires informed written consent, per-use payment and usage reports for digital replicas. It also lets performers suspend replica use during strikes. Studio unions (ZeniMax/CWA) won notice-and-bargain rights over AI's effects on jobs. Unionization sentiment is very high in the US. The UK has no equivalent games agreement. Layoffs explicitly tied to AI have been reported at King, Square Enix, Krafton and EA, often through anonymous sources rather than company admissions.

### Cited Findings
**SAG-AFTRA Interactive Media Agreement (US)**
- The strike began in July 2024 and lasted about 11 months (TheWrap: a "320-day strike"). Members ratified the new terms with 95.04% approval in July 2025. Signatories include Activision, EA, Disney Character Voices, WB Games and Take-Two Productions, among about 9 companies. Pay: an immediate 15.17% raise, then three annual 3% raises. — [Decrypt](https://decrypt.co/329479/video-game-performers-ai-consent-rules); [TheWrap](https://www.thewrap.com/sag-aftra-ratify-interactive-media-agreement-video-game-strike/)
- AI terms:
  - Written, "clear and conspicuous" consent is required, with a "reasonably specific description" of use. This includes whether the replica is used for real-time generation and whether sensitive content (profanity, slurs) is involved.
  - For most uses, consent cannot be obtained at hiring for future games.
  - Vocal replica pay is based on lines generated (about 10 words per line).
  - Usage reports are due within 90 days of a game's release.
  - "Independently Created Digital Replicas" (made from non-union material or by prompting with a performer's name) generally still require consent and bargaining.
  - "Traditional AI" (animation) and processing such as noise reduction and pitch shifting are excluded.
  - Term: Nov 8, 2022 to Oct 31, 2028 ("2022-2028 Memorandum of Agreement").
  - [Frankfurt Kurnit](https://technologylaw.fkks.com/post/102mewu/inside-the-new-sag-aftra-interactive-media-agreement-new-standards-for-ai-and-di)
- Strike suspension: performers can "suspend the generation of new material during a strike." Negotiating chair Sarah Elmaleh said this prevents "an unprecedented type of scab." — [Decrypt](https://decrypt.co/329479/video-game-performers-ai-consent-rules)
- Real-time generation (e.g., voice-replica chatbots) reportedly pays at least 7.5× minimum. This comes from a single search summary and is not verified in the fetched articles. — [Decrypt (search summary)](https://decrypt.co/329479/video-game-performers-ai-consent-rules)
- Enforcement precedent: on May 19, 2025 SAG-AFTRA filed an unfair labor practice charge with the NLRB against Llama Productions (Epic) over the AI Darth Vader voice in Fortnite. The charge was about failure to bargain, even though James Earl Jones's estate had consented. No outcome was found. — [TheWrap](https://www.thewrap.com/sag-aftra-darth-vader-fortnite-ai-voice/); [Proskauer](https://www.proskauer.com/blog/sag-aftra-strikes-back-files-ulp-over-ai-darth-vader-in-fortnite)

**Equity (UK)**
- Equity has no union-negotiated games agreement. Through its "Game On!" campaign it says companies "continue to ignore" its calls for agreements and that performers lack protection from AI and NDA misuse. Equity has described AI as a "direct threat" to the UK industry. No 2026 agreement was found. — [Arts Professional](https://artsprofessional.co.uk/news/newsreel/equity-calls-on-video-games-industry-to-introduce-union-negotiated-agreements); [V2 Radio](https://www.v2radio.co.uk/news/v2-radio-entertainment-news/video-game-actor-strike-ends-in-us-but-ai-described-as-direct-threat-to-uk-industry); [Hollywood Reporter](https://www.hollywoodreporter.com/news/general-news/uk-equity-sag-aftra-video-game-strike-solidarity-1235958762/)

**Studio unions (US)**
- Microsoft/ZeniMax and CWA reached a tentative agreement in May 2025, Microsoft's first US union contract, covering about 300 QA workers. ZeniMax must "provide notice to the union in cases where AI implementation may impact the work of union members" and "bargain those impacts upon request." It also commits to AI that "augment[s] human ingenuity," built on Microsoft's 2023 AI principles. Pay rises 13.5%, with the minimum going from $20.75 to $25/hr. The ratification vote was due by Jun 20, 2025; the result was not confirmed in my sources. — [Gamefile](https://www.gamefile.news/p/zenimax-microsoft-union-contract); [CWA](https://cwa-union.org/news/its-your-contract-how-cwa-members-are-shaping-ai-through-power-union-contract); [Windows Central](https://windowscentral.com/gaming/xbox/microsoft-reaches-tentative-agreement-with-zenimax-gaming-union-workers-over-ai-principles)
- GDC 2026: 82% of US respondents support unionizing (5% oppose). 10% belong to an industry-wide union such as United Videogame Workers-CWA, 2% to a company union, and 62% are interested in joining. — [GDC](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)

**Layoffs and restructurings tied to AI**
- **King/Microsoft (2025):** about 200 roles cut, with AI tools reportedly replacing level designers and writers. Anonymous sources; no company confirmation. — [ScreenHub](https://www.screenhub.com.au/news/games/candy-crush-king-ai-2672994/)
- **Square Enix (Nov 2025):** US/EU layoffs alongside the 70% QA-automation goal. The company calls it reorganization, not AI replacement. — [Decrypt](https://decrypt.co/347824/final-fantasy-maker-square-enix-layoffs-ai-game-development)
- **Krafton (Nov 2025 – Jan 2026):** 271 voluntary departures and a hiring freeze except for AI/IP roles. — [Inven Global](https://www.invenglobal.com/articles/20276/krafton-cuts-271-jobs-in-january-2026-as-risingwings-hit-by-40-attrition-rate-amid-voluntary-resignation-program)
- **EA (2025–26):** QA cuts after AI summarization of playtests, and three layoff waves in 2026. — [People Matters](https://me.peoplemattersglobal.com/news/workforce-planning/ea-cuts-more-jobs-as-saudi-backed-dollar55-billion-acquisition-nears-50478); [Hitmarker](https://hitmarker.net/news/eas-heavy-use-of-game-dev-ai-tools-is-reportedly-causing-issues-and-concern-for-employees-1552549)

### Inferences
- A studio that replaces performers with AI voices must, if it is a SAG-AFTRA signatory or hires union talent, get specific written consent, pay per generated line, and file usage reports. Using a "sound-alike" prompted with a performer's name is also covered. Non-union, synthetic-only voices avoid the IMA but carry reputational risk (Arc Raiders) and likeness-law risk.
- Union contracts so far do not ban AI. They require notice and bargaining over its impact on jobs. In a unionized studio, an AI-first restructuring becomes a mandatory bargaining subject rather than a unilateral decision.

### Gaps
- Not confirmed: the outcome of the ZeniMax ratification vote, contracts at other Microsoft units (Raven, Blizzard teams), and any 2026 SAG-AFTRA or Equity developments.
- No systematic count of layoffs attributable to AI exists. Attribution relies on anonymous reporting.

---

## 6. Regulation: EU AI Act, China, Korea, US states

### Takeaway
Labeling and disclosure are now law in the EU (AI Act Art. 50, from Aug 2, 2026, with machine-readable marking for existing systems delayed to Dec 2, 2026), China (from Sept 1, 2025) and South Korea (AI Basic Act, from Jan 22, 2026, with at least a 1-year fine grace period). For games these rules mostly bite on chatbot/NPC interaction disclosure, deepfake-like realistic media, and the marking of outputs by gen-AI providers. Artistic and fictional works get lighter-touch disclosure in the EU.

### Cited Findings
**EU AI Act, Article 50 (applies from Aug 2, 2026)**
- 50(1): providers must ensure AI systems "intended to interact directly with natural persons" inform people they are interacting with AI, unless obvious from context. This is relevant to AI NPC chat.
- 50(2): synthetic audio, image, video and text outputs must be "marked in a machine-readable format and detectable as artificially generated or manipulated," as far as technically feasible.
- 50(4): deployers of deepfakes must disclose. For "evidently artistic, creative, satirical, fictional" works, the obligation is limited to disclosing "the existence of such generated or manipulated content" in a way that does not hamper enjoyment of the work. AI text on matters of public interest must be disclosed unless it has had human editorial review.
- 50(5): disclosure is due "at the latest at the time of the first interaction or exposure."
- [Article 50 text](https://artificialintelligenceact.eu/article/50/)
- The final, voluntary Code of Practice on marking and labeling AI-generated content was published Jun 10, 2026. It has a provider part (marking/detection) and a deployer part (deepfake and public-interest text labeling). Following it does not by itself prove compliance. — [Elevate Consult](https://elevateconsult.com/insights/labeling-ai-generated-content-eu-ai-act/); [Jones Day (draft)](https://jonesday.com/en/insights/2026/01/european-commission-publishes-draft-code-of-practice-on-ai-labelling-and-transparency); [Addleshaw Goddard](https://www.addleshawgoddard.com/en/insights/insights-briefings/2026/technology/eu-ai-act-code-practice-marking-labelling-ai-generated-content/)
- AI Digital Omnibus: a political agreement was reportedly reached May 7, 2026, and Parliament approved it in June 2026. It moves Art. 50(2) marking for gen-AI systems already on the market before Aug 2, 2026 to Dec 2, 2026. Art. 50(1) and the deployer duties still apply from Aug 2, 2026. New systems must comply immediately. Official Journal publication was not confirmed. — [Elevate Consult](https://elevateconsult.com/insights/labeling-ai-generated-content-eu-ai-act/); [Deloitte (pre-deal)](https://www.deloitte.com/uk/en/blogs/ecrs/the-ai-omnibus-what-is-settled-and-what-is-still-in-play.html)

**China: Measures for Labeling AI-Generated Synthetic Content (effective Sept 1, 2025)**
- Issued by the CAC, MIIT, Ministry of Public Security and NRTA (released Mar 2025), with mandatory national standard GB 45438-2025. Explicit, user-perceivable labels are required on AI-generated text, images, audio, video and "virtual scenes"/interactive interfaces. Implicit labels (metadata) must be embedded in files. — [Loeb & Loeb](https://www.loeb.com/en/insights/publications/2025/03/chinas-ai-labeling-measures-and-mandatory-national-standards-take-effect-september-1); [HSF Kramer](https://www.hsfkramer.com/notes/tmt/2025-posts/China-Releases-Laws-to-Mandate-Labelling-of-AIGC); [Technology's Legal Edge](https://www.technologyslegaledge.com/2025/03/china-released-new-measures-for-labelling-ai-generated-and-synthetic-content/)

**South Korea: AI Basic Act (effective Jan 22, 2026)**
- Companies must give advance notice when products or services use gen AI. Gen-AI output needs invisible watermarks, and realistic deepfakes need visible labels. Fines run up to about KRW 30M (about $20K), with a grace period of at least one year before fines. An amendment to defer gen-AI rules by three years has been proposed; its status is unknown. — [Stimson](https://www.stimson.org/2026/south-koreas-ai-basic-act-seeking-balance-between-industry-innovation-and-social-risk/); [EWN](https://www.ewn.co.za/2026/01/22/south-korean-law-to-regulate-ai-takes-effect); [LetsDataScience](https://letsdatascience.com/news/south-korea-tightens-ai-rules-with-watermark-requirement-82d43c34)
- One secondary source says AI-generated game content sold in Korea (NPC dialogue, art, music), including human-refined AI assets, must be labeled. It is unverified and has date inconsistencies. — [Cinevva](https://app.cinevva.com/news/2026-03-14-korea-ai-game-labeling-law)

**United States (California)**
- AB 2013 (Generative AI Training Data Transparency) requires developers of gen-AI systems to post training-data disclosures from Jan 1, 2026, with no size threshold and no trade-secret carve-out. — [Corporate Compliance Insights](https://www.corporatecomplianceinsights.com/exploring-californias-generative-ai-training-data-transparency-act/); [TechPolicy.Press tracker](https://techpolicy.press/tracker/artificial-intelligence-training-data-transparency-ca-ab2013)
- SB 942 (AI Transparency Act) requires large gen-AI providers to offer detection tools and provenance data. It was amended and delayed by AB 853; the new effective date was not verified. — [TrustArc](https://trustarc.com/resource/california-ai-transparency-laws-sb942-ab2013/); [Timewell](https://timewell.jp/en/columns/california-sb53-ab2013-sb942-deep-dive)

### Inferences
- **EU:** a game with AI NPCs that converse with players should disclose AI interaction under 50(1). If the studio ships its own gen-AI system (e.g., runtime image or voice generation), it may count as a "provider" with 50(2) marking duties; for systems placed on the market after Aug 2, 2026 those apply immediately. Pre-generated fictional game assets probably fall under the lighter 50(4) artistic/fictional regime, and only if they are deepfake-like (resembling real persons or places).
- **China and Korea:** publishers distributing there face labeling duties that reach "virtual scenes." How they apply to games in practice is unclear, which is a compliance risk for global launches.
- **California AB 2013:** a studio that trains or fine-tunes its own gen-AI model and makes it available to Californians may be a "developer" with training-data disclosure duties. This is uncertain and needs legal review.

### Gaps
- AI Act penalty levels for Art. 50 breaches, the Commission's Art. 50 guidelines and Official Journal publication of the Omnibus were not verified.
- No game-specific guidance was found from China (GB 45438-2025 treatment of games), Korea (enforcement decree) or the EU.
- Not checked: Japan, the UK (no AI Act equivalent), US federal proposals (NO FAKES Act), state digital-replica laws (California AB 2602/1836, Tennessee ELVIS Act), and the SB 942/AB 853 date (search budget).

---

## 7. Player reception: data on how players react

### Takeaway
Engaged "core" players are strongly hostile: Quantic Foundry found 85% negative, and acceptance of AI dialogue and quests collapsed between 2024 and 2025. Broad US samples are more neutral: Circana found about 25% less likely to buy, under 10% more interested, and the majority neutral. Commercially, AI use discovered in otherwise strong games has not hurt sales (Arc Raiders, Crimson Desert). The costs are reputational (award loss, apologies, refunds, review criticism). AI-flagged Steam games as a group do worse: they reach 100+ reviews at about 55% of the rate of non-AI games.

### Cited Findings
- **Quantic Foundry** (N=1,799, Oct–Dec 2025, self-selected and mostly core/PC players): 85% negative toward gen AI in games, and 63% chose the most negative option, which Nick Yee called "rare." Negativity toward AI-generated quests rose from 46% (2024) to 77%, and toward dialogue to 83%. Art, music, sound, narrative and dialogue are the most rejected uses; dynamic difficulty is the most accepted. Women, non-binary and younger players are more negative. — [GamesMarket](https://www.gamesmarket.global/quantic-foundry-most-gamers-are-negative-about-the-use-of-gen-ai-in-video-games)
- **Circana PlayerPulse** (US, Dec 2025): just over 25% would be less likely to buy, or would refuse, a game using gen AI for art, dialogue, text or music, up from about 22% in Mar 2024. Under 10% would be more interested. The majority are neutral or unsure. Mat Piscatella: "a vocal minority is against genAI usage." — [Outlook Respawn](https://respawn.outlookindia.com/gaming/gaming-news/do-gamers-care-about-genai-new-data-reveals-a-silent-majority); [Critical Hits](https://criticalhits.com.br/games/ia-nos-games-nao-preocupa-a-maioria-dos-jogadores-aponta-estudo/)
- **MIDiA Research:** 60% neutral, 19% negative, 20% positive. Date and sample not stated. — [Outlook Respawn](https://respawn.outlookindia.com/gaming/gaming-news/do-gamers-care-about-genai-new-data-reveals-a-silent-majority)
- **Steam market data** (Sulka Haro, Jul 2026; revenue estimates accurate only to order of magnitude):
  - AI-flagged games' share of sales (using reviews as a proxy) is about 10–27% in late 2025 and 2026, below their roughly 33% share of launches.
  - An AI-flagged title reaches 100+ reviews at about 55% of the non-AI rate, unchanged over two years.
  - Comparing 138 AI-disclosed hits with 400 flops: 72% of the flops disclosed AI art versus 57% of the hits. Hits were about 3× more likely to disclose AI voice (24% vs 8%) and localization (18% vs 6%), and they wrote longer, more hedged disclosures.
  - [Substack](https://fragwyz.substack.com/p/three-years-of-ai-on-steam)
- **Incident outcomes:**
  - Crimson Desert sold more than 3M in 5 days despite the AI scandal. — [Outlook Respawn](https://respawn.outlookindia.com/gaming/gaming-news/do-gamers-care-about-genai-new-data-reveals-a-silent-majority)
  - Arc Raiders reportedly sold more than 14M despite criticism of its AI voices. — [KitGuru](https://www.kitguru.net/page/27/!https:/www.kitguru.net/gaming/mustafa-mahmoud/some-of-arc-raiders-ai-voices-have-been-replaced-by-real-professional-actors/)
  - Clair Obscur lost its IGA awards. — [AV Club](https://www.avclub.com/clair-obscur-genai-iga-awards-rescinded)
  - Black Ops 7 players sought refunds. — [Beebom](https://beebom.com/black-ops-7-faces-backlash-after-player-reports-ai-calling-cards-and-gets-refunded/amp/)
  - Larian reversed course on concept art. — [Hitmarker](https://hitmarker.net/news/larian-confirms-that-it-will-no-longer-use-generative-ai-for-divinity-concept-art-and-writing-following-backlash-1615314)
  - Some games have been wrongly accused of AI art that was actually drawn by humans. — [The Conversation via Stuff](https://stuff.co.za/2026/02/12/are-video-game-developers-using-ai-players-want-to-know-but-the-rules-are-patchy/)
- An arXiv paper claims 60% of gamers are neutral if quality is high. Its sourcing is unclear, so treat with caution. — [arXiv](https://arxiv.org/pdf/2606.26114)

### Inferences
- A game marketed as "made mostly by AI" would face its most hostile audience among core PC players, the Steam audience where disclosure is mandatory. Neutral mass-market players matter more for sales, but the hits that got away with AI were already strong on quality and from established teams.
- Disclosure strategy matters. Concealment followed by discovery (Clair Obscur, Crimson Desert) produces the worst press, while specific, hedged disclosures correlate with the successful AI-flagged games. Voice and localization uses appear more tolerated than AI art.
- Award eligibility is a real cost: the Indie Game Awards exclude any gen-AI use. Other awards' policies were not checked.

### Gaps
- No rigorous causal study of sales impact from AI disclosure was found. The Steam figures are correlational and estimated.
- Review-bombing incidents tied specifically to AI were not systematically quantified.
- Award bodies' AI rules (The Game Awards, BAFTA, DICE, GDCA) in 2026 were not checked (search budget).
