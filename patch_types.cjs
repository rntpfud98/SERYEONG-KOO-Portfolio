const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const projectInterface = `export interface Project {
  id: string;
  title: string;
  category: string;
  duration: string;
  coverImage: string;
  pdfFile: string;
}

`;

code = projectInterface + code;
code = code.replace(/  profile: PersonalProfile;\n/, "  profile: PersonalProfile;\n  projects: Project[];\n");

fs.writeFileSync('src/types.ts', code);
