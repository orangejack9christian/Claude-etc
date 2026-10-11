// 2048 game engine on a 64-bit bitboard.
//
// Cell (r, c) lives in bits [16r + 4c, 16r + 4c + 4). Row 0 is the top row,
// column 0 is the leftmost column. A cell holds the tile's exponent
// (0 = empty, 1 = 2, 2 = 4, ..., 15 = 32768).
#pragma once
#include <stdint.h>

namespace g2048 {

typedef uint64_t board_t;

enum { UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3 };

// xoshiro256** seeded through splitmix64.
struct RNG {
  uint64_t s[4];
  explicit RNG(uint64_t seed = 1) { reseed(seed); }
  void reseed(uint64_t seed) {
    for (int i = 0; i < 4; i++) {
      seed += 0x9E3779B97F4A7C15ULL;
      uint64_t z = seed;
      z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9ULL;
      z = (z ^ (z >> 27)) * 0x94D049BB133111EBULL;
      s[i] = z ^ (z >> 31);
    }
  }
  static inline uint64_t rotl(uint64_t x, int k) { return (x << k) | (x >> (64 - k)); }
  inline uint64_t next() {
    uint64_t r = rotl(s[1] * 5, 7) * 9;
    uint64_t t = s[1] << 17;
    s[2] ^= s[0];
    s[3] ^= s[1];
    s[1] ^= s[2];
    s[0] ^= s[3];
    s[2] ^= t;
    s[3] = rotl(s[3], 45);
    return r;
  }
  inline uint32_t below(uint32_t n) { return (uint32_t)(((next() >> 32) * (uint64_t)n) >> 32); }
};

inline uint16_t ROW_LEFT[65536];
inline uint16_t ROW_RIGHT[65536];
inline uint32_t ROW_SCORE[65536];  // merge reward; identical for left and right

inline uint16_t pack_row(const int* v) { return (uint16_t)(v[0] | (v[1] << 4) | (v[2] << 8) | (v[3] << 12)); }

inline uint16_t slide_left(const int* in, uint32_t* score) {
  int out[4] = {0, 0, 0, 0};
  int n = 0, pending = 0;
  uint32_t sc = 0;
  for (int i = 0; i < 4; i++) {
    int t = in[i];
    if (!t) continue;
    if (pending && pending == t && t < 15) {
      out[n++] = t + 1;
      sc += 1u << (t + 1);
      pending = 0;
    } else {
      if (pending) out[n++] = pending;
      pending = t;
    }
  }
  if (pending) out[n++] = pending;
  if (score) *score = sc;
  return pack_row(out);
}

inline void init_tables() {
  for (uint32_t row = 0; row < 65536; row++) {
    int line[4], rev[4];
    for (int i = 0; i < 4; i++) line[i] = (row >> (4 * i)) & 0xF;
    for (int i = 0; i < 4; i++) rev[i] = line[3 - i];
    uint32_t sc;
    ROW_LEFT[row] = slide_left(line, &sc);
    ROW_SCORE[row] = sc;
    uint16_t r = slide_left(rev, nullptr);
    int back[4];
    for (int i = 0; i < 4; i++) back[i] = (r >> (4 * (3 - i))) & 0xF;
    ROW_RIGHT[row] = pack_row(back);
  }
}

inline board_t transpose(board_t x) {
  board_t a1 = x & 0xF0F00F0FF0F00F0FULL;
  board_t a2 = x & 0x0000F0F00000F0F0ULL;
  board_t a3 = x & 0x0F0F00000F0F0000ULL;
  board_t a = a1 | (a2 << 12) | (a3 >> 12);
  board_t b1 = a & 0xFF00FF0000FF00FFULL;
  board_t b2 = a & 0x00FF00FF00000000ULL;
  board_t b3 = a & 0x00000000FF00FF00ULL;
  return b1 | (b2 >> 24) | (b3 << 24);
}

inline board_t move_rows(board_t b, const uint16_t* T) {
  return (board_t)T[b & 0xFFFF] | ((board_t)T[(b >> 16) & 0xFFFF] << 16) |
         ((board_t)T[(b >> 32) & 0xFFFF] << 32) | ((board_t)T[b >> 48] << 48);
}

inline uint32_t score_rows(board_t b) {
  return ROW_SCORE[b & 0xFFFF] + ROW_SCORE[(b >> 16) & 0xFFFF] + ROW_SCORE[(b >> 32) & 0xFFFF] +
         ROW_SCORE[b >> 48];
}

// Slides the board; returns the afterstate (before the random tile) and the merge reward.
inline board_t do_move(board_t b, int dir, uint32_t& reward) {
  switch (dir) {
    case LEFT:
      reward = score_rows(b);
      return move_rows(b, ROW_LEFT);
    case RIGHT:
      reward = score_rows(b);
      return move_rows(b, ROW_RIGHT);
    case UP: {
      board_t t = transpose(b);
      reward = score_rows(t);
      return transpose(move_rows(t, ROW_LEFT));
    }
    default: {
      board_t t = transpose(b);
      reward = score_rows(t);
      return transpose(move_rows(t, ROW_RIGHT));
    }
  }
}

// One bit (the low bit of the nibble) set for every empty cell.
inline board_t empty_mask(board_t x) {
  x |= (x >> 2) & 0x3333333333333333ULL;
  x |= (x >> 1);
  return ~x & 0x1111111111111111ULL;
}

inline int count_empty(board_t b) { return __builtin_popcountll(empty_mask(b)); }

inline board_t add_random_tile(board_t b, RNG& rng, int* pos = nullptr, int* val = nullptr) {
  board_t m = empty_mask(b);
  int n = __builtin_popcountll(m);
  if (!n) return b;
  int k = rng.below(n);
  while (k--) m &= m - 1;
  board_t bit = m & (~m + 1);
  int tile = rng.below(10) == 0 ? 2 : 1;
  if (pos) *pos = __builtin_ctzll(bit) / 4;
  if (val) *val = tile;
  return b | (bit * (board_t)tile);
}

inline board_t initial_board(RNG& rng) { return add_random_tile(add_random_tile(0, rng), rng); }

inline int max_tile(board_t b) {
  int m = 0;
  for (int i = 0; i < 16; i++, b >>= 4) m = (int)(b & 0xF) > m ? (int)(b & 0xF) : m;
  return m;
}

inline bool can_move(board_t b) {
  for (int d = 0; d < 4; d++) {
    uint32_t r;
    if (do_move(b, d, r) != b) return true;
  }
  return false;
}

}  // namespace g2048
