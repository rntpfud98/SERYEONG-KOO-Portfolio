const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(/          <button\n            onClick=\{\(\) => setActiveSubTab\('projects'\)\}[\s\S]*?Projects \(\{projects\.length\}\)<\/span>\n          <\/button>\n/g, '');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
