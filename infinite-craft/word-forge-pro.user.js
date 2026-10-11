// ==UserScript==
// @name         Infinite Craft - Word Forge Pro (Auto Combiner v6)
// @namespace    https://neal.fun/infinite-craft/
// @version      6.0.0
// @description  Type any word and it gets crafted: self-healing Infinibrowser lineages, compound splitting, letter-by-letter string building with auto-learned text tools, and guided search. Keeps the auto combiner, National Pokedex queue, history and save tools.
// @match        https://neal.fun/infinite-craft*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  if (window._icAutoInstance) { console.warn('[WordForge] Already running.'); return; }

  /* ============================================================
   * Config
   * ============================================================ */
  const VERSION = '6.0.0';

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
    sections: 'icForgeSectionsV6'
  };

  const SPEED_PRESETS = {
    slow: { gap: 450, settle: 220, step: 12, between: 150 },
    normal: { gap: 200, settle: 140, step: 10, between: 120 },
    fast: { gap: 90, settle: 90, step: 8, between: 80 },
    turbo: { gap: 30, settle: 50, step: 5, between: 50 }
  };

  const TARGET_MODIFIERS = [
    'underscore', '_', 'the', 'suffix', 'prefix', 'rare words', 'my_',
    'giant', 'mega', 'super', 'microscopic', 'future', 'neo',
    'number', '1', '2', '3', 'backwards', 'hyphen', 'slash', 'asterisk', 'hashtag',
    'dot', 'quotation marks', 'parentheses', 'bracket',
    'shouting', 'loud', 'dash', 'grammar', 'divide', 'star', 'footnote',
    'letter', 'message', 'book', 'delta', 'surname',
    'catalyst', 'human', 'life', 'love', 'time', 'infinity', 'celebrity',
    'bottle', 'beach', 'steam', 'dust', 'planet', 'sun'
  ];

  const TARGET_CATALYSTS = [
    'human', 'catalyst', 'rare words', 'love', 'time', 'infinity',
    'celebrity', 'steam', 'dust', 'life', 'first discovery'
  ];

  const SEMANTIC_MAP = {
    dragon: ['lizard', 'fire', 'reptile', 'wing', 'scale', 'mythical', 'dinosaur', 'fly'],
    unicorn: ['horse', 'rainbow', 'magic', 'horn', 'mythical', 'fairy'],
    phoenix: ['bird', 'fire', 'ash', 'rebirth', 'flame', 'myth'],
    dinosaur: ['lizard', 'reptile', 'fossil', 'bone', 'extinct', 'jurassic'],
    cat: ['animal', 'pet', 'kitten', 'fur', 'whisker', 'meow'],
    dog: ['animal', 'pet', 'puppy', 'bone', 'bark', 'wolf'],
    fish: ['water', 'ocean', 'sea', 'swim', 'fin', 'river'],
    bird: ['sky', 'fly', 'wing', 'feather', 'nest', 'egg'],
    shark: ['fish', 'ocean', 'teeth', 'danger', 'fin', 'predator'],
    wolf: ['dog', 'moon', 'howl', 'forest', 'pack', 'wild'],
    zombie: ['dead', 'human', 'brain', 'undead', 'corpse', 'grave'],
    vampire: ['blood', 'bat', 'night', 'undead', 'coffin', 'immortal'],
    ghost: ['dead', 'spirit', 'haunt', 'night', 'soul', 'transparent'],
    mermaid: ['fish', 'human', 'ocean', 'water', 'tail', 'sea'],
    fairy: ['magic', 'wing', 'small', 'sparkle', 'flower', 'pixie'],
    wizard: ['magic', 'staff', 'spell', 'hat', 'wand', 'book'],
    robot: ['metal', 'machine', 'electric', 'computer', 'human', 'ai'],
    alien: ['space', 'ufo', 'planet', 'star', 'green', 'mars'],
    lava: ['volcano', 'fire', 'rock', 'hot', 'magma', 'earth'],
    ice: ['water', 'cold', 'freeze', 'snow', 'frost', 'winter'],
    steam: ['water', 'fire', 'hot', 'cloud', 'boil', 'heat'],
    lightning: ['electricity', 'storm', 'thunder', 'sky', 'bolt', 'energy'],
    rainbow: ['rain', 'sun', 'color', 'light', 'sky', 'arc'],
    volcano: ['lava', 'fire', 'mountain', 'eruption', 'magma', 'ash'],
    pizza: ['bread', 'cheese', 'tomato', 'italy', 'oven', 'dough'],
    sushi: ['fish', 'rice', 'japan', 'seaweed', 'raw', 'roll'],
    cake: ['flour', 'sugar', 'egg', 'birthday', 'bake', 'sweet'],
    coffee: ['bean', 'caffeine', 'drink', 'morning', 'cup', 'brew'],
    star: ['space', 'light', 'sun', 'sky', 'night', 'galaxy'],
    moon: ['space', 'night', 'crater', 'tide', 'lunar', 'orbit'],
    planet: ['space', 'earth', 'orbit', 'star', 'solar', 'world'],
    sun: ['star', 'light', 'hot', 'fire', 'solar', 'day'],
    sword: ['metal', 'blade', 'weapon', 'sharp', 'fight', 'steel'],
    castle: ['stone', 'king', 'medieval', 'tower', 'wall', 'fortress'],
    boat: ['wood', 'water', 'sail', 'ocean', 'float', 'ship'],
    car: ['metal', 'engine', 'wheel', 'road', 'drive', 'vehicle'],
    rocket: ['fire', 'metal', 'space', 'fuel', 'launch', 'engine']
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
      posTTL: 30 * 864e5,
      negTTL: 2 * 864e5,
      offlineCooldown: 45000
    },
    forge: {
      // Each failed round escalates to the next level (deeper recursion, more branches).
      levels: [
        { name: 'quick', depth: 3, branches: 4, splits: 6, seeds: 3, cands: 6, appendCrafts: 80, guided: 30 },
        { name: 'deep', depth: 5, branches: 8, splits: 12, seeds: 5, cands: 10, appendCrafts: 160, guided: 120 },
        { name: 'relentless', depth: 7, branches: 16, splits: 24, seeds: 8, cands: 16, appendCrafts: 320, guided: 300 }
      ],
      giveUpRounds: 3,
      maxNest: 3,
      opsMaxAge: 7 * 864e5
    },
    modifiers: TARGET_MODIFIERS,
    catalysts: TARGET_CATALYSTS,
    semanticMap: SEMANTIC_MAP
  };

  // Test / power-user hook: window.__icForgeConfig = { gap: 0, ib: { gap: 0 } }
  (function mergeOverrides(dst, src) {
    if (!src || typeof src !== 'object') return;
    for (const k of Object.keys(src)) {
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && dst[k] && typeof dst[k] === 'object') mergeOverrides(dst[k], src[k]);
      else dst[k] = src[k];
    }
  })(C, window.__icForgeConfig);

  /* ============================================================
   * Small utilities
   * ============================================================ */
  const sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms | 0)));
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
      return out;
    },
    bigrams(s) {
      const t = ' ' + Text.soft(s) + ' ';
      const out = new Map();
      for (let i = 0; i < t.length - 1; i++) {
        const g = t.substr(i, 2);
        out.set(g, (out.get(g) || 0) + 1);
      }
      return out;
    },
    dice(a, b) {
      const A = Text.bigrams(a), B = Text.bigrams(b);
      let inter = 0, total = 0;
      for (const [g, n] of A) { total += n; if (B.has(g)) inter += Math.min(n, B.get(g)); }
      for (const n of B.values()) total += n;
      return total ? (2 * inter) / total : 0;
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
    }
    async load() {
      this.idb = await KV.available();
      const [tried, pairs, bad] = await Promise.all([KV.get('tried'), KV.get('pairs'), KV.get('bad')]);
      if (Array.isArray(tried)) for (const k of tried) this.tried.add(k);
      if (pairs && typeof pairs === 'object') for (const k of Object.keys(pairs)) this.pairs.set(k, pairs[k]);
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
      if (migrated && this.idb) {
        this._dirty.add('tried'); this._dirty.add('pairs'); this._dirty.add('bad');
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
          trimMap(this.pairs, this.idb ? C.maxPairs : 8000);
          const obj = {};
          for (const [k, v] of this.pairs) obj[k] = v;
          if (this.idb) await KV.set('pairs', obj);
          else Store.set(KEYS.pairResults, obj);
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
      this._mark('pairs');
    }
    forget(a, b) { if (this.pairs.delete(pairKey(a, b))) this._mark('pairs'); }
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
      this._saveTimer = setTimeout(() => { this._saveTimer = null; this.save(); }, 5000);
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
    // Returns parsed JSON, null for a definite "unknown element", throws when unreachable.
    async _fetchJSON(path, params) {
      if (!this.enabled) throw new Error('ib-disabled');
      if (this.offline) throw new Error('ib-offline');
      const url = C.ib.base + path + '?' + new URLSearchParams(params).toString();
      for (let attempt = 0; attempt <= C.ib.retries; attempt++) {
        const start = Math.max(now(), this.nextAt, this.cooldownUntil);
        this.nextAt = start + C.ib.gap;
        if (start > now()) await sleep(start - now());
        this.requests++;
        let res;
        try {
          const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timer = ctrl ? setTimeout(() => ctrl.abort(), C.ib.timeout) : null;
          res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl ? ctrl.signal : undefined });
          if (timer) clearTimeout(timer);
        } catch (e) {
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
        if (res.status >= 500) {
          // Usually a lineage the server can't compute; one quick retry, then "unknown".
          if (attempt >= 1) throw new Error('ib-' + res.status);
          await sleep(800);
          continue;
        }
        if (!res.ok) { this.failStreak = 0; return null; }
        try {
          const json = await res.json();
          this.failStreak = 0;
          this.offlineAt = 0;
          return json;
        } catch (e) { return null; }
      }
      throw new Error('ib-unavailable');
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
    async _list(kind, id, pages) {
      const key = (kind === 'recipes' ? 'r:' : 'u:') + id + ':' + pages;
      const hit = this._cached(key);
      if (hit !== undefined) return hit;
      if (this.inflight.has(key)) return this.inflight.get(key);
      const p = (async () => {
        const out = [];
        let total = 0, offset = 0;
        try {
          for (let page = 0; page < pages; page++) {
            const json = await this._fetchJSON('/' + kind, { id, offset });
            if (json == null) { if (page === 0) { this._put(key, null); return null; } break; }
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
            if (!rows.length || (total && offset >= total)) break;
          }
          const v = { total, list: out };
          this._put(key, v);
          this._learnExists(id);
          return v;
        } catch (e) {
          return out.length ? { total, list: out } : undefined;
        } finally {
          this.inflight.delete(key);
        }
      })();
      this.inflight.set(key, p);
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
  }

  /* ============================================================
   * Game adapter: finds the Vue view-model, indexes inventory, crafts and reads results
   * ============================================================ */
  class Game {
    constructor() {
      this._vm = null;
      this._vmAt = 0;
      this.exact = new Set();
      this.byKey = new Map();
      this.bySoft = new Map();
      this.objs = new Map();
      this._sig = '';
      this.version = 0;
      this.dragger = null;
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
    hasApi() { const v = this.vm(); return !!(v && typeof v.craft === 'function'); }
    _list() {
      const v = this.vm();
      const names = [], objs = [];
      if (v && v.items && v.items.length) {
        for (const it of v.items) {
          const t = it && (it.text != null ? it.text : it.name);
          if (t != null && t !== '') { names.push(String(t)); objs.push(it); }
        }
        return { names, objs };
      }
      document.querySelectorAll(C.itemSel).forEach((el) => {
        const t = (el.getAttribute('data-item-text') || el.textContent || '').trim();
        if (t) { names.push(t); objs.push(null); }
      });
      return { names, objs };
    }
    _signature() {
      const v = this.vm();
      if (v && v.items && v.items.length) {
        const list = v.items, n = list.length;
        const f = list[0] && list[0].text, l = list[n - 1] && list[n - 1].text;
        return 'v' + n + ':' + f + ':' + l;
      }
      return 'd' + document.querySelectorAll(C.itemSel).length;
    }
    refresh(force) {
      const sig = this._signature();
      if (!force && sig === this._sig) return false;
      const { names, objs } = this._list();
      this.exact = new Set();
      this.byKey = new Map();
      this.bySoft = new Map();
      this.objs = new Map();
      const index = (map, k, t) => { const arr = map.get(k); if (arr) arr.push(t); else map.set(k, [t]); };
      for (let i = 0; i < names.length; i++) {
        const t = names[i];
        this.exact.add(t);
        if (objs[i]) this.objs.set(t, objs[i]);
        index(this.byKey, Text.key(t), t);
        index(this.bySoft, Text.soft(t), t);
      }
      this._sig = sig;
      this.version++;
      return true;
    }
    names() { this.refresh(); return Array.from(this.exact); }
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
      return !!(o && (o.discovered || o.isNew || o.is_new || o.firstDiscovery));
    }
    instances() { const v = this.vm(); return (v && v.instances) || null; }
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
        if (t && t !== 'Nothing') return { text: t, isNew: !before.exact.has(t) || !!(ret.isNew || ret.discovered) };
        if (t === 'Nothing') return { text: null, nothing: true };
      }
      const v = this.vm();
      if (v && v.items && v.items.length > before.len) {
        for (let i = before.len; i < v.items.length; i++) {
          const t = v.items[i] && v.items[i].text;
          if (t && !before.exact.has(t)) return { text: t, isNew: true };
        }
        for (let i = 0; i < v.items.length; i++) {
          const t = v.items[i] && v.items[i].text;
          if (t && !before.exact.has(t)) return { text: t, isNew: true };
        }
      }
      const after = this.instanceCounts();
      for (const t of Object.keys(after)) {
        let grew = after[t] - (before.inst[t] || 0);
        if (before.dragged && (t === before.a || t === before.b)) grew -= (before.a === before.b ? 2 : 1);
        if (grew > 0) return { text: t, isNew: !before.exact.has(t) };
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
      this.refresh();
      const v = this.vm();
      const before = {
        exact: this.exact,
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
      }, 3000);
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
    async _mineIds(ids, kind, onProgress) {
      let done = 0;
      for (const id of ids) {
        const tag = kind + ':' + id;
        if (this.mined.has(tag)) { done++; continue; }
        const data = kind === 'uses' ? await this.ib.uses(id, 2) : await this.ib.recipes(id, 1);
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
    async ensureMined(onProgress) {
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
    async mineChar(ch) {
      const lc = ch.toLowerCase(), uc = ch.toUpperCase();
      const ids = [];
      for (const lead of ['a', 'e', 'o', 'i', lc]) {
        ids.push(Text.wrap(lead + lc, 'dq'));
        if (uc !== lc) ids.push(Text.wrap(lead + uc, 'dq'));
      }
      ids.push(Text.wrap('a' + lc, 'cq'), Text.wrap('A' + lc, 'dq'));
      await this._mineIds(Array.from(new Set(ids)), 'recipes');
      return this.hasAppendersFor(ch);
    }
  }

  /* ============================================================
   * Word Forge: obtain(target) tries every strategy, escalating until it gets the word
   * ============================================================ */
  const SUFFIXES = new Set(['s', 'es', 'er', 'ers', 'ing', 'ed', 'ly', 'ness', 'man', 'men', 'land', 'ship', 'dom', 'ism',
    'ist', 'ful', 'less', 'able', 'ible', 'tion', 'sion', 'ment', 'ology', 'saurus', 'zilla', 'verse', 'bot', 'ville',
    'burger', 'fish', 'berry', 'wood', 'stone', 'fire', 'water', 'house', 'ball', 'light', 'star', 'storm', 'nado',
    'mon', 'chu', 'ite', 'ian', 'ic', 'y', 'ie', 'zord', 'tron', 'craft', 'cake', 'man', 'boy', 'girl', 'king', 'queen']);
  const PREFIXES = new Set(['un', 're', 'anti', 'super', 'mega', 'ultra', 'hyper', 'micro', 'mini', 'neo', 'pre', 'post',
    'over', 'under', 'sub', 'inter', 'trans', 'non', 'dis', 'mis', 'cyber', 'robo', 'auto', 'bio', 'eco', 'geo', 'tele',
    'poly', 'mono', 'bi', 'tri', 'fire', 'water', 'sun', 'moon', 'star', 'dark', 'light', 'iron', 'ice', 'sea', 'sky',
    'snow', 'rain', 'mud', 'sand', 'rock', 'lava']);

  class Forge {
    constructor(app) {
      this.app = app;
      this.game = app.game;
      this.ib = app.ib;
      this.mem = app.mem;
      this.tools = app.tools;
      this._poolCache = null;
    }
    _check(ctx) { return this.app.checkpoint(ctx.token); }
    _say(ctx, msg, progress) { this.app.forgeStatus(ctx, msg, progress); }
    _done(ctx) { return this.game.find(ctx.target, ctx.match); }

    // ---------- crafting primitive ----------
    async craftPair(a, b, ctx, why) {
      await this._check(ctx);
      const known = this.mem.result(a, b);
      if (known !== undefined) {
        if (known && this.game.has(known, true)) return known;
        if (known === '' && ctx.level.name !== 'relentless') return null;
      }
      const res = await this.app.craft(a, b, why);
      ctx.crafts++;
      if (res.result) {
        ctx.path.push([a, b, res.result]);
        this.tools.learnFromCraft(a, b, res.result);
      }
      return res.result;
    }

    // ---------- Strategy 1: Infinibrowser lineages with self-healing ----------
    async ensure(name, ctx, depth, trail) {
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
        if (this.mem.isBad(r, ia, ib)) {
          if (!(await this._viaRecipes(r, ctx, depth - 1, trail))) return false;
          continue;
        }
        this._say(ctx, 'Step ' + (i + 1) + '/' + steps.length + ': ' + ia + ' + ' + ib + ' → ' + r, (i + 1) / steps.length);
        const res = await this.craftPair(ia, ib, ctx, 'recipe');
        if (res === r || this.game.has(r, true)) continue;
        // Infinibrowser's step didn't reproduce in this game; find another route to r.
        this.mem.markBad(r, ia, ib);
        this.app.log('fix', ia + ' + ' + ib + ' gave ' + (res || 'nothing') + ', expected ' + r + '; rerouting');
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
        const res = await this.craftPair(ia, ib, ctx, 'alternate');
        const got = this.game.find(name, true);
        if (got) return got;
        if (res !== name) this.mem.markBad(name, ia, ib);
      }
      return null;
    }
    async viaInfinibrowser(ctx) {
      ctx.strategy = 'Infinibrowser recipe';
      const bank = this.mem.bankGet(ctx.target);
      if (bank && bank.text) {
        this._say(ctx, 'Replaying saved recipe (' + (bank.steps || '?') + ' steps)');
        await this.runSteps(parseLineageText(bank.text), ctx, ctx.level.depth, new Set());
        if (this._done(ctx)) return true;
      }
      for (const v of Text.variants(ctx.target, ctx.match)) {
        await this._check(ctx);
        const ex = await this.ib.exists(v);
        if (ex === false) continue;
        if (ex === undefined && !this.game.has(v, true)) {
          this._say(ctx, 'Infinibrowser unreachable; skipping recipe lookup');
          return false;
        }
        await this.ensure(v, ctx, ctx.level.depth, null);
        if (this._done(ctx)) return true;
      }
      return false;
    }

    // ---------- Strategy 2: compound words and phrases ----------
    _splits(target) {
      const t = target.trim();
      const out = [];
      const tokens = t.split(/\s+/);
      if (tokens.length >= 2) {
        for (let k = 1; k < tokens.length; k++) {
          out.push({ left: tokens.slice(0, k).join(' '), right: tokens.slice(k).join(' '), score: 20 - Math.abs(tokens.length / 2 - k) });
        }
      }
      const hy = t.indexOf('-');
      if (tokens.length === 1 && hy > 0 && hy < t.length - 1) {
        out.push({ left: t.slice(0, hy), right: t.slice(hy + 1), score: 18 });
        out.push({ left: t.slice(0, hy + 1), right: t.slice(hy + 1), score: 12 });
      }
      if (tokens.length === 1 && t.length >= 4) {
        for (let i = 2; i <= t.length - 2; i++) {
          const left = t.slice(0, i), right = t.slice(i);
          if (/[^\p{L}\p{N}]/u.test(left.slice(-1) + right[0])) continue;
          let s = 0;
          if (SUFFIXES.has(right.toLowerCase())) s += 6;
          if (PREFIXES.has(left.toLowerCase())) s += 6;
          s -= Math.abs(left.length - right.length) * 0.35;
          out.push({ left, right, score: s, solid: true });
        }
      }
      out.sort((a, b) => b.score - a.score);
      return out;
    }
    async _resolvePart(part, ctx, allowNested) {
      const owned = this.game.find(part, 'case');
      if (owned) return { name: owned, how: 'owned' };
      const vars = Text.parse(part).w === 'plain' ? [Text.title(part), part, part.toLowerCase()] : [part];
      for (const v of Array.from(new Set(vars))) {
        const ex = await this.ib.exists(v);
        if (ex) return { name: v, how: 'ib' };
      }
      if (allowNested && ctx.nest < C.forge.maxNest) return { name: part, how: 'nested' };
      return null;
    }
    async _obtainPart(p, ctx) {
      if (p.how === 'owned') return p.name;
      if (p.how === 'ib') return this.ensure(p.name, ctx, ctx.level.depth, null);
      const sub = await this.obtain(p.name, { match: 'case', token: ctx.token, nest: ctx.nest + 1, level: ctx.levelIndex, parent: ctx });
      return sub.ok ? sub.name : null;
    }
    async viaCompound(ctx) {
      ctx.strategy = 'Compound';
      const splits = this._splits(ctx.target).slice(0, ctx.level.splits);
      for (const sp of splits) {
        await this._check(ctx);
        this._say(ctx, 'Trying ' + sp.left + ' + ' + sp.right);
        const L = await this._resolvePart(sp.left, ctx, !sp.solid);
        if (!L) continue;
        const R = await this._resolvePart(sp.right, ctx, !sp.solid);
        if (!R) continue;
        const l = await this._obtainPart(L, ctx);
        if (!l) continue;
        const r = await this._obtainPart(R, ctx);
        if (!r) continue;
        // "Fire" + "Truck" may answer "Firetruck"; loose matching (the default) accepts that.
        await this.craftPair(l, r, ctx, 'compound');
        if (this._done(ctx)) return true;
      }
      return false;
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
      // Resume from anything already built in this save ("Zorbl" -> keep going).
      for (const name of this.game.names()) {
        const p = Text.parse(name);
        if (!p.core || p.core.length < 2) continue;
        if (p.w === 'plain' && p.core.length < goal.length) continue;
        if (ctx.exact ? goal.startsWith(p.core) : Text.startsCI(goal, p.core)) add(name, p.core.length, p.w, true);
      }
      for (const cf of this._caseForms(goal, ctx.exact)) {
        for (const w of ['dq', 'cq']) {
          await this._check(ctx);
          const k = await this._longestExisting((len) => Text.wrap(cf.slice(0, len), w), Math.min(cf.length, 64));
          if (k > 0) add(Text.wrap(cf.slice(0, k), w), k, w, false);
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
      // B) A curly-quoted chunk of what's left ("foo" + “bar” -> “foobar”).
      if (rest.length >= 2) {
        const chunk = rest;
        const k = await this._longestExisting((len) => Text.wrap(chunk.slice(0, len), 'cq'), Math.min(chunk.length, 32), 2);
        if (k >= 2) add(Text.wrap(chunk.slice(0, k), 'cq'), chunk.slice(0, k), 'app|' + chunk.slice(0, k) + '|' + cur.w + '>cq', 200 + k);
      }
      // C) Tools learned from Infinibrowser recipes and our own crafts.
      for (const c of this.tools.appenders(rest, cur.w, ctx.exact).slice(0, 10)) add(c.op, c.adds, c.sig, 20 + c.score);
      // D) Conventional one-letter appenders: 'x'  .x  “x”
      const ch = rest[0];
      const forms = ctx.exact ? [ch] : Array.from(new Set([ch, ch.toLowerCase(), ch.toUpperCase()]));
      for (const w of ['sq', 'dot', 'cq']) {
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
        await this.tools.mineChar(ch);
        for (const c of this.tools.appenders(rest, cur.w, ctx.exact).slice(0, 10)) add(c.op, c.adds, c.sig, 20 + c.score);
      }
      // Keep the capitalization the user typed whenever a case-exact route exists.
      for (const c of out) if (c.adds && rest.startsWith(c.adds)) c.score += c.score >= 1000 ? 0.5 : 15;
      out.sort((x, y) => y.score - x.score);
      return out.slice(0, ctx.level.cands);
    }
    _commonPrefixCI(a, b) {
      const x = a.toLowerCase(), y = b.toLowerCase();
      let i = 0;
      while (i < x.length && i < y.length && x[i] === y[i]) i++;
      return i;
    }
    async _repair(next, prevLen, goal, ctx) {
      const lcp = this._commonPrefixCI(next.core, goal);
      if (lcp <= prevLen || next.core.length - lcp !== 1) return null;
      const cands = this.tools.transforms(next.w, ['dellast']).slice(0, 3);
      for (const g of DEL_LAST_GUESSES) if (!cands.some((c) => c.op === g)) cands.push({ op: g, sig: 'dellast||' + next.w + '>' + next.w, guess: true });
      let tries = 0;
      for (const c of cands) {
        if (tries >= 3) break;
        if (c.guess && !(await this._existsOrOwned(c.op))) continue;
        tries++;
        const r = await this._tryTool(c.op, next.text, ctx);
        if (r.missing || !r.res) continue;
        const p = Text.parse(r.res);
        const ok = p.w !== 'plain' && Text.startsCI(goal, p.core) && p.core.length > prevLen;
        this.tools.record(c.op, c.sig, !!ok);
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
        const rest = goal.slice(cur.core.length);
        this._say(ctx, 'Building ' + cur.text + ' + "' + rest.slice(0, 16) + (rest.length > 16 ? '…' : '') + '"', cur.core.length / goal.length);
        const cands = await this._appendCandidates(cur, rest, goal, ctx);
        for (const c of cands) {
          if (ctx.crafts - startCrafts >= ctx.level.appendCrafts) return null;
          const r = await this._tryTool(c.op, cur.text, ctx);
          if (r.missing) continue;
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
          if (!next || visited.has(next.text)) continue;
          const out = await dfs(next, depth + 1);
          if (out) return out;
        }
        // Stuck with this wrapper (e.g. curly text that no space tool accepts): re-wrap the
        // same text another way ("…" -> plain -> "…") and keep building from there.
        if (ctx.crafts - startCrafts >= ctx.level.appendCrafts) return null;
        for (const alt of await this._rewrapMoves(cur, ctx)) {
          if (visited.has(alt.text)) continue;
          const out = await dfs(alt, depth + 1);
          if (out) return out;
        }
        return null;
      };
      return dfs(st, 0);
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
      return false;
    }
    async viaStringBuild(ctx) {
      ctx.strategy = 'String building';
      const goal = Text.parse(ctx.target).core;
      if (!goal) return false;
      this._say(ctx, 'Learning text tools from Infinibrowser...');
      await this.tools.ensureMined((d, n) => this._say(ctx, 'Learning text tools from Infinibrowser (' + d + '/' + n + ')', d / n));
      const seeds = await this._seeds(goal, ctx);
      if (!seeds.length) { this._say(ctx, 'No starting point for "' + goal + '" yet'); return false; }
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
      return !!this._done(ctx);
    }

    // ---------- Strategy 4: guided search ----------
    _excluded(name) { return this.app.isAutoBlocked(name); }
    _relevance(name, target, tl, words) {
      const nl = name.toLowerCase();
      let s = Text.dice(name, target) * 10;
      if (nl.length > 2 && tl.indexOf(nl) >= 0) s += 6;
      if (tl.length > 2 && nl.indexOf(tl) >= 0) s += 4;
      for (const w of words) if (nl.indexOf(w) >= 0) s += 3;
      const rel = this.app.relatedWords(target);
      for (const r of rel) if (nl === r || nl.indexOf(r) >= 0) s += 2.5;
      // Long run-on phrases are almost never stepping stones; keep them out of the pool.
      if (name.length > Math.max(24, target.length * 1.6)) s -= 12;
      const base = nl.replace(/^_+/, '');
      if (C.modifiers.indexOf(base) >= 0) s += 1.5;
      if (C.catalysts.indexOf(base) >= 0) s += 1;
      return s;
    }
    _pool(target) {
      const key = target + '\u0001' + this.game.version;
      if (this._poolCache && this._poolCache.key === key) return this._poolCache.pool;
      const tl = target.toLowerCase();
      const words = tl.split(/[\s_\-]+/).filter((w) => w.length >= 2);
      const scored = [];
      for (const n of this.game.names()) {
        if (this._excluded(n)) continue;
        scored.push([n, this._relevance(n, target, tl, words)]);
      }
      scored.sort((a, b) => b[1] - a[1]);
      const pool = scored.slice(0, 48).map((x) => x[0]);
      this._poolCache = { key, pool, all: scored.map((x) => x[0]) };
      return pool;
    }
    async viaGuided(ctx) {
      ctx.strategy = 'Guided search';
      // Past the last level, every extra round searches longer.
      const extra = Math.max(0, (ctx.round || 1) - C.forge.levels.length);
      const budget = ctx.level.guided * Math.min(10, 1 + extra);
      for (let i = 0; i < budget; i++) {
        await this._check(ctx);
        const pool = this._pool(ctx.target);
        const all = this._poolCache.all;
        if (pool.length < 1 || all.length < 2) return false;
        let pair = null;
        for (let tries = 0; tries < 80 && !pair; tries++) {
          const a = pool[Math.floor(Math.pow(Math.random(), 1.6) * pool.length)];
          const b = Math.random() < 0.65 ? pool[Math.floor(Math.random() * pool.length)] : all[Math.floor(Math.random() * all.length)];
          if (!a || !b) continue;
          if (this.mem.wasTried(a, b) || this.mem.result(a, b) !== undefined) continue;
          pair = [a, b];
        }
        if (!pair) return false;
        this._say(ctx, 'Exploring ' + pair[0] + ' + ' + pair[1] + ' (' + (i + 1) + '/' + budget + ')', (i + 1) / budget);
        const res = await this.craftPair(pair[0], pair[1], ctx, 'guided');
        if (res && Text.same(res, ctx.target, ctx.match)) return true;
        if (this._done(ctx)) return true;
      }
      return false;
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
        strategy: '',
        started: now()
      };
      const result = (ok) => ({ ok, name: ok ? this._done(ctx) : null, ctx });
      if (this._done(ctx)) return result(true);
      const nested = ctx.nest > 0;
      const startLevel = Math.max(0, Math.min(opts.level || 0, C.forge.levels.length - 1));
      const maxRounds = nested ? 1 : (S.relentless ? Infinity : C.forge.giveUpRounds);
      for (let round = 0; round < maxRounds; round++) {
        ctx.levelIndex = Math.min(startLevel + round, C.forge.levels.length - 1);
        ctx.level = C.forge.levels[ctx.levelIndex];
        ctx.round = round + 1;
        const craftsBefore = ctx.crafts;
        if (S.ib && (await this.viaInfinibrowser(ctx))) break;
        if (this._done(ctx)) break;
        if (S.compound && (await this.viaCompound(ctx))) break;
        if (this._done(ctx)) break;
        if (S.build && (await this.viaStringBuild(ctx))) break;
        if (this._done(ctx)) break;
        if (!nested && S.guided && (await this.viaGuided(ctx))) break;
        if (this._done(ctx)) break;
        if (!nested) this.app.log('round', 'Round ' + ctx.round + ' (' + ctx.level.name + ') did not make ' + ctx.target + ' yet; escalating');
        // Nothing new was tried this round (everything cached): wait instead of spinning, then
        // try again; new items, Infinibrowser data or cache expiry can open a path.
        if (ctx.crafts === craftsBefore) {
          this._say(ctx, 'No new leads; retrying shortly (round ' + ctx.round + ')');
          await sleep(4000);
          await this._check(ctx);
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
  function chime(freqs, gap, vol) {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
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
      setTimeout(() => { try { ac.close(); } catch (e) {} }, 1500);
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
  function injectCSS() {
    const id = 'ic-auto-css';
    const old = document.getElementById(id);
    if (old) old.remove();
    const s = document.createElement('style');
    s.id = id;
    s.textContent = [
      ':root{--ic-bg:#1a1a2e;--ic-bg2:#16213e;--ic-bg3:#0f3460;--ic-surface:#1e2746;--ic-surface2:#253256;--ic-border:#2a3a5c;--ic-text:#e0e0e0;--ic-text2:#8892b0;--ic-accent:#64ffda;--ic-accent2:#7c4dff;--ic-red:#ff5252;--ic-orange:#ffab40;--ic-green:#69f0ae;--ic-blue:#448aff;--ic-yellow:#ffd740;--ic-radius:10px;--ic-font:"Inter","SF Pro Display",-apple-system,system-ui,sans-serif;}',
      '#ic-panel{position:fixed;top:10px;left:10px;z-index:10010;width:284px;max-height:calc(100vh - 20px);background:var(--ic-bg);border:1px solid var(--ic-border);border-radius:var(--ic-radius);font-family:var(--ic-font);font-size:12px;color:var(--ic-text);box-shadow:0 8px 32px rgba(0,0,0,.4);display:flex;flex-direction:column;overflow:hidden;}',
      '#ic-panel.collapsed{width:auto;}',
      '#ic-panel.collapsed .ic-body{display:none;}',
      '#ic-panel.collapsed .ic-title{display:none;}',
      '.ic-header{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:9px 10px;background:linear-gradient(135deg,var(--ic-bg2),var(--ic-bg3));border-bottom:1px solid var(--ic-border);cursor:move;user-select:none;}',
      '.ic-title{font-weight:700;font-size:13px;letter-spacing:.4px;background:linear-gradient(90deg,var(--ic-accent),var(--ic-accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;}',
      '.ic-badge{min-width:20px;height:20px;border-radius:10px;background:var(--ic-accent2);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 5px;}',
      '.ic-badge.pulse{animation:ic-pulse .6s ease;}',
      '@keyframes ic-pulse{0%{transform:scale(1)}50%{transform:scale(1.35)}100%{transform:scale(1)}}',
      '.ic-minimize{background:none;border:none;color:var(--ic-text2);cursor:pointer;font-size:18px;padding:2px 8px;border-radius:4px;line-height:1;}',
      '.ic-minimize:hover{color:var(--ic-accent);background:var(--ic-surface2);}',
      '.ic-body{display:flex;flex-direction:column;gap:7px;padding:10px;overflow-y:auto;}',
      '.ic-body::-webkit-scrollbar{width:4px;}.ic-body::-webkit-scrollbar-thumb{background:var(--ic-border);border-radius:2px;}',
      '.ic-section{display:flex;flex-direction:column;gap:5px;}',
      '.ic-section-title{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--ic-text2);font-weight:600;}',
      '.ic-input,.ic-select,.ic-textarea{width:100%;padding:7px 9px;background:var(--ic-surface);border:1px solid var(--ic-border);border-radius:6px;color:var(--ic-text);font-size:12px;font-family:var(--ic-font);box-sizing:border-box;outline:none;}',
      '.ic-input:focus,.ic-select:focus,.ic-textarea:focus{border-color:var(--ic-accent);}',
      '.ic-select{cursor:pointer;}',
      '.ic-select option{background:var(--ic-bg);color:var(--ic-text);}',
      '.ic-textarea{resize:vertical;min-height:38px;font-size:11.5px;line-height:1.35;}',
      '.ic-btn{width:100%;padding:7px 6px;border:none;border-radius:6px;font-size:12px;font-weight:600;font-family:var(--ic-font);cursor:pointer;text-align:center;}',
      '.ic-btn:active{transform:scale(.97);}',
      '.ic-btn:disabled{opacity:.45;cursor:default;}',
      '.ic-btn-start{background:linear-gradient(135deg,#00c853,#69f0ae);color:#1a1a2e;}',
      '.ic-btn-stop{background:linear-gradient(135deg,#ff1744,#ff5252);color:#fff;}',
      '.ic-btn-pause{background:linear-gradient(135deg,#2979ff,#448aff);color:#fff;}',
      '.ic-btn-warn{background:linear-gradient(135deg,#ff6d00,#ffab40);color:#1a1a2e;}',
      '.ic-btn-ghost{background:var(--ic-surface);color:var(--ic-text2);border:1px solid var(--ic-border);}',
      '.ic-btn-ghost:hover{border-color:var(--ic-accent);color:var(--ic-accent);}',
      '.ic-btn-row{display:flex;gap:4px;}.ic-btn-row .ic-btn{flex:1;}',
      '.ic-check{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--ic-text2);cursor:pointer;}',
      '.ic-check input{accent-color:var(--ic-accent);margin:0;}',
      '.ic-stats{display:grid;grid-template-columns:1fr 1fr;gap:4px;text-align:center;}',
      '.ic-stat{background:var(--ic-surface);border-radius:6px;padding:5px 4px;border:1px solid transparent;}',
      '.ic-stat-val{font-size:15px;font-weight:700;color:var(--ic-accent);}',
      '.ic-stat-label{font-size:9px;color:var(--ic-text2);text-transform:uppercase;letter-spacing:.5px;}',
      '.ic-stat.green{border-color:var(--ic-green);}.ic-stat.green .ic-stat-val,.ic-stat.green .ic-stat-label{color:var(--ic-green);}',
      '.ic-stat.orange{border-color:var(--ic-orange);}.ic-stat.orange .ic-stat-val,.ic-stat.orange .ic-stat-label{color:var(--ic-orange);}',
      '.ic-status{padding:7px;border-radius:6px;background:var(--ic-surface);text-align:center;font-size:11px;line-height:1.35;word-break:break-word;color:var(--ic-text2);border:1px solid var(--ic-border);}',
      '.ic-status.s-run{color:var(--ic-blue);border-color:var(--ic-blue);}',
      '.ic-status.s-stop{color:var(--ic-red);border-color:var(--ic-red);}',
      '.ic-status.s-ok{color:var(--ic-green);border-color:var(--ic-green);}',
      '.ic-status.s-err{color:var(--ic-red);border-color:var(--ic-red);font-weight:700;}',
      '.ic-status.s-warn{color:var(--ic-orange);border-color:var(--ic-orange);}',
      '.ic-now{background:var(--ic-surface);border:1px solid var(--ic-border);border-radius:6px;padding:7px 8px;display:none;flex-direction:column;gap:4px;}',
      '.ic-now.show{display:flex;}',
      '.ic-now-target{font-weight:700;color:var(--ic-text);font-size:12.5px;word-break:break-word;}',
      '.ic-now-meta{display:flex;justify-content:space-between;gap:6px;font-size:10px;color:var(--ic-text2);}',
      '.ic-now-strategy{color:var(--ic-accent);font-weight:600;}',
      '.ic-now-msg{font-size:11px;color:var(--ic-text2);word-break:break-word;min-height:14px;}',
      '.ic-bar{height:4px;background:var(--ic-bg2);border-radius:2px;overflow:hidden;}',
      '.ic-bar>div{height:100%;width:0;background:linear-gradient(90deg,var(--ic-accent),var(--ic-accent2));transition:width .25s;}',
      '.ic-link{font-size:11px;color:var(--ic-accent);text-decoration:none;}',
      '.ic-link:hover{text-decoration:underline;}',
      '.ic-details{border:1px solid var(--ic-border);border-radius:6px;background:rgba(255,255,255,.015);}',
      '.ic-details>summary{cursor:pointer;padding:6px 8px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--ic-text2);font-weight:600;list-style:none;}',
      '.ic-details>summary::-webkit-details-marker{display:none;}',
      '.ic-details>summary:before{content:"\\25b8";display:inline-block;margin-right:6px;transition:transform .2s;}',
      '.ic-details[open]>summary:before{transform:rotate(90deg);}',
      '.ic-details>.ic-dbody{display:flex;flex-direction:column;gap:5px;padding:2px 8px 8px;}',
      '.ic-small{font-size:10px;color:var(--ic-text2);line-height:1.35;}',
      '#ic-log{position:fixed;bottom:10px;right:10px;z-index:10014;width:360px;max-height:320px;background:var(--ic-bg);border:1px solid var(--ic-border);border-radius:var(--ic-radius);font-family:var(--ic-font);display:none;flex-direction:column;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.4);}',
      '#ic-log.show{display:flex;}',
      '#ic-log .log-header{padding:7px 10px;background:var(--ic-bg2);border-bottom:1px solid var(--ic-border);font-size:11px;font-weight:700;color:var(--ic-accent);display:flex;justify-content:space-between;align-items:center;gap:8px;}',
      '#ic-log .log-header label{font-weight:400;color:var(--ic-text2);display:flex;align-items:center;gap:4px;}',
      '#ic-log .log-header button{background:none;border:none;color:var(--ic-text2);cursor:pointer;font-size:14px;}',
      '#ic-log .log-body{flex:1;overflow-y:auto;padding:6px;font-size:11px;}',
      '#ic-log .log-entry{padding:3px 6px;border-radius:4px;margin-bottom:1px;display:flex;justify-content:space-between;gap:8px;color:var(--ic-text2);}',
      '#ic-log .log-entry:hover{background:var(--ic-surface);}',
      '#ic-log .log-entry .log-time{font-size:10px;opacity:.6;white-space:nowrap;}',
      '#ic-log .t-new{color:var(--ic-green);}#ic-log .t-first{color:var(--ic-orange);font-weight:700;}',
      '#ic-log .t-win{color:var(--ic-accent);font-weight:700;}#ic-log .t-fix{color:var(--ic-yellow);}',
      '#ic-log .t-fail{color:var(--ic-red);}#ic-log .t-round{color:var(--ic-blue);}',
      '#ic-log.hide-crafts .t-craft{display:none;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ============================================================
   * App: UI + run control
   * ============================================================ */
  const DEFAULT_OPTIONS = {
    autoSweep: true, dragEnabled: false, depthFirst: true, soundEnabled: true, keepGoing: false, collapsed: false,
    exactSpelling: false, sIB: true, sCompound: true, sBuild: true, sGuided: true, relentless: true, logCrafts: false
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
      this.saveSnapshot = null;
      this.saveSwitchAt = 0;
      this.lastRecipe = null;
      this.skipRequested = false;
      this.currentTarget = null;
      this._statsTimer = null;
      this._nowTimer = null;
      this._nowState = null;
      this._observer = null;
      this._relatedCache = new Map();
    }

    async init() {
      injectCSS();
      this.buildPanel();
      this.buildLog();
      this.loadSettings();
      this.status('Loading learned data...', 's-run');
      await Promise.all([this.mem.load(), this.ib.load(), this.tools.load()]);
      this.game.refresh(true);
      this.saveSnapshot = this._snapshot(this.game.names());
      this.observe();
      this.refreshSaveInfo();
      this.renderStats();
      this.renderInfo();
      this.status(this.game.hasApi() ? 'Ready. Type any word and press Start.' : 'Ready (game API not found yet; it may still be loading).', 's-ok');
      window.addEventListener('beforeunload', () => { this.mem.flush(); this.ib.save(); });
      setInterval(() => this.renderInfo(), 3000);
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
      if (!window.__icForgeConfig || window.__icForgeConfig.gap == null) { C.gap = p.gap; C.settle = p.settle; }
      C.step = p.step;
      C.between = p.between;
      const el = this.$('#ic-speed');
      if (el) el.value = v;
      if (!silent) this.status('Speed: ' + v, 's-ok');
    }
    saveExclude() {
      const lines = this.$('#ic-exclude').value.split('\n').map((s) => s.trim()).filter(Boolean);
      this.excludeSet = new Set(lines.map((s) => Text.soft(s)));
      Store.set(KEYS.exclude, lines);
    }
    saveDrafts() { Store.set(KEYS.drafts, { target: this.$('#ic-target').value || '' }); }
    strategies() {
      return { ib: this.opt.sIB, compound: this.opt.sCompound, build: this.opt.sBuild, guided: this.opt.sGuided, relentless: this.opt.relentless };
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
      this.token++;
      this.running = true;
      this.paused = false;
      this.mode = mode;
      this.skipRequested = false;
      this.syncButtons();
      return this.token;
    }
    _end(token, msg, cls) {
      if (token !== this.token) return;
      this.running = false;
      this.paused = false;
      this.mode = null;
      this.syncButtons();
      this.mem.flush();
      this.ib.save();
      this.hideNow();
      if (msg) this.status(msg, cls);
      this.renderStats();
    }
    async checkpoint(token) {
      if (token !== this.token || !this.running) throw new Cancelled();
      while (this.paused) {
        await sleep(200);
        if (token !== this.token || !this.running) throw new Cancelled();
      }
    }
    syncButtons() {
      this.$('#ic-start').disabled = this.running;
      this.$('#ic-pause').disabled = !this.running;
      this.$('#ic-pause').textContent = this.paused ? 'Resume' : 'Pause';
    }
    start() {
      if (this.running) { this.status('Already running', 's-warn'); return; }
      this.game.refresh(true);
      if (!this.game.hasApi() && !this.opt.dragEnabled) {
        this.status('Game API not found. Wait for the game to load, or enable the dragging animation.', 's-err');
        return;
      }
      if (this.getTargets().length) this.runTargets();
      else this.runExplore();
    }
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
      const res = await this.game.craft(a, b, { drag: this.dragEnabled() });
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
      let made = 0;
      try {
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
          if (r.ok) {
            made++;
            this.celebrate(t, r);
            this.removeTarget(t);
            await this.maybeSweep();
          } else {
            failed.push(t);
            this.log('fail', 'Could not make ' + t + ' yet (turn on "Never give up" to keep escalating)');
          }
        }
        if (this.opt.keepGoing && failed.length === 0) {
          this.status('Targets done. Exploring...', 's-run');
          await this.exploreLoop(token);
        }
        const msg = made ? 'Done! Made ' + made + ' word' + (made > 1 ? 's' : '') + (failed.length ? '. Could not make: ' + failed.join(', ') : '.') :
          (failed.length ? 'Could not make: ' + failed.join(', ') : 'Nothing left to make.');
        this._end(token, msg, failed.length ? 's-warn' : 's-ok');
      } catch (e) {
        if (e && e.cancelled) return;
        console.error('[WordForge]', e);
        this._end(token, 'Error: ' + (e && e.message), 's-err');
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
          strategies: { ib: true, compound: false, build: false, guided: false, relentless: false }
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
        const names = this.game.names().filter((n) => !this.isAutoBlocked(n));
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
    _snapshot(names) {
      return { count: names.length, set: new Set(names) };
    }
    refreshSaveInfo() {
      const el = this.$('#ic-save-info');
      if (!el) return;
      const names = this.game.names().sort();
      let h = 0;
      for (const n of names) for (let j = 0; j < n.length; j++) h = (h * 31 + n.charCodeAt(j)) % 2147483647;
      el.textContent = 'Save: ' + names.length + ' items | ' + ('000000' + h.toString(36)).slice(-6);
    }
    checkSaveSwitch() {
      const names = this.game.names();
      const prev = this.saveSnapshot;
      const next = this._snapshot(names);
      this.saveSnapshot = next;
      if (!prev || !names.length) return;
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
          if (this.game.refresh()) {
            this.checkSaveSwitch();
            this.refreshSaveInfo();
            this.renderStatsSoon();
          }
        }, C.observeDebounce);
      });
      this._observer.observe(node, { childList: true, subtree: true });
    }
    rescanSave() {
      this.game._vm = null;
      this.game.refresh(true);
      this.saveSnapshot = this._snapshot(this.game.names());
      this.saveSwitchAt = now();
      this.refreshSaveInfo();
      this.renderStats();
      this.status(this.game.hasApi() ? 'Re-scanned save (' + this.game.count() + ' items).' : 'Re-scanned, but the game API was not found.', this.game.hasApi() ? 's-ok' : 's-warn');
    }

    /* ---------- export / import ---------- */
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
      if (d.pairResults && typeof d.pairResults === 'object') for (const k of Object.keys(d.pairResults)) this.mem.pairs.set(k, d.pairResults[k]);
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

    /* ---------- semantic helpers for guided search ---------- */
    relatedWords(target) {
      const t = String(target).toLowerCase().trim();
      if (this._relatedCache.has(t)) return this._relatedCache.get(t);
      const out = [];
      const add = (w) => { if (out.indexOf(w) < 0) out.push(w); };
      (C.semanticMap[t] || []).forEach(add);
      for (const k of Object.keys(C.semanticMap)) if (C.semanticMap[k].indexOf(t) >= 0) add(k);
      for (const p of t.split(/[\s_\-]+/)) if (p.length >= 2) (C.semanticMap[p] || []).forEach(add);
      this._relatedCache.set(t, out);
      return out;
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
      this._nowState = { target, strategy: '', msg: 'Starting...', progress: 0, round: 1, level: '', crafts: 0, started: now() };
      this.$('#ic-now').classList.add('show');
      this._renderNow();
    }
    hideNow() { this.$('#ic-now').classList.remove('show'); this._nowState = null; }
    forgeStatus(ctx, msg, progress) {
      if (!this._nowState) this.showNow(ctx.target);
      const s = this._nowState;
      if (ctx.nest === 0) s.target = ctx.target;
      s.strategy = (ctx.nest ? 'Part "' + ctx.target + '" · ' : '') + (ctx.strategy || '');
      s.msg = msg;
      s.progress = typeof progress === 'number' ? progress : s.progress;
      s.round = ctx.round || 1;
      s.level = (ctx.level && ctx.level.name) || '';
      s.crafts = ctx.crafts;
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
    renderStats() {
      this.$('#ic-s-new').textContent = this.stats.newWords;
      this.$('#ic-s-disc').textContent = this.stats.firstDisc;
      this.$('#ic-s-crafts').textContent = this.stats.crafts;
      this.$('#ic-s-forged').textContent = this.stats.forged;
      const badge = this.$('#ic-badge');
      badge.textContent = this.stats.newWords;
      badge.style.background = this.stats.newWords ? 'var(--ic-green)' : 'var(--ic-accent2)';
      badge.style.color = this.stats.newWords ? '#1a1a2e' : '#fff';
    }
    renderInfo() {
      const el = this.$('#ic-info');
      if (!el) return;
      el.textContent = 'Known pair results: ' + this.mem.pairs.size + ' · Text tools learned: ' + this.tools.size +
        ' · Infinibrowser: ' + (this.ib.offline ? 'unreachable' : this.ib.requests + ' requests' + (this.ib.rateLimited ? ', ' + this.ib.rateLimited + ' rate-limited' : '')) +
        ' · Storage: ' + (this.mem.idb ? 'IndexedDB' : 'memory only');
    }
    log(type, msg) {
      const row = { type, msg, time: clock(), ts: now() };
      this.logRows.push(row);
      if (this.logRows.length > 400) this.logRows.splice(0, this.logRows.length - 400);
      if (!this.logBody) return;
      const entry = document.createElement('div');
      entry.className = 'log-entry t-' + type;
      const left = document.createElement('span');
      left.textContent = msg;
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
        '<span class="ic-title">⚒ Word Forge Pro</span>',
        '<div style="display:flex;align-items:center;gap:6px;">',
        '<div class="ic-badge" id="ic-badge" title="New items this session">0</div>',
        '<button class="ic-minimize" id="ic-collapse" title="Collapse">−</button>',
        '</div></div>',
        '<div class="ic-body">',
        '<div class="ic-section">',
        '<div class="ic-section-title">Words to make (comma or newline separated)</div>',
        '<textarea class="ic-textarea" id="ic-target" rows="2" placeholder="Anything: Dragon, Fire Truck, Zorblaxian, Hello World"></textarea>',
        '<a class="ic-link" id="ic-lookup" href="#" target="_blank" rel="noopener" style="display:none;"></a>',
        '</div>',
        '<div class="ic-btn-row">',
        '<button class="ic-btn ic-btn-start" id="ic-start">Start</button>',
        '<button class="ic-btn ic-btn-pause" id="ic-pause" disabled>Pause</button>',
        '<button class="ic-btn ic-btn-stop" id="ic-stop">Stop</button>',
        '</div>',
        '<div class="ic-now" id="ic-now">',
        '<div class="ic-now-target" id="ic-now-target"></div>',
        '<div class="ic-now-meta"><span class="ic-now-strategy" id="ic-now-strategy"></span><span id="ic-now-round"></span></div>',
        '<div class="ic-bar"><div id="ic-now-bar"></div></div>',
        '<div class="ic-now-msg" id="ic-now-msg"></div>',
        '</div>',
        '<div class="ic-stats">',
        '<div class="ic-stat green"><div class="ic-stat-val" id="ic-s-new">0</div><div class="ic-stat-label">New Words</div></div>',
        '<div class="ic-stat orange"><div class="ic-stat-val" id="ic-s-disc">0</div><div class="ic-stat-label">First Discoveries</div></div>',
        '<div class="ic-stat"><div class="ic-stat-val" id="ic-s-crafts">0</div><div class="ic-stat-label">Crafts</div></div>',
        '<div class="ic-stat"><div class="ic-stat-val" id="ic-s-forged">0</div><div class="ic-stat-label">Targets Made</div></div>',
        '</div>',
        '<div class="ic-btn-row">',
        '<button class="ic-btn ic-btn-ghost" id="ic-skip" title="Skip the current target and move on">Skip</button>',
        '<button class="ic-btn ic-btn-ghost" id="ic-exact" title="Only use a saved or Infinibrowser recipe for the first target">Exact Recipe</button>',
        '<button class="ic-btn ic-btn-ghost" id="ic-logbtn">Log</button>',
        '</div>',
        '<details class="ic-details" data-sec="strategies" open><summary>Strategies</summary><div class="ic-dbody">',
        chk('sIB', 'Infinibrowser recipes (self-healing)', 'Use the shortest known recipe; if a step fails, reroute through alternate recipes'),
        chk('sCompound', 'Compound words &amp; phrases', 'Fire Truck = Fire + Truck; splits words and phrases into parts it can make'),
        chk('sBuild', 'String building (any spelling)', 'Builds the exact text letter by letter with quoted letters, then unquotes it'),
        chk('sGuided', 'Guided search', 'Smart trial-and-error toward the word when nothing else is known'),
        chk('relentless', 'Never give up (escalate until made)', 'Keeps escalating depth and search budget until the word exists'),
        chk('exactSpelling', 'Exact capitalization too', 'Off: capitalization may differ ("fire truck" accepts "Fire Truck"); spelling, spaces and punctuation always have to match'),
        '<div class="ic-btn-row" style="align-items:center;"><span class="ic-small" style="flex:0 0 auto;">Speed</span>',
        '<select class="ic-select" id="ic-speed"><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option><option value="turbo">Turbo</option></select></div>',
        '</div></details>',
        '<details class="ic-details" data-sec="pokedex"><summary>National Pokedex</summary><div class="ic-dbody">',
        '<div class="ic-btn-row"><input class="ic-input" id="ic-poke-start" placeholder="Start #" style="flex:1;" title="National Dex number to start from" />',
        '<button class="ic-btn ic-btn-ghost" id="ic-poke-load" style="flex:1.1;">Load Dex</button></div>',
        '<div class="ic-btn-row"><button class="ic-btn ic-btn-ghost" id="ic-poke-run" style="flex:1.4;">Run</button>',
        '<button class="ic-btn ic-btn-ghost" id="ic-poke-stop" style="flex:1;color:var(--ic-red);border-color:var(--ic-red);">Stop Dex</button>',
        '<button class="ic-btn ic-btn-ghost" id="ic-poke-reset" style="flex:1;">Reset</button></div>',
        '<div class="ic-status" id="ic-poke-status" style="padding:5px;font-size:10px;">National Dex idle</div>',
        '</div></details>',
        '<details class="ic-details" data-sec="settings"><summary>Settings &amp; Data</summary><div class="ic-dbody">',
        '<div class="ic-section-title">Never use these items</div>',
        '<textarea class="ic-textarea" id="ic-exclude" rows="2" placeholder="One per line"></textarea>',
        chk('autoSweep', 'Auto sweep board when laggy'),
        chk('dragEnabled', 'Show dragging animation (slower)'),
        chk('depthFirst', 'Explore new items first'),
        chk('soundEnabled', 'Sound on discovery'),
        chk('keepGoing', 'Keep exploring after targets are made'),
        '<div class="ic-section-title" style="margin-top:4px;">Run a recipe</div>',
        '<textarea class="ic-textarea" id="ic-recipe-text" rows="2" placeholder="Water + Fire = Steam&#10;Steam + Earth = Mud"></textarea>',
        '<div class="ic-btn-row"><button class="ic-btn ic-btn-ghost" id="ic-recipe-run">Run Recipe</button>',
        '<button class="ic-btn ic-btn-ghost" id="ic-copy-recipe" disabled title="Copy the recipe used for the last word made">Copy Last Recipe</button></div>',
        '<div class="ic-btn-row"><button class="ic-btn ic-btn-ghost" id="ic-export">Export</button>',
        '<button class="ic-btn ic-btn-ghost" id="ic-import">Import</button></div>',
        '<div class="ic-btn-row"><button class="ic-btn ic-btn-ghost" id="ic-relearn" title="Re-survey Infinibrowser for text tools">Re-learn Tools</button>',
        '<button class="ic-btn ic-btn-warn" id="ic-clear">Clear Learned</button></div>',
        '<div class="ic-status" id="ic-save-info" style="padding:5px;font-size:10px;">Save: unknown</div>',
        '<button class="ic-btn ic-btn-ghost" id="ic-rebind-save">Re-scan Save</button>',
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
      $('#ic-logbtn').onclick = () => this.logPanel.classList.toggle('show');
      $('#ic-collapse').onclick = () => { this.opt.collapsed = !this.opt.collapsed; this.saveOptions(); this.applyOptionsToUI(); };
      $('#ic-speed').onchange = (e) => this.setSpeed(e.target.value);
      $('#ic-target').addEventListener('input', () => { this.saveDrafts(); this.updateLookup(); });
      $('#ic-target').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); this.start(); } });
      $('#ic-exclude').addEventListener('change', () => this.saveExclude());
      $('#ic-recipe-run').onclick = () => this.runPastedRecipe();
      $('#ic-copy-recipe').onclick = () => this.copyRecipe();
      $('#ic-export').onclick = () => this.exportData();
      $('#ic-import').onclick = () => $('#ic-import-file').click();
      $('#ic-import-file').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; if (f) this.importFile(f); e.target.value = ''; });
      $('#ic-relearn').onclick = () => this.relearnTools();
      $('#ic-clear').onclick = () => this.clearLearned();
      $('#ic-rebind-save').onclick = () => this.rescanSave();
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
  const app = new App();
  window._icAutoInstance = app;
  app.init().catch((e) => console.error('[WordForge] init failed', e));
})();
