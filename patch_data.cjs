const fs = require('fs');
let code = fs.readFileSync('src/data/defaultData.ts', 'utf8');

code = code.replace(/  profile: \{/, "  projects: [],\n  profile: {");

fs.writeFileSync('src/data/defaultData.ts', code);
