#!/usr/bin/env node
// What the player sees when Infinibrowser can't be used, and that it recovers:
//  1. requests blocked (like a cross-site block or no network)  -> clear message, card keeps the reason
//  2. Cloudflare "checking your browser" page                    -> tells you to open infinibrowser.wiki once
//  3. connection comes back                                      -> Start re-checks and makes the word
//  4. same through a GM_xmlhttpRequest shim (userscript manager path)
//  5. game page blocked, "Open Infinibrowser tab" button -> relay through that tab (postMessage)
//  6. Infinibrowser tab opened separately -> relay through shared userscript storage
//  7. the Infinibrowser tab starts getting the "checking your browser" page mid-run -> the card
//     says so with a "Go to Infinibrowser tab" button, the tab reloads itself so the check can
//     run, and the run continues once it has passed
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const SimWorld = require('./sim-world.js');
const { installGame } = require('./sim-page.js');

const SCRIPT = fs.readFileSync(path.join(__dirname, '..', 'word-forge-pro.user.js'), 'utf8');
const CHALLENGE = '<!DOCTYPE html><html><head><title>Just a moment...</title></head><body>Checking your browser</body></html>';

let failures = 0;
function check(cond, label, detail) {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (cond || detail === undefined ? '' : '  (' + detail + ')'));
  if (!cond) failures++;
}

async function openGame(browser, mode, gm) {
  const world = SimWorld.create({ seed: 'conn', noise: 0.1 });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const state = { mode };
  await page.route('https://infinibrowser.wiki/api/**', async (route) => {
    if (state.mode === 'blocked') return route.abort('failed');
    if (state.mode === 'challenge') return route.fulfill({ status: 403, contentType: 'text/html', body: CHALLENGE });
    const url = new URL(route.request().url());
    const res = world.api(url.pathname.replace(/^\/api/, ''), Object.fromEntries(url.searchParams.entries()));
    return route.fulfill({ status: res.status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(res.body) });
  });
  await page.route('https://neal.fun/**', (route) => route.fulfill({ status: 200, contentType: 'text/html',
    body: '<!doctype html><html><head><meta charset="utf-8"></head><body><div class="container"><div class="items"></div></div></body></html>' }));
  await page.goto('https://neal.fun/infinite-craft/');
  await installGame(page, { seed: 'conn', noise: 0.1 });
  await page.evaluate((useGm) => {
    window.__icForgeConfig = { gap: 0, settle: 0, settleMax: 30, observeDebounce: 50, ib: { gap: 0, offlineCooldown: 1500 } };
    if (useGm) {
      window.__gmCalls = 0;
      window.GM_xmlhttpRequest = (o) => {
        window.__gmCalls++;
        fetch(o.url).then(async (r) => o.onload({ status: r.status, responseText: await r.text() }), () => o.onerror && o.onerror());
      };
    }
  }, !!gm);
  await page.addScriptTag({ content: SCRIPT });
  await page.waitForSelector('#ic-status');
  return { page, context, state, errors };
}
// The game page can't reach the API (as if cross-site requests were blocked); pages on
// infinibrowser.wiki can. The script runs on both, injected like Tampermonkey (document-start).
async function relayScenario(browser, channel) {
  console.log(channel === 'direct' ? 'Relay through the "Open Infinibrowser tab" button:' : 'Relay through shared userscript storage (tab opened separately):');
  const world = SimWorld.create({ seed: 'relay', noise: 0.1 });
  const context = await browser.newContext();
  let relayHits = 0, relayLoads = 0;
  const relay = { challenge: false };
  await context.route('https://infinibrowser.wiki/api/**', async (route) => {
    const origin = route.request().headers()['origin'] || '';
    if (origin === 'https://neal.fun') return route.abort('failed');
    if (relay.challenge) return route.fulfill({ status: 403, contentType: 'text/html', body: CHALLENGE });
    relayHits++;
    const url = new URL(route.request().url());
    const res = world.api(url.pathname.replace(/^\/api/, ''), Object.fromEntries(url.searchParams.entries()));
    return route.fulfill({ status: res.status, contentType: 'application/json', body: JSON.stringify(res.body) });
  });
  await context.route('https://infinibrowser.wiki/', (route) => { relayLoads++; return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html><head><title>Infinibrowser</title></head><body>Infinibrowser</body></html>' }); });
  await context.route('https://neal.fun/**', (route) => route.fulfill({ status: 200, contentType: 'text/html',
    body: '<!doctype html><html><head><meta charset="utf-8"></head><body><div class="container"><div class="items"></div></div></body></html>' }));
  let shim = '';
  if (channel === 'storage') {
    // Minimal shared GM storage across tabs, like Tampermonkey's GM_setValue/GM_addValueChangeListener.
    await context.exposeBinding('__gmSet', ({ page }, k, json) => {
      for (const p of context.pages()) if (p !== page) p.evaluate(([key, j]) => window.__gmRemote && window.__gmRemote(key, j), [k, json]).catch(() => {});
    });
    shim = 'window.__gmCache = {}; window.__gmListeners = {};' +
      'window.GM_getValue = (k, d) => (k in window.__gmCache ? window.__gmCache[k] : d);' +
      'window.GM_setValue = (k, v) => { window.__gmCache[k] = v; window.__gmSet(k, JSON.stringify(v)); };' +
      'window.GM_addValueChangeListener = (k, f) => { (window.__gmListeners[k] = window.__gmListeners[k] || []).push(f); };' +
      'window.__gmRemote = (k, j) => { const v = JSON.parse(j), o = window.__gmCache[k]; window.__gmCache[k] = v; (window.__gmListeners[k] || []).forEach((f) => f(k, o, v, true)); };\n';
  }
  await context.addInitScript({ content: shim + 'window.__icForgeConfig = { gap: 0, settle: 0, settleMax: 30, observeDebounce: 50, ib: { gap: 0, offlineCooldown: 1500 } };\n' + SCRIPT });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('https://neal.fun/infinite-craft/');
  await installGame(page, { seed: 'relay', noise: 0.1 });
  check(await waitStatus(page, /can't reach infinibrowser/), 'game page reports it cannot reach Infinibrowser', await status(page));
  if (channel === 'direct') {
    await page.waitForSelector('#ic-now-action', { state: 'visible', timeout: 15000 });
    const [tab] = await Promise.all([context.waitForEvent('page'), page.click('#ic-now-action')]);
    tab.on('pageerror', (e) => errors.push('tab: ' + e.message));
  } else {
    const tab = await context.newPage();
    tab.on('pageerror', (e) => errors.push('tab: ' + e.message));
    await tab.goto('https://infinibrowser.wiki/');
  }
  check(await waitStatus(page, /through its tab/, 15000), 'game tab connects through the Infinibrowser tab', await status(page));
  await page.bringToFront();
  await page.fill('#ic-target', 'Zorblaxian');
  await page.click('#ic-start');
  await page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: 120000 });
  check(await page.evaluate(() => !!window._icAutoInstance.game.find('Zorblaxian', 'case')), 'makes a brand-new word with recipes fetched through the tab', await status(page));
  check(relayHits > 10, 'Infinibrowser data came through the relay tab (' + relayHits + ' requests)');
  if (channel === 'direct') {
    console.log('Browser check inside the Infinibrowser tab mid-run:');
    relay.challenge = true;
    const loadsBefore = relayLoads;
    await page.fill('#ic-target', 'Qwxyzzyplonk');
    await page.click('#ic-start');
    const said = await page.waitForFunction(() => /checking your browser in its tab/i.test(document.querySelector('#ic-now-msg').textContent), null, { timeout: 60000 }).then(() => true, () => false);
    check(said, 'the card says Infinibrowser is checking the browser in its tab', await page.textContent('#ic-now-msg'));
    check(await page.isVisible('#ic-now-action') && /Go to Infinibrowser tab/.test(await page.textContent('#ic-now-action')), 'the card offers "Go to Infinibrowser tab"');
    const reloaded = await page.waitForFunction((n) => window.__relayLoads > n, loadsBefore, { timeout: 1 }).then(() => true, () => false) ||
      await (async () => { for (let i = 0; i < 40 && relayLoads <= loadsBefore; i++) await page.waitForTimeout(250); return relayLoads > loadsBefore; })();
    check(reloaded, 'the Infinibrowser tab reloads itself so the check can run');
    relay.challenge = false;
    await page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: 120000 }).catch(() => {});
    check(await page.evaluate(() => !!window._icAutoInstance.game.find('Qwxyzzyplonk', 'case')), 'the run continues by itself once the check has passed', await status(page));
  }
  check(errors.length === 0, 'no page errors', errors.join(' | '));
  await context.close();
}

const status = (page) => page.textContent('#ic-status');
const waitStatus = (page, re, ms) => page.waitForFunction((src) => new RegExp(src, 'i').test(document.querySelector('#ic-status').textContent), re.source, { timeout: ms || 15000 }).then(() => true, () => false);

(async () => {
  const browser = await chromium.launch();

  console.log('Blocked requests (direct):');
  let g = await openGame(browser, 'blocked', false);
  check(await waitStatus(g.page, /blocked the request|can't reach/), 'load shows that Infinibrowser is blocked', await status(g.page));
  await g.page.fill('#ic-target', 'Dragon');
  await g.page.click('#ic-start');
  const shown = await g.page.waitForFunction(() => /can't reach infinibrowser/i.test(document.querySelector('#ic-now-msg').textContent), null, { timeout: 60000 }).then(() => true, () => false);
  check(shown, 'the card itself says why the word is stuck', await g.page.textContent('#ic-now-msg'));
  check(await g.page.evaluate(() => window._icAutoInstance.running), 'it keeps going instead of giving up');
  check(await g.page.isVisible('#ic-now-action') && /Open Infinibrowser tab/.test(await g.page.textContent('#ic-now-action')), 'the card offers the fix button while it waits');
  console.log('Connection comes back:');
  g.state.mode = 'ok';
  await g.page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: 120000 }).catch(() => {});
  check(await g.page.evaluate(() => !!window._icAutoInstance.game.find('Dragon', 'case')), 'the same run picks the connection back up and makes the word', await status(g.page));
  check(g.errors.length === 0, 'no page errors', g.errors.join(' | '));
  await g.context.close();

  console.log('Cloudflare "checking your browser" page:');
  g = await openGame(browser, 'challenge', false);
  check(await waitStatus(g.page, /check your browser/), 'load says Infinibrowser wants a browser check', await status(g.page));
  check(/Open Infinibrowser tab/.test(await status(g.page)), 'message tells the player what to do', await status(g.page));
  check(await g.page.isVisible('#ic-now-action'), 'card offers the "Open Infinibrowser tab" button');
  await g.context.close();

  console.log('Through GM_xmlhttpRequest:');
  g = await openGame(browser, 'blocked', true);
  check(await waitStatus(g.page, /can't reach infinibrowser/), 'GM path reports an unreachable site', await status(g.page));
  g.state.mode = 'ok';
  await g.page.waitForTimeout(1600);
  await g.page.fill('#ic-target', 'Zorblaxian');
  await g.page.click('#ic-start');
  await g.page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: 120000 });
  check(await g.page.evaluate(() => !!window._icAutoInstance.game.find('Zorblaxian', 'case')), 'makes a new word with requests going through GM_xmlhttpRequest', await status(g.page));
  check(await g.page.evaluate(() => window.__gmCalls) > 10, 'Infinibrowser requests used GM_xmlhttpRequest');
  check(await g.page.evaluate(() => window.IC.getInstances().length) <= 2, 'board left clean');
  check(g.errors.length === 0, 'no page errors', g.errors.join(' | '));
  await g.context.close();

  await relayScenario(browser, 'direct');
  await relayScenario(browser, 'storage');

  await browser.close();
  console.log(failures ? failures + ' connection check(s) failed' : 'all connection checks passed');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
