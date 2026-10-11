# Infinite Craft: Word Forge Pro (Auto Combiner v6)

A Tampermonkey/Violentmonkey userscript for [Infinite Craft](https://neal.fun/infinite-craft/).
Type any word and it gets crafted: a real word, a phrase, a made-up word, mixed case, digits,
whatever. It never combines things at random. It looks the word up on Infinibrowser and crafts
the recipe someone uploaded, and only if nobody has made the word yet does it build it letter
by letter with text tools. It replaces "Auto Combiner Pro v5.1".

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

Each word goes through these steps in order, and every craft it makes comes from a known
recipe or a known text tool. If a round fails it searches deeper (quick, then deep, then
thorough). When every known route is used up, it stops and tells you why in the log (for
example `no known tool adds "ü"`) instead of guessing.

1. **Look it up on Infinibrowser.** It checks every spelling that counts as your word
   (`Fire Truck`, `fire truck`, `FIRE TRUCK`, ...). If someone has already uploaded it, it
   crafts the cheapest recipe it finds. If a step doesn't work in your game or an ingredient
   is missing, it reroutes through that item's other uploaded recipes. If remembered history
   disagrees with Infinibrowser, it re-crafts that pair once to find out which is right.
2. **Phrases from words that exist.** `Fire Truck Monster` = `Fire Truck` + `Monster`, but
   only when both parts are already in your inventory or on Infinibrowser, and never when the
   pair is known to make something else.
3. **Build new words letter by letter.** For words nobody has made yet. This is the community
   technique: start from the longest quoted prefix Infinibrowser already knows (`"zor"`),
   append letters or chunks (`'b'`, `.l`, `“ian”`), then unquote the result
   (`"zorblaxian"` → `Zorblaxian`). It prefers tools you already have, then tools with short
   recipes. When a letter tool misfires it backs up and tries another tool or capitalization.
   When the text can't be unquoted, it builds another variant. Overshoots like `"crab"`
   when it wanted `"cra"` are repaired with a backspace tool when one exists. The log shows
   the plan before it starts.

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
- **Strategies**: turn each step on or off, plus *Never give up* and
  *Exact capitalization too*. By default capitalization may differ (`fire truck` accepts
  `Fire Truck`), but letters, spaces and punctuation must match what you typed
  (`Firetruck` and `fire-truck` don't count). Quoted text like `"fire truck"` never counts as
  the plain word. The Pokedex queue keeps v5's looser matching, so `Mr Mime` = `Mr. Mime`.
- **National Pokedex**: same queue as before, now using every strategy.
- **Settings & Data**: exclude list, sweep, drag animation, sound, **Run a recipe** (paste
  `A + B = C` lines), **Copy Last Recipe**, export/import, re-learn tools, clear learned data,
  re-scan save, and an optional **Explore Randomly** button (the old v5 random combining).
  Explore only runs if you press that button; **Start** with an empty box just asks for a
  word.

## Changelog

- **6.1.0**: No more random combining. Guided search and word-splitting guesses are gone;
  every word comes from an Infinibrowser recipe, a phrase of two existing words, or letter
  by letter building. The lookup tries every matching spelling and picks the cheapest
  uploaded recipe. Remembered results that contradict Infinibrowser are re-checked once.
  Letter tools you own or that have short recipes are preferred. Before crafting, it checks
  that every letter has a known tool and says so up front if one doesn't. The log shows the
  plan, and when a word can't be made it says why instead of retrying forever.
- **6.0.1**: Typing in the panel's boxes no longer jumps to the game's search bar. Infinite
  Craft sends all typing outside an `<input>` to its search; the script now stops keys
  typed in the panel before the game sees them, and runs at `document-start` so that
  listener is registered first.

## What changed from v5.1

- New word engine (above). v5 could only follow Infinibrowser recipes; otherwise it combined
  things at random.
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
recipes you've saved and tools you already own are available.

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

Latest results (v6.1.0, no random combining):

| Run | Result |
|---|---|
| Scenario words (lineages, stale recipes, gibberish, phrases, digits, `Wow!`, `Xx_Gamer_xX`, exact-case `qUiRkY`) | 25/25, avg 36 crafts |
| 100 random words, 12% tool noise | 100/100, avg 16–17 crafts per word (max 70) |
| 100 random words, 30% tool noise | 100/100, avg 26–29 crafts per word (max 240) |
| Words with a letter no tool can add (`naïve`, `Über`) | stop in seconds with the reason, 0 crafts |
| UI checks (v5 migration, pause/skip/stop, export/import, Pokedex, explore button, drag) | 29/29 |
| Keyboard checks (typing stays in the panel; outside it still goes to game search) | 11/11 |

These are simulator results. The real game's AI and Infinibrowser's data will behave
differently, so expect different craft counts.
