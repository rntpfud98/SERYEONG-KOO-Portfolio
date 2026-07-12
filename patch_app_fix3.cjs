const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const \{ profile, contact, resume, archive \} = portfolioData;/, "const { profile, contact, projects, resume, archive } = portfolioData;");

fs.writeFileSync('src/App.tsx', code);
