// N-tuple network: a wide, shallow neural network over board patterns.
//
// Each of the 4 patterns covers 6 cells. A pattern's 6 tile exponents form a
// 24-bit index into its own table of 16^6 weights (equivalently: a one-hot
// input layer feeding a single linear output). Every pattern is applied in
// all 8 rotations/reflections of the board with shared weights, so a board's
// value is the sum of 32 table lookups.
#pragma once
#include <cmath>
#include <cstdio>
#include <algorithm>
#include <cstring>
#include <stdexcept>
#include <string>
#include <vector>

#include "game.h"

namespace g2048 {

struct Net {
  static constexpr int NP = 4;          // patterns
  static constexpr int NI = 8;          // isomorphisms (4 rotations x 2 reflections)
  static constexpr int NC = 6;          // cells per pattern
  static constexpr int NF = NP * NI;    // active features per board
  static constexpr uint32_t PSIZE = 1u << (4 * NC);
  static constexpr size_t SIZE = (size_t)NP * PSIZE;  // weights per stage
  // Optional second stage: separate weights once a 16384 tile is on the board.
  static constexpr int STAGE_TILE = 14;
  static constexpr int PATTERNS[NP][NC] = {
      {0, 1, 2, 3, 4, 5},   // top row + two below
      {4, 5, 6, 7, 8, 9},   // second row + two below
      {0, 1, 2, 4, 5, 6},   // 2x3 block, corner
      {4, 5, 6, 8, 9, 10},  // 2x3 block, one row down
  };

  uint8_t shift[NF][NC];
  uint32_t base[NF];
  std::vector<float> w;          // weights
  std::vector<float> E, A;       // temporal-coherence accumulators (training only)
  std::vector<uint16_t> cnt;     // saturating update counts (training only)
  float winit = 0;               // initial value of every weight
  uint64_t games = 0;            // games trained so far
  bool tc = false;
  int stages = 1;

  // True once the board holds a tile of 2^14 or more: bits 1-3 of some nibble all set.
  static inline bool late(board_t b) { return (b & (b >> 1) & (b >> 2) & 0x2222222222222222ULL) != 0; }
  inline uint32_t stage_base(board_t b) const { return stages > 1 && late(b) ? (uint32_t)SIZE : 0; }

  Net() {
    for (int p = 0; p < NP; p++) {
      for (int k = 0; k < NI; k++) {
        int f = p * NI + k;
        base[f] = p * PSIZE;
        for (int j = 0; j < NC; j++) {
          int r = PATTERNS[p][j] / 4, c = PATTERNS[p][j] % 4;
          if (k >= 4) c = 3 - c;
          for (int t = 0; t < k % 4; t++) {
            int nr = c, nc = 3 - r;
            r = nr;
            c = nc;
          }
          shift[f][j] = (uint8_t)(16 * r + 4 * c);
        }
      }
    }
  }

  void alloc(bool training, bool use_tc, float vinit) {
    winit = vinit / NF;
    w.assign(SIZE, winit);
    tc = use_tc;
    if (training) {
      cnt.assign(SIZE, 0);
      if (tc) {
        E.assign(SIZE, 0.f);
        A.assign(SIZE, 0.f);
      }
    }
  }

  // Turn a one-stage network into two: the endgame stage starts as a copy of the
  // main weights, with fresh learning-rate accumulators and update counts.
  void add_endgame_stage() {
    if (stages != 1) return;
    w.resize(2 * SIZE);
    std::copy(w.begin(), w.begin() + SIZE, w.begin() + SIZE);
    if (!cnt.empty()) cnt.resize(2 * SIZE, 0);
    if (tc) {
      E.resize(2 * SIZE, 0.f);
      A.resize(2 * SIZE, 0.f);
    }
    stages = 2;
  }

  inline void ids(board_t b, uint32_t* out) const {
    for (int f = 0; f < NF; f++) {
      const uint8_t* s = shift[f];
      uint32_t idx = (uint32_t)((b >> s[0]) & 0xF) | ((uint32_t)((b >> s[1]) & 0xF) << 4) |
                     ((uint32_t)((b >> s[2]) & 0xF) << 8) | ((uint32_t)((b >> s[3]) & 0xF) << 12) |
                     ((uint32_t)((b >> s[4]) & 0xF) << 16) | ((uint32_t)((b >> s[5]) & 0xF) << 20);
      out[f] = base[f] + idx;
    }
    uint32_t sb = stage_base(b);
    if (sb)
      for (int f = 0; f < NF; f++) out[f] += sb;
  }

  inline float value(board_t b) const {
    uint32_t id[NF];
    ids(b, id);
    const float* W = w.data();
    float v = 0;
    for (int f = 0; f < NF; f++) v += W[id[f]];
    return v;
  }

  // Moves V(b) toward `target`; returns the new V(b).
  inline float learn(board_t b, float target, float alpha) {
    uint32_t id[NF];
    ids(b, id);
    float* W = w.data();
    float v = 0;
    for (int f = 0; f < NF; f++) v += W[id[f]];
    float err = target - v;
    float step = alpha * err / NF;
    float aerr = std::fabs(err);
    uint16_t* C = cnt.data();
    if (tc) {
      float* Ep = E.data();
      float* Ap = A.data();
      for (int f = 0; f < NF; f++) {
        uint32_t i = id[f];
        float a = Ap[i];
        float beta = a > 0 ? std::fabs(Ep[i]) / a : 1.f;
        W[i] += step * beta;
        Ep[i] += err;
        Ap[i] += aerr;
        if (C[i] != 0xFFFF) C[i]++;
      }
    } else {
      for (int f = 0; f < NF; f++) {
        W[id[f]] += step;
        if (C[id[f]] != 0xFFFF) C[id[f]]++;
      }
    }
    v = 0;
    for (int f = 0; f < NF; f++) v += W[id[f]];
    return v;
  }

  // ---- checkpoint I/O --------------------------------------------------
  struct Header {
    char magic[8];
    uint32_t np, ni, nc, has_tc;
    int32_t patterns[NP][NC];
    float winit;
    uint32_t stages;  // 0 in files written before stages existed
    uint64_t games;
  };

  void save(const std::string& path) const {
    std::string tmp = path + ".tmp";
    FILE* f = fopen(tmp.c_str(), "wb");
    if (!f) throw std::runtime_error("cannot write " + tmp);
    Header h;
    memset(&h, 0, sizeof h);
    memcpy(h.magic, "N2048CK1", 8);
    h.np = NP;
    h.ni = NI;
    h.nc = NC;
    h.has_tc = tc ? 1 : 0;
    memcpy(h.patterns, PATTERNS, sizeof h.patterns);
    h.winit = winit;
    h.stages = stages;
    h.games = games;
    size_t n = SIZE * stages;
    fwrite(&h, sizeof h, 1, f);
    fwrite(w.data(), sizeof(float), n, f);
    if (cnt.size() == n)
      fwrite(cnt.data(), sizeof(uint16_t), n, f);
    else {
      std::vector<uint16_t> z(n, 0);
      fwrite(z.data(), sizeof(uint16_t), n, f);
    }
    if (tc) {
      fwrite(E.data(), sizeof(float), n, f);
      fwrite(A.data(), sizeof(float), n, f);
    }
    fclose(f);
    if (rename(tmp.c_str(), path.c_str()) != 0) throw std::runtime_error("rename failed: " + path);
  }

  // what: 0 = weights only, 1 = + counts, 2 = everything (resume training)
  void load(const std::string& path, int what) {
    FILE* f = fopen(path.c_str(), "rb");
    if (!f) throw std::runtime_error("cannot open " + path);
    Header h;
    if (fread(&h, sizeof h, 1, f) != 1 || memcmp(h.magic, "N2048CK1", 8) != 0)
      throw std::runtime_error("bad checkpoint " + path);
    if (h.np != NP || h.nc != NC || memcmp(h.patterns, PATTERNS, sizeof h.patterns) != 0)
      throw std::runtime_error("checkpoint pattern mismatch");
    winit = h.winit;
    games = h.games;
    tc = h.has_tc != 0;
    stages = h.stages ? (int)h.stages : 1;
    size_t n = SIZE * stages;
    w.resize(n);
    if (fread(w.data(), sizeof(float), n, f) != n) throw std::runtime_error("short read");
    if (what >= 1) {
      cnt.resize(n);
      if (fread(cnt.data(), sizeof(uint16_t), n, f) != n) throw std::runtime_error("short read");
    } else if (fseek(f, (long)(sizeof(uint16_t) * n), SEEK_CUR) != 0) {
      throw std::runtime_error("seek failed");
    }
    if (what >= 2 && tc) {
      E.resize(n);
      A.resize(n);
      if (fread(E.data(), sizeof(float), n, f) != n) throw std::runtime_error("short read");
      if (fread(A.data(), sizeof(float), n, f) != n) throw std::runtime_error("short read");
    }
    fclose(f);
  }
};

// ---- search ---------------------------------------------------------------
// depth 1: greedy on reward + V(afterstate) (the raw network).
// depth d: reward + expectation over random tiles of the best depth d-1 move.
struct Searcher {
  const Net& net;
  explicit Searcher(const Net& n) : net(n) {}

  float chance(board_t after, int depth) const {
    board_t m = empty_mask(after);
    int n = __builtin_popcountll(m);
    if (!n) return 0;
    float sum = 0;
    while (m) {
      board_t bit = m & (~m + 1);
      m ^= bit;
      sum += 0.9f * max_node(after | bit, depth) + 0.1f * max_node(after | (bit * 2), depth);
    }
    return sum / n;
  }

  float max_node(board_t b, int depth) const {
    float best = 0;
    bool any = false;
    for (int d = 0; d < 4; d++) {
      uint32_t r;
      board_t a = do_move(b, d, r);
      if (a == b) continue;
      float v = r + (depth <= 1 ? net.value(a) : chance(a, depth - 1));
      if (!any || v > best) best = v, any = true;
    }
    return best;
  }

  // Returns the chosen direction, or -1 if the game is over. vals[d] gets each move's value.
  int choose(board_t b, int depth, float* vals = nullptr) const {
    int best_d = -1;
    float best = 0;
    for (int d = 0; d < 4; d++) {
      uint32_t r;
      board_t a = do_move(b, d, r);
      if (vals) vals[d] = NAN;
      if (a == b) continue;
      float v = r + (depth <= 1 ? net.value(a) : chance(a, depth - 1));
      if (vals) vals[d] = v;
      if (best_d < 0 || v > best) best = v, best_d = d;
    }
    return best_d;
  }
};

}  // namespace g2048
