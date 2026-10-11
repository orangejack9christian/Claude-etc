#!/usr/bin/env node
// Clicks through the panel against the simulated game: start/pause/resume/skip/stop,
// log, collapse, speed, exclude, pasted recipe, export/import, Pokedex (PokeAPI mocked),
// and v5.x settings migration. Fails on any page error or broken expectation.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const SimWorld = require('./sim-world.js');
const { installGame } = require('./sim-page.js');

const SCRIPT = fs.readFileSync(path.join(__dirname, '..', 'word-forge-pro.user.js'), 'utf8');

let failures = 0;
let currentPage = null;
async function check(cond, label) {
  console.log((cond ? '  ok   ' : '  FAIL ') + label);
  if (!cond) {
    failures++;
    if (currentPage) {
      const dump = await currentPage.evaluate(() => ({
        status: document.querySelector('#ic-status').textContent,
        log: window._icAutoInstance.logRows.filter((r) => r.type !== 'craft').slice(-12).map((r) => r.type + ': ' + r.msg)
      }));
      console.log('       status: ' + dump.status);
      for (const l of dump.log) console.log('       ' + l);
    }
  }
}

(async () => {
  const world = SimWorld.create({ seed: 'ui', noise: 0.1 });
  const browser = await chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  currentPage = page;
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://infinibrowser.wiki/api/**', async (route) => {
    const url = new URL(route.request().url());
    const res = world.api(url.pathname.replace(/^\/api/, ''), Object.fromEntries(url.searchParams.entries()));
    await route.fulfill({ status: res.status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(res.body) });
  });
  await page.route('https://pokeapi.co/**', (route) => route.fulfill({
    status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ results: [{ name: 'dragon' }, { name: 'mr-mime' }, { name: 'nidoran-f' }, { name: 'zorblax' }] })
  }));
  await page.route('https://neal.fun/**', (route) => route.fulfill({
    status: 200, contentType: 'text/html',
    body: '<!doctype html><html><head><meta charset="utf-8"></head><body><div class="container"><div class="items"></div></div></body></html>'
  }));
  await page.goto('https://neal.fun/infinite-craft/');
  // v5.x settings that should carry over.
  await page.evaluate(() => {
    localStorage.setItem('icAutoOptions', JSON.stringify({ autoSweep: false, dragEnabled: false, soundEnabled: false, keepGoing: false, collapsed: false }));
    localStorage.setItem('icAutoSpeed', 'fast');
    localStorage.setItem('icAutoExclude', JSON.stringify(['Lava']));
    localStorage.setItem('icAutoDrafts', JSON.stringify({ target: 'Dragon' }));
    localStorage.setItem('icAutoPairResults', JSON.stringify({ 'Fire||Water': 'Steam' }));
    localStorage.setItem('icAutoTriedV2', JSON.stringify(['Fire||Water']));
  });
  await installGame(page, { seed: 'ui', noise: 0.1 });
  await page.evaluate(() => { window.__icForgeConfig = { gap: 0, settle: 0, settleMax: 30, observeDebounce: 50, ib: { gap: 0 } }; });
  await page.addScriptTag({ content: SCRIPT });
  await page.waitForFunction(() => /^Ready/.test((document.querySelector('#ic-status') || {}).textContent || ''), null, { timeout: 20000 });

  const app = (fn, arg) => page.evaluate(fn, arg);
  await check(await page.inputValue('#ic-target') === 'Dragon', 'v5 draft target restored');
  await check(await page.inputValue('#ic-speed') === 'fast', 'v5 speed restored');
  await check((await page.inputValue('#ic-exclude')).trim() === 'Lava', 'v5 exclude list restored');
  await check(await app(() => window._icAutoInstance.mem.result('Water', 'Fire')) === 'Steam', 'v5 pair results migrated');
  await check(await app(() => localStorage.getItem('icAutoPairResults')) === null, 'v5 pair blob removed from localStorage after IndexedDB migration');
  await check(await page.isVisible('#ic-lookup'), 'Infinibrowser lookup link shown');

  // Start via button, wait for completion.
  await page.click('#ic-start');
  await page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: 60000 });
  await check(await app(() => !!window._icAutoInstance.game.find('Dragon', false)), 'Start button made Dragon');
  await check((await page.inputValue('#ic-target')).trim() === '', 'made target removed from the list');
  await check(!(await page.isDisabled('#ic-copy-recipe')), 'Copy Last Recipe enabled');

  // Pause / resume / skip / stop on a hard target.
  await page.fill('#ic-target', 'Qwxyzzyplonk, Zorblaxian');
  await page.click('#ic-start');
  await page.waitForTimeout(150);
  await page.click('#ic-pause');
  await check(await page.textContent('#ic-pause') === 'Resume', 'Pause toggles to Resume');
  const craftsAtPause = await app(() => window._icAutoInstance.stats.crafts);
  await page.waitForTimeout(400);
  await check(await app(() => window._icAutoInstance.stats.crafts) - craftsAtPause <= 1, 'no crafting while paused');
  await page.click('#ic-pause');
  await page.click('#ic-skip');
  await page.waitForTimeout(200);
  await check((await page.inputValue('#ic-target')).trim() === 'Zorblaxian', 'Skip removed the current target');
  await page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: 90000 });
  await check(await app(() => !!window._icAutoInstance.game.find('Zorblaxian', false)), 'run continued to the next target after Skip');
  await page.fill('#ic-target', 'Something Very Long Indeed');
  await page.click('#ic-start');
  await page.waitForTimeout(200);
  await page.click('#ic-stop');
  await check(await app(() => !window._icAutoInstance.running) && /Stopped/.test(await page.textContent('#ic-status')), 'Stop halts the run');

  // Log, collapse, sections, speed.
  await page.click('#ic-logbtn');
  await check(await page.isVisible('#ic-log'), 'log opens');
  await check(await page.$$eval('#ic-log-body .log-entry', (els) => els.length) > 0, 'log has entries');
  await page.click('#ic-log-close');
  await page.click('#ic-collapse');
  await check(await page.isHidden('.ic-body'), 'collapse hides body');
  await page.click('#ic-collapse');
  await page.selectOption('#ic-speed', 'slow');
  await check(await app(() => localStorage.getItem('icAutoSpeed')) === 'slow', 'speed saved');

  // Pasted recipe.
  await page.click('details[data-sec="settings"] > summary');
  await page.fill('#ic-recipe-text', world.lineage('Castle').map((s) => s[0] + ' + ' + s[1] + ' = ' + s[2]).join('\n'));
  await page.click('#ic-recipe-run');
  await page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: 60000 });
  await check(await app(() => !!window._icAutoInstance.game.find('Castle', true)), 'pasted recipe crafted Castle');

  // Export / import round trip.
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#ic-export')]);
  const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  await check(exported.version && exported.pairResults && Object.keys(exported.pairResults).length > 10, 'export has pair results');
  await app(() => { window._icAutoInstance.mem.pairs.clear(); });
  await page.setInputFiles('#ic-import-file', { name: 'h.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) });
  await page.waitForFunction(() => /Imported/.test(document.querySelector('#ic-status').textContent), null, { timeout: 5000 });
  await check(await app(() => window._icAutoInstance.mem.pairs.size) > 10, 'import restored pair results');

  // Pokedex with mocked PokeAPI.
  await page.click('details[data-sec="pokedex"] > summary');
  await page.click('#ic-poke-load');
  await page.waitForFunction(() => /Loaded 4/.test(document.querySelector('#ic-poke-status').textContent), null, { timeout: 5000 });
  await check(await app(() => window._icAutoInstance.pokedexList.join('|')) === 'Dragon|Mr. Mime|Nidoran♀|Zorblax', 'Pokedex names formatted');
  await page.fill('#ic-poke-start', '4');
  await page.dispatchEvent('#ic-poke-start', 'change');
  await page.click('#ic-poke-run');
  await page.waitForFunction(() => !window._icAutoInstance.running, null, { timeout: 90000 });
  await check(await app(() => !!window._icAutoInstance.game.find('Zorblax', false)), 'Pokedex run made #4 (Zorblax)');
  await check(/complete/.test(await page.textContent('#ic-poke-status')), 'Pokedex queue completes');

  // "Never give up": a word with a letter no tool can add keeps going (waiting and searching
  // wider) instead of stopping, and says what it's stuck on.
  await page.fill('#ic-target', 'na\u00efve');
  await page.click('#ic-start');
  const stillGoing = await page.waitForFunction(() => /Not giving up/.test(document.querySelector('#ic-now-msg').textContent), null, { timeout: 90000 }).then(() => true, () => false);
  await check(stillGoing && await app(() => window._icAutoInstance.running), 'never gives up on a hard word (keeps running and says why)');
  await check(/\u00ef/.test(await page.textContent('#ic-now-msg')), 'the card names the letter it is stuck on');
  await page.click('#ic-stop');
  await page.fill('#ic-target', '');

  // Copy Debug Info: the text names the word, why it's stuck, and the pairs it tried.
  const dbg = await app(() => window._icAutoInstance.debugInfo());
  await check(/Target: naïve/.test(dbg) && /Notes:/.test(dbg) && /Pairs \(a \+ b = result/.test(dbg) && / = .+ (new|mem)$/m.test(dbg), 'debug info has the target, notes and tried pairs');
  await page.click('#ic-debug');
  await check(await page.waitForFunction(() => /debug info/i.test(document.querySelector('#ic-status').textContent), null, { timeout: 5000 }).then(() => true, () => false), 'Copy Debug Info button copies (or saves) it');

  // Start with an empty box never combines anything at random.
  await page.fill('#ic-target', '');
  const before = await app(() => window._icAutoInstance.stats.crafts);
  await page.click('#ic-start');
  await page.waitForTimeout(400);
  await check(await app(() => window._icAutoInstance.stats.crafts) === before && !(await app(() => window._icAutoInstance.running)), 'Start with no words crafts nothing');
  await check(/Type the word/.test(await page.textContent('#ic-status')), 'Start with no words asks for a word');
  // Random exploring only happens through its own button.
  await page.click('#ic-explore');
  await page.waitForTimeout(600);
  await page.click('#ic-stop');
  await check(await app(() => window._icAutoInstance.stats.crafts) > before, 'Explore Randomly button explores');

  // Panel drag.
  const box = await page.locator('#ic-header').boundingBox();
  await page.mouse.move(box.x + 30, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 230, box.y + 110);
  await page.mouse.up();
  const pos = await app(() => JSON.parse(localStorage.getItem('icForgePanelPosV6') || 'null'));
  await check(pos && parseInt(pos.left, 10) > 150, 'panel drags and remembers position');

  await check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(failures ? failures + ' check(s) failed' : 'all UI checks passed');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
