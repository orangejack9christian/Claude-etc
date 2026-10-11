// Sparse n-tuple network loaded from the export format (see export.cpp).
// Freestanding: no libc, so it also compiles to WebAssembly.
//
// Lookup is O(1): each pattern's 24-bit index splits into a 16-bit bucket and an
// 8-bit slot. A 256-bit occupancy bitmap per bucket plus a running count per
// 64-bit word gives the slot's position in the packed value array via popcount.
#pragma once
#include "game.h"

namespace g2048 {

struct SparseNet {
  static const int MAXP = 8;
  static const int NC = 6;
  int np = 0, nf = 0;
  uint8_t pat[MAXP][NC];
  float winit = 0;
  uint64_t games = 0;
  uint32_t count = 0;
  uint64_t* bits[MAXP];    // 65536 buckets x 4 words
  uint32_t* wbase[MAXP];   // value index of the first set bit of each word
  float* vals[MAXP];
  uint8_t shift[MAXP * 8][NC];
  uint8_t fpat[MAXP * 8];

  static uint32_t rd32(const uint8_t* p) { return p[0] | (p[1] << 8) | (p[2] << 16) | ((uint32_t)p[3] << 24); }
  static float rdf(const uint8_t* p) {
    uint32_t u = rd32(p);
    float f;
    __builtin_memcpy(&f, &u, 4);
    return f;
  }

  // alloc(bytes) must return zeroed, 8-byte aligned memory. Returns false on a bad file.
  template <class Alloc>
  bool load(const uint8_t* d, uint32_t len, Alloc alloc) {
    if (len < 16 || rd32(d) != 0x574B324E || rd32(d + 4) != 1) return false;
    np = (int)rd32(d + 8);
    if (np < 1 || np > MAXP || rd32(d + 12) != NC) return false;
    const uint8_t* p = d + 16;
    for (int i = 0; i < np; i++)
      for (int j = 0; j < NC; j++) pat[i][j] = *p++;
    winit = rdf(p);
    p += 4;
    games = (uint64_t)rd32(p) | ((uint64_t)rd32(p + 4) << 32);
    p += 8;
    uint32_t cnt[MAXP];
    float scale[MAXP];
    for (int i = 0; i < np; i++) {
      cnt[i] = rd32(p);
      scale[i] = rdf(p + 4);
      p += 8;
      count += cnt[i];
    }
    const uint8_t* q = p;  // int16 values
    for (int i = 0; i < np; i++) p += 2 * cnt[i];
    const uint8_t* end = d + len;
    if (p > end) return false;
    for (int i = 0; i < np; i++) {
      bits[i] = (uint64_t*)alloc(65536 * 4 * 8);
      wbase[i] = (uint32_t*)alloc(65536 * 4 * 4);
      vals[i] = (float*)alloc(cnt[i] * 4 + 4);
      uint32_t key = 0;
      for (uint32_t k = 0; k < cnt[i]; k++) {
        uint32_t delta = 0;
        int s = 0;
        uint8_t byte;
        do {
          if (p >= end) return false;
          byte = *p++;
          delta |= (uint32_t)(byte & 127) << s;
          s += 7;
        } while (byte & 128);
        key += delta;
        if (key >= (1u << 24)) return false;
        bits[i][key >> 6] |= 1ULL << (key & 63);
        int16_t v = (int16_t)(q[0] | (q[1] << 8));
        q += 2;
        vals[i][k] = winit + v * scale[i];
      }
      uint32_t run = 0;
      for (uint32_t w = 0; w < 65536 * 4; w++) {
        wbase[i][w] = run;
        run += __builtin_popcountll(bits[i][w]);
      }
    }
    // The 8 rotations/reflections of each pattern share its weights.
    nf = 0;
    for (int i = 0; i < np; i++) {
      for (int k = 0; k < 8; k++, nf++) {
        fpat[nf] = (uint8_t)i;
        for (int j = 0; j < NC; j++) {
          int r = pat[i][j] / 4, c = pat[i][j] % 4;
          if (k >= 4) c = 3 - c;
          for (int t = 0; t < k % 4; t++) {
            int nr = c, ncol = 3 - r;
            r = nr;
            c = ncol;
          }
          shift[nf][j] = (uint8_t)(16 * r + 4 * c);
        }
      }
    }
    return true;
  }

  inline float weight(int p, uint32_t idx) const {
    uint32_t w = idx >> 6;
    uint64_t word = bits[p][w];
    uint64_t bit = 1ULL << (idx & 63);
    if (!(word & bit)) return winit;
    return vals[p][wbase[p][w] + __builtin_popcountll(word & (bit - 1))];
  }

  inline float value(board_t b) const {
    float v = 0;
    for (int f = 0; f < nf; f++) {
      const uint8_t* s = shift[f];
      uint32_t idx = (uint32_t)((b >> s[0]) & 0xF) | ((uint32_t)((b >> s[1]) & 0xF) << 4) |
                     ((uint32_t)((b >> s[2]) & 0xF) << 8) | ((uint32_t)((b >> s[3]) & 0xF) << 12) |
                     ((uint32_t)((b >> s[4]) & 0xF) << 16) | ((uint32_t)((b >> s[5]) & 0xF) << 20);
      v += weight(fpat[f], idx);
    }
    return v;
  }
};

}  // namespace g2048
