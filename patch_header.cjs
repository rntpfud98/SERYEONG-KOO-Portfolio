const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(/  setSelectedProjectId: \(id: string \| null\) => void;\n/, '');
code = code.replace(/  setSelectedProjectId,\n/, '');
code = code.replace(/    setSelectedProjectId\(null\);\n/, '');
code = code.replace(/    \{ id: 'projects', label: '02 Case Studies' \},\n/, '');

fs.writeFileSync('src/components/Header.tsx', code);
