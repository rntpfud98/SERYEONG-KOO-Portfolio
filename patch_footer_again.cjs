const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

code = code.replace(/  setIsAdminActive: \(active: boolean\) => void;\n  isAdminActive: boolean;\n\}/, "  setIsAdminActive: (active: boolean) => void;\n  setSelectedProjectId: (id: string | null) => void;\n  isAdminActive: boolean;\n}");
code = code.replace(/  setIsAdminActive,\n  isAdminActive,\n\}: FooterProps/, "  setIsAdminActive,\n  setSelectedProjectId,\n  isAdminActive,\n}: FooterProps");
code = code.replace(/    setIsAdminActive\(false\);\n    setCurrentPage\(pageId\);/, "    setIsAdminActive(false);\n    setSelectedProjectId(null);\n    setCurrentPage(pageId);");

const caseStudiesLink = `
              <li>
                <button onClick={() => handlePageClick('projects')} className="hover:text-luxury-black transition-colors focus:outline-none">
                  Case Studies
                </button>
              </li>`;
code = code.replace(/              <li>\n                <button onClick=\{\(\) => handlePageClick\('about'\)\}/, caseStudiesLink + "\n              <li>\n                <button onClick={() => handlePageClick('about')}");

fs.writeFileSync('src/components/Footer.tsx', code);
