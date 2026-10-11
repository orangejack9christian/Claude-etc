// Game recording in a compact JSON line for the web viewer.
//   init:  16 hex digits, cell 0 (top-left) first, each the tile exponent
//   steps: base64 bytes, one per move: dir << 5 | spawn_cell << 1 | (spawn_is_4)
#pragma once
#include <string>
#include <vector>

#include "game.h"

namespace g2048 {

struct GameRecord {
  board_t init = 0;
  std::vector<uint8_t> steps;
  uint64_t score = 0;
  int max_tile = 0;

  void add(int dir, int pos, int val) { steps.push_back((uint8_t)((dir << 5) | (pos << 1) | (val - 1))); }

  static std::string b64(const std::vector<uint8_t>& in) {
    static const char* T = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string out;
    size_t i = 0;
    for (; i + 2 < in.size(); i += 3) {
      uint32_t v = (in[i] << 16) | (in[i + 1] << 8) | in[i + 2];
      out += T[v >> 18];
      out += T[(v >> 12) & 63];
      out += T[(v >> 6) & 63];
      out += T[v & 63];
    }
    if (i + 1 == in.size()) {
      uint32_t v = in[i] << 16;
      out += T[v >> 18];
      out += T[(v >> 12) & 63];
      out += "==";
    } else if (i + 2 == in.size()) {
      uint32_t v = (in[i] << 16) | (in[i + 1] << 8);
      out += T[v >> 18];
      out += T[(v >> 12) & 63];
      out += T[(v >> 6) & 63];
      out += '=';
    }
    return out;
  }

  std::string json(const std::string& extra) const {
    char hex[17];
    for (int i = 0; i < 16; i++) hex[i] = "0123456789abcdef"[(init >> (4 * i)) & 0xF];
    hex[16] = 0;
    std::string s = "{" + extra + (extra.empty() ? "" : ",");
    s += "\"score\":" + std::to_string(score) + ",\"max\":" + std::to_string(1 << max_tile) +
         ",\"moves\":" + std::to_string(steps.size()) + ",\"init\":\"" + hex + "\",\"steps\":\"" + b64(steps) +
         "\"}";
    return s;
  }
};

}  // namespace g2048
