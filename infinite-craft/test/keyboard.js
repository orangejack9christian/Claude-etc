#!/usr/bin/env node
// Infinite Craft sends typing to its search bar unless an <input> has focus. This page mimics
// that (a window listener that focuses search, plus a stricter document capture listener that
// swallows the key into search) and checks that typing in the panel's boxes stays there.
// The userscript is injected the way Tampermonkey does at document-start (before page scripts).
//
//   node test/keyboard.js [path/to/script.user.js] [--idle]
// --idle injects the script after the page loads instead (like @run-at document-idle).
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const IDLE = argv.indexOf('--idle') >= 0;
const scriptPath = argv.filter((a) => a !== '--idle')[0] || path.join(__dirname, '..', 'word-forge-pro.user.js');
const CONFIG = 'window.__icForgeConfig = { gap: 0, settle: 0, settleMax: 30, ib: { gap: 0 } };\n';
const SCRIPT = fs.readFileSync(scriptPath, 'utf8');

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><title>Infinite Craft (keyboard sim)</title>
<script>
  // Like the game: type anywhere and it goes to the search bar, unless an <input> is focused.
  window.addEventListener('keydown', function (e) {
    var a = document.activeElement;
    if (a && a.tagName === 'INPUT') return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) document.querySelector('.search').focus();
  });
  // Stricter variant: capture on document and swallow the key into search.
  document.addEventListener('keydown', function (e) {
    var a = document.activeElement;
    if (a && a.tagName === 'INPUT') return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var s = document.querySelector('.search');
      s.focus();
      s.value += e.key;
    }
  }, true);
</script></head>
<body style="margin:0;height:100vh;background:#fff">
<div class="container" style="height:100vh"><input class="search" placeholder="Search" style="position:fixed;right:10px;top:10px"><div class="items"></div></div>
<script>
  var vm = { items: [{ text: 'Water' }, { text: 'Fire' }, { text: 'Wind' }, { text: 'Earth' }], instances: [],
    craft: function () { return new Promise(function (r) { setTimeout(r, 5); }); } };
  document.querySelector('.container').__vue__ = vm;
</script></body></html>`;

let failures = 0;
function check(cond, label, detail) {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (cond || detail === undefined ? '' : '  (' + detail + ')'));
  if (!cond) failures++;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.route('https://infinibrowser.wiki/**', (route) => route.fulfill({ status: 404, contentType: 'application/json', body: '{}' }));
  await context.route('https://neal.fun/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: PAGE }));
  // Tampermonkey @run-at document-start: runs before any page script.
  if (!IDLE) await context.addInitScript({ content: CONFIG + SCRIPT });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('https://neal.fun/infinite-craft/');
  if (IDLE) await page.addScriptTag({ content: CONFIG + SCRIPT });
  await page.waitForSelector('#ic-target', { timeout: 15000 });
  const search = () => page.inputValue('.search');

  await page.click('#ic-target');
  await page.keyboard.type('Zorblax, Hello World');
  check(await page.inputValue('#ic-target') === 'Zorblax, Hello World', 'typing goes into the word box', await page.inputValue('#ic-target'));
  check(await search() === '', 'search bar stays empty', await search());
  await page.keyboard.press('Enter');
  await page.keyboard.type('Dragon');
  check((await page.inputValue('#ic-target')).endsWith('\nDragon'), 'Enter adds a new line in the word box');
  await page.keyboard.press('Backspace');
  check((await page.inputValue('#ic-target')).endsWith('\nDrago'), 'Backspace edits the word box');

  await page.click('details[data-sec="settings"] > summary');
  await page.click('#ic-exclude');
  await page.keyboard.type('Lava');
  check(await page.inputValue('#ic-exclude') === 'Lava', 'typing goes into the exclude box');
  await page.click('#ic-recipe-text');
  await page.keyboard.type('Water + Fire = Steam');
  check(await page.inputValue('#ic-recipe-text') === 'Water + Fire = Steam', 'typing goes into the recipe box');
  await page.click('details[data-sec="pokedex"] > summary');
  await page.fill('#ic-poke-start', '');
  await page.click('#ic-poke-start');
  await page.keyboard.type('25');
  check(await page.inputValue('#ic-poke-start') === '25', 'typing goes into the Pokedex start box');
  check(await search() === '', 'search bar still empty after all panel typing', await search());

  // Outside the panel the game keeps its type-to-search behaviour.
  await page.keyboard.press('Escape');
  await page.mouse.click(700, 500);
  await page.keyboard.type('abc');
  check((await search()).indexOf('abc') >= 0, 'typing outside the panel still goes to the game search', await search());

  // Ctrl+Enter in the word box starts a run.
  await page.fill('#ic-target', 'Steam');
  await page.click('#ic-target');
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(300);
  // The run may already be over (nothing to build in this bare page); the status shows it ran.
  check(/Steam/.test(await page.textContent('#ic-status')), 'Ctrl+Enter starts a run', await page.textContent('#ic-status'));
  await page.evaluate(() => window._icAutoInstance.stop());

  check(errors.length === 0, 'no page errors', errors.join(' | '));
  await browser.close();
  console.log(failures ? failures + ' keyboard check(s) failed' : 'all keyboard checks passed');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
