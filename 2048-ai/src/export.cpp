// Export a checkpoint as a compact sparse file for the web viewer.
//
//   ./export --weights weights.bin --prune 4 --out net.bin    (then gzip it)
//
// Layout (little-endian):
//   "N2KW" u32 version=1  u32 np  u32 nc  u8 patterns[np][nc]  f32 winit  u64 games
//   per pattern: u32 count, f32 scale
//   per pattern: i16 value[count]      weight = winit + value * scale
//   per pattern: LEB128 key deltas     sorted 24-bit table indices
// Weights updated fewer than --prune times are dropped (read back as winit).
#include <cinttypes>

#include "ntuple.h"

using namespace g2048;

int main(int argc, char** argv) {
  std::string weights = "weights.bin", out = "net.bin", meta;
  int prune = 1;
  for (int i = 1; i < argc; i++) {
    std::string a = argv[i];
    if (a == "--weights") weights = argv[++i];
    else if (a == "--out") out = argv[++i];
    else if (a == "--prune") prune = std::stoi(argv[++i]);
    else if (a == "--meta") meta = argv[++i];
    else {
      fprintf(stderr, "unknown option %s\n", a.c_str());
      return 1;
    }
  }
  Net net;
  net.load(weights, 1);
  FILE* f = fopen(out.c_str(), "wb");
  uint32_t hdr[4] = {0x574B324E /* "N2KW" */, 1, Net::NP, Net::NC};
  fwrite(hdr, 4, 4, f);
  for (int p = 0; p < Net::NP; p++)
    for (int j = 0; j < Net::NC; j++) fputc(Net::PATTERNS[p][j], f);
  fwrite(&net.winit, 4, 1, f);
  fwrite(&net.games, 8, 1, f);

  std::vector<std::vector<uint32_t>> keys(Net::NP);
  std::vector<float> scale(Net::NP);
  size_t total = 0;
  for (int p = 0; p < Net::NP; p++) {
    const float* W = net.w.data() + (size_t)p * Net::PSIZE;
    const uint16_t* C = net.cnt.data() + (size_t)p * Net::PSIZE;
    float mx = 0;
    for (uint32_t i = 0; i < Net::PSIZE; i++) {
      if (C[i] >= prune && W[i] != net.winit) {
        keys[p].push_back(i);
        mx = std::max(mx, std::fabs(W[i] - net.winit));
      }
    }
    scale[p] = mx > 0 ? mx / 32767.f : 1.f;
    uint32_t n = keys[p].size();
    fwrite(&n, 4, 1, f);
    fwrite(&scale[p], 4, 1, f);
    total += n;
    printf("pattern %d: %u weights, scale %.4f\n", p, n, scale[p]);
  }
  for (int p = 0; p < Net::NP; p++) {
    const float* W = net.w.data() + (size_t)p * Net::PSIZE;
    std::vector<int16_t> q;
    q.reserve(keys[p].size());
    for (uint32_t i : keys[p]) q.push_back((int16_t)std::lround((W[i] - net.winit) / scale[p]));
    fwrite(q.data(), 2, q.size(), f);
  }
  for (int p = 0; p < Net::NP; p++) {
    uint32_t prev = 0;
    std::vector<uint8_t> buf;
    for (uint32_t k : keys[p]) {
      uint32_t d = k - prev;
      prev = k;
      while (d >= 0x80) {
        buf.push_back((uint8_t)(d | 0x80));
        d >>= 7;
      }
      buf.push_back((uint8_t)d);
    }
    fwrite(buf.data(), 1, buf.size(), f);
  }
  long size = ftell(f);
  fclose(f);
  size_t touched = 0;
  for (size_t i = 0; i < Net::SIZE; i++) touched += net.cnt[i] > 0;
  printf("wrote %s: %zu weights (of %zu ever updated), %.1f MB (trained %" PRIu64 " games)\n", out.c_str(), total,
         touched, size / 1e6, net.games);
  if (!meta.empty()) {
    FILE* m = fopen(meta.c_str(), "w");
    fprintf(m, "{\"weights\":%zu,\"touched\":%zu,\"shipped\":%zu,\"games\":%" PRIu64 ",\"prune\":%d,\"patterns\":[",
            Net::SIZE, touched, total, net.games, prune);
    for (int p = 0; p < Net::NP; p++) {
      fprintf(m, "%s[", p ? "," : "");
      for (int j = 0; j < Net::NC; j++) fprintf(m, "%s%d", j ? "," : "", Net::PATTERNS[p][j]);
      fprintf(m, "]");
    }
    fprintf(m, "]}\n");
    fclose(m);
  }
  return 0;
}
