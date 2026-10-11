# 2048 Network

A 2048 player built like a modern chess engine: a learned evaluation network plus a
deep expectimax search. The network taught itself from scratch by playing games
against the random tile spawner; nothing about 2048 strategy was programmed in.

`viewer/` is a web page that runs the trained network and the search engine (compiled
to WebAssembly) in the browser. You can watch it play live at any thinking time,
replay games from every stage of training, and see the learning curves.

## How it works

**Evaluation: an n-tuple network.** Four 6-cell windows on the board, each applied
in all 8 rotations/reflections with shared weights (32 lookups per position). Every
arrangement of tiles in a window has its own weight, 16^6 per window, about 67M weights
in total. The value of a position is the sum of the 32 weights: the score the network
expects to still earn from there. This shallow, very wide architecture is the one behind
the strongest 2048 programs.

**Training: TD(0) with temporal coherence.** The network plays a game greedily (the
move with the best reward + V(afterstate)), then walks the game backwards nudging each
afterstate's value toward the reward of the next move plus the next afterstate's value.
Temporal coherence (TC) gives each weight its own adaptive learning rate. Four threads
share the weights lock-free. Two later additions target the endgame, where games were
dying right after the 16384 tile:

- From game 506K, the restart strategy: each fresh game is followed by three games that
  start from the middle of the previous one, so the endgame gets more practice.
- From game 616K, a second stage: once a 16384 tile is on the board the network switches
  to its own endgame weights (initialised as a copy of the main ones).

**Search: expectimax.** Move nodes take the best move, chance nodes average over every
empty cell receiving a 2 (90%) or 4 (10%). Like a chess engine it uses iterative
deepening under a time budget, a transposition table, and skips chance branches whose
probability falls below 1e-4. The same C++ (`src/search.h`, `src/sparse.h`) runs natively
for benchmarks and as freestanding WebAssembly in the browser (`wasm/engine.cpp`).

## Play it in Token Alley (Tampermonkey)

`userscript/token-alley-2048-ai.user.js` lets the network and its search play the 2048
cabinet in the Token Alley arcade, in your own browser.

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension. In Chrome, also turn
   on "Allow User Scripts" for it (Extensions > Tampermonkey > Details).
2. Open the script's raw file on GitHub and press Install:
   `https://raw.githubusercontent.com/orangejack9christian/Claude-etc/claude/zealous-babbage-prlf3t/2048-ai/userscript/token-alley-2048-ai.user.js`
3. Open the arcade, open the 2048 cabinet, press Play, then "Let the AI play" in the panel
   at the bottom right. The first time, it downloads the network (about 47 MB) and caches it.

How it plays: it reads the board from the cabinet's game object (`Arcade.games` entry
`2048`, whose `tiles` hold `{ r, c, v }`), runs the same WebAssembly search as the viewer in
a background worker, and presses the arrow key for the chosen move, at 1 to 6 moves a
second (2 by default) so you can follow it.

Fair play: a game the AI made any move in never saves its score, best tile or hall-of-fame
entry, and the AI stays off in online races, which are live against other players.

claude.ai serves each artifact from its own sandboxed address, so the script is allowed on
every https page but exits immediately unless the page is titled "Token Alley" and runs the
arcade engine; anywhere else it does nothing and downloads nothing.

## Layout

```
src/game.h       bitboard engine (64-bit board, row lookup tables)
src/ntuple.h     the network (dense weights) and checkpoint I/O
src/train.cpp    multi-threaded TD/TC trainer
src/play.cpp     benchmark: plays fresh games at a fixed depth or time per move
src/search.h     expectimax with iterative deepening, transposition table, pruning
src/sparse.h     sparse weight table with O(1) lookups (the format the viewer ships)
src/export.cpp   exports the network sparse + int16-quantized for the viewer
src/test.cpp     engine tests against a naive implementation
wasm/engine.cpp  WebAssembly entry points for the browser
tools/release.sh export + benchmark + build viewer/data.json from a training run
userscript/      Tampermonkey script that plays the Token Alley arcade's 2048 cabinet
viewer/          the web page (index.html, engine.js, worker.js, engine.wasm, data)
```

## Running it

```sh
make            # native tools + viewer/engine.wasm (needs clang with wasm32 + wasm-ld)
make test

# train (resumable; SIGINT/SIGTERM saves a checkpoint)
mkdir -p runs/main && cd runs/main
../../build/train --threads 4 --hours 2 --tc --alpha 1.0 --out weights.bin
../../build/train --threads 4 --hours 2 --tc --alpha 1.0 --restarts 3 --stages 2 --resume weights.bin
cd ../..

# benchmark
build/play --weights runs/main/weights.bin --games 1000 --depth 1
build/play --weights runs/main/weights.bin --games 100 --depth 3
build/play --weights runs/main/weights.bin --games 10 --time 100   # 100 ms per move
build/play --weights runs/main/weights.bin --games 40 --depth 3 --extra 1   # deeper when few cells are empty

# package for the viewer, then serve viewer/ over HTTP
tools/release.sh runs/main
```

The viewer loads the network from `viewer/net-*.txt`: the gzipped sparse export,
base64-encoded and split into parts (the artifact host serves text, not raw binary).
