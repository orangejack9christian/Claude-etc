// Build the working drawing:
//  sheet 1: the original top and side views mirrored left-to-right (cartridge on
//           the right, lettering still readable), wheel projection lines, the
//           edge where the round tube meets the 3/8" web, and the axle pods'
//           teardrop outlines, from the math model.
//  sheet 2: the back view, drawn from the math model (back_view.js).
// Output: a true-size 14 x 8.5 in two-page PDF plus one SVG per sheet.
//
// Usage: node build.js <original.svg> <drawing_geom.json> <out dir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const BV = require('./back_view');

const [, , inSvg, geomPath, outDir] = process.argv;
const geom = JSON.parse(fs.readFileSync(geomPath, 'utf8'));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const svgText = fs.readFileSync(inSvg, 'utf8').replace(/^<\?xml[^>]*>\s*/, '');
  await page.setContent(`<!doctype html><html><body style="margin:0">${svgText}</body></html>`);

  const extras = {
    crease: BV.sheet1Crease(geom) + BV.sheet1Pods(geom),
    leaderTo: BV.crossAt(geom, 3.667),
    marker: BV.text(324, 23.6, 'SHEET 1 OF 2  ·  back view on sheet 2', { size: 7.5, fill: '#000' }),
    note: ['edge where the round tube meets', 'the 3/8" flat web under it', '(23/32" up at the rear; back view: sheet 2)']
      .map((s, i) => BV.text(306, 360 + i * 8.5, s, { size: 7 })).join(''),
    blue: BV.BLUE,
  };

  const out = await page.evaluate((extras) => {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.querySelector('svg');
    const AXIS2 = 1008; // 2 x page center (504 pt = 7 in)
    const kids = [...svg.children].filter(e => e.tagName !== 'defs' && e.tagName !== 'rect');
    const items = kids.map(el => {
      const r = el.getBoundingClientRect();
      return { el, isText: el.tagName === 'g', x0: r.left, x1: r.right, y0: r.top, y1: r.bottom };
    });
    const keep = it =>
      it.y0 >= 505 ||                                   // rule checks, 1" square, title block
      (it.isText && it.y1 <= 55) ||                     // title, notes, TOP VIEW
      (it.isText && it.x0 > 930 && it.y0 > 245 && it.y1 < 262); // SIDE VIEW
    const kept = items.filter(keep), moved = items.filter(it => !keep(it));

    // Text is split into fragments. Join fragments into lines, and stacked
    // left-aligned lines into blocks, then move each block as one piece so
    // words keep their order and notes stay left-aligned.
    const texts = moved.filter(it => it.isText);
    const parent = texts.map((_, i) => i);
    const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const join = (a, b) => { parent[find(a)] = find(b); };
    const h = t => t.y1 - t.y0, w = t => t.x1 - t.x0;
    texts.forEach((a, i) => texts.forEach((b, j) => {
      if (i >= j) return;
      const yOverlap = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      const xGap = Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1);
      if (yOverlap > 0.5 * Math.min(h(a), h(b)) && xGap < 8) join(i, j);
    }));
    const lines = new Map();
    texts.forEach((t, i) => { const k = find(i); if (!lines.has(k)) lines.set(k, []); lines.get(k).push(i); });
    const lineBox = idx => ({ idx, x0: Math.min(...idx.map(i => texts[i].x0)), x1: Math.max(...idx.map(i => texts[i].x1)),
      y0: Math.min(...idx.map(i => texts[i].y0)), y1: Math.max(...idx.map(i => texts[i].y1)) });
    const L = [...lines.values()].map(lineBox);
    L.forEach((a, i) => L.forEach((b, j) => {
      if (i >= j || w(a) < h(a) || w(b) < h(b)) return;  // horizontal lines only
      const [top, bot] = a.y0 < b.y0 ? [a, b] : [b, a];
      const gap = bot.y0 - top.y1;
      if (Math.abs(a.x0 - b.x0) < 1.5 && gap > -1 && gap < 4) join(a.idx[0], b.idx[0]);
    }));
    const blocks = new Map();
    texts.forEach((t, i) => { const k = find(i); if (!blocks.has(k)) blocks.set(k, []); blocks.get(k).push(t); });
    for (const members of blocks.values()) {
      const x0 = Math.min(...members.map(m => m.x0)), x1 = Math.max(...members.map(m => m.x1));
      const y0 = Math.min(...members.map(m => m.y0));
      // Mirrored, the axle-hole leader would cross the start of the
      // "teardrop axle pods" note, so that note sits 1/4" further right.
      const nudge = x0 > 750 && x0 < 760 && y0 > 305 && y0 < 315 ? 18 : 0;
      const dx = AXIS2 - x0 - x1 + nudge;
      for (const m of members) {
        const t = m.el.getAttribute('transform');
        m.el.setAttribute('transform', `translate(${dx.toFixed(3)} 0)` + (t ? ' ' + t : ''));
      }
    }
    // Axle centerlines overshoot into the header notes; stop them at the wheel tops.
    const clip = document.createElementNS(NS, 'clipPath');
    clip.id = 'below-header';
    clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const cr = document.createElementNS(NS, 'rect');
    Object.entries({ x: -2000, y: 53.6, width: 5000, height: 2000 }).forEach(([k, v]) => cr.setAttribute(k, v));
    clip.appendChild(cr);
    svg.querySelector('defs').appendChild(clip);
    for (const it of moved.filter(it => !it.isText)) {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `matrix(-1 0 0 1 ${AXIS2} 0)`);
      const isCenterline = (it.el.getAttribute('stroke-dasharray') || '').startsWith('5 1 1 1');
      if (it.y0 < 53 && isCenterline) g.setAttribute('clip-path', 'url(#below-header)');
      it.el.parentNode.insertBefore(g, it.el);
      g.appendChild(it.el);
    }
    // The front axle end now sits under the header notes. Move the two note
    // lines up so the axle end clears them.
    for (const it of kept.filter(it => it.isText && it.x1 < 900)) {
      const dy = it.y0 > 30 && it.y1 < 41 ? -4.5 : it.y0 > 43 && it.y1 < 54 ? -7.5 : 0;
      if (!dy) continue;
      const t = it.el.getAttribute('transform');
      it.el.setAttribute('transform', `translate(0 ${dy})` + (t ? ' ' + t : ''));
    }

    // Projection lines: carry the front and back of each side-view wheel up to
    // the top-view wheels. They cross the side-view body and break around labels.
    const WHEEL_R = 58.5, AXLES = [108, 828], Y_TOP = 220, Y_BOT = 387, PAD = 2;
    const boxes = [...svg.children].filter(e => e.tagName === 'g' && e.querySelector('use'))
      .map(e => e.getBoundingClientRect());
    const sideBody = moved.find(it => !it.isText && it.y0 > 280 && it.x1 - it.x0 > 800 &&
      (it.el.getAttribute('fill') || '').startsWith('rgb(96'));
    const proj = document.createElementNS(NS, 'g');
    Object.entries({ fill: 'none', stroke: 'rgb(62%, 62%, 62%)', 'stroke-width': '0.35' })
      .forEach(([k, v]) => proj.setAttribute(k, v));
    let nProj = 0;
    for (const ax of AXLES) for (const x of [ax - WHEEL_R, ax + WHEEL_R]) {
      const cuts = boxes.filter(b => x > b.left - PAD && x < b.right + PAD)
        .map(b => [b.top - PAD, b.bottom + PAD]).sort((a, b) => a[0] - b[0]);
      let y = Y_TOP, d = '';
      for (const [c0, c1] of cuts) {
        if (c1 <= y || c0 >= Y_BOT) continue;
        if (c0 > y) d += `M ${x} ${y} L ${x} ${c0} `;
        y = Math.max(y, c1);
      }
      if (y < Y_BOT) d += `M ${x} ${y} L ${x} ${Y_BOT}`;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d.trim());
      proj.appendChild(path); nProj++;
    }
    const after = sideBody.el.parentNode; // the mirror wrapper
    after.parentNode.insertBefore(proj, after.nextSibling);

    // The edge where the round tube meets the 3/8" web and the axle pod outlines
    // (from the math model), drawn over the side-view body, plus the note and
    // the sheet marker.
    const add = (html, before) => {
      const g = document.createElementNS(NS, 'g');
      g.innerHTML = html;
      if (before) before.parentNode.insertBefore(g, before); else svg.appendChild(g);
      return g;
    };
    add(extras.crease, proj.nextSibling);
    const noteG = add(extras.note);
    const first = noteG.querySelector('text').getBBox();
    const [tx, ty] = extras.leaderTo;
    const lead = document.createElementNS(NS, 'path');
    lead.setAttribute('d', `M ${(first.x + first.width + 2.5).toFixed(2)} ${(first.y + first.height / 2).toFixed(2)} L ${tx.toFixed(2)} ${ty.toFixed(2)}`);
    Object.entries({ fill: 'none', stroke: extras.blue, 'stroke-width': '0.4' }).forEach(([k, v]) => lead.setAttribute(k, v));
    noteG.appendChild(lead);
    add(extras.marker);

    return {
      svg: new XMLSerializer().serializeToString(svg),
      counts: { projection: nProj, moved: moved.length, kept: kept.length, blocks: blocks.size, texts: texts.length },
    };
  }, extras);

  const sheet1 = out.svg;
  const sheet2 = BV.buildSheet2(geom);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'drawing.svg'), '<?xml version="1.0" encoding="UTF-8"?>\n' + sheet1);
  fs.writeFileSync(path.join(outDir, 'back_view.svg'), '<?xml version="1.0" encoding="UTF-8"?>\n' + sheet2);
  console.log(JSON.stringify(out.counts));

  const pdfPage = await browser.newPage();
  await pdfPage.setContent(`<!doctype html><html><head><title>CO2 Dragster - Working Drawing</title>
<style>@page{size:14in 8.5in;margin:0}html,body{margin:0}
.sheet{width:14in;height:8.5in;overflow:hidden}.sheet+.sheet{break-before:page}
.sheet svg{display:block;width:14in;height:8.5in}</style>
</head><body><div class="sheet">${sheet1}</div><div class="sheet">${sheet2}</div></body></html>`);
  await pdfPage.pdf({ path: path.join(outDir, 'working_drawing.pdf'), width: '14in', height: '8.5in',
    printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
  await browser.close();
})();
