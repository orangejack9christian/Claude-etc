#!/usr/bin/env node
// Measures how much the script makes the page stutter. The simulated game gets a big
// inventory (40,000 items by default), the board changes on every craft like the real game,
// and the script remembers 100,000 pair results. While it builds a few words, a
// PerformanceObserver records every main-thread task over 50 ms ("long tasks", which are what
// you feel as lag).
//
//   node test/perf.js                 # 40,000 items
//   node test/perf.js --items 80000
//   SIM_SCRIPT=old.user.js node test/perf.js   # measure another version
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const SimWorld = require('./sim-world.js');
const { installGame } = require('./sim-page.js');

const SCRIPT = fs.readFileSync(process.env.SIM_SCRIPT || path.join(__dirname, '..', 'word-forge-pro.user.js'), 'utf8');
const argv = process.argv.slice(2);
const arg = (name, def) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : def; };
const ITEMS = parseInt(arg('--items', '40000'), 10);
const PAIRS = parseInt(arg('--pairs', '100000'), 10);
const TARGETS = ['Zorblaxian', 'Hello World', 'Qwxyzzy', 'Mr. Eremey Jeremy'];

(async () => {
  const world = SimWorld.create({ seed: 'perf', noise: 0.12, extraWords: ['Mr.', 'Jeremy'] });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://infinibrowser.wiki/api/**', async (route) => {
    const url = new URL(route.request().url());
    const res = world.api(url.pathname.replace(/^\/api/, ''), Object.fromEntries(url.searchParams.entries()));
    await route.fulfill({ status: res.status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(res.body) });
  });
  await page.route('https://neal.fun/**', (route) => route.fulfill({ status: 200, contentType: 'text/html',
    body: '<!doctype html><html><head><meta charset="utf-8"></head><body><div class="container"><div class="items"></div><div class="board"></div></div></body></html>' }));
  await page.goto('https://neal.fun/infinite-craft/');
  await installGame(page, { seed: 'perf', noise: 0.12, extraWords: ['Mr.', 'Jeremy'] });
  await page.evaluate((n) => {
    // A big save: ordinary words, some quoted texts, some long phrases.
    const items = window.IC.getItems();
    const syl = ['ka', 'zo', 'ri', 'mu', 'te', 'lan', 'dor', 'vex', 'qui', 'sha', 'bel', 'nor'];
    for (let i = 0; i < n; i++) {
      let w = '';
      for (let k = 0, h = i * 2654435761 >>> 0; k < 3 + (i % 3); k++, h = (h * 1103515245 + 12345) >>> 0) w += syl[h % syl.length];
      w = w.charAt(0).toUpperCase() + w.slice(1) + ' ' + i;
      const text = i % 7 === 0 ? '"' + w.toLowerCase() + '"' : (i % 11 === 0 ? 'The ' + w + ' Of Doom' : w);
      items.push({ id: items.length, text, emoji: '', discovery: false });
    }
    // Like the real game, every craft changes the page (board and sidebar).
    const vm = document.querySelector('.container').__vue__;
    const craft = vm.craft.bind(vm);
    const board = document.querySelector('.board');
    vm.craft = async (a, b) => {
      const r = await craft(a, b);
      const el = document.createElement('div');
      el.textContent = r && r.instance ? r.instance.text : 'Nothing';
      board.appendChild(el);
      if (board.children.length > 20) board.removeChild(board.firstChild);
      return r;
    };
    window.__longTasks = [];
    new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__longTasks.push(e.duration); }).observe({ type: 'longtask', buffered: false });
    window.__icForgeConfig = { gap: 0, settle: 0, settleMax: 30, observeDebounce: 300, ib: { gap: 0 } };
  }, ITEMS);
  await page.addScriptTag({ content: SCRIPT });
  await page.waitForFunction(() => /^Ready/.test((document.querySelector('#ic-status') || {}).textContent || ''), null, { timeout: 60000 });
  // A long-time player's memory of pair results.
  await page.evaluate((n) => {
    const m = window._icAutoInstance.mem;
    for (let i = 0; i < n; i++) m.pairs.set('Thing ' + i + '||Other ' + (i * 7), 'Result ' + (i % 5000));
  }, PAIRS);
  await page.evaluate(() => { window.__longTasks.length = 0; });

  const summary = (arr) => {
    const total = arr.reduce((a, b) => a + b, 0);
    return { count: arr.length, total: Math.round(total), max: Math.round(arr.length ? Math.max(...arr) : 0) };
  };
  const rows = [];
  const t0 = Date.now();
  // PERF_PROFILE=out.json: CPU profile of the whole run (open in Chrome DevTools).
  const cdp = process.env.PERF_PROFILE ? await page.context().newCDPSession(page) : null;
  if (cdp) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start'); }
  for (const t of TARGETS) {
    const start = Date.now();
    await page.evaluate((x) => { window.__longTasks.length = 0; const a = window._icAutoInstance; a.setTargets([x]); a.start(); }, t);
    await page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: 300000, polling: 250 });
    const r = await page.evaluate((x) => ({ got: window._icAutoInstance.game.find(x, 'case'), lt: window.__longTasks.slice(), crafts: window._icAutoInstance.stats.crafts }), t);
    const s = summary(r.lt);
    const secs = (Date.now() - start) / 1000;
    rows.push({ t, ok: !!r.got, secs, s });
    console.log((r.got ? '  made ' : '  FAIL ') + JSON.stringify(t).padEnd(22) + (secs.toFixed(1) + 's').padStart(7) +
      '  long tasks: ' + String(s.count).padStart(4) + ', frozen ' + String(s.total).padStart(6) + ' ms (' + Math.round(s.total / (secs * 10)) + '% of the run), worst ' + s.max + ' ms');
  }
  if (cdp) { const { profile } = await cdp.send('Profiler.stop'); fs.writeFileSync(process.env.PERF_PROFILE, JSON.stringify(profile)); }
  // Saving what it learned (happens every few seconds during a run).
  await page.evaluate(() => { window.__longTasks.length = 0; const m = window._icAutoInstance.mem; m.remember('x', 'y', 'z'); return m.flush(); });
  await page.waitForTimeout(300);
  const fl = summary(await page.evaluate(() => window.__longTasks.slice()));
  console.log('  saving pair memory: worst freeze ' + fl.max + ' ms');
  const all = rows.reduce((a, r) => a + r.s.total, 0), secs = (Date.now() - t0) / 1000;
  console.log('Total: ' + rows.filter((r) => r.ok).length + '/' + rows.length + ' made in ' + secs.toFixed(1) + 's, frozen ' + Math.round(all) + ' ms (' + Math.round(all / (secs * 10)) + '%)' +
    ', worst single freeze ' + Math.max(fl.max, ...rows.map((r) => r.s.max)) + ' ms');
  if (errors.length) console.log('Page errors: ' + errors.join(' | '));
  await browser.close();
  process.exit(rows.every((r) => r.ok) && !errors.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
