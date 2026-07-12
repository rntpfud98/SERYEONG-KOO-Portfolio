const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const \{ profile, resume, archive, contact \} = portfolioData;/, "const { profile, projects, resume, archive, contact } = portfolioData;");

fs.writeFileSync('src/App.tsx', code);
