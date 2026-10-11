// 2048 engine + n-tuple network for the browser (also loads in Node for tests).
// A board is a Uint8Array(16) of tile exponents, cell = row * 4 + col.
(function (root) {
  'use strict';

  const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;
  const DIR_NAMES = ['Up', 'Right', 'Down', 'Left'];

  // LINES[dir][line] = 4 cells ordered from the wall the tiles slide toward.
  const LINES = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    LINES[UP].push([i, 4 + i, 8 + i, 12 + i]);
    LINES[DOWN].push([12 + i, 8 + i, 4 + i, i]);
    LINES[LEFT].push([4 * i, 4 * i + 1, 4 * i + 2, 4 * i + 3]);
    LINES[RIGHT].push([4 * i + 3, 4 * i + 2, 4 * i + 1, 4 * i]);
  }

  // Slide-toward-index-0 table for a packed 4-nibble line, plus its merge reward.
  const SLIDE = new Uint16Array(65536);
  const REWARD = new Uint32Array(65536);
  for (let w = 0; w < 65536; w++) {
    const out = [0, 0, 0, 0];
    let n = 0, pending = 0, score = 0;
    for (let k = 0; k < 4; k++) {
      const t = (w >> (4 * k)) & 15;
      if (!t) continue;
      if (pending && pending === t && t < 15) {
        out[n++] = t + 1;
        score += 1 << (t + 1);
        pending = 0;
      } else {
        if (pending) out[n++] = pending;
        pending = t;
      }
    }
    if (pending) out[n++] = pending;
    SLIDE[w] = out[0] | (out[1] << 4) | (out[2] << 8) | (out[3] << 12);
    REWARD[w] = score;
  }

  // Returns the afterstate and reward, or null if the move changes nothing.
  function move(b, dir) {
    const out = new Uint8Array(16);
    const lines = LINES[dir];
    let reward = 0, moved = false;
    for (let l = 0; l < 4; l++) {
      const c = lines[l];
      const w = b[c[0]] | (b[c[1]] << 4) | (b[c[2]] << 8) | (b[c[3]] << 12);
      const nw = SLIDE[w];
      if (nw !== w) moved = true;
      reward += REWARD[w];
      out[c[0]] = nw & 15;
      out[c[1]] = (nw >> 4) & 15;
      out[c[2]] = (nw >> 8) & 15;
      out[c[3]] = nw >> 12;
    }
    return moved ? { board: out, reward } : null;
  }

  // Same move, also reporting where every tile went (for animation).
  // slides: [{from, to, exp}] for every existing tile; merges: [{cell, exp}] new merged tiles.
  function moveWithPaths(b, dir) {
    const out = new Uint8Array(16);
    const slides = [], merges = [];
    let reward = 0, moved = false;
    for (const c of LINES[dir]) {
      let n = 0, pendingCell = -1;
      for (let k = 0; k < 4; k++) {
        const t = b[c[k]];
        if (!t) continue;
        if (pendingCell >= 0 && b[pendingCell] === t && t < 15) {
          const dest = c[n - 1];
          slides.push({ from: c[k], to: dest, exp: t });
          if (c[k] !== dest) moved = true;
          out[dest] = t + 1;
          merges.push({ cell: dest, exp: t + 1 });
          reward += 1 << (t + 1);
          pendingCell = -1;
        } else {
          const dest = c[n++];
          slides.push({ from: c[k], to: dest, exp: t });
          if (c[k] !== dest) moved = true;
          out[dest] = t;
          pendingCell = c[k];
        }
      }
    }
    return moved ? { board: out, reward, slides, merges } : null;
  }

  function emptyCells(b) {
    const e = [];
    for (let i = 0; i < 16; i++) if (!b[i]) e.push(i);
    return e;
  }

  function addRandomTile(b, rand) {
    const e = emptyCells(b);
    if (!e.length) return null;
    const cell = e[Math.floor(rand() * e.length)];
    const exp = rand() < 0.9 ? 1 : 2;
    b[cell] = exp;
    return { cell, exp };
  }

  function canMove(b) {
    for (let d = 0; d < 4; d++) if (move(b, d)) return true;
    return false;
  }

  function maxTile(b) {
    let m = 0;
    for (let i = 0; i < 16; i++) if (b[i] > m) m = b[i];
    return m;
  }

  // ---- n-tuple network --------------------------------------------------
  // Weights arrive sparse: for each pattern, sorted 24-bit indices with int16 values.
  // Lookup: the top 16 bits pick a bucket, a binary search over the low byte finds the entry.
  class Network {
    constructor(buf) {
      const dv = new DataView(buf);
      let o = 0;
      const u32 = () => { const v = dv.getUint32(o, true); o += 4; return v; };
      if (u32() !== 0x574b324e) throw new Error('not a 2048 network file');
      if (u32() !== 1) throw new Error('unsupported network version');
      const np = u32(), nc = u32();
      this.patterns = [];
      for (let p = 0; p < np; p++) {
        const cells = [];
        for (let j = 0; j < nc; j++) cells.push(dv.getUint8(o++));
        this.patterns.push(cells);
      }
      this.winit = dv.getFloat32(o, true); o += 4;
      this.games = Number(dv.getBigUint64(o, true)); o += 8;
      const counts = [], scales = [];
      for (let p = 0; p < np; p++) { counts.push(u32()); scales.push(dv.getFloat32(o, true)); o += 4; }
      this.count = counts.reduce((a, b) => a + b, 0);
      this.vals = [];
      for (let p = 0; p < np; p++) {
        const q = new Int16Array(buf.slice(o, o + 2 * counts[p]));
        o += 2 * counts[p];
        const v = new Float32Array(counts[p]);
        for (let i = 0; i < q.length; i++) v[i] = this.winit + q[i] * scales[p];
        this.vals.push(v);
      }
      const bytes = new Uint8Array(buf);
      this.lo = [];
      this.off = [];
      for (let p = 0; p < np; p++) {
        const lo = new Uint8Array(counts[p]);
        const off = new Uint32Array(65537);
        let key = 0, prevBucket = 0;
        for (let i = 0; i < counts[p]; i++) {
          let d = 0, s = 0, byte;
          do { byte = bytes[o++]; d += (byte & 127) * 2 ** s; s += 7; } while (byte & 128);
          key += d;
          const bucket = key >>> 8;
          while (prevBucket < bucket) off[++prevBucket] = i;
          lo[i] = key & 255;
        }
        while (prevBucket < 65536) off[++prevBucket] = counts[p];
        this.lo.push(lo);
        this.off.push(off);
      }
      // 8 symmetric placements of every pattern, as cell lists.
      this.features = [];
      for (let p = 0; p < np; p++) {
        for (let k = 0; k < 8; k++) {
          const cells = this.patterns[p].map((cell) => {
            let r = cell >> 2, c = cell & 3;
            if (k >= 4) c = 3 - c;
            for (let t = 0; t < k % 4; t++) { const nr = c; c = 3 - r; r = nr; }
            return r * 4 + c;
          });
          this.features.push({ p, cells });
        }
      }
    }

    weight(p, idx) {
      const off = this.off[p], lo = this.lo[p];
      const bucket = idx >>> 8, key = idx & 255;
      let a = off[bucket], z = off[bucket + 1] - 1;
      while (a <= z) {
        const m = (a + z) >> 1, v = lo[m];
        if (v === key) return this.vals[p][m];
        if (v < key) a = m + 1; else z = m - 1;
      }
      return this.winit;
    }

    value(b) {
      let v = 0;
      for (const f of this.features) {
        const c = f.cells;
        const idx = b[c[0]] | (b[c[1]] << 4) | (b[c[2]] << 8) | (b[c[3]] << 12) | (b[c[4]] << 16) | (b[c[5]] << 20);
        v += this.weight(f.p, idx);
      }
      return v;
    }
  }

  // ---- expectimax search ------------------------------------------------
  // depth 1: reward + V(afterstate), the raw network.
  // depth d: reward + expected value of the best depth d-1 move over all random tiles.
  function chanceNode(net, after, depth) {
    const e = emptyCells(after);
    if (!e.length) return 0;
    let sum = 0;
    for (const cell of e) {
      after[cell] = 1;
      sum += 0.9 * maxNode(net, after, depth);
      after[cell] = 2;
      sum += 0.1 * maxNode(net, after, depth);
      after[cell] = 0;
    }
    return sum / e.length;
  }

  function maxNode(net, b, depth) {
    let best = 0;
    for (let d = 0; d < 4; d++) {
      const m = move(b, d);
      if (!m) continue;
      const v = m.reward + (depth <= 1 ? net.value(m.board) : chanceNode(net, m.board, depth - 1));
      if (v > best) best = v;
    }
    return best;
  }

  // Returns {dir, values[4]} where values[d] is NaN for an illegal move; dir = -1 when the game is over.
  function chooseMove(net, b, depth) {
    const values = [NaN, NaN, NaN, NaN];
    let dir = -1;
    for (let d = 0; d < 4; d++) {
      const m = move(b, d);
      if (!m) continue;
      values[d] = m.reward + (depth <= 1 ? net.value(m.board) : chanceNode(net, m.board, depth - 1));
      if (dir < 0 || values[d] > values[dir]) dir = d;
    }
    return { dir, values };
  }

  // ---- recorded games -----------------------------------------------------
  function decodeGame(rec) {
    const init = new Uint8Array(16);
    for (let i = 0; i < 16; i++) init[i] = parseInt(rec.init[i], 16);
    const bin = typeof atob === 'function' ? atob(rec.steps) : Buffer.from(rec.steps, 'base64').toString('binary');
    const steps = new Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      const x = bin.charCodeAt(i);
      steps[i] = { dir: x >> 5, cell: (x >> 1) & 15, exp: (x & 1) + 1 };
    }
    return { init, steps };
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  root.G2048 = {
    UP, RIGHT, DOWN, LEFT, DIR_NAMES,
    move, moveWithPaths, emptyCells, addRandomTile, canMove, maxTile,
    Network, chooseMove, decodeGame, mulberry32,
  };
})(typeof window !== 'undefined' ? window : globalThis);
