const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Use regex to remove Selected Works section
code = code.replace(/                  \{\/\* Selected Works Swiss Grid \*\/\}[\s\S]*?<\/section>/, '');

fs.writeFileSync('src/App.tsx', code);
