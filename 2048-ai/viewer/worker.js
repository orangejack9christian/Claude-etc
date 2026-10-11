// Runs the search engine off the main thread so long searches never freeze the board.
// Uses the WebAssembly engine; falls back to the plain JS search (fixed depth) if
// WebAssembly is unavailable.
'use strict';
let ex = null;   // wasm exports
let jsNet = null;

function pack(b) {
  let lo = 0, hi = 0;
  for (let i = 0; i < 8; i++) { lo |= b[i] << (4 * i); hi |= b[i + 8] << (4 * i); }
  return [lo >>> 0, hi >>> 0];
}

async function init(m) {
  const net = new Uint8Array(m.net);
  try {
    const { instance } = await WebAssembly.instantiate(m.wasm, { env: { now: () => performance.now() } });
    ex = instance.exports;
    ex.init();
    const p = ex.alloc(net.length);
    if (!p) throw new Error('not enough memory for the network');
    new Uint8Array(ex.memory.buffer, p, net.length).set(net);
    const count = ex.load_net(p, net.length);
    if (!count) throw new Error('the network file is invalid');
    return { type: 'ready', engine: 'wasm', count, games: ex.games_trained() };
  } catch (err) {
    ex = null;
    importScripts('engine.js');
    jsNet = new self.G2048.Network(net.buffer.slice(net.byteOffset, net.byteOffset + net.byteLength));
    return { type: 'ready', engine: 'js', count: jsNet.count, games: jsNet.games, note: String(err.message || err) };
  }
}

function think(m) {
  if (ex) {
    const [lo, hi] = pack(m.board);
    // think_critical spends extra time when the board is tight (older engine files lack it).
    const think = ex.think_critical || ex.think;
    const dir = m.depth ? ex.search_depth(lo, hi, m.depth) : think(lo, hi, m.budget, m.maxDepth || 30);
    return {
      dir, values: [0, 1, 2, 3].map((d) => ex.result_value(d)),
      depth: ex.result_depth(), nodes: ex.result_nodes(), ms: ex.result_ms(),
    };
  }
  // Fallback: fixed depth chosen from the budget.
  const depth = m.depth || (m.budget <= 0 ? 1 : m.budget < 50 ? 2 : 3);
  const t0 = performance.now();
  const r = self.G2048.chooseMove(jsNet, m.board, depth);
  return { dir: r.dir, values: r.values, depth, nodes: 0, ms: performance.now() - t0 };
}

self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === 'init') postMessage(await init(m));
    else if (m.type === 'think') postMessage({ type: 'result', id: m.id, ...think(m) });
  } catch (err) {
    postMessage({ type: 'error', id: m.id, message: String(err.message || err) });
  }
};
