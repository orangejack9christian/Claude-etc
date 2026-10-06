// Builds Tribute_Speech_Mrs_Teske.pptx (5 slides, chalkboard theme, polaroid photo slots).
// Run: NODE_PATH=<folder with pptxgenjs + sharp> node build_slides.js
// Optional: APPLY_THEME=<path to apply_theme.js> writes the theme colors into the deck.
const path = require("path");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");

const OUT = path.join(__dirname, "Tribute_Speech_Mrs_Teske.pptx");

const THEME = {
  name: "Chalkboard Tribute",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1F2A24", lt1: "FFFFFF", dk2: "26392F", lt2: "F7F4EC",
    accent1: "F2C14E", accent2: "CBD3CC", accent3: "E07A5F",
    accent4: "8FB39B", accent5: "5B7B67", accent6: "3D5446",
    hlink: "F2C14E", folHlink: "CBD3CC",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
pres.author = "Christian Kidwell";
pres.title = "A Tribute to Mrs. Teske";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const BG = { color: THEME.colors.dk2 };

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "COVER_LEFT", background: BG,
  objects: [
    { placeholder: { options: { name: "eyebrow", type: "body", x: 0.7, y: 1.75, w: 4.0, h: 0.4, fontSize: 16, bold: true, color: C.accent1, charSpacing: 4, margin: 0, valign: "bottom" }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 2.2, w: 4.0, h: 1.0, fontSize: 46, bold: true, color: C.background1, margin: 0, valign: "top" }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: 0.7, y: 3.25, w: 4.0, h: 0.45, fontSize: 18, color: C.background2, margin: 0, valign: "top" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "COVER_RIGHT", background: BG,
  objects: [
    { placeholder: { options: { name: "eyebrow", type: "body", x: 5.1, y: 1.4, w: 4.2, h: 0.4, fontSize: 16, bold: true, color: C.accent1, charSpacing: 4, margin: 0, valign: "bottom" }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 5.1, y: 1.85, w: 4.3, h: 1.7, fontSize: 44, bold: true, color: C.background1, margin: 0, valign: "top" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "TOP_TITLE", background: BG,
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.45, w: 8.6, h: 0.85, fontSize: 40, bold: true, color: C.background1, margin: 0, valign: "middle" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "SIDE_TITLE", background: BG,
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 1.2, w: 3.6, h: 1.5, fontSize: 36, bold: true, color: C.background1, margin: 0, valign: "bottom" }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: 0.7, y: 2.85, w: 3.4, h: 0.8, fontSize: 18, color: C.accent1, margin: 0, valign: "top" }, text: "" } },
  ],
});

// ---------- photo placeholders ----------
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
async function placeholderPng(wIn, hIn, lines) {
  const W = 900, H = Math.round((W * hIn) / wIn);
  const fs1 = 58, fs2 = 36, fs3 = 28;
  const block = fs1 + 24 + lines.length * (fs2 + 12) + 28 + fs3;
  let y = (H - block) / 2 + fs1;
  let t = `<text x="${W / 2}" y="${y}" font-size="${fs1}" font-weight="bold" fill="#3D5446">ADD PHOTO</text>`;
  y += 24;
  for (const l of lines) { y += fs2 + 12; t += `<text x="${W / 2}" y="${y}" font-size="${fs2}" fill="#26392F">${esc(l)}</text>`; }
  y += 28 + fs3;
  t += `<text x="${W / 2}" y="${y}" font-size="${fs3}" font-style="italic" fill="#5B7B67">Right-click → Replace image</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#CBD3CC"/>
    <rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="#7E8C82" stroke-width="6" stroke-dasharray="26 16"/>
    <g font-family="DejaVu Sans, Arial, sans-serif" text-anchor="middle">${t}</g></svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// Polaroid = white frame + photo + caption, rotated together as one unit.
// PowerPoint rotates each shape around its own center, so each part's center
// is moved to where a group rotation around the frame center would put it.
async function polaroid(slide, o) {
  const pad = 0.12, strip = 0.5;
  const fh = pad + o.photoH + strip, pw = o.w - 2 * pad;
  const th = (o.rot * Math.PI) / 180;
  const place = (dx, dy, w, h) => ({
    x: o.cx + dx * Math.cos(th) - dy * Math.sin(th) - w / 2,
    y: o.cy + dx * Math.sin(th) + dy * Math.cos(th) - h / 2,
    w, h, rotate: o.rot,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    ...place(0, 0, o.w, fh),
    fill: { color: C.background1 }, line: { type: "none" },
    shadow: { type: "outer", color: "000000", opacity: 0.4, blur: 8, offset: 3, angle: 90 },
    objectName: `${o.name} frame`,
  });
  slide.addImage({
    data: await placeholderPng(pw, o.photoH, o.hint),
    ...place(0, -fh / 2 + pad + o.photoH / 2, pw, o.photoH),
    altText: o.hint.join(" "), objectName: `${o.name} photo`,
  });
  slide.addText(o.caption, {
    ...place(0, fh / 2 - strip / 2, pw, strip),
    fontFace: THEME.headFontFace, italic: true, fontSize: 14, color: C.text1,
    align: "center", valign: "middle", margin: 0, isTextBox: true,
    objectName: `${o.name} caption`,
  });
}

// ---------- speech text for speaker notes ----------
const NOTES = {
  1: "INTRO\n\nImagine you are stuck on a homework problem. You walk up to the teacher's desk to ask for help. But the second you get there, you figure it out on your own. In Mrs. Teske's class, that happened all the time.\n\nMrs. Teske was my 7th and 8th grade teacher at St. John's Lutheran School in Buckley. My class only had about ten students, and she taught us almost every subject. I spent almost every school day with her for two years. My sister had her as a teacher, too, and my brother still goes there.\n\nMy 7th and 8th grade teacher, Mrs. Teske, is one of the main reasons I was ready for high school.\n\nShe was caring, she was dedicated to getting us ready, and both traits had a big impact on the student I am today.",
  2: "MAIN POINT 1: CARING\n\nFirst, Mrs. Teske was caring. In 7th grade, I was the only boy in my class, but she treated me the same as everyone else, so it never felt weird. She could tell when our whole class was struggling, and she would slow down and explain it in a way that made sense. You could walk up to her desk at any time, and she would explain it until you got it. She also made class fun. Every day in December, she gave us a treat, and we had a party for every holiday. She told us stories about her family and her past students, and sometimes spelling tests turned into story time.\n\nTRANSITION: Mrs. Teske cared about us, but she also expected a lot from us.",
  3: "MAIN POINT 2: DEDICATED\n\nSecond, Mrs. Teske was dedicated to getting us ready for high school. She gave us quite a bit of homework, and there were no excuses for late work. Her tests were hard, but she offered extra credit because she wanted us to do well. She just wanted us to earn it. In her class, nobody really thought about slacking off. Working hard was just normal.\n\nTRANSITION: Her caring and her dedication did not just help me in middle school. They still help me today.",
  4: "MAIN POINT 3: IMPACT ON ME\n\nMrs. Teske helped make me the student I am today. It was not only her, but she was the teacher I spent almost every day with. When I got to high school, I was more prepared than a lot of other students. Now I am in advanced classes and in the top ten of my class. I am also more confident when something is hard, because she taught me I could figure it out if I kept working. Her caring made me feel like I could do it, and her dedication made sure I actually did.",
  5: "CONCLUSION\n\nMrs. Teske's caring, her dedication, and her impact on me make her one of the most important teachers I have ever had.\n\nThink back to that walk up to her desk. I used to think it was funny that we figured it out as soon as we got there. Now I think she had already taught us how to work through it. We just needed to know she was there.\n\nThe teachers who expect the most from you are usually the ones who care the most. If you have a teacher like that, do not wait to take it seriously. And if you get the chance, thank them. Mine was Mrs. Teske.",
};

(async () => {
  // 1 — Intro
  pres.addSection({ title: "Introduction" });
  let s = pres.addSlide({ masterName: "COVER_LEFT", sectionTitle: "Introduction" });
  s.addText("A TRIBUTE TO", { placeholder: "eyebrow" });
  s.addText("Mrs. Teske", { placeholder: "title" });
  s.addText("7th & 8th Grade Teacher", { placeholder: "subtitle" });
  await polaroid(s, { name: "Teske", cx: 6.2, cy: 2.75, w: 2.3, photoH: 2.45, rot: -3, caption: "Mrs. Teske", hint: ["Mrs. Teske", "(yearbook, school", "website, or Facebook)"] });
  await polaroid(s, { name: "School", cx: 8.4, cy: 3.3, w: 2.2, photoH: 1.55, rot: 4, caption: "St. John's Lutheran", hint: ["St. John's Lutheran", "building or sign"] });
  s.addNotes(NOTES[1]);

  // 2 — Caring
  pres.addSection({ title: "Body" });
  s = pres.addSlide({ masterName: "TOP_TITLE", sectionTitle: "Body" });
  s.addText("Caring", { placeholder: "title" });
  const row = [
    { name: "Class", cx: 2.1, rot: -3, caption: "Our Class", hint: ["Mrs. Teske with", "your class"] },
    { name: "Parties", cx: 5.0, rot: 2, caption: "Holiday Parties", hint: ["A holiday party", "in her class"] },
    { name: "Treats", cx: 7.9, rot: -2, caption: "December Treats", hint: ["December treats or", "her room at Christmas"] },
  ];
  for (const p of row) await polaroid(s, { ...p, cy: 3.3, w: 2.55, photoH: 2.1 });
  s.addNotes(NOTES[2]);

  // 3 — Dedicated
  s = pres.addSlide({ masterName: "SIDE_TITLE", sectionTitle: "Body" });
  s.addText("Dedicated", { placeholder: "title" });
  s.addText("High Expectations", { placeholder: "subtitle" });
  await polaroid(s, { name: "Classroom", cx: 6.85, cy: 2.85, w: 4.7, photoH: 3.35, rot: 2, caption: "Mrs. Teske's Classroom", hint: ["Mrs. Teske teaching", "or at her desk"] });
  s.addNotes(NOTES[3]);

  // 4 — Impact
  s = pres.addSlide({ masterName: "SIDE_TITLE", sectionTitle: "Body" });
  s.addText("Ready for High School", { placeholder: "title" });
  s.addText("Made Me the Student I Am", { placeholder: "subtitle" });
  await polaroid(s, { name: "Graduation", cx: 5.75, cy: 2.85, w: 2.4, photoH: 2.5, rot: -3, caption: "8th Grade Graduation", hint: ["8th grade graduation", "(with her if you can)"] });
  await polaroid(s, { name: "Now", cx: 8.15, cy: 2.75, w: 2.4, photoH: 2.5, rot: 3, caption: "11th Grade", hint: ["You now,", "in 11th grade"] });
  s.addNotes(NOTES[4]);

  // 5 — Conclusion
  pres.addSection({ title: "Conclusion" });
  s = pres.addSlide({ masterName: "COVER_RIGHT", sectionTitle: "Conclusion" });
  s.addText("CARING · DEDICATED", { placeholder: "eyebrow" });
  s.addText("Thank You, Mrs. Teske", { placeholder: "title" });
  await polaroid(s, { name: "Thanks", cx: 3.0, cy: 2.8, w: 2.7, photoH: 2.85, rot: -2, caption: "Mrs. Teske", hint: ["Mrs. Teske", "(or you with her)"] });
  s.addNotes(NOTES[5]);

  await pres.writeFile({ fileName: OUT });
  if (process.env.APPLY_THEME) {
    const { applyTheme } = require(process.env.APPLY_THEME);
    await applyTheme(OUT, THEME);
  }
  console.log("wrote", OUT);
})();
