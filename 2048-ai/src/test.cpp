// Sanity checks for the bitboard engine against a naive array implementation.
#include <cassert>
#include <cstdio>

#include "ntuple.h"

using namespace g2048;

static int cell(board_t b, int r, int c) { return (b >> (16 * r + 4 * c)) & 0xF; }

// Naive move on a 4x4 grid; dir 0 up, 1 right, 2 down, 3 left.
static board_t naive_move(board_t b, int dir, uint32_t& score) {
  int g[4][4];
  for (int r = 0; r < 4; r++)
    for (int c = 0; c < 4; c++) g[r][c] = cell(b, r, c);
  score = 0;
  int out[4][4] = {};
  for (int line = 0; line < 4; line++) {
    int v[4];
    for (int k = 0; k < 4; k++) {
      // k-th cell along the direction of travel (k = 0 is the wall we slide toward)
      int r, c;
      if (dir == 0) r = k, c = line;
      else if (dir == 2) r = 3 - k, c = line;
      else if (dir == 3) r = line, c = k;
      else r = line, c = 3 - k;
      v[k] = g[r][c];
    }
    int res[4] = {}, n = 0, pending = 0;
    for (int k = 0; k < 4; k++) {
      if (!v[k]) continue;
      if (pending && pending == v[k] && v[k] < 15) {
        res[n++] = v[k] + 1;
        score += 1u << (v[k] + 1);
        pending = 0;
      } else {
        if (pending) res[n++] = pending;
        pending = v[k];
      }
    }
    if (pending) res[n++] = pending;
    for (int k = 0; k < 4; k++) {
      int r, c;
      if (dir == 0) r = k, c = line;
      else if (dir == 2) r = 3 - k, c = line;
      else if (dir == 3) r = line, c = k;
      else r = line, c = 3 - k;
      out[r][c] = res[k];
    }
  }
  board_t o = 0;
  for (int r = 0; r < 4; r++)
    for (int c = 0; c < 4; c++) o |= (board_t)out[r][c] << (16 * r + 4 * c);
  return o;
}

int main() {
  init_tables();
  RNG rng(7);
  for (int it = 0; it < 2000000; it++) {
    board_t b = 0;
    for (int i = 0; i < 16; i++) {
      int t = rng.below(5) ? rng.below(6) : rng.below(16);
      b |= (board_t)t << (4 * i);
    }
    for (int d = 0; d < 4; d++) {
      uint32_t s1, s2;
      board_t a1 = do_move(b, d, s1), a2 = naive_move(b, d, s2);
      if (a1 != a2 || s1 != s2) {
        printf("mismatch board %016llx dir %d: %016llx/%u vs %016llx/%u\n", (unsigned long long)b, d,
               (unsigned long long)a1, s1, (unsigned long long)a2, s2);
        return 1;
      }
    }
    int e = 0;
    for (int i = 0; i < 16; i++) e += ((b >> (4 * i)) & 0xF) == 0;
    assert(count_empty(b) == e);
  }
  // Spawn statistics.
  int fours = 0, N = 1000000;
  for (int i = 0; i < N; i++) {
    int pos, val;
    board_t b = add_random_tile(0x1111000011110000ULL, rng, &pos, &val);
    assert(((0x1111000011110000ULL >> (4 * pos)) & 0xF) == 0);
    assert(((b >> (4 * pos)) & 0xF) == (board_t)val);
    fours += val == 2;
  }
  printf("4-tile rate %.4f (expect 0.1)\n", fours / (double)N);
  // Isomorphisms are 8 distinct cell mappings for each pattern.
  Net net;
  for (int p = 0; p < Net::NP; p++)
    for (int a = 0; a < Net::NI; a++)
      for (int b = a + 1; b < Net::NI; b++)
        assert(memcmp(net.shift[p * 8 + a], net.shift[p * 8 + b], Net::NC) != 0);
  printf("all tests passed\n");
  return 0;
}
