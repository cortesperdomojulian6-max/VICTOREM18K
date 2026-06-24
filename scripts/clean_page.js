const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Use regex to remove CraftsmanshipSection and ProcessSection
// function CraftsmanshipSection() { ... }
const craftsmanshipRegex = /function CraftsmanshipSection\(\) \{[\s\S]*?\n\}\n/g;
content = content.replace(craftsmanshipRegex, '');

const processRegex = /function ProcessSection\(\) \{[\s\S]*?\n\}\n/g;
content = content.replace(processRegex, '');

fs.writeFileSync(pagePath, content);
console.log('Removed unused sections from page.tsx');
