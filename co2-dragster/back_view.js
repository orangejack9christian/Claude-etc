// Sheet 2 (back view) and the sheet 1 web/tube edge, drawn from the math model
// numbers in model/drawing_geom.json. Units: model inches in, PDF points out (72/in).

const BLUE = 'rgb(12.156677%, 30.587769%, 61.175537%)';
const INK = 'rgb(6.666565%, 6.666565%, 6.666565%)';
const HIDDEN = 'rgb(20%, 20%, 20%)';
const CENTER = 'rgb(53.33252%, 53.33252%, 53.33252%)';
const TAN = 'rgb(96.076965%, 90.194702%, 76.861572%)';
const CART = 'rgb(85.096741%, 85.096741%, 85.096741%)';
const WHEEL = 'rgb(90.980225%, 90.980225%, 90.980225%)';
const WHEEL_EDGE = 'rgb(33.333333%, 33.333333%, 33.333333%)';
const WASHER = 'rgb(73.332214%, 73.332214%, 73.332214%)';
const FONT = "font-family=\"DejaVu Sans, Verdana, sans-serif\"";

const f = v => (Math.round(v * 1000) / 1000).toString();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function text(x, y, s, { size = 7.5, fill = BLUE, anchor = 'start', bold = false, rotate = 0 } = {}) {
  const tr = rotate ? ` transform="translate(${f(x)} ${f(y)}) rotate(${rotate})"` : '';
  const pos = rotate ? 'x="0" y="0"' : `x="${f(x)}" y="${f(y)}"`;
  return `<text ${pos}${tr} ${FONT} font-size="${size}" fill="${fill}" text-anchor="${anchor}" style="white-space:pre"` +
    `${bold ? ' font-weight="bold"' : ''}>${esc(s)}</text>`;
}
const line = (x1, y1, x2, y2, stroke, w, extra = '') =>
  `<path d="M ${f(x1)} ${f(y1)} L ${f(x2)} ${f(y2)}" fill="none" stroke="${stroke}" stroke-width="${w}"${extra}/>`;

function arrow(x, y, dx, dy) {
  // tip at (x, y) pointing along (dx, dy); same 2.4 x 2.4 pt head as sheet 1
  const L = 2.4, W = 1.2, bx = x - dx * L, by = y - dy * L;
  return `<path d="M ${f(bx - dy * W)} ${f(by + dx * W)} L ${f(x)} ${f(y)} L ${f(bx + dy * W)} ${f(by - dx * W)} Z" ` +
    `fill="${BLUE}" stroke="${BLUE}" stroke-width="0.5" stroke-linejoin="round"/>`;
}

// ---------------------------------------------------------------------------
// Sheet 2: back view
// ---------------------------------------------------------------------------
function buildSheet2(geom) {
  const P = geom.P;
  const X0 = 7.0, YB = 4.5;                       // page inches: centerline, body bottom
  const px = z => (X0 + z) * 72, py = y => (YB - y) * 72;
  const out = [];
  const add = (...s) => out.push(...s);

  const hw = P.pod_halfwidth, web = geom.web_half, cy = P.cart_y, hr = P.housing_r;
  const podTop = P.axle_y + P.pod_r;                       // 5/8"
  const ground = -(P.wheel_r - P.axle_y);                  // -7/16"
  const crease = geom.crease[0][1];                        // web meets housing at the rear face
  const zin = hw + P.washer, zout = zin + P.wheel_w;        // wheel faces
  const axEnd = P.axle_len / 2;
  const rc = 0.02;                                          // pod edge round (model r=0.02)

  // Fillet between the pod tops and the web, measured from the model's silhouette.
  const fil = geom.pod_top.filter(([, y]) => y > podTop + 0.0012);
  const filEnd = geom.pod_top[fil.length] || [0.3, podTop];

  // --- body outline (housing circle + 3/8" web + pods with fillets), counterclockwise on screen
  const pts = [];
  const P_ = (z, y) => `${f(px(z))} ${f(py(y))}`;
  pts.push(`M ${P_(-hw + rc, 0)}`, `L ${P_(hw - rc, 0)}`, `A ${f(rc * 72)} ${f(rc * 72)} 0 0 0 ${P_(hw, rc)}`,
    `L ${P_(hw, podTop - rc)}`, `A ${f(rc * 72)} ${f(rc * 72)} 0 0 0 ${P_(hw - rc, podTop)}`,
    `L ${P_(filEnd[0], podTop)}`);
  for (let i = fil.length - 1; i >= 0; i--) pts.push(`L ${P_(fil[i][0], fil[i][1])}`);
  pts.push(`L ${P_(web, crease)}`,
    `A ${f(hr * 72)} ${f(hr * 72)} 0 1 0 ${P_(-web, crease)}`);
  for (let i = 0; i < fil.length; i++) pts.push(`L ${P_(-fil[i][0], fil[i][1])}`);
  pts.push(`L ${P_(-filEnd[0], podTop)}`, `L ${P_(-hw + rc, podTop)}`,
    `A ${f(rc * 72)} ${f(rc * 72)} 0 0 0 ${P_(-hw, podTop - rc)}`, `L ${P_(-hw, rc)}`,
    `A ${f(rc * 72)} ${f(rc * 72)} 0 0 0 ${P_(-hw + rc, 0)}`, 'Z');

  // --- ground and hatching
  add(line(px(-1.6), py(ground), px(1.6), py(ground), INK, 0.9));
  for (let z = -1.5; z <= 1.51; z += 0.25)
    add(line(px(z), py(ground), px(z) - 8.64, py(ground) + 8.64, CENTER, 0.4, ' stroke-linecap="round"'));

  // --- wheels, washers, axle ends (same fills as the top view on sheet 1)
  for (const s of [-1, 1]) {
    const za = s > 0 ? zin : -zout, zb = s > 0 ? zout : -zin;
    add(`<rect x="${f(px(za))}" y="${f(py(P.axle_y + P.wheel_r))}" width="${f((zb - za) * 72)}" ` +
      `height="${f(2 * P.wheel_r * 72)}" rx="2.88" fill="${WHEEL}" stroke="${WHEEL_EDGE}" stroke-width="0.8"/>`);
    const wa = s > 0 ? hw : -zin;
    add(`<rect x="${f(px(wa))}" y="${f(py(P.axle_y + 0.16))}" width="${f(P.washer * 72)}" height="${f(0.32 * 72)}" fill="${WASHER}"/>`);
    const aa = s > 0 ? zout : -axEnd;
    add(`<rect x="${f(px(aa))}" y="${f(py(P.axle_y + 1 / 16))}" width="${f((axEnd - zout) * 72)}" height="9" ` +
      `fill="rgb(55%, 55%, 55%)" stroke="${INK}" stroke-width="0.6"/>`);
  }

  // --- body, then the edges of the flat rear face of the web (it sits in front of the pods)
  add(`<path d="${pts.join(' ')}" fill="${TAN}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`);
  const filTop = fil.length ? fil[0][1] : podTop;
  for (const s of [-1, 1]) add(line(px(s * web), py(0), px(s * web), py(filTop), INK, 0.9));

  // --- hidden: axle hole through the pods
  for (const dy of [-P.axle_hole_r, P.axle_hole_r])
    add(line(px(-hw), py(P.axle_y + dy), px(hw), py(P.axle_y + dy), HIDDEN, 0.7, ' stroke-dasharray="2.8 1.4"'));

  // --- cartridge in its 3/4" hole (outline steps: 0.75" body, 0.38" shoulder, 0.28" end)
  add(`<circle cx="${f(px(0))}" cy="${f(py(cy))}" r="${f(P.cart_r * 72)}" fill="${CART}" stroke="${INK}" stroke-width="0.9"/>`);
  add(`<circle cx="${f(px(0))}" cy="${f(py(cy))}" r="${f(0.19 * 72)}" fill="none" stroke="${INK}" stroke-width="0.9"/>`);
  add(`<circle cx="${f(px(0))}" cy="${f(py(cy))}" r="${f(0.14 * 72)}" fill="none" stroke="${INK}" stroke-width="0.9"/>`);

  // --- screw eye under the car (the guide line runs through the ring)
  add(`<circle cx="${f(px(0))}" cy="${f(py(-0.14))}" r="6.12" fill="none" stroke="${INK}" stroke-width="0.9"/>`);
  add(line(px(0), py(-0.055), px(0), py(0), INK, 0.9));

  // --- centerlines
  const dashdot = ' stroke-dasharray="5 1 1 1"';
  add(line(px(0), py(-0.62), px(0), py(2.0), CENTER, 0.5, dashdot));
  add(line(px(-0.75), py(cy), px(0.75), py(cy), CENTER, 0.5, dashdot));
  add(line(px(-1.36), py(P.axle_y), px(1.36), py(P.axle_y), CENTER, 0.5, dashdot));

  // --- dimensions
  const ext = (x1, y1, x2, y2) => add(line(x1, y1, x2, y2, BLUE, 0.4));
  const hdim = (z1, z2, y, label, from) => {          // horizontal, below the view
    for (const z of [z1, z2]) ext(px(z), py(from) + 2, px(z), py(y) + 3);
    add(line(px(z1), py(y), px(z2), py(y), BLUE, 0.5));
    add(arrow(px(z1), py(y), -1, 0), arrow(px(z2), py(y), 1, 0));
    add(text((px(z1) + px(z2)) / 2, py(y) - 2.5, label, { anchor: 'middle' }));
  };
  const vdim = (y1, y2, z, label) => {                 // vertical, right of the view
    add(line(px(z), py(y1), px(z), py(y2), BLUE, 0.5));
    add(arrow(px(z), py(y1), 0, 1), arrow(px(z), py(y2), 0, -1));
    add(text(px(z) - 2.5, (py(y1) + py(y2)) / 2, label, { anchor: 'middle', rotate: -90 }));
  };
  hdim(-hw, hw, -0.85, '1 5/8" at the axle pods', 0);
  hdim(-zout, zout, -1.10, '2 5/16" over the wheels', ground);
  hdim(-axEnd, axEnd, -1.35, '2 1/2" axle', P.axle_y - 1 / 16);

  const cols = { clear: 1.50, axle: 1.80, pod: 2.10, crease: 2.40, cart: 2.70, top: 3.00 };
  const top = cy + hr;
  ext(px(hw) + 2, py(0), px(cols.top) + 3, py(0));
  ext(px(axEnd) + 2, py(P.axle_y), px(cols.axle) + 3, py(P.axle_y));
  ext(px(hw) + 2, py(podTop), px(cols.pod) + 3, py(podTop));
  ext(px(web) + 2, py(crease), px(cols.crease) + 3, py(crease));
  ext(px(hr) + 2, py(cy), px(cols.cart) + 3, py(cy));
  ext(px(0.05), py(top), px(cols.top) + 3, py(top));
  vdim(ground, 0, cols.clear, '7/16"');
  vdim(0, P.axle_y, cols.axle, '3/8"');
  vdim(0, podTop, cols.pod, '5/8"');
  vdim(0, crease, cols.crease, '23/32"');
  vdim(0, cy, cols.cart, '1 1/4" to CO2 CL');
  vdim(0, top, cols.top, '1 13/16"');

  // 3/8" web, dimensioned in front of the pods
  const wy = 0.12;
  add(line(px(-web), py(wy), px(web), py(wy), BLUE, 0.5));
  add(arrow(px(-web), py(wy), -1, 0), arrow(px(web), py(wy), 1, 0));
  add(text(px(web) + 4, py(wy) + 2.6, '3/8" web', {}));

  // --- notes (left side, right-aligned) with leaders
  const note = (z, y, lines, target, opts = {}) => {
    lines.forEach((s, i) => add(text(px(z), py(y) + i * 8.5, s, { size: 7, anchor: 'end', ...opts })));
    if (target) add(line(px(z) + 2.5, py(y) - 2.5, px(target[0]), py(target[1]), BLUE, 0.4));
  };
  const a200 = Math.PI * 200 / 180;
  note(-0.98, 1.86, ['3/4" cartridge hole, 2" deep', '(cartridge shown in place)'], [-0.22, 1.42]);
  note(-0.98, 1.44, ['1 1/8" round housing', '(3/16" wall around the hole)'],
    [hr * Math.cos(a200), cy + hr * Math.sin(a200)]);
  note(-1.30, 0.92, ['wheel: 1 5/8" dia x 5/16" wide', '(width ASSUMED - measure yours)'], [-zout, 0.95]);
  note(-1.40, 0.50, ['1/8" axle, 2 1/2" long', '3/16" hole through the pods (hidden)'], [-axEnd, P.axle_y]);
  add(text(px(-0.50), py(0.07), 'axle pod', { size: 6.5, anchor: 'middle' }));
  add(text(px(0.13), py(-0.16), 'screw eye', { size: 6.5 }));

  // --- labels, header, print check, title block
  add(text(px(0), py(2.47), 'BACK VIEW', { size: 10, fill: '#000', anchor: 'middle', bold: true }));
  add(text(px(0), py(2.30), 'seen from behind (the CO2 end)', { size: 7, fill: CENTER, anchor: 'middle' }));
  add(text(28.8, 23.6, 'CO2 DRAGSTER  -  WORKING DRAWING', { size: 13, fill: '#000', bold: true }));
  add(text(324, 23.6, 'SHEET 2 OF 2  ·  back view', { size: 7.5, fill: '#000' }));
  add(text(28.8, 33.6, 'Scale 1:1 (full size).  Inches.  Hidden lines dashed.  Print on 8.5 x 14 legal, landscape, at ACTUAL SIZE / 100%.', { fill: '#000' }));
  add(text(28.8, 42.8, 'Back view: looking at the rear (CO2 end).  The front pod and front wheels are the same size and sit directly behind the rear ones, so they are hidden.', { fill: '#000' }));

  add(`<rect x="525.6" y="525.6" width="72" height="72" fill="none" stroke="${INK}" stroke-width="0.8"/>`);
  add(text(561.6, 521.4, 'Print check: must measure exactly 1"', { size: 6.5, fill: '#000', anchor: 'middle' }));
  add(text(561.6, 560.6, '1 inch', { size: 6.5, fill: '#000', anchor: 'middle' }));
  add(text(561.6, 568.6, 'square', { size: 6.5, fill: '#000', anchor: 'middle' }));

  add(`<rect x="720" y="507.6" width="270" height="90" fill="none" stroke="${INK}" stroke-width="1"/>`);
  const rows = [['Name:', 'Christian Kidwell'], ['Section:', '________________'], ['Date:', '10/2/2026'],
    ['Sheet:', '2 of 2 (back view)'], ['Scale:', '1:1 (full size)']];
  rows.forEach(([k, v], i) => {
    const y = 525.4 + i * 17.3;
    add(text(727.2, y, k, { fill: '#000', bold: true }));
    add(text(781.2, y, v, { fill: '#000' }));
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1008" height="612" viewBox="0 0 1008 612">` +
    `<rect width="1008" height="612" fill="#fff"/>${out.join('\n')}</svg>`;
}

// ---------------------------------------------------------------------------
// Sheet 1 additions: the web/tube edge in the side view, and the sheet marker
// ---------------------------------------------------------------------------
function sheet1Crease(geom) {
  // Side view mapping on sheet 1 (flipped): rear face at 12.5", body bottom at 5.75" from the top.
  const sx = x => (12.5 - x) * 72, sy = y => (5.75 - y) * 72;
  const c = geom.crease.map(([x, y], i) => [i === 0 ? 0 : x, y]);
  const end = geom.P.ramp_end_x, web = geom.web_half;
  const d = ['M', ...c.map(([x, y], i) => `${i ? 'L ' : ''}${f(sx(x))} ${f(sy(y))}`),
    `L ${f(sx(end))} ${f(sy(web))}`, `L ${f(sx(end))} ${f(sy(0))}`].join(' ');
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round" stroke-linecap="round"/>`;
}

function crossAt(geom, x) {
  const c = geom.crease;
  for (let i = 1; i < c.length; i++) if (c[i][0] >= x) {
    const t = (x - c[i - 1][0]) / (c[i][0] - c[i - 1][0]);
    return [(12.5 - x) * 72, (5.75 - (c[i - 1][1] + t * (c[i][1] - c[i - 1][1]))) * 72];
  }
  return null;
}

module.exports = { buildSheet2, sheet1Crease, crossAt, text, line, BLUE, INK };
