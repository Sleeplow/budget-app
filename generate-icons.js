const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const svgContent = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8');

const html = (size) => `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${size}px; height: ${size}px; overflow: hidden; background: #1D9E75; }
  svg { width: ${size}px; height: ${size}px; display: block; }
</style>
</head>
<body>${svgContent}</body>
</html>`;

const sizes = [
  { name: 'favicon-16x16.png',   size: 16  },
  { name: 'favicon-32x32.png',   size: 32  },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192x192.png',    size: 192 },
  { name: 'icon-512x512.png',    size: 512 },
];

(async () => {
  const browser = await chromium.launch();

  for (const { name, size } of sizes) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(html(size), { waitUntil: 'load' });
    await page.screenshot({
      path: path.join(__dirname, name),
      clip: { x: 0, y: 0, width: size, height: size },
      omitBackground: false,
    });
    await page.close();
    console.log(`✓ ${name} (${size}×${size})`);
  }

  await browser.close();
  console.log('Done.');
})();
