const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');
code = code.replace(/02 Case Studies/, "02 Projects");
fs.writeFileSync('src/components/Header.tsx', code);

code = fs.readFileSync('src/components/Footer.tsx', 'utf8');
code = code.replace(/Case Studies/, "Projects");
fs.writeFileSync('src/components/Footer.tsx', code);
