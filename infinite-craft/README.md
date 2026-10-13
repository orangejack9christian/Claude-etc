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
   the extension install it. If Tampermonkey asks whether the script may connect to
   `infinibrowser.wiki`, choose **Always allow**: that's how it looks up recipes.

If the panel says it can't reach Infinibrowser, click **Open Infinibrowser tab** (in the card
or under Settings & Data) and keep that tab open. The script also runs there and fetches
recipes for the game tab. This works even when the game page itself is blocked, and it gets
past Infinibrowser's "checking your browser" page because you pass it in that tab. Allow
pop-ups for neal.fun if the browser blocks the tab. **Test Connection** shows what each route
to Infinibrowser returned; send that text if something still fails.
4. Open neal.fun/infinite-craft, click the panel's **Words to make** box, type your words, and
   press **Start** (or Ctrl+Enter). Press Esc to leave the box; typing anywhere else goes to
   the game's search bar as usual.

Your v5.x settings, targets, exclude list, saved recipes, pair history and Pokedex progress
are picked up automatically.

## How it makes any word

Each word goes through these steps in order, and every craft it makes comes from a known
recipe or a known text tool. If a round fails it searches deeper (quick, then deep, then
thorough). With **Never give up** on (the default), every later round searches wider: deeper
recipes, more letter tools, and bigger Infinibrowser surveys for tools that add a missing
character. When there's nothing new to try, it waits and tries again instead of stopping,
with the card saying what it's stuck on (for example `no known tool adds " "`). Every few
waits it re-checks Infinibrowser for new uploads. It never guesses at random.

1. **Look it up on Infinibrowser.** It checks every spelling that counts as your word
   (`Fire Truck`, `fire truck`, `FIRE TRUCK`, ...). If someone has already uploaded it, it
   crafts the cheapest recipe it finds. It sticks with that recipe: a step that gives something else in your
   game is rerouted through that item's other uploaded recipes, deeper each round, before the
   word is ever built another way. If a step doesn't work in your game or an ingredient
   is missing, it reroutes through that item's other uploaded recipes. If remembered history
   disagrees with Infinibrowser, it re-crafts that pair once to find out which is right.
2. **Phrases from words.** `Mr. Eremey Jeremy` = `Mr. Eremey` + `Jeremy`. First it only uses
   parts that already exist (in your inventory or on Infinibrowser). From round 2 it makes
   the missing parts first (`Mr. Eremey` = `Mr.` + `Eremey`, with `Eremey` built letter by
   letter), then combines them. A pair always gives the same result, so later rounds try
   other spellings of the parts (`ender` + `Dragon`, ...), each a fresh chance. A pair
   known to make something else is never crafted again.
3. **Build new words letter by letter.** For words nobody has made yet. This is the community
   technique: start from the longest quoted prefix Infinibrowser already knows (`"zor"`),
   append letters or chunks (`'b'`, `.l`, `“ian”`), then unquote the result
   (`"zorblaxian"` → `Zorblaxian`). It prefers tools you already have, then tools with short
   recipes. When a letter tool misfires it backs up and tries another tool or capitalization.
   When the text can't be unquoted, it builds another variant. Overshoots of up to three
   letters (`"crab"` when it wanted `"cra"`) are repaired with a backspace tool when one
   exists. The log shows the plan before it starts.

   **When no tool adds a character at all** (digits are common), it makes that character on
   its own (`"0"`, from the item `0` and a quote tool) and attaches it in one craft
   (`"The_"` + `"0"` → `"The_0"`).

   **When one spot keeps failing** (every tool for `e` on `"mr. Erem"` gives something else),
   later rounds do three things. They search Infinibrowser for how other people added that
   letter after the same ending (`"rem"` → `"reme"`) and try those tools. They try every
   quote style (`'e'`, `.e`, `“e”`, `‘e’`, `"e"`). And they build the rest as its own quoted
   piece (`“ey Jeremy”`) and attach it in one craft (`"mr. Erem"` + `“ey Jeremy”`), so the
   failing pair is never needed. If the word comes out with the wrong capitalization
   (`Mr. EreMey jeremy`), it spends one more round going for exactly what you typed and keeps
   the first result if that doesn't work.

### Text tools are learned, not hard-coded

Tool names change as the community finds better ones, so the script learns them. It mines
Infinibrowser's `/uses` and `/recipes` data for quoted words and diffs inputs against outputs
(`"fire"` + X = `Fire` means X unquotes), and records how every craft it makes behaves.
Tools are ranked by evidence and by their real success rate in your game. If no tool is known
for a character, it surveys short quoted strings that end in that character to find one.
A short list of common tool names is used only when Infinibrowser confirms those elements
exist.

## Panel

- **Main view**: the word box (comma- or newline-separated), **Start / Pause / Stop**, the
  progress card (what it's doing, why it's waiting, a fix button when there's something to
  do, and **Skip this word** while it runs) and one line of stats. 📋 in the header opens the
  log (tick "every craft" for full detail), and − collapses the panel.
- **⚙️ Settings**: which strategies to use, *Never give up*, *Exact capitalization*, speed,
  board options, an exclude list, **Run Recipe** (paste `A + B = C` lines), **Copy Last**
  recipe, **Recipe Only** for the first word, **Test Connection** and **Open Its Tab** for
  Infinibrowser, export/import, re-scan, re-learn tools, clear learned data, **Copy Debug
  Info** (what it's building, why it's stuck, and the last 2000 pairs it tried; paste that
  when reporting a word it can't make), and an optional **Explore Randomly** button. Explore
  only runs if you press it; **Start** with an empty box just asks for a word. By default
  capitalization may differ (`fire truck` accepts `Fire Truck`), but letters, spaces and
  punctuation must match what you typed. Quoted text like `"fire truck"` never counts as the
  plain word.
- **📕 National Pokédex**: same queue as before, using every strategy. It keeps v5's looser
  matching, so `Mr Mime` = `Mr. Mime`.
- The panel copies the game's font, colours and item style, and follows its dark mode.

## Changelog

- **6.9.0**: A much simpler panel. The main view is just the word box, Start / Pause / Stop,
  the progress card (with "Skip this word" while it runs) and one line of stats. Everything
  else is under one Settings section (strategies, speed, board, recipes, Infinibrowser,
  data, debug info, random exploring), and the log is a button in the header. When
  Infinibrowser starts showing its "checking your browser" page in the Infinibrowser tab, that
  tab now reloads itself so the check can run (with a note on the page saying what to do).
  The card says what's happening and offers "Go to Infinibrowser tab", and the run continues by
  itself as soon as the check has passed. Before, the card asked you to click a button that
  wasn't there. Infinibrowser requests stay under 60 a minute after the first burst.
- **6.8.2**: Attaching a separately built piece is tried once per spot per round, whatever
  the capitalization. Before, variants of the same text (`"ZoblivI"`, `"Zoblivi"`,
  `“zoblivi”`) each used up an attempt, so it never backed up to an earlier spot
  (`"Zobliv"` + `“ion”`). New test: a spot where even attaching a piece fails, like the real
  game's `“the_0b1ivi”` + `“on”` = `“on_the_0b1ivi”`.
- **6.8.1**: A word that's on Infinibrowser is made from its Infinibrowser recipe. Before,
  when one step of that recipe gave something else in your game, it rerouted only a little,
  then switched to building the word letter by letter (for "Remove Underscore" that meant a
  249-step detour through `"remove Underscore"`). Now it keeps rerouting that recipe deeper
  each round, and only builds the word another way if every Infinibrowser route fails at the
  deepest level. The card names the recipe it's following ("Infinibrowser recipe for X, step
  80/249: ...").
- **6.8.0**: The panel now looks like Infinite Craft. It's white with thin grey borders, and
  buttons and stats are item-style chips with an emoji and the game's light-blue hover. The
  panel copies the game's own font, colours and item shape from the page, and follows its dark
  mode. From real-game debug info: the forge no longer replays the same broken recipe over
  and over in a round (it remembers what it couldn't make), each "fix: … rerouting" line is
  logged once per run, and building a piece separately and attaching it now also happens at
  earlier points of the text (`"the_0b1"` + `“ivion”`), not only at the very end, where the
  game kept turning `“the_0b1ivi”` + `“on”` into `“on_the_0b1ivi”`.
- **6.7.0**: Characters no tool adds (like the `0` in `The_0b1ivion`) no longer stop the
  build. Before, it refused to start ("no known tool adds "0"") and waited forever. Now it
  makes that character on its own (the item `0`, quoted: `"0"`) and attaches it
  (`"The_"` + `"0"`). It uses Infinibrowser more gently, because heavy use triggers its
  "checking your browser" page, which blocks the script. Wider rounds no longer re-download
  pages they already have, surveys stop growing past a sensible size, and requests stay under
  100 a minute after the first burst. When Infinibrowser is what's blocking, the card now
  says so (instead of "no known tool adds …") and retries the connection by itself.
- **6.6.0**: Much less lag, especially with big saves. With 40,000 items the page used to
  be frozen 58% of the time during a run (worst freeze 0.5 s). Now it's 0%, and words are
  made about 3 times faster. The script used to re-index your whole inventory twice per
  craft; now it only indexes new items. Checking for a save switch no longer copies and
  sorts the inventory after every craft. Long runs pause briefly every 10 ms so the game can
  draw. Remembered pair results are saved in small batches instead of rewriting the whole
  table every 15 seconds. The log window is only drawn while it's open, and discovery
  sounds reuse one audio engine.
- **6.5.0**: Gets past spots where every letter tool fails. Before, once every known way of
  adding the next letter had failed on the text it had, it waited and retried the same
  things forever (stuck at `"mr. Erem"`). Now later rounds search Infinibrowser for tools
  others used in that exact spot. They try more quote styles and longer chunks, and build
  the rest of the word as a separate quoted piece to attach in one craft. Overshoots of up
  to three letters are repaired. Phrase parts get the same wider searches as the whole word.
  A word made with stray capitals gets one follow-up round for the exact capitalization. New
  **Copy Debug Info** button.
- **6.4.0**: Never gives up. With "Never give up" on, rounds continue indefinitely and
  widen each time. When stuck, it waits and retries (re-checking Infinibrowser for new
  uploads) and the card shows the most specific blocker, not "not on Infinibrowser yet".
  Phrases now make their missing parts and try other spellings of the parts. Spaces and
  punctuation get their own Infinibrowser survey. If Infinibrowser drops mid-run, the run
  keeps going with the "Open Infinibrowser tab" button in the card and continues by itself
  once it's back.
- **6.3.0**: When a word fails, the card now says why (not just "Could not make") and offers
  the fix. New **Open Infinibrowser tab** relay: the script also runs on infinibrowser.wiki and
  fetches recipes for the game tab. It talks over postMessage, or through shared userscript
  storage when the tabs aren't linked. Requests try the relay tab, then the userscript
  manager, then a direct request, and keep each route's error. New **Test Connection**
  button.
- **6.2.0**: Works with the updated Infinite Craft client. It crafts through the game's own
  `window.IC` API (places both items on the board and combines them, like dragging) and
  falls back to the old method on older versions. It reaches Infinibrowser through the
  userscript manager (`GM_xmlhttpRequest`, `@connect infinibrowser.wiki`), because the
  browser blocks direct cross-site requests from the game page. It checks the connection on
  load and says plainly when Infinibrowser is blocked or showing a "checking your browser"
  page. The result card stays up with the reason a run stopped. A false "different save
  detected" stop while the game loads is fixed. "Nothing" results recorded by 6.0/6.1 are
  dropped, since those versions crafted through an API the update changed.
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
SIM_DEBUG=debug.txt node test/run-sim.js Qwxyzzy   # save the Copy Debug Info text per word
node test/run-sim.js --jam erem:e "Mr. Eremey Jeremy"   # every letter tool for "e" after "erem" misfires
node test/ui-smoke.js     # clicks through every panel control
node test/keyboard.js     # typing in the panel isn't stolen by the game's search bar
node test/connection.js   # blocked / "checking your browser" Infinibrowser, recovery, relay tab
node test/run-sim.js --legacy Dragon   # the pre-2026 game client
node test/perf.js         # lag with a 40,000-item save (main-thread freezes over 50 ms)
```

The simulator imitates the current client: `window.IC` plus `.container`'s
`craft(instanceA, instanceB)`, which throws unless it's given real board instances.

Latest results (v6.6.0):

| Run | Result |
|---|---|
| Scenario words: lineages, stale recipes, gibberish, phrases, digits, `Wow!`, `Xx_Gamer_xX`, exact-case `qUiRkY`, names with no space tool, a spot where every letter tool fails (`"mr. Erem"` + e), older client | 33/33, avg 97 crafts |
| 50 random words, 12% tool noise | 50/50, avg 37 crafts per word (max 241) |
| 50 random words, 30% tool noise | 50/50, avg 59 crafts per word (max 286) |
| UI, keyboard and connection checks | all pass |
| Lag with a 40,000-item save (4 words) | 0 freezes over 50 ms (6.5.0: page frozen 58% of the run, worst 0.5 s); 41 s instead of 126 s |
| Same with 80,000 items | 0 freezes over 50 ms |

These are simulator results. The real game's AI and Infinibrowser's data will behave
differently, so expect different craft counts.
