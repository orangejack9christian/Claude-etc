// Installs a simulated Infinite Craft client into a Playwright page, backed by sim-world.js.
//
// Default: the current client (2026), which scripts reach through window.IC
// (getItems/getInstances/createInstance/removeInstances/clearInstances/craft) and the
// .container view-model (items, craft(instanceA, instanceB) -> { instance }, craftApi).
// { legacy: true }: the older client with vm.craft({ text }, { text }) and vm.instances.
'use strict';
const fs = require('fs');
const path = require('path');

const WORLD_SRC = fs.readFileSync(path.join(__dirname, 'sim-world.js'), 'utf8');

async function installGame(page, worldCfg, opts) {
  opts = opts || {};
  await page.addScriptTag({ content: WORLD_SRC });
  await page.evaluate(({ cfg, legacy }) => {
    const world = window.SimWorld.create(cfg);
    window.__simWorld = world;
    const container = document.querySelector('.container');
    if (legacy) {
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
      container.__vue__ = vm;
      return;
    }
    const items = world.base.map((t, i) => ({ id: i, text: t, emoji: '', discovery: false }));
    const instances = [];
    let nextId = 0;
    const createInstance = (o) => {
      const inst = Object.assign({ id: ++nextId, disabled: false, element: document.createElement('div') }, o);
      instances.push(inst);
      return inst;
    };
    const remove = (inst) => { const i = instances.indexOf(inst); if (i >= 0) instances.splice(i, 1); };
    const vm = {
      items,
      isLoading: false,
      async craftApi(a, b) {
        await new Promise((r) => setTimeout(r, 1));
        const r = world.combine(a, b);
        return r ? { text: r, emoji: '' } : null;
      },
      async craft(ia, ib) {
        // Like the real client: only real board instances of real items can be combined.
        for (const inst of [ia, ib]) {
          if (!inst || instances.indexOf(inst) < 0) throw new Error('craft: not an instance on the board');
          if (!items[inst.itemId] || items[inst.itemId].text !== inst.text) throw new Error('craft: instance itemId does not match its text');
        }
        await new Promise((r) => setTimeout(r, 1));
        const r = world.combine(ia.text, ib.text);
        if (!r) return null;
        let item = items.find((i) => i.text === r);
        if (!item) { item = { id: items.length, text: r, emoji: '', discovery: !world.ibHas(r) }; items.push(item); }
        remove(ia);
        remove(ib);
        return { instance: createInstance({ text: r, itemId: item.id, emoji: '', x: ia.x, y: ia.y }) };
      }
    };
    container.__vue__ = vm;
    window.IC = {
      getItems: () => items,
      getInstances: () => instances,
      createInstance,
      removeInstances: (arr) => arr.forEach(remove),
      clearInstances: () => { instances.length = 0; },
      craft: (a, b) => vm.craft(a, b)
    };
  }, { cfg: worldCfg, legacy: !!opts.legacy });
}

module.exports = { installGame, WORLD_SRC };
