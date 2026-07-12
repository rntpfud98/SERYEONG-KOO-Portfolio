const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

code = code.replace(/  setSelectedProjectId: \(id: string \| null\) => void;\n/, '');
code = code.replace(/  setSelectedProjectId,\n/, '');
code = code.replace(/    setSelectedProjectId\(null\);\n/, '');
code = code.replace(/              <li>\n                <button onClick=\{\(\) => handlePageClick\('projects'\)\} className="hover:text-luxury-black transition-colors focus:outline-none">\n                  Case Studies\n                <\/button>\n              <\/li>\n/, '');

fs.writeFileSync('src/components/Footer.tsx', code);
