// Renders final-hour-plan.html to a letter-size PDF.
// Usage: node render.js
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'final-hour-plan.html'));
  await page.pdf({
    path: path.join(__dirname, 'Walnut_Table_Final_Hour_Plan.pdf'),
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
  });
  await browser.close();
})();
