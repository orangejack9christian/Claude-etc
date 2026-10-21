# PadTape input pipeline deep audit (corrected, version 2)

Date: 2026-10-21. Scope: Trackmania (2020) on Windows, normal-mode Openplanet only, no game-setting changes, local experiments only. Version 1 was cross-checked against the repository code, the attempt journals, the proxy logs and a second independent report; this version keeps what was confirmed, fixes what was wrong, and adds what was missing. Section 0 lists every change and why.

Evidence labels:

- **[PUB-DOC]** official or project documentation at the linked URL.
- **[PUB-SRC]** source code at the linked URL (commit or date given).
- **[PUB-COMM]** community write-up or inference at the linked URL.
- **[LOCAL]** one of your supplied measurements from the original brief (numbered 1–10).
- **[LOCAL-CC]** a fact from the 2026-10-21 cross-check against your code, journals and proxy logs; file:line given where you gave it.
- **[DEDUCTION]** follows from cited material; the chain is stated.
- **[HYPOTHESIS]** plausible, not established; a test is named.

The seven research notes behind this memo, with every URL that was opened, are in `research_notes/PadTape input pipeline deep audit/`.

---

## 0. Change log against version 1

| # | What changed | Why |
| --- | --- | --- |
| C1 | Removed "no evidence the game calls XInput; check for xinput1_4.dll". Replaced with: `Trackmania.exe` imports `XINPUT9_1_0.dll`; a proxy `xinput9_1_0.dll` in the game folder is loaded, intercepts `XInputGetState` (return address inside `Trackmania.exe`), drove the car and produced live finishes in September 2026; keyboard and mouse go through DirectInput8 W interfaces and the game calls both `GetDeviceData` and `GetDeviceState` on every pass; the `DIPROP_BUFFERSIZE` set was never captured [LOCAL-CC]. | Superseded by local evidence; a check for `xinput1_4.dll` would be negative and mislead. |
| C2 | Architecture rank 4 reworded: the proxy works, CLI only, worth a small experiment; keep it out of the app until its action-key handling (needs a pad binding) and an independent frame marker exist. | Same local evidence. |
| C3 | Added the measured consumption model: for the pad, physics tick k uses the newest `XInputGetState` read whose call time is at or before t0 + 10k ms (0 mismatches over 872 + 854 ticks, 2026-09-23); 13–19 % of 10 ms windows contain no read at 54–74 fps; the counted-read model is contradicted (2 of 39 finishes vs 15 of 37); the keyboard is read once per physics tick in the same burst [LOCAL-CC]. "Once per rendered frame" is contradicted at the API-call level; which of the two DirectInput values physics uses stays open, so the Timed-mode hypothesis stands. | Facts I lacked. |
| C4 | Repeat tree rewritten against the code: a fresh stop Event is created per Run (`personal_app.py:191`) while the Stop button is bound to the stale Event created at line 92 (binding at line 126), so the button is dead after the first Run; one string "Stopped or manual takeover" covers F8, Escape, guard focus loss, guard key press and watchdog; the captured failure was the repeat guard checking foreground before activation completed (`repeat_playback.py:25`), now fixed with a bounded wait for stable focus; the takeover hook stops on any physical key-down including autorepeat; the app already tags injections with `dwExtraInfo` and uses its own ctypes `WH_KEYBOARD_LL` hook; build 9 ran 40 consecutive repeat attempts; the untested link is the finish screen (7 of 14 starts right after a finish failed on another map vs 0 of 66 after a non-finish) [LOCAL-CC]. Removed the remark about `keyboard`/`pynput` not reading `dwExtraInfo` as a design constraint (kept only as a library fact). | Version 1 was written without the code. |
| C5 | Brake pulse: the app posts key releases before key presses inside each `SendInput` batch, about 1.4 ms per event, so the 30280 pulse was held 4.5–8.5 ms (median 7.0 ms) before the OS posted the last event; telemetry shows half-applied batches; the pulse was lost in 4 of 6 native recordings and survived as a 20 ms, one-tick-late edge in the other 2 [LOCAL-CC]. Appendix B recomputed for D = 7 ms; experiment 2 now runs after the batch-order fix or excludes short-hold pulses. | The effective hold was unknown in version 1. |
| C6 | Removed the "−1400 vs −200 accelerate" test. The validator answered it: holding gas earlier changes nothing to the millisecond (seven tapes, 2026-09-23). Kept "hold gas from −1500" because the clock reads 0 for the first physics ticks after GO and a late first input kills knife-edge laps [LOCAL-CC]. | Already answered. |
| C7 | Seeds: eight different live seeds on map 11 (26358440 to 33359581) plus seed 0 in 10 of 23 session ghosts; 28982314 belongs to the rank-7 ghost (Tomasus) and was copied in by the exporter; exported seeds reach 41219375, so no range check is valid [LOCAL-CC]. | Version 1 said "two live seeds". |
| C8 | "Developer Mode needs Club Edition": exact sentence and URL given; today's re-fetch of the page returned HTTP 502, so the quote is from the 2026-10-20 pass. "Nadeo describes AK3 as 60 %": corrected to the exact sentence, which is specific to Snow and Rally cars in the February 2024 experiment post, not a general AK3 definition. | Exact wording demanded. |
| M-a | New top finding: the app has no leaderboard-upload guard and drove the official Fall 2026-11 map while logged in to live services; a regular-mode tape finish has posted to a public board before (Kacky #01, 2026-09-19, rank 584 → 3) [LOCAL-CC]. Map gate added as implementation step 0. | Missing; it is the one item that can cause harm outside your PC. |
| M-b | New: the repository uses GBX.NET 2.4.2 in `tmai-gbx` and 2.4.4 in `GbxInspector`; 2.4.4 carries "Fix rare input state bugs" and "Fix start bits" (2026-07-24); 2.4.2 misreads kind-0xF opening words [LOCAL-CC; PUB-DOC changelog]. | Decoder split can masquerade as game loss. |
| M-c | New: a plugin-free cap observer exists, the `ManiaPlanet_Telemetry` shared memory publishing `InputSteer` about every 36 ms, reading ±0.4 under AK2 [LOCAL-CC]; Dashboard remains the plugin alternative. | Missing. |
| M-d | New defects: `decoded_inputs_to_tape.py` replays AK2 as AK3 (slot index mismatch); Ctrl+T in the app's Tk text box transposes two characters of the pasted source, which is Tk's documented default binding [LOCAL-CC; PUB-DOC]. | Missing. |

Everything marked "right" in the cross-check is retained unchanged in substance: the seed field and per-attempt draw, the TICK dialect and the meaning of the −1500 lines and the trailing line, the flags arithmetic, SimulationStep and the signing policy, the `CInputPort` Timed/NotTimed fields, the `dwTimeStamp` stamp-resolution mechanism, `C_SpawnDuration 1500`, Archivist, the seed-sweep design with its two controls, the 400-pulse stationary experiment, and the rule-of-three statistics.

---

## 1. The five most important findings

**1. Safety first: nothing stops a finish from posting to a public leaderboard, and the Stop button is dead after the first Run.**
The app has no leaderboard-upload guard; it drove the official Fall 2026-11 map while the game was logged in to live services, and a regular-mode tape finish has already posted to a public board once (Kacky #01, 2026-09-19, rank 584 → 3) [LOCAL-CC]. Your own constraint is "keep experiments local and isolated from public competition"; the TAS community's norm is the same (TMInterface: "Do not ever attempt to drive legitimate runs and compete on public leaderboards while running this client" [PUB-DOC: https://donadigo.com/tminterface/]; TMTAS Exchange keeps a separate TAS board [PUB-COMM: https://tmtas.exchange/faq]). The source tape itself is another player's rank-7 ghost [LOCAL-CC, C7], which makes an accidental post a reproduction of someone else's record under your account. Separately, a fresh stop Event is created per Run at `personal_app.py:191`, but the Stop button is bound at line 126 to the Event created at line 92, so after the first Run the button signals an object nobody waits on [LOCAL-CC]. Both are implementation step 0 (section 12). Whether to ask Nadeo to remove the 2026-09-19 record is your decision; the reporting route is documented at https://doc.trackmania.com/general/how-to-report-player/ [PUB-DOC].

**2. The replay seed is consumed by the simulation, the client draws a new one per attempt, and no normal-mode interface sets it. This bounds reproduction of pasted inputs before any input-delivery work.**
The field is `CGameCtnGhost.Validate_ValidationSeed`, a 32-bit int inside the validation block (chunk `0x03092025` v1 and TM2020-only `0x0309202D`) [PUB-SRC: GBX.NET `CGameCtnGhost.cs` @ edbcf1b7, https://github.com/BigBang1112/gbx-net/blob/edbcf1b7ae394900075791bfb6b16511e98d46c4/Src/GBX.NET/Engines/Game/CGameCtnGhost.cs]. The dedicated server re-simulates the tape and prints `wrong simu, but reached some checkpoints (n out of m)` when the simulation diverges [PUB-DOC: https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/docs/formats/dedicated-server-oracle.md]. Your seed-only edit produced that signature, 4 of 5 crossings [LOCAL 3]. The vjeux project found a tape validates only together with its own `0x0309202D` block and lists "which field of `0x0309202D` binds a tape to its container" as an open gap [PUB-DOC: https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/docs/formats/README.md]; your measurement answers it. Real client runs validate under their stored seed, so the client's simulation depends on the seed the same way [DEDUCTION]. Live seeds observed: eight distinct values on map 11 between 26358440 and 33359581, plus seed 0 in 10 of 23 session ghosts; the source seed 28982314 is Tomasus's rank-7 ghost, copied in by the exporter; exported seeds reach 41219375, so no range check on the field is valid [LOCAL-CC]. Public decoders read the tape without the seed, so it is not an input-decoding key [PUB-SRC: https://github.com/BigBang1112/gbx-net/blob/edbcf1b7ae394900075791bfb6b16511e98d46c4/Src/GBX.NET/Engines/Game/CGameCtnGhost.PlayerInputData.cs]. Mechanism unknown; magnitude is measurable on your server with no game involved (experiment 1). Seed 0 needs its own row in the sweep: it may mean "no seed", a different code path, or an unfinished-ghost marker [HYPOTHESIS].

**3. How the game consumes input is now partly measured: per-tick reads, newest-read-before-tick for the pad, and a batch-order bug that shortened the lost brake pulse to about 7 ms.**
`Trackmania.exe` imports `XINPUT9_1_0.dll`; the proxy intercepts `XInputGetState` with the return address inside `Trackmania.exe` [LOCAL-CC]. For the pad, physics tick k uses the newest read whose call time is at or before t0 + 10k ms, with 0 mismatches over 872 + 854 ticks (2026-09-23); at 54–74 fps, 13–19 % of 10 ms windows contain no read; a model that counts reads instead of timing them finished 2 of 39 attempts versus 15 of 37 for the time-based model [LOCAL-CC]. Keyboard and mouse go through DirectInput8 W interfaces; the game calls both `GetDeviceData` (buffered, timestamped events) and `GetDeviceState` (snapshot) on every pass, and the keyboard is read once per physics tick in the same burst [LOCAL-CC]. So "input is sampled once per rendered frame" is contradicted at the API-call level. Which of the two DirectInput values physics uses is still open; the engine's `CInputPort` exposes `InputsMode {Timed, NotTimed, Config}`, `MaxSampleRate`, `MinHistoryLength`, `EventInStoreCount`, `StatsDInputTimedEventsCount`, `StatsDInputWrongTimestampAhead/Late/AvgDelta` [PUB-DOC: https://next.openplanet.dev/Input/CInputPort, build 2026-01-26], which is DirectInput buffered-event vocabulary (`dwTimeStamp`, `dwSequence`) [PUB-DOC: https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ee417894(v=vs.85), https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ee416611(v=vs.85)], so the Timed hypothesis stands: events assigned to ticks by their millisecond stamp [HYPOTHESIS]. The stamp comes from the system tick clock, 10–16 ms resolution unless raised [PUB-DOC: https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ee418871(v=vs.85), https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-gettickcount]; two edges with the same stamp land on the same tick, and that is consistent with the two recordings in which the 30280 pulse survived as a 20 ms, one-tick-late edge [LOCAL-CC]. The app also posts releases before presses inside each batch at about 1.4 ms per event, so that pulse was held 4.5–8.5 ms (median 7.0) before the OS posted the last event, and telemetry shows half-applied batches; it was lost in 4 of 6 recordings [LOCAL-CC]. The 1.4 ms per event is far above `SendInput`'s own cost and is most likely the synchronous low-level hook callback, which Windows runs for every injected event before it reaches the game [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/winmsg/lowlevelkeyboardproc; DEDUCTION]. Ordering fix and hook cost are step 1 in section 12; the consumption question has a decisive proxy-side test (experiment 3).

**4. `SimulationStep()` exists (Openplanet 1.29.14, roughly August 2026) but only a signed plugin can use it, and the stated policy is visual helpers only. Openplanet is a read-only channel for you.**
"Called every physics simulation step... may be called multiple times per frame" [PUB-DOC: https://openplanet.dev/docs/reference/plugin-callbacks; changelog https://openplanet.dev/download/version/330]; ordering, thread and countdown behaviour undocumented. Regular mode loads only plugins "reviewed and approved by the Openplanet team" [PUB-DOC: https://openplanet.dev/docs/tutorials/signature-modes]; "we'll ONLY allow visual helpers. Anything more than that is considered a cheat by Nadeo" [PUB-DOC: https://openplanet.dev/news/2022/allowing-visual-sd-helpers]. Developer Mode: "Developer Mode lets users run unsigned plugins, which requires Club Edition" [PUB-DOC: https://openplanet.dev/news/2022/developer-mode, opened 2026-10-20; re-fetch on 2026-10-21 returned HTTP 502] and "In order to write your own plugins, you need Club Edition in Trackmania (2020)" [PUB-DOC: https://openplanet.dev/docs/tutorials/writing-plugins, opened 2026-10-20; same 502 today]. Nothing on `CInputPort` or `CInputScriptPad` injects, and no `RequestGiveUp` exists on any documented class [PUB-DOC: https://next.openplanet.dev/Input/CInputScriptPad, https://next.openplanet.dev/Game/CGamePlaygroundClientScriptAPI]. What signed plugins give you now: post-processing input values via Dashboard and VehicleState, race timing via MLFeed, UI state via `CGameTerminal.UISequence_Current`, partial-attempt ghosts via Archivist [PUB-DOC/SRC: https://openplanet.dev/plugin/dashboard, https://github.com/openplanet-nl/vehiclestate, https://github.com/XertroV/tm-mlfeed-race-data, https://openplanet.dev/plugin/archivist].

**5. Your file format and your decoders: the TICK dialect is understood, and two decoder defects plus one GUI defect can corrupt what you think you replayed.**
Format: `tools/tmsite/src/tick.rs` emits the optional `0 seed <n>` line from `--seed`, body lines `<ms> accel|brake|steer <v>` with `left`/`right` for ±127, `respawn`, `srespawn`; the stock exporter writes `ms = 10 × tick`, never negative, never `flags`; the replayer ignores `seed` and `flags` [PUB-SRC: https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/tools/tmsite/src/tick.rs]. Your variant adds the tape's `start_offset_ms` and prints the gtape `flags = (literal >> 5) & 0x3FFFFF` [PUB-DOC: https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/docs/formats/ghost-input-tape.md]; the three lines at −1500 are tick 0's full state; real ghosts start at −1580, −1570, −1520, −1510 (same doc); `34420 steer 1` is a post-finish tick. `flags 4128` = 0x1020 = flags bits 5 and 12 = literal bits 10 and 17 = GBX.NET's `ActionSlot4` mask 132096 [PUB-SRC: `PlayerInputData.cs` L841-867]. Defects: `decoded_inputs_to_tape.py` replays AK2 as AK3 (slot index mismatch) [LOCAL-CC], which is exactly the hazard of GBX.NET's slot numbering versus key numbers (wiki: keys 1–5 map to slots 2, 4, 6, 8, 0 [PUB-DOC: https://github.com/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts]); the repository mixes GBX.NET 2.4.2 (`tmai-gbx`) and 2.4.4 (`GbxInspector`), and 2.4.4 carries "Fixed rare TM2020 input state bugs" (commits "Fix rare input state bugs", "Fix start bits", 2026-07-24) while 2.4.2 misreads kind-0xF opening words [LOCAL-CC; PUB-DOC: https://github.com/BigBang1112/gbx-net/blob/edbcf1b7ae394900075791bfb6b16511e98d46c4/CHANGELOG.md; NuGet 2.4.4 https://www.nuget.org/packages/GBX.NET/2.4.4]; and Ctrl+T in the Tk text box transposes two characters of the pasted source, which is Tk's documented default: "Control-t reverses the order of the two characters to the right of the insertion cursor" [LOCAL-CC; PUB-DOC: https://www.tcl-lang.org/man/tcl8.6/TkCmd/text.htm, BINDINGS item 31; Control-d, Control-k and Control-o also edit text by default, items 25, 27, 28].

---

## 2. Corrections to the earlier memos

Corrections to version 1 are in section 0. The corrections to the original memo that still apply:

- "Input is sampled once per rendered frame": now contradicted at the API level (per-tick keyboard reads, per-read-time pad model) [LOCAL-CC]; the open question is which DirectInput value physics uses.
- "XInputSetState marks frame boundaries": withdrawn; it sets vibration [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/xinput/nf-xinput-xinputsetstate]. The frame marker for the proxy path is still missing; the proxy sees read instants, not frames.
- "SendInput batches are consumed atomically": withdrawn; Microsoft guarantees serial insertion without interleaving and says nothing about consumption [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput]; your telemetry shows half-applied batches [LOCAL-CC].
- "One XInput report per physics step": withdrawn; `XInputGetState` is a snapshot and `dwPacketNumber` only says whether something changed [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/xinput/ns-xinput-xinput_state]; what the game does is "newest read at or before the tick boundary" [LOCAL-CC].
- "A physics callback runs before input sampling, on the right thread, once per player": withdrawn; `SimulationStep()` exists and that is all the documentation says.
- "Counting callbacks or device reads yields the countdown origin": withdrawn; and the counted-read model lost 2 of 39 versus 15 of 37 [LOCAL-CC].
- "An SDK field implies normal-mode access, write permission and meaning": reflected fields are readable from loaded plugins; `CGameCtnApp.InputPort` is const; writability and semantics of `FakeInputLagAvg/Var`, `PollingEnabled`, `MaxSampleRate` are undocumented.
- "Different checkpoint times across seeds isolate the seed": your synthetic pipeline is a controlled single-variable test; it lacks mechanism and magnitude, which the sweep supplies.
- "Identical times across a few seeds prove checksum-only": contradicted.
- "Sixty runs prove always": n of n bounds the failure rate at about 3/n at 95 % if trials are independent.
- Pulse-loss percentages: recomputed in Appendix B with the measured 7 ms hold.
- `flags 4128`: as in finding 5.
- Action keys: Nadeo's exact sentence is "With Snow and Rally cars, if a player presses Action Key 3 button, they will have a 60% value as their maximum steering instead of 100%" and "The action key system will remain the same for the Stadium Car" [PUB-DOC: https://www.trackmania.com/news/7971, 26.02.2024, re-opened 2026-10-21]. That is a Snow/Rally statement inside the re-range experiment, not a general AK3 definition. The general 20/40/60/80/100 ladder and same-key-again reset are community statements [PUB-COMM: https://www.trackmania.com/clubs/330/news/631823] matching your stationary tests [LOCAL 7].
- Citations: every URL in this memo was opened in this session or in the 2026-10-20 research pass; where today's re-fetch failed, that is stated.

---

## 3. The next three local experiments, in priority order

### Experiment 1. Seed sweep on the dedicated server (no game, one evening)

1. Validate the unmodified diagnostic three times; identical `ValidatedResult.Time` (31.392) or stop.
2. Thirty-six copies differing only in the seed: the original ±1, 0, 0x7FFFFFFF, 41219375, the eight live seeds from map 11, and 24 random 31-bit values. One `/validatepath` batch. Read `ValidatedResult`, never `DeclaredResult` [PUB-DOC vjeux oracle].
3. Two controls with the original seed: one steer value changed at tick 2900 (expected: finish prefix intact, late divergence); the tape shifted by one tick (expected: tells you whether a seed change is of the same order as a 10 ms timing error).
4. Record per file: `IsValid`, `ValidatedResult.Time`, `Desc`, "(n out of m)".

Readouts: `p_seed` = finishing fraction, the ceiling on live success per attempt even with perfect delivery [DEDUCTION from finding 2]; divergence pattern (early and uniform versus seed-dependent versus small time shifts) tells you whether the seed enters at tick 0, continuously, or weakly; seed 0 gets its own interpretation line. A null `ValidatedResult` with a distinct `Desc` for every non-original seed would mean an integrity check rather than re-simulation and would contradict your 4-of-5 result; report that loudly if it happens.

### Experiment 2. Finish-screen restart (game running, 30 minutes)

The repeat loop ran 40 consecutive attempts, and the only untested link is the transition out of a finish: 7 of 14 starts right after a finish failed versus 0 of 66 after a non-finish [LOCAL-CC]. Procedure: on a private test map (section 12, step 0), drive 20 trivial finishes manually; after each, let the app send its restart key once at a fixed delay after the finish is detected, and log the race clock at 100 Hz for 10 s. Vary the delay across trials: 0.2, 0.5, 1.0, 2.0 s. Readout: for each delay, whether the clock reset is observed and how long after the key. If the first press only dismisses the finish screen and a second press restarts, the log shows no reset after the first press; then the fix is a bounded second press after a logged timeout, never a spray. The race-clock readiness check then becomes the confirmation step for every restart (section 7, R6).

### Experiment 3. Which DirectInput value physics uses (proxy, stationary, one evening)

Because your proxy already sees `GetDeviceData` and `GetDeviceState` on every pass [LOCAL-CC], you do not need PresentMon to settle the keyboard question. Log per call: QPC of the call, the tick index the call belongs to (from the burst structure you already use for the pad model), every buffered event's `dwTimeStamp` and `dwSequence`, and the snapshot's state for the driving keys. Inject 200 brake pulses with the batch-order fix in place (so the hold is a true 10 ms), with the worker's timer resolution raised in one run and default in the other. Decode the tape with GBX.NET 2.4.4 and, for every brake edge, compute the recorded tick minus (a) the tick of the first snapshot read that shows the new state and (b) floor((dwTimeStamp − t0)/10).

| Result | Meaning |
| --- | --- |
| (a) matches with zero mismatches, (b) does not | physics uses the snapshot; a pulse needs a snapshot read inside its hold; loss rate equals the fraction of 10 ms windows without a read for that device |
| (b) matches with zero mismatches, (a) does not | physics uses timestamped events (Timed); loss comes only from equal stamps; raised resolution removes it |
| both match | reads are frequent enough that the two coincide; lengthen frames with external load and repeat |
| neither | the engine applies history or delay; look at `MinHistoryLength` semantics and the lateness distribution |

Also capture the `SetProperty(DIPROP_BUFFERSIZE)` call if the proxy can hook it before the device is acquired; the buffer holds one less than that value and overflow is reported as `DI_BUFFEROVERFLOW` [PUB-DOC: https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ee417894(v=vs.85)]. The 400-pulse stationary experiment from version 1 (section 8) stays as the frame-marker version for the pad path, where the proxy cannot see frames.

Experiment 4, lower priority: the action-key mapping table (press AK1–AK5 once each, stationary, decode with 2.4.4, read the cap from the telemetry shared memory and from Dashboard, ten restart trials). It is now partly superseded by the AK2→AK3 bug finding but still produces the only trustworthy key→flags table for your pipeline.

---

## 4. Claim and evidence table (audit)

| # | Claim | Actual source | Status | Corrected wording | Engineering consequence |
| --- | --- | --- | --- | --- | --- |
| 1 | Input is sampled once per rendered frame | none | Contradicted | "Keyboard read once per physics tick; pad tick k uses the newest read at or before t0 + 10k" [LOCAL-CC] | Design for per-tick reads; test which DirectInput value is used (Exp. 3) |
| 2 | `XInputSetState` is a frame marker | Microsoft Learn | Contradicted | Vibration only [PUB-DOC] | Proxy path still lacks a frame marker |
| 3 | `SendInput` batches are consumed atomically | Microsoft Learn; your telemetry | Contradicted | Serial insertion; per-event consumption; half-applied batches observed [PUB-DOC; LOCAL-CC] | Presses before releases; small batches; measure hook cost |
| 4 | One XInput report per physics step | Microsoft Learn; proxy logs | Contradicted | Snapshot API; newest-read-before-tick model, 0 mismatches [LOCAL-CC] | Time-based proxy model is the one that finishes |
| 5 | Physics callback before input sampling, right thread, once per player | openplanet.dev | Unsupported | `SimulationStep()` exists; nothing else documented | Not a measurement clock; signed plugin only |
| 6 | Counting callbacks or reads yields the countdown origin | proxy logs | Contradicted | Counted-read model: 2 of 39 finishes vs 15 of 37 [LOCAL-CC] | Time-based alignment only |
| 7 | SDK field implies access, writability, meaning | openplanet.dev | Partly supported | Readable; const port; semantics undocumented | No design may write `CInputPort` fields |
| 8 | Different CP times across seeds isolate the seed | your pipeline | Supported as controlled test | Same bytes, one field changed; mechanism and magnitude unknown | Exp. 1 |
| 9 | Identical times across a few seeds prove checksum-only | none | Contradicted | Drop | None |
| 10 | 60 of 60 proves always | statistics | Unsupported | About 5 % upper bound at 95 % | Section 9 |
| 11 | Pulse-loss percentage | your measurements | Recomputed | Appendix B, D ≈ 7 ms | Fix batch order first |
| 12 | `flags 4128` mapping | GBX.NET, vjeux | Recomputed | Literal bits 10 and 17 = `ActionSlot4` mask; key unknown; AK2→AK3 bug found | Exp. 4; fix the tape writer |
| 13 | Internal search references as citations | n/a | Replaced | Real URLs | n/a |
| 14 | Seed is a nonce or checksum only | GBX.NET, revalidate, vjeux, LOCAL 3 | Contradicted | Consumed by the simulation; new per attempt; seed 0 also occurs | Finding 2 |
| 15 | Seed scrambles input decoding | GBX.NET, Ghosts++, vjeux kappa check | Contradicted for the stored stream | Decoders need no seed; tape matches telemetry byte 14 | Decoded inputs are trustworthy as inputs |
| 16 | Virtual controller gives atomic delivery | ViGEmBus source | Supported for the report only | One `update()` = one whole report; the game still samples it per read [PUB-SRC https://raw.githubusercontent.com/nefarius/ViGEmBus/master/sys/XusbPdo.cpp] | Section 6 |
| 17 | No evidence the game calls XInput (version 1) | proxy logs | Contradicted | Imports `XINPUT9_1_0.dll`; proxy intercepts and drives [LOCAL-CC] | Section 6 rank 4 reworded |
| 18 | Libraries cannot read `dwExtraInfo`, so the detector cannot tell its own injections (version 1) | your code | Not applicable | The app uses its own ctypes hook and tags with `dwExtraInfo` [LOCAL-CC]; the library fact stands [PUB-SRC https://raw.githubusercontent.com/boppreh/keyboard/master/keyboard/_winkeyboard.py, https://raw.githubusercontent.com/moses-palmer/pynput/master/lib/pynput/keyboard/_win32.py] | None for the app |

---

## 5. What the evidence now says, by workstream

### 5.1 Input pipeline (workstreams 2 and 4)

Established:

- Imports and interfaces: `XINPUT9_1_0.dll` for the pad; DirectInput8 W for keyboard and mouse; both `GetDeviceData` and `GetDeviceState` called on every pass; keyboard read once per physics tick; pad tick k uses the newest read at or before t0 + 10k [LOCAL-CC]. XInput 9.1.0 is the reduced inbox version [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/xinput/xinput-versions].
- Reflected classes: `CInputPortDx8`, `CInputDeviceDx8Keyboard`, `CInputDeviceDx8Pad`, `CInputDeviceDx8Mouse`; `CInputDevice.ReadHardwareCurState()`, `MustBePolled` [PUB-DOC: https://next.openplanet.dev/Input/CInputDevice].
- DirectInput keyboard on modern Windows is a thread reading `WM_INPUT` [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/dxtecharts/taking-advantage-of-high-dpi-mouse-movement]; buffered events carry `dwTimeStamp` on the tick clock and a global `dwSequence`; buffering requires `DIPROP_BUFFERSIZE`; overflow is `DI_BUFFEROVERFLOW` [PUB-DOC links above].
- The tape is one state per 10 ms tick; the server re-simulates it with no renderer; its engine takes a per-tick record of three floats [PUB-SRC GBX.NET; PUB-DOC https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/FK.md].
- Pre-GO timing does not matter: holding gas earlier changes nothing to the millisecond on the validator (seven tapes, 2026-09-23) [LOCAL-CC]. Hold from −1500 anyway: the clock reads 0 for the first physics ticks after GO and a late first input kills knife-edge laps [LOCAL-CC].

Open: which DirectInput value physics uses (Exp. 3); the buffer size; whether the game raises timer resolution; thread structure.

### 5.2 Openplanet normal mode (workstream 3)

As in finding 4. Save paths: `CGameDataFileManagerScript.Replay_Save(Path, Map, Ghost)`, `CGamePlaygroundClientScriptAPI.SaveReplay/SavePrevReplay`, local-only `CSmArenaRulesMode.Ghost_RetrieveFromPlayer` [PUB-DOC: https://next.openplanet.dev/Game/CGameDataFileManagerScript, https://next.openplanet.dev/Game/CGamePlaygroundClientScriptAPI, https://next.openplanet.dev/ShootMania/CSmArenaRulesMode]. Give-up levers: `RequestRestartMap()` and local-mode `RespawnPlayer()/SpawnPlayer()` only. `Dev::Hook/Write/Patch` are documented without restrictions [PUB-DOC: https://openplanet.dev/docs/api/Dev], and the review policy is the barrier, not the API.

### 5.3 Delivery paths (workstream 5)

- Keyboard `SendInput`: ordered insertion, per-event consumption; your batches cost about 1.4 ms per event, most plausibly the synchronous low-level hook [LOCAL-CC; DEDUCTION]. Fix: presses before releases inside a batch, only changed keys in a batch, trivial hook callback (or a native helper), and per-event post time in the log so the effective hold is known.
- Proxy `xinput9_1_0.dll`: intercepts reads, answers them with the state the tape says the tick should see, drove the car, produced live finishes in September 2026 [LOCAL-CC]. It knows read instants, not frames or subsystems. Action keys through the pad need a pad binding, which your constraints forbid inside the app; the CLI experiment is yours to continue.
- ViGEm: one `update()` = one whole report delivered to the pending USB read; identical reports suppressed; a report submitted with no pending read is dropped and reported as success; project archived 2023-11-02 [PUB-SRC: https://raw.githubusercontent.com/nefarius/ViGEmClient/master/src/ViGEmClient.cpp, https://raw.githubusercontent.com/nefarius/ViGEmBus/master/sys/XusbPdo.cpp; PUB-DOC: https://docs.nefarius.at/projects/ViGEm/End-of-Life/]. Same per-read consumption applies; the proxy already does better.
- Coexistence: XInput indices are system-assigned; HidHide can hide the physical pad from the game [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/xinput/getting-started-with-xinput, https://github.com/nefarius/HidHide].

### 5.4 Countdown and restart (workstream 6)

`#Const C_SpawnDuration 1500`; `StartTime = Now + C_SpawnDuration` [PUB-SRC: https://raw.githubusercontent.com/BigBang1112/maniascript-sharp/73ee8ed4ed9be43dfeafba9bbbd9ea12206ada01/src/ManiaScriptSharp.Trackmania/Scripts/Libs/Nadeo/TMGame/Modes/Race.Script.txt]; `CurrentRaceTime` negative during the countdown per a plugin comment [PUB-COMM: https://github.com/CornerJockeys/MLETM/blob/706635491d324fe6829ed6c17dc6fc9a26744e9a/ops-plugin/src/Telemetry/PBMonitor.as]; tape tick 0 is at `start_offset_ms` (−1510 to −1580) [PUB-DOC vjeux]. Your clock reads 0 through the countdown and for the first physics ticks after GO [LOCAL; LOCAL-CC], so it gives a reset edge and a late GO edge only. Alignment proof unchanged: a ruler tap in 20 attempts, offset spread within ±10 ms, one calibrated mean, no per-attempt fitting. Attempt identity: `WalltimeStartTimestamp/EndTimestamp`, `Validate_ValidationSeed`, `GhostUid128`, `SecurityKey256` [PUB-SRC GBX.NET].

### 5.5 Seed and determinism (workstream 7)

As in finding 2, plus: TMF servers had `SetUseChangingValidationSeed` ("whether the game should use a variable validation seed") [PUB-DOC: https://methods.xaseco.org/methodstmf.php]; the TM2020-capable server manager exposes `use_changing_validation_seed` default false [PUB-SRC: https://github.com/BigBang1112/mania-server-manager]; whether a local server holds the seed constant is testable by comparing two consecutive ghosts' seeds driven on it. Physics boundaries: 2021-06-09 ("some press forward might be broken") [PUB-DOC mirror: https://devtrackers.gg/trackmania/p/8fcf9b57-09-06-2021-new-update-and-changelog], 2024-01-09 and February 2024 for Snow/Rally [PUB-DOC: https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/docs/formats/eras-and-old-builds.md]. Build detection: `exebuild="YYYY-MM-DD_HH_MM"` in the replay header XML in clear text (same doc); `Validate_ExeVersion` regex in revalidate [PUB-SRC: https://github.com/BigBang1112/revalidate/blob/master/Revalidate/Services/ValidationService.cs].

### 5.6 Native replay as evidence (workstream 8)

Recorded values are quantised game-side inputs per tick [PUB-SRC Ghosts++ https://raw.githubusercontent.com/XertroV/tm-ghosts-plus-plus/master/src/Ghosts/ReadCtnGhostInputs.as]; 10 ms is the only resolution; no finish marker; decode runs to the ghost's end [PUB-SRC GBX.NET]. Round trip `extract → inject → extract` is byte-identical in the vjeux tool [PUB-DOC]; it proves the text form preserves the bits, not that the bits preserve what physics consumed. Decoder version matters: pin GBX.NET 2.4.4 everywhere, re-decode every journal entry with it, and store the decoder version in the attempt record; 2.4.2 misreads kind-0xF opening words [LOCAL-CC; PUB-DOC changelog]. Unfinished attempts: Archivist saves them [PUB-DOC]; confirm a partial ghost from your build contains a tape (GBX.NET v1 noted "empty in an unfinished run" for some files [PUB-SRC: https://raw.githubusercontent.com/BigBang1112/gbx-net/v1/Src/GBX.NET/Engines/Game/CGameCtnGhost.cs]).

### 5.7 Action keys (workstream 9)

Nadeo's exact statements are in section 2. Community ladder 20/40/60/80/100 and same-key-again reset [PUB-COMM]; your tests agree [LOCAL 7]. Observers for the latched cap without a plugin: the `ManiaPlanet_Telemetry` shared memory publishes `InputSteer` about every 36 ms and reads ±0.4 under AK2 [LOCAL-CC]; Dashboard reads `CSceneVehicleVisState.InputSteer` [PUB-SRC: https://raw.githubusercontent.com/codecat/tm-dashboard/main/Source/Pads/Gamepad.as]. Keep physical key, logical slot bit, exporter `flags` value and latched cap as four separate things; the AK2→AK3 replay bug is what happens when two of them are conflated.

### 5.8 Windows scheduling and IPC (workstream 11)

Unchanged facts, with their URLs in the Windows notes: per-process `timeBeginPeriod` since Windows 10 2004 and the Windows 11 occlusion rule with the `PROCESS_POWER_THROTTLING_IGNORE_TIMER_RESOLUTION` opt-out [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/timeapi/nf-timeapi-timebeginperiod, https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-setprocessinformation]; `CREATE_WAITABLE_TIMER_HIGH_RESOLUTION` and CPython 3.11+ `time.sleep` [PUB-DOC: https://docs.python.org/3/library/time.html; PUB-SRC: https://github.com/python/cpython/issues/89592]; `LLKHF_INJECTED` and the silent hook removal on timeout [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-kbdllhookstruct, https://learn.microsoft.com/en-us/windows/win32/winmsg/lowlevelkeyboardproc]; `SendInput` does not reset keyboard state, one state per virtual key [PUB-DOC; DEDUCTION]; `CREATE_NO_WINDOW` [PUB-DOC: https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags]; pipe EOF and handle inheritance, `TerminateProcess`, Job Objects, PyInstaller `--noconsole` stdio [PUB-DOC: https://pyinstaller.org/en/stable/common-issues-and-pitfalls.html]. New emphasis: because the LL hook runs synchronously for every event, a Python callback adds milliseconds per injected event and stretches your own batches; the 1.4 ms per event you measured is the thing to shrink.

---

## 6. Ranked architectures with unresolved prerequisites

| Rank | Architecture | What it guarantees | Unresolved prerequisites | Verdict |
| --- | --- | --- | --- | --- |
| 1 | Keyboard `SendInput` worker + native ghost + dedicated server as oracle | Ordered delivery per group; works with your bindings; observable end to end | Map gate (step 0); batch order and hook cost fixed; Exp. 3 answer; GO alignment proven; `p_seed` high enough | Build on this |
| 2 | Local dedicated server as the play environment, if it holds the seed constant | Attempt-to-attempt reproducibility of your own runs | Compare seeds of two consecutive ghosts driven there; cannot rescue foreign tapes | One evening if Exp. 1 shows low `p_seed` |
| 3 | Synthetic tape + dedicated server (what you have) | Deterministic oracle for seed, build and physics questions | None for that purpose | Keep; never present as a live finish |
| 4 | Proxy `xinput9_1_0.dll` | Known read instants; newest-read-before-tick model reproduced with 0 mismatches; live finishes achieved [LOCAL-CC] | Works, CLI only, worth a small experiment; keep out of the app until its action-key handling (needs a pad binding) and an independent frame marker exist; subject to the same map gate | Continue as a CLI experiment |
| 5 | Virtual Xbox 360 pad (ViGEm) | Whole-report atomicity | Retired driver; same per-read consumption as the proxy without its visibility; pad bindings | Do not pursue |
| 6 | Openplanet plugin injecting via `Dev::` | Tick-synchronous timing in principle | Not signable; forbidden by your constraints | Excluded |

---

## 7. Repeat-mode diagnostic tree, against the code

Facts from the code and journals [LOCAL-CC]: a fresh stop Event per Run (`personal_app.py:191`); Stop button bound to the stale Event from line 92 (binding at line 126); one string "Stopped or manual takeover" for F8, Escape, guard focus loss, guard key press and watchdog; the captured failure was the repeat guard reading foreground before activation completed (`repeat_playback.py:25`), fixed with a bounded wait for stable game focus; the takeover hook stops on any physical key-down including autorepeat; injections are tagged with `dwExtraInfo` and observed by the app's own ctypes `WH_KEYBOARD_LL` hook; build 9 ran 40 consecutive repeat attempts; after a finish, 7 of 14 starts failed versus 0 of 66 after a non-finish.

Ranked remaining branches:

- **R6 Finish-screen restart (the live branch).** Evidence: 7 of 14 failures only after finishes. Repro and fix: experiment 2; readiness check as confirmation; a bounded second press after a logged timeout; the reason string must say "restart not observed after finish".
- **Stop button dead after the first Run (safety defect, not a repeat branch).** Evidence: lines 92, 126, 191. Fix: bind the button to a callable that resolves the current session's Event at click time, or re-bind on every Run; regression test: Stop during the second attempt of a Repeat ends the series within one tick of the click.
- **R3 One stop string for five causes.** Evidence: the shared string. Fix: result enum `{ALL_INPUTS_SENT, FINISH_OBSERVED, TIMEOUT, CANCELLED_BY_USER(F8|Escape|button), CANCELLED_BY_GUARD(focus|key|watchdog), WORKER_ERROR}`; journals should carry the enum, not the string.
- **R2 variant: autorepeat of a physically held key counts as takeover.** Evidence: hook policy. Risk: a key resting under a finger, or any key held at Run start, ends a series without a real takeover. Fix: track physical-down per vk from non-injected events; a down for a vk already down is a repeat and is ignored; keep "any new physical key-down stops" for safety.
- **R1 Focus guard** (fixed by the bounded wait; keep the regression: 20 transitions, zero non-game foreground intervals over 250 ms).
- **R4, R7, R8, R9, R10** from version 1 remain as lower-probability branches now that 40 consecutive transitions passed; keep their regression tests.

Instrumentation stays as in version 1: one structured event log with attempt id, component, event, detail, QPC; foreground changes with pid and exe; every injected event with its tag; every hook event with its classification; worker pid and pipe events; the clock readings the readiness check consumed. Add the finish detection event and the restart press with its delay.

---

## 8. Minimal discriminating experiment

Experiment 3 (section 3) now covers the keyboard path with the proxy as the read-instant marker, which is independent of the theory under test and of the recorder. For the pad path, where the proxy already defines the tick model, the remaining question is frame structure versus read structure, and the version 1 design applies unchanged:

- Clocks: QPC in worker and hook; PresentMon per-frame CSV for the game process via ETW, no game modification [PUB-DOC: https://github.com/GameTechDev/PresentMon]; the proxy's read log aligns all three.
- Inputs: 400 brake pulses (100 each of 5, 10, 20, 40 ms) in randomised order with 60–200 ms gaps, each edge in its own `SendInput` call, after the batch-order fix; 50 same-call steer+brake groups; two runs, normal and lengthened frames (external GPU load only).
- Predictions table as in version 1: survival by duration, duration quantisation, and the correlation of recorded tick minus hook tick with frame boundaries separate per-frame polling from per-tick polling from timestamped events; cross-check 40 ms pulses against telemetry byte 18 to separate recording loss from consumption loss [PUB-COMM: https://raw.githubusercontent.com/XertroV/tm-editor-plus-plus/master/research/2026-08-30-GhostInputsAndPositions.md].
- Preserve the original ghost; decode a copy with 2.4.4.
- Early stop: PresentMon cannot see presents → keep only the survival part; hook shows injected events not delivered → integrity-level mismatch, stop.

---

## 9. Acceptance-test matrix

| Capability | Measurement | Pass criterion | Trials and confidence |
| --- | --- | --- | --- |
| No public record | Map gate log + account's leaderboard check after each session (trackmania.io) | Zero records on any map outside the private allowlist; every attempt's `Validate_ChallengeUid` is on the allowlist | Every session, before anything else is reported |
| Stop button | Press Stop during attempt 2 of a Repeat | Series ends, keys released within 50 ms | 20 across two sessions |
| Single complete attempt | Worker log and tape (2.4.4) | All 235 post-countdown groups submitted, lateness < 5 ms, every edge within one tick | 1 shows possibility |
| One-tick brake pulse | Source vs tape for every 10 ms pulse | Present with one-tick duration; effective hold ≥ 10 ms in the hook log | ≥ 30 pulses before claiming loss under 10 % |
| Simultaneous changes | Groups with ≥ 2 changes | Same tick; no half-applied batch in telemetry | 236 groups per run |
| Countdown alignment | Ruler tap, 20 attempts | Spread ≤ ±10 ms, stable mean | One calibration, no per-attempt fitting |
| Action keys | Tape slot bits + telemetry `InputSteer` | 4 of 4 edges; cap matches source; AK2 is replayed as AK2 | Stationary plus in-run |
| Repeat transition | Event log | Next attempt arms and GO observed within 15 s, including after finishes | 20 after finishes, 20 after non-finishes |
| Takeover | Physical key during playback; held key before Run | New key-down stops within 50 ms; a key held before Run does not | 20 each |
| Worker failure | Kill worker pid mid-attempt | `WORKER_ERROR` within 1 s; keys released; next Run works | 10 |
| Original replay evidence | Hash and parsed metadata; local server `ValidatedResult` | Map uid, exebuild, finish, checkpoints match; validated equals declared | Every attempt |
| Runs under load | 20 runs with a video playing | Distributions reported | Wilson interval |

Confidence as before: n of n gives about 3/n at 95 %; trials in one session are not independent; the live finish rate is bounded above by `p_seed`.

---

## 10. The standalone app

Feasible now:

- Map gate (step 0): an allowlist of private test map UIDs you maintain; Run refuses any map not on it; the user confirms the map name before each session; after every attempt the ghost's `Validate_ChallengeUid` is checked against the allowlist and a mismatch is a red, persistent banner. Residual, marked UNVERIFIED: whether Nadeo stores records for a never-uploaded private map; keep the gate strict regardless. The same gate wraps the proxy CLI.
- Stop button bound to the live session; result enum; immutable session config; one worker per session with `ARM/PLAY/STOP_ATTEMPT/ACK/SESSION_END`; heartbeat; Job Object; structured log.
- Parser for the TICK dialect with `flags` kept opaque until the mapping table exists; a read-only source box after paste, with the Tk `Control-t`, `Control-d`, `Control-k`, `Control-o` bindings removed from the widget; source hash recomputed before every Run and compared to the hash at paste time.
- One GBX.NET version (2.4.4) across `tmai-gbx` and `GbxInspector`; decoder version stored per attempt; journals re-decoded.
- Tape writer fixed so AK2 is written as AK2; a unit test that round-trips each action slot.
- Injection: presses before releases, only changed keys per batch, scan codes, tagged `dwExtraInfo`, trivial hook callback, per-event post time logged, timer resolution raised with the power-throttling opt-out.
- Attempt histories separated: live, oracle, experiment; a live attempt is "finished" only when a native file says so and the local server agrees.

Blocked on research: which DirectInput value physics uses (Exp. 3), finish-screen restart timing (Exp. 2), expected finish rate (Exp. 1), key→flags table (Exp. 4).

---

## 11. Five-minute feasibility

Budget for the 31.392 s tape with the game already on the map: parse and checks under 1 s; countdown, run and restart about 40 s; ghost save, hash and parse 5–15 s; five to six attempts in five minutes. With k attempts and independent seeds, P(at least one finish) = 1 − (1 − p_seed)^k; k = 5 needs p_seed ≥ 0.37 for a 90 % chance.

Realistic only if: the map is on the private allowlist; `exebuild` matches the source; the tape finishes on that build under its own seed (it does); batch order and hook cost are fixed so a 10 ms hold is a 10 ms hold; GO alignment is within one tick; and Exp. 1 returns a high `p_seed`. Impossible if: the tape is longer than about four minutes; the build differs across a physics boundary; the map is not loaded; `p_seed` is near zero; or the consumption path turns out to need reads inside every pulse at a frame rate that does not provide them (Exp. 3 and the 13–19 % empty-window figure for the pad [LOCAL-CC]).

Conclusion: conditional, and the condition that decides it is `p_seed`. If it is near zero, the honest scope is reproducing your own runs on your own server, not finishing arbitrary pasted inputs, and the official-map question disappears with it.

---

## 12. Implementation sequence

0. Map gate for the app and the proxy CLI; fix the Stop button binding; decide what to do about the 2026-09-19 Kacky record. Half a day.
1. Batch order (presses before releases), per-event post-time logging, hook callback cost measured and reduced. Half a day.
2. Experiment 1 on the server; decide product scope from `p_seed`. One evening.
3. Experiment 2 on finish-screen restarts; wire the readiness check as restart confirmation with one bounded retry. Half a day.
4. Pin GBX.NET 2.4.4, re-decode journals, store decoder version; fix the AK2→AK3 writer; remove the Tk editing bindings. Half a day.
5. Experiment 3 through the proxy logs; set the worker's timer policy from the result. One evening.
6. Result enum, immutable config, autorepeat-aware takeover, structured log. One day.
7. Ruler test for GO alignment. One evening.
8. Dedicated-server oracle wrapped as the finish verifier and provenance recorder. One day.
9. Acceptance matrix over three sessions, distributions not pass/fail words.
10. Only then the pad-path frame experiment (section 8), if a design decision still depends on it.

---

## 13. Do not spend more time on this yet

- Any Openplanet plugin that writes or injects; it will not be signed and your constraints exclude Developer Mode.
- Reproducing or setting the validation seed; measure its effect instead.
- The ViGEm pad path; the proxy already answers the same reads with full visibility and without a retired driver.
- Writing a tape encoder; `ghost tape inject`/`extract` round-trip byte-identically [PUB-DOC vjeux].
- Per-attempt countdown-offset fitting; one ruler calibration.
- Pre-GO timing experiments; answered on the validator [LOCAL-CC].
- Counted-read delivery models for the pad; contradicted 2 of 39 versus 15 of 37 [LOCAL-CC].
- A frame-rate theory for keyboard loss before Exp. 3 and before the batch-order fix.
- `dwPacketNumber` semantics, ViGEm internals, TMT reverse engineering.

---

## 14. Remaining unknowns and what settles each

| Unknown | Settles it |
| --- | --- |
| What the seed perturbs and how much; what seed 0 means | Exp. 1 with its controls; a second sweep on two server distros if libm effects are suspected [PUB-SRC mania-server-manager] |
| Whether a local dedicated server holds the seed constant | Two consecutive ghosts driven there; compare `Validate_ValidationSeed` |
| Which DirectInput value physics uses for the keyboard | Exp. 3 |
| The keyboard buffer size and overflow risk | Hook `SetProperty(DIPROP_BUFFERSIZE)` in the proxy before acquisition |
| Why restarts after a finish fail half the time | Exp. 2 |
| Whether records are stored for never-uploaded private maps | Drive one finish on such a map and check the account's records on trackmania.io; until then the gate stays strict |
| `SimulationStep` ordering and thread | Only a signed read-only plugin; not on the critical path |
| Whether the latched cap survives respawn, map change, focus loss | Ten trials each, read via the telemetry shared memory |
| Physical key for each `flags` value | Exp. 4 |
| Where the 1.4 ms per injected event goes | Measure with the hook disabled, then with a native hook |
| Whether the game raises timer resolution itself | `ClockRes` with the game running [PUB-DOC: https://learn.microsoft.com/en-us/sysinternals/downloads/clockres] |
| Whether a partial ghost from your build contains a tape | Save one with Archivist and decode with 2.4.4 |

---

## Appendix A. Synchronisation and ownership (pseudocode, no invented APIs)

```
Session (GUI side)
  gate = map_gate(config.map_uid_allowlist)          # refuses to Run on any other map
  config = freeze(gui_state)
  session_stop = Event()                             # Stop button resolves THIS object at click time
  stop_button.on_click = lambda: current_session().session_stop.set("button")
  worker = start_worker_once()                       # CREATE_NO_WINDOW, Job Object, named pipe
  for n in 1..config.max_attempts:
      if session_stop.is_set(): break
      attempt = Attempt(id=n, stop=Event())
      worker.send(ARM, attempt.id, groups, deadline); wait ACK or reason "worker did not arm"
      if not restart_and_observe(attempt): stop series, reason "restart not observed"
      worker.send(PLAY, attempt.id, t_go_estimate)
      result = wait RESULT(attempt.id) or guard event
      worker.send(STOP_ATTEMPT, attempt.id); wait ACK(released set)
      verify_no_owned_keys_down()
      ghost = newest ghost file; assert ghost.map_uid in allowlist else red banner
      record(attempt.id, result.kind, result.reason, ghost hash, decoder version, metadata)
      if result.kind in {CANCELLED_BY_USER, CANCELLED_BY_GUARD, WORKER_ERROR}: break
      if not config.repeat: break
  worker.send(SESSION_END); join worker

Guards (own thread with message loop; never touch keys)
  on EVENT_SYSTEM_FOREGROUND(hwnd): if owner_pid not in {game_pid, own_pid} for > 250 ms -> attempt.stop.set("focus:"+exe)
  on LL hook event e:
      if e.injected and e.extra_info == OUR_TAG: ours_down update; log
      elif e.down and e.vk in physical_down: ignore (autorepeat)
      elif e.down: physical_down.add(vk); attempt.stop.set("takeover:"+vk); session_stop.set("takeover")
      else: physical_down.discard(vk)
  hook self-check: tagged sentinel every 2 s; not seen in 100 ms -> WORKER_ERROR("hook lost")

Worker
  timeBeginPeriod(1); SetProcessInformation(ProcessPowerThrottling, honor timer resolution)
  on PLAY: for group in schedule:
      sleep_until(deadline - 1.5 ms); spin_until(deadline)
      events = presses(group) + releases(group)       # presses first; only changed keys
      t0 = qpc(); SendInput(events, scancodes, OUR_TAG); t1 = qpc(); log(group, deadline, t0, t1)
  on STOP_ATTEMPT or attempt.stop: release (ours_down - physical_down); reply ACK(released)

Restart observation
  send restart (tagged) once at delay d after finish/attempt end
  wait clock: last -> reset (timeout 3 s); if none: send once more, log "second restart press"
  wait clock: reset -> increasing (timeout 5 s, reason "no GO")
  t_go_estimate = qpc(first increasing sample) - calibrated_bias
```

## Appendix B. Pulse-loss model with the measured hold, and the flags arithmetic

Supplied: the 30280/30290 pulse was held 4.5–8.5 ms (median 7.0) because releases were posted before presses inside each batch at about 1.4 ms per event; lost in 4 of 6 native recordings, survived as a 20 ms one-tick-late edge in 2 [LOCAL-CC].

Model, periodic sampling with uniform phase: P(miss) = max(0, 1 − D/T).

| T | D = 4.5 | D = 7 | D = 8.5 | D = 10 |
| --- | --- | --- | --- | --- |
| 10 (tick, snapshot per tick) | 55 % | 30 % | 15 % | 0 |
| 15.6 (tick-clock stamp) | 71 % | 55 % | 46 % | 36 % |
| 16.7 (60 fps) | 73 % | 58 % | 49 % | 40 % |

Observed 4 of 6 = 67 % (95 % interval roughly 22–96 %). Both the per-tick snapshot model at the short end of the hold range and the stamp-resolution model fit; the two surviving recordings showing a 20 ms, one-tick-late edge fit the stamp model specifically (both edges stamped into the same millisecond bucket, then the next bucket). Experiment 3 separates them. After the batch-order fix D is 10 ms and the per-tick snapshot model predicts no loss, so any remaining loss points at stamps or frames.

Ratios from LOCAL 5, for the record: 2/22 brake edges, 1/11 brake pulses, 2/256 all edges; 95 % interval on a per-pulse loss rate from 1 in 11 is about 0.2 % to 41 %.

Flags: 4128 = 0x1020 = 2^12 + 2^5; with `flags = (literal >> 5) & 0x3FFFFF` the literal bits are 17 and 10; GBX.NET's `ActionSlot4` mask is 132096 = 0x20400 = 2^17 + 2^10. Exact match; the physical key is not implied, and your tape writer's AK2→AK3 error shows the slot-versus-key hazard is live.

## Appendix C. Research notes

Under `research_notes/PadTape input pipeline deep audit/`: `openplanet_capabilities.md`, `gbx_inputs_seed_flags.md`, `tm2020_input_pipeline.md`, `validation_seed_determinism.md`, `windows_injection_atomicity.md`, `windows_scheduling_ipc.md`, `vjeux_trackmania_tas_followup.md`. Every URL opened, with dates and commits, is listed there. Pages whose re-fetch failed on 2026-10-21 (HTTP 502): https://openplanet.dev/news/2022/developer-mode and https://openplanet.dev/docs/tutorials/writing-plugins; their quotes are from the 2026-10-20 pass.
