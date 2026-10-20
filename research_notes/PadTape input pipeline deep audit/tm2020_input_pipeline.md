# Trackmania (2020) input pipeline: devices -> engine -> physics tick -> ghost input tape

Research date: 2026-10-20. Scope: Trackmania 2020 (Nadeo/Ubisoft, Windows). Older-game facts (TMNF/TMUF, ManiaPlanet) are labelled as such. Every URL below was fetched during this session unless explicitly marked "search snippet only".

Evidence classes used throughout: **(a) official** = Nadeo/Ubisoft text; **(b) source-code** = Openplanet class reference (TM2020 API build 2026-01-26), Nadeo ManiaScript libraries, plugin source; **(c) measured/community** = TAS tooling, replay-format reverse engineering, RL projects; **(d) inference** = my reasoning, marked as such.

Access notes for the report writer: `openplanet.dev/docs/reference/<Class>` URLs 404; the TM2020 class reference lives at `https://next.openplanet.dev/<Namespace>/<Class>` (e.g. `/Input/CInputPort`, `/Scene/CSceneVehicleVisState`, `/Game/CGameCtnGhost`). `CSmScriptPlayer` and `CSmPlayer` returned 404 at `/Game/...` on 2026-10-20, so their input fields are cited from plugin source instead. PCGamingWiki (Cloudflare 403) and Reddit (blocked) could not be fetched.

---

## KQ1. Physics tick rate of TM2020 and whether inputs are consumed per physics step or per rendered frame

### Takeaway
Every source that has looked at the data (replay/ghost format reverse engineering, TM2020 TAS tooling, TMNF TAS tooling) agrees the simulation and the recorded input tape are tick-based at 100 Hz (10 ms) and framerate-independent; no Nadeo statement about the tick rate or about per-frame vs per-tick input sampling was found. The strongest counter-evidence to "inputs are sampled once per rendered frame" is in the engine's own input classes: `CInputPort` exposes an `InputsMode` of `Timed`/`NotTimed`/`Config` plus DirectInput buffered-event statistics (`StatsDInputTimedEventsCount`, `StatsDInputWrongTimestampAhead/Late`, `MaxSampleRate`, `MinHistoryLength`), which only make sense if the engine consumes timestamped device events rather than a once-per-frame snapshot (inference).

### Cited Findings
- (c) "Trackmania's physics engine runs at 100Hz (100 ticks per second), regardless of framerate" and "TAS tools let you control inputs at this tick level"; the same FAQ notes "TM2020 input extraction is now supported" (site undated; footer "© 2026 TMTAS Exchange") — [TMTAS Exchange FAQ](https://tmtas.exchange/faq)
- (c) GBX.NET (BigBang1112) wiki on TM2020 ghost inputs: TM2020 inputs live in `CGameCtnGhost.PlayerInputs` (class `PlayerInputData`, chunk `0x01D`); "The storage of data is tick-based", a `Ticks` count is stored, each `InputChanges` item has an integer `Tick` and a `Timestamp` (`TimeInt32`); ghost visual samples reduce precision "from 100 ticks to 20 ticks" (i.e. 100 input ticks/s vs 20 position samples/s); the focused format version is `_2020_07_20` and runs from before that date "have a high chance of being unstable" — [GBX.NET wiki: Extracting input data from ghosts (mirror)](https://github-wiki-see.page/m/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts)
- (c) Same page: TM2020 input types are `SteerTM2020` ("Steer represented from -127 to 127", stored as `sbyte`), `Accelerate`, `Brake`, `Horn`, plus `MouseAccu`, `ActionSlot`, `RespawnTM2020`, `SecondaryRespawn`; `RespawnTM2020`/`SecondaryRespawn` "Does not include key release event, one-way press"; TM2020 "has no separate digital left/right steer inputs" (older games have `SteerLeft`/`SteerRight` plus `Steer` in -65536..65536) — [GBX.NET wiki (mirror)](https://github-wiki-see.page/m/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts)
- (c, TM2020) The TM2020 TAS repository `vjeux/trackmania-tas` reports times to the millisecond, describes one published ghost that was withdrawn because "its recording was one tick early", and validates runs by having them "re-simulated by the dedicated server" (no renderer involved) — [vjeux/trackmania-tas README](https://github.com/vjeux/trackmania-tas)
- (c, TM2020) Its `GHOSTFORMAT.md` identifies chunk `0x0309201D` of a `.Ghost.Gbx` as "the INPUT TAPE, which we also author", `0x03092000` as wrapping `CPlugEntRecordData` (telemetry), and notes `CGameCtnGhost` carries `Validate_ExeVersion`, `Validate_ExeChecksum`, `Validate_OsKind`, `Validate_CpuKind`, `Validate_ExtraTool_Info`; a synthesised ghost with two unknown hashes zeroed still validated on the dedicated server ("zeroed 20.756 cps=7 / control 20.756 cps=7") — [GHOSTFORMAT.md (raw)](https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/GHOSTFORMAT.md); member list confirmed on [next.openplanet.dev/Game/CGameCtnGhost](https://next.openplanet.dev/Game/CGameCtnGhost) (build 2026-01-26)
- (c, TM2020) TMT, "TAS toolkit for Trackmania 2020" (v2.0.8), shows steering on a "±127" scale, tick counters, "brake on/brake off/respawn" events, an "In-game" compute backend and "Hooks: all 14 clean"; it does not document the injection mechanism, tick length or countdown handling; "Not affiliated with Nadeo" — [tas.trackmania.nl](https://tas.trackmania.nl/) (no /docs page exists: 404 on 2026-10-20)
- (c, TMNF/TMUF — older game) donadigo's TMX replay investigation: "Because TrackMania's physics update rate equals to 100 updates/second, each array can contain up to 100 numbers"; "Trackmania's physics engine is completely deterministic"; replays contain "a list of inputs and their timestamps"; TMInterface injects inputs via "a native assembler patch/C++ code" so "it is not possible for it to desynchronize, or not get executed in time"; newest analysed run 7 Dec 2020 — [donadigo.com/tmx1](https://donadigo.com/tmx1)
- (c, TMNF/TMUF — older game) TMInterface script syntax: times may be written in ms, and "The millisecond format always needs to end with `0`" (10 ms granularity); same-time commands execute in file order ("will set the steering value to `0` at time `4.32`" vs `65536`) — [TMInterface script syntax](https://donadigo.com/tminterface/script-syntax); TMInterface is "the de facto standard TAS tool for TrackMania Nations and United Forever" (not TM2020) — [TMInterface](https://donadigo.com/tminterface/)
- (b) `CInputPort` (TM2020 API, build 2026-01-26) members: `InputsMode` enum `{Timed, NotTimed, Config}`, `PollingEnabled`, `ConnectedDevices` (array of `CInputDevice`), `MaxSampleRate`, `MinHistoryLength`, `EventInStoreCount`, `IgnoreFocusForGamePads`, `FakeInputLagAvg`, `FakeInputLagVar`, `IsPadModuleExclusive`, `Script_Pads` (array of `CInputScriptPad`), `AutoRepeat_InitialDelay/Period`, `StatsDInputOverflowedLastFrame`, `StatsDInputOverflowCount`, `StatsDInputEventsLastFrame`, `StatsDInputEventsCount`, `StatsLatestEvent`, `StatsDInputTimedEventsCount`, `StatsDInputWrongTimestampAhead`, `StatsDInputWrongTimestampRatioAhead`, `StatsDInputWrongTimestampLate`, `StatsDInputWrongTimestampRatioLate`, `StatsDInputWrongTimestampAvgDelta`, `StatsNbMappedInputsReceived`; method `DeviceHotPlugUpdate()`; inherited by `CInputPortDx8` (instantiable) and `CInputPortNull` — [next.openplanet.dev/Input/CInputPort](https://next.openplanet.dev/Input/CInputPort)
- (b) `CInputScriptManager` members include `Now`, `Period`, `PendingEvents` (array of `CInputScriptEvent`), `Pads`, `LatestActivePad`, `ExclusiveMode`, `IsKeyPressed(int KeyCode)` and binding lookups `GetActionBinding(Pad, ActionMap, ActionId)` — [next.openplanet.dev/Input/CInputScriptManager](https://next.openplanet.dev/Input/CInputScriptManager)
- (c) TMRL (RL on TM2020) drives the game with a virtual Xbox 360 pad at a default `time_step_duration` of 0.05 s (20 Hz) using `rtgym` elastic time steps; it gives no per-tick timing guarantees — [trackmania-rl/tmrl](https://github.com/trackmania-rl/tmrl)
- (c) Openplanet "Dashboard" plugin page warns that inputs shown during replay are interpolated and "You can not and should not judge inputs shown during replay on whether or not they are cheated!" — [openplanet.dev/plugin/dashboard](https://openplanet.dev/plugin/dashboard); its source reads `vis.InputSteer`, `vis.InputGasPedal`, `vis.InputBrakePedal` from the vehicle vis state ([codecat/tm-dashboard Source/Pads/Gamepad.as @65680083](https://github.com/codecat/tm-dashboard/blob/65680083b7a026e4b94f0b3f7ab0ff460c0b8558/Source/Pads/Gamepad.as))
- (a) Nadeo patch notes searched (devtrackers.gg archive of 2020–2021 changelogs; trackmania.com news 2020-07-07, 2022-04-07, 2024-02-26, 2024-03-29, 2024-05-22): no entry mentions input latency, input polling, VSync or "input processing moved to..."; the only input-related fixes found are "Fix input issues with DS4 tools that was causing lag spikes" (2022-04-07) — [devtrackers 07/04/2022 changelog](https://devtrackers.gg/trackmania/p/7f5461de-07-04-2022-new-update-changelog) — and "Fixed analog decices [sic] not reaching 100% when smooth steering" (2024-05-22) — [Desert update changelog](https://www.trackmania.com/index.php/news/8097); patch-note index — [devtrackers patch notes](https://devtrackers.gg/trackmania/patch_notes)
- (a) A 2022 Ubisoft forum thread about "~0.2-0.4 sec of input lag" with steady FPS got only a Power Mode / hardware-swap suggestion from Ubisoft support, nothing about input processing — [devtrackers: Input lag in TM2020 but decent FPS](https://devtrackers.gg/trackmania/p/0a12174d-input-lag-in-tm2020-but-decent-fps)

### Inferences
- (d) The recorded TM2020 input tape is quantised to 100 Hz ticks and the dedicated server re-simulates tapes without any renderer; therefore the physics consumes one input state per 10 ms tick, and a 10 ms brake pulse is *representable* (one `Brake` on-tick followed by an off-tick) and is what TM2020 TAS tools (TMT, vjeux's pipeline) exploit. Whether a *live* virtual device can get such a pulse into the game is a separate question (see KQ2/KQ5).
- (d) The `Timed`/`NotTimed` InputsMode and the family of `StatsDInput*Timestamp*` counters strongly suggest the engine reads DirectInput buffered events (`IDirectInputDevice8::GetDeviceData`, which carries `dwTimeStamp`) and, in Timed mode, assigns each event to a physics tick using its device timestamp rather than the frame at which it was read. `MaxSampleRate`/`MinHistoryLength` look like the parameters of that event history. If correct, inputs are NOT limited to one sample per rendered frame, and several distinct input states can be applied to the several ticks simulated within one slow frame. This is inference from field names only; no documentation or Nadeo statement describes the mechanism.
- (d) "Higher FPS gives finer input timing" claims found in the community for TM2020 were absent from every source fetched; the only FPS-related material was general engine discussion. Treat that claim as UNVERIFIED for TM2020.

### Gaps
- No Nadeo/Ubisoft statement of the physics tick rate was found; the 100 Hz figure rests on community reverse engineering (GBX.NET, TMTAS Exchange, donadigo for TMNF).
- No direct test was found of whether, at low FPS, the several physics ticks inside one frame can consume distinct live inputs (vs. the same snapshot). The `Timed` mode fields are suggestive but undocumented.
- No "input lag reduction" / "prefer low latency" Nadeo patch note was found for 2020–2026 (searched devtrackers index, trackmania.com news, racinggames.gg summaries).
- Community input-lag measurement videos (Wirtual, Greep, Hoffmann etc.) were not retrievable as text; none surfaced in search.

---

## KQ2. Which input APIs does TM2020 use (DirectInput, XInput, RawInput, Steam Input)?

### Takeaway
The engine's own class names show a DirectInput 8 input port with DirectInput-8 keyboard and pad device classes (`CInputPortDx8`, `CInputDeviceDx8Keyboard`, `CInputDeviceDx8Pad`) and a separate non-Dx8 mouse device; the script-facing pad abstraction (`CInputScriptPad`) exposes an Xbox-style button/axis layout with pad types Keyboard/Mouse/Generic/XBox/PlayStation/Vive, rumble and lightbar colour. Nothing found indicates Steam Input API integration (the Steam build launches Ubisoft Connect and Steam lists only "Partial Controller Support"); XInput/RawInput use is not visible in the API and remains unverified.

### Cited Findings
- (b) `CInputPort` is "Inherited by `CInputPortDx8` (0x13002000)" and `CInputPortNull`; `CInputDevice` is "Inherited by `CInputDeviceMouse` (0x13008000), `CInputDeviceDx8Keyboard` (0x1300B000), `CInputDeviceDx8Pad` (0x1300C000)"; `CInputDevice` members: `ReadHardwareCurState()`, `UserData`, `InstanceName`, `InstanceId`, `DeviceModelName`, `DeviceModelId`, `IsDisabled`, `InputNotAvailable`, `IsUnPlugged`, `MustBePolled`, `CanRumble`, `ObjectCount`; `CInputDeviceDx8Pad` adds `DevSwitchUserIdInvalid()` — [CInputDevice](https://next.openplanet.dev/Input/CInputDevice), [CInputDeviceDx8Pad](https://next.openplanet.dev/Input/CInputDeviceDx8Pad), [CInputDeviceDx8Keyboard](https://next.openplanet.dev/Input/CInputDeviceDx8Keyboard), [CInputPortDx8](https://next.openplanet.dev/Input/CInputPortDx8). The Input namespace also lists `CInputDeviceDx8Mouse`, `CInputBindingsConfig`, `CInputReplay` (member `NbEvents`), `CInputScriptEvent`, `CInputScriptManager` — [namespace index](https://next.openplanet.dev/Input)
- (b) `CInputScriptPad` (0x13012000, description "game controller.") members: `ControllerId`, `UserId`, `Type` (`EPadType::Keyboard, Mouse, Generic, XBox, PlayStation, Vive`), `ModelName`, `IdleDuration`, button states as `uint` (`Left, Right, Up, Down, A, B, X, Y, L1, R1, LeftStickBut, RightStickBut, Menu, View`), axes as `float` (`LeftStickX/Y`, `RightStickX/Y`, `L2`, `R2`), `ButtonEvents` (array of `EButton`); methods `ClearRumble()`, `AddRumble(Duration, LargeMotor, SmallMotor)`, `SetColor(vec3)`. There are **no** `Timed`/`NotTimed`/`Buttons`/`Axes` members on this class; `IdName` is inherited from `CMwNod`. `Timed`/`NotTimed` are the `CInputPort.InputsMode` enum values — [CInputScriptPad](https://next.openplanet.dev/Input/CInputScriptPad), [CInputPort](https://next.openplanet.dev/Input/CInputPort)
- (b) `CInputPad` does not exist in the TM2020 reference (404 at `/Input/CInputPad`, not listed in the Input namespace) — [namespace index](https://next.openplanet.dev/Input)
- (b) `CInputScriptEvent`: `Type` (`EType::PadButtonPress` only), `Pad`, `Button`, `IsAutoRepeat`, `KeyCode`, `KeyName` — no timestamp field — [CInputScriptEvent](https://next.openplanet.dev/Input/CInputScriptEvent)
- (b) Plugins enumerate `GetApp().InputPort.Script_Pads` and test `pad.Type == CInputScriptPad::EPadType::Keyboard` (st-AR-gazer `tm_Auto-Enable-PB-Ghost` `src/hotkeys/core.as` @f9c104d8) — [GitHub code search result](https://github.com/st-AR-gazer/tm_Auto-Enable-PB-Ghost/blob/f9c104d8896f04df703dc488dbc30f2b86c91d0f/src/hotkeys/core.as)
- (a-ish, Steam metadata) Steam appdetails for app 2225070: release "Feb 2, 2023"; categories include "Partial Controller Support" (not Full); `controller_support: None`; `drm_notice: None`; requires "Ubisoft Account (Supports Linking to Steam Account)" — [Steam appdetails API](https://store.steampowered.com/api/appdetails?appids=2225070&l=en)
- (a) Nadeo's Steam-launch FAQ (Jan 2023, relayed by GamingOnLinux): "When you open the game on Steam, it will open Ubisoft Connect. You will also need a Ubisoft Connect account" — search snippet only, from [gamingonlinux comment thread](https://www.gamingonlinux.com/2023/01/trackmania-steam-playable-on-steam-deck/comment_id=238960) (not fetched)
- (a) Nadeo changelog 2022-04-07: "Fix input issues with DS4 tools that was causing lag spikes" — [devtrackers](https://devtrackers.gg/trackmania/p/7f5461de-07-04-2022-new-update-changelog)
- (a) Ubisoft support, 2020 thread on a PS4 pad steering less than keyboard: support asked whether "a third-party application was being used to support the PS4 controller on PC" and to update it and controller drivers — [devtrackers: Controller steer less than keyboard](https://devtrackers.gg/trackmania/p/68b6b390-controller-steer-less-than-keyboard-in-the-new-trackmania)
- (a) Nadeo Feb 2024: Action Key re-range targets "all analog devices' players, on PC and consoles" and "Each car has its own dedicated sensitivity" — [trackmania.com/news/7971](https://www.trackmania.com/news/7971)

### Inferences
- (d) Keyboard and gamepads reach the engine through a DirectInput 8 port (class naming). `EPadType::PlayStation` + `SetColor` + `AddRumble` indicate native DualShock/DualSense handling (lightbar colour is not reachable through XInput), consistent with the 2022 DS4-tools fix and Ubisoft discouraging DS4Windows-style wrappers. Whether Xbox pads are internally serviced by XInput behind the `Dx8Pad` class cannot be determined from the reference.
- (d) No Steam Input API integration is visible; a virtual XInput/Xbox 360 pad (ViGEm/vgamepad, as TMRL uses) is the device type with the most practical evidence of working. If Steam Input is enabled per-game, Steam re-exposes pads as an emulated Xbox controller and can hide the original device from DirectInput — a general Steam behaviour described in search results, not verified for TM2020.
- (d) `IsPadModuleExclusive` and `CInputScriptManager.ExclusiveMode` suggest the game may acquire devices in exclusive mode; a virtual device injected while the game holds exclusive acquisition should still be seen on hot-plug (`DeviceHotPlugUpdate`, `DeviceHasBeenHotPlugged`), but this is untested.

### Gaps
- No official list of supported input APIs (PCGamingWiki blocked by Cloudflare; Ubisoft support controller article not found).
- No evidence either way on RawInput for keyboard; the `Dx8Keyboard` class suggests DirectInput keyboard, which on modern Windows is itself layered over RawInput, but the game-side behaviour (buffered vs immediate reads) is unknown.
- No TM2020-specific "game ignores controllers when Steam Input is on" report was found; all such threads were for TMUF/Turbo/TM2.

---

## KQ3. Input settings, smoothing/filters, and keyboard steering behaviour

### Takeaway
Documented settings are per-device analog sensitivity (minimum lowered from 1.0 to 0.1 in Feb 2024, per car), analog dead zone, rumble intensity and a fixed "Fixed analog devices not reaching 100% when smooth steering" bug (May 2024). No official or measured source documents any keyboard steering ramp/smoothing in TM2020; the replay format stores keyboard steering as the same `SteerTM2020` -127..127 channel as analog, and TM2020 TAS authors treat keyboard as "full lock or nothing".

### Cited Findings
- (a) Feb 26 2024: "sensitivity minimum changed from 1.0 to 0.1 to improve precision", available for all cars; "Each car has its own dedicated sensitivity" — [trackmania.com/news/7971](https://www.trackmania.com/news/7971)
- (a) May 22 2024 Desert update changelog, Gameplay > Fixed: "Fixed analog decices not reaching 100% when smooth steering" — [trackmania.com/index.php/news/8097](https://www.trackmania.com/index.php/news/8097)
- (c) Setting names as seen by a 2022 guide: "Input > Analog Settings > Analog sensitivity", "Input > Analog Settings > Rumble intensity", "Input > Analog Settings > Analog dead zone", "Input > Device > Edit device"; no steering-curve option is listed — [GamersDecide, updated 22 Mar 2022](https://www.gamersdecide.com/articles/trackmania-2020-best-controller-settings)
- (c) TM2020 ghosts store steering only as `SteerTM2020` (-127..127, `sbyte`); unlike TMNF there are no digital `SteerLeft`/`SteerRight` channels — [GBX.NET wiki (mirror)](https://github-wiki-see.page/m/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts)
- (c, TM2020) A TAS author's keyboard-constrained variant is described as "on a keyboard (full lock or nothing, every press held ≥ 70 ms)" — [vjeux/trackmania-tas README](https://github.com/vjeux/trackmania-tas)
- (b) The vehicle visual state exposes `float InputSteer`, `bool InputIsBraking`, `float InputGasPedal`, `float InputBrakePedal`, `float InputVertical` and the physical wheel angle `FLSteerAngle` — [CSceneVehicleVisState](https://next.openplanet.dev/Scene/CSceneVehicleVisState); `CSmScriptPlayer` exposes `InputSteer`, `InputGasPedal`, `InputIsBraking` (read in [thommie-echo/TMNext-PlayerState AR_Data.as](https://github.com/thommie-echo/TMNext-PlayerState/blob/ddf4f6e92c734a580576e3bc9629c5f6f3437ce8/PlayerState/AR_Data.as) and [st-AR-gazer/tm_CSmScriptPlayer-Viewer](https://github.com/st-AR-gazer/tm_CSmScriptPlayer-Viewer/blob/07fbae34bace35939b0a249513230700915d76c3/CSmScriptPlayer-Info/Leftovers.as))
- (a) 2020 Ubisoft thread: a PS4-pad user reported the controller "steer a lot less than pressing the keyboard" and that "TrackMania Nations and TrackMania 2 don't have this problem"; Ubisoft gave only generic troubleshooting — [devtrackers 68b6b390](https://devtrackers.gg/trackmania/p/68b6b390-controller-steer-less-than-keyboard-in-the-new-trackmania)

### Inferences
- (d) Because keyboard and pad share one steer channel in the tape and the "full lock or nothing" description comes from someone authoring tapes that the server validates, keyboard steer in TM2020 is most likely written as ±127 instantly on press (no input-side ramp); any gradual wheel motion seen on screen is the physics/visual `FLSteerAngle`, not the input value. UNVERIFIED by any official text.
- (d) "Legacy input" / "analog steering curve" options named in the brief were not found in any fetched source; treat as not present or unverified.

### Gaps
- No Ubisoft support/wiki page describing TM2020 input settings was found (doc.trackmania.com has no controls page; fandom wiki not surfaced by search).
- No measurement of keyboard steer value vs time in a TM2020 tape was found.

---

## KQ4. Action Keys in TM2020: count, semantics, per-car differences, persistence

### Takeaway
Action Keys are five bindable keys (default keyboard keys 1–5, "Action Slot 1–5") that toggle a steering cap; the community-documented mapping is AK1–AK5 = 20/40/60/80/100 % with "press the same key again returns to 100 %" (an earlier 2021/22 guide describes N×10 %, and a separate "Action Key 0" that resets to 100 %). Nadeo's only official texts (Feb/Mar 2024) describe AK3 = 60 % maximum steering, changed the behaviour for Snow/Rally (and later all "Original Trilogy" cars) from a clamp to a re-range of analog input, and left the Stadium car unchanged. Persistence across respawn/restart is undocumented.

### Cited Findings
- (a) Nadeo, 26 Feb 2024, "Action Key experimentations on Snow and Rally cars": "With Snow and Rally cars, if a player presses Action Key 3 button, they will have a 60% value as their maximum steering, instead of 100%"; "For all new cars, the Action Key feature will now work as a re-range instead of a clamp for analog devices"; analog players "will hit the 60% steering value only if they fully push their joystick"; at 50 % stick with AK3 "they now will steer at 30% in game, instead of 50% before the update"; "The action key system will remain the same for the Stadium Car"; released "as an experiment, which will last until the end of the Winter season"; "We might change or even rollback this new Action Key feature" — [trackmania.com/news/7971](https://www.trackmania.com/news/7971) (also [blog.trackmania.com/?p=7971](https://blog.trackmania.com/?p=7971))
- (a) Nadeo, 29 Mar 2024, Spring 2024 campaign post, section "ABOUT THE ACTION KEY EXPERIMENTATION": the team "reworked the Action Key feature for the Original Trilogy vehicles", calls the experiment "a success", aimed at "a better car management for all analog devices' players, on PC and consoles" — [trackmania.com/news/7980](https://www.trackmania.com/news/7980)
- (a) Desert car launch (22 May 2024) and its changelog contain no Action Key statement — [news/8076 (search snippet)](https://www.trackmania.com/news/8076), [news/8097](https://www.trackmania.com/index.php/news/8097)
- (c) "Keyboard Tips" (Original School club, trackmania.com club news, undated): "There are 5 action keys, AK1 to AK5, which set steering to 20%, 40%, 60%, 80%, and 100%"; "Pressing the same action key again will return the steering back to 100%"; advice: AK3 on slippery combos (Rally on road, Snow on dirt), avoid AKs on grippy surfaces; typical ranges "AK3-AK5 on Snow, AK2-AK4 on Rally, AK3-AK5 on Desert" — [trackmania.com/clubs/330/news/631823](https://www.trackmania.com/clubs/330/news/631823)
- (c) GamersDecide guide (updated 22 Mar 2022): Action Keys "arrived towards the end of 2021"; "when you full steer and press an Action Key, say Action Key 3, then your steering will be at 3 * 10%, 30%"; "Input > Player Bindings > Action Key 0. This will reset your steering to 100%" — [gamersdecide.com](https://www.gamersdecide.com/articles/trackmania-2020-best-controller-settings)
- (c) Reddit r/TrackMania "Action keys" thread (search snippet only, thread not fetchable): "AK 1 = 20% AK 2 = 40% AK 3 = 60% AK 4 = 80 % AK 5 = 100%", and a commenter saying action keys are "more for mouse and keyboard players" — [lr.in.psf.lt mirror of reddit 1gpu0zf](https://lr.in.psf.lt/r/TrackMania/comments/1gpu0zf/action_keys)
- (c) Default PC bindings (third-party, article dated 6 May 2025): "Action Slot 1: 1 … Action Slot 5: 5"; Action Slot 0 not listed — [BisectHosting controls guide](https://www.bisecthosting.com/blog/trackmania-controls-controller-pc-keyboard-playstation-xbox)
- (c) TM2020 ghost input tape contains an `ActionSlot` input type ("Either" category, alongside `MouseAccu`, `RespawnTM2020`, `SecondaryRespawn`), and "Its ActionSlot values map to different key numbers than older games" — [GBX.NET wiki (mirror)](https://github-wiki-see.page/m/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts)

### Inferences
- (d) Reconciling sources: the 2021 launch behaviour appears to have been AK N = N×10 % with AK0 = reset; by 2024 the community-standard description is 20/40/60/80/100 % for AK1–5 with same-key-again = 100 %. Nadeo's "AK3 = 60 %" is consistent with the 20 % ladder. The exact current ladder for the Stadium car vs. Snow/Rally/Desert is not officially enumerated beyond AK3.
- (d) Because `ActionSlot` events are recorded in the ghost tape separately from `SteerTM2020`, the AK cap is most likely applied inside the simulation (the tape must carry AK presses so the server can re-simulate), and the recorded steer value is the raw device value, not the capped one. Consequently an input viewer fed from `CSceneVehicleVisState.InputSteer` would show the post-cap value during live play (it is the value the physics used), whereas a tape dump shows the raw value plus `ActionSlot` events. This is inference; no source confirms which value `InputSteer` reports when an AK is active.
- (d) Since Nadeo describes AK as toggling a "maximum steering" for analog devices too (re-range), a virtual-controller tool must assume AK state modifies analog steering as well on Original-Trilogy cars, and clamps it on the Stadium car.

### Gaps
- Toggle persistence across respawn/give-up/restart/map change: not documented anywhere found.
- Whether pressing a different AK replaces the current one (vs. requiring the same key to cancel) is only implied by guides, not stated officially.
- No in-game help text transcript or Ubisoft support article on Action Keys was found; doc.trackmania.com has no page on them.

---

## KQ5. Frame vs physics step for live injected inputs; the 10 ms pulse and same-tick double changes

### Takeaway
There is no direct TM2020 test in the public record of whether a live 10 ms device pulse is consumed. The engine evidence (`InputsMode::Timed`, DirectInput timed-event statistics, `MaxSampleRate`, `MinHistoryLength`) points to timestamped event consumption rather than one snapshot per frame, and the ghost format proves the simulation accepts per-tick state changes on several channels at once (one `InputChanges` record per tick carries steer and button states). For TMNF, TMInterface documents that several commands at the same timestamp are applied in order within that tick.

### Cited Findings
- (b) `CInputPort.InputsMode` = `Timed | NotTimed | Config`; `StatsDInputTimedEventsCount`, `StatsDInputWrongTimestampAhead/Late`, `StatsDInputWrongTimestampAvgDelta`, `StatsDInputOverflowedLastFrame`, `StatsDInputEventsLastFrame`, `MaxSampleRate`, `MinHistoryLength`, `EventInStoreCount`, `FakeInputLagAvg/Var` — [CInputPort](https://next.openplanet.dev/Input/CInputPort)
- (c) TM2020 tape: per-tick `InputChanges` entries with `Tick`, `Timestamp`, `Steer` (`sbyte`) and the button states; "The storage of data is tick-based" — [GBX.NET wiki (mirror)](https://github-wiki-see.page/m/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts)
- (c, TMNF — older game) TMInterface: commands at identical timestamps are applied in script order within the same tick; `press`/`rel`/`steer` ranges expand to start/end events — [TMInterface script syntax](https://donadigo.com/tminterface/script-syntax); API exposes `SetInputState(InputType, int)`, `get_TickTime()`, `InputEvent.Time` — [TMInterface API (all)](https://donadigo.com/tminterface/plugins/api/all)
- (c, TMNF — older game) "At no point, does the tool use an approximation or interpolation of inputs" — [donadigo.com/tmx1](https://donadigo.com/tmx1)
- (c, TM2020) A ghost "recording was one tick early" was treated as unpublishable even though "the time is real" — tick-exact placement is observable and matters — [vjeux/trackmania-tas](https://github.com/vjeux/trackmania-tas)
- (c, TM2020) TMRL's practical loop: 50 ms steps through a virtual Xbox 360 pad; `rtgym` lets a step time out and start the next from the current timestamp — no claim of tick accuracy — [tmrl](https://github.com/trackmania-rl/tmrl)
- (c, TM2020) Linesight is TMNF/TMInterface-based, not TM2020 — [pb4git/linesight](https://github.com/pb4git/linesight), [Linesight docs](https://linesight-rl.github.io/linesight/build/html/)
- (c, TM2020) Polybagel/TM2020-TAS: replay input extraction "Partially Implemented", TAS playback "Not Implemented", uses "several Windows API calls" — [TM2020-TAS](https://github.com/Polybagel/TM2020-TAS)

### Inferences
- (d) For a tool injecting through a virtual pad/keyboard, the deciding factor is whether the game is in `Timed` mode and honours device timestamps. If it does, a 10 ms pulse delivered as two DirectInput buffered events 10 ms apart will land on consecutive ticks regardless of frame time; if the game instead samples `ReadHardwareCurState()` once per frame (the `MustBePolled` device path), a pulse shorter than one frame can be missed whenever frame time > 10 ms. Nothing fetched settles which path applies to virtual XInput pads vs. DirectInput keyboards. Recommendation implied by the evidence: measure with the game's own `StatsDInput*` counters (readable from an Openplanet plugin in developer mode) and with tape extraction (GBX.NET `InputChanges`).
- (d) Two simultaneous changes (e.g. steer and brake) in one tick are definitely representable in the tape and are produced by real pads (one HID report changes several axes/buttons at once), so the simulation must support them; same-tick ordering effects are only documented for TMNF.

### Gaps
- No public measurement of the minimum reliably consumed press duration for live keyboard or virtual-pad input in TM2020.
- No documentation of `InputsMode` semantics or of which mode the shipping game runs in.

---

## KQ6. Countdown behaviour (length, inputs during countdown, negative timestamps)

### Takeaway
Nadeo's TM2020 `Race` script library defines the spawn-to-start delay as `C_SpawnDuration = 1500` ms, and mode scripts set `StartTime = Now + Race::C_SpawnDuration`; plugins observe `CurrentRaceTime` negative during the countdown and reaching zero at GO. Whether inputs during the countdown are applied/buffered and whether they are stored with negative timestamps is not documented in anything fetched.

### Cited Findings
- (b, official Nadeo script, mirrored) `Scripts/Libs/Nadeo/TMGame/Modes/Race.Script.txt`: `#Const C_SpawnDuration 1500`, `#Const C_OutroDuration 8000`; `Void Start(CSmPlayer _Player)` calls `Start(_Player, GetPlayerDefaultStart(_Player), 0, Now + C_SpawnDuration)`; respawn behaviour constants `C_RespawnBehaviour_Normal/DoNothing/GiveUpBeforeFirstCheckpoint/AlwaysGiveUp/NeverGiveUp/Custom` mapped to `CSmMode::ERespawnBehaviour` and `CSmMode::EGiveUpBehaviour` — [Race.Script.txt @73ee8ed (BigBang1112/maniascript-sharp mirror)](https://raw.githubusercontent.com/BigBang1112/maniascript-sharp/73ee8ed4ed9be43dfeafba9bbbd9ea12206ada01/src/ManiaScriptSharp.Trackmania/Scripts/Libs/Nadeo/TMGame/Modes/Race.Script.txt)
- (b) `TM_RaceValidation_Local.Script.txt`: "// Spawn player / StartTime = Now + Race::C_SpawnDuration; / Race::ResetSolo();" — [GitHub code search hit, maniascript-sharp](https://github.com/BigBang1112/maniascript-sharp/blob/73ee8ed4ed9be43dfeafba9bbbd9ea12206ada01/src/ManiaScriptSharp.Trackmania/Scripts/Modes/TrackMania/TM_RaceValidation_Local.Script.txt); same pattern in XertroV/tm-archivist validation scripts
- (b, plugin comment) "MLFeed measures CurrentRaceTime against the player's StartTime. During the pre-start countdown that makes raceTime negative, reaching zero at GO." — [CornerJockeys/MLETM PBMonitor.as @70663549](https://github.com/CornerJockeys/MLETM/blob/706635491d324fe6829ed6c17dc6fc9a26744e9a/ops-plugin/src/Telemetry/PBMonitor.as)
- (c, TM2020 plugin comment) "with TimeOffset 0 a ghost's zero was the playground's own zero (~7 s + the countdown before the race)"; "the mode itself re-times its own ghosts on every (re)spawn with Ghosts_SetStartTime"; `CSmScriptPlayer.StartTime` and `CurrentRaceTime` are used as the race clock — [vjeux/trackmania-tas PgGhost.as (raw)](https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/tools/openplanet-plugin/PgGhost.as)
- (c) GBX.NET: a `StartOffset` had to be added to TM2020 input times ("no longer needed since 1.2.0") — [GBX.NET wiki (mirror)](https://github-wiki-see.page/m/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts)

### Inferences
- (d) The visible "3-2-1-GO" fits in 1.5 s (0.5 s per step); the player is spawned at `Now` and released at `StartTime`.
- (d) The existence of a `StartOffset` correction in GBX.NET suggests tape timestamps are stored relative to a clock that is not race-time zero (plausibly spawn time), which would allow pre-GO inputs to be represented; this is speculative.

### Gaps
- No source states whether throttle held before GO launches at t=0, whether steering during countdown turns the wheels, or whether countdown inputs are stored with negative times.

---

## KQ7. Give Up / Respawn / Restart semantics

### Takeaway
Default keyboard bindings are Delete = Give Up and Backspace = Respawn (Enter is not a default per the one binding table found); controller defaults are B/Circle = Give Up, Y/Triangle = Respawn. The respawn/give-up policy is set by the mode script (`ERespawnBehaviour`: AlwaysRespawn, GiveUpBeforeFirstCheckpoint, AlwaysGiveUp, DoNothing, Custom), and respawn events are one-way presses in the ghost tape. Reset of AK caps, load time, and inputs held across restart are undocumented.

### Cited Findings
- (c) Default PC bindings: Accelerate W/Shift/Up; Brake S/Ctrl/Space/Down; Steer A/Left, D/Right; Horn Num 0; Give Up Delete; Respawn Backspace; Action Slot 1–5 = 1–5; Cameras Num 1–7; PlayStation: Give Up Circle, Respawn Triangle; Xbox: Give Up B, Respawn Y; article dated 6 May 2025 — [BisectHosting](https://www.bisecthosting.com/blog/trackmania-controls-controller-pc-keyboard-playstation-xbox)
- (b) Nadeo `Race.Script.txt`: `C_RespawnBehaviour_Normal` -> `RespawnBehaviour = AlwaysRespawn; GiveUpBehaviour = GiveUp`; `C_RespawnBehaviour_GiveUpBeforeFirstCheckpoint`; `C_RespawnBehaviour_AlwaysGiveUp`; `C_RespawnBehaviour_NeverGiveUp` (respawn allowed, give-up does nothing); `Void ResetSolo() { GameScene_ResetAll(); }`; `Start(...)` sets `Race_RaceState = C_RaceState_Racing` and spawns at `_SpawnTime` — [Race.Script.txt @73ee8ed](https://raw.githubusercontent.com/BigBang1112/maniascript-sharp/73ee8ed4ed9be43dfeafba9bbbd9ea12206ada01/src/ManiaScriptSharp.Trackmania/Scripts/Libs/Nadeo/TMGame/Modes/Race.Script.txt)
- (c) Tape input types `RespawnTM2020` and `SecondaryRespawn`: "Does not include key release event, one-way press" — [GBX.NET wiki (mirror)](https://github-wiki-see.page/m/BigBang1112/gbx-net/wiki/Extracting-input-data-from-ghosts)
- (b) `CGameCtnGhost` records `NbRespawns` and `RaceTime` — [CGameCtnGhost](https://next.openplanet.dev/Game/CGameCtnGhost)
- (a) Ubisoft forum report of Give Up / Respawn keybinds not working for one player (single report) — [devtrackers 1b155704 (search snippet only)](https://devtrackers.gg/trackmania/p/1b155704-unable-to-use-give-up-and-respawn-keybinds)

### Inferences
- (d) "Give Up" (Delete) re-runs the spawn sequence (`Start` -> `Now + 1500 ms` countdown) and resets the car and race time; "Respawn" (Backspace) returns to the last checkpoint and is counted in `NbRespawns`; in modes using `GiveUpBeforeFirstCheckpoint`, Backspace before CP1 behaves as Give Up. Whether AK toggle state survives a give-up is unknown.

### Gaps
- No official binding table (doc.trackmania.com has none); Enter/"Restart" default not confirmed.
- Load/latency from give-up press to new countdown start: no measurement found.
- Behaviour of inputs held across the respawn boundary: not documented.

---

## KQ8. Anti-cheat and policy toward input tools / offline experimentation

### Takeaway
No kernel anti-cheat is evidenced for TM2020: Steam lists no DRM/anti-cheat notice, ProtonDB rates it Platinum (259 reports) and AreWeAntiCheatYet has no entry for it, which is consistent with Nadeo's model of server-side record analysis (re-simulation of input tapes by the dedicated server, plus the 2021 retroactive scan of 400k TMUF records). Nadeo deliberately does not disclose detection details; the only sanctioned "offline experimentation" mechanism found is Openplanet's School/Developer signature mode, which disables leaderboards and online play on most maps.

### Cited Findings
- (a) Florent "Hylis" Castelnérac, 13 Jul 2021 (quoted by PC Gamer and NME): "We ran anticheat detection for 400k records made over the last 15 years on TMUF. The cheated records will be removed in the upcoming days, the majority were own by 10 logins."; "I wish to disclose that the number of fair records are above 99% and closer to 100%"; "And we will avoid to disclose more information as it is best for anticheat development." — [PC Gamer, Rich Stanton](https://www.pcgamer.com/trackmania-dev-analyses-15-years-worth-of-records-to-root-out-the-cheaters/), [NME, 13 Jul 2021](https://www.nme.com/news/gaming-news/trackmania-developers-use-400000-records-to-find-major-cheating-logins-2992519)
- (c) The 2021 community investigation (Wirtual/donadigo) detected slow-motion cheating from replay input "spikes" ("change of direction per second", threshold "2000 or 1.5% of the available steering range"); one player admitted "game speeds between 40-80%" — [donadigo.com/tmx1](https://donadigo.com/tmx1), [PC Gamer](https://www.pcgamer.com/trackmania-dev-analyses-15-years-worth-of-records-to-root-out-the-cheaters/)
- (c) Wikipedia (Wirtual): Nadeo "started a widespread cheating investigation across the franchise"; in 2025 Nadeo purged Riolu's records for a "violation of fair play" (cited to an X post by Castelnérac, https://x.com/Hylis1/status/1904239315787677978, not fetched) — [en.wikipedia.org/wiki/Wirtual](https://en.wikipedia.org/wiki/Wirtual)
- (c, TM2020) Ghost files carry `Validate_ExeVersion`, `Validate_ExeChecksum`, `Validate_OsKind`, `Validate_CpuKind`, `Validate_ExtraTool_Info`, and the dedicated server re-simulates tapes; a 2022-build record "does not re-simulate today" — [GHOSTFORMAT.md](https://raw.githubusercontent.com/vjeux/trackmania-tas/HEAD/GHOSTFORMAT.md), [README](https://github.com/vjeux/trackmania-tas)
- (a) Official reporting page: reports (in-game behaviour or cheating, or a cheated/invalid record) go only through in-game, trackmania.com or Ubisoft support; "you will not receive details as to which actions were taken, if any"; no definition of cheating or of tools/macros — [doc.trackmania.com/general/how-to-report-player](https://doc.trackmania.com/general/how-to-report-player/)
- (c) Openplanet signature modes: "Official" loads only Openplanet-shipped plugins; "Regular" adds reviewed signed plugins; "School" "will disable leaderboards as well as online play on most maps"; "Developer" "loads all plugins, regardless of whether they are signed or not" and enables School Mode — [openplanet.dev/docs/tutorials/signature-modes](https://openplanet.dev/docs/tutorials/signature-modes)
- (c) Openplanet on Linux works under Wine/Proton with a `dinput8` DLL override (i.e. Openplanet itself loads via a `dinput8.dll` shim) — [openplanet.dev/docs/linux](https://openplanet.dev/docs/linux)
- (c) ProtonDB summary for app 2225070: tier "platinum", confidence "strong", 259 reports — [ProtonDB API](https://www.protondb.com/api/v1/reports/summaries/2225070.json); AreWeAntiCheatYet `games.json` contains no "Trackmania" entry — [AWACY games.json](https://raw.githubusercontent.com/AreWeAntiCheatYet/AreWeAntiCheatYet/HEAD/games.json)
- (a-ish) Steam appdetails: `drm_notice: None`; third-party account Ubisoft — [Steam appdetails](https://store.steampowered.com/api/appdetails?appids=2225070&l=en)
- (c) TMTAS Exchange: TAS runs are submitted as `.Replay.Gbx` to a separate TAS leaderboard; Linesight: "All runs produced by this project are Tool Assisted. They must not be submitted to the Official Leaderboards." — [tmtas.exchange/faq](https://tmtas.exchange/faq), [Linesight docs](https://linesight-rl.github.io/linesight/build/html/)
- (c) The speedrun.com Trackmania 2020 rules on macros/tools were not retrieved (search returned other games only).

### Inferences
- (d) Detection is server-side and record-centric (tape re-simulation, executable/OS/CPU validation fields, statistical input analysis) rather than a client kernel driver; local offline injection of inputs is therefore technically unobstructed, but any ghost produced that way carries the same validation metadata and would be re-simulated if uploaded. No Nadeo text explicitly permits or forbids offline macro/injection experimentation; the TAS community norm is a separate leaderboard and never the official one.

### Gaps
- No official Nadeo/Ubisoft statement on input macros, virtual controllers or local tooling was found.
- speedrun.com TM2020 category rules on macros/tools not retrieved.
- Details of Nadeo's 2023–2025 detection/ban mechanics beyond the 2021 statement and the 2025 Riolu purge were not found.
