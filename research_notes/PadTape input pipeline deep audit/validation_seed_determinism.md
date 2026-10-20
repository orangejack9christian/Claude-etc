# Trackmania 2020 replay/ghost validation, physics determinism, and the "validation seed"

Research date: 2026-10-20. Scope: Trackmania (2020) unless marked [TMF]/[ManiaPlanet]. Labels used on every claim: **DOC** = official documentation (URL), **SRC** = source code (URL + commit), **COMM** = community inference / secondary reporting (URL), **SNIPPET** = text seen only in a search-engine snippet of a page I could not open, **UNVERIFIED** = not found anywhere I opened.

Local repository checkouts used (shallow clones made 2026-10-20):
- gbx-net: `https://github.com/BigBang1112/gbx-net`, HEAD `edbcf1b7ae394900075791bfb6b16511e98d46c4` (2026-09-17, "Merge pull request #217 from BigBang1112/dev"). Last commit touching `Src/GBX.NET/Engines/Game/CGameCtnGhost.cs` per the GitHub commits page: `e717479d8619d2cfd5f64989ecd21ec532c93385` (2026-06-03, "Add GhostVersion").
- revalidate: `https://github.com/BigBang1112/revalidate`, HEAD `2f17eb7bd560714179761503dd1e13e8f544681a` (2026-08-27, "Add bookworm").
- mania-server-manager: `https://github.com/BigBang1112/mania-server-manager`, HEAD `7528849c5195c6747390b5719083ad3049be70d7` (2026-09-08, "Add missing env variables to docker readme").

---

## KQ1. Does the TM2020 dedicated server ("TrackmaniaServer") have a replay/ghost validation mode? Exact option names and output.

### Takeaway
Yes. The TM2020 `TrackmaniaServer` binary accepts `/validatepath=<dir>` (and `/parsegbx=<file>`), inherited from the ManiaPlanet server. It is **not** in Nadeo's public documentation for either game that I could open; the evidence is (a) the ManiaPlanet docs list `/parsegbx` only, (b) BigBang1112's command-line gist lists `/validatepath` for TMF and (behind `/windowless`) for ManiaPlanet/TM2020, and (c) two actively-maintained open-source projects (mania-server-manager, revalidate) drive `TrackmaniaServer /nodaemon /validatepath=...` and parse a JSON stream from stdout containing `IsValid`, `DeclaredResult`/`ValidatedResult` with `Time`, `NbCheckpoints`, `NbRespawns`, `Score`, plus `Desc`, `GameBuild`, `MapUid`, `Login`, `AccountId`, `Inputs`.

### Cited Findings
- **SRC** mania-server-manager `entrypoint.sh` (commit `7528849c`): `if [ -n "$MSM_VALIDATE_PATH" ]; then ... set -- "$@" "/validatepath=${MSM_VALIDATE_PATH}"` and `"/parsegbx=${MSM_PARSE_GBX}"`; the TM2020 branch then runs `exec ./TrackmaniaServer /nodaemon "$@"` (Linux native) or `exec wine TrackmaniaServer.exe "$@" 2>/dev/null` (Wine image, with comment "Print only stdout to the console, useful for /validatepath or /parsegbx"). — [mania-server-manager repo](https://github.com/BigBang1112/mania-server-manager)
- **SRC/DOC (project README)** mania-server-manager README: `MSM_VALIDATE_PATH` — "specify validation path, works only for ManiaPlanet and TM2020"; `MSM_ONLY_STDOUT` — "avoid logging MSM to stdout, only print server's stdout, useful for MSM_VALIDATE_PATH or MSM_PARSE_GBX"; "Supports niche command line arguments like `/validatepath`"; `MSM_SERVER_TYPE` one of `TM2020, ManiaPlanet, ManiaPlanet3, TMF, TM`; TM2020 server download host default `http://files.v04.maniaplanet.com/server` (README notes it "used to be" a Ubisoft CDN URL). — [GitHub README](https://github.com/BigBang1112/mania-server-manager); same text on [Docker Hub](https://hub.docker.com/r/bigbang1112/mania-server-manager)
- **SRC** mania-server-manager `Configuration.cs` line 19: `string? ValidatePath { get; } // Nullable because empty /validatepath still counts as validate request` and line 104: `var isDediServer = ValidatePath is null && ParseGbx is null;` (i.e., the server does not start as a game server when validating). — [repo](https://github.com/BigBang1112/mania-server-manager)
- **SRC** revalidate `ValidationJobProcessor.cs` (commit `2f17eb7b`): runs `docker run ... -e MSM_SERVER_TYPE={serverType} -e MSM_SERVER_VERSION={version} -e MSM_VALIDATE_PATH=. -e MSM_ONLY_STDOUT=True -e MSM_TITLE={titleId} ... bigbang1112/mania-server-manager:{distro}` and deserialises `process.StandardOutput` as a stream of JSON objects (`JsonSerializer.DeserializeAsyncEnumerable<JsonElement>` with `AllowTrailingCommas = true`). Properties it switches on: `FileName`, `IsValid` (bool), `NbCheckpoints`, `NbRespawns`, `Time` (uint; `-1` means none), `Score`, `DeclaredResult{NbCheckpoints,NbRespawns,Time,Score}`, `ValidatedResult{NbCheckpoints,NbRespawns,Time,Score}` (may be JSON null), `Inputs`, `Desc` (comment: `// disappears when ghost is valid`), `AccountId` (GUID), `GameBuild` (compared to the ghost's `Validate_ExeVersion`, logs "GameBuild mismatch!"), `MapUid` (compared to the ghost's map UID), `Login`; unknown properties are logged as warnings. Comment: `// nando changed NbRespawns and similar from -1 to int.MaxValue, so this has to unify on the issue`. — [revalidate repo](https://github.com/BigBang1112/revalidate)
- **COMM (project README)** revalidate README: "Revalidate is a unified solution to validate Trackmania replays and ghosts remotely (aka: outside of the game)"; "Trackmania (2020) and Trackmania 2 replays can be validated through a dedicated server command. Convenient."; "Trackmania United Forever and Trackmania Turbo replays can be validated only with a GUI client executable command"; "Ghosts can be validated alone on maps that are known and stored on Revalidate or retrievable externally"; "For replays, you can opt in for validation against a different map than the one stored in the replay file"; "Beware that ghost exports from replays are still experimental". — [revalidate](https://github.com/BigBang1112/revalidate)
- **COMM** BigBang1112 gist "TrackmaniaCommandLineArgs.md" (6 revisions, last active 2026-07-05): TMF section under `CGbxGame` lists `/validatepath=[FileName]`; ManiaPlanet and TM2020 sections under `CGbxApp` list "If `/windowless`: `/parsegbx` OR `/validatepath`". No separate server section. — [gist](https://gist.github.com/BigBang1112/7d4c58829aaf1313e7cac35b4bcd8481)
- **DOC [ManiaPlanet]** Official ManiaPlanet dedicated-server "Command line" reference lists: `/dedicated_cfg`, `/game_settings`, `/servername`, `/title`, `/login`, `/password`, `/lan`, `/forceip`, `/bindip`, `/nodaemon`, `/loadcache`, `/nologs`, `/noautoquit`, `/verbose_rpc_full`, `/verbose_rpc`, `/spectate`, `/serverpassword`, `/serverplugin`, and `/parsegbx=xxx` — "Dumps minor JSON output information for a Gbx file relative to the current directory." **`/validatepath` is not listed.** — [doc.maniaplanet.com command-line](https://doc.maniaplanet.com/dedicated-server/references/command-line)
- **DOC [TMU/TMF-era]** gamers.org mirror of the TrackMania Dedicated Server readme (latest changelog entry 2007-02-23) lists only `/dedicated_cfg`, `/game_settings`, `/internet`, `/verbose_rpc(_full)`, `/nodaemon`, `/nologs`, `/login`, `/password`, `/servername`, `/serverpassword`, `/loadcache`, `/forceip`, `/bindip`, `/autoquit`. No validate option. — [readme_dedicated.html](https://www.gamers.org/tmf/docs/readme_dedicated.html)
- **SNIPPET [TMF]** TM-Forum thread "TrackMania command line options" (t=21667) reportedly contains: "`/validatepath=xxx` Mass validates all the replays in a directory (xxx = name relative to Tracks/Replays/)". I could not open the page (DNS failure for www.tm-forum.com; web.archive.org is blocked from this environment). — [tm-forum t=21667](https://www.tm-forum.com/viewtopic.php?t=21667) (not opened)
- **SNIPPET [ManiaPlanet]** ManiaPlanet forum thread "Maniaplanet Server 2017-06-15" (t=41907) reportedly shows the usage `./ManiaPlanetServer /dedicated_cfg=cfg1.txt /validatepath=ToValidate > detailedreport.json` and a console line "Starting validation of 0 ghosts...". The page returned HTTP 503 / connection reset on three attempts. — [forum.maniaplanet.com t=41907](https://forum.maniaplanet.com/viewtopic.php?t=41907) (not opened)
- **DOC** doc.trackmania.com: I fetched the homepage and its navigation (sections `club/`, `create/`, `play/`, competition tool, etc.) and probed `dedicated-server/`, `dedicated-server/getting-started/`, `dedicated-server/configuration/`, `dedicated-server/command-line/`, `club/dedicated-server/` — all HTTP 404; the sitemap had no "dedicated"/"server" URLs. I found no TM2020 dedicated-server reference on that site. — [doc.trackmania.com](https://doc.trackmania.com/)
- **DOC** Nadeo 2020-07-07 blog "Trackmania post launch adjustments": "We've improved the way we validate records in order to detect any inappropriate time on every map" (followed by "Still have work to do."). — [blog.trackmania.com/?p=1110](https://blog.trackmania.com/?p=1110)

### Inferences
- The TM2020 validation entry point is undocumented by Nadeo but real and stable enough that two third-party projects depend on it (2026). The JSON stdout schema above is the best available description of what the user's "dedicated-server validation diagnostic" is printing; the user's "validated at 31.392 s with 5 CP/finish crossings" most likely corresponds to `ValidatedResult.Time` and `ValidatedResult.NbCheckpoints` (or the checkpoint list), and the failing run to `IsValid=false` with a `ValidatedResult` showing 4 checkpoints and a non-empty `Desc`.
- Because revalidate compares `GameBuild`, `MapUid`, `Login` from the server's output with the ghost header, the server's validator reads those from the file and emits them; it is therefore plausible (not proven) that the server also reads the seed from the same validation block.

### Gaps
- No official Nadeo page documents `/validatepath` for TM2020 or its JSON schema; the full property list and the exact wording of `Desc` failure reasons are UNVERIFIED (revalidate only passes `Desc` through as a string).
- Whether `/validatepath` requires the `.Map.Gbx` to be present for bare `.Ghost.Gbx` files is only implied (revalidate says ghosts "can be validated alone on maps that are known and stored"); the exact lookup path is UNVERIFIED.
- `TrackmaniaServer --help`/`/help` output: not reproduced in any page I opened.

---

## KQ2. What does validation re-simulate from? Inputs only? Map needed? Exact CP times?

### Takeaway
Validation re-runs the race from the stored input events (TM2020: bit-packed 10 ms tick stream in ghost chunk `0x0309201D`) on the map, and emits a "validated" time / checkpoint count / respawn count that is compared with the "declared" values stored in the file. The server reports both `DeclaredResult` and `ValidatedResult`, which is exactly the shape of an input re-simulation check. No opened source states that CP times must match to the millisecond; the server output exposes counts and total time, and (per revalidate) possibly a per-checkpoint list.

### Cited Findings
- **SRC** gbx-net `CGameCtnGhost.chunkl` (HEAD `edbcf1b7`): `0x01D (skippable) [MP3.v3, TMT.v3, MP4.v3, TM2020.v4] // player input data` → `PlayerInputData[] PlayerInputs`; archive `PlayerInputData { int<EVersion> Version // 8 in ShootMania, 12 in TM2020; int; v4+ timeint? StartOffset; int Ticks; data Data }`. Also `0x010 [TMU…TM2020] // validation map UID → id Validate_ChallengeUid`, `0x01A // checkpoint count`, `0x01C // security key → uint256? SecurityKey256`, `0x023 // anticheat data`, `0x025 // validation TM2`, `0x028 // title id`, `0x02C WalltimeStart/EndTimestamp`, `0x02D [TM2020]`. — [CGameCtnGhost.chunkl](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.chunkl)
- **SRC** gbx-net `CGameCtnGhost.PlayerInputData.cs`: `ProcessTrackmaniaInputs()` iterates `for (var i = 0; i < ticks; i++) { var time = new TimeInt32(i * 10) + StartOffset.GetValueOrDefault(); ...}` — i.e., one input state per **10 ms tick**; `EVersion { _2017_07_07 = 7, _2017_09_12 = 8, _2020_04_08 = 11, _2020_07_20 = 12 }`; header comment credits Mystixor and Shweetz and says "the solution was read out of the game code in the end". — [CGameCtnGhost.PlayerInputData.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.PlayerInputData.cs)
- **COMM** gbx-net wiki "Extracting input data from ghosts" (edited 2026-07-24): "Replay and ghost contain validation data that is used to, obviously, validate the run - to automatically check if the physics engine hasn't been modified before or during the run"; "This automatic validation method does not work for slow motion"; TM2020: "the CGameCtnGhost 0x01D chunk has been a major focus… The focused property is the CGameCtnGhost.PlayerInputs (class PlayerInputData). The storage of data is tick-based… as the data is stored via bits, not bytes." — [wiki page](https://github.com/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts)
- **SRC** revalidate stores per-ghost `Checkpoints` (Time, StuntsScore, Speed) read from the Gbx via GBX.NET (`ghost.Checkpoints`) and, from the server output, `ValidatedNbCheckpoints`, `ValidatedNbRespawns`, `ValidatedTime`, `ValidatedScore` next to the declared values (`ValidationDistroResultEntity.cs` lines 25–33). — [revalidate](https://github.com/BigBang1112/revalidate)
- **COMM** revalidate README: ghosts need a known map; replays carry the map and can be validated "against a different map than the one stored in the replay file". — [revalidate](https://github.com/BigBang1112/revalidate)
- **COMM [TMNF]** TASVideos forum: for TMN/TMU "The game's internal replay format stores only inputs and is fully deterministic." — [tasvideos.org topic 22766](https://tasvideos.org/Forum/Topics/22766)
- **COMM** 2021 cheating investigation press: donadigo "made a tool that can extract the inputs players made from such a replay file"; cheaters ran the game at "40 - 80%" speed, which validation does not detect. — [GGRecon](https://www.ggrecon.com/articles/did-the-biggest-trackmania-streamer-get-caught-cheating); [PC Gamer](https://www.pcgamer.com/au/cheating-allegations-catch-up-with-some-of-trackmanias-fastest-drivers)

### Inferences
- The "declared vs validated" structure means a failure can be of two different kinds: (i) the re-simulation diverges and produces a different time / fewer checkpoints (what the user saw: 4 of 5), or (ii) the re-simulation matches but a header/consistency check fails. The user's 4-of-5 result is of kind (i) **if** the 4 comes from `ValidatedResult`; if it came from `DeclaredResult` it would mean the file edit changed the declared data (unlikely when only the seed was changed).
- Slow-motion immunity confirms validation is a pure input→trajectory check: time-dilated inputs replay identically at normal speed.

### Gaps
- Whether the validator requires per-checkpoint time equality (vs. only count/total time) is UNVERIFIED; no opened source documents tolerance.
- The role of `SecurityKey256` (0x01C) and the "anticheat data" chunk (0x023) in server-side validation is UNVERIFIED.

---

## KQ3. Nadeo server-side record validation statements (2020–2026) and known failure causes

### Takeaway
Nadeo's only explicit public statement I could open is the 2020-07-07 "improved the way we validate records" line. Community/press sources establish that (a) validation did not catch slow-motion cheating (2021 scandal), (b) Nadeo validates on Linux servers with an older glibc whose math differs in "rare calculations" (per mania-server-manager's author), and (c) at least one official patch note (09-06-2021) says "Car physics changed and some press forward might be broken" — direct evidence that physics changes between builds can desync input-driven runs.

### Cited Findings
- **DOC** 2020-07-07: "We've improved the way we validate records in order to detect any inappropriate time on every map." — [blog.trackmania.com/?p=1110](https://blog.trackmania.com/?p=1110)
- **DOC (mirror of official changelog)** 09/06/2021 update changelog, posted by Nadeo CM softyBcKK: Known Issues — "Car physics changed and some press forward might be broken, sorry for the inconvenience"; "We changed more than 1400 files of our code in order to prepare to the next big updates." — [devtrackers.gg mirror](https://devtrackers.gg/trackmania/p/8fcf9b57-09-06-2021-new-update-and-changelog)
- **SRC (corroborating)** revalidate `ValidationService.GetServerVersion` picks the server build from the ghost's `Validate_ExeVersion` date: exe date `< 2021-06-09` → server "2021-05-31" (ManiaPlanet host); `< 2021-09-30` → "2021-07-07"; `< 2021-12-14` → "2021-09-29"; `< 2022-09-07` → "2022-06-21"; `< 2022-09-09` → "2022-09-06b"; `< 2022-09-29` → "2022-09-08b"; `< 2023-07-03` → "2023-05-04"; else "Latest". The first cutoff coincides with the 2021-06-09 physics-change patch. — [revalidate ValidationService.cs](https://github.com/BigBang1112/revalidate/blob/master/Revalidate/Services/ValidationService.cs)
- **COMM** mania-server-manager README, "Ubuntu Noble (24.04 LTS)" image: "This image uses older glibc version than Resolute Raccoon which has a bug in certain rare calculations. This can be used to test validation from the Nadeo perspective, as they run older glibc version on their servers. More details about this [here](https://www.youtube.com/watch?v=cb5r3r38O9c)." — [mania-server-manager README](https://github.com/BigBang1112/mania-server-manager)
- **SRC** revalidate validates every file on five distro images `["resolute", "noble", "trixie-slim", "bookworm-slim", "alpine"]` and sets the global result `result.IsValid = result.Distros.Any(x => x.IsValid.GetValueOrDefault())` — i.e., "valid on at least one environment". — [ValidationJobProcessor.cs](https://github.com/BigBang1112/revalidate/blob/master/Revalidate/Services/ValidationJobProcessor.cs)
- **COMM** 2021: "Wirtual invited Ubisoft Nadeo and Trackmania community site TMX to investigate their findings"; techno "admitted to using game speeds between 40 - 80%". — [PC Gamer](https://www.pcgamer.com/au/cheating-allegations-catch-up-with-some-of-trackmanias-fastest-drivers); [GGRecon](https://www.ggrecon.com/articles/did-the-biggest-trackmania-streamer-get-caught-cheating)
- **COMM** Wikipedia (Wirtual): the May 2021 report "prompted Nadeo to initiate a widespread cheating investigation throughout various games within the franchise". — [Wikipedia](https://en.wikipedia.org/wiki/Wirtual)
- **COMM** Press review: physics "are completely deterministic, and an exact sequence of inputs will always result in the exact same result" (basis of press-forward tracks). — [playday.one review](https://playday.one/2023/05/19/review-trackmania/)
- **COMM** Dev-tracker thread: "since around june 2021, most of the new top 10 times in the official training campaign would get removed from the leaderboards" (player report; Nadeo replied with questions only). — [devtrackers.gg](https://devtrackers.gg/trackmania/p/2102c10d-training-campaign-records-removal)

### Inferences
- Known or strongly implied validation-failure causes: (1) executable/physics version mismatch (hence revalidate's build→server-version table); (2) rare floating-point/libm differences between host environments (glibc remark); (3) wrong map (`MapUid` mismatch warning); (4) any edit to the input stream. Slow motion is **not** a failure cause.
- Nadeo's production validator runs on Linux (dedicated server is Linux-native; the glibc remark). TM2020 clients are Windows. Cross-OS determinism is therefore routinely relied upon, with rare exceptions.

### Gaps
- No Nadeo statement 2021–2026 found that explicitly says "records are validated by re-simulating inputs"; ManiaPlanet/TMF-era Nadeo staff explanations were not found in opened pages. UNVERIFIED.
- The YouTube video referenced for the glibc issue was not opened (video).

---

## KQ4. Public knowledge of a "seed" in TM2020 replays/ghosts; is TM physics random?

### Takeaway
A field literally named `Validate_ValidationSeed` (int32) exists in the ghost validation block: TMF chunk `0x03092019`, TM2/TM2020 chunk `0x03092025`, and TM2020-only chunk `0x0309202D` (gbx-net names; the game-side struct is called `SGameGhostValidationData`). Separately, the dedicated server config has `<use_changing_validation_seed>False</use_changing_validation_seed>` (ManiaPlanet docs; also present in mania-server-manager for TM2020 as `MSM_CFG_SERVER_USE_CHANGING_VALIDATION_SEED`). No opened source states what the seed does; no opened source documents any random element in TM2020 car physics.

### Cited Findings
- **SRC** gbx-net `CGameCtnGhost.cs` (commit `e717479d`): field `private int? validate_ValidationSeed; [AppliedWithChunk<Chunk03092019>] [AppliedWithChunk<Chunk03092025>] public int? Validate_ValidationSeed`. `Chunk03092019.ReadWrite`: `base.ReadWrite(n, rw); if (n.eventsDuration != TimeInt32.Zero) { rw.Int32(ref n.validate_ValidationSeed); }`. `Chunk03092025` (`IVersionable`): Version 0 → `rw.Chunk(n, chunk019)` then `steeringWheelSensitivity`; Version ≥1 → `rw.TimeInt32(ref n.eventsDuration); chunk019.ReadWriteInputs(n, rw); rw.Int32(ref n.validate_ValidationSeed); rw.Boolean(ref n.steeringWheelSensitivity);`. `Chunk0309202D` (TM2020): `rw.Int32(ref U01); if (U01 >= 1) throw new Exception("Inputs stored separately"); rw.String(ref n.validate_ExeVersion); rw.UInt32(ref n.validate_ExeChecksum); rw.Int32(ref n.validate_OsKind); rw.Int32(ref n.validate_CpuKind); rw.UnixTime(ref n.walltimeStartTimestamp); rw.UnixTime(ref n.walltimeEndTimestamp); rw.String(ref n.validate_TitleId); rw.Checksum256(ref n.validate_TitleChecksum); rw.Int32(ref U02); rw.Int32(ref U03); rw.Int32(ref n.validate_ValidationSeed); rw.Int32(ref U04); rw.String(ref n.validate_RaceSettings);`. — [CGameCtnGhost.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.cs)
- **SRC** same file, `Chunk03092011.ReadWriteInputs`: comments `// CInputEventsStore::Archive` (then `rw.Int32(ref U01); // always 0 now`, then the input list) and `// SGameGhostValidationData` (then ExeVersion, ExeChecksum, OsKind, CpuKind, RaceSettings). These comments name the game's own structures. — same URL
- **SRC** gbx-net `CGameCtnGhost.chunkl`: `0x025 (skippable) [MP3.v0, TMT.v0, MP4.v0, TM2020.v1] // validation TM2`; `0x02D (skippable) [TM2020]`; `0x023 // anticheat data` (version, strings/ints, v2+ byte/int/int, v3+ byte/byte). — [chunkl](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.chunkl)
- **DOC [ManiaPlanet]** Official dedicated-config reference lists `<autosave_validation_replays>False</autosave_validation_replays>`, `<use_changing_validation_seed>False</use_changing_validation_seed>`, `<referee_validation_mode>0</referee_validation_mode>`, `<autosave_replays>False</autosave_replays>`, `<disable_replay_recording>False</disable_replay_recording>` — with no explanatory text. — [doc.maniaplanet.com dedicated-config](https://doc.maniaplanet.com/dedicated-server/references/dedicated-config)
- **COMM/SRC** mania-server-manager (TM2020-capable) README exposes `MSM_CFG_SERVER_USE_CHANGING_VALIDATION_SEED` (default False), `MSM_CFG_SERVER_AUTOSAVE_VALIDATION_REPLAYS` (default False), `MSM_CFG_SERVER_REFEREE_VALIDATION_MODE` (`OnlyTop3` default / `AllPlayers`). — [README](https://github.com/BigBang1112/mania-server-manager)
- **SNIPPET** Shockbyte "how to configure your Trackmania server settings" reportedly describes `use_changing_validation_seed` as adding "an extra layer of validation randomness" and `autosave_validation_replays` as saving "validation replays". Page returned HTTP 403 to this environment. — [Shockbyte](https://shockbyte.com/help/knowledgebase/articles/how-to-configure-your-trackmania-server-settings) (not opened)
- **SRC** revalidate reads and stores `ValidationSeed = ghost.Validate_ValidationSeed` (`ValidationService.cs` line 809; entity line 54) and exposes it in its API DTO, but no code path in the repository uses the seed for any decision (grep over `Revalidate/` for "Seed": only mapping/entity lines). — [revalidate](https://github.com/BigBang1112/revalidate)
- **SRC** revalidate comment on `RaceSettings`: `// looks like Nadeo kept it always empty and openplanet took advantage of it` (TM2020 `RaceSettings` not required). — [ValidationService.cs](https://github.com/BigBang1112/revalidate/blob/master/Revalidate/Services/ValidationService.cs)
- **SRC** gbx-net `GhostVersionString`: TM2020 ghosts carry a `ghostVersion` (`"TMr.{ghostVersion}"` for 1..9998), added in commit `e717479d` (2026-06-03). — [CGameCtnGhost.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.cs)
- **UNVERIFIED** Openplanet API reference for `CGameCtnGhost` (to check for a `Validate_ValidationSeed`/seed member visible to plugins): `https://openplanet.dev/docs/api/CGameCtnGhost` and several variants returned 404; `https://openplanet.dev/docs/api/` loads but is JS-rendered. Not confirmed either way.

### Inferences
- The seed lives **inside the validation block** (between the input list and `SteeringWheelSensitivity` in 0x025; between `U03` and `U04` in 0x02D), written by the client at save time, alongside `ExeVersion/ExeChecksum/OsKind/CpuKind`. Its placement is consistent with "a parameter the validator needs to reproduce the run" and also with "a nonce bound into an integrity check"; placement alone cannot distinguish them.
- A server setting named `use_changing_validation_seed` (default **off**) strongly suggests the seed is normally a fixed/known value on servers and can optionally be rotated — behaviour typical of an anti-replay/anti-forgery nonce handed to clients by the server for online runs, not of a physics RNG seed. This is inference; no document explains it.
- No evidence of physics randomness in TM2020 was found; all determinism statements (press, TAS community, press-forward maps, re-simulation-based validation itself) point to fully deterministic physics given inputs and build.

### Gaps
- Meaning of `Validate_ValidationSeed`, `U02/U03/U04` in 0x02D, `OsKind`, `CpuKind` numeric values: UNVERIFIED (no opened documentation).
- Whether `use_changing_validation_seed` also exists in the TM2020 `dedicated_cfg.txt` template shipped with `TrackmaniaServer_Latest.zip`: not directly opened; mania-server-manager (which generates TM2020 configs) exposes it, which is indirect evidence.

---

## KQ5. Is the seed used to decode/scramble inputs? (gbx-net evidence)

### Takeaway
No. gbx-net decodes both input formats without any seed: the legacy list format (TMU/TMF/TM2 chunks 0x011/0x019/0x025) is plaintext 9-byte records, and the TM2020 bit-packed `PlayerInputData` (0x01D) is decoded purely from `Version`, `StartOffset`, `Ticks`, and the data bits. `Validate_ValidationSeed` is read and stored but never consumed. This is strong evidence against the "seed is a decoding key" hypothesis for the input stream itself.

### Cited Findings
- **SRC** `Chunk03092011.ReadInputs`: `Span<string> inputNames = r.ReadArrayId(); var numInputs = r.ReadInt32(); U02 = r.ReadInt32(); // CountLimit?` … `// 9 bytes per entry: 4 for time, 1 for name index, 4 for data` … `var time = TimeInt32.FromMilliseconds(ReadInt32LittleEndian(...) - 100000); var inputNameIndex = inputData[i * 9 + 4]; var data = ReadUInt32LittleEndian(...); inputs[i] = NET.Inputs.Input.Parse(time, name, data);` — no seed parameter. — [CGameCtnGhost.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.cs)
- **SRC** `GBX.NET/Inputs/Input.cs`: `public static IInput Parse(TimeInt32 time, string name, uint data) => name switch …` — signature has no seed. — [Input.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Inputs/Input.cs)
- **SRC** `CGameCtnGhost.PlayerInputData.cs` (874 lines) and `Src/GBX.NET/Inputs/*.cs`: grep for "seed" (case-insensitive) returns no matches; decoding reads bits with `BitReader(data)` driven by `ticks`, `version`, and state-change flags. — [PlayerInputData.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.PlayerInputData.cs)
- **SRC** `CGameCtnReplayRecord.cs` `Chunk0309300F`: old replay-level validation block (`exeVersion, exeChecksum, osKind, cpuKind, raceSettings`) copied into the first ghost — no seed in that older block, consistent with the seed being added later (TMF 0x019). — [CGameCtnReplayRecord.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnReplayRecord.cs)
- **SRC** `Chunk0309202D`: `if (U01 >= 1) throw new Exception("Inputs stored separately");` — some TM2020 ghosts signal that inputs are not in the ghost's own input list. — [CGameCtnGhost.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.cs)
- **COMM** The TM2020 bit format was reverse-engineered "out of the game code in the end" (file header comment); tools built on it (TM2020-TAS, which "uses a combination of replay input extraction and memory reading") read inputs without any key. — [PlayerInputData.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.PlayerInputData.cs); [TM2020-TAS](https://github.com/Polybagel/TM2020-TAS)

### Inferences
- If inputs were scrambled with the seed, gbx-net could not produce human-readable steering/accelerate/brake sequences (which it demonstrably does, and which the 2021 investigation relied on). Therefore the seed is not an input-decoding key for the stored stream.
- Residual possibility: the server could combine the seed with the inputs in some other way during validation (e.g., mixing into an integrity hash or into a simulation parameter). gbx-net evidence cannot exclude that.

### Gaps
- The "Inputs stored separately" (0x02D `U01 >= 1`) path is unimplemented in gbx-net; what those ghosts contain and whether a seed is involved there is UNVERIFIED.

---

## KQ6. Determinism across machines; counterexamples; why `Validate_CpuKind` / `Validate_OsKind` exist

### Takeaway
The whole validation pipeline (Windows client → Linux Nadeo server; community validation inside Docker on several distros) presupposes cross-machine determinism for the same executable build, and it works in the common case. The documented counterexample is environmental: an older glibc "has a bug in certain rare calculations" that can flip validity, so revalidate runs multiple distros and accepts "valid on any". `CpuKind`/`OsKind` are stored in `SGameGhostValidationData` but no opened source explains their values or whether the validator branches on them.

### Cited Findings
- **COMM** mania-server-manager README (Noble image): "older glibc version … has a bug in certain rare calculations. This can be used to test validation from the Nadeo perspective, as they run older glibc version on their servers." — [README](https://github.com/BigBang1112/mania-server-manager)
- **SRC** revalidate: five-distro fan-out and `IsValid = Any(distro valid)`. — [ValidationJobProcessor.cs](https://github.com/BigBang1112/revalidate/blob/master/Revalidate/Services/ValidationJobProcessor.cs)
- **SRC** `SGameGhostValidationData` members as read by gbx-net: `ExeVersion (string), ExeChecksum (uint32), OsKind (int32), CpuKind (int32), RaceSettings (string)`; TM2020 0x02D adds wall-time start/end, TitleId, TitleChecksum (256-bit), seed, and three unknown ints. — [CGameCtnGhost.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.cs)
- **DOC (mirror)** 09-06-2021: "Car physics changed and some press forward might be broken" — a physics change in a game update, i.e., same inputs no longer yield the same result across builds. — [devtrackers.gg](https://devtrackers.gg/trackmania/p/8fcf9b57-09-06-2021-new-update-and-changelog)
- **COMM** Press: physics "completely deterministic". — [playday.one](https://playday.one/2023/05/19/review-trackmania/)
- **COMM [TMNF]** TASVideos: TMN/TMU replay "stores only inputs and is fully deterministic". — [tasvideos.org](https://tasvideos.org/Forum/Topics/22766)
- **SRC** gbx-net ghost inputs are tick-indexed at 10 ms (`i * 10`), i.e., the recorded input stream is defined on a fixed 100 Hz physics grid. — [PlayerInputData.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.PlayerInputData.cs)

### Inferences
- A fixed 10 ms tick grid plus input-only replay files implies fixed-step simulation; float determinism then hinges on identical code paths and identical libm behaviour. The glibc remark shows libm is the realistic cross-machine risk, not CPU vendor per se.
- `OsKind`/`CpuKind` are most plausibly recorded so that validators can be matched (or failures explained) when results differ across platforms; this is inference.

### Gaps
- No Nadeo statement about hardware/OS determinism was found. UNVERIFIED.
- Numeric meanings of `OsKind`/`CpuKind` (e.g., Windows/Linux; x86/x64): not documented in any opened page.

---

## KQ7. Game-version compatibility; `Validate_ExeVersion` format; how to read the installed build

### Takeaway
`Validate_ExeVersion` is a string of the form `Trackmania date=YYYY-MM-DD_HH_mm git=<hash> GameVersion=3.3.0` (regex from revalidate; ManiaPlanet used `ManiaPlanet date=… Svn=… GameVersion=…`). Revalidate's version table shows at least eight TM2020 server builds between 2021-05 and 2023-05 that it considers physics/validation-relevant. How to read the installed build in-game was not documented in any opened page; the reliable way is to read `Validate_ExeVersion` from a freshly saved replay/ghost.

### Cited Findings
- **SRC** revalidate: `[GeneratedRegex(@"(Trackmania|ManiaPlanet) date=([0-9-_]+) (git|Svn)=([0-9a-f-]+) GameVersion=([0-9.]+)")]` and date parse format `"yyyy-MM-dd_HH_mm"`. — [ValidationService.cs](https://github.com/BigBang1112/revalidate/blob/master/Revalidate/Services/ValidationService.cs)
- **SRC** gbx-net repo contains literal strings `"3.3.0"` and `"2.11.25"` (GameVersion values for TM2020 and ManiaPlanet 4 respectively, by context). — [gbx-net](https://github.com/BigBang1112/gbx-net)
- **SRC** revalidate server-version table (see KQ3) and `GameBuild` mismatch warning when the server's reported build differs from the ghost's `ExeVersion`. — [revalidate](https://github.com/BigBang1112/revalidate)
- **SRC** revalidate input validation: errors if `ExeVersion` missing, `ExeChecksum == 0`, `RaceTime` missing/zero/negative. — [ValidationService.cs](https://github.com/BigBang1112/revalidate/blob/master/Revalidate/Services/ValidationService.cs)
- **COMM** Hidden Palace: a Jun 12 2020 prototype build "would sometimes be downloaded instead of the release build when downloading the game from Epic Games Launcher between 2020 and 2023", and it "uses ice and reactor boost physics that are different to the first release build". — [hiddenpalace.org](https://hiddenpalace.org/Trackmania_(Jun_12,_2020_prototype))

### Inferences
- Update cadence that matters for validation is "whenever the server build changes"; revalidate's table implies ≥8 such boundaries in 2021–2023 alone. Treat any cross-build comparison as suspect unless `GameBuild` reported by the server equals the ghost's `ExeVersion`.

### Gaps
- Official in-game location of the build string: UNVERIFIED. Practical substitute: save a replay and read `Validate_ExeVersion`, or compare the server's `GameBuild` output.
- A complete list of TM2020 server releases/changelogs was not opened (the download host `http://files.v04.maniaplanet.com/server` per mania-server-manager; no index page opened).

---

## KQ8. Is a *local* (non-uploaded) run affected by the seed? Is it per-attempt random? Used by the client?

### Takeaway
UNVERIFIED in every opened source. Nothing documents how the client chooses the seed, whether it changes per attempt, or whether the client uses it for anything other than writing it into the validation block. The only behavioural lever found is the server-side `use_changing_validation_seed` flag (default off), which implies the seed can be server-provided for online play.

### Cited Findings
- **DOC [ManiaPlanet]** `<use_changing_validation_seed>False</use_changing_validation_seed>` exists in the server config. — [doc.maniaplanet.com dedicated-config](https://doc.maniaplanet.com/dedicated-server/references/dedicated-config)
- **SRC** gbx-net: the seed is written when `eventsDuration != 0` (i.e., only when inputs exist). — [CGameCtnGhost.cs](https://github.com/BigBang1112/gbx-net/blob/master/Src/GBX.NET/Engines/Game/CGameCtnGhost.cs)
- **SRC** TM2020 0x02D also stores `WalltimeStartTimestamp`/`WalltimeEndTimestamp` (Unix time) next to the seed. — same URL

### Inferences
- Observables that would settle it (proposed tests, not findings):
  1. Save N consecutive local runs on the same map; dump `Validate_ValidationSeed`, `WalltimeStartTimestamp`, `GhostUid` via GBX.NET. Constant seed ⇒ not per-attempt; monotone/time-correlated ⇒ derived from clock; otherwise random.
  2. Same ghost file validated twice unchanged ⇒ must be identical (determinism baseline for the validator host).
  3. Seed sweep: validate the same inputs with k different seeds. If *every* non-original seed fails and the `ValidatedResult` diverges at the **same** checkpoint/time, the seed enters the simulation early (physics parameter / RNG) or a hash check short-circuits. If divergence points vary with the seed value, it is being consumed continuously (RNG). If the run validates with some other seeds, the check is not a strict nonce.
  4. Compare `ValidatedResult.Time` and per-CP times for the first k checkpoints under original vs altered seed: identical prefix then divergence ⇒ seed perturbs physics; failure with `ValidatedResult` null and only `Desc` populated ⇒ integrity/nonce failure rather than a physics divergence.
  5. Run the same altered file on `noble` vs `resolute` images (mania-server-manager tags) to exclude libm effects.
  6. Online vs offline: record one run on a server with `use_changing_validation_seed=True` and one offline; compare the seeds' statistical behaviour.

### Gaps
- Client-side seed generation, per-attempt behaviour, any client-side use: UNVERIFIED.

---

## KQ9. Public tools to extract finish time, CP times, respawns, map UID, exe version, login, inputs

### Takeaway
GBX.NET (C#/.NET) is the only opened tool that exposes all requested fields from TM2020 ghosts/replays, including decoded TM2020 inputs and the validation block (ExeVersion, ExeChecksum, OsKind, CpuKind, seed, TitleId). gbx-ts (TypeScript) reads map/replay/ghost headers and CP/respawn utilities. Revalidate wraps the dedicated server's `/validatepath` as a web API. Official leaderboard ghosts can be downloaded from trackmania.io per Nadeo's docs.

### Cited Findings
- **SRC** GBX.NET: `CGameCtnGhost` exposes (per `.chunkl`/`.cs`) `RaceTime`, `Checkpoints[]` (Time, Speed, StuntsScore), `GhostLogin`, `GhostNickname`, `GhostTrigram`, `RecordingContext`, `Validate_ChallengeUid` (map UID), `Validate_ExeVersion`, `Validate_ExeChecksum`, `Validate_OsKind`, `Validate_CpuKind`, `Validate_RaceSettings`, `Validate_TitleId`, `Validate_TitleChecksum`, `Validate_ValidationSeed`, `SteeringWheelSensitivity`, `WalltimeStart/EndTimestamp`, `PlayerInputs` (TM2020, with `.Inputs` decoded), legacy `Inputs`, `SecurityKey256`, `GhostUid`. Repository also ships tools `Tools/GbxExplorer`, `Tools/GbxToJson`, `Tools/GbxInspector`, `GBX.NET.Tool.CLI`. NuGet: GBX.NET 2.4.x. — [gbx-net](https://github.com/BigBang1112/gbx-net); [NuGet GBX.NET 2.4.4](https://www.nuget.org/packages/GBX.NET/2.4.4)
- **COMM** gbx-net wiki page on extracting inputs (edited 2026-07-24). — [wiki](https://github.com/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts)
- **COMM** "Gbx Web Tools" at gbx.bigbang1112.cz ("A melange of Gbx file utilities without a need to install anything") — the page loaded but showed a runtime error in my fetch, so I could not confirm its feature list. — [gbx.bigbang1112.cz](https://gbx.bigbang1112.cz/)
- **COMM** gbx-ts (MIT; body parsing needs `lzo-ts`, GPL-3.0): supports `CGameCtnChallenge`, `CGameCtnReplayRecord`, `CGameCtnGhost`; helpers `getCheckpointCount`, `getCheckpointTimes`, `getSectorTimes`, `getRespawnsByCheckpoint`; `isTM2020()`. No documented exe-version/login/input extraction. — [gbx-ts](https://github.com/thaumictom/gbx-ts)
- **COMM** Other parsers listed in the gbx-net README: `schadocalex/gbx-py`, `donadigo/pygbx`. — [gbx-net README](https://github.com/BigBang1112/gbx-net)
- **COMM** Revalidate (GPL-3.0) web API: uploads → Docker dedicated servers → stdout JSON → stored results including `ExeVersion, OsKind, CpuKind, ValidationSeed`, declared/validated time/CP/respawns, per-CP list, raw server JSON and logs. CLI "Planned in the future". — [revalidate](https://github.com/BigBang1112/revalidate)
- **COMM** mania-server-manager Docker image (`bigbang1112/mania-server-manager`, tags `latest/resolute`, `noble`, `trixie-slim`, `bookworm-slim`, `alpine`, `noble-wine`) for running `/validatepath` yourself. — [Docker Hub](https://hub.docker.com/r/bigbang1112/mania-server-manager)
- **DOC** Nadeo: "you can also go to trackmania.io, select the leaderboard and download the ghost file"; local replays live in `C:\Users\YourUser\Documents\Trackmania\Replays`. — [doc.trackmania.com watch-replays](https://doc.trackmania.com/play/watch-replays/)
- **COMM** Openplanet plugins that save ghosts/replays for later validation: "Archivist" (v0.2.2 "validation mode -- saves all ghosts automatically"), "Autosave Ghosts". — [Archivist](https://openplanet.dev/plugin/archivist); [Autosave Ghosts](https://openplanet.dev/plugin/autosaveghosts)
- **COMM** TM2020-TAS (Windows, MIT): replay input extraction "partially implemented". — [TM2020-TAS](https://github.com/Polybagel/TM2020-TAS)

### Gaps
- "tm-essentials" and "GbxExplorer" public web URLs were not confirmed in opened pages.

---

## What the user's local observation proves and does not prove

Observation: diagnostic with source seed 28982314 → validated at 31.392 s, 5 CP/finish crossings; same file with only the seed changed to 33359581 → validation failed, 4 of 5 crossings.

**Proven (given the observation is as described):**
- The TM2020 server validator reads the stored seed and its verdict depends on it. The seed is therefore **not** "affects nothing" from the validator's point of view. (Consistent with the seed sitting inside `SGameGhostValidationData` and being present in every TM2020 validation chunk — SRC, KQ4.)

**Not proven / still open:**
1. *Seed changes physics* — compatible with the observation only if the "4 of 5" is a `ValidatedResult` produced by an actual re-simulation that diverged. The user must confirm which JSON field the "4" came from (`ValidatedResult.NbCheckpoints` vs `DeclaredResult.NbCheckpoints`) and whether `ValidatedResult.Time` is non-null. If the server emitted `ValidatedResult: null` + `Desc`, the failure was a pre-check, not a physics divergence.
2. *Seed is an input-decoding key* — strongly disfavoured: GBX.NET decodes TM2020 inputs with no seed (SRC, KQ5). The only loophole is the 0x02D "Inputs stored separately" variant, which gbx-net does not implement.
3. *Seed is a nonce/identity only* — a pure nonce check would normally fail outright (no partial checkpoint count). A 4/5 partial result argues against "nonce only" **unless** the validator reports the declared file's checkpoint list minus one on any failure, or truncates at the point an integrity check fires. Also note the file carries `SecurityKey256` (0x01C) and an "anticheat data" chunk (0x023): if either covers the seed, editing the seed could trip an integrity failure that happens to be reported as a shortfall in crossings. The single-pair experiment cannot separate these.
4. *Seed affects local play* — untested by this observation; see KQ8 tests.

**Confounders to control:** identical server build (`GameBuild` output == `Validate_ExeVersion`), identical map (`MapUid` output), identical distro/glibc (run `noble` and `resolute`), and repeat the unmodified file at least twice to establish that the validator itself is deterministic on this host before interpreting any altered-seed result.

**Minimal discriminating experiment set:** (a) baseline repeat ×3 unchanged; (b) 10 random seeds + seed 0 + seed = original±1; (c) for each failure record `ValidatedResult.Time`, `NbCheckpoints`, per-CP times if present, and `Desc`; (d) one run with original seed but one input bit flipped late in the run (to see what a genuine physics divergence looks like in the output — expected: identical CP prefix, divergence after the edit); (e) compare the failure signature of (b) with (d). If (b) looks like (d) with divergence from CP1/start, the seed is consumed by the simulation from t=0 (physics/RNG parameter). If (b) fails with a distinct signature (null validated result, specific `Desc`), it is an integrity/nonce check.
