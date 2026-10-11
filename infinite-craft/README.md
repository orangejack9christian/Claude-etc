# Infinite Craft: Word Forge Pro (Auto Combiner v6)

A Tampermonkey/Violentmonkey userscript for [Infinite Craft](https://neal.fun/infinite-craft/).
Type any word and it gets crafted: a real word, a phrase, a made-up word, mixed case, digits,
whatever. It replaces "Auto Combiner Pro v5.1" and keeps everything that version did.

## Install

1. Install Tampermonkey (or Violentmonkey).
2. Disable or remove the old "Auto Combiner Pro v51" script, so the two don't both start.
3. Create a new script and paste in `word-forge-pro.user.js`, or open the raw file URL and let
   the extension install it.
4. Open neal.fun/infinite-craft, click the panel's **Words to make** box, type your words, and
   press **Start** (or Ctrl+Enter). Press Esc to leave the box; typing anywhere else goes to
   the game's search bar as usual.

Your v5.x settings, targets, exclude list, saved recipes, pair history and Pokedex progress
are picked up automatically.

## How it makes any word

Each target goes through these strategies in order. If a round fails, it escalates to deeper
searches (quick, then deep, then relentless). With **Never give up** on (the default), it
keeps going until the word exists or you press Stop or Skip.

1. **Infinibrowser recipes, self-healing.** It fetches the shortest known lineage from
   infinibrowser.wiki and replays it. If a step doesn't reproduce in your game, or an
   ingredient is missing, it doesn't stop: it marks that pair bad, pulls alternate recipes for
   the missing item, resolves their ingredients recursively, and carries on.
2. **Compound words and phrases.** For example `Fire Truck` = `Fire` + `Truck`, and
   `Fire Truck Monster` = `Fire Truck` + `Monster`. Single words are split at likely
   boundaries (`Fire|works`, `Un|happy`) when both halves exist. Parts it can't find are
   forged recursively.
3. **String building, for any spelling.** This is the community technique: start from the
   longest quoted prefix Infinibrowser already knows (`"zor"`), append letters or chunks
   (`'b'`, `.l`, `“ian”`), then unquote the result (`"zorblaxian"` → `Zorblaxian`).
   Overshoots like `"crab"` when it wanted `"cra"` are repaired with a backspace tool when one
   exists.
4. **Guided search.** Trial and error that favours items similar to the target, with a
   bigger budget every round.

### Text tools are learned, not hard-coded

Tool names change as the community finds better ones, so the script learns them. It mines
Infinibrowser's `/uses` and `/recipes` data for quoted words and diffs inputs against outputs
(`"fire"` + X = `Fire` means X unquotes), and records how every craft it makes behaves.
Tools are ranked by evidence and by their real success rate in your game. If no tool is known
for a character, it surveys short quoted strings that end in that character to find one.
A short list of common tool names is used only when Infinibrowser confirms those elements
exist.

## Panel

- **Words to make**: comma- or newline-separated queue.
- **Start / Pause / Stop**, **Skip** (current target), **Exact Recipe** (saved or
  Infinibrowser recipe only), **Log** (forge log; tick "every craft" for full detail).
- **Strategies**: turn each strategy on or off, plus *Never give up* and
  *Exact capitalization too*. By default capitalization may differ (`fire truck` accepts
  `Fire Truck`), but letters, spaces and punctuation must match what you typed
  (`Firetruck` and `fire-truck` don't count). Quoted text like `"fire truck"` never counts as
  the plain word. The Pokedex queue keeps v5's looser matching, so `Mr Mime` = `Mr. Mime`.
- **National Pokedex**: same queue as before, now using every strategy.
- **Settings & Data**: exclude list, sweep, drag animation, sound, keep exploring after
  targets, **Run a recipe** (paste `A + B = C` lines), **Copy Last Recipe**,
  export/import, re-learn tools, clear learned data, and re-scan save.

With no targets, **Start** explores (newest items first), as v5 did.

## Changelog

- **6.0.1**: Typing in the panel's boxes no longer jumps to the game's search bar. Infinite
  Craft sends all typing outside an `<input>` to its search; the script now stops keys
  typed in the panel before the game sees them, and runs at `document-start` so that
  listener is registered first.

## What changed from v5.1

- New word engine (above). v5 could only follow Infinibrowser recipes, plus random combining.
- Pair results are global in Infinite Craft, so it never re-crafts a pair it already knows,
  and switching saves no longer throws away what it learned.
- Big data (pair history, Infinibrowser cache, text tools) moved from `localStorage` to
  IndexedDB, so it can't crowd out the game's own save. Old data is migrated once.
- Infinibrowser requests are throttled, deduplicated, cached for 30 days (misses for 2 days),
  and back off on HTTP 429.
- Craft results are read from the game state directly instead of waiting a fixed delay, and
  only the board instance the craft created is cleaned up.
- The inventory is indexed, so lookups stay fast with tens of thousands of items.
- The panel is draggable, its sections collapse, and it shows a live progress card for the
  current word.

## Limits

Infinite Craft's results come from an AI model, so no script can promise a specific result
from a specific pair. The forge gets around that by trying alternatives, verifying every step
and learning as it goes. In practice, string building needs Infinibrowser to be reachable,
because quoted letters and text tools come from its recipes. If Infinibrowser is down, only
your own inventory and guided search are available.

## Testing

`test/` contains a deterministic simulator of the game and the Infinibrowser API. It has
noisy text tools, stale recipes, rate limiting, and an unquote tool whose name isn't in the
script's guess list. `test/run-sim.js` loads the real userscript into headless Chromium
against it:

```sh
npm i -D playwright       # or use a global install
node test/run-sim.js      # default scenarios
node test/run-sim.js --random 50 --seed r2              # 50 random words
node test/run-sim.js --seed w9 --noise 0.3 "Fire Truck" Zorblaxian
SIM_VERBOSE=1 node test/run-sim.js Qwxyzzy   # print the forge log and the recipe used
node test/ui-smoke.js     # clicks through every panel control
node test/keyboard.js     # typing in the panel isn't stolen by the game's search bar
```

Latest results (v6.0.0 engine, v6.0.1 keyboard fix):

| Run | Result |
|---|---|
| Scenario words (lineages, stale recipes, gibberish, phrases, digits, `Wow!`, `Xx_Gamer_xX`, exact-case `qUiRkY`) | 25/25 |
| 50 random words, 12% tool noise | 50/50, avg 19 crafts per word (max 70) |
| 50 random words, 30% tool noise | 50/50, avg 34 crafts per word (max 194) |
| UI checks (v5 migration, pause/skip/stop, export/import, Pokedex, explore, drag) | 28/28 |
| Keyboard checks (typing stays in the panel; outside it still goes to game search) | 11/11 |

These are simulator results. The real game's AI and Infinibrowser's data will behave
differently, so expect different craft counts.
