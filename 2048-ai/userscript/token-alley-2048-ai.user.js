// ==UserScript==
// @name         Token Alley 2048 AI
// @namespace    https://github.com/orangejack9christian/Claude-etc
// @version      1.0.0
// @description  Lets the self-taught 2048 network and its look-ahead search play the 2048 cabinet in Token Alley. AI games never count toward your bests or the hall of fame, and it stays off in online races.
// @match        https://*.claudeusercontent.com/*
// @match        https://claude.ai/*
// @match        https://*.claude.ai/*
// @match        https://*.claude.site/*
// @match        file:///*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @sandbox      JavaScript
// @run-at       document-idle
// ==/UserScript==

// How it works
// - The arcade engine exposes window.Arcade; the 2048 cabinet registers a game object
//   whose `tiles` hold the live board ({ r, c, v, dead }). The script reads that board,
//   asks the search engine for a move, and presses the matching arrow key, exactly like a
//   player would (the engine only acts on keys while a game is being played).
// - The network weights and the WebAssembly search engine are the ones the 2048 Network
//   viewer uses, downloaded from the repository on first use and cached in this browser.
// - Fair play: any run the AI made a move in is an AI run. The script stops the engine from
//   saving that run's score, best tile or hall-of-fame entry, and the AI never plays in an
//   online race (those are live against other people).
(function () {
  'use strict';
  const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const SOURCES = [
    'https://raw.githubusercontent.com/orangejack9christian/Claude-etc/main/2048-ai/viewer/',
    'https://raw.githubusercontent.com/orangejack9christian/Claude-etc/claude/zealous-babbage-prlf3t/2048-ai/viewer/',
  ];
  const KEYS = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
  const ARROWS = ['↑', '→', '↓', '←'];
  const THINK = [[0, 'Instant'], [20, '0.02 s'], [100, '0.1 s'], [500, '0.5 s']];
  // Watchable pace: each move's slide-and-pop animation takes about a quarter second.
  const SPEEDS = [1, 2, 3, 4, 6];   // moves per second
  const SETTINGS_KEY = 'tokenalley-ai:settings';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const compact = (n) => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n));

  // ---- wait for the arcade ------------------------------------------------
  let tries = 0;
  const finder = setInterval(() => {
    const game = W.Arcade && Array.isArray(W.Arcade.games) && W.Arcade.games.find((g) => g && g.id === '2048');
    if (game) { clearInterval(finder); setup(W.Arcade, game); }
    else if (++tries > 60) clearInterval(finder);   // not the arcade: give up quietly after 30 s
  }, 500);

  function setup(Arcade, game) {
    // ---- settings ---------------------------------------------------------
    const settings = { enabled: false, think: 100, speed: 1, restart: true, collapsed: false };
    try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch (e) {}
    if (!(settings.speed >= 0 && settings.speed < SPEEDS.length)) settings.speed = 1;
    const save = () => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {} };

    // ---- know when 2048 is the open cabinet and which runs are AI runs ------
    let lastDraw = 0, aiRun = false;
    const origDraw = game.draw, origStart = game.start;
    game.draw = function () { lastDraw = performance.now(); return origDraw.apply(this, arguments); };
    game.start = function () { aiRun = false; paintRun(); return origStart.apply(this, arguments); };
    const open = () => performance.now() - lastDraw < 400;
    const online = () => !!(game.api && game.api.net);

    // AI runs never save: not the best score, not the best tile, not the hall of fame.
    const store = Arcade.store;
    if (store && store.set) {
      const set = store.set.bind(store);
      store.set = (k, v) => { if (aiRun && (k === 'best:2048' || k === '2048:tile')) return; return set(k, v); };
    }
    if (Arcade.board && Arcade.board.record) {
      const record = Arcade.board.record.bind(Arcade.board);
      Arcade.board.record = (g, n) => { if (aiRun && g && g.id === '2048') return; return record(g, n); };
    }

    // ---- panel ------------------------------------------------------------
    const css = document.createElement('style');
    css.textContent = `
      .tai{position:fixed;right:16px;bottom:16px;z-index:2147483000;width:268px;max-width:calc(100vw - 32px);
        background:#211A3B;color:#F4EEFF;border:1px solid #3A2F5E;border-radius:14px;box-shadow:0 18px 40px -16px rgba(0,0,0,.7);
        font:13px/1.4 Figtree,system-ui,sans-serif;padding:12px;display:grid;gap:10px}
      .tai[hidden]{display:none}
      .tai *{box-sizing:border-box}
      .tai-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .tai-title{font:15px/1 Bungee,Impact,sans-serif;letter-spacing:.02em;color:#FFC23D}
      .tai-x{background:none;border:0;color:#A59BC6;font:600 16px/1 system-ui;cursor:pointer;padding:2px 6px;border-radius:6px}
      .tai-x:hover{color:#F4EEFF}
      .tai-status{color:#A59BC6;font-size:12px}
      .tai-bar{height:3px;background:#0E0A1C;border-radius:2px;overflow:hidden}
      .tai-bar i{display:block;height:100%;width:0;background:#B18CFF;transition:width .2s}
      .tai-go{font:700 14px Figtree,system-ui,sans-serif;padding:9px 12px;border-radius:9px;border:0;cursor:pointer;background:#FFC23D;color:#1B1530}
      .tai-go[aria-pressed="true"]{background:#3DDCB1}
      .tai-go:disabled{opacity:.45;cursor:default}
      .tai-row{display:grid;grid-template-columns:62px 1fr auto;gap:8px;align-items:center}
      .tai-row .tai-seg{grid-column:2 / 4}
      .tai-row output{font:500 11.5px "JetBrains Mono",ui-monospace,monospace;color:#F4EEFF;white-space:nowrap}
      .tai-lbl{font:500 10.5px "JetBrains Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#A59BC6}
      .tai-seg{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #3A2F5E;border-radius:8px;overflow:hidden}
      .tai-seg button{background:none;border:0;color:#A59BC6;font:600 11.5px Figtree,system-ui,sans-serif;padding:6px 2px;cursor:pointer}
      .tai-seg button+button{border-left:1px solid #3A2F5E}
      .tai-seg button[aria-pressed="true"]{background:#B18CFF;color:#1B1530}
      .tai input[type=range]{width:100%;accent-color:#B18CFF}
      .tai-check{display:flex;gap:8px;align-items:center;color:#F4EEFF;font-size:12.5px;cursor:pointer}
      .tai-check input{accent-color:#B18CFF}
      .tai-eng{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#0E0A1C;border-radius:9px;padding:8px}
      .tai-eng b{display:block;font:500 15px "JetBrains Mono",ui-monospace,monospace;font-variant-numeric:tabular-nums;white-space:nowrap}
      .tai-note{font-size:11.5px;color:#A59BC6}
      .tai-run{font-size:11.5px;color:#FFC23D}
      .tai button:focus-visible,.tai input:focus-visible{outline:2px solid #B18CFF;outline-offset:2px}`;
    document.head.appendChild(css);

    const el = document.createElement('div');
    el.className = 'tai';
    el.hidden = true;
    el.innerHTML = `
      <div class="tai-head"><span class="tai-title">2048 AI</span><button class="tai-x" type="button" title="Collapse" aria-label="Collapse">–</button></div>
      <div class="tai-body" style="display:grid;gap:10px">
        <div class="tai-status">Open to load the network.</div>
        <div class="tai-bar"><i></i></div>
        <button class="tai-go" type="button" aria-pressed="false" disabled>Let the AI play</button>
        <div class="tai-row"><span class="tai-lbl">Think</span><div class="tai-seg">${THINK.map(([ms, l]) => `<button type="button" data-ms="${ms}">${l}</button>`).join('')}</div></div>
        <div class="tai-row"><span class="tai-lbl">Speed</span><input type="range" min="0" max="${SPEEDS.length - 1}" step="1" aria-label="Moves per second"><output>2/s</output></div>
        <label class="tai-check"><input type="checkbox"> Start a new game when one ends</label>
        <div class="tai-eng"><div><span class="tai-lbl">Move</span><b class="e-move">–</b></div><div><span class="tai-lbl">Depth</span><b class="e-depth">–</b></div><div><span class="tai-lbl">Positions</span><b class="e-nodes">–</b></div></div>
        <div class="tai-run" hidden>This run is an AI run, so its score won't be saved.</div>
        <div class="tai-note">AI games never count toward your bests or the hall of fame. The AI stays off in online races.</div>
      </div>`;
    document.body.appendChild(el);
    const q = (s) => el.querySelector(s);
    const status = (t) => { q('.tai-status').textContent = t; };
    const goBtn = q('.tai-go'), speedEl = q('input[type=range]'), restartEl = q('input[type=checkbox]');
    function paintControls() {
      goBtn.setAttribute('aria-pressed', String(settings.enabled));
      goBtn.textContent = settings.enabled ? 'AI is playing · stop' : 'Let the AI play';
      el.querySelectorAll('.tai-seg button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.ms === settings.think)));
      speedEl.value = settings.speed;
      q('.tai-row output').textContent = `${SPEEDS[settings.speed]} moves/s`;
      restartEl.checked = settings.restart;
      q('.tai-body').style.display = settings.collapsed ? 'none' : 'grid';
      q('.tai-x').textContent = settings.collapsed ? '+' : '–';
    }
    function paintRun() { q('.tai-run').hidden = !aiRun; }
    goBtn.onclick = () => { settings.enabled = !settings.enabled; save(); paintControls(); };
    el.querySelectorAll('.tai-seg button').forEach((b) => { b.onclick = () => { settings.think = +b.dataset.ms; save(); paintControls(); }; });
    speedEl.oninput = () => { settings.speed = +speedEl.value; save(); paintControls(); };
    restartEl.onchange = () => { settings.restart = restartEl.checked; save(); };
    q('.tai-x').onclick = () => { settings.collapsed = !settings.collapsed; save(); paintControls(); };
    // After a click, hand the keyboard back to the game (as the arcade's own buttons do),
    // so Space and the arrow keys keep working.
    el.addEventListener('click', (e) => { if (e.target.closest('button')) e.target.closest('button').blur(); });
    speedEl.addEventListener('change', () => speedEl.blur());
    restartEl.addEventListener('change', () => restartEl.blur());
    paintControls();

    // ---- engine -----------------------------------------------------------
    const engine = { ready: false, loading: false, error: null };
    let think = null;   // (board, budgetMs) => Promise<{dir, values, depth, nodes, ms}>

    function get(url, type, onProgress) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET', url, responseType: type,
          onprogress: (e) => { if (onProgress && e.total) onProgress(e.loaded / e.total); },
          onload: (r) => (r.status === 200 ? resolve(r.response) : reject(new Error(`HTTP ${r.status}`))),
          onerror: () => reject(new Error('network error')),
          ontimeout: () => reject(new Error('timed out')),
        });
      });
    }
    function idb() {
      return new Promise((resolve, reject) => {
        const r = indexedDB.open('tokenalley-2048-ai', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('net');
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    }
    async function cached(key) {
      try {
        const db = await idb();
        return await new Promise((res) => { const g = db.transaction('net').objectStore('net').get(key); g.onsuccess = () => res(g.result || null); g.onerror = () => res(null); });
      } catch (e) { return null; }
    }
    async function remember(key, value) {
      try {
        const db = await idb();
        const tx = db.transaction('net', 'readwrite');
        tx.objectStore('net').clear();
        tx.objectStore('net').put(value, key);
      } catch (e) {}
    }
    async function gunzip(bytes) {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return await new Response(stream).arrayBuffer();
    }

    async function load() {
      if (engine.loading || engine.ready) return;
      engine.loading = true;
      const bar = q('.tai-bar i');
      try {
        status('Finding the network…');
        let base = null, meta = null;
        for (const s of SOURCES) {
          try { meta = JSON.parse(await get(s + 'data.json', 'text')).meta; base = s; break; } catch (e) {}
        }
        if (!base) throw new Error("couldn't reach the network files on GitHub");
        const key = `net-${meta.games}-${meta.shipped}`;
        let net = await cached(key);
        if (!net) {
          const parts = meta.weightFiles, chunks = [];
          for (let i = 0; i < parts.length; i++) {
            status(`Downloading the network (${i + 1} of ${parts.length})…`);
            const text = await get(base + parts[i], 'text', (f) => { bar.style.width = ((100 * (i + f)) / parts.length).toFixed(1) + '%'; });
            const bin = atob(text.trim());
            const bytes = new Uint8Array(bin.length);
            for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
            chunks.push(bytes);
          }
          const all = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
          let o = 0;
          for (const c of chunks) { all.set(c, o); o += c.length; }
          status('Unpacking…');
          net = await gunzip(all);
          remember(key, net);
        }
        bar.style.width = '100%';
        status('Starting the search engine…');
        const wasm = await get(base + 'engine.wasm', 'arraybuffer');
        think = await startWorker(wasm, net).catch(() => startInline(wasm, net));
        engine.ready = true;
        goBtn.disabled = false;
        status(`Ready · network trained on ${compact(meta.games)} games`);
        q('.tai-bar').hidden = true;
      } catch (e) {
        engine.error = e;
        status(`Couldn't start: ${e.message}. Reload the page to try again.`);
      } finally {
        engine.loading = false;
      }
    }

    // The search runs in a worker so a long think never freezes the cabinet.
    const WORKER_SRC = `
      let ex = null;
      const pack = (b) => { let lo = 0, hi = 0; for (let i = 0; i < 8; i++) { lo |= b[i] << (4 * i); hi |= b[i + 8] << (4 * i); } return [lo >>> 0, hi >>> 0]; };
      onmessage = async (e) => {
        const m = e.data;
        try {
          if (m.type === 'init') {
            const { instance } = await WebAssembly.instantiate(m.wasm, { env: { now: () => performance.now() } });
            ex = instance.exports; ex.init();
            const net = new Uint8Array(m.net), p = ex.alloc(net.length);
            if (!p) throw new Error('not enough memory for the network');
            new Uint8Array(ex.memory.buffer, p, net.length).set(net);
            if (!ex.load_net(p, net.length)) throw new Error('the network file is invalid');
            postMessage({ type: 'ready' });
          } else {
            const [lo, hi] = pack(m.board);
            const dir = ex.think(lo, hi, m.budget, 30);
            postMessage({ type: 'result', id: m.id, dir, values: [0, 1, 2, 3].map((d) => ex.result_value(d)), depth: ex.result_depth(), nodes: ex.result_nodes(), ms: ex.result_ms() });
          }
        } catch (err) { postMessage({ type: 'error', id: m.id, message: String(err && err.message || err) }); }
      };`;
    function startWorker(wasm, net) {
      return new Promise((resolve, reject) => {
        let worker;
        try { worker = new Worker(URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }))); }
        catch (e) { reject(e); return; }
        const waiting = new Map();
        let nextId = 1;
        worker.onerror = (e) => reject(new Error(e.message || 'worker failed'));
        worker.onmessage = (e) => {
          const m = e.data;
          if (m.type === 'ready') {
            resolve((board, budget) => new Promise((res, rej) => {
              const id = nextId++;
              waiting.set(id, { res, rej });
              worker.postMessage({ type: 'think', id, board: Array.from(board), budget });
            }));
          } else if (m.type === 'error' && !m.id) reject(new Error(m.message));
          else {
            const w = waiting.get(m.id);
            waiting.delete(m.id);
            if (w) (m.type === 'result' ? w.res(m) : w.rej(new Error(m.message)));
          }
        };
        // Copies: the inline fallback still needs the originals if the worker can't start.
        worker.postMessage({ type: 'init', wasm: wasm.slice(0), net: net.slice(0) });
      });
    }
    // Fallback when the page doesn't allow workers: same engine on the main thread, short thinks only.
    async function startInline(wasm, net) {
      const { instance } = await WebAssembly.instantiate(wasm, { env: { now: () => performance.now() } });
      const ex = instance.exports;
      ex.init();
      const bytes = new Uint8Array(net), p = ex.alloc(bytes.length);
      new Uint8Array(ex.memory.buffer, p, bytes.length).set(bytes);
      if (!ex.load_net(p, bytes.length)) throw new Error('the network file is invalid');
      return async (b, budget) => {
        let lo = 0, hi = 0;
        for (let i = 0; i < 8; i++) { lo |= b[i] << (4 * i); hi |= b[i + 8] << (4 * i); }
        const dir = ex.think(lo >>> 0, hi >>> 0, Math.min(budget, 50), 30);
        return { dir, values: [0, 1, 2, 3].map((d) => ex.result_value(d)), depth: ex.result_depth(), nodes: ex.result_nodes(), ms: ex.result_ms() };
      };
    }

    // ---- playing ------------------------------------------------------------
    function readBoard() {
      const b = new Uint8Array(16);
      for (const t of game.tiles || []) if (!t.dead) b[t.r * 4 + t.c] = Math.min(15, Math.round(Math.log2(t.v)));
      return b;
    }
    const same = (a, b) => a.every((v, i) => v === b[i]);
    function press(code) {
      const opts = { code, key: code === 'Space' ? ' ' : code, bubbles: true, cancelable: true };
      W.dispatchEvent(new W.KeyboardEvent('keydown', opts));
      W.dispatchEvent(new W.KeyboardEvent('keyup', opts));
    }

    let overSince = 0;
    async function loop() {
      for (;;) {
        const showing = open();
        el.hidden = !showing;
        if (showing && !engine.ready && !engine.loading && !engine.error) load();
        if (!showing || !settings.enabled || !engine.ready) { await sleep(150); continue; }
        if (online()) { status('Off: this is an online race against other players.'); await sleep(300); continue; }
        const state = game.api && game.api.state;
        if (state === 'over') {
          if (!overSince) overSince = performance.now();
          if (settings.restart && aiRun && performance.now() - overSince > 3500) { press('Space'); overSince = performance.now(); }
          await sleep(200);
          continue;
        }
        overSince = 0;
        if (state !== 'play' || game.done) { await sleep(150); continue; }

        const t0 = performance.now();
        const board = readBoard();
        let r;
        try { r = await think(board, settings.think); }
        catch (e) { status(`Engine error: ${e.message}`); settings.enabled = false; paintControls(); continue; }
        // Only move if nothing changed while it was thinking.
        if (!settings.enabled || !open() || online() || game.api.state !== 'play' || game.done || !same(board, readBoard())) continue;
        if (r.dir < 0) { await sleep(150); continue; }
        if (!aiRun) { aiRun = true; paintRun(); }
        press(KEYS[r.dir]);
        q('.e-move').textContent = ARROWS[r.dir];
        q('.e-depth').textContent = r.depth;
        q('.e-nodes').textContent = r.nodes ? compact(r.nodes) : '–';
        status(`Playing · ${settings.think ? settings.think / 1000 + ' s' : 'instant'} per move`);
        // Never faster than the chosen pace, however quickly the engine answered.
        await sleep(Math.max(0, 1000 / SPEEDS[settings.speed] - (performance.now() - t0)));
      }
    }
    loop();
  }
})();
