const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Remove from types
code = code.replace(/ Project,/, '');
code = code.replace(/ CompetitorBrand, SurveyMetric /, ' ');

// 2. Remove states
code = code.replace(/  const \[projects, setProjects\] = React.useState<Project\[\]>\(\[\.\.\.portfolioData\.projects\]\);\n/g, '');
code = code.replace(/  const \[editingProjectId, setEditingProjectId\] = React.useState<string \| null>\(projects\[0\]\?\.id \|\| null\);\n/g, '');

// 3. Remove from subtabs
code = code.replace(/'profile' \| 'projects' \| 'resume' \| 'archive' \| 'system'/, "'profile' | 'resume' | 'archive' | 'system'");
code = code.replace(/            <button\n              onClick=\{\(\) => setActiveSubTab\('projects'\)\}[\s\S]*?Projects\n            <\/button>\n/g, '');

// 4. Remove project tab content
code = code.replace(/          \{\/\* TAB 2: Case Studies \(Projects\) \*\/\}[\s\S]*?\{\/\* TAB 3: RESUME \*\/}/g, '          {/* TAB 3: RESUME */}');

// 5. Remove project manager functions
code = code.replace(/  \/\/ Project manager[\s\S]*?\/\/ Project sub-structures[\s\S]*?  \/\/ Add\/Remove nested project structures[\s\S]*?  \/\/ ARCHIVE MANAGER/g, '  // ARCHIVE MANAGER');

// 6. Remove handleProjectImageUpload
code = code.replace(/  const handleProjectImageUpload = async \([\s\S]*?  \};\n\n  const handleArchiveImageUpload/g, '  const handleArchiveImageUpload');

// 7. Remove projects from updatedData
code = code.replace(/        projects,\n/g, '');

// 8. Remove pdf parsing for projects (the entire handlePdfUpload and isParsingPdf)
code = code.replace(/  const \[isParsingPdf, setIsParsingPdf\] = React.useState\(false\);\n  const \[pdfUploadError, setPdfUploadError\] = React\.useState<string \| null>\(null\);\n\n  const handlePdfUpload = async[\s\S]*?  \};\n\n  const handleImageUpload/g, '  const handleImageUpload');

// 9. Remove selectedProj
code = code.replace(/  const selectedProj = getSelectedProject\(\);\n/g, '');

// 10. Remove from handleImportJSON
code = code.replace(/            setProjects\(parsed\.projects\);\n/g, '');
code = code.replace(/            if \(parsed\.projects\[0\]\) setEditingProjectId\(parsed\.projects\[0\]\.id\);\n/g, '');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
