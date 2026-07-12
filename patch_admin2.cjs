const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(/\{ profile, contact, projects, resume, archive \}/, '{ profile, contact, resume, archive }');
code = code.replace(/parsed\.projects && /, '');
code = code.replace(/, projects, /, ', ');
code = code.replace(/            <button\n              onClick=\{\(\) => setActiveSubTab\('projects'\)\}[\s\S]*?Projects\n            <\/button>\n/, '');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
