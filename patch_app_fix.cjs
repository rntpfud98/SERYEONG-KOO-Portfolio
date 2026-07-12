const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/          \) : \(\n            \{\/\* Traditional Tab Routers \*\/\}\n          \) : selectedProjectId \? \(\n            \{\/\* Selected Case Study Detail view \*\/\}/, 
`          ) : selectedProjectId ? (
            /* Selected Case Study Detail view */`);

fs.writeFileSync('src/App.tsx', code);
