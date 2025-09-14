// convert-font-to-base64.js
const fs = require('fs');
const path = require('path');


const ttfPath = path.resolve(__dirname, 'Amiri-Regular.ttf');
const outPath = path.resolve(__dirname, 'Amiri-Regular-normal.js');

const buf = fs.readFileSync(ttfPath);
const base64 = buf.toString('base64');

const content = `const fontAmiri = "${base64}";\nexport default fontAmiri;\n`;

fs.writeFileSync(outPath, content);
console.log('✅ Done! Created', outPath);
