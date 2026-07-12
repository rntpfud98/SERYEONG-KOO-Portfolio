const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove CaseStudyView import
code = code.replace(/import CaseStudyView from '.\/components\/CaseStudyView';\n/, '');

// 2. Remove Project from types import
code = code.replace(/Project, /, '');

// 3. Remove selectedProjectId state
code = code.replace(/  const \[selectedProjectId, setSelectedProjectId\] = React.useState<string \| null>\(null\);\n/, '');

// 4. Remove setSelectedProjectId(null); from handleResetToDefault
code = code.replace(/    setSelectedProjectId\(null\);\n/, '');

// 5. Remove handleProjectClick
code = code.replace(/  const handleProjectClick = \(projectId: string\) => {\n    setSelectedProjectId\(projectId\);\n    window.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\n  };\n\n/, '');

// 6. Remove projects from destructuring
code = code.replace(/const \{ profile, projects, resume, archive, contact \} = portfolioData;/, 'const { profile, resume, archive, contact } = portfolioData;');

// 7. Remove filteredProjects and featuredProjects
code = code.replace(/  \/\/ Filter project grid\n  const filteredProjects = projects\.filter\(\(proj\) => \{\n    if \(activeFilter === 'All'\) return true;\n    return proj\.category\.toLowerCase\(\) === activeFilter\.toLowerCase\(\);\n  \}\);\n\n  \/\/ Featured projects for Hero list\n  const featuredProjects = projects\.filter\(\(p\) => p\.isFeatured\);\n\n/, '');

fs.writeFileSync('src/App.tsx', code);
