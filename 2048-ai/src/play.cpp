// Play fresh games with the trained network plus expectimax search and report strength.
//
//   ./play --weights weights.bin --games 1000 --depth 1           raw network
//   ./play --weights weights.bin --games 100 --depth 3            fixed-depth search
//   ./play --net net.bin --games 20 --time 100                    100 ms per move, iterative deepening
// Options:
//   --weights F  full training checkpoint        --net F     sparse web export (what the viewer runs)
//   --prune K    drop weights updated < K times  --quant     round weights like the web export
//   --cut P      prune chance branches below probability P (default 1e-4)
//   --record F   write every game as JSON lines  --summary F write the result as JSON
// Endgame benchmark:
//   --dump-late F  append the board at the moment each game first makes a 16384 tile
//   --starts F     start game i from line i of F (one board per line, 16 hex digits)
//                  instead of an empty board; scores then count points from there on
#include <algorithm>
#include <atomic>
#include <chrono>
#include <cinttypes>
#include <cstdlib>
#include <memory>
#include <mutex>
#include <thread>

#include "ntuple.h"
#include "record.h"
#include "search.h"
#include "sparse.h"

using namespace g2048;

struct Options {
  std::string weights, net, record, summary, dump_late, starts;
  int games = 100, depth = 1, threads = 4, prune = 0, prune_late = -1, max_depth = 20, tt_bits = 22, extra = 0;
  double time_ms = 0;
  float cut = 1e-4f;
  bool quant = false;
  uint64_t seed = 12345;
};

static double now_ms() {
  return std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now().time_since_epoch()).count();
}

template <class Eval>
static int run(const Eval& ev, uint64_t trained, const Options& o) {
  std::string mode = o.time_ms > 0 ? "iterative deepening, " + std::to_string((int)o.time_ms) + " ms/move"
                                   : "depth " + std::to_string(o.depth) +
                                         (o.extra ? " (+" + std::to_string(o.extra) + " per critical level)" : "");
  printf("network trained on %" PRIu64 " games; %s; %d games\n", trained, mode.c_str(), o.games);
  fflush(stdout);
  std::atomic<int> next{0};
  std::mutex mu;
  std::vector<uint64_t> scores;
  std::vector<int> maxes;
  uint64_t total_moves = 0, total_nodes = 0, depth_sum = 0;
  double search_ms = 0;
  FILE* rf = o.record.empty() ? nullptr : fopen(o.record.c_str(), "w");
  FILE* df = o.dump_late.empty() ? nullptr : fopen(o.dump_late.c_str(), "a");
  std::vector<board_t> starts;
  if (!o.starts.empty()) {
    FILE* sf = fopen(o.starts.c_str(), "r");
    if (!sf) throw std::runtime_error("cannot open " + o.starts);
    char line[64];
    while (fgets(line, sizeof line, sf)) {
      board_t b = 0;
      for (int i = 0; i < 16 && line[i] && line[i] != '\n'; i++) {
        char c = line[i];
        b |= (board_t)(c <= '9' ? c - '0' : c - 'a' + 10) << (4 * i);
      }
      if (b) starts.push_back(b);
    }
    fclose(sf);
    printf("starting from %zu saved positions\n", starts.size());
  }
  double t0 = now_ms();
  auto worker = [&]() {
    std::unique_ptr<TTEntry[]> tt(new TTEntry[1u << o.tt_bits]);
    Expectimax<Eval> s;
    s.attach(&ev, tt.get(), 1u << o.tt_bits);
    s.cut = o.cut;
    for (;;) {
      int gi = next++;
      if (gi >= o.games) break;
      RNG rng(o.seed + gi * 0x9E3779B9ULL);
      GameRecord g;
      board_t b = starts.empty() ? initial_board(rng) : starts[gi % starts.size()];
      g.init = b;
      bool late_seen = Net::late(b);
      uint64_t nodes = 0, dsum = 0;
      double ms = 0;
      for (;;) {
        double ts = now_ms();
        SearchResult r = o.time_ms > 0 ? s.think(b, o.time_ms, o.max_depth, now_ms)
                         : o.extra   ? s.adaptive(b, o.depth, o.extra)
                                     : s.fixed(b, o.depth);
        ms += now_ms() - ts;
        if (r.dir < 0) break;
        nodes += r.nodes;
        dsum += r.depth;
        uint32_t rew;
        board_t a = do_move(b, r.dir, rew);
        g.score += rew;
        int pos = 0, val = 1;
        b = add_random_tile(a, rng, &pos, &val);
        g.add(r.dir, pos, val);
        if (df && !late_seen && Net::late(b)) {
          late_seen = true;
          char hex[17];
          for (int i = 0; i < 16; i++) hex[i] = "0123456789abcdef"[(b >> (4 * i)) & 0xF];
          hex[16] = 0;
          std::lock_guard<std::mutex> lk(mu);
          fprintf(df, "%s\n", hex);
          fflush(df);
        }
      }
      g.max_tile = max_tile(b);
      std::lock_guard<std::mutex> lk(mu);
      scores.push_back(g.score);
      maxes.push_back(g.max_tile);
      total_moves += g.steps.size();
      total_nodes += nodes;
      depth_sum += dsum;
      search_ms += ms;
      if (rf) {
        fprintf(rf, "%s\n",
                g.json("\"depth\":" + std::to_string(o.depth) + ",\"time_ms\":" + std::to_string((int)o.time_ms))
                    .c_str());
        fflush(rf);
      }
      if (o.games <= 50 || scores.size() % std::max(1, o.games / 10) == 0) {
        double sum = 0;
        for (auto v : scores) sum += v;
        printf("  game %3zu/%d: score %7" PRIu64 "  max %5d  moves %5zu  avg depth %.1f | running avg %.0f\n",
               scores.size(), o.games, g.score, 1 << g.max_tile, g.steps.size(),
               g.steps.empty() ? 0.0 : (double)dsum / g.steps.size(), sum / scores.size());
        fflush(stdout);
      }
    }
  };
  std::vector<std::thread> th;
  for (int t = 0; t < o.threads; t++) th.emplace_back(worker);
  for (auto& t : th) t.join();
  if (rf) fclose(rf);
  if (df) fclose(df);
  double secs = (now_ms() - t0) / 1000;

  std::vector<uint64_t> sorted = scores;
  std::sort(sorted.begin(), sorted.end());
  double avg = 0;
  for (auto s : scores) avg += s;
  avg /= scores.size();
  double ms_move = search_ms / std::max<uint64_t>(1, total_moves);
  double avg_depth = (double)depth_sum / std::max<uint64_t>(1, total_moves);
  double nps = total_nodes / std::max(1e-9, search_ms / 1000);
  printf("\nRESULT games=%zu avg=%.0f median=%" PRIu64 " max=%" PRIu64
         " ms/move=%.3f depth=%.2f nodes/s=%.0f wall=%.0fs\n",
         scores.size(), avg, sorted[sorted.size() / 2], sorted.back(), ms_move, avg_depth, nps, secs);
  double rate[16] = {0};
  for (int t = 11; t <= 15; t++) {
    int n = 0;
    for (int m : maxes) n += m >= t;
    rate[t] = (double)n / maxes.size();
    printf("  reached %5d: %6.2f%%\n", 1 << t, 100.0 * rate[t]);
  }
  if (!o.summary.empty()) {
    FILE* f = fopen(o.summary.c_str(), "w");
    fprintf(f,
            "{\"depth\":%d,\"extra\":%d,\"time_ms\":%.0f,\"cut\":%g,\"games\":%zu,\"avg\":%.1f,\"median\":%" PRIu64
            ",\"max\":%" PRIu64
            ",\"r2048\":%.4f,\"r4096\":%.4f,\"r8192\":%.4f,\"r16384\":%.4f,\"r32768\":%.4f,"
            "\"ms_per_move\":%.4f,\"avg_depth\":%.2f,\"nodes_per_sec\":%.0f}\n",
            o.depth, o.extra, o.time_ms, o.cut, scores.size(), avg, sorted[sorted.size() / 2], sorted.back(), rate[11],
            rate[12], rate[13], rate[14], rate[15], ms_move, avg_depth, nps);
    fclose(f);
  }
  return 0;
}

int main(int argc, char** argv) {
  Options o;
  for (int i = 1; i < argc; i++) {
    std::string a = argv[i];
    auto nxt = [&]() -> std::string {
      if (i + 1 >= argc) throw std::runtime_error("missing value for " + a);
      return argv[++i];
    };
    if (a == "--weights") o.weights = nxt();
    else if (a == "--net") o.net = nxt();
    else if (a == "--games") o.games = std::stoi(nxt());
    else if (a == "--depth") o.depth = std::stoi(nxt());
    else if (a == "--time") o.time_ms = std::stod(nxt());
    else if (a == "--max-depth") o.max_depth = std::stoi(nxt());
    else if (a == "--cut") o.cut = std::stof(nxt());
    else if (a == "--threads") o.threads = std::stoi(nxt());
    else if (a == "--record") o.record = nxt();
    else if (a == "--summary") o.summary = nxt();
    else if (a == "--prune") o.prune = std::stoi(nxt());
    else if (a == "--prune-late") o.prune_late = std::stoi(nxt());
    else if (a == "--quant") o.quant = true;
    else if (a == "--seed") o.seed = std::stoull(nxt());
    else if (a == "--tt-bits") o.tt_bits = std::stoi(nxt());
    else if (a == "--extra") o.extra = std::stoi(nxt());
    else if (a == "--dump-late") o.dump_late = nxt();
    else if (a == "--starts") o.starts = nxt();
    else {
      fprintf(stderr, "unknown option %s\n", a.c_str());
      return 1;
    }
  }
  init_tables();

  if (!o.net.empty()) {
    FILE* f = fopen(o.net.c_str(), "rb");
    if (!f) {
      fprintf(stderr, "cannot open %s\n", o.net.c_str());
      return 1;
    }
    std::vector<uint8_t> buf;
    uint8_t chunk[1 << 16];
    size_t n;
    while ((n = fread(chunk, 1, sizeof chunk, f)) > 0) buf.insert(buf.end(), chunk, chunk + n);
    fclose(f);
    static std::vector<std::unique_ptr<uint64_t[]>> blocks;
    SparseNet sn;
    bool ok = sn.load(buf.data(), (uint32_t)buf.size(), [](uint32_t bytes) -> void* {
      blocks.emplace_back(new uint64_t[(bytes + 7) / 8]());
      return blocks.back().get();
    });
    if (!ok) {
      fprintf(stderr, "bad network file %s\n", o.net.c_str());
      return 1;
    }
    printf("loaded sparse network: %u weights\n", sn.count);
    return run(sn, sn.games, o);
  }

  Net net;
  net.load(o.weights.empty() ? "weights.bin" : o.weights, o.prune > 0 ? 1 : 0);
  // Emulate the web export: per table, drop weights updated < prune times, then round to
  // int16 steps. Dropped main-stage weights become winit; dropped weights of a later stage
  // fall back to the (already rounded) weight of the stage before it.
  if (o.prune > 0 || o.quant) {
    size_t kept = 0;
    for (int t = 0; t < Net::NP * net.stages; t++) {
      size_t off = (size_t)t * Net::PSIZE;
      float* W = net.w.data() + off;
      const float* W0 = t >= Net::NP ? net.w.data() + off - Net::SIZE : nullptr;
      bool endgame = t >= Net::NP;
      std::vector<char> keep(Net::PSIZE, 1);
      int k = endgame && o.prune_late >= 0 ? o.prune_late : o.prune;
      if (k > 0)
        for (uint32_t i = 0; i < Net::PSIZE; i++) keep[i] = net.cnt[off + i] >= k;
      float mx = 0;
      for (uint32_t i = 0; i < Net::PSIZE; i++)
        if (keep[i]) mx = std::max(mx, std::fabs(W[i] - net.winit)), kept++;
      float scale = mx > 0 ? mx / 32767.f : 1.f;
      for (uint32_t i = 0; i < Net::PSIZE; i++) {
        if (keep[i]) {
          if (o.quant) W[i] = net.winit + std::round((W[i] - net.winit) / scale) * scale;
        } else {
          W[i] = endgame ? W0[i] : net.winit;
        }
      }
    }
    if (o.prune > 0) printf("prune < %d updates: kept %zu weights\n", o.prune, kept);
    net.cnt.clear();
  }
  return run(net, net.games, o);
}
