const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `          ) : (
            /* Traditional Tab Routers */
          ) : selectedProjectId ? (
            /* Selected Case Study Detail view */`;
const newStr = `          ) : selectedProjectId ? (
            /* Selected Case Study Detail view */`;

code = code.replace(oldStr, newStr);

fs.writeFileSync('src/App.tsx', code);
