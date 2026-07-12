const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/export interface EducationItem \{\n  degree: string;\n  school: string;\n  duration: string;\n  description: string;\n  gpa\?: string;\n  details\?: string;\n\}/, 
"export interface EducationItem {\n  degree: string;\n  school: string;\n  duration: string;\n  gpa?: string;\n  details?: string;\n}");

code = code.replace(/export interface ExperienceItem \{\n  role: string;\n  company: string;\n  duration: string;\n  description: string;\n  location: string;\n  details: string\[\];\n\}/,
"export interface ExperienceItem {\n  role: string;\n  company: string;\n  duration: string;\n  location: string;\n  details: string[];\n}");

code = code.replace(/export interface LeadershipItem \{\n  role: string;\n  organization: string;\n  duration: string;\n  description: string;\n  details: string;\n\}/,
"export interface LeadershipItem {\n  role: string;\n  organization: string;\n  duration: string;\n  details: string;\n}");

fs.writeFileSync('src/types.ts', code);
