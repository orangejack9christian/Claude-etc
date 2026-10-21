# PadTape input pipeline deep audit

Date: 2026-10-21. Scope: Trackmania (2020) on Windows, normal-mode Openplanet only, no game-setting changes, local experiments only.

Evidence labels used throughout:

- **[PUB-DOC]** official or project documentation at the linked URL.
- **[PUB-SRC]** source code at the linked URL (commit or date given).
- **[PUB-COMM]** community write-up or inference at the linked URL.
- **[LOCAL]** one of your supplied measurements (numbered 1–10 in your brief).
- **[DEDUCTION]** follows from cited material; the chain is stated.
- **[HYPOTHESIS]** plausible, not established; a test is named.

A note on the audit: the text of the previous memo is not in this session or in the repository, so the audit works from the claims you quoted. Every one of those is in the table in section 4. The six research notes behind this memo, with every URL that was opened, are in `research_notes/PadTape input pipeline deep audit/`.

---

## 1. The five most important findings

**1. The replay "seed" is a real field that the simulation consumes, and the live client picks a new one per attempt. This, not input delivery, may be the ceiling on reproducing pasted inputs.**
The field is `CGameCtnGhost.Validate_ValidationSeed`, a 32-bit int inside the ghost's validation block (chunk `0x03092025` v1 and TM2020-only chunk `0x0309202D`) [PUB-SRC: GBX.NET `CGameCtnGhost.cs` @ edbcf1b7, https://github.com/BigBang1112/gbx-net/blob/edbcf1b7ae394900075791bfb6b16511e98d46c4/Src/GBX.NET/Engines/Game/CGameCtnGhost.cs]. The dedicated server re-simulates the tape and reports `wrong simu, but reached some checkpoints (n out of m)` when the simulation diverges [PUB-DOC: vjeux dedicated-server-oracle, https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/docs/formats/dedicated-server-oracle.md]. Your seed-only edit produced exactly that signature, 4 of 5 crossings [LOCAL 3]. Independently, the vjeux project found that a tape validates only together with its own `0x0309202D` block, and lists "which field of `0x0309202D` binds a tape to its container" as an open gap [PUB-DOC: https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/docs/formats/README.md]. Your measurement answers their gap: the seed is at least one binding field. Because real client runs validate under their stored seed, the client's own simulation must depend on the seed the same way [DEDUCTION]. Your two live ghosts carried different seeds (28882743, 33359581) [LOCAL 5, 6], so each live attempt is simulated under a seed you cannot choose. What the seed perturbs (physics RNG, input processing, something else) is unknown, and the public decoders read the tape without it, so it is not an input-decoding key [PUB-SRC: GBX.NET `PlayerInputData.cs`, no seed usage]. The magnitude matters more than the mechanism, and it can be measured on your server without touching the game (section 3, experiment 1).

**2. The recorded input tape is a per-tick (10 ms) state stream, and the engine exposes fields that only make sense if it consumes timestamped buffered events rather than one snapshot per frame. "Sampled once per rendered frame" is now the less likely hypothesis, but it is still untested for live injected input.**
TM2020 inputs are chunk `0x0309201D`, one bit-packed record per 10 ms tick with steer as a signed byte and accelerate and brake as single bits [PUB-SRC: GBX.NET `CGameCtnGhost.PlayerInputData.cs` @ edbcf1b7, https://github.com/BigBang1112/gbx-net/blob/edbcf1b7ae394900075791bfb6b16511e98d46c4/Src/GBX.NET/Engines/Game/CGameCtnGhost.PlayerInputData.cs; independently Ghosts++ https://raw.githubusercontent.com/XertroV/tm-ghosts-plus-plus/master/src/Ghosts/ReadCtnGhostInputs.as]. The engine's `CInputPort` has `InputsMode {Timed, NotTimed, Config}`, `MaxSampleRate`, `MinHistoryLength`, `EventInStoreCount`, `StatsDInputTimedEventsCount`, `StatsDInputWrongTimestampAhead/Late/AvgDelta`, `StatsDInputOverflowedLastFrame`, and the device classes are `CInputDeviceDx8Keyboard`, `CInputDeviceDx8Pad` [PUB-DOC: https://next.openplanet.dev/Input/CInputPort, https://next.openplanet.dev/Input/CInputDevice, build 2026-01-26]. Those are the names of DirectInput buffered-event machinery (`GetDeviceData` with per-event `dwTimeStamp` and `dwSequence`) [PUB-DOC: https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ee417894(v=vs.85), https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ee416611(v=vs.85)]. That the game runs in `Timed` mode and assigns events to ticks by timestamp is a [HYPOTHESIS] from field names only. If true, two consequences follow: a 10 ms pulse can survive any frame rate, and the pulse can still be lost when both edges receive the same millisecond stamp, because DirectInput's `dwTimeStamp` comes from the system tick clock, whose resolution is 10 to 16 ms unless some process has raised the timer resolution [PUB-DOC: https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ee418871(v=vs.85), https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-gettickcount]. That is a concrete, cheap, testable explanation for the missing 30280 brake pulse (section 3, experiment 2).

**3. `SimulationStep()` exists in Openplanet (added in 1.29.14, roughly August 2026), but it is only usable from a signed plugin, and Openplanet's stated policy is that anything beyond visual helpers is a cheat by Nadeo's standard. In normal mode, Openplanet is an observation channel, not an injection channel, and only through plugins that pass review.**
Callback doc: "Called every physics simulation step... may be called multiple times per frame" [PUB-DOC: https://openplanet.dev/docs/reference/plugin-callbacks; changelog https://openplanet.dev/download/version/330]. Nothing documents its order relative to input sampling, its thread, vehicle count, or behaviour during countdown, pause or replays. Regular mode loads only plugins "reviewed and approved by the Openplanet team" [PUB-DOC: https://openplanet.dev/docs/tutorials/signature-modes]; signing happens only by uploading to openplanet.dev and waiting for review [PUB-DOC: https://openplanet.dev/docs/tutorials/writing-plugins]; policy: "we'll ONLY allow visual helpers. Anything more than that is considered a cheat by Nadeo" [PUB-DOC: https://openplanet.dev/news/2022/allowing-visual-sd-helpers]. No `Input` namespace, no `RequestGiveUp`, no injection method exists on `CInputPort` or `CInputScriptPad` [PUB-DOC: https://openplanet.dev/docs/api, https://next.openplanet.dev/Input/CInputScriptPad]. What normal mode does give you today, through existing signed plugins: live post-processing input values (`CSceneVehicleVisState.InputSteer/InputGasPedal/InputBrakePedal/InputIsBraking` via Dashboard and VehicleState), race timing (`CSmScriptPlayer.StartTime/CurrentRaceTime/SpawnStatus/RaceWaypointTimes` via MLFeed), UI state (`CGameTerminal.UISequence_Current`), and saving of partial attempts as `.Ghost.gbx` (Archivist) [PUB-DOC/SRC: https://openplanet.dev/plugin/dashboard, https://github.com/openplanet-nl/vehiclestate, https://github.com/XertroV/tm-mlfeed-race-data, https://openplanet.dev/plugin/archivist].

**4. Your pasted format is the vjeux `tmsite tick` TICK script, slightly modified. That settles what "seed", "flags", the −1500 lines and the trailing line mean.**
`tools/tmsite/src/tick.rs` emits an optional `0 seed <n>` line from `--seed` (doc comment: "The Python read `template.validation_seed`"), body lines `<ms> accel <v>`, `<ms> brake <v>`, `<ms> steer <v>` with `left`/`right` for ±127, and `respawn`/`srespawn`; its replayer ignores `seed` and `flags`; the stock exporter writes `ms = 10 × tick`, never negative, and never writes `flags` [PUB-SRC: https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/tools/tmsite/src/tick.rs]. Your variant adds the tape's `start_offset_ms` to each time and prints the gtape `flags` word, defined as `(literal >> 5) & 0x3FFFFF` [PUB-DOC: https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/docs/formats/ghost-input-tape.md]. Consequences: the three lines at −1500 are the full state of tick 0, not three key presses at −1500; real ghosts show `start_offset_ms` of −1580, −1570, −1520, −1510 (same doc), so spawn-to-GO is not a fixed 1500 ms in the tape frame and your live −1440 is not necessarily a 60 ms delivery error; the trailing `34420 steer 1` is a post-finish tick because the tape runs to the end of the ghost and no decoder trims at `RaceTime` [PUB-SRC: GBX.NET decode loop bounded only by `Ticks`]. Arithmetic for `flags 4128`: 4128 = 0x1020 = flags bits 5 and 12 = literal bits 10 and 17 = GBX.NET's `ActionSlot4` mask 132096 = 0x20400 exactly [PUB-SRC: `PlayerInputData.cs` L841-867; DEDUCTION]. GBX.NET's slot numbers are not physical key numbers (its wiki maps keys 1,2,3,4,5 to slots 2,4,6,8,0 [PUB-DOC: https://github.com/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts]), so the physical key behind 4128 must be mapped locally (section 3, experiment 3).

**5. The repeat failure is almost certainly in your guard and lifecycle logic, not in the game, and a single instrumented run will tell you which branch. Separately, the Windows facts needed to make Stop and takeover safe are now pinned down.**
Your probes already died on focus loss and on a race-clock readiness check [LOCAL 10], which are the top two branches of the tree in section 7. The facts that constrain the fix: `WH_KEYBOARD_LL` sees injected events with `LLKHF_INJECTED` (0x10), runs before the async key state updates, and is silently removed if the callback exceeds `LowLevelHooksTimeout` with no notification [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/winmsg/lowlevelkeyboardproc, https://learn.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-kbdllhookstruct]; neither `keyboard` nor `pynput` reads `dwExtraInfo`, so neither can tell your injections from other injections [PUB-SRC: https://raw.githubusercontent.com/boppreh/keyboard/master/keyboard/_winkeyboard.py, https://raw.githubusercontent.com/moses-palmer/pynput/master/lib/pynput/keyboard/_win32.py]; `SendInput` "does not reset the keyboard's current state" and Windows keeps one state per virtual key, so an injected key-up releases a physically held key [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput; DEDUCTION]; a console child without `CREATE_NO_WINDOW` can create a console window and steal foreground [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags; PUB-COMM snippets]; `timeBeginPeriod` is per-process since Windows 10 2004 and may be ignored for occluded processes on Windows 11 unless the process opts out via `SetProcessInformation` [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/timeapi/nf-timeapi-timebeginperiod, https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-setprocessinformation].

---

## 2. Corrections to the earlier memo

- **"Input is sampled once per rendered frame."** Still a hypothesis, and now the weaker one. The engine's `Timed` input mode and DirectInput timed-event counters point to timestamped event consumption. Neither is proven for live injected input. Keep both hypotheses until experiment 2 and the section 8 experiment run.
- **"XInputSetState marks frame boundaries."** Withdrawn. `XInputSetState` sends vibration data and nothing else [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/xinput/nf-xinput-xinputsetstate]. There is also no evidence the game calls XInput at all; its reflected device classes are DirectInput 8 (`CInputDeviceDx8Pad`). Whether `xinput1_4.dll` is even loaded by `Trackmania.exe` is a one-minute local check (section 13).
- **"SendInput delivers a batch atomically."** Partly withdrawn. Microsoft guarantees only serial insertion with no interleaving; consumption is per event, and the page says nothing about atomic consumption [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput]. A game polling key state can see a batch half-applied. A game consuming buffered DirectInput events sees N events with consecutive sequence numbers and the same or adjacent millisecond stamps.
- **"One XInput report is consumed per physics step."** Withdrawn. `XInputGetState` is a snapshot; `dwPacketNumber` says only whether anything changed since the last poll, never how many times [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/xinput/ns-xinput-xinput_state]. Intermediate states are unobservable by design.
- **"A physics callback runs before input sampling, on the right thread, once per local player."** Withdrawn as a claim. `SimulationStep()` exists, and that is all the documentation says.
- **"Counting callbacks or device reads gives the countdown origin."** Withdrawn. The only documented timing anchors are `CSmScriptPlayer.StartTime` and `CurrentRaceTime`, the mode script constant `C_SpawnDuration 1500`, and the tape's own `start_offset_ms`.
- **"A field in the SDK means normal-mode access, write permission, active use, and known meaning."** Corrected. Reflected fields are readable from any loaded plugin; `CGameCtnApp.InputPort` is `const`; writability and semantics of `FakeInputLagAvg/Var`, `PollingEnabled`, `MaxSampleRate` are undocumented and untested. And "any loaded plugin" means a signed one in normal mode.
- **"Different checkpoint times across seeds isolate the seed."** Corrected in the other direction: your synthetic pipeline holds the tape bytes, map, server build and host constant and changes one 32-bit field, so it is a controlled experiment. What it does not give you is mechanism or magnitude; a sweep does.
- **"Identical times across a few seeds prove checksum-only."** Moot and contradicted; the result depends on the seed.
- **"Sixty successful runs prove it always works."** Corrected: n of n successes bound the failure rate at about 3/n with 95 % confidence (rule of three), and only if trials are independent. 60/60 means "at most about 5 %".
- **Pulse-loss percentages.** Recomputed in Appendix B with the model stated. The honest statement is: one 10 ms pulse out of 11 brake pulses was lost in one run; a 95 % interval on the per-pulse loss rate is roughly 0.2 % to 41 %.
- **`flags 4128` and action-slot naming.** Recomputed: bits 5 and 12 of the gtape `flags` word, which is the literal shifted right by 5; that is literal bits 10 and 17, GBX.NET's `ActionSlot4` mask. The physical key is not determined by this arithmetic.
- **Citations.** Every URL in this memo was opened in this session by me or by a researcher whose notes are in the repository.

---

## 3. The next three local experiments, in priority order

### Experiment 1. Seed sweep on the dedicated server (no game, roughly one hour)

Why first: it bounds everything else. If most seeds fail the 31.392 s tape, no input-delivery work can produce a dependable finish, because each live attempt gets a seed you do not control.

Procedure, using the copy-and-edit-seed step you already have:

1. Validate the unmodified diagnostic three times. All three must return the same `ValidatedResult.Time` (31.392). If not, stop; the oracle itself is not deterministic on your host.
2. Produce 32 copies that differ only in the seed: the original ±1, 0, 0x7FFFFFFF, the two live seeds you have (28882743, 33359581), and 26 random 31-bit values. Validate them in one `/validatepath` batch.
3. For each, record `IsValid`, `ValidatedResult.Time`, the `Desc` string, and the "(n out of m)" count. Read `ValidatedResult`, never `DeclaredResult`.
4. Control for a genuine physics divergence: one copy with the original seed and a single steer value changed at tick 2900 (29 s). Its signature should be "finish prefix intact, late divergence". Compare the seed failures' signatures to it.

Readouts:

- Fraction of seeds that finish = `p_seed`. This is the ceiling on live success per attempt even with perfect input delivery [DEDUCTION, given finding 1].
- If the seed failures all diverge from early checkpoints, the seed enters the simulation from tick 0. If divergence points vary with the seed, it is consumed continuously. If some seeds finish with slightly different times, the perturbation is small and continuous.
- If every non-original seed fails and `ValidatedResult` is null with a distinct `Desc`, the server is doing an integrity check, not a re-simulation. That would contradict your 4-of-5 observation, so note it loudly if it happens.

Follow-up if `p_seed` is low: repeat the sweep with the tape shifted by exactly one tick (prepend or drop one tick-0 state). If a one-tick shift fails the same way as a seed change, the seed's effect is of the same order as a 10 ms input timing error, which tells you how much timing precision is worth buying.

### Experiment 2. Brake-pulse survival versus system timer resolution (game running, stationary, 20 minutes)

Why: it tests the one concrete mechanism identified for the lost 30280 pulse, and it is independent of the seed.

Setup: car stationary on any map, attempt not needed to finish. Run `ClockRes` first and record the current timer resolution [PUB-DOC: https://learn.microsoft.com/en-us/sysinternals/downloads/clockres].

Procedure: the worker injects 100 brake pulses with a 10 ms commanded duration at random phases (uniform 0 to 100 ms spacing jitter), logging QPC before and after each `SendInput`, with the LL hook logging QPC and `KBDLLHOOKSTRUCT.time` for each delivered event. Do this in two conditions, 100 pulses each: worker with `timeBeginPeriod(1)` active, and worker without it. Nothing in the game changes. Save the native ghost after each condition and decode the brake channel (`ghost tape extract` from the vjeux toolchain, or GBX.NET).

Predictions:

| Hypothesis | Without raised resolution | With raised resolution |
| --- | --- | --- |
| Timestamped events, stamp resolution 15.6 ms | about 36 % of 10 ms pulses lost | about 0 % lost |
| Per-tick state polling | about 0 % lost (if effective duration ≥ 10 ms) | about 0 % lost |
| Per-frame polling at F ms frame time | about max(0, 1 − 10/F) lost | same |

Also record each pulse's effective duration from the hook (delivered key-up QPC minus delivered key-down QPC). Any pulse delivered shorter than 10 ms is excluded from the loss count; the model in Appendix B is for the remainder. If the game process itself already runs at 1 ms resolution, both conditions will look alike; `ClockRes` tells you that beforehand.

### Experiment 3. Action-key mapping and cap observation (stationary, 15 minutes)

Why: it removes the last ambiguity in decoding your own files and gives you a normal-mode observer for the latched cap.

Procedure: with Dashboard (signed plugin, already published) showing the steering bar, and the car stationary, hold full steer, then press each action key once (AK1 through AK4 and, if bound, AK5), releasing between presses, with 2 s gaps; press AK2 again to test same-key cancel; then do a full restart and hold full steer again. Save the ghost. Decode with your exporter and list every `flags` value with its time.

Readouts:

- A table physical key → `flags` value → GBX.NET bit. This is the only trustworthy mapping for your pipeline. Expect 4128 to appear on exactly one key.
- Whether Dashboard's steering bar drops to the cap while the physical key is released. If it does, `CSceneVehicleVisState.InputSteer` is the post-cap value and Dashboard is a legitimate normal-mode cap observer. If it stays at 100 %, the cap lives downstream of the vis state and no normal-mode observer exists.
- Whether the restart clears the cap on ten trials rather than two [LOCAL 7].

---

## 4. Claim and evidence table (audit of the previous memo)

| # | Claim | Actual source | Status | Corrected wording | Engineering consequence |
| --- | --- | --- | --- | --- | --- |
| 1 | Input is sampled once per rendered frame | No public source; inference | Unsupported; counter-evidence exists | "The engine exposes timed-event input fields (`InputsMode::Timed`, `StatsDInputTimedEventsCount`, `MinHistoryLength`); per-tick assignment by timestamp is the leading hypothesis; untested for live input" [PUB-DOC CInputPort] | Do not design around FPS; design around event timestamps and test (Exp. 2, section 8) |
| 2 | `XInputSetState` is a frame marker | Microsoft Learn | Contradicted | "`XInputSetState` sets vibration" [PUB-DOC] | Remove from any marker plan |
| 3 | `SendInput` batches are consumed atomically | Microsoft Learn | Partly supported | "Serial insertion, no interleaving; consumption per event; a poller can split a batch" [PUB-DOC] | Send one `SendInput` call per group and verify with the hook; expect splits if the game polls between events |
| 4 | One XInput report per physics step | Microsoft Learn | Unsupported | "XInput is a snapshot API; intermediate states are lost; the game's reflected classes are DirectInput 8" [PUB-DOC] | Virtual pad path is not a timing guarantee |
| 5 | A physics callback runs before input sampling, on the right thread, once per player | openplanet.dev | Unsupported | "`SimulationStep()` exists since 1.29.14; ordering, thread, vehicle count undocumented" [PUB-DOC] | Cannot be the measurement clock until characterised, and only in a signed plugin |
| 6 | Counting callbacks or device reads yields the countdown origin | none | Unsupported | "Use `StartTime`/`CurrentRaceTime` (plugin), the tape's `start_offset_ms` (file), and a ruler input (section 6)" | Alignment must be proven with a ruler, not fitted |
| 7 | SDK field implies normal-mode access, write permission, meaning | openplanet.dev | Partly supported | "Reflected fields are readable from loaded plugins; writes and semantics undocumented; loaded means signed in normal mode" | No design may depend on writing `CInputPort` fields |
| 8 | Different CP times across seeds isolate the seed | your pipeline | Supported as a controlled single-variable test | "Same bytes, same server, one field changed: the result depends on the seed; mechanism and magnitude unknown" [LOCAL 3, PUB-DOC vjeux binding] | Run the sweep (Exp. 1) |
| 9 | Identical CP times across a few seeds prove checksum-only | none | Contradicted by LOCAL 3 | Drop | None |
| 10 | 60 of 60 proves always | statistics | Unsupported | "60/60 bounds failure at about 5 % (95 %), trials assumed independent" | Acceptance matrix uses bounds (section 9) |
| 11 | Pulse-loss percentage | your measurement | Recomputed | See Appendix B | One observation; design the experiment that gets 100 pulses |
| 12 | `flags 4128` bit mapping | GBX.NET, vjeux | Recomputed | "flags bits 5 and 12 = literal bits 10 and 17 = GBX.NET `ActionSlot4` mask 132096; physical key unknown" | Map keys locally (Exp. 3) |
| 13 | Internal search references as citations | n/a | Replaced | Real URLs throughout | n/a |
| 14 | (implicit) the seed is a nonce or checksum only | GBX.NET, revalidate, vjeux, LOCAL 3 | Contradicted | "The seed is consumed by the simulation; the client generates one per attempt; no normal-mode interface sets it" | Finding 1; Exp. 1 |
| 15 | (implicit) the seed scrambles input decoding | GBX.NET, Ghosts++ | Contradicted for the stored stream | "Decoders read steer, accel, brake without the seed, and the tape matches telemetry byte 14" [PUB-SRC, PUB-DOC vjeux] | Your decoded inputs are trustworthy as inputs |
| 16 | (implicit) virtual controller gives atomic delivery | ViGEmBus source | Supported for the report, not for consumption | "One `update()` = one whole report delivered to the pending USB read; the game still polls it" [PUB-SRC https://raw.githubusercontent.com/nefarius/ViGEmBus/master/sys/XusbPdo.cpp] | See section 6 ranking |

---

## 5. What the public evidence now says, by workstream

### 5.1 TM2020 input pipeline (workstreams 2 and 4)

Established:

- Device classes: `CInputPortDx8`, `CInputDeviceDx8Keyboard`, `CInputDeviceDx8Pad`, `CInputDeviceDx8Mouse`, `CInputDeviceMouse`; script-facing `CInputScriptPad` with pad types Keyboard, Mouse, Generic, XBox, PlayStation, Vive [PUB-DOC: https://next.openplanet.dev/Input].
- `CInputPort` fields named above; `CInputDevice` has `ReadHardwareCurState()`, `MustBePolled`, `IsUnPlugged` [PUB-DOC: https://next.openplanet.dev/Input/CInputDevice].
- On modern Windows, DirectInput keyboard and mouse are implemented by a second thread reading `WM_INPUT` (Raw Input) [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/dxtecharts/taking-advantage-of-high-dpi-mouse-movement]. Buffered events carry `dwTimeStamp` on the `GetTickCount`/`timeGetTime` clock and a global `dwSequence`; buffering is off until `DIPROP_BUFFERSIZE` is set; overflow returns `DI_BUFFEROVERFLOW` [PUB-DOC: ee417894, ee416611, ee418871 above].
- The recorded tape is one state per 10 ms tick; the dedicated server re-simulates it with no renderer [PUB-SRC GBX.NET; PUB-DOC vjeux]. The server's engine takes a per-tick record of three floats, steer, gas, brake [PUB-DOC: https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/FK.md].
- Nadeo has published no tick rate, no input-sampling statement and no input-latency patch note that the researchers could find (2020 to 2026) [PUB-COMM: devtrackers.gg index; trackmania.com news].

Inferred:

- `Timed` mode plus the "wrong timestamp ahead/late" counters imply the engine assigns device events to ticks by their timestamps and keeps a short history (`MinHistoryLength`), which would let several ticks simulated inside one slow frame consume distinct states [HYPOTHESIS].
- `MustBePolled` devices (analog sticks under DirectInput need `Poll()`) may follow a different, snapshot path than interrupt-driven keyboards [HYPOTHESIS]. If so, keyboard injection is the better-timed path, not the worse one.
- Keyboard steering is written as ±127 instantly; no keyboard ramp is documented; a TM2020 TAS author describes keyboard as "full lock or nothing" [PUB-COMM: https://github.com/vjeux/trackmania-tas].

Unknown: which thread polls, whether rendering and physics share a thread, whether the game raises its own timer resolution, how `IsPadModuleExclusive` and device switching affect a second device, and whether injected keyboard events appear in Raw Input with a null `hDevice` (Microsoft documents null only for precision touchpads [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-rawinputheader]).

Timestamps you asked about: units are milliseconds since boot on the tick clock; origin is irrelevant because the engine would use differences; wraparound is 49.7 days [PUB-DOC GetTickCount]; ordering is by `dwSequence`; late events are what `StatsDInputWrongTimestampLate` counts [HYPOTHESIS on meaning]; overflow is `DI_BUFFEROVERFLOW`, counted by `StatsDInputOverflowCount` if that is what it is. None of this is readable without a plugin.

### 5.2 Openplanet normal mode (workstream 3)

Established: `SimulationStep()` signature and 1.29.14 provenance; four signature modes; Developer Mode needs Club Edition and implies School Mode; School Mode blocks online play and official leaderboards except whitelisted maps; signing only via upload and review; ToS silent on inputs; the "only visual helpers" statement; `Dev::Hook/Write/Patch/InterceptProc` documented without restrictions [PUB-DOC links in section 1 and https://openplanet.dev/docs/api/Dev]. Documented save paths: `CGameDataFileManagerScript.Replay_Save(Path, Map, Ghost)`, `CGamePlaygroundClientScriptAPI.SaveReplay/SavePrevReplay`, local-only `CSmArenaRulesMode.Ghost_RetrieveFromPlayer`; Archivist saves partial attempts [PUB-DOC: https://next.openplanet.dev/Game/CGameDataFileManagerScript, https://next.openplanet.dev/Game/CGamePlaygroundClientScriptAPI, https://openplanet.dev/plugin/archivist]. Give-up triggers: none documented except `RequestRestartMap()` and local-mode `RespawnPlayer()/SpawnPlayer()` [PUB-DOC: https://next.openplanet.dev/ShootMania/CSmArenaRulesMode].

Unverified: whether review is manual, how long it takes, whether an unlisted upload is signed, whether any signed plugin uses `SimulationStep` yet, and all `SimulationStep` semantics.

Practical reading: a private observation plugin for your own PC is possible only if you submit it and it is signed, and only if it reads. A plugin that injects will not be signed under the stated policy. The constraint "no Developer Mode" therefore makes Openplanet a read-only channel through already-signed plugins, plus whatever read-only plugin you can get signed.

### 5.3 Atomic controller delivery (workstream 5)

- ViGEmBus: `vigem_target_x360_update` submits one complete report via a blocking IOCTL; the driver drops identical reports and completes exactly one pending USB read; if no read is pending the report is dropped, not queued, and the client library returns success anyway [PUB-SRC: https://raw.githubusercontent.com/nefarius/ViGEmClient/master/src/ViGEmClient.cpp, https://raw.githubusercontent.com/nefarius/ViGEmBus/master/sys/XusbPdo.cpp]. Project archived 2023-11-02; no open-source successor; commercial "VirtualPad" for partners [PUB-DOC: https://docs.nefarius.at/projects/ViGEm/End-of-Life/, https://docs.nefarius.at/projects/VirtualPad/]. `vgamepad` 0.1.3 (2026-02) still bundles ViGEmBus 1.17.333 [PUB-SRC: https://raw.githubusercontent.com/yannbouteiller/vgamepad/main/setup.py]. tmrl drives TM2020 this way at 20 Hz with no tick claims [PUB-SRC: https://raw.githubusercontent.com/trackmania-rl/tmrl/master/tmrl/custom/tm/utils/control_gamepad.py].
- `dwPacketNumber`: changes when state changed since last poll; origin and granularity undocumented [PUB-DOC].
- Coexistence: XInput user index is assigned by the system and not modifiable; HidHide can hide the physical pad from the game process [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/xinput/getting-started-with-xinput, https://github.com/nefarius/HidHide]. TM2020's controller selection policy is unknown.
- In-process XInput proxy: a game-folder `xinput1_4.dll` wins a load-by-name import only if the name is not a Known DLL or API set on that machine [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-search-order]. It would know poll instants but not which subsystem polled, and there is no evidence the game imports XInput at all.
- Action keys through a pad: they are pad bindings, separate from keyboard bindings; using a virtual pad for AKs means adding bindings, which your constraints forbid [DEDUCTION from the binding model; the binding UI is per device, `Dialog_BindInput(int ActionIndex, CInputScriptPad@)` [PUB-DOC: https://next.openplanet.dev/Game/CGameManiaPlanetScriptAPI]].

Strongest architecture within constraints: keyboard `SendInput`, one call per group, scan codes, tagged `dwExtraInfo`, worker with raised timer resolution and high-resolution waits (section 6).

### 5.4 Countdown and restart (workstream 6)

- Mode script: `#Const C_SpawnDuration 1500`; `StartTime = Now + C_SpawnDuration` [PUB-SRC: https://raw.githubusercontent.com/BigBang1112/maniascript-sharp/73ee8ed4ed9be43dfeafba9bbbd9ea12206ada01/src/ManiaScriptSharp.Trackmania/Scripts/Libs/Nadeo/TMGame/Modes/Race.Script.txt]. A plugin comment states `CurrentRaceTime` is negative during the countdown and reaches zero at GO [PUB-COMM: https://github.com/CornerJockeys/MLETM/blob/706635491d324fe6829ed6c17dc6fc9a26744e9a/ops-plugin/src/Telemetry/PBMonitor.as]. The tape's tick 0 is at `start_offset_ms`, observed −1510 to −1580 [PUB-DOC vjeux].
- Respawn versus give up: `RespawnTM2020` and `SecondaryRespawn` are one-way presses in the tape; `NbRespawns`/`CurrentRaceRespawns` count respawns; a give-up spawns anew (`StartTime` changes, waypoint times reset, `SpawnStatus` cycles) [PUB-DOC, DEDUCTION]. Default keys reported as Delete = Give Up, Backspace = Respawn [PUB-COMM: https://www.bisecthosting.com/blog/trackmania-controls-controller-pc-keyboard-playstation-xbox]; check yours in-game without changing them.
- Attempt identity in the file: `WalltimeStartTimestamp/EndTimestamp`, `Validate_ValidationSeed`, `GhostUid128`, `SecurityKey256` [PUB-SRC GBX.NET].
- A clock reading zero throughout the countdown still gives two edges: previous value → 0 (restart observed) and 0 → positive (GO observed, late by one sampling interval). It cannot give the countdown start. Use `CurrentRaceTime` through MLFeed if you want the negative phase.
- Proving alignment: inject a ruler, a single steer tap at a fixed app time relative to the app's GO estimate, in 20 attempts; read each tape's tick for the tap; the offset `tick×10 + start_offset_ms − app_time` must have a spread within ±10 ms and a stable mean. A stable mean is a legitimate one-time calibration; a per-attempt fit is not.
- Does countdown timing matter at all? If the car is frozen until GO, only the state at GO matters [HYPOTHESIS]. Test: two attempts with accelerate pressed at −1400 and at −200; identical first-checkpoint times mean pre-GO timing is irrelevant and PadTape only needs the right state before GO.

### 5.5 Seed and determinism (workstream 7)

Covered in finding 1 and experiment 1. Additional facts: TMF servers had `SetUseChangingValidationSeed` "whether the game should use a variable validation seed" [PUB-DOC: https://methods.xaseco.org/methodstmf.php], and the TM2020-capable server manager exposes `use_changing_validation_seed` (default false) [PUB-SRC: https://github.com/BigBang1112/mania-server-manager]. That suggests a server can hold the seed fixed for its players [HYPOTHESIS]. Nadeo validates on Linux with an older glibc that differs "in certain rare calculations"; revalidate validates on five distros and accepts "valid on any" [PUB-SRC: https://github.com/BigBang1112/revalidate]. Physics changed with the 2021-06-09 build ("some press forward might be broken") [PUB-DOC mirror: https://devtrackers.gg/trackmania/p/8fcf9b57-09-06-2021-new-update-and-changelog]. Build identification: `exebuild="YYYY-MM-DD_HH_MM"` in the replay header XML in clear text, and `Validate_ExeVersion` of the form `Trackmania date=... git=... GameVersion=3.3.0` [PUB-DOC vjeux eras; PUB-SRC revalidate regex].

Source seed versus live seed: both are the same field from the same chunk, so they are comparable values; they are not comparable runs unless `exebuild` matches too.

### 5.6 Native replay as an observation tool (workstream 8)

- What is recorded: quantised game-side input values (steer i8, gas and brake bits) per physics tick, after bindings and quantisation, before physics [PUB-SRC Ghosts++ comment "InputQuant_* inverses"; DEDUCTION]. Action keys appear as separate slot bits, so the recorded steer is most likely the raw value and the cap is applied in simulation [HYPOTHESIS; Exp. 3 tests the observer side].
- Timestamps are physics ticks; the only resolution is 10 ms; several channels can change in one tick; there is no finish marker; decoding continues to the end of the ghost [PUB-SRC].
- Codec integrity: `extract → inject → extract` is byte-identical in the vjeux tool, and GBX.NET keeps the data bytes opaque; a round trip proves the text form preserves the bits, not that the bits preserve what physics consumed [PUB-DOC vjeux; DEDUCTION]. A same-tick press and release cannot be represented at all, so any sub-tick pulse is lost before recording; a one-tick pulse is representable.
- Known decoder caveats: version 11 (33-bit) files, "car transformation", mouse-bound controls, "rare input state bugs" fixed July 2026 [PUB-DOC: https://github.com/BigBang1112/gbx-net/blob/edbcf1b7ae394900075791bfb6b16511e98d46c4/CHANGELOG.md].
- Unfinished attempts: Archivist saves them as `.Ghost.gbx` in normal mode [PUB-DOC]; GBX.NET v1 comments that the input chunk is "empty in an unfinished run" in some files, so verify that a partial ghost from your build contains a tape before relying on it.
- Provenance set to store per attempt: file hash, `Validate_ChallengeUid`, `exebuild`, `Validate_ExeChecksum`, `RaceTime`, `Checkpoints[]`, `WalltimeStart/End`, `Validate_ValidationSeed`, `GhostUid128`, `start_offset_ms`, `Ticks`.

### 5.7 Action keys (workstream 9)

Established: Nadeo describes AK3 as 60 % maximum steering, switched Snow/Rally and later all Original Trilogy cars from clamp to re-range for analog devices, and left the Stadium car unchanged [PUB-DOC: https://www.trackmania.com/news/7971, https://www.trackmania.com/news/7980]. Community: AK1 to AK5 = 20/40/60/80/100 %, same key again returns to 100 % [PUB-COMM: https://www.trackmania.com/clubs/330/news/631823], consistent with your stationary tests [LOCAL 7]. Persistence across respawn, restart, map change and focus loss is undocumented; your two trials show full restart clears AK2.

Keep four things distinct in the app: physical key (your binding), logical action slot (the tape bit, GBX.NET numbering), the `flags` word your exporter prints, and the latched cap (physics state). A neutral keyboard state clears nothing; only another AK press or a restart changes the cap. Restoring a cap without touching bindings means pressing the same physical key the source pressed, at attempt start, after confirming via Exp. 3 that restart clears it.

### 5.8 Windows scheduling and IPC (workstream 11)

Pinned facts, each with the doc in the Windows notes: per-process `timeBeginPeriod` since 2004 and the Windows 11 occlusion rule with the `PROCESS_POWER_THROTTLING_IGNORE_TIMER_RESOLUTION` opt-out; `CREATE_WAITABLE_TIMER_HIGH_RESOLUTION` since 1803, used by CPython 3.11+ `time.sleep` (measured about 1.6 ms for a 1 ms request versus 15.9 ms on 3.10) [PUB-DOC: https://docs.python.org/3/library/time.html; PUB-SRC: https://github.com/python/cpython/issues/89592]; `SetWinEventHook(EVENT_SYSTEM_FOREGROUND)` needs a message loop and can report transient handles while a window loses activation; UAC prompts switch to the secure desktop where hooks, `GetAsyncKeyState` and `SendInput` are ineffective; `CREATE_NO_WINDOW` avoids the console host window; pipes reach EOF only when every write handle, inherited copies included, is closed; `TerminateProcess` runs no cleanup; a Job Object with `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE` kills the worker on GUI crash but cannot release keys; PyInstaller `--noconsole` sets stdio to `None` and needs `freeze_support()` [PUB-DOC: https://pyinstaller.org/en/stable/common-issues-and-pitfalls.html].

Latency separation: submission latency is QPC around `SendInput` (microseconds); OS delivery latency is QPC at the LL hook callback minus submission QPC; scheduling latency is submission QPC minus the planned deadline; game-consumption latency is unobservable from outside and needs the tape or a plugin. Your 3.081 ms median [LOCAL 4] is scheduling plus submission; your 10 ms median steering delay in the tape [LOCAL 5] is one tick and includes consumption.

---

## 6. Ranked architectures with unresolved prerequisites

| Rank | Architecture | What it guarantees | Unresolved prerequisites | Verdict |
| --- | --- | --- | --- | --- |
| 1 | Keyboard `SendInput` worker (current design) + native ghost as observation + dedicated server as oracle | Ordered delivery of each group; no interleaving; works with your existing bindings; observable end to end through the hook and the tape | P1 pulse survival under timer resolution (Exp. 2); P2 one `SendInput` call per group confirmed in code; P3 GO alignment proven with the ruler; P4 `p_seed` high enough (Exp. 1) | Build on this |
| 2 | Local dedicated server as the *play* environment (not the oracle) if it holds the validation seed constant | Attempt-to-attempt reproducibility on your own server; `Permissions::CreateLocalServer` exists [PUB-DOC: https://openplanet.dev/docs/api/Permissions] | Whether the seed is server-provided and constant with `use_changing_validation_seed=false` (compare seeds of two consecutive ghosts driven on the server); whether a pasted tape recorded elsewhere is ever reproducible there (only if seeds match, which you cannot force) | Worth one evening if Exp. 1 shows `p_seed` is low; it cannot rescue foreign tapes, but it makes your own re-runs comparable |
| 3 | Virtual Xbox 360 pad (ViGEm/vgamepad) | Whole-report atomicity per `update()` | Retired driver on current Windows 11; game controller-selection policy; `MustBePolled` snapshot path may be frame-bound; action keys need pad bindings (forbidden); physical pad coexistence | Do not pursue under current constraints |
| 4 | In-process XInput proxy DLL | Exact poll instants, chosen state per poll | Whether the game loads `xinput1_4.dll` at all; Known DLLs on your machine; does not know which subsystem polled; game-folder DLL | Do not pursue until the module check (section 13) says the game imports it |
| 5 | Openplanet plugin with `SimulationStep` as tick marker and `Dev::` writes as injector | Tick-synchronous timing in principle | Not signable under stated policy; forbidden by your constraints | Excluded; a read-only plugin is the only candidate, and only if signed |
| 6 | Synthetic tape + dedicated server (what you have) | Deterministic physics oracle, seed experiments, build checks | None for its purpose | Keep as the oracle; it is not a live finish and should never be presented as one |
| — | Third-party TAS hook tools (TMT, "Hooks: all 14 clean") [PUB-COMM: https://tas.trackmania.nl/] | Unknown | Closed source, hooks the game | Outside the envelope; noted only so the ecosystem is complete |

---

## 7. Repeat-mode diagnostic tree

Symptom: single playback starts, Repeat enabled before Run, next attempt never starts. Supplied facts: per-attempt cleanup uses its own stop event; errors, interruption, focus loss and cleanup failures end the series; probes died on focus loss and on the race-clock readiness check; some old runs ended with "Keyboard worker connection ended" [LOCAL 8, 9, 10].

Instrument first, once, with one structured event log: one line per event, QPC timestamp, fields `attempt_id, component, event, detail`. It must contain every state-machine transition; every stop or cancel signal with the component that set it; every `EVENT_SYSTEM_FOREGROUND` change with hwnd, pid and exe name; every injected key with its `dwExtraInfo` tag; every LL-hook event with its injected flag and classification; worker pid and pipe open, close and EOF; the race-clock readings the readiness check consumed. Then run Repeat with a 3-second input list. The transition will be in the log.

Ranked branches, each with evidence, minimal reproduction, likely fix, regression test:

- **R1 Focus guard fires at the transition.** Evidence: stop reason "focus lost" within a second of attempt end; foreground log shows a non-game pid (your GUI after a result update, a console window of a new worker, a dialog). Repro: trigger the restart path alone with foreground logging. Fix: compare pids not hwnds; ignore your own pid; require loss to persist more than about 250 ms; spawn workers with `CREATE_NO_WINDOW`; never raise the GUI or call `SetForegroundWindow`. Test: 20 transitions with zero non-game foreground intervals over 250 ms.
- **R2 Takeover detector classifies your own restart keystroke or cleanup releases as physical.** Evidence: stop reason "takeover" timestamped at the restart send; hook log shows that event with the injected flag set but your tag missing, meaning it was sent by a different code path or library (`keyboard` sends with `dwExtraInfo = 0`). Repro: send the restart key via the app's path with the detector running and no playback. Fix: one injection function for every key you ever send, `KEYEVENTF_SCANCODE`, process-unique `dwExtraInfo`; the detector treats injected-and-tagged as self and everything else as physical. Test: unit tests on synthetic `KBDLLHOOKSTRUCT` values; 100 restart sends, zero takeover events.
- **R3 Normal end of attempt classified as interruption or error.** Evidence: result code "cancelled" although all groups were sent; bounded-attempt timer firing after the last input counted as an error. Fix: result enum `{ALL_INPUTS_SENT, FINISH_OBSERVED, TIMEOUT, CANCELLED_BY_USER, CANCELLED_BY_GUARD(reason), WORKER_ERROR}`; only the last three end a series. Test: state-machine unit tests with a fake worker.
- **R4 Stop signal leaks through another channel.** Evidence: worker pid gone at attempt end; "Keyboard worker connection ended" at the transition; next attempt writes to a dead pipe. Fix: one worker per session with `ARM/PLAY/STOP_ATTEMPT/ACK/SESSION_END` messages; if you keep a worker per attempt, wait on the old process handle and use unique pipe names. Test: 50 transitions with a stub target window.
- **R5 Race-clock readiness never satisfied after restart.** Evidence: attempt 2 stuck in "waiting for clock", then timeout; log shows the previous finish time persisting, or zero through GO, or a stale reader. Fix: readiness is the transition sequence previous value → reset value → increasing, each step with its own timeout and reason. Test: replay recorded clock traces through the readiness function.
- **R6 Restart key sent in a UI state where the binding does nothing.** Evidence: game never restarts on screen; readiness timeout follows. Fix: send restart only when attempt end is observed; confirm by the clock reset within a timeout; report "restart not observed" specifically; never spam the key. Test: 20 restarts after finish and 20 after mid-run stop.
- **R7 Held-key bookkeeping not cleared.** Evidence: "controls still held" or waiting forever for a cleanup ack. Fix: idempotent cleanup that acks with the released set; verify with `GetAsyncKeyState` after a short delay; timeout gives a specific reason.
- **R8 Stale timers from attempt N fire in N+1.** Evidence: a stop carrying attempt_id N during N+1. Fix: every timer and callback carries attempt_id; mismatches are dropped.
- **R9 Repeat flag captured wrongly.** Evidence: logged config at Run differs from the GUI. Fix: immutable session config built at Run.
- **R10 Two workers overlap.** Evidence: overlapping pids, hook install failure. Fix: as R4.

Hook-specific hazard that can masquerade as several branches: if the hook callback ever takes longer than `LowLevelHooksTimeout` (Microsoft documents no default; AutoHotkey states 300 ms; capped at 1000 ms since 1709), Windows removes the hook silently and your takeover detector goes blind without any error [PUB-DOC LowLevelKeyboardProc]. Keep the callback trivial, on its own thread, and self-check it by injecting a tagged sentinel key periodically and expecting to see it.

---

## 8. Minimal discriminating experiment

Goal: separate A frame-based state polling, B physics-step state polling, C timestamped buffered-event consumption, D downstream processing or recording artifacts, without changing any game setting and without using the theory under test as the clock.

Independent clocks and markers:

- **Wall clock:** QPC in the worker and in the hook thread (same counter, sub-microsecond, monotonic) [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/sysinfo/acquiring-high-resolution-time-stamps].
- **Frame marker (independent of the game and of the theory):** PresentMon, Intel's ETW-based capture that writes per-frame CSV for a target process without modifying it [PUB-DOC: https://github.com/GameTechDev/PresentMon]. Its timestamps are QPC-based ETW timestamps; align by capturing one injected event's hook QPC in the same run.
- **Tick marker:** the tape itself provides tick indices; its tick 0 is `start_offset_ms` before GO. There is no independent tick marker available in normal mode. This is the irreducible ambiguity between B and D, handled below by using durations rather than absolute phases.

Input sequence: on a flat map with the car stationary, inject 400 brake pulses in randomised order: 100 each of commanded durations 5, 10, 20 and 40 ms, with random inter-pulse gaps of 60 to 200 ms, each pulse's down and up in separate `SendInput` calls (so the OS stamps them separately). Also inject 50 "simultaneous" groups of steer+brake in one `SendInput` call. Log for every event: planned QPC, submit QPC, hook QPC, hook `time`. Run twice: once at normal frame times, once with an external GPU load (a video render in another process) to lengthen frame times, measured by PresentMon. Raise the worker's timer resolution in both runs, so Exp. 2's effect is removed from this experiment.

Expected observations:

| Observation | A frame polling | B tick polling | C timestamped events | D artifacts |
| --- | --- | --- | --- | --- |
| 5 ms pulses recorded | about 5/F fraction, F = frame ms | about 50 % | about 50 % | depends |
| 10 ms pulses recorded | about 10/F | about 100 % | about 100 % | same as B or C |
| Recorded duration of 40 ms pulses in ticks | multiples of ceil(F/10) | 4 ± 1 | 4 ± 1 | 4 ± 1 |
| Under lengthened frames (F ≈ 50 ms) | pulses shorter than F vanish or stretch to ceil(F/10) ticks | unchanged | unchanged | unchanged |
| Recorded tick minus hook-time tick, per event | varies with frame phase (correlated with PresentMon frame boundaries) | uniform 0 to 1 tick | constant offset, low spread | constant |
| Same-call steer+brake split across ticks | rare (one pump sees both) | possible if polled between events | only when the two events straddle a millisecond stamp boundary | n/a |

Ambiguities that remain: B versus C under short frames are indistinguishable by survival; the "recorded tick minus hook tick" spread separates them only if the hook-to-game delivery jitter is below one tick. B versus D cannot be separated without a game-side observer; mitigate by cross-checking 40 ms pulses against telemetry byte 18 (brake) in `CPlugEntRecordData`, which samples at roughly 20 to 50 Hz [PUB-COMM: https://raw.githubusercontent.com/XertroV/tm-editor-plus-plus/master/research/2026-08-30-GhostInputsAndPositions.md]: a pulse present in telemetry but absent in the tape is a recording artifact; absent in both is consumption loss or recording loss, undetermined.

Preserving the original replay: save the ghost through the game's own save or Archivist, hash it, and never edit the original; decode from a copy.

Configuration: nothing in the game is changed; frame time is varied by external load only; PresentMon is a separate process.

Early stopping: if PresentMon cannot see the game's presents (unsupported presentation path), drop the A-versus-rest discrimination and keep the survival-by-duration part. If the hook shows injected events not being delivered (UIPI), stop; the game is running at a higher integrity level than the worker.

---

## 9. Acceptance-test matrix

| Capability | Measurement | Pass criterion | Trials and confidence |
| --- | --- | --- | --- |
| Single complete attempt | Worker log and tape | All 235 post-countdown groups submitted, max scheduling lateness < 5 ms, tape contains every edge within one tick | 1 trial shows possibility only |
| One-tick brake pulse | Source vs tape for every 10 ms pulse | Every 10 ms pulse present with duration one tick | ≥ 30 pulses across runs before claiming a loss rate under 10 % (0.9^30 ≈ 4 %) |
| Simultaneous changes | Every group with ≥ 2 changes | All changes on the same tick | 236 groups per run; report splits per run |
| Countdown alignment | Ruler tap offset, 20 attempts | Spread ≤ ±10 ms, stable mean; state at GO equals source state | Mean may be calibrated once; no per-attempt fitting |
| Action keys | Tape slot bits and the cap observer | 4 of 4 edges present; cap matches source after each AK event | Stationary plus in-run |
| Repeat transition | Event log | Next attempt arms and GO observed within 15 s, 20 of 20 | Repeat across two sessions |
| Stop and takeover | Press Stop or a physical key during playback | All owned keys released within 50 ms; no owned key left down; physical key not released by the app | 20 each |
| Worker failure | Kill worker pid mid-attempt | `WORKER_ERROR` reported within 1 s with reason; GUI releases keys; next Run works | 10 |
| Original replay evidence | Hash and parsed metadata | Map uid, exebuild, finish, checkpoints match the attempt record; local server `ValidatedResult` equals declared | Every attempt |
| Runs under load | 20 runs with a browser video playing | Same metrics; report distributions | Wilson interval on pass rate |

Confidence: n of n successes gives a 95 % upper bound on the failure rate of about 3/n. 20/20 → ≤ 14 %, 60/60 → ≤ 5 %, 300/300 → ≤ 1 %. Trials in one session share timer state, thermal state, the game session and possibly the seed distribution; spread them over sessions and days before quoting a bound. For the finish itself, the live success rate is bounded above by `p_seed` from experiment 1, whatever the input delivery achieves.

---

## 10. The standalone app

Components feasible now, with no unresolved research:

- **Parser and validator** for the TICK dialect: header comments, optional `0 seed N`, body `<ms> <action> <value>`, actions `accel, brake, steer, respawn, srespawn, flags`; enforce ms multiples of 10, steer in −127..127 or `left/right`, monotone times; keep `flags` lines as opaque until Exp. 3 maps them; mark the first tick's three lines as initial state; treat lines at or after the declared finish as post-finish and exclude them explicitly with a visible count. Store source text, SHA-256, seed, exclusions, and the derived group list.
- **Environment check without changing anything:** read the newest replay or ghost in `Documents\Trackmania\Replays` and parse `exebuild`, map uid and `Validate_ExeVersion`; compare with the source's recorded build if present; show "build differs" as a warning, not an error. Read your current bindings from the game's own config file if you can locate it read-only; otherwise ask the user once and store the mapping.
- **Session and attempt state machine** with the result enum from R3, immutable session config, per-attempt ids, one worker per session, explicit `ARM/PLAY/STOP_ATTEMPT/ACK` protocol, heartbeat, Job Object for parent loss, and the structured event log from section 7.
- **Guards** as separate threads that never touch keys: foreground by pid with debounce; LL hook with tag-based self recognition and the sentinel self-check; desktop-switch detection for UAC.
- **Worker** using absolute deadlines from `perf_counter`, `time.sleep` on Python 3.11+ (high-resolution waitable timer), `timeBeginPeriod(1)` plus the power-throttling opt-out, one `SendInput` per group with scan codes and tagged `dwExtraInfo`, and release of `ours_down − physical_down` only.
- **Attempt history** with separate tables for live attempts, synthetic oracle runs and experiments; every live attempt links its ghost hash and parsed metadata; an attempt is "finished" only when a native file says so.
- **Mode display:** "Single" or "Repeat n/N", the current attempt id, and the last stop reason verbatim from the enum.

Components blocked on research:

- Pulse reliability and timer-resolution setting (Exp. 2).
- GO alignment constant (ruler test) and whether pre-GO timing matters.
- Action-key mapping table (Exp. 3).
- Any claim about expected finish rate (Exp. 1).
- Automatic finish verification through the local dedicated server (feasible, but only after the server workflow is wrapped: copy ghost to `UserData/Replays/<dir>`, run `/validatepath`, parse `ValidatedResult`).

Everything runs without ChatGPT; nothing in the design calls a model.

---

## 11. Five-minute feasibility

Budget for your 31.392 s tape with the game already on the map:

| Step | Time |
| --- | --- |
| Parse, validate, environment check | < 1 s |
| Countdown + run + restart | about 1.5 + 31.4 + 2 to 5 s ≈ 40 s |
| Save and parse the ghost, hash, record | 5 to 15 s |
| Attempts possible in 5 minutes | 5 to 6 |

Conditions under which five minutes is realistic: the game is running on the right map (map load is outside the budget and unmeasured); `exebuild` matches the source; the tape is known to finish on that build under its own seed (your oracle says yes for this tape); pulse delivery is fixed (Exp. 2); GO alignment is within one tick; and `p_seed` is high. With k attempts and independent seeds, P(at least one finish) = 1 − (1 − p_seed)^k; for k = 5 you need p_seed ≥ 0.37 for a 90 % chance.

Conditions that make it impossible: a tape longer than about four minutes (one attempt eats the budget); a build mismatch (physics changed, documented 2021-06-09, 2024-01-09, February 2024 boundaries); a map not yet downloaded; inputs that only finish under their original seed (p_seed near 0); a frame-rate-bound consumption path on your PC (section 8 would show it); or inputs that were never valid on the current build.

Conclusion: conditional. For this tape, on the same build, with the fixes above, five minutes is plausible if and only if experiment 1 returns a p_seed of roughly 0.4 or higher. If it returns near zero, no amount of input engineering reaches the target, and the honest product scope becomes "reproduce my own runs on my own server" rather than "finish arbitrary pasted inputs".

---

## 12. Implementation sequence

1. Add the structured event log and run one Repeat transition. Fix the branch it names (section 7). One day.
2. Run experiment 1 on the server. Decide the product scope from `p_seed`. One evening.
3. Run experiment 2. Set timer resolution and the power-throttling opt-out in the worker if it helps. One evening.
4. Rebuild the injection function: one `SendInput` per group, scan codes, tagged `dwExtraInfo`, physical-versus-ours tables in the hook, sentinel self-check. Two days.
5. Run experiment 3 and build the key-to-flags table into the parser. One hour.
6. Ruler test for GO alignment and the −1400 versus −200 pre-GO test. One evening.
7. Wrap the dedicated-server oracle as the finish verifier and provenance recorder. One day.
8. Run the acceptance matrix over three sessions. Report distributions, not pass/fail words.
9. Only then, the section 8 experiment, if the pulse and alignment results leave a mechanism question that changes a design decision.

---

## 13. Do not spend more time on this yet

- The XInput proxy DLL, until a read-only check of the game's loaded modules (Process Explorer or `tasklist /m xinput*`) shows `xinput1_4.dll` or `xinput9_1_0.dll` loaded by `Trackmania.exe`. The reflected device classes say DirectInput 8.
- Any Openplanet plugin that writes or injects. It will not be signed, and your constraints exclude Developer Mode.
- Reproducing or setting the validation seed. No normal-mode interface exists; measure its effect instead.
- The virtual-pad path. Retired driver, polled-device uncertainty, and it needs pad bindings you have forbidden yourself from adding.
- Writing a tape encoder. `ghost tape inject` and `ghost tape extract` already round-trip byte-identically [PUB-DOC vjeux]; GBX.NET decodes.
- Fitting per-attempt countdown offsets. Use the ruler once.
- `dwPacketNumber` semantics and ViGEm internals. Settled enough; not on the chosen path.
- Reverse engineering TMT or other hook tools.
- Frame-rate theories before experiment 2. The cheaper mechanism must be excluded first.

---

## 14. Remaining unknowns and exactly what settles each

| Unknown | Settles it |
| --- | --- |
| What the seed perturbs and how much | Exp. 1 sweep with the one-tick-shift and late-flip controls; then, if needed, sweep on two server distros (noble vs resolute images [PUB-SRC mania-server-manager]) to exclude libm effects |
| Whether the seed is constant on a local dedicated server | Drive two consecutive attempts on a local server; compare `Validate_ValidationSeed` in the two ghosts |
| Whether the engine consumes timestamped events for keyboard | Exp. 2 (timer-resolution dependence) and the section 8 survival-by-duration table |
| Whether `SimulationStep` runs before input sampling, synchronously, once per vehicle | Only a signed read-only plugin that logs `SimulationStep` count, `CurrentRaceTime` and `InputSteer` per call; compare with the tape. Requires review; not on the critical path |
| Whether `CSceneVehicleVisState.InputSteer` is post-cap | Exp. 3 with Dashboard |
| Whether the cap survives restart, respawn, map change, focus loss | Ten trials each, stationary, read via Dashboard and the tape |
| Which physical key each `flags` value is | Exp. 3 |
| Whether pre-GO timing matters | −1400 vs −200 accelerate test, compare first-checkpoint times |
| Whether injected keys appear in Raw Input with null `hDevice` (relevant only if the game filters by device) | A 50-line Raw Input logger run next to the game; log `hDevice` for tagged injections |
| Whether the game raises timer resolution itself | `ClockRes` with the game running and nothing else |
| Whether the game imports XInput | Loaded-module check |
| Exact default `LowLevelHooksTimeout` on your machine | Read `HKCU\Control Panel\Desktop\LowLevelHooksTimeout`; absent means the undocumented default |
| Whether a partial ghost from your build contains a tape | Save one with Archivist and decode |
| Why "Keyboard worker connection ended" occurred | The structured log's pipe events |

---

## Appendix A. Pseudocode for synchronisation and ownership

No invented APIs; names are placeholders for your existing components.

```
Session (GUI side)
  config = freeze(gui_state)              # immutable at Run
  session_stop = Event()                  # only Stop button or fatal error sets this
  worker = start_worker_once()            # CREATE_NO_WINDOW, Job Object, named pipe
  for n in 1..config.max_attempts:
      if session_stop.is_set(): break
      attempt = Attempt(id=n, stop=Event())           # per-attempt cancellation only
      worker.send(ARM, attempt.id, groups, deadline)
      wait ACK(ARM, attempt.id) with timeout   -> reason "worker did not arm"
      if not request_restart_and_observe(attempt): stop series, reason "restart not observed"
      worker.send(PLAY, attempt.id, t_go_estimate)
      result = wait RESULT(attempt.id) or guard event
      worker.send(STOP_ATTEMPT, attempt.id); wait ACK with released-key set
      verify_no_owned_keys_down()
      record(attempt.id, result, ghost_path, ghost_hash, parsed_metadata)
      if result.kind in {CANCELLED_BY_USER, CANCELLED_BY_GUARD, WORKER_ERROR}: break
      if not config.repeat: break
  worker.send(SESSION_END); join worker

Guards (own thread with a message loop; they never touch keys)
  on EVENT_SYSTEM_FOREGROUND(hwnd): pid = owner(hwnd)
      if pid not in {game_pid, own_pid} for > 250 ms: attempt.stop.set("focus:" + exe(pid))
  on EVENT_SYSTEM_DESKTOPSWITCH: attempt.stop.set("desktop switch")
  on LL hook event(e):
      if e.injected and e.extra_info == OUR_TAG: log self; update ours_down
      else: update physical_down; attempt.stop.set("takeover:" + vk); session_stop.set()
  every 2 s: inject tagged sentinel (a key the game ignores); if not seen in 100 ms: hook lost -> WORKER_ERROR

Worker (keyboard process)
  timeBeginPeriod(1); SetProcessInformation(ProcessPowerThrottling, ignore_timer_resolution=honor)
  on ARM: load schedule; reply ACK
  on PLAY: for group in schedule:
              deadline = t_go + group.t_ms
              sleep_until(deadline - 1.5 ms); spin_until(deadline)
              t0 = qpc(); SendInput(all key events of the group, scancodes, OUR_TAG); t1 = qpc()
              log(group.id, deadline, t0, t1)
           reply RESULT(ALL_INPUTS_SENT)
  on STOP_ATTEMPT or attempt.stop: release (ours_down - physical_down) only; reply ACK(released)
  heartbeat every 250 ms; parent silence for 3 beats -> release and exit

Restart observation
  send restart key (tagged) once
  wait for clock: last_value -> reset_value   (timeout 10 s, reason "no reset")
  wait for clock: reset_value -> increasing   (timeout 5 s, reason "no GO")
  t_go_estimate = qpc at first increasing sample - calibrated_bias   # bias from the ruler test, measured once

Alignment proof (run 20 times, offline analysis)
  tap_tick = tape tick of the ruler steer tap
  offset = tap_tick*10 + start_offset_ms - planned_tap_ms
  pass if max(offset) - min(offset) <= 10 and mean(offset) is stable across days
```

Seed sweep (server side, using your existing copy-and-edit step):

```
for seed in [orig, orig+1, orig-1, 0, 0x7FFFFFFF, 28882743, 33359581] + 26 random:
    copy diagnostic -> dir/seed_<seed>.Ghost.Gbx with only the seed field changed
run TrackmaniaServer /nodaemon /validatepath=<dir> ; stdout -> file
for each record: keep FileName, IsValid, ValidatedResult.Time, Desc, "(n out of m)"
p_seed = finishes / total
```

## Appendix B. Pulse-loss model and the flags arithmetic

Supplied: 22 brake edges in source, 20 matched; the missing pair is the 30280 on / 30290 off pulse [LOCAL 5].

- Missing edges over brake edges: 2/22 = 9.1 %.
- Missing pulses over brake pulses: 1/11 = 9.1 % (assumes brake starts released).
- Missing edges over all edges: 2/256 = 0.78 % (256 = 227 + 3 + 4 + 22).
- Missing 10 ms pulses over 10 ms pulses: 1/N10, where N10 is the number of brake pulses whose source duration is exactly 10 ms; N10 is not in the supplied data.
- 95 % Clopper–Pearson interval for a per-pulse loss rate from 1 loss in 11: about 0.2 % to 41 %.

Model, periodic sampling with uniform phase: if the consumer samples every T ms and the pulse is effectively held for D ms, P(miss) = max(0, 1 − D/T).

| T | D = 6 | D = 8 | D = 10 | D = 12 | D = 14 |
| --- | --- | --- | --- | --- | --- |
| 10 (tick) | 40 % | 20 % | 0 | 0 | 0 |
| 15.6 (tick-clock stamp, Exp. 2 hypothesis) | 62 % | 49 % | 36 % | 23 % | 10 % |
| 16.7 (60 fps) | 64 % | 52 % | 40 % | 28 % | 16 % |
| 6.9 (144 fps) | 14 % | 0 | 0 | 0 | 0 |

Effective D = 10 + (lateness_off − lateness_on); the median lateness of 3.081 ms says nothing about that difference, so the worker log must record both edges of each pulse.

Flags: 4128 = 0x1020 = 2^12 + 2^5. With `flags = (literal >> 5) & 0x3FFFFF`, the literal bits are 17 and 10. GBX.NET's `TrackmaniaInputChange.ActionSlot4` mask is 132096 = 0x20400 = 2^17 + 2^10. The match is exact; the physical key is not implied.

## Appendix C. Research notes and sources

All opened URLs, with dates and commits, are in these files under `research_notes/PadTape input pipeline deep audit/`:

- `openplanet_capabilities.md` (SimulationStep, modes, permissions, input visibility, race state, saving, give-up, injection, policy, plugins)
- `gbx_inputs_seed_flags.md` (tape chunk and bit layout, seed field, flags bits, timestamps, telemetry, provenance, round-trip)
- `tm2020_input_pipeline.md` (input classes, tick rate evidence, settings, action keys, countdown, respawn, anti-cheat)
- `validation_seed_determinism.md` (dedicated-server validation, seed, determinism, builds, tools)
- `windows_injection_atomicity.md` (SendInput, XInput, ViGEm, DirectInput buffering, Raw Input, DLL search order, timers)
- `windows_scheduling_ipc.md` (timer resolution, focus, hooks, release safety, pipes, jobs, priorities, measurement)
- `vjeux_trackmania_tas_followup.md` (the TICK format, gtape flags, oracle output, container binding, builds)
