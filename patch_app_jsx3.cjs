const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Use regex to remove PAGE 2 section
code = code.replace(/              \{\/\* PAGE 2: PROJECTS DIRECTORY \*\/\}[\s\S]*?\{\/\* PAGE 3: ABOUT \*\/\}[\s\S]*?currentPage === 'about'/, `              {/* PAGE 3: ABOUT */}
              {currentPage === 'about'`);

fs.writeFileSync('src/App.tsx', code);
