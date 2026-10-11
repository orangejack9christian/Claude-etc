// WebAssembly build of the search engine for the browser viewer.
// Compiled freestanding (no libc): see the wasm target in the Makefile.
//
// JS usage (from viewer/worker.js):
//   init(); p = alloc(n); <copy network bytes to p>; load_net(p, n);
//   think(lo, hi, budget_ms, max_depth) -> best move; then read result_* exports.
// A board is passed as two 32-bit halves: cells 0-7 in lo, cells 8-15 in hi.
#include "../src/game.h"
#include "../src/search.h"
#include "../src/sparse.h"

using namespace g2048;

extern "C" {
__attribute__((import_module("env"), import_name("now"))) double js_now();

extern unsigned char __heap_base;

void* memset(void* d, int c, unsigned long n) {
  unsigned char* p = (unsigned char*)d;
  while (n--) *p++ = (unsigned char)c;
  return d;
}
void* memcpy(void* d, const void* s, unsigned long n) {
  unsigned char* p = (unsigned char*)d;
  const unsigned char* q = (const unsigned char*)s;
  while (n--) *p++ = *q++;
  return d;
}
}

static unsigned long heap_top = 0;

static void* bump(unsigned long bytes) {
  if (!heap_top) heap_top = (unsigned long)&__heap_base;
  heap_top = (heap_top + 15) & ~15UL;
  unsigned long p = heap_top;
  heap_top += bytes;
  unsigned long have = __builtin_wasm_memory_size(0) * 65536UL;
  if (heap_top > have) {
    unsigned long pages = (heap_top - have + 65535) / 65536;
    if (__builtin_wasm_memory_grow(0, pages) == (unsigned long)-1) return 0;
  }
  memset((void*)p, 0, bytes);  // fresh pages are zero, but reused memory may not be
  return (void*)p;
}

static SparseNet net;
static Expectimax<SparseNet> engine;
static SearchResult last;
static const unsigned TT_SIZE = 1u << 21;  // 32 MB

static double clock_ms() { return js_now(); }

extern "C" {

__attribute__((export_name("alloc"))) void* alloc(unsigned bytes) { return bump(bytes); }

__attribute__((export_name("init"))) void init() { init_tables(); }

// Returns the number of weights loaded, or 0 if the file is invalid.
__attribute__((export_name("load_net"))) unsigned load_net(const unsigned char* data, unsigned len) {
  if (!net.load(data, len, bump)) return 0;
  TTEntry* tt = (TTEntry*)bump(sizeof(TTEntry) * TT_SIZE);
  if (!tt) return 0;
  engine.attach(&net, tt, TT_SIZE);
  return net.count;
}

__attribute__((export_name("games_trained"))) double games_trained() { return (double)net.games; }

__attribute__((export_name("set_cut"))) void set_cut(float p) { engine.cut = p; }

__attribute__((export_name("clear_tt"))) void clear_tt() { engine.clear(); }

static board_t join(unsigned lo, unsigned hi) { return (board_t)lo | ((board_t)hi << 32); }

// Iterative deepening within budget_ms (<= 0: network only). Returns the best move or -1.
__attribute__((export_name("think"))) int think(unsigned lo, unsigned hi, double budget_ms, int max_depth) {
  last = engine.think(join(lo, hi), budget_ms, max_depth, clock_ms);
  return last.dir;
}

// Fixed-depth search.
__attribute__((export_name("search_depth"))) int search_depth(unsigned lo, unsigned hi, int depth) {
  double t0 = js_now();
  last = engine.fixed(join(lo, hi), depth);
  last.ms = js_now() - t0;
  return last.dir;
}

__attribute__((export_name("evaluate"))) float evaluate(unsigned lo, unsigned hi) { return net.value(join(lo, hi)); }

__attribute__((export_name("result_value"))) float result_value(int dir) { return last.values[dir & 3]; }
__attribute__((export_name("result_depth"))) int result_depth() { return last.depth; }
__attribute__((export_name("result_nodes"))) double result_nodes() { return (double)last.nodes; }
__attribute__((export_name("result_ms"))) double result_ms() { return last.ms; }
}
