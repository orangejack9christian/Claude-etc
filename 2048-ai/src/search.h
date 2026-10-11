// Expectimax search over the network's evaluation, in the spirit of a chess engine:
// iterative deepening under a time budget, a transposition table, and pruning of
// branches whose probability is too small to matter.
//
// Depth counts the player's moves: depth 1 picks the move with the best
// reward + V(afterstate); depth d averages over every random tile (2 at 90%,
// 4 at 10%, in every empty cell) and recurses with depth d-1.
// Freestanding: no libc, so it also compiles to WebAssembly.
#pragma once
#include "game.h"

namespace g2048 {

struct TTEntry {
  board_t board;
  float value;
  int32_t depth;
};

struct SearchResult {
  int dir = -1;         // best move, -1 if the game is over
  int depth = 0;        // deepest completed iteration
  float values[4];      // value of each move at that depth (NaN if illegal)
  uint64_t nodes = 0;   // positions expanded or evaluated
  double ms = 0;
};

template <class Eval>
struct Expectimax {
  const Eval* ev = nullptr;
  TTEntry* tt = nullptr;
  uint32_t tt_mask = 0;
  float cut = 1e-4f;  // stop expanding chance nodes reached with lower probability
  uint64_t nodes = 0;

  void attach(const Eval* e, TTEntry* table, uint32_t size_pow2) {
    ev = e;
    tt = table;
    tt_mask = size_pow2 - 1;
    clear();
  }
  void clear() {
    for (uint32_t i = 0; i <= tt_mask; i++) {
      tt[i].board = 0;
      tt[i].depth = -1;
    }
  }

  inline uint32_t slot(board_t b) const { return (uint32_t)((b * 0x9E3779B97F4A7C15ULL) >> 32) & tt_mask; }

  float chance(board_t after, int depth, float prob) {
    if (prob < cut) {
      nodes++;
      return ev->value(after);
    }
    TTEntry* e = &tt[slot(after)];
    if (e->board == after && e->depth >= depth) return e->value;
    board_t m = empty_mask(after);
    int n = __builtin_popcountll(m);
    float p2 = prob * 0.9f / n, p4 = prob * 0.1f / n;
    float sum = 0;
    while (m) {
      board_t bit = m & (~m + 1);
      m ^= bit;
      sum += 0.9f * max_node(after | bit, depth, p2) + 0.1f * max_node(after | (bit << 1), depth, p4);
    }
    float v = sum / n;
    e->board = after;
    e->value = v;
    e->depth = depth;
    return v;
  }

  float max_node(board_t b, int depth, float prob) {
    nodes++;
    float best = 0;  // no legal move: the game is over and earns nothing more
    bool any = false;
    for (int d = 0; d < 4; d++) {
      uint32_t r;
      board_t a = do_move(b, d, r);
      if (a == b) continue;
      float v = r + (depth <= 1 ? (nodes++, ev->value(a)) : chance(a, depth - 1, prob));
      if (!any || v > best) best = v, any = true;
    }
    return best;
  }

  int root(board_t b, int depth, float* vals) {
    int best_d = -1;
    for (int d = 0; d < 4; d++) {
      uint32_t r;
      board_t a = do_move(b, d, r);
      vals[d] = __builtin_nanf("");
      if (a == b) continue;
      nodes++;
      vals[d] = r + (depth <= 1 ? ev->value(a) : chance(a, depth - 1, 1.0f));
      if (best_d < 0 || vals[d] > vals[best_d]) best_d = d;
    }
    return best_d;
  }

  // Iterative deepening: search depth 1, 2, 3, ... and stop before an iteration
  // that is predicted to overrun the budget. budget_ms <= 0 means depth 1 only.
  template <class Clock>
  SearchResult think(board_t b, double budget_ms, int max_depth, Clock now_ms) {
    SearchResult res;
    double t0 = now_ms(), prev = 0;
    nodes = 0;
    for (int depth = 1; depth <= max_depth; depth++) {
      double ts = now_ms();
      float v[4];
      int dir = root(b, depth, v);
      double dt = now_ms() - ts;
      res.dir = dir;
      res.depth = depth;
      for (int i = 0; i < 4; i++) res.values[i] = v[i];
      if (dir < 0 || budget_ms <= 0) break;
      double elapsed = now_ms() - t0;
      double growth = prev > 0.05 ? dt / prev : 8.0;
      if (growth < 1.5) growth = 1.5;
      if (elapsed + dt * growth > budget_ms) break;
      prev = dt;
    }
    res.nodes = nodes;
    res.ms = now_ms() - t0;
    return res;
  }

  // Fixed depth plus extra depth in critical positions (few empty cells), where the
  // branching factor is small and a single wrong move can end the game.
  SearchResult adaptive(board_t b, int depth, int extra) {
    int empty = count_empty(b);
    int d = depth + (empty <= 4 ? extra : 0) + (empty <= 2 ? extra : 0);
    return fixed(b, d);
  }

  // Fixed depth, for reproducible benchmarks.
  SearchResult fixed(board_t b, int depth) {
    SearchResult res;
    nodes = 0;
    res.dir = root(b, depth, res.values);
    res.depth = depth;
    res.nodes = nodes;
    return res;
  }
};

}  // namespace g2048
