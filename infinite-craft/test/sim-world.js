// Deterministic stand-in for Infinite Craft + Infinibrowser, used by run-sim.js.
//
// The real game asks an AI model what A + B makes and caches the answer forever, so every
// pair has one fixed result. This world mimics that: a fixed recipe table for ordinary
// words and tools, rule-based "text tool" behaviour for quoted strings (with a per-pair
// noise rate, like the model sometimes misbehaving), and a fallback that maps any other
// pair to a fixed word or to "nothing".
//
// The fake Infinibrowser only knows what a "community" has crafted: the word tree, the
// tools, short quoted strings, a few mining probes, and some deliberately stale recipes
// whose first step the game no longer agrees with.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SimWorld = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BASE = ['Water', 'Fire', 'Wind', 'Earth'];
  const VOCAB = ('Steam Mud Dust Lava Stone Plant Smoke Rain Cloud Ash Sand Glass Metal Rust Tree Wood Forest Swamp Life ' +
    'Human Animal Fish Bird Egg Dragon Lizard Volcano Mountain Island Ocean Sea Lake River Ice Snow Storm Lightning Energy ' +
    'Sun Moon Star Planet Space Rocket Engine Car Truck Boat Ship Train Wheel Road City House Castle King Queen Sword ' +
    'Shield Knight Wizard Magic Potion Witch Ghost Zombie Vampire Bat Night Day Time Clock Robot Computer Internet Phone ' +
    'Music Song Dance Party Cake Bread Cheese Pizza Coffee Tea Sugar Salt Pepper Fruit Apple Banana Orange Grape Wine ' +
    'Beer Flower Rose Garden Bee Honey Butterfly Spider Web Cat Dog Wolf Fox Bear Lion Tiger Horse Unicorn Rainbow ' +
    'Cow Milk Pig Sheep Wool Cotton Paper Book Story Word Letter Alphabet Quote Hashtag Dot Line Number Math ' +
    'Science Atom Light Shadow Darkness Fear Love Heart Brain Mind Dream Sleep Bed Pillow Cloud Kite Plane ' +
    'Pilot Doctor Hospital Medicine Virus Bacteria Cell Blood Bone Skeleton Dinosaur Fossil Oil Gas Plastic Toy Game')
    .split(' ').filter((w, i, a) => w && a.indexOf(w) === i);
  const EXTRA = ('Mist Fog Pond Puddle Boulder Pebble Crystal Gem Diamond Gold Silver Coin Bank Money Treasure Pirate ' +
    'Parrot Jungle Desert Cactus Camel Oasis Mirage Ninja Samurai Katana Shuriken Tornado Hurricane Tsunami Flood ' +
    'Ark Noah Bible Angel Demon Hell Heaven Halo Wing Feather Pillow Nest Owl Wisdom Philosophy Socrates Statue ' +
    'Museum Art Painting Picasso Mona Lisa Banana Split Sundae Cherry Pie Tart Jam Toast Butter Bagel Donut Police ' +
    'Jail Thief Mask Hero Villain Cape Superman Batman Joker Clown Circus Juggler Acrobat Tightrope Balance Yoga').split(' ');
  const ALL = VOCAB.concat(EXTRA.filter((w) => VOCAB.indexOf(w) < 0));

  function fnv(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    // murmur3 finalizer so nearby strings ("x0", "x1") get unrelated values
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return h >>> 0;
  }
  const rnd = (s) => fnv(s) / 4294967296;
  const key = (a, b) => (a <= b ? a + '||' + b : b + '||' + a);
  function parse(s) {
    const t = String(s);
    if (t.length >= 2 && t[0] === '"' && t[t.length - 1] === '"') return { w: 'dq', core: t.slice(1, -1) };
    if (t.length >= 2 && t[0] === '“' && t[t.length - 1] === '”') return { w: 'cq', core: t.slice(1, -1) };
    if (t.length >= 2 && t[0] === '\'' && t[t.length - 1] === '\'') return { w: 'sq', core: t.slice(1, -1) };
    if (t.length >= 2 && t[0] === '#') return { w: 'hash', core: t.slice(1) };
    if (t.length >= 2 && t[0] === '.' && t[1] !== '.') return { w: 'dot', core: t.slice(1) };
    return { w: 'plain', core: t };
  }
  function wrap(core, w) {
    if (w === 'dq') return '"' + core + '"';
    if (w === 'cq') return '“' + core + '”';
    if (w === 'sq') return '\'' + core + '\'';
    if (w === 'hash') return '#' + core;
    if (w === 'dot') return '.' + core;
    return core;
  }
  const capFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function create(cfg) {
    cfg = Object.assign({
      seed: 'w1',
      noise: 0.12,          // chance a text-tool craft misbehaves
      phraseRate: 0.35,     // chance plain word + plain word gives "Word Word"
      nothingRate: 0.2,     // chance an unrelated pair gives nothing
      staleCount: 8,        // Infinibrowser recipes the game no longer agrees with
      hiddenRate: 0.1,      // share of words the community never recorded
      rateLimitEvery: 30,   // every Nth Infinibrowser request answers 429
      spaceTool: true,      // false: no tool appends a space, so phrases must be combined
      extraWords: [],       // extra words in the community word tree, e.g. ['Mr.', 'Jeremy']
      jam: [],              // [['erem', 'e']]: one-letter tools adding 'e' to text ending in "erem" misfire
      names: {}
    }, cfg || {});
    const N = Object.assign({
      unquote: 'Quote Remover 9000',   // deliberately not one of the script's guesses: must be mined
      toHash: 'Prepend Hashtag',
      unhash: 'Unhashtag Pro',          // also must be mined
      quote: 'Quotify',
      backspace: 'Backspace',
      upper: 'Uppercase',
      bang: 'Add Exclamation'
    }, cfg.names);
    const S = String(cfg.seed);
    const table = new Map();
    const words = BASE.slice();
    const tools = new Set();

    // 1) Ordinary word tree grown from the four base elements.
    const vocab = VOCAB.concat((cfg.extraWords || []).filter((w) => VOCAB.indexOf(w) < 0));
    for (let i = 0; i < vocab.length; i++) {
      let a, b, tries = 0;
      do {
        a = words[Math.floor(rnd(S + 'a' + i + ':' + tries) * words.length)];
        b = words[Math.floor(rnd(S + 'b' + i + ':' + tries) * words.length)];
        tries++;
      } while (table.has(key(a, b)) && tries < 80);
      table.set(key(a, b), vocab[i]);
      words.push(vocab[i]);
    }

    // 2) Text tools, each made from a fixed pair of ordinary words.
    const toolList = [];
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    // Letter families the string-building community uses: 'a' (append), .a (append),
    // “a” (curly, appends and turns the result curly), "a" (quoted seed).
    for (const c of lower) {
      toolList.push('\'' + c + '\'', '\'' + c.toUpperCase() + '\'', '"' + c + '"', '"' + c.toUpperCase() + '"');
      if (cfg.dotLetters !== false) toolList.push('.' + c, '.' + c.toUpperCase());
      if (cfg.curlyLetters !== false) toolList.push('“' + c + '”');
    }
    for (const d of '0123456789') toolList.push('.' + d);
    if (cfg.spaceTool !== false) toolList.push('“ ”');
    toolList.push('\'-\'', '\'_\'', '.\'');
    for (const chunk of ['er', 'ing', 'ian', 'ness', 'land', 'ly', 'tion', 'saurus', 'xian']) toolList.push('“' + chunk + '”');
    for (const k of Object.keys(N)) toolList.push(N[k]);
    let ti = 0;
    for (const t of toolList) {
      let a, b, tries = 0;
      do {
        a = words[4 + Math.floor(rnd(S + 'ta' + ti + ':' + tries) * (words.length - 4))];
        b = words[4 + Math.floor(rnd(S + 'tb' + ti + ':' + tries) * (words.length - 4))];
        tries++;
      } while (table.has(key(a, b)) && tries < 200);
      table.set(key(a, b), t);
      tools.add(t);
      ti++;
    }

    function toolApply(s, t) {
      const ps = parse(s), pt = parse(t);
      const quoted = ps.w === 'dq' || ps.w === 'cq';
      if (quoted && ps.core) {
        // A spot where every one-letter tool misfires (the AI insists on something else).
        if (pt.core.length === 1 && (pt.w === 'sq' || pt.w === 'dot' || pt.w === 'cq') && tools.has(t) &&
            cfg.jam.some(([after, c]) => ps.core.toLowerCase().endsWith(after) && pt.core.toLowerCase() === c)) {
          return ALL[Math.floor(rnd(S + 'jam' + key(s, t)) * ALL.length)];
        }
        if (pt.w === 'sq' && tools.has(t)) return wrap(ps.core + pt.core, ps.w);
        if (pt.w === 'dot' && tools.has(t)) return wrap(ps.core + pt.core, ps.w);
        if (pt.w === 'cq' && ps.w === 'dq' && pt.core) return wrap(ps.core + pt.core, 'cq');
        if (t === N.unquote) return capFirst(ps.core);
        if (t === N.toHash) return '#' + ps.core;
        if (t === N.backspace && ps.core.length > 1) return wrap(ps.core.slice(0, -1), ps.w);
        if (t === N.upper) return wrap(ps.core.toUpperCase(), ps.w);
        if (t === N.bang) return wrap(ps.core + '!', ps.w);
      }
      if (ps.w === 'hash' && ps.core && t === N.unhash) return ps.core;
      if (ps.w === 'plain' && !tools.has(s) && t === N.quote) return '"' + ps.core + '"';
      return undefined;
    }
    function noisy(a, b, r) {
      if (r == null) return r;
      const k = key(a, b);
      if (rnd(S + 'nz' + k) >= cfg.noise) return r;
      const h = rnd(S + 'nz2' + k);
      const p = parse(r);
      if (h < 0.45 && p.w !== 'plain') return wrap(p.core + lower[Math.floor(rnd(S + 'ov' + k) * 26)], p.w);
      if (h < 0.8) return ALL[Math.floor(rnd(S + 'nw' + k) * ALL.length)];
      return null;
    }
    function rules(a, b) {
      let r = toolApply(a, b);
      if (r === undefined) r = toolApply(b, a);
      if (r !== undefined) return noisy(a, b, r);
      const pa = parse(a), pb = parse(b);
      const k = key(a, b);
      if (pa.w === 'plain' && pb.w === 'plain' && !tools.has(a) && !tools.has(b) && a !== b) {
        if (rnd(S + 'ph' + k) < cfg.phraseRate) {
          const [x, y] = a <= b ? [a, b] : [b, a];
          if (/\.$/.test(x) !== /\.$/.test(y)) return /\.$/.test(x) ? x + ' ' + y : y + ' ' + x;
          return rnd(S + 'po' + k) < 0.5 ? x + ' ' + y : y + ' ' + x;
        }
      }
      if (rnd(S + 'fb' + k) < cfg.nothingRate) return null;
      return ALL[Math.floor(rnd(S + 'fw' + k) * ALL.length)];
    }
    function combine(a, b) {
      const k = key(a, b);
      if (table.has(k)) return table.get(k);
      return rules(a, b);
    }

    // 3) What the "community" has recorded on the fake Infinibrowser.
    const ibRecipes = new Map(); // result -> [[a,b]]
    const ibItems = new Set(BASE);
    function record(a, b, r) {
      if (!r) return;
      ibItems.add(a); ibItems.add(b); ibItems.add(r);
      let arr = ibRecipes.get(r);
      if (!arr) { arr = []; ibRecipes.set(r, arr); }
      if (!arr.some((p) => key(p[0], p[1]) === key(a, b))) arr.push([a, b]);
    }
    // Hide only leaf words (never used as an ingredient) so every recorded word keeps a lineage.
    const ingredients = new Set();
    for (const k of table.keys()) { const [a, b] = k.split('||'); ingredients.add(a); ingredients.add(b); }
    for (const [k, r] of table) {
      if (!tools.has(r) && !ingredients.has(r) && rnd(S + 'hide' + r) < cfg.hiddenRate) continue;
      const [a, b] = k.split('||');
      record(a, b, r);
    }
    const craftRecord = (a, b) => { const r = combine(a, b); record(a, b, r); return r; };
    // Longer quoted words the community built; pin each step so the game agrees with the record.
    const chains = ['fire', 'water', 'hello', 'cat', 'tree', 'apple', 'dog', 'abc', 'zor', 'the', 'supe', 'Fire', 'Hello', 'Wat'];
    for (const w of chains) {
      let cur = '"' + w[0] + '"';
      for (let i = 1; i < w.length; i++) {
        const next = '"' + w.slice(0, i + 1) + '"';
        table.set(key(cur, '\'' + w[i] + '\''), next);
        record(cur, '\'' + w[i] + '\'', next);
        cur = next;
      }
    }
    // Every one- and two-letter quoted string.
    for (const x of lower) for (const y of lower) craftRecord('"' + x + '"', '\'' + y + '\'');
    for (const x of lower.toUpperCase()) for (const y of lower) craftRecord('"' + x + '"', '\'' + y + '\'');
    for (const w of ['fire', 'water', 'hello', 'cat', 'tree', 'apple', 'dog', 'abc']) {
      for (const q of ['"' + w + '"', '"' + capFirst(w) + '"']) {
        if (!ibItems.has(q)) continue;
        craftRecord(q, N.unquote);
        const h = craftRecord(q, N.toHash);
        if (h && parse(h).w === 'hash') craftRecord(h, N.unhash);
        craftRecord(q, N.backspace);
        craftRecord(q, N.bang);
      }
      craftRecord(capFirst(w), N.quote);
    }
    // Stale recipes: Infinibrowser claims a cheap pair makes a word, but the game disagrees.
    const stale = [];
    const deep = VOCAB.slice(40).filter((w) => ibItems.has(w));
    for (let i = 0; i < cfg.staleCount && deep.length; i++) {
      const target = deep[Math.floor(rnd(S + 'st' + i) * deep.length)];
      const a = BASE[Math.floor(rnd(S + 'sa' + i) * 4)];
      const b = VOCAB[Math.floor(rnd(S + 'sb' + i) * 12)];
      if (combine(a, b) === target || stale.some((s) => s[2] === target)) continue;
      record(a, b, target);
      stale.push([a, b, target]);
    }

    // Shortest-lineage solver (like /api/recipe).
    let cost = null, best = null;
    function solve() {
      cost = new Map(BASE.map((b) => [b, 0]));
      best = new Map();
      let changed = true;
      while (changed) {
        changed = false;
        for (const [r, list] of ibRecipes) {
          for (const [a, b] of list) {
            const ca = cost.get(a), cb = cost.get(b);
            if (ca === undefined || cb === undefined) continue;
            const c = ca + cb + 1;
            const cur = cost.get(r);
            if (cur === undefined || c < cur) { cost.set(r, c); best.set(r, [a, b]); changed = true; }
          }
        }
      }
    }
    function lineage(id) {
      if (!cost) solve();
      if (!cost.has(id)) return null;
      const out = [];
      const seen = new Set(BASE);
      const emit = (x) => {
        if (seen.has(x)) return;
        seen.add(x);
        const p = best.get(x);
        if (!p) return;
        emit(p[0]); emit(p[1]);
        out.push([p[0], p[1], x]);
      };
      emit(id);
      return out;
    }
    let usesIdx = null;
    function uses(id) {
      if (!usesIdx) {
        usesIdx = new Map();
        for (const [r, list] of ibRecipes) {
          for (const [a, b] of list) {
            for (const [x, y] of [[a, b], [b, a]]) {
              let arr = usesIdx.get(x);
              if (!arr) { arr = []; usesIdx.set(x, arr); }
              arr.push([y, r]);
            }
          }
        }
      }
      return usesIdx.get(id) || [];
    }

    let requests = 0;
    // Answers a fake Infinibrowser API request: { status, body }.
    function api(path, params) {
      requests++;
      if (cfg.rateLimitEvery && requests % cfg.rateLimitEvery === 0) return { status: 429, body: { code: 429, message: 'Not so fast!' } };
      const id = params.id;
      const off = parseInt(params.offset || '0', 10) || 0;
      const el = (x) => ({ id: x, emoji: '' });
      if (path === '/item') {
        if (!ibItems.has(id)) return { status: 404, body: { code: 404, message: 'Unknown element' } };
        if (!cost) solve();
        return { status: 200, body: { id: fnv(id), text: id, emoji: '', depth: cost.get(id) || 0, recipe_count: (ibRecipes.get(id) || []).length, use_count: uses(id).length } };
      }
      if (path === '/recipe') {
        if (!ibItems.has(id)) return { status: 404, body: { code: 404, message: 'Unknown element' } };
        const steps = lineage(id);
        if (!steps) return { status: 500, body: { code: 500, message: 'Internal Server Error' } };
        return { status: 200, body: { steps: steps.map((s) => ({ a: el(s[0]), b: el(s[1]), result: el(s[2]) })), missing: {} } };
      }
      if (path === '/recipes') {
        if (!ibItems.has(id)) return { status: 404, body: { code: 404, message: 'Unknown element' } };
        const list = ibRecipes.get(id) || [];
        return { status: 200, body: { total: list.length, recipes: list.slice(off, off + 50).map((p) => [el(p[0]), el(p[1])]) } };
      }
      if (path === '/uses') {
        if (!ibItems.has(id)) return { status: 404, body: { code: 404, message: 'Unknown element' } };
        const list = uses(id);
        return { status: 200, body: { total: list.length, uses: list.slice(off, off + 50).map((p) => ({ pair: el(p[0]), result: el(p[1]) })) } };
      }
      return { status: 404, body: { code: 404, message: 'Not found' } };
    }

    return {
      cfg, names: N, base: BASE.slice(), vocab: VOCAB.slice(), combine, api, lineage,
      ibHas: (x) => ibItems.has(x), stale, tools,
      get requests() { return requests; }
    };
  }

  return { create, parse, wrap, BASE };
});
