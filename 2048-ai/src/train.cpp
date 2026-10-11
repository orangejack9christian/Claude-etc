// TD(0) afterstate learning for the n-tuple network, multi-threaded (lock-free
// shared weights). Each game is played greedily with the current network and then
// learned backwards from the final position.
//
//   ./train --threads 4 --hours 2 --tc --alpha 1.0 --out weights.bin --log train.csv
#include <atomic>
#include <csignal>
#include <chrono>
#include <cinttypes>
#include <mutex>
#include <thread>

#include "ntuple.h"
#include "record.h"

using namespace g2048;
using Clock = std::chrono::steady_clock;

struct Options {
  int threads = 4;
  double hours = 1.0;
  uint64_t max_games = UINT64_MAX;
  float alpha = 0.1f;
  bool tc = false;
  float oi = 0;  // optimistic initial board value
  int log_every = 1000;
  double ckpt_minutes = 20;
  uint64_t seed = 2048;
  std::string out = "weights.bin";
  std::string log = "train.csv";
  std::string games_out = "milestones.jsonl";
  std::string resume;
  int record_per_milestone = 3;
  int restarts = 0;  // games started from the middle of the previous one, per fresh game
  int stages = 1;    // 2: endgame weights once a 16384 tile is on the board; 3: also once 16384 + 8192
  double drills = 0; // share of games that start from a saved position with a fresh 16384 tile
};

static Options opt;
static Net net;
static std::atomic<uint64_t> games_done{0};
static std::atomic<uint64_t> moves_done{0};
static std::atomic<bool> stop{false};
static Clock::time_point t0;
static double elapsed_offset = 0;

static std::mutex stat_mu;
struct Window {
  uint64_t n = 0, score = 0, max_score = 0, moves = 0;
  uint64_t reach[16] = {0};
} win;
// Endgame drills since the last log line: games, how many made 32768, points scored.
struct Drills {
  uint64_t n = 0, r32768 = 0, gain = 0;
} drill_win;
static FILE* log_file = nullptr;
static uint64_t last_log_moves = 0;
static double last_log_time = 0;

static double now_s() { return elapsed_offset + std::chrono::duration<double>(Clock::now() - t0).count(); }

static std::vector<uint64_t> milestones = {0,     100,    300,    1000,    3000,    10000,   30000,
                                           100000, 300000, 1000000, 3000000, 10000000};
static std::atomic<size_t> next_milestone{0};
static std::mutex rec_mu;

static GameRecord play_greedy(RNG& rng) {
  GameRecord g;
  board_t b = initial_board(rng);
  g.init = b;
  Searcher s(net);
  for (;;) {
    int d = s.choose(b, 1);
    if (d < 0) break;
    uint32_t r;
    board_t a = do_move(b, d, r);
    g.score += r;
    int pos = 0, val = 1;
    b = add_random_tile(a, rng, &pos, &val);
    g.add(d, pos, val);
  }
  g.max_tile = max_tile(b);
  return g;
}

static void maybe_record(uint64_t done, RNG& rng) {
  size_t i = next_milestone.load();
  if (i >= milestones.size() || done < milestones[i]) return;
  // Claim every milestone we have passed, record only the latest.
  size_t j = i;
  while (j + 1 < milestones.size() && done >= milestones[j + 1]) j++;
  if (!next_milestone.compare_exchange_strong(i, j + 1)) return;
  std::vector<std::string> lines;
  for (int k = 0; k < opt.record_per_milestone; k++) {
    GameRecord g = play_greedy(rng);
    lines.push_back(g.json("\"trained\":" + std::to_string(done)));
  }
  std::lock_guard<std::mutex> lk(rec_mu);
  FILE* f = fopen(opt.games_out.c_str(), "a");
  for (auto& l : lines) fprintf(f, "%s\n", l.c_str());
  fclose(f);
}

static void report_drill(uint64_t gain, int maxt) {
  std::lock_guard<std::mutex> lk(stat_mu);
  drill_win.n++;
  drill_win.gain += gain;
  if (maxt >= 15) drill_win.r32768++;
}

static void report_game(uint64_t score, int maxt, uint64_t moves) {
  std::lock_guard<std::mutex> lk(stat_mu);
  win.n++;
  win.score += score;
  win.max_score = std::max(win.max_score, score);
  win.moves += moves;
  for (int t = 1; t <= maxt; t++) win.reach[t]++;
  if ((int)win.n < opt.log_every) return;
  double t = now_s();
  uint64_t md = moves_done.load();
  double mps = (md - last_log_moves) / std::max(1e-9, t - last_log_time);
  last_log_moves = md;
  last_log_time = t;
  double n = (double)win.n;
  double dn = std::max<uint64_t>(1, drill_win.n);
  fprintf(log_file, "%" PRIu64 ",%.1f,%.1f,%" PRIu64 ",%.1f,%.4f,%.4f,%.4f,%.4f,%.4f,%.4f,%.0f,%" PRIu64 ",%.4f,%.0f\n",
          games_done.load(), t, win.score / n, win.max_score, win.moves / n, win.reach[11] / n, win.reach[12] / n,
          win.reach[13] / n, win.reach[14] / n, win.reach[15] / n, win.reach[10] / n, mps, drill_win.n,
          drill_win.r32768 / dn, drill_win.gain / dn);
  fflush(log_file);
  printf("games %9" PRIu64 "  t %7.0fs  avg %8.0f  max %7" PRIu64 "  2048 %5.1f%%  4096 %5.1f%%  8192 %5.1f%%  "
         "16384 %5.1f%%  32768 %5.1f%%  %.0f moves/s",
         games_done.load(), t, win.score / n, win.max_score, 100 * win.reach[11] / n, 100 * win.reach[12] / n,
         100 * win.reach[13] / n, 100 * win.reach[14] / n, 100 * win.reach[15] / n, mps);
  if (drill_win.n)
    printf("  | drills %" PRIu64 ": 32768 %.1f%%, +%.0f pts", drill_win.n, 100 * drill_win.r32768 / dn,
           drill_win.gain / dn);
  printf("\n");
  fflush(stdout);
  win = Window();
  drill_win = Drills();
}

static void worker(int tid) {
  RNG rng(opt.seed * 1000003ULL + tid * 7919ULL + net.games);
  RNG rec_rng(opt.seed * 31ULL + tid + 17);
  std::vector<std::pair<board_t, uint32_t>> path;
  std::vector<board_t> states;  // position before each move
  path.reserve(1 << 16);
  states.reserve(1 << 16);
  board_t restart_from = 0;
  int restarts_left = 0;
  // Endgame drills: positions where a game first made a 16384 tile, replayed with fresh
  // random tiles so the network practises the hardest part of the game far more often.
  std::vector<board_t> pool;
  const size_t POOL = 4096;
  while (!stop.load(std::memory_order_relaxed)) {
    // Restart strategy: after a fresh game, the next few games start from the middle
    // of the previous one, so the endgame gets more practice.
    bool drill = false;
    board_t b;
    if (restart_from) {
      b = restart_from;
    } else if (!pool.empty() && rng.below(1000000) < opt.drills * 1000000) {
      b = pool[rng.below(pool.size())];
      drill = true;
    } else {
      b = initial_board(rng);
      restarts_left = opt.restarts;
    }
    bool fresh = !restart_from && !drill;
    restart_from = 0;
    bool late_seen = Net::late(b);
    uint64_t score = 0;
    path.clear();
    states.clear();
    for (;;) {
      if (!late_seen && Net::late(b)) {
        late_seen = true;
        if (pool.size() < POOL) pool.push_back(b);
        else pool[rng.below(POOL)] = b;
      }
      float best = 0;
      board_t best_a = 0;
      uint32_t best_r = 0;
      bool any = false;
      for (int d = 0; d < 4; d++) {
        uint32_t r;
        board_t a = do_move(b, d, r);
        if (a == b) continue;
        float v = r + net.value(a);
        if (!any || v > best) best = v, best_a = a, best_r = r, any = true;
      }
      if (!any) break;
      states.push_back(b);
      path.push_back({best_a, best_r});
      score += best_r;
      b = add_random_tile(best_a, rng);
    }
    float target = 0;
    for (size_t t = path.size(); t-- > 0;) {
      float nv = net.learn(path[t].first, target, opt.alpha);
      target = path[t].second + nv;
    }
    if (!drill && restarts_left > 0 && path.size() >= 200) {
      restart_from = states[path.size() / 2];
      restarts_left--;
    }
    moves_done += path.size();
    uint64_t done = ++games_done;
    if (fresh) report_game(score, max_tile(b), path.size());  // stats cover full games only
    else if (drill) report_drill(score, max_tile(b));
    if (tid == 0) maybe_record(done, rec_rng);
    if (done >= opt.max_games || now_s() >= opt.hours * 3600) stop = true;
  }
}

static void on_signal(int) { stop = true; }

int main(int argc, char** argv) {
  signal(SIGINT, on_signal);
  signal(SIGTERM, on_signal);
  for (int i = 1; i < argc; i++) {
    std::string a = argv[i];
    auto nxt = [&]() -> std::string {
      if (i + 1 >= argc) throw std::runtime_error("missing value for " + a);
      return argv[++i];
    };
    if (a == "--threads") opt.threads = std::stoi(nxt());
    else if (a == "--hours") opt.hours = std::stod(nxt());
    else if (a == "--games") opt.max_games = std::stoull(nxt());
    else if (a == "--alpha") opt.alpha = std::stof(nxt());
    else if (a == "--tc") opt.tc = true;
    else if (a == "--oi") opt.oi = std::stof(nxt());
    else if (a == "--log-every") opt.log_every = std::stoi(nxt());
    else if (a == "--ckpt-minutes") opt.ckpt_minutes = std::stod(nxt());
    else if (a == "--seed") opt.seed = std::stoull(nxt());
    else if (a == "--out") opt.out = nxt();
    else if (a == "--log") opt.log = nxt();
    else if (a == "--games-out") opt.games_out = nxt();
    else if (a == "--resume") opt.resume = nxt();
    else if (a == "--record") opt.record_per_milestone = std::stoi(nxt());
    else if (a == "--restarts") opt.restarts = std::stoi(nxt());
    else if (a == "--stages") opt.stages = std::stoi(nxt());
    else if (a == "--drills") opt.drills = std::stod(nxt());
    else {
      fprintf(stderr, "unknown option %s\n", a.c_str());
      return 1;
    }
  }
  init_tables();
  bool appending = false;
  if (!opt.resume.empty()) {
    net.load(opt.resume, 2);
    if (net.tc != opt.tc) {
      fprintf(stderr, "resume: --tc must match the checkpoint\n");
      return 1;
    }
    if (net.tc && net.E.empty()) return 1;
    if (net.cnt.empty()) net.cnt.assign(Net::SIZE, 0);
    games_done = net.games;
    // Skip milestones already passed.
    while (next_milestone < milestones.size() && milestones[next_milestone] <= net.games) next_milestone++;
    appending = true;
    printf("resumed %s at %" PRIu64 " games\n", opt.resume.c_str(), net.games);
  } else {
    net.alloc(true, opt.tc, opt.oi);
  }
  while (net.stages < opt.stages && net.stages < 3) {
    net.add_stage();
    printf("added stage %d at %" PRIu64 " games\n", net.stages - 1, net.games);
  }
  log_file = fopen(opt.log.c_str(), appending ? "a" : "w");
  if (!appending) {
    fprintf(log_file,
            "games,seconds,avg_score,max_score,avg_moves,r2048,r4096,r8192,r16384,r32768,r1024,moves_per_sec,"
            "drills,drill_r32768,drill_gain\n");
    fflush(log_file);
    remove(opt.games_out.c_str());
  } else {
    // Continue the time axis of the existing log.
    FILE* f = fopen(opt.log.c_str(), "r");
    char line[512];
    while (fgets(line, sizeof line, f)) {
      double s;
      unsigned long long g;
      if (sscanf(line, "%llu,%lf", &g, &s) == 2) elapsed_offset = s;
    }
    fclose(f);
    opt.hours += elapsed_offset / 3600;
  }
  t0 = Clock::now();
  last_log_time = now_s();
  printf("training: threads=%d alpha=%.3f tc=%d oi=%.0f restarts=%d stages=%d drills=%.2f hours=%.2f\n", opt.threads,
         opt.alpha, opt.tc, opt.oi, opt.restarts, net.stages, opt.drills, opt.hours);
  fflush(stdout);

  if (next_milestone == 0) {
    RNG rec_rng(opt.seed * 31ULL + 5);
    maybe_record(0, rec_rng);  // the untrained network
  }
  std::vector<std::thread> th;
  for (int t = 0; t < opt.threads; t++) th.emplace_back(worker, t);
  double last_ckpt = now_s();
  while (!stop) {
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    if (now_s() - last_ckpt >= opt.ckpt_minutes * 60) {
      net.games = games_done;
      net.save(opt.out);
      last_ckpt = now_s();
      printf("checkpoint saved at %" PRIu64 " games\n", net.games);
      fflush(stdout);
    }
  }
  for (auto& t : th) t.join();
  net.games = games_done;
  net.save(opt.out);
  // Always record the final network too.
  {
    RNG rng(opt.seed + 99);
    FILE* f = fopen(opt.games_out.c_str(), "a");
    for (int k = 0; k < opt.record_per_milestone; k++)
      fprintf(f, "%s\n", play_greedy(rng).json("\"trained\":" + std::to_string(net.games)).c_str());
    fclose(f);
  }
  fclose(log_file);
  printf("done: %" PRIu64 " games, saved %s\n", net.games, opt.out.c_str());
  return 0;
}
