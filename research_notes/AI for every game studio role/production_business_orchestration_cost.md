# AI for Production, Business, Marketing, Community and Live-Ops Roles; Orchestrating an "AI Studio"; and What It Costs (as of October 2026)

Research date: 2026-10-10. Sources from 2025 or earlier are labeled **[older]**. Many role-specific claims come from vendors or vendor-adjacent blogs, so they are flagged. The web-search budget ran out before every gap could be closed (see the Gaps sections).

Cross-cutting context:
- GDC 2026 State of the Game Industry (>2,300 professionals) found that 36% of game professionals use generative AI at work. The rate is 30% at game studios but **58% at publishers, support teams and marketing/PR firms, and 58% among business professionals**. That makes the non-dev functions covered here the heaviest adopters. The most-used tools were ChatGPT 74%, Gemini 37% and Copilot 22%. The most common uses were research and brainstorming (81%), daily tasks and code assistance (47% each) and prototyping (35%) — [GDC 2026 SOTI](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)
- In the same survey, 52% say GenAI is hurting the industry, up from 30% the year before and 18% the year before that. Only about 7% see a positive impact, but executives and business-ops staff are at 19% positive. 28% of respondents were laid off in the past two years (33% of US respondents) — [GDC 2026 SOTI](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)

---

## A1. Producer / project manager (scheduling, task tracking, risk): which AI is best, and how does it compare with a human?

### Takeaway
No AI system can yet act as an accountable producer. The best 2026 options are LLM agents embedded in the tracker, mainly Atlassian Rovo inside Jira/Confluence, or a frontier model (Claude, GPT, Gemini) connected to the tracker through MCP or an API. They handle status synthesis, ticket hygiene, meeting notes and risk logs well. They fail at negotiation, prioritization trade-offs between disciplines, and resisting social pressure.

### Cited Findings
- Atlassian bundles Rovo (search, chat, agents) into paid Jira and Confluence tiers through a monthly per-user credit allowance, reported as 25, 70 or 150 credits per user depending on tier. Credits are pooled across the org, so heavy agent use can exceed the allowance — [eesel.ai (third-party)](https://www.eesel.ai/blog/atlassian-intelligence-cost-breakdown); [Redress Compliance](https://redresscompliance.com/atlassian-rovo-ai-licensing-cost-negotiation)
- Jira seat prices are reported at about $7.91 (Standard) and $14.54–15.63 (Premium) per user per month after the Oct 15, 2025 increases. The Rovo Dev coding agent is reportedly $20 per developer per month. The JSM virtual service agent is reportedly metered at $1 per AI-resolved conversation — [eesel.ai](https://www.eesel.ai/blog/atlassian-intelligence-cost-breakdown); [automationatlas](https://automationatlas.io/answers/jira-pricing-explained-2026/)
- One source reports that Atlassian began collecting customer metadata by default in 2026 to train AI, with opt-out only on Enterprise. This is relevant for studios with NDA-bound projects (unverified against Atlassian's own policy) — [Redress Compliance](https://redresscompliance.com/atlassian-rovo-ai-licensing-cost-negotiation)
- TheAgentCompany benchmark simulates a small software company. Its tasks span software engineering, project management, HR, finance and admin; one summary counts 175 tasks. The arXiv abstract says the "most competitive agent can complete 30% of tasks autonomously", and that "more difficult long-horizon tasks are still beyond the reach of current systems." The latest paper version is v3, 10 Sep 2025 **[older]** — [arXiv 2412.14161](https://arxiv.org/abs/2412.14161); [Catalaize summary: Gemini-2.5-Pro ~30% of 175 tasks](https://catalaize.substack.com/p/ai-agents-at-work)
- An unverified aggregator lists DeepSeek-V3.2-Exp at 52.4% on TheAgentCompany as of Aug 20, 2026 — [anotherwrapper (aggregator, unverified)](https://anotherwrapper.com/tools/llm-pricing/evals/the-agent-company)
- Anthropic Project Vend phase 2 (Dec 2025) **[older]** is the best public evidence of an AI "manager" layer. Adding an AI CEO ("Seymour Cash") above the shopkeeper agent cut discounts about 80% and halved free items. But the CEO "approved lenient treatment requests about eight times as often as it denied them" and drifted into unproductive "eternal transcendence" exchanges. Staff also convinced the shopkeeper that a fake CEO had been elected. Anthropic concludes "the gap between 'capable' and 'completely robust' remains wide" — [Anthropic, Project Vend 2](https://www.anthropic.com/research/project-vend-2)
- What worked in Vend was process: forcing the agent to verify prices and delivery times with research tools produced realistic plans ("bureaucracy matters"), and splitting roles across agents also helped — [Anthropic, Project Vend 2](https://www.anthropic.com/research/project-vend-2)

### Inferences
- **Best-in-class, Oct 2026:** a frontier model at Opus or Fable tier, or GPT-5.5, connected to Jira, Linear or Confluence and Slack through MCP, used as a "producer's chief of staff". It drafts sprint reports, flags slipping epics, writes risk registers and summarizes stand-ups. Rovo is the lowest-friction choice for Atlassian shops.
- **Versus a human:** roughly a strong junior PM or coordinator on information-processing tasks, faster and always on. It is clearly worse than a mid or senior producer on scope negotiation, morale, vendor and publisher relationships, and recognizing that a schedule is fiction. Vend shows that hierarchical AI oversight inherits the same blind spots as the agent it oversees, so a human producer must sit at the top.

### Gaps
- No 2026 benchmark or case study was found for Linear, Asana AI Teammates, Monday.com agents, Notion agents, Codecks or Perforce Hansoft (P4 Plan) on game production.
- I could not verify TheAgentCompany's per-department breakdown (PM vs HR vs finance) or an official 2026 leaderboard.

---

## A2. Product manager / monetization designer: which AI is best, and how does it compare with a human?

### Takeaway
2026 tooling is mostly live-ops and offer-personalization platforms adding AI layers (ByteBrew Shift AI, Balancy, Elevatix), plus general LLMs for market research. There is no independent evidence that an AI can own monetization strategy. Vend shows that LLMs default to "friendly" pricing rather than revenue-maximizing pricing, and monetization design carries ethical and regulatory exposure (loot boxes, dark patterns).

### Cited Findings
- ByteBrew (Sept 2026) launched "Shift AI". A studio tells it what to change, and "a single message deploys live updates through ByteBrew's Remote Configs and A/B Tests". It can adjust pricing or offers per segment and "move a lower-spending user toward ad-supported monetization" (vendor release) — [DestinationCRM / ByteBrew](https://www.destinationcrm.com/Articles/CRM-News/CRM-Across-the-Wire/ByteBrew-Brings-Live-Operations-into-App-Developers-AI-Workflows-176456.aspx)
- Elevatix markets an AI engine for "full-cycle automated LiveOps" with smart segmentation and customer-centric IAP monetization (vendor claim) — [Elevatix](https://www.elevatix.io/about-us)
- Balancy's CEO expects publishers to run real-time tuning loops without client updates and to roll out live-ops mechanics across a whole portfolio. The same 2026 discussion frames AI as "a production tool rather than a strategy engine" and advises treating personalization "as UX design — not as hidden advantage" — [Mobidictum webinar recap](https://mobidictum.com/liveops-in-2026-trends-pressures-what-comes-next/)
- In Project Vend, Anthropic notes that helpfulness training made the models decide "like friendly people rather than hard-nosed businesspeople". The shopkeeper was repeatedly talked into discounts and bad deals **[Dec 2025]** — [Anthropic, Project Vend 2](https://www.anthropic.com/research/project-vend-2)

### Inferences
- **Best-in-class:** for analysis and spec writing, a frontier LLM with data access drafting economy models, offer calendars and pricing tests. For execution, a live-ops platform with an AI layer (ByteBrew, Balancy, Elevatix) or ML segmentation in the studio's own stack.
- **Versus a human:** good at generating test variants and economy spreadsheets. It cannot be trusted to set strategy, because it has the friendly-pricing bias and no accountability for player trust or loot-box regulation. A human monetization lead stays essential. AI makes one designer cover more SKUs and segments.

### Gaps
- No independent revenue-uplift data for AI-driven offer personalization (only vendor claims).
- No coverage found of Sensor Tower, AppMagic or Naavik AI products for market and competitor analysis in 2026.

---

## A3. Data analyst / player analytics: which AI is best, and how does it compare with a human?

### Takeaway
Conversational analytics agents are shipping inside game-analytics and data tools, such as GameAnalytics' AI Agent (early access) and JetBrains Databao. They are useful for ad-hoc questions over a governed semantic layer. Public benchmarks of hard, multi-step data-agent work showed low accuracy through 2025, and I found no 2026 leaderboard. AI is a productivity multiplier for analysts, not a replacement for experiment design or causal judgment.

### Cited Findings
- GameAnalytics ships an "AI Agent", an in-tool assistant "that answers questions about your game data in plain language". It is available on all plans with message limits and labeled Early Access (Labs) with "deliberately limited scope" — [GameAnalytics docs](https://docs.gameanalytics.com/products-and-features/analytics-iq/ai-agent/overview)
- JetBrains claims its Databao agent ranked #1 on Spider 2.0–DBT as of Feb 2026. That benchmark covers dbt project repair, and the claim is the vendor's own — [JetBrains Databao blog](https://blog.jetbrains.com/databao/tag/data-agent/)
- On the DABstep data-agent benchmark (Adyen and Hugging Face, early 2025), the best agent reached only about 14.55–16% accuracy on hard multi-step tasks **[older]** — [Hugging Face DABstep](https://huggingface.co/blog/dabstep); [arXiv 2506.23719](https://www.arxiv.org/abs/2506.23719)
- METR notes that time horizons vary sharply by domain ("40-100x lower for visual computer use tasks"). A task's dollar value did not correlate with model success on SWE-Lancer, and benchmark tasks differ from real work in context, definition and "messiness" — [METR, Jan 2026](https://metr.org/notes/2026-01-22-time-horizon-limitations/)
- Claims of "85% churn-prediction accuracy / 30% revenue gains" circulate in AI wikis with no primary source, so treat them as unverified — [AI wiki (unverified)](https://artificial-intelligence-wiki.com/industry-ai/ai-in-gaming/ai-game-player-analytics/)

### Inferences
- **Best-in-class:** a frontier model (Claude Opus or Fable tier, GPT-5.5 or Gemini) with code execution, connected to the warehouse (BigQuery, Snowflake, Databricks) and a documented metric layer. Add the vendor's native assistant (GameAnalytics AI Agent) for quick questions.
- **Versus a human:** near a competent junior analyst for SQL, dashboard and cohort questions on clean, documented data, and much faster. It is weaker than a senior analyst at choosing the right question, A/B test design and power, spotting instrumentation bugs, and causal interpretation. Mistakes are silent: the numbers look plausible.

### Gaps
- No 2026 leaderboard results for DABstep, Spider 2.0 or BIRD were retrieved. I found no Amplitude, Mixpanel, devtodev, Unity Analytics or Databricks Genie game case studies.

---

## A4. Marketing (trailer editing, key art, ad creatives, store page copy, SEO/ASO): which AI is best, and how does it compare with a human?

### Takeaway
Image and video models are production-capable for drafts, variants and internal pitch material. The binding constraint in 2026 is audience backlash, not quality: several studios pulled or re-edited AI-tainted trailers and key art in 2026. For core PC and console audiences, AI is safest behind the scenes (copy variants, localization, storyboards, edit assists) rather than in hero assets.

### Cited Findings
- **Backlash cases in 2026:**
  - Level-5 (Sept 2026) admitted experimenting with AI in its VISION 2026 II showcase trailers and re-uploaded corrected versions — [Time News](https://time.news/level-5-scrambles-to-reupload-trailers-amid-ai-backlash/)
  - System 3's James Pond trailer (Aug 2026) drew accusations of AI renders. The publisher denies them and disabled YouTube comments — [Nintendo Life](https://www.nintendolife.com/news/2026/08/james-pond-publisher-denies-ai-generated-trailer-but-no-ones-buying-it)
  - Jagex pulled a RuneScape trailer made by a "trusted" external partner after generated artwork was spotted (six-fingered character) and reaffirmed an anti-AI stance — [FRVR](https://frvr.com/blog/news/runescape-trailer-axed-over-ai-footage-from-trusted-partners-as-jagex-reinforces-its-clear-anti-ai-stance)
  - Panache Games removed AI assets from 1666: Amsterdam Early Access — [welcome.ai](https://www.welcome.ai/content/panache-games-responds-to-community-backlash-by-dropping-ai-art)
  - Kotaku published a list of Opening Night Live 2026 games to "ignore because of GenAI slop", and developers are now asked to prove trailers are human-made with behind-the-scenes footage — [Kotaku](https://kotaku.com/opening-night-live-2026-genai-slop-games-geoff-keighley-2000728477)
  - Studios are scrapping or rethinking releases under gamer pressure (Jan 2026) — [Slashdot](https://games.slashdot.org/story/26/01/26/1359241/angry-gamers-are-forcing-studios-to-scrap-or-rethink-new-releases)
- **Steam disclosure data:** a census of about 53,600 Steam releases found AI-disclosed games at 10.9% in 2024, 19.9% in 2025 and **30.8% of 2026 releases so far**. Those games accounted for only about **10–27% of estimated sales**. The disclosure flag is binary (one upscaled texture counts the same as a fully generated art set). Valve's Jan 2026 rule change narrowed disclosure to content players actually see — [Three years of AI on Steam (primary census)](https://fragwyz.substack.com/p/three-years-of-ai-on-steam); [games.gg](https://games.gg/news/steam-ai-disclosure-games-2028-trend/)
  - Other counts conflict: a July 2026 review found about 1 in 5 games carry a label, and one June 2026 week had 40% — [Tech-Insider](https://tech-insider.org/steam-ai-disclosure-2026)
- **Key-art tooling price:** Midjourney has four tiers: Basic $10/mo (~200 images), Standard $30 (15 fast hours), Pro $60 (30 fast hours, adds Stealth Mode for private generations) and Mega $120 (60 fast hours). There is no official API — [eesel.ai (third-party)](https://eesel.ai/blog/midjourney-pricing)
- GDC 2026: 58% of respondents at marketing/PR firms and publishers use GenAI, versus 30% at studios — [GDC 2026 SOTI](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)

### Inferences
- **Best-in-class by task:**
  - Key art ideation: Midjourney, Google's image models, or OpenAI image generation.
  - Trailer: AI-assisted editing, plus video models (Veo, Runway, Kling) for animatics and B-roll previs.
  - Copy, store page, ASO and SEO: frontier LLMs for copy variants and 20–40-language localization, combined with ASO keyword tools.
- **Versus a human:** for volume (copy variants, localization, resizes) AI exceeds a junior marketer. For brand-defining hero assets, AI output is currently a liability for PC and console titles: detection means public backlash and possible sales impact (AI-disclosed games under-index on sales share). Humans own brand voice, creative direction and platform-holder relations. "Human-made" provenance is becoming a marketing asset in its own right.

### Gaps
- No 2026 evidence was found on AI trailer-editing tools (e.g., Adobe Premiere generative features) used by game studios, or on ASO tools (AppTweak, Sensor Tower) AI features. Veo, Sora and Runway per-second pricing and ElevenLabs pricing were not retrieved before the search budget ran out.

---

## A5. User acquisition / performance marketing (AppLovin AXON, Meta Advantage+, AI creative generation): which AI is best, and how does it compare with a human?

### Takeaway
UA is the most automated non-dev function. Bidding, targeting and placement are already run by platform ML (AppLovin's Axon model, Meta Advantage+), and 2025–2026 added generative creative: AppLovin interactive and video ad automation in pilot, Meta's goal of end-to-end AI ads by end-2026, and agentic creative vendors such as Sett and Layer for playables. Humans shift to creative strategy, budget allocation, incrementality measurement and brand safety.

### Cited Findings
- AppLovin's advertiser dashboard was reportedly renamed "AppLovin Ads" on June 22, 2026; "Axon" now refers to the AI model. Self-serve access was opened up during 2026. GenAI creative tools were "in pilot with more than 100 advertisers" (secondary) — [Common Thread Collective](https://commonthreadco.com/blogs/coachs-corner/applovin-axon-self-serve-ecommerce-june-2026); [MLQ.ai](https://mlq.ai/news/applovins-e-commerce-push-hinges-on-self-serve-launch-and-creative-automation-in-first-half-of-2026/)
- AppLovin's own blog describes an automated pipeline generating interactive ad units for web advertisers, with "a few hundred advertisers" opted in — [AppLovin blog](https://www.applovin.com/en/blog/automating-creative)
- For game studios, AppLovin's SparkLabs is the in-house creative design and testing service ("dynamic templates and AI-powered optimization") — [AdManage (vendor)](https://admanage.ai/blog/best-bulk-applovin-axon-ad-launch-tools)
- Meta reportedly aims to let advertisers create and target ads fully with AI by end-2026: supply a product image and budget, and AI produces visuals, copy, targeting and placement **[plan reported mid-2025]** — [MediaPost](https://www.mediapost.com/publications/article/406315/)
  - In June 2025 Meta expanded Advantage+ with brand-consistent generative tools (logos, colors, fonts, tone) and added AI Dubbing — [Campaign Asia](https://aws2.campaignasia.com/article/meta-expands-advantage-with-gen-ai-ad-creativity-tools-for-advertisers/503131)
  - A Meta internal figure of 22% ROAS improvement from its AI ad tools is reported in trade press (company-sourced; exact primary not retrieved) — [Influencer Marketing Hub](https://influencermarketinghub.com/meta-radical-plan-to-reinvent-digital-ads-with-ai/)
- Sett positions agents that research what creative directions work, generate video and playable ads, and deploy them to networks — [Sett](https://www.sett.ai/)
- Layer launched an AI playable-ad generator that "builds complete HTML5 playable ads in hours, not weeks", and notes that only tier-one titles typically get playables (sponsored post) — [PocketGamer.biz](https://www.pocketgamer.biz/layer-launches-ai-playable-ad-generator-to-tackle-production-bottlenecks-for-mobile-game-studios/)
- Gamelight forecasts that about half of gaming UA creatives will have AI-generated hooks or be fully AI-built by end-2026 (vendor-cited forecast) — [Segwise 2026 playbook](https://segwise.ai/blog/ai-mobile-game-marketing-playbook-2026)
- Cost claims, from vendor and secondary sources and unverified:
  - AI playable tools cut a working HTML5 prototype to under $2,000, versus $30K–80K for custom units — [Coinis glossary](https://coinis.com/glossary/playable-mobile-ads)
  - AI video clips cost $50–200 each versus $500–2,000 for a live shoot — [Segwise tools roundup](https://segwise.ai/blog/ai-tools-create-ua-ads-mobile-games-apps)
- Commentary warns that "players recognize AI-generated facecams instantly" — [Segwise 2026 playbook](https://segwise.ai/blog/ai-mobile-game-marketing-playbook-2026)

### Inferences
- **Best-in-class:** AppLovin (Axon) for mobile games, given its dominant network and model; Meta Advantage+ (app campaigns); Google App Campaigns. Generative creative is layered on through platform tools (SparkLabs, Advantage+ creative) and specialist agents (Sett, Layer, Segwise for creative analytics).
- **Versus a human:** AI already beats humans at bidding and audience optimization and is approaching parity on volume creative iteration. A human UA lead is still needed for budget, LTV and ROAS model governance, incrementality testing, platform-mix decisions and creative strategy. One UA manager with AI tooling can probably do work that previously needed a small creative-and-UA team (inference).

### Gaps
- No independent (non-vendor) 2026 measurement of AI-generated creatives versus human-made ones for game CPI or ROAS. Unity Vector, TikTok Symphony and Google App Campaign gen-AI asset results for games were not retrieved.

---

## A6. Community manager / social media: which AI is best, and how does it compare with a human?

### Takeaway
This is the weakest case for AI replacement. Tools exist for Discord automation, sentiment summaries and drafting posts, but evidence is mostly vendor marketing. With 52% of developers, and a vocal share of players, hostile to GenAI, AI replies passed off as a human community manager are a reputational risk.

### Cited Findings
- 2026 tools include Discord analytics and retention tools (Discorder.tools) and AI Discord assistants (Cordbot) for polls, events, channel management and "community insights" (vendor pages) — [YourStory / Discorder.tools](https://yourstory.com/companies/discordertools); [G2 / Cordbot](https://ai.g2.com/marketplace/tools/cordbot)
- A May 2026 practitioner guide advises using AI on repetitive work and keeping relationships and escalations human. It warns against AI replies passed off as a human manager's and against sentiment percentages built from small samples — [The AI Career Lab](https://theaicareerlab.com/blog/best-ai-tools-for-community-managers-2026)
- Career outlook: the role is expected to shift toward prompt design, moderation policy and analytics — [CareerExplorer](https://www.careerexplorer.com/careers/ai-community-manager/ai-impact/)
- Player backlash context: studios now have to prove marketing materials are human-made — [Kotaku](https://kotaku.com/opening-night-live-2026-genai-slop-games-geoff-keighley-2000728477); GDC 2026 negative sentiment is at 52% — [GDC 2026 SOTI](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)

### Inferences
- **Best-in-class:** a frontier LLM for drafting patch notes, social posts and FAQ answers, and for daily sentiment digests across Discord, Reddit, Steam reviews and X. Discord AutoMod and GGWP-style tools handle moderation (see A9).
- **Versus a human:** AI is a strong assistant (summaries, drafts, translation) but cannot be the studio's public face. Authenticity, crisis communication and relationships with creators and moderators require a human. The risk is asymmetric: one exposed AI-written apology can cost more than the labor saved.

### Gaps
- I found no rigorous studio case study of AI community management, and no Sprout Social, Hootsuite or Discord first-party AI data for games.

---

## A7. Player support / customer service (AI support agents): which AI is best, and how does it compare with a human?

### Takeaway
This is the most proven non-dev AI deployment. Gaming-native Helpshift (Keywords Studios) reports 50–91% automation or deflection in case studies. General platforms (Intercom Fin, Zendesk AI agents) have moved to outcome pricing of about $1–2 per resolution. AI handles tier-1 well. Humans stay for purchase disputes, bans and appeals, account recovery edge cases, VIP whales, and anything legal or safety-related.

### Cited Findings
- **Helpshift (Keywords Studios):** "AI-native player engagement platform" serving 500+ studios, with intent classification, bot workflows and machine translation in 150+ languages. Keywords claims "over 50% automation"; another index cites 70%+. Case studies report Rovio at 91% deflection across 23 titles and SYBO (Subway Surfers) at 77% automation. Pricing is custom; one review estimates about $25K/yr for smaller deployments — [Keywords Studios](https://www.keywordsstudios.com/en/innovation/ai-technology/helpshift/); [eesel.ai review](https://www.eesel.ai/blog/helpshift-review); [AI Agent Index](https://theaiagentindex.com/agents/helpshift)
- **Intercom Fin:**
  - About $0.99 per resolution, with per-seat helpdesk pricing of roughly $29–132 per seat per month and a 50-outcome monthly minimum outside Intercom's helpdesk. Intercom claims about a 67% resolution rate across 40M+ conversations (vendor) — [Gleap (competitor blog)](https://www.gleap.io/blog/intercom-fin-ai-pricing-2026); [SiteGPT (competitor blog)](https://sitegpt.ai/blog/intercom-fin-ai-review)
  - Critics note that a "resolution" is billed when no further help is requested, even if the user simply gave up — [SiteGPT](https://sitegpt.ai/blog/intercom-fin-ai-review)
- **Zendesk:** announced outcome-based pricing for AI agents at Relate 2026 (May). Customers pay only for resolutions verified by a separate AI evaluation model. Third parties estimate about $2.00 pay-as-you-go and about $1.50 on committed volume (Zendesk does not publish the rate). Suites include a small monthly allowance (5, 10 or 15 resolutions per agent) — [Futurum](https://futurumgroup.com/insights/zendesk-bets-on-autonomous-ai-agents-outcome-pricing-to-upend-service-models/); [Voiceflow](https://www.voiceflow.com/blog/zendesk-pricing); [CMSWire](https://cmswire.com/customer-experience/zendesk-unveils-autonomous-ai-workforce-at-relate-2026)
- **Atlassian JSM** virtual agent: reportedly $1 per AI-resolved conversation — [eesel.ai](https://www.eesel.ai/blog/atlassian-intelligence-cost-breakdown)

### Inferences
- **Best-in-class for games:** Helpshift for mobile F2P at scale, because it is gaming-native with SDK and in-game integration. Intercom Fin or Zendesk AI agents suit PC, console and web studios already on those helpdesks. Custom Claude or GPT agents over the studio's own APIs are an option where tight integration with account and purchase systems is needed.
- **Versus a human:** AI is better than tier-1 humans on speed, 24/7 coverage and language coverage, and roughly at parity on accuracy for FAQ-type tickets. It is worse on judgment calls such as refunds and fraud, chargeback disputes, harassment reports and angry high-value players. Realistically, 50–80% of volume can be automated, leaving a smaller, more senior human team.
- **Cost logic:** at $1–2 per resolution, 10,000 tickets a month at a 65% automation rate means about 6,500 resolutions, or roughly $6.5K–13K a month, plus seats for the residual human queue (inference built from the cited prices).

### Gaps
- No independent study of AI-resolved ticket quality or CSAT in games was found. No public human cost-per-ticket benchmark for games was retrieved.

---

## A8. Live ops / content scheduling: which AI is best, and how does it compare with a human?

### Takeaway
2026 live ops is moving toward templatized events, real-time segmentation and AI-driven tuning loops, with platforms (Balancy, ByteBrew, Elevatix) adding natural-language agent layers that can push remote-config and A/B changes. Calendar planning, event tuning and segmentation are increasingly automatable. Humans own the content calendar's creative intent, economy safety limits and incident response.

### Cited Findings
- 2026 live-ops trends were named as "templatisation, personalisation and AI" — [PocketGamer.biz](https://www.pocketgamer.biz/2026-live-ops-trends-templatisation-personalisation-and-ai)
- Studios use AI to segment players in real time and tune event difficulty ("if an event is too hard, players quit. If it's too easy, they don't spend") — [AppSamurai](https://appsamurai.com/blog/the-liveops-playbook-what-actually-works-in-mobile-games-today/)
- ByteBrew Shift AI (Sept 2026) deploys remote-config and A/B changes from a single natural-language instruction (vendor) — [DestinationCRM](https://www.destinationcrm.com/Articles/CRM-News/CRM-Across-the-Wire/ByteBrew-Brings-Live-Operations-into-App-Developers-AI-Workflows-176456.aspx)
- Balancy describes building a mechanic once and rolling it out across a portfolio with minimal adjustment — [Mobidictum](https://mobidictum.com/liveops-in-2026-trends-pressures-what-comes-next/)

### Inferences
- **Best-in-class:** a live-ops platform (Balancy, ByteBrew, Elevatix or in-house) driven by an LLM agent through its API, with human-approved guardrails such as price floors and ceilings, reward caps and rollback.
- **Versus a human:** good at execution: scheduling, segment-targeted variants, monitoring dashboards and drafting event copy. It needs human sign-off on anything touching the economy or monetization. A misconfigured event can cost real revenue within hours, and agents can deploy it in one message.

### Gaps
- I found no independent before-and-after KPI data for AI-run live ops. Nothing was retrieved about live-ops AI at large PC and console live-service studios.

---

## A9. Trust & safety / moderation (Modulate ToxMod, GGWP, Roblox safety AI): which AI is best, and how does it compare with a human?

### Takeaway
This is the most mature AI deployment in non-dev game work, because the scale (millions of voice hours) makes human-only moderation impossible. The leaders are Modulate ToxMod (voice), GGWP (cross-channel and reputation), and Roblox's in-house models, now partly open-sourced through ROOST. AI does detection and triage; humans set policy, handle appeals and legal reporting, and catch false positives.

### Cited Findings
- **Modulate ToxMod:**
  - In Rainbow Six Siege (Ubisoft; ToxMod in production since Sept 2025), Modulate reports that critical toxic voice chat fell 50% and general voice toxicity about 30% after enforcement. It processes about 800,000 voice hours a month there, and Ubisoft renewed the deal. ToxMod was integrated with Discord's Social SDK in Jan 2026 (vendor press release, Aug 2026) — [EE Journal / Modulate press release](https://www.eejournal.com/industry_news/tom-clancys-rainbow-six-siege-cuts-critical-toxic-voice-chat-by-50-with-modulates-toxmod/)
  - Call of Duty: toxicity exposure fell 25% in MWII and Warzone, and about 50% in MWIII **[older]** — [Modulate/Activision case study](https://www.modulate.ai/case-studies/modulate-activision-case-study)
  - Schell Games reported at least 95% detection accuracy for severe infractions **[older]** — [Modulate/Schell](https://modulate.ai/customer-stories/schell-games-elevates-player-safety-with-toxmod)
- **GGWP:**
  - "Community Copilot" covers text, voice (12 languages), usernames and Discord, plus report triage and long-term player reputation. GGWP claims tens of billions of messages moderated across 100+ games, with partners including Unity, Sony, Krafton and Fandom. It expanded beyond gaming and raised a $15M Series A in May 2026 — [GlobeNewswire (May 21, 2026)](https://www.globenewswire.com/news-release/2026/05/21/3299363/0/en/GGWP-Expands-Beyond-Gaming-Bringing-Behavior-Based-Trust-and-Safety-to-New-Industries.html)
  - The Omeda Studios (Predecessor) case study reports fewer offensive messages and repeat infractions — [GamesBeat](https://gamesbeat.com/how-ggwp-helped-omeda-studios-curb-toxicity-in-predecessor-case-study/)
  - A 2026 comparison positions GGWP as broader community management and ToxMod as the voice specialist — [TwoAverageGamers](https://www.twoaveragegamers.com/toxmod-vs-ggwp-which-ai-moderation-tool-is-actually-better-2026/)
- **Roblox:**
  - Open-sourced three safety models through ROOST (co-founded with Google, OpenAI and Discord): a PII classifier, Sentinel (early detection of child-endangerment signals) and its voice safety classifier (8 violation categories, 30 languages) — [GameDev.net](https://gamedev.net/news/roblox-makes-three-of-its-ai-safety-tools-open-source-r5226/); [WN Hub](https://wnhub.io/news/engines/item-51839)
  - Sentinel helped file about 1,200 NCMEC reports in H1 2025 — [WN Hub](https://wnhub.io/news/engines/item-51839)
  - A secondary source claims about 70% of child-endangerment cases in the 12 months to Aug 7, 2026 came from Sentinel's early detection rather than user reports. It also claims the voice model catches 61% of violations at a 1% false-positive rate, and that the facial age estimation (Persona-based) has a 1.4-year mean absolute error for under-18s. These figures are unverified — [TechNerdiness](https://www.technerdiness.com/roblox/roblox-ai-child-safety-features/)
  - Age estimation (facial estimation plus ID plus parental consent) is required for communication features — [Roblox newsroom (Sept 2025) [older]](https://about.roblox.com/newsroom/2025/09/roblox-to-expand-age-estimation-to-all-users)

### Inferences
- **Best-in-class:** ToxMod for voice-heavy competitive games. GGWP for an all-in-one (text, voice, reputation, report triage) stack, especially for mid-size studios. Roblox's ROOST models are a free building block for in-house pipelines.
- **Versus a human:** AI far exceeds humans on coverage and latency (no human team can listen to 800K hours a month). It is weaker on context, sarcasm and in-group banter, and on appeal fairness. Humans remain essential for policy, appeals, law-enforcement and NCMEC reporting, and regulatory compliance (UK OSA, EU DSA). This is AI plus a smaller, more specialized human T&S team, not AI alone.

### Gaps
- ToxMod and GGWP pricing is not public. No independent evaluation of the 2026 vendor claims was found. Xbox and PlayStation first-party moderation AI was not covered.

---

## A10. Business development, legal, HR, finance (brief): which AI is best, and how does it compare with a human?

### Takeaway
LLMs speed up drafting, research, contract review and bookkeeping, but these functions carry legal accountability that AI cannot hold. 2026 evidence (a fast-growing count of court sanctions for hallucinated citations, US courts upholding human-authorship-only copyright, and Vend agents nearly breaking commodity and wage laws) means a human signatory or professional must stay in the loop.

### Cited Findings
- About **1,598 court decisions worldwide** (as of June 9, 2026) involved AI-fabricated citations, up from about 200 a year earlier, with about 8 new cases a day. Of these, 496 involved licensed attorneys. The US count was 1,058 (about 60% pro se, 40% attorneys). US courts imposed over $145K in AI-filing penalties in Q1 2026, and in *Withers v. City of Aberdeen* (N.D. Miss., June 2026) two lead attorneys were suspended for two years. All of this draws on Charlotin's AI Hallucination Cases database — [HAQQ audit](https://haqq.ai/es/blog/ai-legal-hallucination-audit); [UNC Law Library](https://library.law.unc.edu/2026/06/handling-hallucinations-a-reflection/)
- On **March 2, 2026** the US Supreme Court denied cert in *Thaler v. Perlmutter*, leaving the human-authorship requirement intact. The Copyright Office's Jan 2025 position is that prompts alone are insufficient for copyright — [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/03/supreme-court-denies-review-in-ai-authorship-case); [Morgan Lewis](https://www.morganlewis.com/pubs/2026/03/us-supreme-court-declines-to-consider-whether-ai-alone-can-create-copyrighted-works)
- In Project Vend, the agents nearly agreed to an onion price-lock contract that would have violated the 1958 Onion Futures Act. They also proposed paying a security worker $10/hr, below California minimum wage **[Dec 2025]** — [Anthropic, Project Vend 2](https://www.anthropic.com/research/project-vend-2)
- TheAgentCompany includes HR, finance and admin tasks in its simulated company. The best agent completed about 30% of all tasks **[2025]** — [arXiv 2412.14161](https://arxiv.org/abs/2412.14161)

### Inferences
- **Best-in-class:** frontier LLMs (Claude, GPT, Gemini) with document tools for first drafts of NDAs, publishing-deal redlines, pitch decks, job descriptions and financial models. Legal-specific platforms (e.g., Harvey) and finance automation exist, but they were not evaluated here.
- **Versus a human:** a strong paralegal or analyst-level drafter. It cannot sign, be liable, or reliably catch its own fabricated citations or statutory traps. Copyright ownership of AI-generated game assets depends on documented human authorship, so legal must also govern the AI pipeline itself.

### Gaps
- No 2026 game-specific evidence on AI in publishing-deal negotiation, platform certification, HR (hiring, performance) or finance close. Harvey, Legora, Ramp and Rillet data were not retrieved.

---

## B1. How would a team of AI agents be orchestrated? Frameworks and research (ChatDev, MetaGPT, TheAgentCompany, Project Vend, Claude Agent SDK, OpenAI Agents SDK, Google ADK)

### Takeaway
Two design families exist:
- **Role-play "software company" frameworks** (ChatDev, MetaGPT/MGX): agents assigned human job titles and coordinated by SOPs.
- **Production agent harnesses** (Claude Agent SDK and Managed Agents, OpenAI Agents SDK, Google ADK): an orchestrator plus subagents or handoffs, tools and tracing.

The best 2026 evidence (Anthropic's 16-agent C compiler) shows parallel agents coordinated through **git, lock files and an excellent test suite**, with no chatty orchestrator, can build very large artifacts. Research on multi-agent failures says most breakdowns are organization-design problems (unclear roles, brittle handoffs, weak verification), not raw model limits.

### Cited Findings
- **MetaGPT** encodes "SOPs" with product manager, architect, project manager and engineer agents. Its commercial product MGX ("AI agent development team") launched Feb 19, 2025 **[older]**. The MIT-licensed repo had about 70K GitHub stars by Sept 2026 (third-party count) — [MetaGPT README](https://cdn.jsdelivr.net/gh/FoundationAgents/MetaGPT@main/README.md); [PromptQuorum review](https://www.promptquorum.com/power-local-llm/metagpt-review)
- **Why multi-agent systems fail (MAST, UC Berkeley):** 1,600+ annotated traces from 7 popular frameworks, a taxonomy of 14 failure modes in 3 categories (specification and system design, inter-agent misalignment, task verification), kappa = 0.88. The authors conclude that failures "often stem from system design issues", not just LLM limits **[2025]** — [arXiv 2503.13657](https://arxiv.org/pdf/2503.13657)
  - A secondary summary reports ChatDev at about 75% failure and MetaGPT with similarly high rates; I did not verify this against the paper's Figure 1 — [Substack summary](https://jagadeeshrajarajan.substack.com/p/why-do-most-multi-agent-llm-systems)
  - Commentary: multi-agent systems "fail like organizations" — [Antoine Buteau](https://www.antoinebuteau.com/multi-agent-systems-fail-like-organizations/)
- **TheAgentCompany:** a simulated small software company (SDE, PM, HR, finance and admin tasks). The best agent completed about 30% autonomously **[v3 Sept 2025]**; an unverified aggregator shows 52.4% (DeepSeek-V3.2-Exp, Aug 2026) — [arXiv](https://arxiv.org/abs/2412.14161); [aggregator](https://anotherwrapper.com/tools/llm-pricing/evals/the-agent-company)
- **Project Vend 2** (multi-agent business: shopkeeper, CEO and merch agents; Claude Sonnet 4/4.5) **[Dec 2025]**:
  - It became mostly profitable and expanded to SF, NYC and London. Role separation and forced verification helped; agents were still manipulable and "still needed a great deal of human support" — [Anthropic](https://www.anthropic.com/research/project-vend-2)
  - In a WSJ newsroom version, about 70 journalists talked the agent into zero prices twice, including with a forged memo suspending its supervisor. It gave away a PS5, wine and a live betta fish and ended more than $1,000 in the red — [LetsDataScience](https://letsdatascience.com/news/anthropic-experiment-exposes-agentic-commerce-risks-02e261ae); [Gigazine](https://gigazine.net/gsc_news/en/20251219-anthropic-project-vend-phase-two)
- **Anthropic "agent teams" C compiler (Feb 5, 2026):**
  - Scale: 16 parallel Claude Opus 4.6 instances, about two weeks, nearly 2,000 Claude Code sessions, about 2B input and 140M output tokens, just under **$20,000** in API cost. The result was a roughly 100K-line Rust C compiler that builds Linux 6.9 on x86, ARM and RISC-V.
  - Coordination: each agent runs in its own Docker container, claims tasks with lock files in `current_tasks/`, and syncs through git with frequent merge conflicts. There is **no orchestrator agent**; agents pick "the next most obvious" problem. Specialized roles covered deduplication, performance, codegen, a Rust-style design critic and docs.
  - Problems: new features broke old ones until CI was added, and output efficiency is worse than GCC -O0. The author's warning: "it is easy to see tests pass and assume the job is done, when this is rarely the case"; and "fully autonomous development comes with real risks" — [Anthropic Engineering](https://www.anthropic.com/engineering/building-c-compiler); [The Register](https://www.theregister.com/2026/02/09/claude_opus_46_compiler/)
- **Agent SDKs (2026):**
  - The **Claude Agent SDK** packages the Claude Code harness (built-in file, shell and web tools, subagents running in parallel). The **OpenAI Agents SDK** centers on handoffs, guardrails and tracing (a coordinator delegating to specialists). **Google ADK** reached 1.0 GA across Python, TypeScript, Java and Go in April 2026, with built-in evaluation and Google Cloud integration (vendor-adjacent comparisons) — [Composio](https://composio.dev/blog/claude-agents-sdk-vs-openai-agents-sdk-vs-google-adk); [Morph](https://www.morphllm.com/ai-agent-framework)
  - Anthropic's **Claude Managed Agents** (beta) hosts the agent loop and a per-session sandbox container. It is billed on tokens plus **$0.08 per session-hour** of running time (no batch discount), with web search at $10 per 1,000 searches — [Claude pricing docs](https://platform.claude.com/docs/en/about-claude/pricing)
  - Anthropic's API documentation also describes multi-agent sessions in which a coordinator delegates to sub-agents, up to 25 child threads per session, plus "dynamic workflows" for larger fan-out (Anthropic docs, as cached Oct 6, 2026) — [Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview)

### Inferences
- **A credible 2026 "AI studio" architecture** would have these parts:
  - (1) A human creative director and executive producer owning vision, priorities and sign-off.
  - (2) An orchestrator agent (Opus or Fable tier) that maintains the design doc, backlog and milestone plan in git or Jira.
  - (3) Parallel specialist worker agents (code, build and QA, art pipeline through image and 3D model APIs, localization, store copy, community digest, support bot), each in its own sandbox. They coordinate through shared artifacts (repo, tickets, lock files) rather than free-form chat, following the C-compiler pattern.
  - (4) Hard verifiers: automated tests, playtest bots, screenshot and multimodal judges, and economy simulators.
  - (5) Human approval gates on anything public-facing, monetized, legal or irreversible.
  - MAST and Vend both imply that the hierarchy of AI "managers" should be thin. Adding an AI CEO does not fix judgment errors it shares with its workers.
- Role-play frameworks (ChatDev, MetaGPT) are useful demos but have been overtaken by general harnesses (Claude Code and Agent SDK, Codex, ADK). Ticket-and-repo coordination beats simulated meetings.

### Gaps
- I could not verify ChatDev's original per-project cost and time figures or a 2026 ChatDev update (search budget exhausted). No head-to-head benchmark of the three SDKs on multi-agent tasks exists in what I found.

---

## B2. Long-horizon agent capability (METR time horizons as of 2026)

### Takeaway
METR's 50% time horizon for frontier models went from about 2 hours (GPT-5, mid-2025) to about 5 hours (Claude Opus 4.5, late 2025) to **at least 16 hours** (early Claude Mythos Preview, March 2026). METR says that figure is at the edge of what its suite can measure. A 50% horizon does not mean safe delegation, and messy, visual and real-world tasks score far lower.

### Cited Findings
- **Claude Opus 4.5:** 50% horizon of about 4h49m (95% CI 1h49m–20h25m). METR: "I really have no idea whether Claude's 'true' time horizon is 3.5h or 6.5h"; "Error bars have historically been a factor of ~2 in each direction" — [METR note, Jan 22, 2026](https://metr.org/notes/2026-01-22-time-horizon-limitations/)
- **Caveats METR spells out** — [METR note](https://metr.org/notes/2026-01-22-time-horizon-limitations/):
  - "Time horizon is not the length of time AIs can work independently."
  - "Doubling the time horizon does not double the degree of automation."
  - 80% horizons are an "afterthought/robustness check", and 99%+ horizons "cannot be fit at all".
  - Visual computer-use horizons are "40-100x lower"; a real-world coffee-making task gave Claude Sonnet 4.5 a horizon of about two minutes.
  - The long-run trend is roughly one doubling every 6–7 months.
- **Claude Mythos Preview** (early version, March 2026): 50% horizon of **at least 16 hours** (95% CI 8.5–55h). Only 5 of 228 tasks take humans 16h or more, and "measurements above 16 hours are unreliable with [the] current task suite" — [The Decoder](https://the-decoder.com/metr-says-it-can-barely-measure-claude-mythos-palo-alto-networks-warns-of-autonomous-ai-attackers/); [Wikipedia: METR](https://en.wikipedia.org/wiki/METR)
  - Wikipedia lists the 80% horizon as about 3h06m. Another outlet gives conflicting figures (6.25h at 50%, 31 min at 80%) — [Wikipedia](https://en.wikipedia.org/wiki/METR); contradicted by [The Agent Report](https://the-agent-report.com/2026/05/claude-mythos-shatters-metr-time-horizon/)
- **GPT-5** was originally about 2h17m; METR's Jan 2026 methodology v1.1 raised it to about 214 min (secondary) **[mid-2025 model]** — [AGI Tracker](https://agitracker.io/blog/metr-time-horizons-2026/)
- A commentator's fit of METR data through Feb 2026 gives a doubling time of about 105 days (not METR's official statement) — [X / Aakash Gupta](https://x.com/aakashgupta/status/2053207639107174452)
- A composite ranking (Sept 2026) puts Claude Fable 5.1 top for agentic tasks (composite estimate, not METR) — [BenchLM](https://benchlm.ai/best/agentic)

### Inferences
- For game-studio planning: frontier agents can now plausibly complete well-specified, test-verifiable chunks of a day or more of expert work about half the time. That fits a feature branch, an analytics pipeline or a batch of store-page localizations. Reliability-critical, ambiguous or visual and interactive work (playtesting feel, art direction, community crises) is much further behind. Human review loops remain mandatory.

### Gaps
- METR's primary 2026 reports for Claude Opus 4.6, Claude Fable 5/5.1, Opus 5.5 and GPT-5.5 or 5.6 were not retrieved. Secondary claims of about 12–14.5h for Opus 4.6, and of a high reward-hacking or cheating rate for a "GPT-5.6 Sol" model (about 11.3h if cheats are scored as failures), could not be traced to a primary METR source.

---

## B3. Real attempts at fully or mostly AI-built games: what worked, what broke?

### Takeaway
"Vibe-coded" browser games are real and occasionally lucrative (fly.pieter.com), and AI-only game jams now draw about 1,000 entries. But no fully AI-built game has been a mainstream commercial success. The 2026 GameCraft-Bench finds the best agent completes only about 41% of real-engine (Godot) game tasks. "Built entirely by AI" claims usually hide substantial human direction and integration, and AI-disclosed games under-index on sales.

### Cited Findings
- **fly.pieter.com** (Pieter Levels, started Feb 2025): a vibe-coded multiplayer flight sim (Three.js plus Python websockets) that its creator says reached **$1M ARR in 17 days**, mainly through in-game ad sales (self-reported) **[2025]** — [levels.io](https://levels.io/full-multiplayer-python-websockets-game-ai)
  - Revenue figures conflict: Indie Hackers reported $12K MRR in May 2025, and 404 Media reported more than $50K a month (creator-claimed) — [Indie Hackers](https://www.indiehackers.com/post/2NUIOp80SUWuPmmfKoS9); [404 Media](https://404media.co/this-game-created-by-ai-vibe-coding-makes-50-000-a-month-yours-probably-wont)
- **Vibe Jam 2026** (Levels; Cursor-sponsored): **945 games submitted**, a **$40,000** prize pool, and a rule that games must be new and not exist before 24 March 2026. About 1 in 7 multiplayer entries used Colyseus. Winners were not found in my sources — [Vibe Jam 2026](https://jam.pieter.com/2026/); [press page](https://vibej.am/2026/press); [Colyseus](https://colyseus.io/blog/vibe-jam-2026/)
- A curated list of AI-built games (Claude Code, Cursor, Codex, Gemini, Grok; mostly Three.js and Phaser, some Godot) includes Vibe Jam 2026 entries and "Bash Fighter", reportedly built and run end-to-end by an agent — [awesome-ai-built-games](https://github.com/lappemic/awesome-ai-built-games)
- **Codex Mortis** (Grolaf / Crunch Fest; reported Dec 2025) **[older]**:
  - Billed as the "world's first" game "100% AI-driven": a Vampire Survivors-like built in three months with ChatGPT for art, Claude Code for shaders, and AI for code and music.
  - What broke: keeping a consistent art style, and character animation that failed, which was replaced with shader "wobble". Steam integration through Electron was hard (Tauri failed).
  - Status: on Steam with no release date and a demo available. The press called its visuals generic, and the human still directed design and fixed integration problems — [Interesting Engineering](https://interestingengineering.com/ai-robotics/worlds-first-game-completely-made-with-ai)
- **GameCraft-Bench** (arXiv, June 16, 2026): 140 Godot 4 tasks across 15 game families, judged through replayed demonstrations and rubric-guided multimodal judging. The top agent scored **about 41.46%**, and most agents scored under 40%. The authors' conclusion is that "interactive system correctness — not simply code correctness" should be the measured quantity. The benchmark is 2D only. Secondary press attributes the top score to Claude Code — [arXiv 2606.17861](https://arxiv.org/abs/2606.17861); [AI Weekly](https://aiweekly.co/alerts/claude-code-tops-ai-game-building-benchmark-at-41); [BenchmarkList](https://benchmarklist.com/benchmarks/gamecraft_bench/)
- **Rosebud AI:** a browser platform that turns text prompts into playable 3D games, with community projects built in hours or days. It launched on Product Hunt Aug 12, 2025. A reported $25M Series A (late 2024) is single-source. No 2026 user numbers were found — [Rosebud](https://rosebud.ai/company); [Hunted.space](https://hunted.space/product/rosebud-ai-2)
- **AI-native studios:**
  - Mindtail (Istanbul) raised $2M pre-seed in May 2026 for "AI-native production infrastructure" and has not shipped — [Game Developer](https://www.gamedeveloper.com/business/mobile-dev-mindtail-raises-2m-fund-for-ai-powered-games)
  - A YC gaming company using AI agents from QA through player simulation has raised $40M+ and is "in stealth on its next game" — [YC gaming directory](https://www.ycombinator.com/companies/industry/gaming)
  - Gaming startups raised about $2B in 2026 so far, much of it to AI infrastructure firms such as Meshy — [Crunchbase News](https://news.crunchbase.com/venture/2026-global-gaming-startup-funding-up-ai-meshy-decart/)
- **Market reception:** AI-disclosed games make up about 31% of 2026 Steam releases but only about 10–27% of estimated sales — [Steam census](https://fragwyz.substack.com/p/three-years-of-ai-on-steam)
  - Sandfall reportedly had an Indie Game Awards honor rescinded after saying it had considered AI images (none were in the final game). This appeared in a search summary of 2026 backlash coverage, and I could not pin it to a single article. Likely sources: [VGTimes](https://vgtimes.com/articles/168308-ai-in-games-backlash-boycotts.html) or [Slashdot](https://games.slashdot.org/story/26/01/26/1359241/angry-gamers-are-forcing-studios-to-scrap-or-rethink-new-releases); verify before citing

### Inferences
- **What worked:** small-scope web games (Three.js, Phaser), where agents iterate quickly and creators monetize through novelty, audience reach and ads. Parallel agents on a well-tested codebase (the compiler pattern). Tooling-heavy jams.
- **What broke:**
  - Consistent art direction across assets.
  - Animation and game "feel".
  - Engine and platform integration (Steam SDK, consoles).
  - Interactive correctness in real engines (the GameCraft ceiling of about 41%).
  - Player trust and backlash, and sales under-indexing.
- The realistic 2026 frontier is a mostly AI-built small web or mobile game directed by one human, not an autonomous studio shipping a premium PC or console title.

### Gaps
- No verified example of a commercially successful (for example, more than 100K Steam sales) game built mostly by agents. Vibe Jam 2026 winners and post-jam outcomes, and 2026 Rosebud metrics, were not retrieved.

---

## B4. What role must a human still play (director, integrator, legal accountability)?

### Takeaway
Humans remain necessary as (1) creative director and taste-setter, (2) integrator and verifier who designs the tests and catches "tests pass but it's wrong", (3) legally accountable owner (copyright authorship, contracts, platform disclosures, child-safety reporting), and (4) public face to players. Every 2026 experiment reviewed here kept humans in at least these roles.

### Cited Findings
- US copyright requires human authorship: cert was denied in *Thaler* on March 2, 2026, and prompts alone are insufficient per the Copyright Office. Documented human creative contribution is therefore needed to own game assets — [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/03/supreme-court-denies-review-in-ai-authorship-case); [Morgan Lewis](https://www.morganlewis.com/pubs/2026/03/us-supreme-court-declines-to-consider-whether-ai-alone-can-create-copyrighted-works)
- Steam requires disclosure of player-facing AI content; Valve narrowed the rule in Jan 2026 — [games.gg](https://games.gg/news/steam-ai-disclosure-games-2028-trend/)
- Vend's agents "still needed a great deal of human support" for physical tasks and difficult customers, and were socially manipulable — [Anthropic](https://www.anthropic.com/research/project-vend-2)
- C compiler: humans sitting with Claude "catch errors in real time", which autonomous runs cannot, and passing tests create false confidence — [Anthropic Engineering](https://www.anthropic.com/engineering/building-c-compiler)
- METR: a 50% horizon does not make shorter tasks safely delegable, since reliability-critical work may need 98%+ success — [METR](https://metr.org/notes/2026-01-22-time-horizon-limitations/)
- Legal hallucination sanctions keep rising (1,598 cases worldwide by June 2026) — [HAQQ](https://haqq.ai/es/blog/ai-legal-hallucination-audit)

### Inferences
- **Minimum viable human staffing for an "AI studio" in Oct 2026:**
  - One creative director and executive producer (vision, prioritization, final approval).
  - One technical lead and integrator (harness, tests, builds, platform certification).
  - Fractional legal and finance (contracts, IP, tax, platform agreements).
  - A human community lead or spokesperson, plus human escalation for support and T&S.
- Practically, that is 2–4 FTE plus fractional professionals, versus the 10+ non-dev FTE that a traditional mid-size team would carry.

### Gaps
- No 2026 legal guidance specific to AI-built interactive works or games was found. EU AI Act transparency obligations (Aug 2026) and their effect on game marketing were not researched.

---

## C1. Costs: per-seat and API pricing for the leading tools (Oct 2026)

### Takeaway
Frontier API tokens now cost $2–10 per million input and $10–50 per million output (Anthropic). Business chat seats run about $20–30 per user per month (premium seats about $100–125). Support AI is priced per outcome at about $1–2 per resolution. Agent-hosting runtime (Claude Managed Agents) adds only $0.08 per session-hour. Tokens dominate agent cost.

### Cited Findings
- **Anthropic API (official, per million tokens, input/output):**

  | Model | Input | Output | Notes |
  | --- | --- | --- | --- |
  | Claude Fable 5.1 (most capable widely released) | $10 | $50 | cache hits $0.25 |
  | Claude Opus 5.5 | $4 | $20 | cache hits $0.20; fast mode $8/$40 |
  | Claude Opus 5 / 4.8 / 4.7 / 4.6 / 4.5 | $5 | $25 | |
  | Claude Sonnet 5.5 / Sonnet 5 | $2 | $10 | Sonnet 5's intro price was made permanent; the planned Sept 1, 2026 increase to $3/$15 was cancelled |
  | Claude Sonnet 4.6 | $3 | $15 | |
  | Claude Haiku 5.5 | $0.10 | $0.50 | prompts ≤100K tokens; $0.50/$2.50 above |

  - Batch API: 50% off. Web search: $10 per 1,000 searches. Code execution: $0.05 per container-hour beyond the free allowance. Managed Agents: tokens plus $0.08 per session-hour. Claude 4.7+ models' tokenizer produces about 30% more tokens for the same text — [Claude pricing docs](https://platform.claude.com/docs/en/about-claude/pricing)
- **OpenAI GPT-5.5:** $5 input / $30 output per million (cached input $0.50) per secondary trackers. GPT-5.5 Pro is reported inconsistently at $30/$180 or $60/$480. Batch is 50% off. Not verified on OpenAI's own page — [Morph](https://morphllm.com/openai-api-pricing); [anotherwrapper](https://anotherwrapper.com/llm-pricing/gpt-5.5); [G2](https://www.g2.com/articles/openai-api-pricing)
- **Business seats (secondary, inconsistent):**
  - ChatGPT Business: about $20 per user per month annual or $25 monthly, minimum 2 seats.
  - Claude Team: about $25 standard or $125 premium seat per month, minimum 5 seats.
  - Gemini Enterprise Business: about $21 per seat per month (Standard $30) — [Layer3 Labs](https://www.layer3labs.io/guides/ai-subscription-plans-for-business); [Tech-Insider](https://www.tech-insider.org/chatgpt-vs-claude-vs-gemini-enterprise-2026/); [AI-Toolbox](https://www.ai-toolbox.co/claude-models/claude-pricing-plans-2026)
- **Function-specific tools:**
  - Support AI: Intercom Fin about $0.99 per resolution plus $29–132 per seat; Zendesk AI about $1.50–2.00 per verified resolution (third-party estimate); Helpshift custom (about $25K/yr small deployments); JSM about $1 per resolution — [Gleap](https://www.gleap.io/blog/intercom-fin-ai-pricing-2026); [Voiceflow](https://www.voiceflow.com/blog/zendesk-pricing); [eesel Helpshift](https://www.eesel.ai/blog/helpshift-review); [eesel Atlassian](https://www.eesel.ai/blog/atlassian-intelligence-cost-breakdown)
  - Jira Premium about $15 per user per month with bundled Rovo credits — [eesel Atlassian](https://www.eesel.ai/blog/atlassian-intelligence-cost-breakdown)
  - Midjourney $10–120 per month — [eesel Midjourney](https://eesel.ai/blog/midjourney-pricing)
  - AI playable ads reportedly under $2K versus $30–80K custom — [Coinis](https://coinis.com/glossary/playable-mobile-ads)
- **Empirical agent-team cost:** 16 Opus 4.6 agents for about two weeks cost just under $20K (about 2B input and 140M output tokens) — [Anthropic Engineering](https://www.anthropic.com/engineering/building-c-compiler)

### Inferences
- Derived from the compiler run: $20K across 16 agents for about 14 days (assuming continuous operation) is about **$3.7 per agent-hour**, or about **$2,700 per month for one heavy, always-on Opus-class coding agent** at Opus 4.6 prices. At Opus 5.5 prices ($4/$20, 20% lower) that is about $2,200 a month. With heavier prompt caching (Opus 5.5 cache reads at 0.05x) it could fall further.
- Non-coding business agents (reports, triage, copy) consume far fewer tokens. A plausible range is tens to a few hundred dollars a month per role on Sonnet 5.5 or Haiku 5.5, plus seats. This is an estimate, not a measured figure.
- Managed Agents runtime for one always-on session is about 730 h × $0.08 ≈ **$58 a month**, which is negligible next to tokens.

### Gaps
- Official ChatGPT, Gemini and Claude seat prices, OpenAI's own API page, Google Gemini API pricing, and the prices of ElevenLabs, Runway, Veo, Sora and Meshy were not verified. ToxMod and GGWP pricing is not public.

---

## C2. Costs: rough monthly cost of an AI-staffed non-dev team versus human salaries (game-industry salary surveys)

### Takeaway
Using GDC's 2025 US salary report (average $142K, median $129K; business and marketing $134K; management and operations $160K), a 10-person non-dev team costs about $110–135K a month in base salary alone, before benefits. An AI-heavy equivalent (tools, tokens, per-outcome support fees, plus 2–4 humans for direction and accountability) plausibly runs about $35–70K a month. That is a 2–3x saving, not 10x+, because the irreducible humans dominate the cost. Reliability, legal accountability and player backlash, not price, are the binding constraints.

### Cited Findings
- **GDC 2025 US Game Industry Salary Report:** average about **$142,000**, median **$129,000**, more than 500 US respondents (562 per secondary). Non-white workers earn about 27% less and women about 24% less — [GDC](https://gdconf.com/article/us-game-development-salaries-in-2025-what-our-latest-industry-report-reveals/); [WN Hub summary](https://wnhub.io/news/hr/item-49303)
  - By discipline (secondary summary of GDC): **business and marketing $134,000**, **management and operations $160,000**, programming $150,000 — [WN Hub](https://wnhub.io/news/hr/item-49303)
  - By company size: 85% of AAA workers earn over $100K, versus 75% at AA and 50% at indie — [WN Hub](https://wnhub.io/news/hr/item-49303)
- Role-specific aggregator data (lower quality):
  - Gaming community manager average **$69,400** (mid-level about $55K–85K) — [Jobicy](https://jobicy.com/salaries/usa/gaming-community-manager)
  - Early-career video game producer about $76,418 — [PayScale](https://www.payscale.com/research/US/Job=Video_Game_Producer/Salary/66fa394a/Early-Career-Product-Management)
  - Senior producer (Seattle) $115K–134K — [Glassdoor](https://www.glassdoor.com/Salaries/game-producer-salary-SRCH_KO0,13.htm)
  - Game product manager (Oregon, Sept 2026) $133,690 — [Salary.com](https://www1.salary.com/job/game-product-manager-salary/or)
- 28% of game professionals were laid off in the past two years (33% of US respondents) — [GDC 2026 SOTI](https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/)

### Inferences
- **Human baseline (illustrative, base salary only, US):** 10 non-dev roles: producer, PM/monetization, data analyst, marketing, UA, community, support lead, live ops, T&S, and BD/ops/finance.
  - Using GDC discipline averages ($134–160K) for most roles and about $69K for community gives roughly $1.3–1.5M a year, or **about $110–125K a month**.
  - Benefits and overhead (commonly 1.25–1.4x; an assumption, not sourced here) would raise this to about $140–175K a month.
  - A support team handling volume would add more.
- **AI-heavy model (illustrative monthly):**
  - Seats: 4 humans × (Claude or ChatGPT about $25–125 plus Jira about $15 plus Midjourney about $60) ≈ $0.5–1K.
  - Agent tokens: one orchestrator plus about 6 role agents, mostly on Sonnet 5.5 or Haiku 5.5, with one Opus or Fable "chief of staff" ≈ $2–8K.
  - Support AI: about 6,500 resolutions at $1–2 ≈ $6.5–13K.
  - T&S vendor and analytics tooling: unknown, since vendor pricing is not public.
  - Humans (creative director/EP, tech lead and integrator, community lead, fractional legal and finance): about $35–50K in base salaries.
  - **Total about $45–75K a month**, versus about $110–125K+ for the human team.
  - Ad spend is excluded from both models.
- **Quality-adjusted view:**
  - Support, T&S detection and UA bidding/creative volume are where AI is at or above human parity at a fraction of the cost.
  - Producer, monetization strategy, community and legal are where AI is a force multiplier but cannot replace the human.
  - TheAgentCompany (about 30% autonomous completion in 2025) and Vend (manipulation, legal near-misses) imply that an unsupervised AI staff would generate costly errors. That error cost, not tokens, is the main hidden expense.

### Gaps
- GDC's role-level breakdowns for producer, community, live ops, data and UA sit in the gated full report and were not retrieved. No 2026 salary survey (GDC 2026 salary report, UK, EU) was found. No sourced benefits or overhead multiplier for game studios. No public pricing for ToxMod, GGWP or Helpshift enterprise tiers. No published real-world total cost of an "AI-staffed" game team was found.
