const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(/  setIsAdminActive: \(active: boolean\) => void;\n\}/, "  setIsAdminActive: (active: boolean) => void;\n  setSelectedProjectId: (id: string | null) => void;\n}");
code = code.replace(/  setIsAdminActive,\n\}: HeaderProps/, "  setIsAdminActive,\n  setSelectedProjectId,\n}: HeaderProps");
code = code.replace(/    setIsAdminActive\(false\);\n    setCurrentPage\(pageId\);/, "    setIsAdminActive(false);\n    setSelectedProjectId(null);\n    setCurrentPage(pageId);");
code = code.replace(/    \{ id: 'home', label: '01 Home' \},\n/, "    { id: 'home', label: '01 Home' },\n    { id: 'projects', label: '02 Case Studies' },\n");

fs.writeFileSync('src/components/Header.tsx', code);
