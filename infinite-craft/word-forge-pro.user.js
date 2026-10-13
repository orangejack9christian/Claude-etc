// ==UserScript==
// @name         Infinite Craft - Word Forge Pro (Auto Combiner v6)
// @namespace    https://neal.fun/infinite-craft/
// @version      6.8.0
// @description  Type any word and it gets crafted: looks it up on Infinibrowser and crafts the uploaded recipe (self-healing), or builds brand-new words letter by letter with text tools learned from Infinibrowser. No random combining. Keeps the National Pokedex queue, history and save tools.
// @match        https://neal.fun/infinite-craft*
// @match        https://infinibrowser.wiki/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @connect      infinibrowser.wiki
// ==/UserScript==

(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  // Page globals (the game's window.IC, ...) live on unsafeWindow when the userscript
  // manager runs the script in its sandbox; without a sandbox they're on window.
  const W = (typeof unsafeWindow !== 'undefined' && unsafeWindow) ? unsafeWindow : window;

  // Userscript-manager storage shared by this script in every tab (a second channel for the
  // Infinibrowser relay that works even when the tabs can't message each other directly).
  const GMS = (() => {
    try {
      if (typeof GM_setValue === 'function' && typeof GM_getValue === 'function' && typeof GM_addValueChangeListener === 'function') {
        return { set: GM_setValue, get: GM_getValue, listen: GM_addValueChangeListener };
      }
    } catch (e) {}
    return null;
  })();
  const RELAY_REQ = 'icforge_relay_req', RELAY_RES = 'icforge_relay_res', RELAY_READY = 'icforge_relay_ready';

  // On infinibrowser.wiki this script is only a relay: the game tab can ask it to fetch
  // Infinibrowser API data, which works there even when the game page itself is blocked
  // (cross-site rules, or Cloudflare's "checking your browser" page you pass in that tab).
  if (/(^|\.)infinibrowser\.wiki$/.test(location.hostname)) {
    runInfinibrowserRelay();
    return;
  }
  if (W._icAutoInstance) { console.warn('[WordForge] Already running.'); return; }

  function runInfinibrowserRelay() {
    const GAME = 'https://neal.fun';
    const checking = () => /just a moment/i.test(document.title || '');
    const fetchApi = async (path) => {
      if (typeof path !== 'string' || path.indexOf('/api/') !== 0) return { error: 'bad path' };
      try {
        const res = await fetch(location.origin + path, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
        return { status: res.status, text: await res.text() };
      } catch (err) {
        return { error: String((err && err.message) || err) };
      }
    };
    // Channel 1: postMessage with the game tab that opened this one.
    window.addEventListener('message', async (e) => {
      const d = e.data;
      if (e.origin !== GAME || !d || d.icforge !== 'req') return;
      const out = Object.assign({ icforge: 'res', id: d.id }, await fetchApi(d.path));
      try { e.source.postMessage(out, e.origin); } catch (err) {}
    });
    // Channel 2: shared userscript storage (no tab link needed).
    let outbox = [];
    const seen = new Set();
    const handle = (reqs) => {
      for (const r of reqs || []) {
        if (!r || seen.has(r.id) || Date.now() - r.ts > 60000) continue;
        seen.add(r.id);
        fetchApi(r.path).then((res) => {
          outbox = outbox.concat([Object.assign({ id: r.id }, res)]).slice(-25);
          GMS.set(RELAY_RES, outbox);
        });
      }
    };
    if (GMS) {
      GMS.listen(RELAY_REQ, (name, oldV, newV) => handle(newV));
      handle(GMS.get(RELAY_REQ, []));
    }
    const announce = () => {
      if (checking()) return;
      try { if (window.opener) window.opener.postMessage({ icforge: 'ready' }, GAME); } catch (e) {}
      if (GMS) GMS.set(RELAY_READY, Date.now());
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', announce, { once: true });
    else announce();
    setInterval(announce, 2000);
  }

  /* ============================================================
   * Config
   * ============================================================ */
  const VERSION = '6.8.0';

  // Small settings stay in localStorage (same keys as v5.x so settings carry over).
  // Big learned data (tried pairs, pair results, Infinibrowser cache) lives in IndexedDB
  // so it never competes with the game's own save for localStorage space.
  const KEYS = {
    tried: 'icAutoTriedV2',
    speed: 'icAutoSpeed',
    exclude: 'icAutoExclude',
    options: 'icAutoOptions',
    drafts: 'icAutoDrafts',
    pokeCache: 'icAutoPokeCache',
    pokeState: 'icAutoPokeState',
    recipeBank: 'icAutoRecipeBank',
    pairResults: 'icAutoPairResults',
    altRecipeCache: 'icAutoAltRecipeCache',
    badRecipePairs: 'icAutoBadRecipePairs',
    panelPos: 'icForgePanelPosV6',
    memVer: 'icForgeMemVer',
    sections: 'icForgeSectionsV6'
  };

  const SPEED_PRESETS = {
    slow: { gap: 450, settle: 220, step: 12, between: 150 },
    normal: { gap: 200, settle: 140, step: 10, between: 120 },
    fast: { gap: 90, settle: 90, step: 8, between: 80 },
    turbo: { gap: 30, settle: 50, step: 5, between: 50 }
  };

  const POKE_SPECIAL = {
    nidoranf: 'Nidoran♀', nidoranm: 'Nidoran♂', mrmime: 'Mr. Mime', mimejr: 'Mime Jr.',
    mrrime: 'Mr. Rime', typenull: 'Type: Null', farfetchd: 'Farfetch\'d', sirfetchd: 'Sirfetch\'d',
    jangmoo: 'Jangmo-o', hakamoo: 'Hakamo-o', kommoo: 'Kommo-o', hooh: 'Ho-Oh', porygonz: 'Porygon-Z',
    wochien: 'Wo-Chien', chienpao: 'Chien-Pao', tinglu: 'Ting-Lu', chiyu: 'Chi-Yu'
  };

  // Names the string-building community commonly uses for text tools. These are only
  // hypotheses: a guess is used only if Infinibrowser says the element exists (or you own it),
  // and every use is verified. Tools mined from Infinibrowser always rank above guesses.
  const TOOL_GUESSES = {
    unwrap: ['Unquote', 'Remove Quotes', 'Remove Quotation Marks', 'Delete Quotes', 'Delete Quotation Marks',
      'Unquoted', 'Without Quotes', 'No Quotes', 'Strip Quotes', 'Unplural'],
    toHash: ['Prepend Hashtag', 'Hashtag', '#'],
    unhash: ['Unhashtag', 'Remove Hashtag', 'Delete Hashtag', 'Delete The Hashtag', 'Remove The Hashtag', 'Unplural'],
    quote: ['Quote', 'Quotation Marks', 'Quotation Mark', 'Quotes', 'Add Quotes', 'Quotation'],
    upper: ['Uppercase', 'All Caps', 'Caps Lock', 'Capitalize'],
    lower: ['Lowercase', 'Decapitalize'],
    title: ['Capitalize', 'Title Case', 'Capital Letter']
  };

  const C = {
    itemSel: '.items .item',
    container: '.container',
    gap: 200,
    settle: 140,
    step: 10,
    between: 120,
    craftTimeout: 9000,
    settleMax: 1600,
    largeInventory: 400,
    sweepThreshold: 120,
    hardSweepThreshold: 1500,
    sweepCooldown: 60000,
    sweepWait: 300,
    sweepAfter: 600,
    observeDebounce: 300,
    saveSwitch: { minCount: 40, minDelta: 20, maxOverlap: 0.55, cooldown: 4000 },
    maxTried: 250000,
    maxPairs: 120000,
    maxBad: 30000,
    ib: {
      base: 'https://infinibrowser.wiki/api',
      gap: 260,
      timeout: 12000,
      retries: 5,
      cacheMax: 6000,
      // After a first burst, stay under this many requests a minute: heavy use makes
      // Infinibrowser show its "checking your browser" page, which blocks the script.
      perMinute: 100,
      posTTL: 30 * 864e5,
      negTTL: 2 * 864e5,
      offlineCooldown: 45000
    },
    forge: {
      // Each failed round escalates to the next level (deeper recursion, more branches).
      levels: [
        { name: 'quick', depth: 3, branches: 4, splits: 2, seeds: 3, cands: 6, appendCrafts: 80, mine: 0 },
        { name: 'deep', depth: 5, branches: 8, splits: 3, seeds: 5, cands: 10, appendCrafts: 160, mine: 1 },
        { name: 'thorough', depth: 7, branches: 16, splits: 4, seeds: 8, cands: 16, appendCrafts: 320, mine: 2 }
      ],
      giveUpRounds: 2,
      maxNest: 2,
      opsMaxAge: 7 * 864e5
    },
  };

  // Test / power-user hook: window.__icForgeConfig = { gap: 0, ib: { gap: 0 } }
  (function mergeOverrides(dst, src) {
    if (!src || typeof src !== 'object') return;
    for (const k of Object.keys(src)) {
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && dst[k] && typeof dst[k] === 'object') mergeOverrides(dst[k], src[k]);
      else dst[k] = src[k];
    }
  })(C, W.__icForgeConfig);

  /* ============================================================
   * Small utilities
   * ============================================================ */
  const sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms | 0)));
  // Let the page draw and handle input, then continue. A message channel isn't slowed down in
  // background tabs the way setTimeout is.
  const yieldToPage = (() => {
    let ch = null;
    const q = [];
    return () => new Promise((resolve) => {
      try {
        if (!ch) { ch = new window.MessageChannel(); ch.port1.onmessage = () => { const f = q.shift(); if (f) f(); }; }
        q.push(resolve);
        ch.port2.postMessage(0);
      } catch (e) { setTimeout(resolve, 0); }
    });
  })();
  const now = () => Date.now();
  const pairKey = (a, b) => (a <= b ? a + '||' + b : b + '||' + a);
  const clock = () => {
    const d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => ('0' + n).slice(-2)).join(':');
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function trimSet(set, cap) {
    if (set.size <= cap) return;
    const it = set.values();
    for (let n = set.size - cap; n > 0; n--) set.delete(it.next().value);
  }
  function trimMap(map, cap) {
    if (map.size <= cap) return;
    const it = map.keys();
    for (let n = map.size - cap; n > 0; n--) map.delete(it.next().value);
  }

  class Cancelled extends Error {
    constructor() { super('cancelled'); this.cancelled = true; }
  }

  const Store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    del(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };

  /* ============================================================
   * Text helpers
   * ============================================================ */
  const WRAPS = [
    ['"', '"', 'dq'], ['“', '”', 'cq'], ['“', '"', 'cq'], ['"', '”', 'cq'],
    ['„', '“', 'cq'], ['\'', '\'', 'sq'], ['‘', '’', 'csq'], ['«', '»', 'gq']
  ];
  const WRAP_OPEN = { dq: '"', cq: '“', sq: '\'', csq: '‘', gq: '«', hash: '#', dot: '.', bang: '!', plain: '' };
  const WRAP_CLOSE = { dq: '"', cq: '”', sq: '\'', csq: '’', gq: '»', hash: '', dot: '', bang: '', plain: '' };

  const Text = {
    // Loose key (v5.x compatible): case/punctuation-insensitive, Unicode letters kept.
    loose(s) {
      return String(s || '')
        .toLowerCase()
        .replace(/^_+/, '')
        .replace(/♀/g, ' f ')
        .replace(/♂/g, ' m ')
        .replace(/\bfemale\b/g, ' f ')
        .replace(/\bmale\b/g, ' m ')
        .replace(/[^\p{L}\p{N}]+/gu, '');
    },
    soft(s) {
      return String(s || '').normalize('NFC').trim().replace(/\s+/g, ' ').replace(/[‘’]/g, '\'').toLowerCase();
    },
    key(s) { return Text.loose(s) || Text.soft(s); },
    // Split decorated text into wrapper + core: "abc" -> {w:'dq', core:'abc'}, #abc -> {w:'hash'}.
    parse(s) {
      const text = String(s == null ? '' : s);
      const t = text.trim();
      if (t.length >= 2) {
        for (const [o, c, w] of WRAPS) {
          if (t.length >= o.length + c.length && t.startsWith(o) && t.endsWith(c)) {
            return { w, core: t.slice(o.length, t.length - c.length), text };
          }
        }
        const ch = t[0];
        if (ch === '#') return { w: 'hash', core: t.slice(1), text };
        if (ch === '.' && t[1] !== '.') return { w: 'dot', core: t.slice(1), text };
        if (ch === '!' && t[1] !== '!') return { w: 'bang', core: t.slice(1), text };
      }
      return { w: 'plain', core: t, text };
    },
    wrap(core, w) { return (WRAP_OPEN[w] || '') + core + (WRAP_CLOSE[w] || ''); },
    // Do two item names refer to the same word? Wrappers must always agree ("abc" is not abc).
    //   'exact' (or true): identical text
    //   'case':  capitalization may differ; letters, spaces and punctuation must match
    //   'loose' (or false): also ignores punctuation and spacing (v5 behaviour, Pokedex)
    same(a, b, mode) {
      if (a == null || b == null) return false;
      const sa = String(a).trim(), sb = String(b).trim();
      if (sa === sb) return true;
      if (mode === true || mode === 'exact') return false;
      const pa = Text.parse(sa), pb = Text.parse(sb);
      if (pa.w !== pb.w) return false;
      if (mode === 'case') return Text.soft(sa) === Text.soft(sb);
      const la = Text.loose(sa), lb = Text.loose(sb);
      if (la && lb) return la === lb;
      return Text.soft(sa) === Text.soft(sb);
    },
    startsCI(s, p) { return String(s).toLowerCase().startsWith(String(p).toLowerCase()); },
    eqCI(a, b) { return String(a).toLowerCase() === String(b).toLowerCase(); },
    title(s) { return String(s).replace(/(^|[\s\-(/])(\p{L})/gu, (m, p, ch) => p + ch.toUpperCase()); },
    capFirst(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); },
    // Capitalization that clearly isn't what was typed: a capital typed but lowercase made, or a
    // capital made in the middle of a word. ("dragon" -> "Dragon" is fine.)
    caseIsOff(made, typed) {
      const a = String(made), b = String(typed).trim();
      if (a === b || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        const x = a[i], y = b[i];
        if (x === y) continue;
        if (x.toLowerCase() !== y.toLowerCase()) return false;
        if (y !== y.toLowerCase() && x === x.toLowerCase()) return true;
        const wordStart = i === 0 || !/[\p{L}\p{N}]/u.test(a[i - 1]);
        if (!wordStart && x !== x.toLowerCase()) return true;
      }
      return false;
    },
    variants(target, mode) {
      const raw = String(target || '').trim();
      const out = [];
      const add = (v) => { v = (v || '').trim(); if (v && out.indexOf(v) < 0) out.push(v); };
      if (mode === true || mode === 'exact') { add(raw); return out; }
      if (mode !== 'case') add(POKE_SPECIAL[Text.loose(raw)]);
      if (Text.parse(raw).w === 'plain') add(Text.title(raw));
      add(raw);
      add(Text.capFirst(raw));
      add(raw.toLowerCase());
      if (Text.parse(raw).w === 'plain') add(Text.title(raw.toLowerCase()));
      add(raw.toUpperCase());
      return out;
    }
  };

  /* ============================================================
   * IndexedDB key/value store (falls back to memory only)
   * ============================================================ */
  const KV = (() => {
    const DB = 'ic-word-forge', STORE = 'kv';
    const mem = new Map();
    let dbp = null;
    function open() {
      if (dbp) return dbp;
      dbp = new Promise((resolve) => {
        try {
          if (!window.indexedDB) { resolve(null); return; }
          const req = indexedDB.open(DB, 1);
          req.onupgradeneeded = () => { try { req.result.createObjectStore(STORE); } catch (e) {} };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
          req.onblocked = () => resolve(null);
        } catch (e) { resolve(null); }
      });
      return dbp;
    }
    async function get(key) {
      const db = await open();
      if (!db) return mem.get(key);
      return new Promise((resolve) => {
        try {
          const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => resolve(undefined);
        } catch (e) { resolve(undefined); }
      });
    }
    async function set(key, value) {
      const db = await open();
      if (!db) { mem.set(key, value); return false; }
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).put(value, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
          tx.onabort = () => resolve(false);
        } catch (e) { resolve(false); }
      });
    }
    async function del(key) {
      const db = await open();
      mem.delete(key);
      if (!db) return;
      try { db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key); } catch (e) {}
    }
    async function available() { return !!(await open()); }
    return { get, set, del, available };
  })();

  /* ============================================================
   * Learned memory: tried pairs, pair results, bad recipe pairs, recipe bank
   * ============================================================ */
  class Memory {
    constructor() {
      this.tried = new Set();
      this.pairs = new Map();
      this.bad = new Set();
      this.recipeBank = {};
      this.idb = false;
      this._dirty = new Set();
      this._timer = null;
      // Pair results are saved as small batches of new results (rewriting a 100,000-entry
      // table every few seconds froze the game). pairsFull: write the whole table next time.
      this._pairLog = [];
      this._pairChunks = [];
      this.pairsFull = false;
    }
    async load() {
      this.idb = await KV.available();
      const [tried, pairs, bad, meta] = await Promise.all([KV.get('tried'), KV.get('pairs'), KV.get('bad'), KV.get('pairsMeta')]);
      if (Array.isArray(tried)) for (const k of tried) this.tried.add(k);
      if (pairs && typeof pairs === 'object') for (const k of Object.keys(pairs)) this.pairs.set(k, pairs[k]);
      if (meta && Array.isArray(meta.chunks)) {
        this._pairChunks = meta.chunks.slice();
        const chunks = await Promise.all(this._pairChunks.map((k) => KV.get(k)));
        for (const c of chunks) if (Array.isArray(c)) for (const [k, v] of c) { this.pairs.delete(k); if (v != null) this.pairs.set(k, v); }
        // Fold the batches back into one table now and then (at load, before any crafting).
        if (this._pairChunks.length >= 20) { this.pairsFull = true; this._dirty.add('pairs'); }
      }
      if (this.pairs.size > C.maxPairs) { trimMap(this.pairs, C.maxPairs); this.pairsFull = true; this._dirty.add('pairs'); }
      if (Array.isArray(bad)) for (const k of bad) this.bad.add(k);
      // Migrate v5.x localStorage blobs.
      let migrated = false;
      const lt = Store.get(KEYS.tried, null);
      if (Array.isArray(lt)) { for (const k of lt) this.tried.add(k); migrated = true; }
      const lp = Store.get(KEYS.pairResults, null);
      if (lp && typeof lp === 'object') { for (const k of Object.keys(lp)) if (!this.pairs.has(k)) this.pairs.set(k, lp[k]); migrated = true; }
      const lb = Store.get(KEYS.badRecipePairs, null);
      if (lb && typeof lb === 'object') { for (const k of Object.keys(lb)) this.bad.add(k); migrated = true; }
      const bank = Store.get(KEYS.recipeBank, null);
      if (bank && typeof bank === 'object') this.recipeBank = bank;
      // 6.0/6.1 crafted through an API the game update changed, so "nothing" results recorded
      // then can't be trusted. Real results are kept.
      if ((Store.get(KEYS.memVer, 0) || 0) < 2) {
        let dropped = 0;
        for (const [k, v] of Array.from(this.pairs)) if (v === '') { this.pairs.delete(k); dropped++; }
        if (dropped) { this._dirty.add('pairs'); this.pairsFull = true; }
        Store.set(KEYS.memVer, 2);
      }
      if (migrated && this.idb) {
        this._dirty.add('tried'); this._dirty.add('pairs'); this._dirty.add('bad');
        this.pairsFull = true;
        await this.flush();
        // Free the game's localStorage space; the data now lives in IndexedDB.
        Store.del(KEYS.tried); Store.del(KEYS.pairResults); Store.del(KEYS.badRecipePairs); Store.del(KEYS.altRecipeCache);
      }
    }
    _mark(name) {
      this._dirty.add(name);
      if (this._timer) return;
      this._timer = setTimeout(() => { this._timer = null; this.flush(); }, 15000);
    }
    async flush() {
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
      const dirty = Array.from(this._dirty);
      this._dirty.clear();
      for (const name of dirty) {
        if (name === 'tried') {
          trimSet(this.tried, this.idb ? C.maxTried : 20000);
          if (this.idb) await KV.set('tried', Array.from(this.tried));
          else Store.set(KEYS.tried, Array.from(this.tried));
        } else if (name === 'pairs') {
          if (this.idb && !this.pairsFull) {
            if (!this._pairLog.length) continue;
            const log = this._pairLog;
            this._pairLog = [];
            const key = 'pairs.' + Date.now().toString(36) + '.' + this._pairChunks.length;
            await KV.set(key, log);
            this._pairChunks.push(key);
            await KV.set('pairsMeta', { chunks: this._pairChunks });
            continue;
          }
          this.pairsFull = false;
          this._pairLog = [];
          trimMap(this.pairs, this.idb ? C.maxPairs : 8000);
          const obj = {};
          for (const [k, v] of this.pairs) obj[k] = v;
          if (this.idb) {
            const old = this._pairChunks;
            this._pairChunks = [];
            await KV.set('pairs', obj);
            await KV.set('pairsMeta', { chunks: [] });
            for (const k of old) await KV.del(k);
          } else Store.set(KEYS.pairResults, obj);
        } else if (name === 'bad') {
          trimSet(this.bad, C.maxBad);
          if (this.idb) await KV.set('bad', Array.from(this.bad));
          else {
            const obj = {};
            for (const k of this.bad) obj[k] = true;
            Store.set(KEYS.badRecipePairs, obj);
          }
        } else if (name === 'bank') {
          const keys = Object.keys(this.recipeBank);
          if (keys.length > 800) {
            keys.sort((a, b) => (this.recipeBank[a].savedAt || 0) - (this.recipeBank[b].savedAt || 0));
            for (let i = 0; i < keys.length - 800; i++) delete this.recipeBank[keys[i]];
          }
          Store.set(KEYS.recipeBank, this.recipeBank);
        }
      }
    }
    wasTried(a, b) { return this.tried.has(pairKey(a, b)); }
    markTried(a, b) { this.tried.add(pairKey(a, b)); this._mark('tried'); }
    result(a, b) {
      const r = this.pairs.get(pairKey(a, b));
      return r === undefined ? undefined : r;
    }
    remember(a, b, result) {
      const k = pairKey(a, b);
      const v = result || '';
      if (this.pairs.get(k) === v) return;
      this.pairs.delete(k);
      this.pairs.set(k, v);
      this._pairLog.push([k, v]);
      this._mark('pairs');
    }
    forget(a, b) {
      const k = pairKey(a, b);
      if (this.pairs.delete(k)) { this._pairLog.push([k, null]); this._mark('pairs'); }
    }
    // Many pairs changed at once (import, migration, clearing): save the whole table next time.
    pairsChanged() { this.pairsFull = true; this._mark('pairs'); }
    _badKey(result, a, b) { return Text.loose(result) + '::' + pairKey(a, b); }
    isBad(result, a, b) { return this.bad.has(this._badKey(result, a, b)); }
    markBad(result, a, b) { this.bad.add(this._badKey(result, a, b)); this._mark('bad'); }
    bankGet(target) { return this.recipeBank[Text.key(target)] || null; }
    bankPut(target, steps, source) {
      if (!target || !steps || !steps.length) return null;
      const entry = {
        name: steps[steps.length - 1][2] || target,
        text: steps.map((s) => s[0] + ' + ' + s[1] + ' = ' + s[2]).join('\n'),
        savedAt: now(),
        steps: steps.length,
        source: source || 'manual'
      };
      this.recipeBank[Text.key(target)] = entry;
      this._mark('bank');
      return entry;
    }
    bankDrop(target) { delete this.recipeBank[Text.key(target)]; this._mark('bank'); }
    resetLearned() {
      this.tried.clear(); this.pairs.clear(); this.bad.clear();
      this._dirty.add('tried'); this._dirty.add('pairs'); this._dirty.add('bad');
      this.pairsFull = true;
      return this.flush();
    }
  }

  function parseLineageText(text) {
    const out = [];
    for (let line of String(text || '').split('\n')) {
      line = line.trim().replace(/^\d+[.)]\s*/, '');
      const eq = line.lastIndexOf(' = ');
      if (eq < 0) continue;
      const left = line.slice(0, eq).trim();
      const result = line.slice(eq + 3).trim();
      const plus = left.indexOf(' + ');
      if (!result || plus < 0) continue;
      const a = left.slice(0, plus).trim(), b = left.slice(plus + 3).trim();
      if (a && b) out.push([a, b, result]);
    }
    return out;
  }

  /* ============================================================
   * HTTP: Infinibrowser doesn't allow ordinary cross-site requests from the game page, so
   * use the userscript manager's GM_xmlhttpRequest (needs @connect infinibrowser.wiki);
   * fall back to fetch where it isn't available.
   * ============================================================ */
  const GMX = (() => {
    try { if (typeof GM_xmlhttpRequest === 'function') return GM_xmlhttpRequest; } catch (e) {}
    try { if (typeof GM !== 'undefined' && GM && typeof GM.xmlHttpRequest === 'function') return GM.xmlHttpRequest; } catch (e) {}
    return null;
  })();
  function gmGet(url, timeout) {
    return new Promise((resolve, reject) => {
      const fail = (what) => (r) => reject(new Error((r && (r.error || r.statusText)) || what));
      try {
        GMX({
          method: 'GET', url, timeout,
          headers: { Accept: 'application/json' },
          onload: (r) => resolve({ status: r.status, text: r.responseText || '', via: 'manager' }),
          onerror: fail('network error'),
          ontimeout: fail('timed out'),
          onabort: fail('aborted')
        });
      } catch (e) { reject(e); }
    });
  }
  function fetchGet(url, timeout) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeout) : null;
    return fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl ? ctrl.signal : undefined })
      .then(async (res) => ({ status: res.status, text: await res.text(), via: 'direct' }))
      .catch((e) => { throw new Error(e && e.name === 'AbortError' ? 'timed out' : 'blocked by the browser (' + ((e && e.message) || e) + ')'); })
      .finally(() => { if (timer) clearTimeout(timer); });
  }
  // The infinibrowser.wiki tab relay (see runInfinibrowserRelay): postMessage when the tab
  // was opened from here, shared userscript storage otherwise.
  const Relay = {
    win: null,
    ready: false,
    seq: 0,
    pending: new Map(),
    queue: [],
    listeners: [],
    wasAlive: false,
    init() {
      window.addEventListener('message', (e) => {
        if (e.origin !== 'https://infinibrowser.wiki') return;
        const d = e.data;
        if (!d || !d.icforge) return;
        if (d.icforge === 'ready') {
          this.win = e.source;
          this.ready = true;
          this._changed();
        } else if (d.icforge === 'res') this._answer(d);
      });
      if (GMS) {
        GMS.listen(RELAY_RES, (name, oldV, newV) => { for (const r of newV || []) this._answer(r); });
        GMS.listen(RELAY_READY, () => this._changed());
      }
      setInterval(() => this._changed(), 3000);
    },
    _answer(d) {
      const cb = d && this.pending.get(d.id);
      if (cb) { this.pending.delete(d.id); cb(d); }
    },
    _changed() {
      const alive = this.alive();
      if (alive && !this.wasAlive) for (const f of this.listeners) { try { f(); } catch (e) {} }
      this.wasAlive = alive;
    },
    directAlive() {
      try { return !!(this.ready && this.win && !this.win.closed); } catch (e) { return false; }
    },
    storageAlive() {
      try { return !!(GMS && Date.now() - (GMS.get(RELAY_READY, 0) || 0) < 7000); } catch (e) { return false; }
    },
    alive() { return this.directAlive() || this.storageAlive(); },
    open() {
      this.ready = false;
      this.win = window.open('https://infinibrowser.wiki/', 'icforge-infinibrowser');
      return !!this.win;
    },
    get(url, timeout) {
      return new Promise((resolve, reject) => {
        const path = url.replace(/^https:\/\/infinibrowser\.wiki/, '');
        const direct = this.directAlive();
        if (!direct && !this.storageAlive()) { reject(new Error('Infinibrowser tab not open')); return; }
        const id = 'r' + (++this.seq) + '-' + Date.now();
        const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('Infinibrowser tab did not answer')); }, timeout);
        this.pending.set(id, (d) => {
          clearTimeout(timer);
          if (d.error) reject(new Error(d.error));
          else resolve({ status: d.status, text: d.text || '', via: 'tab' });
        });
        try {
          if (direct) this.win.postMessage({ icforge: 'req', id, path }, 'https://infinibrowser.wiki');
          else {
            const t = Date.now();
            this.queue = this.queue.filter((q) => t - q.ts < 60000).concat([{ id, path, ts: t }]).slice(-25);
            GMS.set(RELAY_REQ, this.queue);
          }
        } catch (e) { clearTimeout(timer); this.pending.delete(id); reject(e); }
      });
    }
  };
  // Try every route to Infinibrowser: the relay tab if it's open, the userscript manager,
  // then a direct request. Errors from each route are kept so the player can be told why.
  async function httpGet(url, timeout) {
    const errors = [];
    let challenge = null;
    if (Relay.alive()) {
      try { return await Relay.get(url, timeout); } catch (e) { errors.push('tab: ' + e.message); }
    }
    if (GMX) {
      try {
        const r = await gmGet(url, timeout);
        if (!((r.status === 403 || r.status === 503) && looksLikeChallenge(r))) return r;
        challenge = r;
        errors.push('userscript manager: Infinibrowser answered with its "checking your browser" page');
      } catch (e) { errors.push('userscript manager: ' + e.message); }
    }
    try {
      const r = await fetchGet(url, timeout);
      if (!challenge || !((r.status === 403 || r.status === 503) && looksLikeChallenge(r))) return r;
    } catch (e) { errors.push('direct: ' + e.message); }
    if (challenge) return challenge;
    const err = new Error(errors.join('; '));
    err.routes = errors;
    throw err;
  }
  const looksLikeChallenge = (r) => /<html|just a moment|cf-chl|challenge/i.test((r && r.text) || '');

  /* ============================================================
   * Infinibrowser client: throttled, deduplicated, cached, 429-aware
   * Endpoints: /item, /recipe (lineage), /recipes, /uses
   * ============================================================ */
  class Infinibrowser {
    constructor() {
      this.mem = new Map();
      this.inflight = new Map();
      this.nextAt = 0;
      this.cooldownUntil = 0;
      this.failStreak = 0;
      this.offlineAt = 0;
      this.requests = 0;
      this.rateLimited = 0;
      this.enabled = true;
      this._saveTimer = null;
    }
    async load() {
      const raw = await KV.get('ib');
      if (raw && raw.v === 1 && Array.isArray(raw.e)) {
        for (const [k, v, t] of raw.e) this.mem.set(k, { v, t, p: true });
      }
    }
    _scheduleSave() {
      if (this._saveTimer) return;
      this._saveTimer = setTimeout(() => { this._saveTimer = null; this.save(); }, 20000);
    }
    async save() {
      const entries = [];
      for (const [k, e] of this.mem) if (e.p) entries.push([k, e.v, e.t]);
      entries.sort((a, b) => b[2] - a[2]);
      await KV.set('ib', { v: 1, e: entries.slice(0, C.ib.cacheMax) });
    }
    get offline() { return this.offlineAt && now() - this.offlineAt < C.ib.offlineCooldown; }
    _cached(key) {
      const e = this.mem.get(key);
      if (!e) return undefined;
      const ttl = e.v == null ? C.ib.negTTL : C.ib.posTTL;
      if (now() - e.t > ttl) { this.mem.delete(key); return undefined; }
      return e.v;
    }
    _put(key, v, persist) {
      this.mem.set(key, { v, t: now(), p: persist !== false });
      if (persist !== false) this._scheduleSave();
    }
    // Why Infinibrowser can't be used right now, in plain words (or '' when it's fine).
    problem() {
      if (this.challengeAt && now() - this.challengeAt < C.ib.offlineCooldown) {
        return 'Infinibrowser wants to check your browser first. Click "Open Infinibrowser tab", let it finish loading, keep that tab open, then press Start.';
      }
      if (this.offline) {
        return "The game page can't reach infinibrowser.wiki. Click \"Open Infinibrowser tab\" and keep that tab open: recipes will be fetched through it.";
      }
      return '';
    }
    resetHealth() { this.offlineAt = 0; this.challengeAt = 0; this.failStreak = 0; }
    // Returns parsed JSON, null for a definite "unknown element", throws when unreachable.
    async _fetchJSON(path, params) {
      if (!this.enabled) throw new Error('ib-disabled');
      if (this.offline || (this.challengeAt && now() - this.challengeAt < C.ib.offlineCooldown)) throw new Error('ib-offline');
      const url = C.ib.base + path + '?' + Object.keys(params).map((k) => k + '=' + encodeURIComponent(params[k])).join('&');
      for (let attempt = 0; attempt <= C.ib.retries; attempt++) {
        let start = Math.max(now(), this.nextAt, this.cooldownUntil);
        // (gap 0 means no pacing at all, as in the tests.)
        if (C.ib.gap > 0 && C.ib.perMinute > 0) {
          const recent = this._recent = (this._recent || []).filter((t) => start - t < 60000);
          if (recent.length >= C.ib.perMinute) start = Math.max(start, recent[recent.length - C.ib.perMinute] + 60000);
          recent.push(start);
        }
        this.nextAt = start + C.ib.gap;
        if (start > now()) await sleep(start - now());
        this.requests++;
        let res;
        try {
          res = await httpGet(url, C.ib.timeout);
        } catch (e) {
          this.lastError = e.message;
          this.failStreak++;
          if (this.failStreak >= 4) { this.offlineAt = now(); throw new Error('ib-offline'); }
          await sleep(500 * (attempt + 1));
          continue;
        }
        if (res.status === 404 || res.status === 400) { this.failStreak = 0; return null; }
        if (res.status === 429) {
          this.rateLimited++;
          this.cooldownUntil = now() + Math.min(30000, 900 * Math.pow(2, attempt));
          continue;
        }
        if ((res.status === 403 || res.status === 503) && looksLikeChallenge(res)) {
          this.challengeAt = now();
          throw new Error('ib-challenge');
        }
        if (res.status >= 500) {
          // Usually a lineage the server can't compute; one quick retry, then "unknown".
          if (attempt >= 1) throw new Error('ib-' + res.status);
          await sleep(800);
          continue;
        }
        if (res.status < 200 || res.status >= 300) { this.failStreak = 0; return null; }
        try {
          const json = JSON.parse(res.text);
          this.failStreak = 0;
          this.offlineAt = 0;
          this.challengeAt = 0;
          this.lastOkAt = now();
          return json;
        } catch (e) {
          if (looksLikeChallenge(res)) { this.challengeAt = now(); throw new Error('ib-challenge'); }
          return null;
        }
      }
      throw new Error('ib-unavailable');
    }
    // Live connection check (never cached): true, or false with problem() explaining why.
    async ping() {
      this.resetHealth();
      try { await this._fetchJSON('/item', { id: 'Water' }); return true; } catch (e) { if (!this.offline && !this.challengeAt) this.offlineAt = now(); return false; }
    }
    _get(key, path, params, transform, persist) {
      const hit = this._cached(key);
      if (hit !== undefined) return Promise.resolve(hit);
      if (this.inflight.has(key)) return this.inflight.get(key);
      const p = (async () => {
        try {
          const json = await this._fetchJSON(path, params);
          const v = json == null ? null : transform(json);
          this._put(key, v, persist);
          return v;
        } finally {
          this.inflight.delete(key);
        }
      })();
      this.inflight.set(key, p);
      return p;
    }
    _learnExists(id) { if (id && this._cached('i:' + id) === undefined) this.mem.set('i:' + id, { v: { text: id }, t: now(), p: false }); }
    // All public lookups return undefined when Infinibrowser can't be reached (unknown),
    // null when the element is definitely not there.
    async item(id) {
      try {
        return await this._get('i:' + id, '/item', { id }, (j) => ({
          text: j.text != null ? j.text : id, emoji: j.emoji || '', depth: j.depth != null ? j.depth : null,
          recipes: j.recipe_count != null ? j.recipe_count : null, uses: j.use_count != null ? j.use_count : null
        }));
      } catch (e) { return undefined; }
    }
    async exists(id) {
      if (!id) return false;
      const v = await this.item(id);
      return v === undefined ? undefined : !!v;
    }
    knownExists(id) { const v = this._cached('i:' + id); return v === undefined ? undefined : !!v; }
    cachedItem(id) { return this._cached('i:' + id); }
    async lineage(id) {
      try {
        const steps = await this._get('l:' + id, '/recipe', { id }, (j) => {
          const out = [];
          for (const s of (j.steps || [])) {
            const a = s && s.a && s.a.id, b = s && s.b && s.b.id, r = s && s.result && s.result.id;
            if (a && b && r) out.push([a, b, r]);
          }
          return out.length ? out : null;
        });
        if (steps) for (const s of steps) { this._learnExists(s[0]); this._learnExists(s[1]); this._learnExists(s[2]); }
        return steps;
      } catch (e) { return undefined; }
    }
    async recipes(id, pages) { return this._list('recipes', id, pages || 1); }
    async uses(id, pages) { return this._list('uses', id, pages || 1); }
    // One cache entry per item, reused for any request that wants as many pages or fewer, so
    // wider searches never download the same pages again.
    async _list(kind, id, pages) {
      const key = (kind === 'recipes' ? 'r:' : 'u:') + id;
      const hit = this._cached(key);
      if (hit !== undefined && (hit === null || hit.complete || (hit.pages || 0) >= pages)) return hit;
      const fkey = key + ':' + pages;
      if (this.inflight.has(fkey)) return this.inflight.get(fkey);
      const p = (async () => {
        const out = [];
        let total = 0, offset = 0, complete = false, fetched = 0;
        try {
          for (let page = 0; page < pages; page++) {
            const json = await this._fetchJSON('/' + kind, { id, offset });
            if (json == null) { if (page === 0) { this._put(key, null); return null; } complete = true; break; }
            fetched++;
            total = typeof json.total === 'number' ? json.total : total;
            const rows = (kind === 'recipes' ? json.recipes : json.uses) || [];
            for (const row of rows) {
              if (kind === 'recipes') {
                const a = row && row[0] && row[0].id, b = row && row[1] && row[1].id;
                if (a && b) { out.push([a, b]); this._learnExists(a); this._learnExists(b); }
              } else {
                const other = row && row.pair && row.pair.id, res = row && row.result && row.result.id;
                if (other && res) { out.push([other, res]); this._learnExists(other); this._learnExists(res); }
              }
            }
            offset += rows.length;
            if (!rows.length || (total && offset >= total)) { complete = true; break; }
          }
          const v = { total, list: out, pages: fetched, complete };
          this._put(key, v);
          this._learnExists(id);
          return v;
        } catch (e) {
          return out.length ? { total, list: out } : undefined;
        } finally {
          this.inflight.delete(fkey);
        }
      })();
      this.inflight.set(fkey, p);
      return p;
    }
    // First variant of a name that Infinibrowser knows about.
    async resolve(target, exact) {
      const vars = Text.variants(target, exact);
      let unknown = false;
      for (const v of vars) {
        const ex = await this.exists(v);
        if (ex) return v;
        if (ex === undefined) unknown = true;
      }
      return unknown ? undefined : null;
    }
    clear() { this.mem.clear(); return KV.del('ib'); }
    // Drop cached "not on Infinibrowser" answers so newly uploaded items and recipes are seen.
    forgetMisses() { for (const [k, e] of Array.from(this.mem)) if (e.v == null) this.mem.delete(k); }
  }

  /* ============================================================
   * Game adapter: finds the Vue view-model, indexes inventory, crafts and reads results
   * ============================================================ */
  class Game {
    constructor() {
      this._vm = null;
      this._vmAt = 0;
      this._seq = 0;
      this._reset();
      this._sig = '';
      this._sigAt = 0;
      this.version = 0;
      this.lastChange = null;
      this.dragger = null;
    }
    _reset() {
      this.exact = new Set();
      this.byKey = new Map();
      this.bySoft = new Map();
      this.objs = new Map();
      this.wrapped = [];     // quoted/decorated names ("zor", #abc, .x), for resuming string builds
      this.hashSum = 0;      // order-independent fingerprint of the inventory
      this.born = new Map(); // name -> when it was first seen (see mark/isNewSince)
      this._n = 0;
      this._first = undefined;
      this._last = undefined;
    }
    _textOf(it) {
      const t = it && (it.text != null ? it.text : it.name);
      return t != null && t !== '' ? String(t) : null;
    }
    _add(t, obj, oldBorn) {
      if (obj) this.objs.set(t, obj);
      if (this.exact.has(t)) return;
      this.exact.add(t);
      const b = oldBorn && oldBorn.get(t);
      this.born.set(t, b !== undefined ? b : ++this._seq);
      const index = (map, k) => { const arr = map.get(k); if (arr) arr.push(t); else map.set(k, [t]); };
      index(this.byKey, Text.key(t));
      index(this.bySoft, Text.soft(t));
      if (Text.parse(t).w !== 'plain') this.wrapped.push(t);
      let h = 0;
      for (let j = 0; j < t.length; j++) h = (Math.imul(h, 31) + t.charCodeAt(j)) | 0;
      this.hashSum = (this.hashSum + (h >>> 0)) >>> 0;
    }
    _readNode(node) {
      const out = [];
      if (!node) return out;
      try {
        if (node.__vue__) out.push(node.__vue__);
        if (node.__vueParentComponent) out.push(node.__vueParentComponent.proxy || node.__vueParentComponent);
        if (node.__vue_app__ && node.__vue_app__._instance) out.push(node.__vue_app__._instance.proxy);
      } catch (e) {}
      return out;
    }
    _findVM() {
      const seeds = [C.container, '#app', '[data-v-app]', '#__nuxt', '#__layout', '.items', '.sidebar', 'main']
        .map((s) => document.querySelector(s)).concat([document.body]);
      const queue = [];
      for (const seed of seeds) {
        let node = seed, hop = 0;
        while (node && hop < 5) { queue.push(...this._readNode(node)); node = node.parentElement; hop++; }
      }
      const seen = new Set();
      let fallback = null, scanned = 0;
      const pushVnode = (vnode, depth) => {
        if (!vnode || depth > 12) return;
        if (vnode.component) { queue.push(vnode.component.proxy); return; }
        if (Array.isArray(vnode.children)) for (const ch of vnode.children) pushVnode(ch, depth + 1);
      };
      while (queue.length && scanned < 600) {
        const vm = queue.shift();
        if (!vm || seen.has(vm)) continue;
        seen.add(vm);
        scanned++;
        let craft, items;
        try { craft = vm.craft; items = vm.items; } catch (e) {}
        const hasItems = !!(items && typeof items.length === 'number');
        if (typeof craft === 'function' && hasItems) return vm;
        if (!fallback && hasItems) fallback = vm;
        try {
          if (vm.$parent) queue.push(vm.$parent);
          if (vm.$root) queue.push(vm.$root);
          if (Array.isArray(vm.$children)) queue.push(...vm.$children);
          if (vm.$ && vm.$.subTree) pushVnode(vm.$.subTree, 0);
        } catch (e) {}
      }
      return fallback;
    }
    vm() {
      const v = this._vm;
      if (v) {
        let ok = false;
        try { ok = typeof v.craft === 'function' && !!v.items; } catch (e) {}
        if (ok) return v;
      }
      if (now() - this._vmAt < 800) return v;
      this._vmAt = now();
      this._vm = this._findVM() || v;
      return this._vm;
    }
    // The current game exposes window.IC (getItems, createInstance, craft, ...); older
    // versions only had the Vue view-model with craft({text}, {text}).
    ic() {
      let ic = null;
      try { ic = W.IC; } catch (e) {}
      return ic && typeof ic.getItems === 'function' ? ic : null;
    }
    _vmCraft() { const v = this.vm(); return v && typeof v.craft === 'function' ? v : null; }
    hasApi() {
      const ic = this.ic();
      if (ic && typeof ic.createInstance === 'function' && (typeof ic.craft === 'function' || this._vmCraft())) return true;
      return !!this._vmCraft();
    }
    _rawItems() {
      const ic = this.ic();
      if (ic) {
        try { const list = ic.getItems(); if (list && typeof list.length === 'number') return list; } catch (e) {}
      }
      const v = this.vm();
      if (v && v.items && typeof v.items.length === 'number') return v.items;
      return null;
    }
    // Keeps the inventory index up to date. Big saves have tens of thousands of items, so only
    // new items are indexed; everything is re-indexed only when items disappear or the save
    // changes. force: check now instead of at most every 40 ms; 'full': re-index everything.
    refresh(force) {
      if (!force && now() - this._sigAt < 40) return false;
      this._sigAt = now();
      const list = this._rawItems();
      if (!list || !list.length) return this._refreshDom(force);
      const n = list.length;
      const first = this._textOf(list[0]), last = this._textOf(list[n - 1]);
      const prevN = this._n;
      if (force !== 'full' && n === prevN && first === this._first && last === this._last) return false;
      let kind = 'append', prev = null;
      if (force !== 'full' && prevN > 0 && n > prevN && first === this._first && this._textOf(list[prevN - 1]) === this._last) {
        // New items at the end (the usual case after a craft).
        for (let i = prevN; i < n; i++) { const t = this._textOf(list[i]); if (t) this._add(t, list[i]); }
      } else {
        // Something else changed: add whatever is new; if anything disappeared (or the save
        // changed), re-index everything.
        if (force !== 'full' && prevN > 0 && n >= prevN) {
          for (let i = 0; i < n; i++) { const t = this._textOf(list[i]); if (t) this._add(t, list[i]); }
        }
        if (force === 'full' || prevN === 0 || n < prevN || this.exact.size > n) {
          prev = this.exact;
          const oldBorn = this.born;
          this._reset();
          for (let i = 0; i < n; i++) { const t = this._textOf(list[i]); if (t) this._add(t, list[i], oldBorn); }
          kind = 'rebuild';
        }
      }
      this._n = n;
      this._first = first;
      this._last = last;
      this.version++;
      this.lastChange = { kind, prev };
      return true;
    }
    // No game API: read the item list from the page (older layouts).
    _refreshDom(force) {
      const els = document.querySelectorAll(C.itemSel);
      const sig = 'd' + els.length;
      if (force !== 'full' && sig === this._sig) return false;
      this._sig = sig;
      const prev = this.exact, oldBorn = this.born;
      this._reset();
      els.forEach((el) => {
        const t = (el.getAttribute('data-item-text') || el.textContent || '').trim();
        if (t) this._add(t, null, oldBorn);
      });
      this.version++;
      this.lastChange = { kind: 'rebuild', prev };
      return true;
    }
    names() { this.refresh(); return Array.from(this.exact); }
    // mark() before a craft, isNewSince(name, mark) after: was the item added in between?
    mark() { this.refresh(true); return this._seq; }
    isNewSince(name, mark) { const b = this.born.get(name); return b === undefined || b > mark; }
    count() { this.refresh(); return this.exact.size; }
    // mode: 'exact' (or true), 'case', 'loose' (or false); see Text.same.
    find(name, mode) {
      if (name == null) return null;
      this.refresh();
      if (this.exact.has(name)) return name;
      const trimmed = String(name).trim();
      if (this.exact.has(trimmed)) return trimmed;
      if (mode === true || mode === 'exact') return null;
      const arr = mode === 'case' ? this.bySoft.get(Text.soft(trimmed)) : this.byKey.get(Text.key(trimmed));
      if (!arr) return null;
      for (const c of arr) if (Text.same(c, trimmed, mode)) return c;
      return null;
    }
    has(name, mode) { return !!this.find(name, mode); }
    emojiOf(name) { const o = this.objs.get(name); return (o && o.emoji) || ''; }
    isDiscovery(name) {
      const o = this.objs.get(name);
      return !!(o && (o.discovery || o.discovered || o.isNew || o.is_new || o.firstDiscovery));
    }
    instances() {
      const ic = this.ic();
      if (ic && typeof ic.getInstances === 'function') {
        try { return ic.getInstances() || []; } catch (e) {}
      }
      const v = this.vm();
      return (v && v.instances) || null;
    }
    instanceCounts() {
      const out = {};
      const list = this.instances();
      if (!list || !list.length) return out;
      for (const inst of list) {
        const t = inst && (inst.text || (inst.item && inst.item.text) || (inst.element && inst.element.text) || (inst.$data && inst.$data.text));
        if (t) out[t] = (out[t] || 0) + 1;
      }
      return out;
    }
    _detect(before, ret) {
      if (ret && typeof ret === 'object') {
        const t = typeof ret.text === 'string' ? ret.text : (typeof ret.result === 'string' ? ret.result : null);
        if (t && t !== 'Nothing') return { text: t, isNew: this.isNewSince(t, before.mark) || !!(ret.isNew || ret.discovered) };
        if (t === 'Nothing') return { text: null, nothing: true };
      }
      const v = this.vm();
      if (v && v.items && v.items.length > before.len) {
        for (let i = before.len; i < v.items.length; i++) {
          const t = v.items[i] && v.items[i].text;
          if (t && this.isNewSince(t, before.mark)) return { text: t, isNew: true };
        }
        for (let i = 0; i < v.items.length; i++) {
          const t = v.items[i] && v.items[i].text;
          if (t && this.isNewSince(t, before.mark)) return { text: t, isNew: true };
        }
      }
      const after = this.instanceCounts();
      for (const t of Object.keys(after)) {
        let grew = after[t] - (before.inst[t] || 0);
        if (before.dragged && (t === before.a || t === before.b)) grew -= (before.a === before.b ? 2 : 1);
        if (grew > 0) return { text: t, isNew: this.isNewSince(t, before.mark) };
      }
      return null;
    }
    _cleanupInstance(beforeLen, result) {
      const list = this.instances();
      if (!list || list.length <= beforeLen) return;
      try {
        for (let i = list.length - 1; i >= beforeLen; i--) {
          const inst = list[i];
          const t = inst && (inst.text || (inst.item && inst.item.text));
          if (!result || t === result) { list.splice(i, 1); return; }
        }
      } catch (e) {}
    }
    // Craft a + b. Resolves {result, isNew, timedOut, error}. result null means "Nothing".
    async craft(a, b, opts) {
      opts = opts || {};
      this.refresh(true);
      const ic = this.ic();
      if (ic && typeof ic.createInstance === 'function') {
        const r = await this._craftIC(ic, a, b, opts);
        if (!r.error) return r;
        // The game may have replaced its item objects (e.g. after reloading the save): re-index
        // everything and try once more.
        this.refresh('full');
        return this._craftIC(ic, a, b, opts);
      }
      return this._craftLegacy(a, b, opts);
    }
    _spawnPoint(opts) {
      if (opts.show && this.dragger) {
        const s = this.dragger.nextSpot();
        return { x: s.targetX, y: s.targetY };
      }
      const sb = document.querySelector('#sidebar');
      const sw = sb ? sb.getBoundingClientRect().width : 0;
      return { x: Math.max(80, (window.innerWidth - sw) / 2), y: Math.max(80, window.innerHeight / 2) };
    }
    // Current game: put both items on the board and let the game combine them, exactly like
    // dragging one onto the other. The game returns { instance } for a result, nothing for Nothing.
    async _craftIC(ic, a, b, opts) {
      const A = this.objs.get(a), B = this.objs.get(b);
      if (!A || !B) return { result: null, error: 'missing-item' };
      const mark = this.mark();
      const lenBefore = (this._rawItems() || []).length;
      const p = this._spawnPoint(opts);
      const findInst = (text) => {
        const list = this.instances() || [];
        for (let i = list.length - 1; i >= 0; i--) if (list[i] && list[i].text === text) return list[i];
        return null;
      };
      const spawn = async (it, dx) => {
        const inst = await ic.createInstance({ text: it.text, emoji: it.emoji, itemId: it.id, discovery: it.discovery, x: p.x + dx, y: p.y, animate: false });
        return inst || findInst(it.text);
      };
      let ia = null, ib = null, res = null, timedOut = false, error = null;
      try {
        ia = await spawn(A, 0);
        ib = await spawn(B, 12);
        if (!ia || !ib) throw new Error('could not place items on the board');
        const v = this._vmCraft();
        const call = v ? v.craft(ia, ib) : ic.craft(ia, ib);
        res = await Promise.race([Promise.resolve(call), sleep(C.craftTimeout).then(() => { timedOut = true; return null; })]);
      } catch (e) { error = e; }
      let text = null;
      if (res && typeof res === 'object') {
        const inst = res.instance || res;
        if (inst && typeof inst.text === 'string') text = inst.text;
        else if (typeof res.result === 'string') text = res.result;
      }
      if (text === 'Nothing') text = null;
      if (!text && !error && !timedOut) {
        const list = this._rawItems() || [];
        for (let i = lenBefore; i < list.length; i++) {
          const t = list[i] && list[i].text;
          if (t && this.isNewSince(t, mark)) { text = t; break; }
        }
      }
      // Clean up what this craft put on the board (keep the result if "show crafts" is on).
      try {
        if (typeof ic.removeInstances === 'function') {
          const live = new Set(this.instances() || []);
          const out = res && res.instance;
          const drop = [ia, ib, opts.show ? null : out].filter((x) => x && live.has(x));
          if (drop.length) ic.removeInstances(drop);
        }
      } catch (e) {}
      this.refresh(true);
      return { result: text, isNew: !!(text && this.isNewSince(text, mark)), timedOut, error };
    }
    async _craftLegacy(a, b, opts) {
      const v = this.vm();
      const before = {
        mark: this.mark(),
        len: v && v.items ? v.items.length : 0,
        inst: this.instanceCounts(),
        instLen: (this.instances() || []).length,
        a, b, dragged: false
      };
      let ret = null, timedOut = false, error = null;
      if (opts.drag && this.dragger) {
        before.dragged = await this.dragger.combine(a, b);
      }
      if (!before.dragged) {
        if (!v || typeof v.craft !== 'function') return { result: null, error: 'no-api' };
        try {
          const p = Promise.resolve(v.craft({ text: a, emoji: this.emojiOf(a) }, { text: b, emoji: this.emojiOf(b) }));
          ret = await Promise.race([p, sleep(C.craftTimeout).then(() => { timedOut = true; return null; })]);
        } catch (e) { error = e; }
      }
      let det = null;
      const deadline = now() + (timedOut ? 200 : C.settleMax);
      if (C.settle > 0) await sleep(Math.min(C.settle, 60));
      for (;;) {
        det = this._detect(before, ret);
        if (det || now() >= deadline) break;
        await sleep(30);
      }
      if (!before.dragged) this._cleanupInstance(before.instLen, det && det.text);
      this.refresh(true);
      return { result: det ? det.text : null, isNew: !!(det && det.isNew), timedOut, error };
    }
  }

  /* ============================================================
   * Drag animation (optional, shows crafts on the board)
   * ============================================================ */
  class Dragger {
    constructor(game) { this.game = game; this.slot = 0; }
    itemEl(name) {
      const els = document.querySelectorAll(C.itemSel);
      let loose = null;
      for (const el of els) {
        const attr = el.getAttribute('data-item-text');
        if (attr != null) { if (attr === name) return el; continue; }
        const t = (el.textContent || '').trim();
        if (t === name) return el;
        if (!loose && t.endsWith(name) && t.length - name.length <= 8) loose = el;
      }
      return loose;
    }
    scroller() {
      let node = document.querySelector('.items');
      while (node && node !== document.body) {
        if (node.scrollHeight > node.clientHeight + 8) return node;
        node = node.parentElement;
      }
      return document.querySelector('.items');
    }
    async ensureVisible(name) {
      const el = this.itemEl(name);
      if (el) return el;
      const scroller = this.scroller();
      const v = this.game.vm();
      if (!scroller || !v || !v.items) return null;
      let index = -1;
      for (let i = 0; i < v.items.length; i++) if (v.items[i] && v.items[i].text === name) { index = i; break; }
      if (index < 0) return null;
      const sample = document.querySelector(C.itemSel);
      const h = sample ? Math.max(24, Math.round(sample.getBoundingClientRect().height || 0)) : 30;
      scroller.scrollTop = Math.max(0, index * h - Math.max(0, Math.floor((scroller.clientHeight - h) / 2)));
      await sleep(C.observeDebounce + 80);
      return this.itemEl(name);
    }
    nextSpot() {
      const left = Math.max(40, Math.min(Math.max(320, Math.floor(window.innerWidth * 0.38)), Math.max(40, window.innerWidth - 140)));
      const right = Math.max(left + 1, window.innerWidth - 72);
      const top = Math.max(40, Math.min(96, Math.max(40, window.innerHeight - 140)));
      const bottom = Math.max(top + 1, window.innerHeight - 72);
      const cols = Math.max(1, Math.floor((right - left) / 74));
      const rows = Math.max(1, Math.floor((bottom - top) / 42));
      const slot = this.slot % (cols * rows);
      this.slot = (slot + 1) % (cols * rows);
      const x = left + (slot % cols) * 74, y = top + Math.floor(slot / cols) * 42;
      return { targetX: x, targetY: y, sourceX: x + 10, sourceY: y + 8 };
    }
    _fire(target, type, x, y) {
      const init = { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: type.endsWith('up') ? 0 : 1 };
      try {
        if (typeof PointerEvent !== 'undefined') {
          const ptype = type.replace('mouse', 'pointer');
          target.dispatchEvent(new PointerEvent(ptype, Object.assign({ pointerId: 1, pointerType: 'mouse', isPrimary: true }, init)));
        }
      } catch (e) {}
      target.dispatchEvent(new MouseEvent(type, init));
    }
    async drag(el, dx, dy) {
      if (!el || !document.body.contains(el)) return false;
      const r = el.getBoundingClientRect();
      this._fire(el, 'mousedown', r.left + r.width / 2, r.top + r.height / 2);
      await sleep(C.step);
      this._fire(document, 'mousemove', dx, dy);
      await sleep(C.step);
      this._fire(document, 'mouseup', dx, dy);
      await sleep(C.step);
      return true;
    }
    async dragNamed(name, x, y) {
      const el = await this.ensureVisible(name);
      if (!el) return false;
      return this.drag(el, x, y);
    }
    async combine(a, b) {
      const spot = this.nextSpot();
      if (!(await this.dragNamed(b, spot.targetX, spot.targetY))) return false;
      await sleep(C.between);
      return this.dragNamed(a, spot.sourceX, spot.sourceY);
    }
    async sweep() {
      const ic = this.game.ic();
      if (ic && typeof ic.clearInstances === 'function') {
        try { ic.clearInstances(); this.slot = 0; return true; } catch (e) {}
      }
      const img = document.querySelector('img[src*="clear.svg"]');
      if (!img) return false;
      const btn = (img.closest && img.closest('button')) || img.parentElement || img;
      btn.click();
      await sleep(C.sweepWait);
      for (const b of document.querySelectorAll('button')) {
        if (b.textContent.trim().toLowerCase() === 'yes') {
          b.click();
          this.slot = 0;
          await sleep(C.sweepAfter);
          return true;
        }
      }
      return false;
    }
  }

  /* ============================================================
   * Text-tool library
   * Learns which elements act as text tools ("append b", "unquote", ...) by diffing
   * real recipes from Infinibrowser and by recording every craft the forge makes.
   * ============================================================ */
  const DEL_LAST_GUESSES = ['Backspace', 'Delete Last Letter', 'Remove Last Letter', 'Delete Last Character'];

  // Describe how `input` turned into `output` when combined with some other element.
  function classifyTransform(input, output) {
    if (!input || !output || input === output) return null;
    const a = Text.parse(input), b = Text.parse(output);
    const ac = a.core, bc = b.core;
    if (!ac || !bc) return null;
    const al = ac.toLowerCase(), bl = bc.toLowerCase();
    if (al === bl) {
      if (a.w !== b.w) return { k: b.w === 'plain' ? 'unwrap' : 'rewrap', x: '', f: a.w, t: b.w };
      if (ac === bc) return null;
      let mode = 'cap';
      if (bc === bc.toUpperCase()) mode = 'upper';
      else if (bc === bc.toLowerCase()) mode = 'lower';
      else if (bc === Text.title(bl)) mode = 'title';
      return { k: 'case', x: mode, f: a.w, t: b.w };
    }
    if (bc.length > ac.length && bl.startsWith(al)) return { k: 'app', x: bc.slice(ac.length), f: a.w, t: b.w };
    if (bc.length > ac.length && bl.endsWith(al)) return { k: 'pre', x: bc.slice(0, bc.length - ac.length), f: a.w, t: b.w };
    if (ac.length > 1 && bl === al.slice(0, -1)) return { k: 'dellast', x: '', f: a.w, t: b.w };
    if (ac.length > 1 && bl === al.slice(1)) return { k: 'delfirst', x: '', f: a.w, t: b.w };
    return null;
  }
  const sigOf = (t) => t.k + '|' + t.x + '|' + t.f + '>' + t.t;
  function parseSig(s) {
    const i = s.indexOf('|'), j = s.lastIndexOf('|');
    const ft = s.slice(j + 1).split('>');
    return { k: s.slice(0, i), x: s.slice(i + 1, j), f: ft[0], t: ft[1] };
  }
  const QUOTED = { dq: 1, cq: 1, sq: 1, csq: 1, gq: 1 };

  class ToolLibrary {
    constructor(ib) {
      this.ib = ib;
      this.obs = new Map();     // op -> Map(sig -> evidence count)
      this.stats = new Map();   // op + '\u0001' + sig -> {ok, fail}
      this.mined = new Set();   // probe ids already mined
      this.minedAt = 0;
      this._timer = null;
      this._appIndex = null;
    }
    async load() {
      const d = await KV.get('ops');
      if (!d || d.v !== 1) return;
      for (const [op, sigs] of d.obs || []) this.obs.set(op, new Map(sigs));
      for (const [k, s] of d.stats || []) this.stats.set(k, s);
      for (const p of d.mined || []) this.mined.add(p);
      this.minedAt = d.minedAt || 0;
    }
    _save() {
      if (this._timer) return;
      this._timer = setTimeout(() => {
        this._timer = null;
        KV.set('ops', {
          v: 1,
          obs: Array.from(this.obs, ([op, m]) => [op, Array.from(m)]),
          stats: Array.from(this.stats),
          mined: Array.from(this.mined).slice(-4000),
          minedAt: this.minedAt
        });
      }, 10000);
    }
    reset() { this.obs.clear(); this.stats.clear(); this.mined.clear(); this.minedAt = 0; this._appIndex = null; this._save(); }
    get size() { return this.obs.size; }
    observe(op, t, n) {
      if (!op || !t) return;
      // A one-letter "append" seen once is weak but still useful; ignore absurdly long ones.
      if ((t.k === 'app' || t.k === 'pre') && t.x.length > 40) return;
      let m = this.obs.get(op);
      if (!m) { m = new Map(); this.obs.set(op, m); }
      const s = sigOf(t);
      m.set(s, (m.get(s) || 0) + (n || 1));
      this._appIndex = null;
      this._save();
    }
    learnFromUses(input, list) {
      if (!list) return;
      for (const [other, res] of list) this.observe(other, classifyTransform(input, res));
    }
    learnFromRecipes(result, list) {
      if (!list) return;
      for (const [a, b] of list) {
        this.observe(b, classifyTransform(a, result));
        if (a !== b) this.observe(a, classifyTransform(b, result));
      }
    }
    learnFromCraft(a, b, result) {
      if (!result) return;
      this.observe(b, classifyTransform(a, result));
      if (a !== b) this.observe(a, classifyTransform(b, result));
    }
    record(op, sig, ok) {
      if (!op || !sig) return;
      const k = op + '\u0001' + sig;
      const s = this.stats.get(k) || { ok: 0, fail: 0 };
      if (ok) s.ok++; else s.fail++;
      this.stats.set(k, s);
      this._save();
    }
    score(op, sig) {
      const m = this.obs.get(op);
      const ev = m ? (m.get(sig) || 0) : 0;
      let total = 0;
      if (m) for (const n of m.values()) total += n;
      const consistency = total ? (ev + 0.5) / (total + 0.5) : 0.3;
      const st = this.stats.get(op + '\u0001' + sig) || { ok: 0, fail: 0 };
      const success = (st.ok + 1) / (st.ok + st.fail + 2);
      return (1 + Math.log2(1 + ev)) * (0.35 + consistency) * success * 4;
    }
    _buildAppIndex() {
      const idx = new Map();
      for (const [op, m] of this.obs) {
        for (const s of m.keys()) {
          const t = parseSig(s);
          if (t.k !== 'app' || !t.x) continue;
          const c = t.x[0].toLowerCase();
          let arr = idx.get(c);
          if (!arr) { arr = []; idx.set(c, arr); }
          arr.push({ op, sig: s, t });
        }
      }
      this._appIndex = idx;
      return idx;
    }
    // Elements known to append a prefix of `rest` to text wrapped like `fromW`.
    appenders(rest, fromW, exact) {
      if (!rest) return [];
      const idx = this._appIndex || this._buildAppIndex();
      const arr = idx.get(rest[0].toLowerCase()) || [];
      const out = [];
      for (const e of arr) {
        if (e.t.f !== fromW && !(QUOTED[e.t.f] && QUOTED[fromW])) continue;
        if (e.t.t === 'plain' && e.t.x.length < rest.length) continue;
        const okPrefix = exact ? rest.startsWith(e.t.x) : Text.startsCI(rest, e.t.x);
        if (!okPrefix) continue;
        let sc = this.score(e.op, e.sig) * (1 + 0.12 * Math.min(e.t.x.length, 12));
        if (e.t.f !== fromW) sc *= 0.6;
        if (!rest.startsWith(e.t.x)) sc *= 0.8;
        out.push({ op: e.op, adds: e.t.x, sig: e.sig, score: sc });
      }
      out.sort((x, y) => y.score - x.score);
      return out;
    }
    // Elements known to change wrapper/case/length of text wrapped like `fromW`.
    transforms(fromW, kinds) {
      const out = [];
      for (const [op, m] of this.obs) {
        for (const s of m.keys()) {
          const t = parseSig(s);
          if (kinds.indexOf(t.k) < 0) continue;
          if (t.f !== fromW && !(QUOTED[t.f] && QUOTED[fromW] && t.k !== 'rewrap')) continue;
          out.push({ op, sig: s, t, score: this.score(op, s) * (t.f === fromW ? 1 : 0.5) });
        }
      }
      out.sort((x, y) => y.score - x.score);
      return out;
    }
    hasAppendersFor(ch) {
      const idx = this._appIndex || this._buildAppIndex();
      return (idx.get(String(ch).toLowerCase()) || []).length > 0;
    }
    async _mineIds(ids, kind, onProgress, pages) {
      let done = 0;
      for (const id of ids) {
        const tag = kind + ':' + id + (pages ? ':' + pages : '');
        if (this.mined.has(tag)) { done++; continue; }
        const data = kind === 'uses' ? await this.ib.uses(id, pages || 2) : await this.ib.recipes(id, pages || 1);
        if (data === undefined) return false;   // Infinibrowser unreachable; try later
        if (data && data.list) {
          if (kind === 'uses') this.learnFromUses(id, data.list);
          else this.learnFromRecipes(id, data.list);
        }
        this.mined.add(tag);
        done++;
        if (onProgress) onProgress(done, ids.length);
      }
      this._save();
      return true;
    }
    // One-time (weekly) survey of how text tools behave on common quoted words.
    async ensureMined(onProgress, level) {
      level = level || 0;
      if (level >= 2 && (this.minedLevel || 0) < 2) {
        // Wider survey for later rounds: more words, more pages.
        const more = ['star', 'moon', 'king', 'word', 'name', 'sun', 'life', 'time', 'mr', 'the'];
        const ids = [];
        for (const w of more) ids.push(Text.wrap(w, 'dq'), Text.wrap(Text.capFirst(w), 'dq'), Text.wrap(w, 'cq'));
        if (await this._mineIds(ids, 'uses', onProgress && ((d) => onProgress(d, ids.length)), 3)) { this.minedLevel = 2; this._save(); }
      }
      if (this.minedAt && now() - this.minedAt < C.forge.opsMaxAge && this.obs.size) return true;
      const words = ['fire', 'water', 'hello', 'cat', 'tree', 'apple', 'dog', 'abc'];
      const useIds = [], recipeIds = [];
      for (const w of words) {
        const cap = Text.capFirst(w);
        useIds.push(Text.wrap(w, 'dq'), Text.wrap(cap, 'dq'), Text.wrap(w, 'cq'), '#' + w, '#' + cap);
        recipeIds.push(Text.wrap(w, 'dq'), Text.wrap(cap, 'dq'));
      }
      const all = useIds.length + recipeIds.length;
      const ok1 = await this._mineIds(useIds, 'uses', (d) => onProgress && onProgress(d, all));
      const ok2 = ok1 && await this._mineIds(recipeIds, 'recipes', (d) => onProgress && onProgress(useIds.length + d, all));
      if (ok1 && ok2) { this.minedAt = now(); this._save(); }
      return ok1 && ok2;
    }
    // Targeted survey: who appends this character? Look at recipes of short quoted strings ending in it.
    // Each level surveys more: more leading letters, capitals, curly quotes, then more pages.
    // `before` is the text being built: recipes of quoted texts that end the same way plus this
    // character ("rem" -> "reme") show which tools others used in exactly this spot.
    async mineChar(ch, level, before) {
      level = level || 0;
      const lc = ch.toLowerCase(), uc = ch.toUpperCase();
      let leads = ['a', 'e', 'o', 'i', lc];
      if (level >= 1) leads = leads.concat('bcdfghjklmnpqrstuvwxyz'.split(''));
      if (level >= 2) leads = leads.concat('AEIOUMSTR'.split(''), '0123'.split(''), [' ']);
      const ids = [];
      for (const lead of leads) {
        ids.push(Text.wrap(lead + lc, 'dq'));
        if (uc !== lc) ids.push(Text.wrap(lead + uc, 'dq'));
        if (level >= 2) ids.push(Text.wrap(lead + lc, 'cq'));
      }
      ids.push(Text.wrap('a' + lc, 'cq'), Text.wrap('A' + lc, 'dq'));
      if (level >= 2) for (const w of ['sq', 'dot', 'cq']) ids.push(Text.wrap(ch, w));
      if (/[^\p{L}\p{N}]/u.test(ch)) {
        // Spaces and punctuation: look at how the community built quoted words ending in it,
        // and quoted phrases that contain it.
        const words = ['hello', 'the', 'mr', 'a', 'my', 'new', 'good', 'big', 'fire', 'ice', 'dr', 'st', 'i', 'you', 'what'];
        for (const w of words.slice(0, level >= 1 ? words.length : 6)) {
          for (const form of [w, Text.capFirst(w)]) ids.push(Text.wrap(form + ch, 'dq'), Text.wrap(form + ch, 'cq'));
        }
        if (ch === ' ') {
          for (const p of ['hello world', 'the end', 'ice cream', 'new york', 'good morning', 'mr bean', 'mr. bean', 'big bang', 'fire truck', 'game over']) {
            ids.push(Text.wrap(p, 'dq'), Text.wrap(Text.title(p), 'dq'), Text.wrap(p, 'cq'));
          }
        }
      }
      if (before) {
        for (let k = 1; k <= Math.min(level >= 3 ? 6 : 4, before.length); k++) {
          const tail = before.slice(-k) + ch;
          for (const form of [tail, tail.toLowerCase(), Text.capFirst(tail.toLowerCase())]) ids.push(Text.wrap(form, 'dq'), Text.wrap(form, 'cq'));
        }
      }
      await this._mineIds(Array.from(new Set(ids)), 'recipes', null, level >= 3 ? Math.min(3, level - 1) : 0);
      if (level >= 2) await this._mineIds([Text.wrap(ch, 'sq'), Text.wrap(ch, 'cq'), Text.wrap(lc, 'dq')], 'uses', null, 2);
      return this.hasAppendersFor(ch);
    }
  }

  /* ============================================================
   * Word Forge: obtain(target) tries every strategy, escalating until it gets the word
   * ============================================================ */
  class Forge {
    constructor(app) {
      this.app = app;
      this.game = app.game;
      this.ib = app.ib;
      this.mem = app.mem;
      this.tools = app.tools;
      this.verified = new Set();   // pairs actually crafted this session
      this.trace = [];             // recent pairs the forge asked for (for Copy Debug Info)
      this.lastCtx = null;
    }
    _check(ctx) { return this.app.checkpoint(ctx.token); }
    _say(ctx, msg, progress) { this.app.forgeStatus(ctx, msg, progress); }
    _done(ctx) { return this.game.find(ctx.target, ctx.match); }
    // Notes explain why a word isn't made yet; prio says how specific a note is (the most
    // specific one is shown to the player).
    _note(ctx, msg, prio) {
      if (!ctx.notes) return;
      if (ctx.notes.indexOf(msg) < 0) ctx.notes.push(msg);
      ctx.noteP = ctx.noteP || {};
      ctx.noteP[msg] = Math.max(ctx.noteP[msg] || 0, prio || 5);
    }
    reason(ctx) {
      let best = '', bp = -1;
      for (const m of ctx.notes || []) { const p = (ctx.noteP && ctx.noteP[m]) || 5; if (p >= bp) { best = m; bp = p; } }
      return best;
    }
    _plan(ctx, msg) { if (ctx.nest === 0) this.app.log('plan', msg); }

    // ---------- crafting primitive ----------
    // Pair results never change, so a remembered result is reused instead of crafting again.
    // Exception: if Infinibrowser's recipe says this pair makes `expect` but memory disagrees
    // (old or mis-recorded history), craft it once this session to find out for sure.
    async craftPair(a, b, ctx, why, expect) {
      await this._check(ctx);
      const k = pairKey(a, b);
      const known = this.mem.result(a, b);
      const doubt = expect !== undefined && known !== expect && !this.verified.has(k);
      if (known !== undefined && !doubt) {
        if (known && this.game.has(known, true)) { this._traced(a, b, known, why, 'mem'); return known; }
        if (known === '') { this._traced(a, b, '', why, 'mem'); return null; }
      }
      const res = await this.app.craft(a, b, why);
      this._traced(a, b, res.result || '', why, res.timedOut ? 'timeout' : (res.error ? 'error' : 'new'));
      if (!res.timedOut && !res.error) this.verified.add(k);
      ctx.crafts++;
      if (res.result) {
        ctx.path.push([a, b, res.result]);
        this.tools.learnFromCraft(a, b, res.result);
      }
      return res.result;
    }

    _traced(a, b, r, why, src) {
      this.trace.push([a, b, r, why || '', src]);
      if (this.trace.length > 2500) this.trace.splice(0, this.trace.length - 2000);
    }

    // ---------- Strategy 1: Infinibrowser lineages with self-healing ----------
    // Top-level ensure() calls that fail are remembered for the rest of the round, so the search
    // doesn't replay the same broken recipe every time it wants that item.
    async ensure(name, ctx, depth, trail) {
      if (trail) return this._ensure(name, ctx, depth, trail);
      const owned = this.game.find(name, true);
      if (owned) return owned;
      const memo = ctx.cantMake;
      if (memo && memo.has(name) && memo.get(name) >= depth) return null;
      const got = await this._ensure(name, ctx, depth, null);
      if (!got && memo && !this.ib.problem()) memo.set(name, Math.max(depth, memo.has(name) ? memo.get(name) : -1));
      return got;
    }
    async _ensure(name, ctx, depth, trail) {
      const owned = this.game.find(name, true);
      if (owned) return owned;
      if (depth < 0) return null;
      trail = trail || new Set();
      if (trail.has(name)) return null;
      await this._check(ctx);
      const next = new Set(trail);
      next.add(name);
      const bank = this.mem.bankGet(name);
      if (bank && bank.text && bank.name === name) {
        await this.runSteps(parseLineageText(bank.text), ctx, depth, next);
        const got = this.game.find(name, true);
        if (got) return got;
      }
      const steps = await this.ib.lineage(name);
      if (steps && steps.length) {
        this._say(ctx, 'Recipe for ' + name + ' (' + steps.length + ' steps)');
        await this.runSteps(steps, ctx, depth, next);
        const got = this.game.find(name, true);
        if (got) return got;
      }
      return this._viaRecipes(name, ctx, depth, next);
    }
    async _input(name, ctx, depth, trail) {
      const owned = this.game.find(name, true);
      if (owned) return owned;
      const got = await this.ensure(name, ctx, depth - 1, trail);
      if (got) return got;
      return this.game.find(name, false);
    }
    async runSteps(steps, ctx, depth, trail) {
      for (let i = 0; i < steps.length; i++) {
        const [a, b, r] = steps[i];
        if (this.game.has(r, true)) continue;
        await this._check(ctx);
        const ia = await this._input(a, ctx, depth, trail);
        if (!ia) return false;
        const ib = await this._input(b, ctx, depth, trail);
        if (!ib) return false;
        if (this.game.has(r, true)) continue;
        this._say(ctx, 'Step ' + (i + 1) + '/' + steps.length + ': ' + ia + ' + ' + ib + ' → ' + r, (i + 1) / steps.length);
        const res = await this.craftPair(ia, ib, ctx, 'recipe', r);
        if (res === r || this.game.has(r, true)) continue;
        // Infinibrowser's step didn't reproduce in this game; find another route to r.
        this.mem.markBad(r, ia, ib);
        this.app.logOnce('fix', ia + ' + ' + ib + ' gave ' + (res || 'nothing') + ', expected ' + r + '; rerouting');
        if (!(await this._viaRecipes(r, ctx, depth - 1, trail))) return false;
      }
      return true;
    }
    async _viaRecipes(name, ctx, depth, trail) {
      if (depth < 0) return null;
      const data = await this.ib.recipes(name, depth >= 2 ? 2 : 1);
      if (!data || !data.list || !data.list.length) return null;
      this.tools.learnFromRecipes(name, data.list);
      const cands = [];
      for (const [a, b] of data.list) {
        if (this.mem.isBad(name, a, b)) continue;
        if (trail && (trail.has(a) || trail.has(b))) continue;
        const known = this.mem.result(a, b);
        if (known !== undefined && known !== name) continue;
        const ha = this.game.has(a, true), hb = this.game.has(b, true);
        cands.push({ a, b, cost: (ha ? 0 : 1) + (hb ? 0 : 1) + (a.length + b.length) / 400 });
      }
      cands.sort((x, y) => x.cost - y.cost);
      for (const c of cands.slice(0, ctx.level.branches)) {
        await this._check(ctx);
        const ia = await this._input(c.a, ctx, depth - 1, trail);
        if (!ia) continue;
        const ib = await this._input(c.b, ctx, depth - 1, trail);
        if (!ib) continue;
        const have = this.game.find(name, true);
        if (have) return have;
        this._say(ctx, 'Alternate for ' + name + ': ' + ia + ' + ' + ib);
        const res = await this.craftPair(ia, ib, ctx, 'alternate', name);
        const got = this.game.find(name, true);
        if (got) return got;
        if (res !== name) this.mem.markBad(name, ia, ib);
      }
      return null;
    }
    // Every spelling that counts as the target (Fire Truck, fire truck, FIRE TRUCK, ...) that
    // someone has already uploaded to Infinibrowser, cheapest recipe first.
    async _wikiMatches(ctx) {
      const found = [];
      let unknown = false;
      for (const v of Text.variants(ctx.target, ctx.match)) {
        if (ctx.match !== 'loose' && !Text.same(v, ctx.target, ctx.match)) continue;
        await this._check(ctx);
        const info = await this.ib.item(v);
        if (info === undefined) { unknown = true; continue; }
        if (info) found.push({ id: v, depth: typeof info.depth === 'number' ? info.depth : 1e6 });
      }
      found.sort((a, b) => a.depth - b.depth);
      return { found, unknown };
    }
    async viaInfinibrowser(ctx) {
      ctx.strategy = 'Infinibrowser recipe';
      const bank = this.mem.bankGet(ctx.target);
      if (bank && bank.text) {
        this._say(ctx, 'Replaying saved recipe (' + (bank.steps || '?') + ' steps)');
        await this.runSteps(parseLineageText(bank.text), ctx, ctx.level.depth, new Set());
        if (this._done(ctx)) return true;
      }
      this._say(ctx, 'Looking up "' + ctx.target + '" on Infinibrowser...');
      const { found, unknown } = await this._wikiMatches(ctx);
      if (!found.length) {
        const msg = unknown ? (this.ib.problem() || 'Infinibrowser could not be reached') : '"' + ctx.target + '" is not on Infinibrowser yet';
        this._note(ctx, msg, unknown ? 9 : 1);
        if (!ctx.lookupLogged) { ctx.lookupLogged = true; this._plan(ctx, msg + (unknown ? '' : ', so it will be built letter by letter')); }
        return false;
      }
      for (const f of found) {
        await this._check(ctx);
        const steps = await this.ib.lineage(f.id);
        if (!ctx.lookupLogged) {
          ctx.lookupLogged = true;
          this._plan(ctx, 'Found ' + f.id + ' on Infinibrowser' + (steps ? ': crafting its ' + steps.length + '-step recipe' : '; crafting it from its recipes'));
        }
        await this.ensure(f.id, ctx, ctx.level.depth, null);
        if (this._done(ctx)) return true;
      }
      this._note(ctx, 'the Infinibrowser recipe for ' + found[0].id + " didn't fully work in this game", 7);
      return false;
    }

    // ---------- Strategy 2: phrases from words ----------
    // "Mr. Eremey Jeremy" = "Mr. Eremey" + "Jeremy". First only with parts that already exist
    // (in your inventory or on Infinibrowser); with build=true, missing parts are made first
    // (looked up, phrased or built letter by letter), then combined. A pair already known to
    // make something else is never crafted again.
    // exact: make this precise spelling (for extra pairings), not just any capitalization.
    async _buildPart(part, ctx, exact) {
      this._say(ctx, 'Making the part "' + part + '" first');
      const sub = await this.obtain(part, { match: exact ? 'exact' : 'case', token: ctx.token, nest: ctx.nest + 1, level: ctx.li || ctx.levelIndex, parent: ctx });
      ctx.crafts += sub.ctx.crafts;
      if (!sub.ok) this._note(ctx, "couldn't make the part \"" + part + '"' + (this.reason(sub.ctx) ? ' (' + this.reason(sub.ctx) + ')' : ''), 4);
      return sub.ok ? sub.name : null;
    }
    // Spellings of a part that exist (owned or on Infinibrowser), best first. Each spelling is a
    // different item in the game, so each pairing is a fresh chance.
    async _partSpellings(part) {
      const out = [];
      const owned = this.game.find(part, 'case');
      if (owned) out.push(owned);
      for (const v of Text.variants(part, 'case')) {
        if (out.indexOf(v) >= 0) continue;
        if (this.game.has(v, true) || (await this.ib.exists(v))) out.push(v);
      }
      return out;
    }
    async viaCompound(ctx, build) {
      const tokens = ctx.target.split(/\s+/);
      if (tokens.length < 2) return false;
      if (build && ctx.nest >= C.forge.maxNest) return false;
      ctx.strategy = build ? 'Phrase (making the parts)' : 'Phrase from known words';
      const splits = [];
      for (let k = 1; k < tokens.length; k++) {
        await this._check(ctx);
        const left = tokens.slice(0, k).join(' '), right = tokens.slice(k).join(' ');
        const Ls = await this._partSpellings(left), Rs = await this._partSpellings(right);
        splits.push({ left, right, Ls, Rs, known: (Ls.length ? 1 : 0) + (Rs.length ? 1 : 0), balance: -Math.abs(tokens.length / 2 - k) });
      }
      splits.sort((a, b) => (b.known - a.known) || (b.balance - a.balance));
      // Pairings allowed this round; later rounds try more spellings.
      let budget = ctx.level.splits * (build ? 2 : 3);
      const variantsAllowed = 1 + Math.min(4, ctx.level.mine || 0);
      for (const sp of splits) {
        if (budget <= 0) break;
        if (sp.known < 2 && !build) continue;
        await this._check(ctx);
        // Missing parts are made first (once per spelling); later rounds also make
        // lower-case / Title spellings of them for extra pairings.
        if (!sp.Ls.length || (build && sp.Ls.length < variantsAllowed && ctx.level.mine >= 2)) {
          if (!build) continue;
          for (const form of this._buildForms(sp.left, variantsAllowed)) {
            if (sp.Ls.some((x) => x === form)) continue;
            const got = await this._buildPart(form, ctx, sp.Ls.length > 0);
            if (got && sp.Ls.indexOf(got) < 0) sp.Ls.push(got);
            if (this._done(ctx)) return true;
          }
        }
        if (!sp.Rs.length || (build && sp.Rs.length < variantsAllowed && ctx.level.mine >= 2)) {
          if (!build) continue;
          for (const form of this._buildForms(sp.right, variantsAllowed)) {
            if (sp.Rs.some((x) => x === form)) continue;
            const got = await this._buildPart(form, ctx, sp.Rs.length > 0);
            if (got && sp.Rs.indexOf(got) < 0) sp.Rs.push(got);
            if (this._done(ctx)) return true;
          }
        }
        for (const L of sp.Ls.slice(0, variantsAllowed)) {
          for (const R of sp.Rs.slice(0, variantsAllowed)) {
            if (budget <= 0) break;
            const known = this.mem.result(L, R);
            if (known !== undefined && !Text.same(known, ctx.target, ctx.match)) continue;
            budget--;
            const l = await this.ensure(L, ctx, ctx.level.depth, null);
            if (!l) continue;
            const r = await this.ensure(R, ctx, ctx.level.depth, null);
            if (!r) continue;
            if (this._done(ctx)) return true;
            this._say(ctx, 'Combining ' + l + ' + ' + r);
            const res = await this.craftPair(l, r, ctx, 'phrase');
            if (this._done(ctx)) { this._plan(ctx, 'Made it by combining ' + l + ' + ' + r); return true; }
            this._note(ctx, l + ' + ' + r + ' made ' + (res || 'nothing'), 3);
          }
        }
      }
      return false;
    }
    _buildForms(part, n) {
      const forms = [part, Text.title(part.toLowerCase()), part.toLowerCase(), Text.capFirst(part.toLowerCase())];
      return Array.from(new Set(forms)).slice(0, n);
    }

    // ---------- Strategy 3: string building (letter by letter, any text) ----------
    async _longestExisting(make, maxLen, minLen) {
      minLen = minLen || 1;
      const ex = async (len) => {
        const id = make(len);
        if (this.game.has(id, true)) return true;
        return !!(await this.ib.exists(id));
      };
      let lo = minLen - 1, hi = maxLen + 1, p = minLen;
      while (p <= maxLen) {
        if (await ex(p)) { lo = p; if (p === maxLen) break; p = Math.min(maxLen, p * 2); }
        else { hi = p; break; }
      }
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (await ex(mid)) lo = mid; else hi = mid;
      }
      return lo >= minLen ? lo : 0;
    }
    _caseForms(s, exact) {
      if (exact) return [s];
      return Array.from(new Set([s, s.toLowerCase(), Text.capFirst(s.toLowerCase())]));
    }
    async _seeds(goal, ctx) {
      const out = [];
      const seen = new Set();
      const add = (id, len, w, owned) => { if (!seen.has(id)) { seen.add(id); out.push({ id, len, w, owned }); } };
      // Resume from anything already built in this save ("Zorbl" -> keep going). Only quoted
      // and decorated names can be resumed (the game keeps a separate list of those).
      this.game.refresh();
      for (const name of this.game.wrapped) {
        const p = Text.parse(name);
        if (!p.core || p.core.length < 2) continue;
        if (ctx.exact ? goal.startsWith(p.core) : Text.startsCI(goal, p.core)) add(name, p.core.length, p.w, true);
      }
      const whole = this.game.find(goal, ctx.exact ? 'exact' : 'case');
      if (whole && Text.parse(whole).w === 'plain') add(whole, goal.length, 'plain', true);
      for (const cf of this._caseForms(goal, ctx.exact)) {
        for (const w of ['dq', 'cq']) {
          await this._check(ctx);
          const k = await this._longestExisting((len) => Text.wrap(cf.slice(0, len), w), Math.min(cf.length, 64));
          if (k > 0) add(Text.wrap(cf.slice(0, k), w), k, w, false);
        }
      }
      // Nothing quoted starts with this character: the plain item ("0") can be quoted.
      if (!out.some((sd) => sd.w !== 'plain' && sd.len >= 1)) {
        for (const f of this._caseForms(goal[0], ctx.exact)) {
          const owned = this.game.find(f, true);
          if (owned) add(owned, 1, 'plain', true);
          else if (await this.ib.exists(f)) add(f, 1, 'plain', false);
        }
      }
      // Longest real word the target starts with (needs a quote tool afterwards).
      if (!/\s/.test(goal.slice(0, 3))) {
        for (const cf of Array.from(new Set([Text.title(goal), goal]))) {
          const k = await this._longestExisting((len) => cf.slice(0, len), Math.min(cf.length, 40), 3);
          if (k >= 3) add(cf.slice(0, k), k, 'plain', false);
        }
      }
      out.sort((a, b) => (b.len - a.len) || ((a.w === 'dq' ? 0 : 1) - (b.w === 'dq' ? 0 : 1)));
      return out;
    }
    async _tryTool(op, input, ctx) {
      const owned = this.game.find(op, true);
      const tool = owned || await this.ensure(op, ctx, Math.min(ctx.level.depth, 5), null);
      if (!tool) return { missing: true };
      const res = await this.craftPair(input, tool, ctx, 'text tool');
      return { res, tool };
    }
    async _existsOrOwned(id) {
      if (this.game.has(id, true)) return true;
      return !!(await this.ib.exists(id));
    }
    async _rewrap(st, goal, ctx) {
      const cands = this.tools.transforms('plain', ['rewrap']).filter((c) => QUOTED[c.t.t]).slice(0, ctx.level.cands);
      for (const g of TOOL_GUESSES.quote) if (!cands.some((c) => c.op === g)) cands.push({ op: g, sig: 'rewrap||plain>dq', guess: true });
      let tries = 0;
      for (const c of cands) {
        if (tries >= ctx.level.cands) break;
        if (c.guess && !(await this._existsOrOwned(c.op))) continue;
        tries++;
        const r = await this._tryTool(c.op, st.text, ctx);
        if (r.missing || !r.res) { this.tools.record(c.op, c.sig, false); continue; }
        const p = Text.parse(r.res);
        const ok = QUOTED[p.w] && Text.startsCI(goal, p.core) && p.core.length >= st.core.length;
        this.tools.record(c.op, c.sig, !!ok);
        if (ok) return Object.assign(p, { text: r.res });
      }
      return null;
    }
    async _appendCandidates(cur, rest, goal, ctx) {
      const out = [];
      const seen = new Set();
      const add = (op, adds, sig, score) => {
        if (!op || seen.has(op)) return;
        seen.add(op);
        out.push({ op, adds, sig, score });
      };
      // A) Infinibrowser already knows crafts from this exact text that move toward the goal.
      if (this.ib.knownExists(cur.text) === true) {
        const uses = await this.ib.uses(cur.text, 2);
        if (uses && uses.list) {
          this.tools.learnFromUses(cur.text, uses.list);
          const good = [];
          for (const [other, res] of uses.list) {
            const p = Text.parse(res);
            if (p.w === 'plain' && !Text.eqCI(p.core, goal)) continue;
            if ((ctx.exact ? goal.startsWith(p.core) : Text.startsCI(goal, p.core)) && p.core.length > cur.core.length) good.push({ other, p });
          }
          good.sort((x, y) => y.p.core.length - x.p.core.length);
          for (const g of good.slice(0, 4)) add(g.other, g.p.core.slice(cur.core.length), null, 1000 + g.p.core.length);
        }
      }
      // B) A quoted chunk of what's left that already exists ("foo" + “bar” -> “foobar”).
      // Later rounds also try other quote styles for the chunk.
      if (rest.length >= 2) {
        for (const w of (ctx.levelIndex >= 1 ? ['cq', 'sq', 'dq'] : ['cq'])) {
          const k = await this._longestExisting((len) => Text.wrap(rest.slice(0, len), w), Math.min(rest.length, 32), 2);
          if (k >= 2) add(Text.wrap(rest.slice(0, k), w), rest.slice(0, k), 'app|' + rest.slice(0, k) + '|' + cur.w + '>' + (w === 'cq' ? 'cq' : cur.w), 200 + k);
        }
      }
      const ch = rest[0];
      // C) Tools learned from Infinibrowser recipes and our own crafts.
      for (const c of this.tools.appenders(rest, cur.w, ctx.exact).slice(0, Math.max(10, ctx.level.cands))) add(c.op, c.adds, c.sig, 20 + c.score);
      // D) Conventional one-letter appenders: 'x'  .x  “x”, later also ‘x’ and "x".
      const forms = ctx.exact ? [ch] : Array.from(new Set([ch, ch.toLowerCase(), ch.toUpperCase()]));
      for (const w of (ctx.levelIndex >= 1 ? ['sq', 'dot', 'cq', 'csq', 'dq'] : ['sq', 'dot', 'cq'])) {
        for (const f of forms) {
          const id = Text.wrap(f, w);
          if (seen.has(id)) continue;
          if (await this._existsOrOwned(id)) {
            const sig = 'app|' + f + '|' + cur.w + '>' + (w === 'cq' ? 'cq' : cur.w);
            add(id, f, sig, 6 + this.tools.score(id, sig) + (f === ch ? 1 : 0) + (w === 'sq' ? 1 : 0));
          }
        }
      }
      // E) Nothing known for this character yet: mine Infinibrowser for it, then look again.
      if (!out.some((c) => c.adds && Text.startsCI(rest, c.adds))) {
        this._say(ctx, 'Learning how to add "' + ch + '"...');
        await this.tools.mineChar(ch, ctx.level.mine);
        for (const c of this.tools.appenders(rest, cur.w, ctx.exact).slice(0, Math.max(10, ctx.level.cands))) add(c.op, c.adds, c.sig, 20 + c.score);
      }
      // Building a piece to attach: finish it with a curly-quote tool so the piece comes out
      // curly (“…”), which attaches to straight-quoted text.
      if (ctx.preferW) for (const c of out) if (c.sig && c.adds && c.adds.length === rest.length && c.sig.endsWith('>' + ctx.preferW)) c.score += 300;
      // Keep the capitalization the user typed whenever a case-exact route exists.
      for (const c of out) if (c.adds && rest.startsWith(c.adds)) c.score += c.score >= 1000 ? 0.5 : 15;
      // Prefer tools you already have, then tools with short Infinibrowser recipes.
      for (const c of out) {
        if (c.score >= 1000) continue;
        if (this.game.has(c.op, true)) { c.score += 5; continue; }
        const info = this.ib.cachedItem(c.op);
        if (info && typeof info.depth === 'number') c.score -= Math.min(info.depth, 40) * 0.2;
      }
      out.sort((x, y) => y.score - x.score);
      return out.slice(0, ctx.level.cands);
    }
    _commonPrefixCI(a, b) {
      const x = a.toLowerCase(), y = b.toLowerCase();
      let i = 0;
      while (i < x.length && i < y.length && x[i] === y[i]) i++;
      return i;
    }
    // An appender went too far ("crab" when we wanted "cra..."): delete the extra letters (up to
    // three) with a backspace-type tool to keep the progress.
    async _repair(next, prevLen, goal, ctx) {
      const lcp = this._commonPrefixCI(next.core, goal);
      const extra = next.core.length - lcp;
      if (lcp <= prevLen || extra < 1 || extra > 3) return null;
      let st = next;
      for (let i = 0; i < extra; i++) {
        st = await this._deleteLast(st, ctx);
        if (!st) return null;
      }
      return Text.startsCI(goal, st.core) && st.core.length > prevLen ? st : null;
    }
    async _deleteLast(st, ctx) {
      const cands = this.tools.transforms(st.w, ['dellast']).slice(0, 3);
      for (const g of DEL_LAST_GUESSES) if (!cands.some((c) => c.op === g)) cands.push({ op: g, sig: 'dellast||' + st.w + '>' + st.w, guess: true });
      let tries = 0;
      for (const c of cands) {
        if (tries >= 3) break;
        if (c.guess && !(await this._existsOrOwned(c.op))) continue;
        tries++;
        const r = await this._tryTool(c.op, st.text, ctx);
        if (r.missing || !r.res) continue;
        const p = Text.parse(r.res);
        const ok = p.w !== 'plain' && Text.eqCI(p.core, st.core.slice(0, -1));
        this.tools.record(c.op, c.sig, ok);
        if (ok) return Object.assign(p, { text: r.res });
      }
      return null;
    }
    _coreDone(core, goal, ctx) { return ctx.exact ? core === goal : Text.eqCI(core, goal); }
    // Depth-first append search. A pair's result never changes, so when every appender fails
    // on one text, back up and build a different variant of an earlier prefix ("zorB" instead
    // of "zorb"); that opens fresh pairs. Bounded by the level's craft budget.
    // onDone(state) is tried on every complete text it reaches; if that fails (e.g. this
    // exact text won't unquote), the search keeps looking for another complete variant.
    async _extend(st, goal, ctx, onDone) {
      const startCrafts = ctx.crafts;
      const visited = new Set();
      const prefixOk = (core) => (ctx.exact ? goal.startsWith(core) : Text.startsCI(goal, core));
      const dfs = async (cur, depth) => {
        await this._check(ctx);
        if (this._coreDone(cur.core, goal, ctx)) {
          if (!onDone) return cur;
          if (visited.has(cur.text)) return null;
          visited.add(cur.text);
          return (await onDone(cur)) || this._done(ctx) ? true : null;
        }
        if (!prefixOk(cur.core) || visited.has(cur.text) || depth > goal.length + 6) return null;
        visited.add(cur.text);
        if (!ctx.best || cur.core.length > ctx.best.core.length) ctx.best = cur;
        const rest = goal.slice(cur.core.length);
        this._say(ctx, 'Building ' + cur.text + ' + "' + rest.slice(0, 16) + (rest.length > 16 ? '…' : '') + '"', cur.core.length / goal.length);
        const tried = new Set();
        const tryCands = async (cands) => {
          for (const c of cands) {
            if (tried.has(c.op)) continue;
            tried.add(c.op);
            if (ctx.crafts - startCrafts >= ctx.level.appendCrafts) return 'budget';
            const out = await tryOne(c);
            if (out) return out;
          }
          return null;
        };
        const tryOne = async (c) => {
          const r = await this._tryTool(c.op, cur.text, ctx);
          if (r.missing) return null;
          const res = r.res;
          if (res && Text.same(res, ctx.target, ctx.match)) return true;
          const p = res ? Text.parse(res) : null;
          let next = null;
          if (p && prefixOk(p.core) && p.core.length > cur.core.length && (p.w !== 'plain' || this._coreDone(p.core, goal, ctx))) {
            this.tools.record(c.op, c.sig, Text.eqCI(p.core, cur.core + c.adds));
            next = Object.assign(p, { text: res });
          } else {
            this.tools.record(c.op, c.sig, false);
            if (p && p.w !== 'plain') next = await this._repair(Object.assign(p, { text: res }), cur.core.length, goal, ctx);
          }
          if (!next || visited.has(next.text)) return null;
          return dfs(next, depth + 1);
        };
        const cands = await this._appendCandidates(cur, rest, goal, ctx);
        const noTool = !cands.some((c) => c.adds && Text.startsCI(rest, c.adds));
        if (!cands.length) this._note(ctx, 'no known tool adds "' + rest[0] + '"', 8);
        let got = await tryCands(cands);
        if (got === 'budget') return null;
        if (got) return got;
        // Every tool failed on this exact text. From round 2, look up how others added this
        // character after the same ending ("rem" -> "reme") and try any new tools that turn up.
        if (ctx.levelIndex >= 1) {
          ctx.minedFor = ctx.minedFor || {};
          const tag = rest[0] + '@' + ctx.level.mine + '@' + cur.core.slice(-4).toLowerCase();
          if (!ctx.minedFor[tag]) {
            ctx.minedFor[tag] = true;
            this._say(ctx, 'Searching Infinibrowser for how others added "' + rest[0] + '" after "' + cur.core.slice(-4) + '"...');
            await this.tools.mineChar(rest[0], ctx.level.mine, cur.core);
            got = await tryCands(await this._appendCandidates(cur, rest, goal, ctx));
            if (got === 'budget') return null;
            if (got) return got;
          }
        }
        // Stuck with this wrapper (e.g. curly text that no space tool accepts): re-wrap the
        // same text another way ("…" -> plain -> "…") and keep building from there.
        if (ctx.crafts - startCrafts >= ctx.level.appendCrafts) return null;
        for (const alt of await this._rewrapMoves(cur, ctx)) {
          if (visited.has(alt.text)) continue;
          const out = await dfs(alt, depth + 1);
          if (out) return out;
        }
        // Still stuck at the front line: build part of what's left as its own quoted piece and
        // attach it in one craft ("mr. Erem" + “ey Jeremy” -> “mr. Eremey Jeremy”), so the pair
        // that keeps failing isn't needed at all.
        // When no tool adds the next character at all ("0"), this is the way, from round 1. Also
        // from earlier points of the text, where the piece is longer: in the real game
        // "the_0b1" + “ivion” can work when every way of adding "on" to "the_0b1ivi" doesn't.
        if (!ctx.spliceDepth && ctx.crafts - startCrafts < ctx.level.appendCrafts &&
            (noTool || (ctx.levelIndex >= 1 && (ctx.splices || 0) < 4 + 2 * (ctx.round || 1)))) {
          if (!noTool) ctx.splices = (ctx.splices || 0) + 1;
          const sp = await this._spliceChunk(cur, goal, ctx, noTool);
          if (sp === true) return true;
          if (sp && !visited.has(sp.text)) {
            const out = await dfs(sp, depth + 1);
            if (out) return out;
          }
        }
        return null;
      };
      return dfs(st, 0);
    }
    // single: no tool adds the next character, so start with that character alone ("0").
    async _spliceChunk(cur, goal, ctx, single) {
      const rest = goal.slice(cur.core.length);
      if (rest.length < (single ? 1 : 2)) return null;
      const prefixOk = (core) => (ctx.exact ? goal.startsWith(core) : Text.startsCI(goal, core));
      const word = rest.search(/\s/);
      const lens = (single ? [1, 2] : []).concat(Array.from(new Set([rest.length, word, Math.min(rest.length, 6), Math.min(rest.length, 3), 2]))
        .filter((k) => k >= 2 && k <= rest.length).slice(0, 4));
      const tried = new Set();
      for (const k of lens) {
        if (k > rest.length || tried.has(k)) continue;
        tried.add(k);
        await this._check(ctx);
        const piece = rest.slice(0, k);
        // First whatever quoted piece is quickest, then (if that didn't attach) a curly one.
        for (const curly of [false, true]) {
          this._say(ctx, 'Stuck after ' + cur.text + ': making ' + (curly ? '“' + piece + '”' : '"' + piece + '"') + ' separately to attach');
          const chunk = await this._buildQuoted(piece, ctx, curly);
          if (!chunk) continue;
          const res = await this.craftPair(cur.text, chunk.text, ctx, 'attach');
          if (res && Text.same(res, ctx.target, ctx.match)) return true;
          const p = res ? Text.parse(res) : null;
          if (p && p.w !== 'plain' && prefixOk(p.core) && p.core.length > cur.core.length) {
            this._plan(ctx, 'Attached ' + chunk.text + ' to ' + cur.text + ' (' + res + ')');
            return Object.assign(p, { text: res });
          }
          this._note(ctx, cur.text + ' + ' + chunk.text + ' made ' + (res || 'nothing'), 4);
          if (chunk.w === 'cq') break;
        }
      }
      return null;
    }
    // Build `core` as quoted text on its own. curly: it must come out as “…” (finished with a
    // curly-quote tool), the form that attaches to "…" text.
    async _buildQuoted(core, ctx, curly) {
      const sub = {
        target: Text.wrap(core, 'cq'), match: ctx.match, exact: ctx.exact, token: ctx.token, nest: ctx.nest + 1,
        crafts: 0, path: ctx.path, strategy: ctx.strategy, level: ctx.level, levelIndex: ctx.levelIndex, li: ctx.li,
        round: ctx.round, notes: [], spliceDepth: 1, preferW: 'cq', label: 'Piece to attach', cantMake: ctx.cantMake
      };
      // A piece gets a share of the round's budget, so one stubborn piece can't eat the round.
      sub.level = Object.assign({}, ctx.level, { appendCrafts: Math.max(60, Math.ceil(ctx.level.appendCrafts / 4)) });
      let found = null;
      const seeds = (await this._seeds(core, sub)).filter((sd) => !curly || sd.w === 'cq' || sd.len < core.length)
        .sort((a, b) => (b.len - a.len) || ((a.w === 'cq' ? 0 : 1) - (b.w === 'cq' ? 0 : 1)))
        .slice(0, Math.max(2, Math.ceil(ctx.level.seeds / 2)));
      const onDone = curly ? async (st) => { if (st.w === 'cq') { found = st; return true; } return false; } : null;
      for (const seed of seeds) {
        await this._check(ctx);
        if (sub.crafts >= ctx.level.appendCrafts / 2) break;
        const s0 = seed.owned ? seed.id : await this.ensure(seed.id, sub, ctx.level.depth, null);
        if (!s0) continue;
        let st = Object.assign(Text.parse(s0), { text: s0 });
        if (st.w === 'plain') st = await this._rewrap(st, core, sub);
        if (!st || !QUOTED[st.w]) continue;
        const built = await this._extend(st, core, sub, onDone);
        if (found) break;
        if (built === true) {
          const have = this.game.find(sub.target, 'case');
          if (have) { found = Object.assign(Text.parse(have), { text: have }); break; }
        } else if (built && QUOTED[built.w]) { found = built; break; }
      }
      ctx.crafts += sub.crafts;
      return found;
    }
    // Same text, different wrapper, in one or two tool crafts.
    async _rewrapMoves(cur, ctx) {
      const out = [];
      const same = (p) => p && Text.eqCI(p.core, cur.core);
      const quoteFromPlain = async (plain) => {
        const qs = this.tools.transforms('plain', ['rewrap']).filter((c) => QUOTED[c.t.t]).slice(0, 3);
        for (const g of TOOL_GUESSES.quote) if (!qs.some((c) => c.op === g)) qs.push({ op: g, sig: 'rewrap||plain>dq', guess: true });
        let tries = 0;
        for (const q of qs) {
          if (tries >= 2) break;
          if (q.guess && !(await this._existsOrOwned(q.op))) continue;
          tries++;
          const r = await this._tryTool(q.op, plain.text, ctx);
          const p = r.res ? Text.parse(r.res) : null;
          this.tools.record(q.op, q.sig, !!(p && QUOTED[p.w] && same(p)));
          if (p && QUOTED[p.w] && same(p)) { out.push(Object.assign(p, { text: r.res })); return; }
        }
      };
      if (cur.w === 'plain') { await quoteFromPlain(cur); return out; }
      const cands = (await this._unwrapCands(cur.w, 'plain', ctx)).slice(0, 4);
      for (const c of cands) {
        await this._check(ctx);
        const r = await this._tryTool(c.op, cur.text, ctx);
        if (r.missing || !r.res) continue;
        const p = Text.parse(r.res);
        if (!same(p) || r.res === cur.text) continue;
        const st = Object.assign(p, { text: r.res });
        if (QUOTED[p.w]) out.push(st);
        else if (p.w === 'plain') await quoteFromPlain(st);
        if (out.length >= 2) break;
      }
      return out;
    }
    async _unwrapCands(fromW, goalW, ctx) {
      const kinds = goalW === 'plain' ? ['unwrap', 'rewrap'] : ['rewrap', 'unwrap'];
      const learned = this.tools.transforms(fromW, kinds)
        .map((c) => Object.assign(c, { score: c.score * (c.t.t === goalW ? 3 : 1) }))
        .sort((x, y) => y.score - x.score)
        .slice(0, ctx.level.cands);
      const out = learned.slice();
      const guesses = [];
      if (goalW === 'plain') {
        if (QUOTED[fromW]) guesses.push(...TOOL_GUESSES.unwrap.map((g) => [g, 'unwrap||' + fromW + '>plain']), ...TOOL_GUESSES.toHash.map((g) => [g, 'rewrap||' + fromW + '>hash']));
        if (fromW === 'hash' || fromW === 'dot' || fromW === 'bang') guesses.push(...TOOL_GUESSES.unhash.map((g) => [g, 'unwrap||' + fromW + '>plain']));
      } else if (fromW === 'plain' || QUOTED[fromW]) {
        guesses.push(...TOOL_GUESSES.quote.map((g) => [g, 'rewrap||' + fromW + '>' + goalW]));
      }
      for (const [g, sig] of guesses) {
        if (out.some((c) => c.op === g)) continue;
        if (await this._existsOrOwned(g)) out.push({ op: g, sig, guess: true, score: 1 });
      }
      return out;
    }
    async _fixCase(p, ctx) {
      const want = Text.parse(ctx.target).core;
      let mode = 'cap';
      if (want === want.toUpperCase()) mode = 'upper';
      else if (want === want.toLowerCase()) mode = 'lower';
      else if (want === Text.title(want.toLowerCase())) mode = 'title';
      const cands = this.tools.transforms(p.w, ['case']).filter((c) => c.t.x === mode).slice(0, 4);
      const g = mode === 'upper' ? TOOL_GUESSES.upper : mode === 'lower' ? TOOL_GUESSES.lower : TOOL_GUESSES.title;
      for (const name of g) if (!cands.some((c) => c.op === name)) cands.push({ op: name, sig: 'case|' + mode + '|' + p.w + '>' + p.w, guess: true });
      let tries = 0;
      for (const c of cands) {
        if (tries >= 4) break;
        if (c.guess && !(await this._existsOrOwned(c.op))) continue;
        tries++;
        const r = await this._tryTool(c.op, p.text, ctx);
        const ok = !!(r.res && Text.same(r.res, ctx.target, true));
        this.tools.record(c.op, c.sig, ok);
        if (ok || this._done(ctx)) return true;
      }
      return false;
    }
    async _finalize(st, goal, ctx) {
      if (this._done(ctx)) return true;
      const goalW = Text.parse(ctx.target).w;
      const queue = [st];
      const seen = new Set([st.text]);
      let tries = 0;
      const maxTries = ctx.level.cands * 3;
      while (queue.length && tries < maxTries) {
        const s = queue.shift();
        if (s.w === goalW && Text.eqCI(s.core, goal)) {
          if (await this._fixCase(s, ctx)) return true;
          continue;
        }
        const cands = await this._unwrapCands(s.w, goalW, ctx);
        for (const c of cands) {
          if (tries >= maxTries) break;
          await this._check(ctx);
          tries++;
          this._say(ctx, 'Unwrapping ' + s.text + ' with ' + c.op);
          const r = await this._tryTool(c.op, s.text, ctx);
          if (r.missing) continue;
          if (r.res && Text.same(r.res, ctx.target, ctx.match)) { this.tools.record(c.op, c.sig, true); return true; }
          if (this._done(ctx)) return true;
          const p = r.res ? Text.parse(r.res) : null;
          if (p && Text.eqCI(p.core, goal)) {
            this.tools.record(c.op, c.sig, sigOf({ k: p.w === 'plain' ? 'unwrap' : 'rewrap', x: '', f: s.w, t: p.w }) === c.sig);
            if (!seen.has(r.res)) { seen.add(r.res); queue.push(Object.assign(p, { text: r.res })); }
          } else {
            this.tools.record(c.op, c.sig, false);
          }
        }
      }
      this._note(ctx, 'built ' + st.text + ' but no unquote tool turned it into the plain word', 7);
      return false;
    }
    // Before crafting anything, make sure every letter still to be added has some tool that adds
    // it (learned, conventional 'x' / .x / “x”, or found by surveying Infinibrowser).
    async _missingLetters(rest, ctx) {
      const missing = [];
      const seen = new Set();
      for (const ch of rest) {
        const key = ctx.exact ? ch : ch.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        if (this.tools.hasAppendersFor(ch)) continue;
        const forms = ctx.exact ? [ch] : Array.from(new Set([ch, ch.toLowerCase(), ch.toUpperCase()]));
        let ok = false;
        for (const w of ['sq', 'dot', 'cq']) {
          for (const f of forms) if (await this._existsOrOwned(Text.wrap(f, w))) { ok = true; break; }
          if (ok) break;
        }
        if (!ok) {
          this._say(ctx, 'Searching Infinibrowser for a tool that adds "' + ch + '"...');
          ok = await this.tools.mineChar(ch, ctx.level.mine);
        }
        // No tool adds it, but "0" itself can be made (the item 0, quoted) and attached.
        if (!ok && await this._charPieceOk(ch, forms)) {
          ctx.attachChars = ctx.attachChars || [];
          if (ctx.attachChars.indexOf(ch) < 0) ctx.attachChars.push(ch);
          ok = true;
        }
        if (!ok) missing.push(ch);
      }
      return missing;
    }
    async _charPieceOk(ch, forms) {
      for (const f of forms) {
        for (const w of ['dq', 'cq', 'sq']) if (await this._existsOrOwned(Text.wrap(f, w))) return true;
        if (await this._existsOrOwned(f)) return true;
      }
      return false;
    }
    async viaStringBuild(ctx) {
      ctx.strategy = 'String building';
      const goal = Text.parse(ctx.target).core;
      if (!goal) return false;
      this._say(ctx, 'Learning text tools from Infinibrowser...');
      await this.tools.ensureMined((d, n) => this._say(ctx, 'Learning text tools from Infinibrowser (' + d + '/' + n + ')', d / n), ctx.level.mine);
      const seeds = await this._seeds(goal, ctx);
      if (!seeds.length) {
        this._note(ctx, 'no quoted starting letter for "' + goal[0] + '" on Infinibrowser', 6);
        this._say(ctx, 'No starting point for "' + goal + '" yet');
        return false;
      }
      const missing = await this._missingLetters(goal.slice(seeds[0].len), ctx);
      if (missing.length) {
        const list = missing.map((c) => '"' + c + '"').join(', ');
        this._note(ctx, 'nothing on Infinibrowser adds or makes ' + list + ' yet', 8);
        if (!ctx.planLogged) { ctx.planLogged = true; this._plan(ctx, "Can't build " + ctx.target + ' yet: no known tool adds ' + list + ", and Infinibrowser doesn't have " + (missing.length > 1 ? 'them' : 'it') + ' on its own to attach (nothing crafted)'); }
        return false;
      }
      if (!ctx.planLogged) {
        ctx.planLogged = true;
        const s0 = seeds[0];
        const rest = goal.slice(s0.len);
        this._plan(ctx, 'Plan: start from ' + s0.id + (s0.owned ? ' (already have it)' : ' (recipe on Infinibrowser)') +
          (rest ? ', add "' + rest + '" with letter tools' : '') +
          (ctx.attachChars && ctx.attachChars.length ? ' (no tool adds ' + ctx.attachChars.map((c) => '"' + c + '"').join(', ') + ', so those are made separately and attached)' : '') +
          ', then unquote it');
      }
      let used = 0;
      let prevCrafts = ctx.crafts;
      for (const seed of seeds) {
        // Seeds whose attempts were answered entirely from known pair results cost nothing,
        // so only seeds that needed real crafts count against the level's seed budget.
        if (ctx.crafts > prevCrafts) used++;
        prevCrafts = ctx.crafts;
        if (used >= ctx.level.seeds) break;
        await this._check(ctx);
        this._say(ctx, 'Seed ' + seed.id, seed.len / goal.length);
        const s = seed.owned ? seed.id : await this.ensure(seed.id, ctx, ctx.level.depth, null);
        if (!s) continue;
        if (this._done(ctx)) return true;
        let st = Object.assign(Text.parse(s), { text: s });
        if (st.w === 'plain' && !this._coreDone(st.core, goal, ctx)) {
          st = await this._rewrap(st, goal, ctx);
          if (!st) continue;
        }
        const built = await this._extend(st, goal, ctx, (s) => this._finalize(s, goal, ctx));
        if (built === true || this._done(ctx)) return true;
      }
      if (ctx.best && !this._done(ctx)) this._note(ctx, 'got as far as ' + ctx.best.text, 6);
      return !!this._done(ctx);
    }

    // ---------- Orchestration ----------
    _saveRecipe(ctx, name) {
      const producer = new Map();
      for (const s of ctx.path) if (!producer.has(s[2])) producer.set(s[2], s);
      const steps = [];
      const seen = new Set();
      const visit = (x, d) => {
        if (seen.has(x) || d > 400) return;
        seen.add(x);
        const p = producer.get(x);
        if (!p) return;
        visit(p[0], d + 1);
        visit(p[1], d + 1);
        steps.push(p);
      };
      visit(name, 0);
      if (steps.length) this.mem.bankPut(ctx.target, steps, 'forge:' + (ctx.strategy || ''));
      return steps;
    }
    // Budgets for a round. The first three are fixed; with "Never give up", every later round
    // searches wider and deeper than the one before.
    _levelFor(i) {
      const L = C.forge.levels, last = L.length - 1;
      if (i <= last) return L[i];
      const k = i - last, b = L[last];
      return {
        name: 'wider x' + (k + 1),
        depth: Math.min(12, b.depth + Math.ceil(k / 2)),
        branches: Math.min(64, b.branches + 8 * k),
        splits: Math.min(12, b.splits + k),
        seeds: Math.min(24, b.seeds + 2 * k),
        cands: Math.min(40, b.cands + 4 * k),
        appendCrafts: Math.min(3000, b.appendCrafts * (1 + k)),
        mine: b.mine + k
      };
    }
    async obtain(target, opts) {
      opts = opts || {};
      const S = opts.strategies || this.app.strategies();
      const ctx = {
        target: String(target).trim(),
        match: opts.match || (opts.exact ? 'exact' : 'case'),
        exact: opts.match ? opts.match === 'exact' : !!opts.exact,
        token: opts.token,
        nest: opts.nest || 0,
        crafts: 0,
        path: opts.parent ? opts.parent.path : [],
        label: opts.label || '',
        strategy: '',
        started: now()
      };
      ctx.notes = [];
      const result = (ok) => ({ ok, name: ok ? this._done(ctx) : null, ctx });
      if (this._done(ctx)) return result(true);
      const nested = ctx.nest > 0;
      if (!nested) this.lastCtx = ctx;
      const last = C.forge.levels.length - 1;
      // Parts of a phrase start at their parent's level, including the wider rounds past the last.
      const startLevel = Math.max(0, opts.level || 0);
      const maxRounds = nested ? 1 : (S.relentless ? Infinity : C.forge.giveUpRounds);
      // Progress marker: crafts made, tools learned, Infinibrowser data fetched.
      const mark = () => ctx.crafts + '|' + this.tools.size + '|' + this.ib.requests;
      let stalls = 0;
      for (let round = 0; round < maxRounds; round++) {
        const li = startLevel + round;
        ctx.levelIndex = Math.min(li, last);
        ctx.li = li;
        ctx.cantMake = new Map();
        ctx.level = this._levelFor(li);
        ctx.round = round + 1;
        const before = mark();
        if (S.ib && (await this.viaInfinibrowser(ctx))) break;
        if (this._done(ctx)) break;
        if (S.compound && (await this.viaCompound(ctx, false))) break;
        if (this._done(ctx)) break;
        if (S.build && (await this.viaStringBuild(ctx))) break;
        if (this._done(ctx)) break;
        if (S.compound && li >= 1 && (await this.viaCompound(ctx, true))) break;
        if (this._done(ctx)) break;
        if (nested) break;
        const why = this.reason(ctx);
        // Without Infinibrowser nothing new can be looked up, so that is the real blocker.
        const ibWhy = this.ib.problem();
        if (ibWhy && S.relentless) {
          stalls++;
          const wait = Math.min(60, 10 + 5 * stalls);
          this.app.log('round', 'Waiting for Infinibrowser before trying ' + ctx.target + ' again: ' + ibWhy);
          for (let t = wait; t > 0 && this.ib.problem(); t--) {
            this._say(ctx, "Can't reach Infinibrowser, so nothing new can be looked up. " + ibWhy + ' Trying again in ' + t + 's.');
            await sleep(1000);
            await this._check(ctx);
          }
          // Try the connection again right away, at the same search level (nothing was searched).
          this.ib.resetHealth();
          round--;
          continue;
        }
        if (mark() === before && li >= last) {
          if (!S.relentless) break;
          // Nothing new to try right now: wait, then look again with wider searches. Every few
          // waits, forget cached "not on Infinibrowser" answers so new uploads are noticed.
          stalls++;
          if (stalls % 4 === 0) this.ib.forgetMisses();
          const wait = Math.min(60, 5 * stalls);
          this.app.log('round', 'Still working on ' + ctx.target + (why ? ' (' + why + ')' : '') + '; trying again in ' + wait + 's');
          for (let t = wait; t > 0; t--) {
            this._say(ctx, 'Not giving up' + (why ? ': ' + why : '') + '. Searching again in ' + t + 's');
            await sleep(1000);
            await this._check(ctx);
          }
        } else {
          stalls = 0;
          this.app.log('round', 'Round ' + ctx.round + ' (' + ctx.level.name + ') did not make ' + ctx.target + ' yet' + (why ? ' (' + why + ')' : '') + '; searching wider');
        }
      }
      const ok = !!this._done(ctx);
      if (ok && !nested) {
        const steps = this._saveRecipe(ctx, this._done(ctx));
        ctx.recipeSteps = steps;
      }
      return result(ok);
    }
  }

  /* ============================================================
   * Sound + notifications
   * ============================================================ */
  let audioCtx = null;
  function chime(freqs, gap, vol) {
    try {
      // One audio context for the whole session; creating one per sound is slow.
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ac = audioCtx;
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      const g = ac.createGain();
      g.gain.value = vol;
      g.connect(ac.destination);
      freqs.forEach((f, i) => {
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        o.connect(g);
        o.start(ac.currentTime + i * gap);
        o.stop(ac.currentTime + i * gap + gap + 0.02);
      });
    } catch (e) {}
  }
  const playDiscoverySound = () => chime([660, 880, 1100], 0.1, 0.15);
  const playTargetSound = () => chime([523, 659, 784, 1047], 0.12, 0.2);
  function notify(body) {
    if (typeof Notification === 'undefined') return;
    try {
      if (Notification.permission === 'granted') { new Notification('Infinite Craft', { body }); return; }
      if (Notification.permission !== 'default') return;
      Notification.requestPermission().then((p) => { if (p === 'granted') new Notification('Infinite Craft', { body }); });
    } catch (e) {}
  }

  /* ============================================================
   * CSS
   * ============================================================ */
  // Styled after Infinite Craft itself: white, thin grey borders, rounded item "chips" with an
  // emoji, and the game's light-blue hover. App.syncTheme() copies the game's real font, colours
  // and dark mode from the page, so the panel keeps matching it.
  function injectCSS() {
    const id = 'ic-auto-css';
    const old = document.getElementById(id);
    if (old) old.remove();
    const s = document.createElement('style');
    s.id = id;
    s.textContent = [
      '#ic-panel,#ic-log{--wf-bg:#fff;--wf-chip:#fff;--wf-text:#040404;--wf-muted:#8d8d8d;--wf-border:#c8c8c8;--wf-hover-tint:#d6fcff;--wf-hover-border:#91a8c1;--wf-font:Roboto,"Helvetica Neue",Arial,sans-serif;--wf-radius:5px;--wf-green:#24914a;--wf-orange:#c46a00;--wf-red:#cf3a2e;--wf-blue:#3d6dab;--wf-track:#ececec;}',
      '#ic-panel.wf-dark,#ic-log.wf-dark{--wf-bg:#1b1b1b;--wf-chip:#262626;--wf-text:#f1f1f1;--wf-muted:#a3a3a3;--wf-border:#4a4a4a;--wf-hover-tint:#24454e;--wf-hover-border:#6f95ad;--wf-green:#62d283;--wf-orange:#ffad42;--wf-red:#ff6d61;--wf-blue:#8ab8ff;--wf-track:#3a3a3a;}',
      '#ic-panel{position:fixed;top:10px;left:10px;z-index:10010;width:300px;max-height:calc(100vh - 20px);background:var(--wf-bg);border:1px solid var(--wf-border);border-radius:calc(var(--wf-radius) + 3px);font-family:var(--wf-font);font-size:13px;line-height:1.3;color:var(--wf-text);box-shadow:0 2px 12px rgba(0,0,0,.08);display:flex;flex-direction:column;overflow:hidden;}',
      '#ic-panel *,#ic-log *{box-sizing:border-box;}',
      '#ic-panel.collapsed{width:auto;}',
      '#ic-panel.collapsed .ic-body{display:none;}',
      '#ic-panel.collapsed .ic-title{display:none;}',
      '#ic-panel.collapsed .ic-header{border-bottom:none;}',
      '.ic-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-bottom:1px solid var(--wf-border);cursor:move;user-select:none;}',
      '.ic-title{font-weight:600;font-size:15px;white-space:nowrap;}',
      // Everything clickable looks like an Infinite Craft item.
      '.ic-btn,.ic-minimize,.ic-badge,.ic-stat,.ic-now-target{background:var(--wf-chip);border:1px solid var(--wf-border);border-radius:var(--wf-radius);color:var(--wf-text);font-family:var(--wf-font);}',
      '.ic-btn{width:100%;padding:8px 8px 7px;font-size:14px;line-height:1.1;cursor:pointer;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:background .15s linear,border-color .15s linear;}',
      '.ic-btn:hover:not(:disabled),.ic-minimize:hover,.ic-badge.has-new{background:linear-gradient(0deg,var(--wf-hover-tint),var(--wf-chip) 90%);border-color:var(--wf-hover-border);}',
      '.ic-btn:active:not(:disabled){transform:scale(.97);}',
      '.ic-btn:disabled{opacity:.45;cursor:default;}',
      '#ic-panel [data-emoji]::before{content:attr(data-emoji);margin-right:5px;}',
      '.ic-btn-start{font-weight:600;}',
      '.ic-btn-danger{color:var(--wf-red);}',
      '.ic-btn-warn{color:var(--wf-orange);font-weight:600;}',
      '.ic-btn-row{display:flex;gap:5px;}.ic-btn-row .ic-btn{flex:1;min-width:0;}',
      '.ic-badge{min-width:24px;height:26px;padding:0 7px;font-size:13px;display:flex;align-items:center;justify-content:center;}',
      '.ic-badge.pulse{animation:ic-pulse .6s ease;}',
      '@keyframes ic-pulse{0%{transform:scale(1)}50%{transform:scale(1.25)}100%{transform:scale(1)}}',
      '.ic-minimize{cursor:pointer;font-size:16px;line-height:1;padding:4px 9px;}',
      '.ic-body{display:flex;flex-direction:column;gap:8px;padding:10px;overflow-y:auto;}',
      '.ic-body::-webkit-scrollbar{width:6px;}.ic-body::-webkit-scrollbar-thumb{background:var(--wf-border);border-radius:3px;}',
      '.ic-section{display:flex;flex-direction:column;gap:5px;}',
      '.ic-section-title{font-size:12px;color:var(--wf-muted);}',
      '.ic-input,.ic-select,.ic-textarea{width:100%;padding:8px 10px;background:var(--wf-chip);border:1px solid var(--wf-border);border-radius:var(--wf-radius);color:var(--wf-text);font-size:14px;font-family:var(--wf-font);outline:none;}',
      '.ic-input:focus,.ic-select:focus,.ic-textarea:focus{border-color:var(--wf-hover-border);}',
      '.ic-input::placeholder,.ic-textarea::placeholder{color:var(--wf-muted);}',
      '.ic-select{cursor:pointer;padding:6px 8px;}',
      '.ic-select option{background:var(--wf-chip);color:var(--wf-text);}',
      '.ic-textarea{resize:vertical;min-height:44px;line-height:1.35;}',
      '.ic-check{display:flex;align-items:center;gap:7px;font-size:13px;cursor:pointer;}',
      '.ic-check input{accent-color:var(--wf-hover-border);margin:0;}',
      // Stats wrap like items in the game's sidebar.
      '.ic-stats{display:flex;flex-wrap:wrap;gap:5px;}',
      '.ic-stat{flex:0 0 auto;max-width:100%;padding:6px 8px 5px;display:flex;align-items:baseline;gap:5px;font-size:13px;white-space:nowrap;overflow:hidden;}',
      '.ic-stat-val{font-weight:600;}',
      '.ic-stat-label{color:var(--wf-muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;}',
      '.ic-status{padding:1px 2px;font-size:12.5px;line-height:1.35;word-break:break-word;color:var(--wf-muted);}',
      '.ic-status.s-run{color:var(--wf-blue);}',
      '.ic-status.s-stop{color:var(--wf-red);}',
      '.ic-status.s-ok{color:var(--wf-green);}',
      '.ic-status.s-err{color:var(--wf-red);font-weight:600;}',
      '.ic-status.s-warn{color:var(--wf-orange);}',
      '.ic-now{background:var(--wf-chip);border:1px solid var(--wf-border);border-radius:var(--wf-radius);padding:8px;display:none;flex-direction:column;gap:6px;}',
      '.ic-now.show{display:flex;}',
      '.ic-now.done-ok{border-color:var(--wf-green);}',
      '.ic-now.done-bad{border-color:var(--wf-orange);}',
      '.ic-now-target{align-self:flex-start;max-width:100%;font-size:15px;padding:7px 8px 6px;word-break:break-word;}',
      '.ic-now-target::before{content:"🎯";margin-right:5px;}',
      '.ic-now.done-ok .ic-now-target::before{content:"✅";}',
      '.ic-now.done-bad .ic-now-target::before{content:"⏳";}',
      '.ic-now-meta{display:flex;justify-content:space-between;gap:6px;font-size:11.5px;color:var(--wf-muted);}',
      '.ic-now-strategy{color:var(--wf-text);font-weight:500;}',
      '.ic-now.done-ok .ic-now-strategy{color:var(--wf-green);}.ic-now.done-bad .ic-now-strategy{color:var(--wf-orange);}',
      '.ic-now-msg{font-size:12.5px;word-break:break-word;min-height:15px;}',
      '.ic-bar{height:4px;background:var(--wf-track);border-radius:2px;overflow:hidden;}',
      '.ic-bar>div{height:100%;width:0;background:var(--wf-hover-border);transition:width .25s;}',
      '.ic-link{font-size:12px;color:var(--wf-blue);text-decoration:none;}',
      '.ic-link:hover{text-decoration:underline;}',
      '.ic-details{border-top:1px solid var(--wf-border);}',
      '.ic-details>summary{cursor:pointer;padding:8px 2px 4px;font-size:13px;font-weight:500;list-style:none;user-select:none;}',
      '.ic-details>summary::-webkit-details-marker{display:none;}',
      '.ic-details>summary:before{content:"\\25b8";display:inline-block;margin-right:7px;color:var(--wf-muted);transition:transform .2s;}',
      '.ic-details[open]>summary:before{transform:rotate(90deg);}',
      '.ic-details>.ic-dbody{display:flex;flex-direction:column;gap:6px;padding:4px 0 6px;}',
      '.ic-small{font-size:11.5px;color:var(--wf-muted);line-height:1.35;}',
      '#ic-log{position:fixed;bottom:10px;right:10px;z-index:10014;width:380px;max-height:340px;background:var(--wf-bg);border:1px solid var(--wf-border);border-radius:calc(var(--wf-radius) + 3px);font-family:var(--wf-font);color:var(--wf-text);display:none;flex-direction:column;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);}',
      '#ic-log.show{display:flex;}',
      '#ic-log .log-header{padding:8px 10px;border-bottom:1px solid var(--wf-border);font-size:14px;font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:8px;}',
      '#ic-log .log-header label{font-weight:400;font-size:12px;color:var(--wf-muted);display:flex;align-items:center;gap:4px;margin-left:auto;}',
      '#ic-log .log-header input{accent-color:var(--wf-hover-border);}',
      '#ic-log .log-header button{background:var(--wf-chip);border:1px solid var(--wf-border);border-radius:var(--wf-radius);color:var(--wf-text);cursor:pointer;font-size:12px;padding:3px 7px;}',
      '#ic-log .log-header button:hover{background:linear-gradient(0deg,var(--wf-hover-tint),var(--wf-chip) 90%);border-color:var(--wf-hover-border);}',
      '#ic-log .log-body{flex:1;overflow-y:auto;padding:6px;font-size:12px;}',
      '#ic-log .log-entry{padding:3px 6px;border-radius:4px;margin-bottom:1px;display:flex;justify-content:space-between;gap:8px;}',
      '#ic-log .log-entry:hover{background:linear-gradient(0deg,var(--wf-hover-tint),transparent 90%);}',
      '#ic-log .log-entry .log-time{font-size:10.5px;color:var(--wf-muted);white-space:nowrap;}',
      '#ic-log .t-craft,#ic-log .t-diag{color:var(--wf-muted);}',
      '#ic-log .t-new{color:var(--wf-green);}#ic-log .t-first{color:var(--wf-orange);font-weight:600;}',
      '#ic-log .t-win{color:var(--wf-blue);font-weight:600;}#ic-log .t-fix{color:var(--wf-orange);}',
      '#ic-log .t-fail{color:var(--wf-red);}#ic-log .t-round{color:var(--wf-blue);}',
      '#ic-log.hide-crafts .t-craft{display:none;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ============================================================
   * App: UI + run control
   * ============================================================ */
  const DEFAULT_OPTIONS = {
    autoSweep: true, dragEnabled: false, depthFirst: true, soundEnabled: true, collapsed: false,
    exactSpelling: false, sIB: true, sCompound: true, sBuild: true, relentless: true, logCrafts: false
  };

  class App {
    constructor() {
      this.mem = new Memory();
      this.ib = new Infinibrowser();
      this.tools = new ToolLibrary(this.ib);
      this.game = new Game();
      this.dragger = new Dragger(this.game);
      this.game.dragger = this.dragger;
      this.forge = new Forge(this);
      this.opt = Object.assign({}, DEFAULT_OPTIONS);
      this.running = false;
      this.paused = false;
      this.token = 0;
      this.mode = null;
      this.speed = 'normal';
      this.excludeSet = new Set();
      this.stats = { newWords: 0, firstDisc: 0, crafts: 0, forged: 0 };
      this.newItems = [];
      this.logRows = [];
      this.lastCraftAt = 0;
      this.lastSweep = 0;
      this.pokedexList = [];
      this.pokedexIndex = 0;
      this.pokedexLoading = false;
      this.saveSwitchAt = 0;
      this.lastRecipe = null;
      this.skipRequested = false;
      this.currentTarget = null;
      this._statsTimer = null;
      this._nowTimer = null;
      this._nowState = null;
      this._observer = null;
    }

    async init() {
      injectCSS();
      this.buildPanel();
      this.buildLog();
      // Keep matching the game's look (it can switch to dark mode at any time).
      this.syncTheme();
      setInterval(() => this.syncTheme(), 2000);
      this.loadSettings();
      this.status('Loading learned data...', 's-run');
      await Promise.all([this.mem.load(), this.ib.load(), this.tools.load()]);
      this.game.refresh(true);
      this.observe();
      this.refreshSaveInfo();
      this.renderStats();
      this.renderInfo();
      this.status(this.game.hasApi() ? 'Ready. Type any word and press Start.' : 'Ready (game API not found yet; it may still be loading).', 's-ok');
      window.addEventListener('beforeunload', () => { this.mem.flush(); this.ib.save(); });
      Relay.init();
      Relay.listeners.push(() => this.onRelayReady());
      this.checkConnection();
      setInterval(() => this.renderInfo(), 3000);
    }

    // Make Infinibrowser problems visible up front instead of letting a run fail silently.
    async checkConnection(quiet) {
      const ok = await this.ib.ping();
      this.renderInfo();
      if (ok) {
        if (!this.running) this.status((this.game.hasApi() ? 'Ready. ' : '') + 'Connected to Infinibrowser' + (Relay.alive() ? ' (through its tab, keep it open)' : '') + '. Type any word and press Start.', 's-ok');
        return true;
      }
      const why = this.ib.problem() || "Can't reach infinibrowser.wiki.";
      this.status(why, 's-err');
      this.log('fail', why + (this.ib.lastError ? ' [' + this.ib.lastError + ']' : ''));
      if (!quiet && !this.running) this.notice("Can't reach Infinibrowser", why, 's-err', this.relayAction());
      return false;
    }
    openRelay() {
      if (Relay.alive()) { this.status('The Infinibrowser tab is already connected.', 's-ok'); return; }
      if (!Relay.open()) {
        this.notice('Pop-up blocked', 'Your browser blocked the Infinibrowser tab. Allow pop-ups for neal.fun (icon in the address bar), then click the button again.', 's-err', this.relayAction());
        return;
      }
      this.notice('Opening Infinibrowser...', 'Waiting for the Infinibrowser tab. If it shows "checking your browser", let it finish. Keep that tab open.', 's-warn');
      this.status('Waiting for the Infinibrowser tab...', 's-run');
    }
    onRelayReady() {
      this.ib.resetHealth();
      this.log('plan', 'Connected to Infinibrowser through its tab (keep it open)');
      if (!this.running) this.notice('Connected', 'Connected to Infinibrowser through its tab. Keep that tab open and press Start.', 's-ok');
      this.status('Connected to Infinibrowser through its tab. Press Start.', 's-ok');
      this.renderInfo();
    }
    async testConnection() {
      if (this._testing) return;
      this._testing = true;
      this.status('Testing the connection to Infinibrowser...', 's-run');
      const url = C.ib.base + '/item?id=Water';
      const describe = (r) => 'HTTP ' + r.status + (looksLikeChallenge(r) ? ' ("checking your browser" page)' : (r.status === 200 ? ' OK' : ''));
      const lines = [];
      try {
        if (Relay.alive()) {
          try { lines.push('Infinibrowser tab: ' + describe(await Relay.get(url, 10000))); } catch (e) { lines.push('Infinibrowser tab: ' + e.message); }
        } else lines.push('Infinibrowser tab: not open');
        if (GMX) {
          try { lines.push('Userscript manager: ' + describe(await gmGet(url, 10000))); } catch (e) { lines.push('Userscript manager: ' + e.message); }
        } else lines.push('Userscript manager: not available (is the script installed in Tampermonkey or Violentmonkey?)');
        try { lines.push('Direct: ' + describe(await fetchGet(url, 10000))); } catch (e) { lines.push('Direct: ' + e.message); }
        lines.push('Game: ' + (this.game.ic() ? 'connected' : (this.game.hasApi() ? 'connected (older version)' : 'not found')));
        lines.push('Script v' + VERSION);
        for (const l of lines) this.log('diag', l);
        const ok = await this.checkConnection(true);
        this.notice('Connection test', lines.join('  \u2022  '), ok ? 's-ok' : 's-warn', ok ? null : this.relayAction());
      } finally {
        this._testing = false;
      }
      return lines;
    }

    /* ---------- settings ---------- */
    loadSettings() {
      const o = Store.get(KEYS.options, {}) || {};
      for (const k of Object.keys(DEFAULT_OPTIONS)) if (typeof o[k] === 'boolean') this.opt[k] = o[k];
      const sp = Store.get(KEYS.speed, null) || localStorage.getItem(KEYS.speed);
      this.setSpeed(SPEED_PRESETS[sp] ? sp : 'normal', true);
      const ex = Store.get(KEYS.exclude, []);
      if (Array.isArray(ex)) {
        this.$('#ic-exclude').value = ex.join('\n');
        this.excludeSet = new Set(ex.map((s) => Text.soft(s)));
      }
      const drafts = Store.get(KEYS.drafts, {}) || {};
      if (typeof drafts.target === 'string') this.$('#ic-target').value = drafts.target;
      const ps = Store.get(KEYS.pokeState, null);
      if (ps && typeof ps.index === 'number' && ps.index >= 0) this.pokedexIndex = ps.index | 0;
      const pc = Store.get(KEYS.pokeCache, null);
      if (Array.isArray(pc)) this.pokedexList = pc.map((n) => this.formatPokemon(n));
      this.$('#ic-poke-start').value = String(this.pokedexIndex + 1);
      this.applyOptionsToUI();
      this.updateLookup();
    }
    saveOptions() { Store.set(KEYS.options, this.opt); }
    applyOptionsToUI() {
      for (const k of Object.keys(DEFAULT_OPTIONS)) {
        const el = this.panel.querySelector('[data-opt="' + k + '"]');
        if (el) el.checked = !!this.opt[k];
      }
      this.panel.classList.toggle('collapsed', this.opt.collapsed);
      this.$('#ic-collapse').textContent = this.opt.collapsed ? '+' : '−';
      this.logPanel && this.logPanel.classList.toggle('hide-crafts', !this.opt.logCrafts);
    }
    setSpeed(v, silent) {
      if (!SPEED_PRESETS[v]) v = 'normal';
      this.speed = v;
      try { localStorage.setItem(KEYS.speed, v); } catch (e) {}
      const p = SPEED_PRESETS[v];
      if (!W.__icForgeConfig || W.__icForgeConfig.gap == null) { C.gap = p.gap; C.settle = p.settle; }
      C.step = p.step;
      C.between = p.between;
      const el = this.$('#ic-speed');
      if (el) el.value = v;
      if (!silent) this.status('Speed: ' + v, 's-ok');
    }
    saveExclude() {
      const lines = this.$('#ic-exclude').value.split('\n').map((s) => s.trim()).filter(Boolean);
      this.excludeSet = new Set(lines.map((s) => Text.soft(s)));
      this._exploreNames = null;
      Store.set(KEYS.exclude, lines);
    }
    saveDrafts() { Store.set(KEYS.drafts, { target: this.$('#ic-target').value || '' }); }
    strategies() {
      return { ib: this.opt.sIB, compound: this.opt.sCompound, build: this.opt.sBuild, relentless: this.opt.relentless };
    }
    dragEnabled() { return !!this.opt.dragEnabled; }
    matchMode() { return this.opt.exactSpelling ? 'exact' : 'case'; }
    isAutoBlocked(name) {
      const v = String(name || '').trim();
      return !v || this.excludeSet.has(Text.soft(v)) || /^[0-9]+$/.test(v);
    }

    /* ---------- targets ---------- */
    getTargets() {
      return this.$('#ic-target').value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    }
    setTargets(list) {
      this.$('#ic-target').value = list.join(', ');
      this.saveDrafts();
      this.updateLookup();
    }
    removeTarget(t) {
      const list = this.getTargets();
      const i = list.findIndex((x) => Text.same(x, t, false) || x === t);
      if (i >= 0) list.splice(i, 1);
      this.setTargets(list);
      return list;
    }
    updateLookup() {
      const link = this.$('#ic-lookup');
      const t = this.getTargets()[0];
      if (!t) { link.style.display = 'none'; return; }
      const v = Text.variants(t, false)[0] || t;
      link.href = 'https://infinibrowser.wiki/item/' + encodeURIComponent(v);
      link.textContent = 'Look up “' + t + '” on infinibrowser.wiki';
      link.style.display = 'block';
    }

    /* ---------- run control ---------- */
    _begin(mode) {
      this._logged = new Set();
      this.token++;
      this.running = true;
      this.paused = false;
      this.mode = mode;
      this.skipRequested = false;
      this.syncButtons();
      return this.token;
    }
    _end(token, msg, cls, action) {
      if (token !== this.token) return;
      this.running = false;
      this.paused = false;
      this.mode = null;
      this.syncButtons();
      this.mem.flush();
      this.ib.save();
      this.finishNow(msg, cls, action);
      if (msg) this.status(msg, cls);
      this.renderStats();
    }
    async checkpoint(token) {
      if (token !== this.token || !this.running) throw new Cancelled();
      // Long stretches answered from memory and cache never wait on anything, so give the page
      // a moment every ~10 ms to draw and handle input; otherwise the game stutters.
      if (now() - (this._sliceAt || 0) > 10) {
        await yieldToPage();
        this._sliceAt = now();
        if (token !== this.token || !this.running) throw new Cancelled();
      }
      while (this.paused) {
        await sleep(200);
        if (token !== this.token || !this.running) throw new Cancelled();
      }
    }
    syncButtons() {
      this.$('#ic-start').disabled = this.running;
      this.$('#ic-pause').disabled = !this.running;
      this.$('#ic-pause').textContent = this.paused ? 'Resume' : 'Pause';
      this.$('#ic-pause').setAttribute('data-emoji', this.paused ? '\u25B6\uFE0F' : '\u23F8\uFE0F');
    }
    _canCraft() {
      if (this.running) { this.status('Already running', 's-warn'); return false; }
      this.game.refresh(true);
      if (!this.game.hasApi() && !this.opt.dragEnabled) {
        this.status('Game API not found. Wait for the game to load, or enable the dragging animation.', 's-err');
        return false;
      }
      return true;
    }
    // Start only ever works on the words you typed; it never combines things at random.
    start() {
      if (!this.getTargets().length) {
        this.status('Type the word(s) you want in the box first.', 's-warn');
        this.$('#ic-target').focus();
        return;
      }
      if (this._canCraft()) this.runTargets();
    }
    startExplore() { if (this._canCraft()) this.runExplore(); }
    stop() {
      const wasPokedex = this.mode === 'pokedex';
      this.token++;
      this.running = false;
      this.paused = false;
      this.mode = null;
      this.syncButtons();
      this.mem.flush();
      this.ib.save();
      this.hideNow();
      if (wasPokedex) this.pokeStatus('National Dex stopped at #' + (this.pokedexIndex + 1), 's-stop');
      this.status('Stopped', 's-stop');
      this.renderStats();
      if (this.opt.dragEnabled) this.dragger.sweep();
    }
    togglePause() {
      if (!this.running) return;
      this.paused = !this.paused;
      this.syncButtons();
      this.status(this.paused ? 'Paused' : 'Resumed...', this.paused ? 's-warn' : 's-run');
    }
    skipCurrent() {
      if (this.mode === 'pokedex') {
        this.skipRequested = true;
        this.token++;
        this.running = false;
        const cur = this.pokedexList[this.pokedexIndex] || ('#' + (this.pokedexIndex + 1));
        this.pokedexIndex++;
        this.savePokedexState();
        this.status('Skipped: ' + cur, 's-warn');
        setTimeout(() => this.runPokedex(true), 50);
        return;
      }
      const list = this.getTargets();
      if (!list.length) { this.status('No target to skip', 's-warn'); return; }
      let idx = 0;
      if (this.mode === 'targets' && this.currentTarget && list.indexOf(this.currentTarget) >= 0) idx = list.indexOf(this.currentTarget);
      const skipped = list.splice(idx, 1)[0];
      this.setTargets(list);
      if (this.mode === 'targets') {
        this.token++;
        this.running = false;
        this.status('Skipped: ' + skipped, 's-warn');
        if (list.length) setTimeout(() => this.runTargets(), 50);
        else this._end(this.token, 'Skipped: ' + skipped, 's-warn');
      } else {
        this.status('Skipped: ' + skipped, 's-ok');
      }
    }

    // Single choke point for every craft: pacing, auto-sweep, memory, stats, discovery log.
    async craft(a, b, why) {
      const wait = this.lastCraftAt + C.gap - now();
      if (wait > 0) await sleep(wait);
      if (this.shouldSweep()) await this.sweep();
      const res = await this.game.craft(a, b, { drag: this.dragEnabled(), show: this.dragEnabled() });
      this.lastCraftAt = now();
      this.stats.crafts++;
      // Pair results are global in Infinite Craft, so remembering them is enough; the old
      // per-save "tried" list is only read (from v5.x data), never grown.
      if (!res.timedOut && !res.error) this.mem.remember(a, b, res.result || '');
      if (res.result && res.isNew) this.onDiscovery(res.result, a, b);
      this.log('craft', a + ' + ' + b + ' → ' + (res.result || 'nothing') + (res.timedOut ? ' (timed out)' : '') + (why ? '  [' + why + ']' : ''));
      this.renderStatsSoon();
      return res;
    }
    onDiscovery(name, a, b) {
      this.stats.newWords++;
      this.newItems.push(name);
      if (this.newItems.length > 60) this.newItems.splice(0, this.newItems.length - 60);
      const first = this.game.isDiscovery(name);
      if (first) this.stats.firstDisc++;
      this.log(first ? 'first' : 'new', name + '  ←  ' + a + ' + ' + b + (first ? '  FIRST DISCOVERY!' : ''));
      if (this.opt.soundEnabled) playDiscoverySound();
      const badge = this.$('#ic-badge');
      badge.classList.remove('pulse');
      void badge.offsetWidth;
      badge.classList.add('pulse');
    }
    celebrate(target, r) {
      this.stats.forged++;
      const steps = (r.ctx && r.ctx.recipeSteps) || [];
      this.lastRecipe = { target: r.name || target, text: steps.map((s) => s[0] + ' + ' + s[1] + ' = ' + s[2]).join('\n') };
      this.log('win', 'Made ' + (r.name || target) + ' via ' + (r.ctx.strategy || 'inventory') + ' in ' + r.ctx.crafts + ' crafts' + (steps.length ? ' (' + steps.length + '-step recipe saved)' : ''));
      if (this.opt.soundEnabled) playTargetSound();
      notify('Made: ' + (r.name || target) + '!');
      this.$('#ic-copy-recipe').disabled = !this.lastRecipe.text;
    }

    async runTargets() {
      const token = this._begin('targets');
      const failed = [];
      const failedWhy = [];
      let made = 0;
      try {
        if (this.ib.problem()) {
          this.status('Checking the connection to Infinibrowser...', 's-run');
          if (!(await this.checkConnection(true))) this.log('fail', 'Continuing with saved recipes and items you already have.');
          await this.checkpoint(token);
        }
        for (;;) {
          await this.checkpoint(token);
          const pending = this.getTargets().filter((t) => failed.indexOf(t) < 0);
          if (!pending.length) break;
          const t = pending[0];
          if (this.game.has(t, this.matchMode())) {
            this.log('win', 'Already have ' + this.game.find(t, this.matchMode()));
            this.removeTarget(t);
            continue;
          }
          this.currentTarget = t;
          this.showNow(t);
          this.status('Forging: ' + t + (pending.length > 1 ? '  (+' + (pending.length - 1) + ' queued)' : ''), 's-run');
          const r = await this.forge.obtain(t, { match: this.matchMode(), token });
          if (r.ok && Text.caseIsOff(r.name, t)) await this.tryExactCase(t, r, token);
          if (r.ok) {
            made++;
            this.celebrate(t, r);
            this.removeTarget(t);
            await this.maybeSweep();
          } else {
            failed.push(t);
            const why = this.forge.reason(r.ctx);
            failedWhy.push(this.ib.problem() || this.forge.reason(r.ctx) || '');
            this.log('fail', 'Could not make ' + t + (why ? ': ' + why : '') + (this.opt.relentless ? '' : ' (turn on "Never give up" to search deeper)'));
          }
        }
        const reason = failedWhy.filter(Boolean)[0];
        const msg = (made ? 'Made ' + made + ' word' + (made > 1 ? 's' : '') + '. ' : '') +
          (failed.length ? 'Could not make ' + failed.join(', ') + (reason ? ': ' + reason : '.') : (made ? '' : 'Nothing left to make.'));
        this._end(token, msg.trim(), failed.length ? 's-warn' : 's-ok', this.ib.problem() ? this.relayAction() : null);
      } catch (e) {
        if (e && e.cancelled) return;
        console.error('[WordForge]', e);
        this._end(token, 'Error: ' + (e && e.message), 's-err');
      }
    }
    // Made the word with different capitalization ("Mr. EreMey jeremy"): one more bounded round
    // aimed at exactly what was typed, building on what's already made. Keeps the first result
    // if that doesn't work.
    async tryExactCase(t, r, token) {
      this.log('plan', 'Made ' + r.name + '; now trying for the exact capitalization ' + t);
      const ex = await this.forge.obtain(t, { match: 'exact', token, nest: 1, level: 1, parent: r.ctx, label: 'Exact capitalization' });
      r.ctx.crafts += ex.ctx.crafts;
      if (ex.ok) {
        r.name = ex.name;
        r.ctx.recipeSteps = this.forge._saveRecipe(r.ctx, ex.name);
      } else {
        this.log('plan', 'Kept ' + r.name + ' (exact capitalization not reachable yet)');
      }
    }
    async runExactCurrent() {
      if (this.running) { this.status('Stop first', 's-warn'); return; }
      const t = this.getTargets()[0];
      if (!t) { this.status('No target selected', 's-warn'); return; }
      const token = this._begin('targets');
      try {
        this.showNow(t);
        const r = await this.forge.obtain(t, {
          match: this.matchMode(), token, level: 2,
          strategies: { ib: true, compound: false, build: false, relentless: false }
        });
        if (r.ok) { this.celebrate(t, r); this.removeTarget(t); this._end(token, 'Exact recipe crafted: ' + r.name, 's-ok'); }
        else this._end(token, 'No working Infinibrowser/saved recipe for ' + t + '. Press Start to use every strategy.', 's-warn');
      } catch (e) {
        if (e && e.cancelled) return;
        this._end(token, 'Error: ' + (e && e.message), 's-err');
      }
    }
    async runPastedRecipe() {
      if (this.running) { this.status('Stop first', 's-warn'); return; }
      const steps = parseLineageText(this.$('#ic-recipe-text').value);
      if (!steps.length) { this.status('Paste lines like: Water + Fire = Steam', 's-warn'); return; }
      const goal = steps[steps.length - 1][2];
      const token = this._begin('recipe');
      try {
        this.showNow(goal);
        const ctx = { target: goal, match: 'exact', exact: true, token, nest: 0, crafts: 0, path: [], strategy: 'Pasted recipe', level: C.forge.levels[1], levelIndex: 1 };
        await this.forge.runSteps(steps, ctx, ctx.level.depth, new Set());
        const ok = this.game.has(goal, true);
        if (ok) this.mem.bankPut(goal, steps, 'pasted');
        this._end(token, ok ? 'Recipe complete: ' + goal : 'Recipe stopped before ' + goal, ok ? 's-ok' : 's-warn');
      } catch (e) {
        if (e && e.cancelled) return;
        this._end(token, 'Error: ' + (e && e.message), 's-err');
      }
    }

    /* ---------- explore mode (no targets) ---------- */
    _worthCrafting(a, b) {
      if (a === b && Math.random() < 0.7) return false;
      const known = this.mem.result(a, b);
      if (known === undefined) return true;
      if (known === '') return false;
      return !this.game.has(known, true);
    }
    pickExplorePair(names) {
      if (this.opt.depthFirst) {
        for (let i = this.newItems.length - 1; i >= 0 && i >= this.newItems.length - 12; i--) {
          const n = this.newItems[i];
          if (!this.game.has(n, true) || this.isAutoBlocked(n)) continue;
          for (let k = 0; k < 60; k++) {
            const m = pick(names);
            if (this._worthCrafting(n, m)) return [n, m];
          }
        }
      }
      for (let k = 0; k < 3000; k++) {
        const a = pick(names), b = pick(names);
        if (this._worthCrafting(a, b)) return [a, b];
      }
      if (names.length <= C.largeInventory) {
        for (let i = 0; i < names.length; i++) {
          for (let j = i; j < names.length; j++) if (this.mem.result(names[i], names[j]) === undefined) return [names[i], names[j]];
        }
      }
      return null;
    }
    async exploreLoop(token) {
      for (;;) {
        await this.checkpoint(token);
        if (!this._exploreNames || this._exploreNames.v !== this.game.version) {
          this.game.refresh();
          this._exploreNames = { v: this.game.version, list: Array.from(this.game.exact).filter((n) => !this.isAutoBlocked(n)) };
        }
        const names = this._exploreNames.list;
        if (names.length < 2) { this.status('Need 2+ elements', 's-warn'); await sleep(2000); continue; }
        const pair = this.pickExplorePair(names);
        if (!pair) { this.status('Everything tried. Waiting for new items...', 's-run'); await sleep(3000); continue; }
        this.status(pair[0] + ' + ' + pair[1] + ' ...', 's-run');
        const res = await this.craft(pair[0], pair[1], 'explore');
        await this.checkpoint(token);
        if (res.result) this.status(pair[0] + ' + ' + pair[1] + ' → ' + res.result + (res.isNew ? '  (new!)' : ''), res.isNew ? 's-ok' : 's-run');
        else this.status(pair[0] + ' + ' + pair[1] + ' (nothing)', 's-run');
      }
    }
    async runExplore() {
      const token = this._begin('explore');
      try {
        this.status('Exploring (no targets)...', 's-run');
        await this.exploreLoop(token);
      } catch (e) {
        if (e && e.cancelled) return;
        console.error('[WordForge]', e);
        this._end(token, 'Error: ' + (e && e.message), 's-err');
      }
    }

    /* ---------- sweeping ---------- */
    shouldSweep() {
      if (!this.dragEnabled()) return false;
      const n = (this.game.instances() || []).length;
      if (n >= C.hardSweepThreshold) return true;
      if (!this.opt.autoSweep || n < C.sweepThreshold) return false;
      return !(this.lastSweep && now() - this.lastSweep < C.sweepCooldown);
    }
    async sweep() {
      const ok = await this.dragger.sweep();
      if (ok) this.lastSweep = now();
      return ok;
    }
    async maybeSweep() { if (this.dragEnabled()) await this.sweep(); else this.dragger.slot = 0; }

    /* ---------- Pokedex ---------- */
    formatPokemon(raw) {
      const special = POKE_SPECIAL[Text.loose(raw)];
      if (special) return special;
      return String(raw || '').toLowerCase().trim().split('-').join(' ').split(' ')
        .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : '')).join(' ');
    }
    savePokedexState() {
      Store.set(KEYS.pokeState, { index: this.pokedexIndex, total: this.pokedexList.length });
      const el = this.$('#ic-poke-start');
      if (el && document.activeElement !== el) el.value = String(this.pokedexIndex + 1);
    }
    async ensurePokedexList(showStatus) {
      if (this.pokedexList.length) { if (showStatus) this.pokeStatus('Loaded ' + this.pokedexList.length + ' Pokemon.', 's-ok'); return true; }
      if (this.pokedexLoading) return false;
      this.pokedexLoading = true;
      if (showStatus) this.pokeStatus('Loading National Dex...', 's-run');
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=2000');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const seen = new Set();
        const list = [];
        for (const row of (data && data.results) || []) {
          const name = this.formatPokemon(row && row.name);
          const k = Text.loose(name);
          if (!name || seen.has(k)) continue;
          seen.add(k);
          list.push(name);
        }
        this.pokedexList = list;
        Store.set(KEYS.pokeCache, list);
        this.savePokedexState();
        if (showStatus) this.pokeStatus('Loaded ' + list.length + ' Pokemon.', 's-ok');
        return list.length > 0;
      } catch (e) {
        this.pokeStatus('Could not load National Dex.', 's-err');
        return false;
      } finally {
        this.pokedexLoading = false;
      }
    }
    async runPokedex(resume) {
      if (this.running && this.mode !== 'pokedex') { this.status('Stop the current run first', 's-warn'); return; }
      if (!(await this.ensurePokedexList(true))) return;
      if (!resume) {
        const v = parseInt(this.$('#ic-poke-start').value, 10);
        const start = isFinite(v) && v >= 1 ? v - 1 : this.pokedexIndex;
        this.pokedexIndex = Math.min(Math.max(0, start), Math.max(0, this.pokedexList.length - 1));
      }
      this.savePokedexState();
      const token = this._begin('pokedex');
      let made = 0;
      try {
        while (this.pokedexIndex < this.pokedexList.length) {
          await this.checkpoint(token);
          const t = this.pokedexList[this.pokedexIndex];
          if (!this.game.has(t, false)) {
            const label = '#' + (this.pokedexIndex + 1) + '/' + this.pokedexList.length + ': ' + t;
            this.pokeStatus('Running ' + label, 's-run');
            this.showNow(t);
            for (let i = 1; i <= 3; i++) {
              const nxt = this.pokedexList[this.pokedexIndex + i];
              if (nxt && !this.game.has(nxt, false)) this.ib.lineage(Text.variants(nxt, false)[0]);
            }
            const r = await this.forge.obtain(t, { match: 'loose', token });
            if (r.ok) { made++; this.celebrate(t, r); this.pokeStatus('Made ' + label, 's-ok'); await this.maybeSweep(); }
            else this.log('fail', 'Skipped ' + label);
          }
          this.pokedexIndex++;
          this.savePokedexState();
        }
        this.pokeStatus('National Dex queue complete.', 's-ok');
        this._end(token, 'National Dex queue complete (' + made + ' made this run).', 's-ok');
      } catch (e) {
        if (e && e.cancelled) return;
        console.error('[WordForge]', e);
        this._end(token, 'Error: ' + (e && e.message), 's-err');
      }
    }
    resetPokedex() {
      if (this.mode === 'pokedex') this.stop();
      this.pokedexIndex = 0;
      this.savePokedexState();
      this.pokeStatus('National Dex reset to #1.', 's-ok');
    }

    /* ---------- save switching ---------- */
    refreshSaveInfo() {
      const el = this.$('#ic-save-info');
      if (!el) return;
      this.game.refresh();
      el.textContent = 'Save: ' + this.game.exact.size + ' items | ' + ('000000' + this.game.hashSum.toString(36)).slice(-6);
    }
    // Only a re-index (items disappeared or the list changed shape) can mean another save;
    // new items at the end never do, so the common case costs nothing.
    checkSaveSwitch() {
      const ch = this.game.lastChange;
      if (!ch || ch.kind !== 'rebuild' || ch.prev === this._checkedPrev) return;
      this._checkedPrev = ch.prev;
      const names = this.game.exact;
      const prev = { count: ch.prev ? ch.prev.size : 0, set: ch.prev || new Set() };
      const next = { count: names.size, set: names };
      if (!names.size) return;
      // Growing from (almost) nothing is the game finishing its load, not a different save.
      if (prev.count < C.saveSwitch.minCount) return;
      if (now() - this.saveSwitchAt < C.saveSwitch.cooldown) return;
      if (prev.count < C.saveSwitch.minCount && next.count < C.saveSwitch.minCount) return;
      let shared = 0;
      const [small, big] = prev.count <= next.count ? [prev.set, next.set] : [next.set, prev.set];
      for (const n of small) if (big.has(n)) shared++;
      const overlap = shared / Math.max(prev.count, next.count);
      const delta = Math.abs(prev.count - next.count);
      if (overlap > C.saveSwitch.maxOverlap && !(delta >= C.saveSwitch.minDelta && overlap < 0.8)) return;
      this.saveSwitchAt = now();
      if (this.running) this.stop();
      this.newItems = [];
      this.status('Different save detected (' + prev.count + ' → ' + next.count + ' items, ' + Math.round(overlap * 100) + '% overlap). Stopped; learned recipes still apply.', 's-warn');
    }
    observe() {
      if (this._observer) return;
      const node = document.querySelector(C.container) || document.body;
      let timer = null;
      this._observer = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const changed = this.game.refresh();
          this.checkSaveSwitch();
          if (changed) {
            this.refreshSaveInfo();
            this.renderStatsSoon();
          }
        }, C.observeDebounce);
      });
      this._observer.observe(node, { childList: true, subtree: true });
    }
    rescanSave() {
      this.game._vm = null;
      this.game.refresh('full');
      this._checkedPrev = this.game.lastChange && this.game.lastChange.prev;
      this.saveSwitchAt = now();
      this.refreshSaveInfo();
      this.renderStats();
      this.status(this.game.hasApi() ? 'Re-scanned save (' + this.game.count() + ' items).' : 'Re-scanned, but the game API was not found.', this.game.hasApi() ? 's-ok' : 's-warn');
    }

    /* ---------- export / import ---------- */
    // Everything needed to see why a word is stuck: what it was building, its notes, and the
    // last ~2000 pairs it asked for (crafted or answered from memory).
    debugInfo() {
      const f = this.forge, c = f.lastCtx;
      const lines = [
        'Word Forge Pro ' + VERSION + ' debug info, ' + new Date().toISOString(),
        'Game client: ' + (this.game.ic() ? 'window.IC' : (this.game._vmCraft() ? 'legacy view-model' : 'not found')) + ', items: ' + this.game.count(),
        'Infinibrowser: ' + (this.ib.problem() || 'ok') + (Relay.alive() ? ' (relay tab connected)' : '') + ', requests: ' + this.ib.requests,
        'Text tools learned: ' + this.tools.size,
        'Running: ' + this.running
      ];
      if (c) {
        lines.push('', 'Target: ' + c.target + ' (match: ' + c.match + ')', 'Strategy: ' + (c.strategy || '-') + ', round ' + (c.round || 1) + ', level ' + ((c.level && c.level.name) || '-') + ', crafts ' + c.crafts);
        if (c.best) lines.push('Furthest text: ' + c.best.text);
        if (this._nowState) lines.push('Card: ' + this._nowState.msg);
        lines.push('Notes:');
        for (const m of c.notes || []) lines.push('  [' + ((c.noteP && c.noteP[m]) || 5) + '] ' + m);
      }
      lines.push('', 'Log:');
      for (const r of this.logRows.filter((x) => x.type !== 'craft').slice(-80)) lines.push('  ' + r.type + ': ' + r.msg);
      lines.push('', 'Pairs (a + b = result [why] source), oldest first:');
      for (const t of f.trace.slice(-2000)) lines.push('  ' + t[0] + ' + ' + t[1] + ' = ' + (t[2] || 'nothing') + (t[3] ? ' [' + t[3] + ']' : '') + ' ' + t[4]);
      return lines.join('\n');
    }
    copyDebugInfo() {
      const text = this.debugInfo();
      const fallback = () => {
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'word-forge-debug-' + Date.now() + '.txt';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        this.status('Clipboard blocked, so the debug info was saved as a file', 's-ok');
      };
      const done = () => this.status('Copied debug info (' + text.split('\n').length + ' lines). Paste it where you report the problem.', 's-ok');
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
        else fallback();
      } catch (e) { fallback(); }
    }
    exportData() {
      const pairs = {};
      for (const [k, v] of this.mem.pairs) pairs[k] = v;
      const data = {
        version: VERSION,
        exported: new Date().toISOString(),
        options: this.opt,
        speed: this.speed,
        exclude: this.$('#ic-exclude').value.split('\n').map((s) => s.trim()).filter(Boolean),
        drafts: { target: this.$('#ic-target').value || '' },
        pokedexState: { index: this.pokedexIndex, total: this.pokedexList.length },
        recipeBank: this.mem.recipeBank,
        pairResults: pairs,
        badRecipePairs: Array.from(this.mem.bad),
        triedKeys: Array.from(this.mem.tried),
        tools: { obs: Array.from(this.tools.obs, ([op, m]) => [op, Array.from(m)]), stats: Array.from(this.tools.stats) },
        discoveries: this.logRows.filter((r) => r.type !== 'craft').slice(-300)
      };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'infinite-craft-word-forge-' + Date.now() + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      this.status('Exported!', 's-ok');
    }
    importFile(file) {
      const reader = new FileReader();
      reader.onload = () => {
        try { this.applyImport(JSON.parse(String(reader.result || '{}'))); }
        catch (e) { this.status('Import failed: invalid JSON', 's-err'); }
      };
      reader.onerror = () => this.status('Import failed: file read error', 's-err');
      reader.readAsText(file);
    }
    applyImport(d) {
      d = d || {};
      if (Array.isArray(d.triedKeys)) for (const k of d.triedKeys) this.mem.tried.add(k);
      if (d.pairResults && typeof d.pairResults === 'object') {
        for (const k of Object.keys(d.pairResults)) this.mem.pairs.set(k, d.pairResults[k]);
        this.mem.pairsChanged();
      }
      if (Array.isArray(d.badRecipePairs)) for (const k of d.badRecipePairs) this.mem.bad.add(k);
      else if (d.badRecipePairs && typeof d.badRecipePairs === 'object') for (const k of Object.keys(d.badRecipePairs)) this.mem.bad.add(k);
      if (d.recipeBank && typeof d.recipeBank === 'object') Object.assign(this.mem.recipeBank, d.recipeBank);
      if (d.tools && Array.isArray(d.tools.obs)) {
        for (const [op, sigs] of d.tools.obs) for (const [s, n] of sigs) this.tools.observe(op, parseSig(s), n);
        for (const [k, s] of d.tools.stats || []) this.tools.stats.set(k, s);
      }
      if (Array.isArray(d.exclude)) { this.$('#ic-exclude').value = d.exclude.join('\n'); this.saveExclude(); }
      if (d.drafts && typeof d.drafts.target === 'string') this.setTargets(d.drafts.target.split(/[,\n]/).map((s) => s.trim()).filter(Boolean));
      if (d.pokedexState && typeof d.pokedexState.index === 'number' && d.pokedexState.index >= 0) { this.pokedexIndex = d.pokedexState.index | 0; this.savePokedexState(); }
      if (d.options && typeof d.options === 'object') {
        for (const k of Object.keys(DEFAULT_OPTIONS)) if (typeof d.options[k] === 'boolean') this.opt[k] = d.options[k];
        this.saveOptions();
        this.applyOptionsToUI();
      }
      if (Array.isArray(d.discoveries)) {
        for (const r of d.discoveries.slice(-200)) {
          if (r && r.name) this.log(r.firstDiscovery ? 'first' : 'new', r.name + '  ←  ' + (r.a || '?') + ' + ' + (r.b || '?'));
          else if (r && r.msg) this.log(r.type || 'new', r.msg);
        }
      }
      for (const n of ['tried', 'pairs', 'bad', 'bank']) this.mem._mark(n);
      this.mem.flush();
      this.renderStats();
      this.status('Imported history and learned data.', 's-ok');
    }
    async clearLearned() {
      if (!window.confirm('Forget tried pairs, known pair results and bad recipes? (Saved recipes and learned text tools are kept.)')) return;
      await this.mem.resetLearned();
      this.renderStats();
      this.status('Cleared learned pair history.', 's-ok');
    }
    async relearnTools() {
      if (this.running) { this.status('Stop first', 's-warn'); return; }
      this.tools.reset();
      this.status('Learning text tools from Infinibrowser...', 's-run');
      const ok = await this.tools.ensureMined((d, n) => this.status('Learning text tools from Infinibrowser (' + d + '/' + n + ')', 's-run'));
      this.renderInfo();
      this.status(ok ? 'Learned ' + this.tools.size + ' text tools.' : 'Infinibrowser unreachable; will retry when needed.', ok ? 's-ok' : 's-warn');
    }
    copyRecipe() {
      if (!this.lastRecipe || !this.lastRecipe.text) return;
      const text = this.lastRecipe.text;
      const done = () => this.status('Copied recipe for ' + this.lastRecipe.target, 's-ok');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => { this.$('#ic-recipe-text').value = text; this.status('Recipe placed in the "Run a recipe" box', 's-ok'); });
      else { this.$('#ic-recipe-text').value = text; this.status('Recipe placed in the "Run a recipe" box', 's-ok'); }
    }

    /* ---------- UI ---------- */
    $(sel) { return this.panel.querySelector(sel); }
    status(msg, cls) {
      const el = this.$('#ic-status');
      if (!el) return;
      el.textContent = msg;
      el.className = 'ic-status' + (cls ? ' ' + cls : '');
    }
    pokeStatus(msg, cls) {
      const el = this.$('#ic-poke-status');
      if (!el) return;
      el.textContent = msg;
      el.className = 'ic-status' + (cls ? ' ' + cls : '');
    }
    showNow(target) {
      this.$('#ic-now').classList.remove('done-ok', 'done-bad');
      this._setAction(null);
      this._fixShown = false;
      this._nowState = { target, strategy: '', msg: 'Starting...', progress: 0, round: 1, level: '', crafts: 0, started: now() };
      this.$('#ic-now').classList.add('show');
      this._renderNow();
    }
    hideNow() { this.$('#ic-now').classList.remove('show'); this.$('#ic-now').classList.remove('done-ok', 'done-bad'); this._setAction(null); this._nowState = null; }
    _setAction(action) {
      const btn = this.$('#ic-now-action');
      if (!action) { btn.style.display = 'none'; btn.onclick = null; return; }
      btn.textContent = action.label;
      btn.onclick = action.fn;
      btn.style.display = 'block';
    }
    relayAction() { return { label: 'Open Infinibrowser tab', fn: () => this.openRelay() }; }
    // Show a message in the card even when no run is going (connection problems, tests).
    notice(title, msg, cls, action) {
      this.showNow(title);
      this.finishNow(msg, cls, action);
    }
    // Leave the card up with how the run ended (and why), until the next run starts.
    finishNow(msg, cls, action) {
      const card = this.$('#ic-now');
      if (!msg || !this._nowState) { this.hideNow(); return; }
      this._setAction(action || null);
      if (this._nowTimer) { clearTimeout(this._nowTimer); this._nowTimer = null; }
      const bad = cls === 's-err' || cls === 's-warn';
      card.classList.remove('done-ok', 'done-bad');
      card.classList.add(bad ? 'done-bad' : 'done-ok');
      this.$('#ic-now-strategy').textContent = bad ? 'Stopped' : 'Done';
      this.$('#ic-now-msg').textContent = msg;
      this.$('#ic-now-bar').style.width = bad ? '0%' : '100%';
      this._nowState = null;
    }
    forgeStatus(ctx, msg, progress) {
      if (!this._nowState) this.showNow(ctx.target);
      const s = this._nowState;
      if (ctx.nest === 0) s.target = ctx.target;
      s.strategy = (ctx.label ? ctx.label + ' · ' : (ctx.nest ? 'Part "' + ctx.target + '" · ' : '')) + (ctx.strategy || '');
      s.msg = msg;
      s.progress = typeof progress === 'number' ? progress : s.progress;
      s.round = ctx.round || 1;
      s.level = (ctx.level && ctx.level.name) || '';
      s.crafts = ctx.crafts;
      // While Infinibrowser is unreachable the run keeps going; offer the fix right in the card.
      const needsFix = !!this.ib.problem() && !Relay.alive();
      if (needsFix !== !!this._fixShown) { this._fixShown = needsFix; this._setAction(needsFix ? this.relayAction() : null); }
      if (this._nowTimer) return;
      this._nowTimer = setTimeout(() => { this._nowTimer = null; this._renderNow(); }, 80);
    }
    _renderNow() {
      const s = this._nowState;
      if (!s) return;
      this.$('#ic-now-target').textContent = s.target;
      this.$('#ic-now-strategy').textContent = s.strategy || '...';
      this.$('#ic-now-round').textContent = 'round ' + s.round + (s.level ? ' · ' + s.level : '') + ' · ' + Math.round((now() - s.started) / 1000) + 's';
      this.$('#ic-now-msg').textContent = s.msg;
      this.$('#ic-now-bar').style.width = Math.max(0, Math.min(100, Math.round((s.progress || 0) * 100))) + '%';
    }
    renderStatsSoon() {
      if (this._statsTimer) return;
      this._statsTimer = setTimeout(() => { this._statsTimer = null; this.renderStats(); }, 150);
    }
    // Copy the game's own font, colours and item shape from a real item on the page, and follow
    // its dark mode, so the panel looks like part of Infinite Craft.
    syncTheme() {
      try {
        const targets = [this.panel, this.logPanel].filter(Boolean);
        if (!targets.length) return;
        const solid = (c) => (c && !/^(transparent|rgba\(\s*0,\s*0,\s*0,\s*0\s*\))$/.test(c.trim()) ? c : '');
        const item = document.querySelector(C.itemSel) || document.querySelector('.item');
        const ic = item ? getComputedStyle(item) : null;
        let pageBg = '';
        for (const el of [document.querySelector('.sidebar'), document.querySelector(C.container), document.body, document.documentElement]) {
          const c = el && solid(getComputedStyle(el).backgroundColor);
          if (c) { pageBg = c; break; }
        }
        const vars = {};
        if (ic) {
          if (solid(ic.backgroundColor)) vars['--wf-chip'] = ic.backgroundColor;
          if (ic.color) vars['--wf-text'] = ic.color;
          if (parseFloat(ic.borderTopWidth) > 0 && solid(ic.borderTopColor)) vars['--wf-border'] = ic.borderTopColor;
          if (ic.borderTopLeftRadius && ic.borderTopLeftRadius !== '0px') vars['--wf-radius'] = ic.borderTopLeftRadius;
          if (ic.fontFamily) vars['--wf-font'] = ic.fontFamily;
        } else if (document.body) {
          vars['--wf-font'] = getComputedStyle(document.body).fontFamily;
        }
        if (pageBg) vars['--wf-bg'] = pageBg;
        const lum = (c) => {
          const m = /rgba?\(([^)]+)\)/.exec(c || '');
          if (!m) return 1;
          const [r, g, b] = m[1].split(',').map((x) => parseFloat(x));
          return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        };
        const dark = lum(pageBg || vars['--wf-chip']) < 0.45;
        const sig = JSON.stringify(vars) + dark;
        if (sig === this._themeSig) return;
        this._themeSig = sig;
        for (const t of targets) {
          t.classList.toggle('wf-dark', dark);
          for (const k of ['--wf-bg', '--wf-chip', '--wf-text', '--wf-border', '--wf-radius', '--wf-font']) {
            if (vars[k]) t.style.setProperty(k, vars[k]); else t.style.removeProperty(k);
          }
        }
      } catch (e) {}
    }
    renderStats() {
      this.$('#ic-s-new').textContent = this.stats.newWords;
      this.$('#ic-s-disc').textContent = this.stats.firstDisc;
      this.$('#ic-s-crafts').textContent = this.stats.crafts;
      this.$('#ic-s-forged').textContent = this.stats.forged;
      const badge = this.$('#ic-badge');
      badge.textContent = this.stats.newWords;
      badge.classList.toggle('has-new', this.stats.newWords > 0);
    }
    renderInfo() {
      const el = this.$('#ic-info');
      if (!el) return;
      const ib = this.ib.problem() ? (this.ib.challengeAt ? 'needs a browser check' : 'unreachable')
        : (this.ib.lastOkAt ? 'connected' : 'not checked yet') + (Relay.alive() ? ' (through its tab)' : GMX ? ' (via userscript manager)' : ' (direct)');
      const game = this.game.ic() ? 'connected' : (this.game.hasApi() ? 'connected (older version)' : 'not found yet');
      el.textContent = 'Game: ' + game + ' \u00b7 Infinibrowser: ' + ib + ', ' + this.ib.requests + ' requests' +
        (this.ib.rateLimited ? ', ' + this.ib.rateLimited + ' rate-limited' : '') +
        ' \u00b7 Known pair results: ' + this.mem.pairs.size + ' \u00b7 Text tools learned: ' + this.tools.size +
        ' \u00b7 Storage: ' + (this.mem.idb ? 'IndexedDB' : 'memory only');
    }
    // Same message only once per run (e.g. a recipe step that keeps giving something else).
    logOnce(type, msg) {
      this._logged = this._logged || new Set();
      if (this._logged.has(msg)) return;
      this._logged.add(msg);
      this.log(type, msg);
    }
    log(type, msg) {
      const row = { type, msg, time: clock(), ts: now() };
      this.logRows.push(row);
      if (this.logRows.length > 400) this.logRows.splice(0, this.logRows.length - 400);
      // The log window is drawn only while it's open (it's rebuilt from logRows when opened).
      if (!this.logBody || !this.logPanel.classList.contains('show')) { this._logStale = true; return; }
      this._logRow(row);
    }
    _logRow(row) {
      const type = row.type;
      const entry = document.createElement('div');
      entry.className = 'log-entry t-' + type;
      const left = document.createElement('span');
      left.textContent = row.msg;
      const time = document.createElement('span');
      time.className = 'log-time';
      time.textContent = row.time;
      entry.appendChild(left);
      entry.appendChild(time);
      this.logBody.insertBefore(entry, this.logBody.firstChild);
      while (this.logBody.children.length > 400) this.logBody.removeChild(this.logBody.lastChild);
    }
    buildLog() {
      const d = document.createElement('div');
      d.id = 'ic-log';
      d.innerHTML = '<div class="log-header"><span>Forge Log</span><label><input type="checkbox" id="ic-log-crafts"> every craft</label><button id="ic-log-close" title="Close">✕</button></div><div class="log-body" id="ic-log-body"></div>';
      document.body.appendChild(d);
      this.logPanel = d;
      this.logBody = d.querySelector('#ic-log-body');
      d.querySelector('#ic-log-close').onclick = () => d.classList.remove('show');
      const cb = d.querySelector('#ic-log-crafts');
      cb.checked = this.opt.logCrafts;
      cb.onchange = () => { this.opt.logCrafts = cb.checked; this.saveOptions(); d.classList.toggle('hide-crafts', !cb.checked); };
      d.classList.toggle('hide-crafts', !this.opt.logCrafts);
    }
    buildPanel() {
      const p = document.createElement('div');
      p.id = 'ic-panel';
      const chk = (opt, label, title) => '<label class="ic-check"' + (title ? ' title="' + title + '"' : '') + '><input type="checkbox" data-opt="' + opt + '"> ' + label + '</label>';
      p.innerHTML = [
        '<div class="ic-header" id="ic-header">',
        '<span class="ic-title">⚒️ Word Forge</span>',
        '<div style="display:flex;align-items:center;gap:6px;">',
        '<div class="ic-badge" id="ic-badge" data-emoji="\u2728" title="New items this session">0</div>',
        '<button class="ic-minimize" id="ic-collapse" title="Collapse">−</button>',
        '</div></div>',
        '<div class="ic-body">',
        '<div class="ic-section">',
        '<div class="ic-section-title">Words to make (comma or newline separated)</div>',
        '<textarea class="ic-textarea" id="ic-target" rows="2" placeholder="Anything: Dragon, Fire Truck, Zorblaxian, Hello World"></textarea>',
        '<a class="ic-link" id="ic-lookup" href="#" target="_blank" rel="noopener" style="display:none;"></a>',
        '</div>',
        '<div class="ic-btn-row">',
        '<button class="ic-btn ic-btn-start" id="ic-start" data-emoji="\u25B6\uFE0F">Start</button>',
        '<button class="ic-btn" id="ic-pause" data-emoji="\u23F8\uFE0F" disabled>Pause</button>',
        '<button class="ic-btn" id="ic-stop" data-emoji="\u23F9\uFE0F">Stop</button>',
        '</div>',
        '<div class="ic-now" id="ic-now">',
        '<div class="ic-now-target" id="ic-now-target"></div>',
        '<div class="ic-now-meta"><span class="ic-now-strategy" id="ic-now-strategy"></span><span id="ic-now-round"></span></div>',
        '<div class="ic-bar"><div id="ic-now-bar"></div></div>',
        '<div class="ic-now-msg" id="ic-now-msg"></div>',
        '<button class="ic-btn ic-btn-warn" id="ic-now-action" style="display:none;margin-top:2px;"></button>',
        '</div>',
        '<div class="ic-stats">',
        '<div class="ic-stat" data-emoji="\u2728" title="New items this session"><span class="ic-stat-val" id="ic-s-new">0</span><span class="ic-stat-label">new items</span></div>',
        '<div class="ic-stat" data-emoji="\uD83C\uDFC6" title="First discoveries this session"><span class="ic-stat-val" id="ic-s-disc">0</span><span class="ic-stat-label">first discoveries</span></div>',
        '<div class="ic-stat" data-emoji="\uD83D\uDD28" title="Crafts this session"><span class="ic-stat-val" id="ic-s-crafts">0</span><span class="ic-stat-label">crafts</span></div>',
        '<div class="ic-stat" data-emoji="\uD83C\uDFAF" title="Words from your list made this session"><span class="ic-stat-val" id="ic-s-forged">0</span><span class="ic-stat-label">words made</span></div>',
        '</div>',
        '<div class="ic-btn-row">',
        '<button class="ic-btn" id="ic-skip" data-emoji="\u23ED\uFE0F" title="Skip the current target and move on">Skip</button>',
        '<button class="ic-btn" id="ic-exact" data-emoji="\uD83D\uDCDC" title="Make the first word only from a saved or Infinibrowser recipe (no letter building)">Recipe</button>',
        '<button class="ic-btn" id="ic-logbtn" data-emoji="\uD83D\uDCCB">Log</button>',
        '</div>',
        '<details class="ic-details" data-sec="strategies" open><summary>Strategies</summary><div class="ic-dbody">',
        chk('sIB', '1. Look it up on Infinibrowser', 'If someone already uploaded the word, craft its cheapest recipe; if a step fails, reroute through alternate recipes'),
        chk('sCompound', '2. Phrases from words that exist', 'Fire Truck Monster = Fire Truck + Monster, only when both parts already exist'),
        chk('sBuild', '3. Build new words letter by letter', 'For words nobody has made: quoted letters + text tools learned from Infinibrowser, then unquote'),
        chk('relentless', 'Never give up (search deeper)', 'Keeps escalating recipe depth and tool search until every known route is used up'),
        chk('exactSpelling', 'Exact capitalization too', 'Off: capitalization may differ ("fire truck" accepts "Fire Truck"); spelling, spaces and punctuation always have to match'),
        '<div class="ic-btn-row" style="align-items:center;"><span class="ic-small" style="flex:0 0 auto;">Speed</span>',
        '<select class="ic-select" id="ic-speed"><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option><option value="turbo">Turbo</option></select></div>',
        '</div></details>',
        '<details class="ic-details" data-sec="pokedex"><summary>National Pokedex</summary><div class="ic-dbody">',
        '<div class="ic-btn-row"><input class="ic-input" id="ic-poke-start" placeholder="Start #" style="flex:1;" title="National Dex number to start from" />',
        '<button class="ic-btn" id="ic-poke-load" style="flex:1.1;">Load Dex</button></div>',
        '<div class="ic-btn-row"><button class="ic-btn" id="ic-poke-run" style="flex:1.4;">Run</button>',
        '<button class="ic-btn ic-btn-danger" id="ic-poke-stop" style="flex:1;">Stop Dex</button>',
        '<button class="ic-btn" id="ic-poke-reset" style="flex:1;">Reset</button></div>',
        '<div class="ic-status" id="ic-poke-status" style="padding:5px;font-size:10px;">National Dex idle</div>',
        '</div></details>',
        '<details class="ic-details" data-sec="settings"><summary>Settings &amp; Data</summary><div class="ic-dbody">',
        '<div class="ic-section-title">Never use these items</div>',
        '<textarea class="ic-textarea" id="ic-exclude" rows="2" placeholder="One per line"></textarea>',
        chk('autoSweep', 'Auto sweep board when laggy'),
        chk('dragEnabled', 'Show crafts on the board (slower)'),
        chk('soundEnabled', 'Sound on discovery'),
        '<div class="ic-section-title" style="margin-top:4px;">Run a recipe</div>',
        '<textarea class="ic-textarea" id="ic-recipe-text" rows="2" placeholder="Water + Fire = Steam&#10;Steam + Earth = Mud"></textarea>',
        '<div class="ic-btn-row"><button class="ic-btn" id="ic-recipe-run">Run Recipe</button>',
        '<button class="ic-btn" id="ic-copy-recipe" disabled title="Copy the recipe used for the last word made">Copy Last Recipe</button></div>',
        '<div class="ic-btn-row"><button class="ic-btn" id="ic-export">Export</button>',
        '<button class="ic-btn" id="ic-import">Import</button></div>',
        '<div class="ic-btn-row"><button class="ic-btn" id="ic-relearn" title="Re-survey Infinibrowser for text tools">Re-learn Tools</button>',
        '<button class="ic-btn ic-btn-danger" id="ic-clear">Clear Learned</button></div>',
        '<div class="ic-btn-row"><button class="ic-btn" id="ic-test-conn" title="Check every way of reaching Infinibrowser and show the results">Test Connection</button>',
        '<button class="ic-btn" id="ic-open-relay" title="Open infinibrowser.wiki in a tab the script can fetch recipes through">Open Infinibrowser Tab</button></div>',
        '<div class="ic-btn-row"><button class="ic-btn" id="ic-debug" title="Copy what it is building, why it is stuck, and the last 2000 crafts it tried">Copy Debug Info</button></div>',
        '<div class="ic-status" id="ic-save-info" style="padding:5px;font-size:10px;">Save: unknown</div>',
        '<button class="ic-btn" id="ic-rebind-save">Re-scan Save</button>',
        '<div class="ic-section-title" style="margin-top:4px;">Random exploring (optional)</div>',
        '<div class="ic-small">Only runs if you press this. Start never combines things at random.</div>',
        chk('depthFirst', 'Try newest items first'),
        '<button class="ic-btn" id="ic-explore" title="Combine random items to find new ones (no target)">Explore Randomly</button>',
        '<div class="ic-small" id="ic-info"></div>',
        '<a class="ic-link" href="https://infinibrowser.wiki/" target="_blank" rel="noopener">infinibrowser.wiki</a>',
        '<input type="file" id="ic-import-file" accept="application/json,.json" style="display:none;" />',
        '</div></details>',
        '<div class="ic-status" id="ic-status">...</div>',
        '<div class="ic-small" style="text-align:right;opacity:.6;">v' + VERSION + '</div>',
        '</div>'
      ].join('');
      document.body.appendChild(p);
      this.panel = p;
      this.bindPanel();
      this.restorePanelPos();
    }
    bindPanel() {
      const $ = (s) => this.$(s);
      $('#ic-start').onclick = () => this.start();
      $('#ic-stop').onclick = () => this.stop();
      $('#ic-pause').onclick = () => this.togglePause();
      $('#ic-skip').onclick = () => this.skipCurrent();
      $('#ic-exact').onclick = () => this.runExactCurrent();
      $('#ic-logbtn').onclick = () => {
        const show = !this.logPanel.classList.contains('show');
        if (show && this._logStale) {
          this._logStale = false;
          this.logBody.textContent = '';
          for (const r of this.logRows) this._logRow(r);
        }
        this.logPanel.classList.toggle('show', show);
      };
      $('#ic-collapse').onclick = () => { this.opt.collapsed = !this.opt.collapsed; this.saveOptions(); this.applyOptionsToUI(); };
      $('#ic-speed').onchange = (e) => this.setSpeed(e.target.value);
      $('#ic-target').addEventListener('input', () => { this.saveDrafts(); this.updateLookup(); });
      $('#ic-exclude').addEventListener('change', () => this.saveExclude());
      $('#ic-recipe-run').onclick = () => this.runPastedRecipe();
      $('#ic-copy-recipe').onclick = () => this.copyRecipe();
      $('#ic-export').onclick = () => this.exportData();
      $('#ic-import').onclick = () => $('#ic-import-file').click();
      $('#ic-import-file').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; if (f) this.importFile(f); e.target.value = ''; });
      $('#ic-relearn').onclick = () => this.relearnTools();
      $('#ic-clear').onclick = () => this.clearLearned();
      $('#ic-rebind-save').onclick = () => this.rescanSave();
      $('#ic-explore').onclick = () => this.startExplore();
      $('#ic-test-conn').onclick = () => this.testConnection();
      $('#ic-open-relay').onclick = () => this.openRelay();
      $('#ic-debug').onclick = () => this.copyDebugInfo();
      $('#ic-poke-load').onclick = () => this.ensurePokedexList(true);
      $('#ic-poke-run').onclick = () => this.runPokedex(false);
      $('#ic-poke-stop').onclick = () => { if (this.mode === 'pokedex') this.stop(); else this.pokeStatus('National Dex idle'); };
      $('#ic-poke-reset').onclick = () => this.resetPokedex();
      $('#ic-poke-start').onchange = (e) => {
        let n = parseInt(e.target.value, 10);
        if (!isFinite(n) || n < 1) n = 1;
        this.pokedexIndex = n - 1;
        this.savePokedexState();
        this.pokeStatus('National Dex start set to #' + n, 's-ok');
      };
      this.panel.querySelectorAll('[data-opt]').forEach((el) => {
        el.addEventListener('change', () => {
          this.opt[el.getAttribute('data-opt')] = el.checked;
          this.saveOptions();
        });
      });
      const secs = Store.get(KEYS.sections, {}) || {};
      this.panel.querySelectorAll('details[data-sec]').forEach((d) => {
        const k = d.getAttribute('data-sec');
        if (typeof secs[k] === 'boolean') d.open = secs[k];
        d.addEventListener('toggle', () => { const s = Store.get(KEYS.sections, {}) || {}; s[k] = d.open; Store.set(KEYS.sections, s); });
      });
      // Drag the panel by its header.
      const header = $('#ic-header');
      header.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        const r = this.panel.getBoundingClientRect();
        const ox = e.clientX - r.left, oy = e.clientY - r.top;
        const move = (ev) => {
          const x = Math.max(0, Math.min(window.innerWidth - 60, ev.clientX - ox));
          const y = Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - oy));
          this.panel.style.left = x + 'px';
          this.panel.style.top = y + 'px';
        };
        const up = () => {
          document.removeEventListener('mousemove', move, true);
          document.removeEventListener('mouseup', up, true);
          Store.set(KEYS.panelPos, { left: this.panel.style.left, top: this.panel.style.top });
        };
        document.addEventListener('mousemove', move, true);
        document.addEventListener('mouseup', up, true);
        e.preventDefault();
        e.stopPropagation();
      });
      // Keep the game from treating clicks/drags inside the panel as board input.
      for (const ev of ['mousedown', 'pointerdown', 'touchstart', 'wheel']) this.panel.addEventListener(ev, (e) => e.stopPropagation());
    }
    // Keys typed inside the panel never reach the game (see installKeyGuard), so panel
    // shortcuts are handled here: Ctrl/Cmd+Enter starts, Esc leaves the field.
    onPanelKey(e) {
      const t = e.target;
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && t && t.id === 'ic-target') {
        e.preventDefault();
        this.start();
      } else if (e.key === 'Escape' && t && typeof t.blur === 'function') {
        t.blur();
      }
    }
    restorePanelPos() {
      const pos = Store.get(KEYS.panelPos, null);
      if (pos && pos.left && pos.top) {
        const l = Math.min(parseInt(pos.left, 10) || 10, window.innerWidth - 60);
        const t = Math.min(parseInt(pos.top, 10) || 10, window.innerHeight - 40);
        this.panel.style.left = Math.max(0, l) + 'px';
        this.panel.style.top = Math.max(0, t) + 'px';
      }
    }
  }

  /* ============================================================
   * Boot
   * ============================================================ */
  // Infinite Craft sends any typing that isn't in an <input> to its search bar, which stole
  // keystrokes from the panel's text boxes. Stop key events that start inside the panel at
  // the window in the capture phase, before any game listener sees them (this runs at
  // document-start, so it is registered first). The browser still types the text into our
  // field because the default action isn't cancelled.
  function installKeyGuard(app) {
    const inUI = (t) => !!(t && t.closest && t.closest('#ic-panel, #ic-log'));
    for (const type of ['keydown', 'keypress', 'keyup', 'paste', 'copy', 'cut']) {
      window.addEventListener(type, (e) => {
        if (!inUI(e.target)) return;
        e.stopImmediatePropagation();
        if (type === 'keydown') app.onPanelKey(e);
      }, true);
    }
  }

  const app = new App();
  W._icAutoInstance = app;
  installKeyGuard(app);
  const boot = () => app.init().catch((e) => console.error('[WordForge] init failed', e));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
