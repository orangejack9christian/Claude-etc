#!/usr/bin/env node
// Runs word-forge-pro.user.js inside headless Chromium against the simulated game in
// sim-world.js, with a fake Infinibrowser API, and checks that every target gets made.
//
//   node test/run-sim.js                    # default scenarios
//   node test/run-sim.js --seed w7 --noise 0.3 "Fire Truck" Zorblaxian
//   node test/run-sim.js --random 30 --seed r1   # 30 random words (gibberish, case, digits, phrases)
//   SIM_VERBOSE=1 node test/run-sim.js ...  # print the forge log for each target
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const SimWorld = require('./sim-world.js');

const ROOT = path.join(__dirname, '..');
const SCRIPT = fs.readFileSync(path.join(ROOT, 'word-forge-pro.user.js'), 'utf8');
const WORLD_SRC = fs.readFileSync(path.join(__dirname, 'sim-world.js'), 'utf8');
const VERBOSE = !!process.env.SIM_VERBOSE;

const DEFAULT_TARGETS = [
  'Dragon',              // plain Infinibrowser lineage
  'Hospital',            // lineage whose cheapest recipe is stale -> must self-heal
  'Pilot',               // another stale one
  'zorblaxian',          // nonsense word -> string building
  'Qwxyzzy',             // awkward letters
  'Hello World',         // phrase with a space
  'R2D2',                // digits
  'Wow!',                // punctuation only reachable through a mined tool
  'Supercalifragilisticexpialidocious',
  'fire truck monster',  // multi-word phrase
  'Xx_Gamer_xX'          // underscores and mixed case
];

// Random targets: gibberish of random length and case, digits, punctuation the simulated
// community has tools for, and phrases mixing real and made-up words.
function randomTargets(n, seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const rand = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const word = (min, max) => {
    const len = min + Math.floor(rand() * (max - min + 1));
    let w = '';
    for (let i = 0; i < len; i++) w += letters[Math.floor(rand() * 26)];
    return w;
  };
  const real = ['Dragon', 'Truck', 'Moon', 'Pizza', 'Robot', 'Castle', 'Ocean', 'Wizard'];
  const out = [];
  for (let i = 0; i < n; i++) {
    const kind = Math.floor(rand() * 6);
    let t;
    if (kind === 0) t = word(4, 9);
    else if (kind === 1) t = word(5, 14).replace(/./g, (c) => (rand() < 0.4 ? c.toUpperCase() : c));
    else if (kind === 2) t = word(2, 5) + Math.floor(rand() * 1000) + word(1, 3);
    else if (kind === 3) t = real[Math.floor(rand() * real.length)] + ' ' + word(3, 7);
    else if (kind === 4) t = word(3, 6) + ['-', '_', '!', ' '][Math.floor(rand() * 4)] + word(2, 6);
    else t = word(3, 6) + ' ' + word(3, 6) + ' ' + word(2, 5);
    out.push(t);
  }
  return out;
}

function parseArgs(argv) {
  const out = { seed: null, noise: null, targets: [], timeout: 240000, exact: false, random: 0 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--seed') out.seed = argv[++i];
    else if (a === '--noise') out.noise = parseFloat(argv[++i]);
    else if (a === '--timeout') out.timeout = parseInt(argv[++i], 10) * 1000;
    else if (a === '--exact') out.exact = true;
    else if (a === '--random') out.random = parseInt(argv[++i], 10) || 20;
    else out.targets.push(a);
  }
  return out;
}

async function runScenario(browser, scenario) {
  const world = SimWorld.create(scenario.world);
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) console.log('  [console]', m.text()); });

  await page.route('https://infinibrowser.wiki/api/**', async (route) => {
    const url = new URL(route.request().url());
    const params = Object.fromEntries(url.searchParams.entries());
    const res = world.api(url.pathname.replace(/^\/api/, ''), params);
    await route.fulfill({
      status: res.status,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(res.body)
    });
  });
  await page.route('https://neal.fun/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><html><head><meta charset="utf-8"><title>Infinite Craft (sim)</title></head>' +
      '<body style="background:#fff"><div class="container"><div class="items"></div></div></body></html>'
  }));
  await page.goto('https://neal.fun/infinite-craft/');
  await page.addScriptTag({ content: WORLD_SRC });
  await page.evaluate((cfg) => {
    const world = window.SimWorld.create(cfg);
    const vm = {
      items: world.base.map((t) => ({ text: t, emoji: '', discovered: false })),
      instances: [],
      craft(a, b) {
        return new Promise((resolve) => setTimeout(() => {
          const r = world.combine(a.text, b.text);
          if (r) {
            if (!vm.items.some((i) => i.text === r)) vm.items.push({ text: r, emoji: '', discovered: !world.ibHas(r) });
            vm.instances.push({ text: r });
          }
          resolve();
        }, 1));
      }
    };
    window.__simWorld = world;
    window.__simVM = vm;
    document.querySelector('.container').__vue__ = vm;
    window.__icForgeConfig = { gap: 0, settle: 0, settleMax: 30, observeDebounce: 50, ib: { gap: 0, retries: 6 } };
  }, scenario.world);
  await page.addScriptTag({ content: SCRIPT });
  await page.waitForFunction(() => {
    const el = document.querySelector('#ic-status');
    return el && /^Ready/.test(el.textContent);
  }, null, { timeout: 20000 });
  await page.evaluate((exact) => {
    const app = window._icAutoInstance;
    app.opt.exactSpelling = exact;
    app.opt.soundEnabled = false;
    app.opt.relentless = true;
    app.applyOptionsToUI();
  }, !!scenario.exact);

  const results = [];
  for (const target of scenario.targets) {
    const t0 = Date.now();
    const before = await page.evaluate(() => ({ crafts: window._icAutoInstance.stats.crafts, ib: window._icAutoInstance.ib.requests }));
    await page.evaluate((t) => {
      const app = window._icAutoInstance;
      app.logRows.length = 0;
      app.setTargets([t]);
      app.start();
    }, target);
    let timedOut = false;
    try {
      await page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: scenario.timeout, polling: 200 });
    } catch (e) {
      timedOut = true;
      await page.evaluate(() => window._icAutoInstance.stop());
    }
    const info = await page.evaluate((args) => {
      const app = window._icAutoInstance;
      const got = app.game.find(args.t, args.exact ? 'exact' : 'case');
      const bank = app.mem.bankGet(args.t);
      return {
        got,
        crafts: app.stats.crafts - args.before.crafts,
        ib: app.ib.requests - args.before.ib,
        status: document.querySelector('#ic-status').textContent,
        recipe: bank ? bank.text : '',
        log: app.logRows.filter((r) => r.type !== 'craft').map((r) => r.type + ': ' + r.msg),
        crafted: app.logRows.filter((r) => r.type === 'craft' && (args.all || !/\[guided\]/.test(r.msg))).slice(args.all ? -400 : -40).map((r) => r.msg)
      };
    }, { t: target, exact: !!scenario.exact, before, all: !!process.env.SIM_ALL_CRAFTS });
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const ok = !!info.got && !timedOut;
    results.push({ target, ok, got: info.got, crafts: info.crafts, ib: info.ib, secs });
    console.log((ok ? '  PASS ' : '  FAIL ') + JSON.stringify(target) + (info.got ? ' -> ' + JSON.stringify(info.got) : '') +
      '  (' + info.crafts + ' crafts, ' + info.ib + ' IB requests, ' + secs + 's)' + (timedOut ? '  TIMEOUT' : ''));
    if (VERBOSE || !ok) {
      for (const line of info.log.slice(-40)) console.log('      ' + line);
      if (!ok) for (const line of info.crafted) console.log('      craft: ' + line);
      console.log('      status: ' + info.status);
    }
    if (ok && VERBOSE && info.recipe) console.log('      recipe:\n        ' + info.recipe.split('\n').join('\n        '));
  }
  await context.close();
  return results;
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const scenarios = [];
  if (args.random) {
    scenarios.push({
      name: args.random + ' random words',
      world: { seed: args.seed || 'w1', noise: args.noise != null ? args.noise : 0.12 },
      targets: randomTargets(args.random, args.seed || 'w1'),
      timeout: args.timeout,
      exact: args.exact
    });
  } else if (args.seed || args.noise != null || args.targets.length) {
    scenarios.push({
      name: 'custom',
      world: { seed: args.seed || 'w1', noise: args.noise != null ? args.noise : 0.12 },
      targets: args.targets.length ? args.targets : DEFAULT_TARGETS,
      timeout: args.timeout,
      exact: args.exact
    });
  } else {
    scenarios.push({ name: 'normal noise (12%)', world: { seed: 'w1', noise: 0.12 }, targets: DEFAULT_TARGETS, timeout: args.timeout });
    scenarios.push({ name: 'heavy noise (30%), other world', world: { seed: 'w2', noise: 0.3 }, targets: DEFAULT_TARGETS, timeout: args.timeout });
    scenarios.push({ name: 'exact spelling', world: { seed: 'w3', noise: 0.15 }, targets: ['Zorblaxian', 'qUiRkY', 'Hello World'], timeout: args.timeout, exact: true });
  }
  const browser = await chromium.launch();
  let pass = 0, total = 0;
  for (const sc of scenarios) {
    console.log('\n== Scenario: ' + sc.name);
    const res = await runScenario(browser, sc);
    for (const r of res) { total++; if (r.ok) pass++; }
  }
  await browser.close();
  console.log('\n' + pass + '/' + total + ' targets made');
  process.exit(pass === total ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
