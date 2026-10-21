# Follow-up: vjeux/trackmania-tas (TM2020 TAS toolchain) — read 2026-10-20/21 by the coordinator

All pages below were fetched directly (raw.githubusercontent.com or github.com). Repo: https://github.com/vjeux/trackmania-tas (MIT; ~2,981 commits; latest dated text 2026-08-25; tool listing at commit ad6bf1c).

## The pasted input format is this project's TICK script
- `tools/tmsite/src/tick.rs` (https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/tools/tmsite/src/tick.rs): `Opts.seed: Option<u32>` with doc comment "Optional `0 seed <n>` line. The Python read `template.validation_seed`"; emits `out.push(format!("0 seed {}", s))` only when `--seed` is given; body lines `"{} accel {}"`, `"{} brake {}"`, `"{} steer {}"` (value `left` for -127, `right` for 127), `"{} respawn"`, `"{} srespawn"`; tick i is written at `ms = 10 * i` (never negative); grammar lists `<ms> seed <uint32>` and `flags`, but the exporter never writes `flags`; the replayer does `"seed" | "flags" => continue` and `verify` does not check the seed. Header comment: `"# {} ticks, ghost start offset {} s, declared {} s"`.
- `tools/tmsite/src/main.rs` (https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/tools/tmsite/src/main.rs): `tick --ghost G [--out F] [--archive N] [--raw] [--seed N]`; `verify` = "round-trip a TICK script against the ghost it came from", prints "EXACT MATCH"/"MISMATCH".
- Consequence: the user's file (negative times, `flags` lines) is a variant that adds `start_offset_ms` to the tick time and prints the gtape `flags` word. The three lines at −1500 are the full state of tick 0, not three presses at −1500.

## gtape / tape encoding (docs/formats/ghost-input-tape.md, https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/docs/formats/ghost-input-tape.md)
- Per tick: word coding `1` (repeat), `0 1 x y` (repeat, override flag bits 0–1), `0 0 <33/34-bit literal>`; then mouse bit; then vehicle same-bit → `steer:8, accel:1, brake:1` (modes 2/4), `steer:32` variants (modes 12/13).
- `flags = (lit >> 5) & 0x3FFFFF` (22 bits). "RESPAWN = bit 31 of the literal → word0 bit 5 (0x20)". Meaning of other flag bits: "unknown" in this doc.
- Steer i8 over 127; 0x80 refused; "none of the 233 real ghosts contain it". Telemetry cross-check: `byte 14 = floor((steer_i8 + 127)·255/254)`.
- `race_ms = tick × 10 + start_offset_ms`; observed `start_offset_ms` values −1580, −1570, −1520, −1510 (ghosts), −120 (replay fixture): "NEVER assume 0".
- "Regeneration is nondeterministic: ~1 in 7 runs lands a tick out. The tape itself is exact." (regeneration = re-simulation via `fk`, see below)
- Round trip `extract → inject → extract` is byte-identical.
- Arithmetic (coordinator): user's `flags 4128` = 0x1020 = flags bits 5 and 12 → literal bits 10 and 17 → equals GBX.NET `TrackmaniaInputChange.ActionSlot4` mask 132096 = 0x20400 (bits 17 and 10). Hypothesis only; physical key unknown.

## Dedicated-server oracle (docs/formats/dedicated-server-oracle.md, https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/docs/formats/dedicated-server-oracle.md)
- `TrackmaniaServer.exe /nodaemon /validatepath=<DIR>`; DIR relative to `UserData/Replays/`; only `*.Ghost.Gbx`/`*.Replay.Gbx` read; maps matched by uid from `UserData/Maps` (replays carry their map).
- Output objects: `ValidatedResult` (simulated) and `DeclaredResult` (claimed), plus `Desc`, `IsValid`, `Inputs`, `GameBuild`, `MapUid`, `AccountId`, `Login`, `FileName`; not valid JSON as a whole. Completion = non-null `ValidatedResult` with `Time > 0`. Non-finish messages: `wrong simu` optionally ", but reached some checkpoints (n out of m)"; "not finished, with N respawns"; "using unsupported respawns (N)"; "using known-flawed game exe '<build>'"; `unexcepted walltime (103s)`.
- Server ignores: identity strings, the build stamp, hashes 0x0309200E/0x0309201C, declared checkpoint count (echoed, not gating). Declared time mismatch gives a `Desc`, not rejection.
- Build mismatch usually shows as `wrong simu`; a 2022 recording on the 2026 server is the example; can also SIGSEGV.
- Archives: `http://files.v04.maniaplanet.com/server/TrackmaniaServer_YYYY-MM-DD.zip`.

## Container binding and the provenance chunk (docs/formats/ghost-cgamectnghost.md, LESSONS.md, eras-and-old-builds.md, README.md)
- "A tape validates only in the container it was built in"; moving 0x0309202D alone from file B into A turned a validating file into `wrong simu`; moving 0x0309201D + 0x0309202D together lets the tape run in any container of the map. Which field of 0x0309202D binds is listed as an explicit known gap ("Which field of `0x0309202D` binds a tape to its container.").
- 0x0309202D described as: build stamp, wall-clock pair, title name, "a roughly 36-byte per-session token", settings-flags word, start waypoint index. Build stamp rewrite "changed nothing". Wall-clock pair "leading candidate".
- GBX.NET layout of 0x0309202D (see gbx note): ExeVersion, ExeChecksum, OsKind, CpuKind, WalltimeStart/End, TitleId, TitleChecksum(32 B), U02, U03, Validate_ValidationSeed, U04, RaceSettings — i.e. the seed sits inside the block vjeux found to bind the tape.
- Result block 0x0309202B: version, raceTime, u01, u02, word4 ("GBX.NET calls it nbRespawns, and it is NOT one"), nCheckpoints, (time, tag)×n, −1.
- Build identification: recording build in 0x0309202D (`chunkswap --show FILE 0x0309202D | grep date=`); replay/map header XML carries `exever="3.3.0" exebuild="2026-04-28_18_20"` in clear text. Build ids numeric (128149 common; 113150 = 2022; 120733 = Spring 2023).
- Physics boundaries: 2021-05-31→2021-06-08 executable-only change "turned 468 of 727 finishes into wrong simu"; 2024-01-09 Snow/Rally; Feb 2024 Snow. "behaviour boundaries are not time boundaries."

## fk / regeneration (FK.md, https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/FK.md)
- "`fk` drives the TM2020 dedicated server as a physics oracle" using an `LD_PRELOAD` interposer and `fork()`; `forksrv::Rec` is `{ steer, gas, brake }` — "three `f32` written into the engine's 32-byte per-tick record". "nothing else in the simulation is non-deterministic." Stop-point variation under load: "5 of 400 quiet starts stopped one tick later", attributed to "a wall-clock catch-up branch".
- `tmauto` (INTERFACE.md): synthesises a `.Ghost.Gbx` per tape and runs the dedicated-server oracle; "only simulates while the input archive lasts," so tapes must be padded. No live-game input.
- `ghost synth` (tools/ghost/src/synth.rs): re-emits a donor ghost from parsed values; `--zero-hashes` zeroes 0x0309200E and 0x0309201C; "server does not check either -- flipping every bit of both still validates".
- `tools/openplanet-plugin/PgGhost.as`: loads/adds ghosts via `DataFileMgr.Replay_Load`, `GhostMgr.Ghost_Add/Ghost_AddPhysicalized`, `Ghosts_SetStartTime`, reads `ScriptPlayer().CurrentRaceTime/StartTime`; no input injection. Comment: "with TimeOffset 0 a ghost's zero was the playground's own zero (~7 s + the countdown before the race)".

## TMT (https://tas.trackmania.nl/) — v2.0.8, closed source, "Hooks: all 14 clean", "In-game" compute backend, setting "Predict steering from seed"; no technical docs page (/docs 404). Not evaluated; outside the normal-mode constraint envelope.
