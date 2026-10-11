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
share the weights lock-free. After the first 506K games, training switched on the
restart strategy: each fresh game is followed by three games that start from the middle
of the previous one, so the endgame gets more practice.

**Search: expectimax.** Move nodes take the best move, chance nodes average over every
empty cell receiving a 2 (90%) or 4 (10%). Like a chess engine it uses iterative
deepening under a time budget, a transposition table, and skips chance branches whose
probability falls below 1e-4. The same C++ (`src/search.h`, `src/sparse.h`) runs natively
for benchmarks and as freestanding WebAssembly in the browser (`wasm/engine.cpp`).

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
viewer/          the web page (index.html, engine.js, worker.js, engine.wasm, data)
```

## Running it

```sh
make            # native tools + viewer/engine.wasm (needs clang with wasm32 + wasm-ld)
make test

# train (resumable; SIGINT/SIGTERM saves a checkpoint)
mkdir -p runs/main && cd runs/main
../../build/train --threads 4 --hours 2 --tc --alpha 1.0 --out weights.bin
../../build/train --threads 4 --hours 2 --tc --alpha 1.0 --restarts 3 --resume weights.bin
cd ../..

# benchmark
build/play --weights runs/main/weights.bin --games 1000 --depth 1
build/play --weights runs/main/weights.bin --games 100 --depth 3
build/play --weights runs/main/weights.bin --games 10 --time 100   # 100 ms per move

# package for the viewer, then serve viewer/ over HTTP
tools/release.sh runs/main
```

The viewer loads the network from `viewer/net-*.txt`: the gzipped sparse export,
base64-encoded and split into parts (the artifact host serves text, not raw binary).
