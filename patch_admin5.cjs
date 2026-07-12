const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add Project to imports
code = code.replace(/import \{ PortfolioData, /, "import { PortfolioData, Project, ");

// Add projects state
code = code.replace(/  const \[archive, setArchive\] = React.useState<ArchiveItem\[\]>\(\[\.\.\.portfolioData\.archive\]\);\n/, 
  "  const [archive, setArchive] = React.useState<ArchiveItem[]>([...portfolioData.archive]);\n  const [projects, setProjects] = React.useState<Project[]>([...portfolioData.projects]);\n  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(projects[0]?.id || null);\n");

// Add sub-tab selection for 'projects'
code = code.replace(/'profile' \| 'resume' \| 'archive' \| 'system'/, "'profile' | 'projects' | 'resume' | 'archive' | 'system'");

// Add the projects button in the nav
const projectsButton = `          <button
            onClick={() => setActiveSubTab('projects')}
            className={\`w-full text-left px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] flex items-center gap-2.5 transition-colors focus:outline-none cursor-pointer \${
              activeSubTab === 'projects'
                ? 'bg-luxury-beige/60 text-luxury-black font-semibold border-l-2 border-luxury-olive'
                : 'text-luxury-gray hover:text-luxury-black hover:bg-luxury-beige/20'
            }\`}
          >
            <Grid size={14} className="text-luxury-olive" />
            <span>02. Case Studies ({projects.length})</span>
          </button>
`;
code = code.replace(/          <button\n            onClick=\{\(\) => setActiveSubTab\('resume'\)\}/, projectsButton + "          <button\n            onClick={() => setActiveSubTab('resume')}");

// Add handleProjectFieldChange and new project functions
const projectManagerFunctions = `
  // Project Manager
  const getSelectedProject = () => projects.find((p) => p.id === editingProjectId);
  const handleProjectFieldChange = (projectId: string, field: keyof Project, val: any) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, [field]: val } : p));
  };
  const addNewProject = () => {
    const newProj: Project = {
      id: \`proj_\${Date.now()}\`,
      title: 'New Project',
      category: 'Branding',
      duration: '2025',
      coverImage: '',
      pdfFile: ''
    };
    setProjects([newProj, ...projects]);
    setEditingProjectId(newProj.id);
  };
  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const remaining = projects.filter(p => p.id !== id);
      setProjects(remaining);
      setEditingProjectId(remaining[0]?.id || null);
    }
  };
  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert('Image size exceeds 2.5MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const key = \`img_\${Date.now()}\`;
        await idbSet(key, base64String);
        handleProjectFieldChange(projectId, 'coverImage', \`idb://\${key}\`);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleProjectPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB. Please choose a smaller PDF.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const key = \`pdf_\${Date.now()}\`;
        await idbSet(key, base64String);
        handleProjectFieldChange(projectId, 'pdfFile', \`idb://\${key}\`);
      };
      reader.readAsDataURL(file);
    }
  };
`;
code = code.replace(/  const handleArchiveImageUpload/, projectManagerFunctions + "  const handleArchiveImageUpload");

// Add projects to updatedData
code = code.replace(/        profile,\n        contact,\n        resume,\n        archive,\n/, "        profile,\n        contact,\n        projects,\n        resume,\n        archive,\n");

// Add projects tab UI
const projectsTabUI = `
          {/* TAB 2: Case Studies (Projects) */}
          {activeSubTab === 'projects' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end border-b border-luxury-black/10 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-luxury-black uppercase tracking-tight">Case Studies</h2>
                  <p className="font-sans text-xs text-luxury-gray mt-1">Manage project portfolios and PDFs.</p>
                </div>
                <button
                  onClick={addNewProject}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-luxury-olive text-luxury-bg text-[10px] uppercase tracking-widest hover:bg-luxury-black transition-colors"
                >
                  <Plus size={12} /> Add Project
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-2">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setEditingProjectId(p.id)}
                      className={\`p-3 border cursor-pointer transition-colors \${
                        editingProjectId === p.id
                          ? 'border-luxury-olive bg-luxury-beige/30'
                          : 'border-luxury-black/10 hover:border-luxury-olive/50'
                      }\`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="truncate pr-2">
                          <h4 className="font-sans text-xs font-semibold text-luxury-black truncate">{p.title || 'Untitled'}</h4>
                          <span className="font-mono text-[9px] text-luxury-gray">{p.category}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                          className="text-luxury-gray hover:text-red-600 transition-colors shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-8 text-luxury-gray font-mono text-[10px] border border-dashed border-luxury-black/10">
                      No case studies yet.
                    </div>
                  )}
                </div>
                <div className="md:col-span-8">
                  {getSelectedProject() ? (() => {
                    const selectedProj = getSelectedProject()!;
                    return (
                      <div className="space-y-8 bg-white p-6 border border-luxury-black/5">
                        <div className="space-y-4">
                          <h3 className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold border-b border-luxury-black/5 pb-2">
                            Basic Info
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Full Project Title</label>
                              <input
                                type="text"
                                value={selectedProj.title}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'title', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Category</label>
                              <input
                                type="text"
                                value={selectedProj.category}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'category', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Project Duration</label>
                              <input
                                type="text"
                                value={selectedProj.duration}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'duration', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-luxury-black/5">
                          <h3 className="font-mono text-[10px] uppercase tracking-widest text-luxury-olive font-bold pb-2">
                            Cover Image & PDF
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Cover Image (Thumbnail)</label>
                              <div className="flex items-start gap-4">
                                <div className="w-24 h-16 bg-luxury-beige/20 border border-luxury-black/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                                  {selectedProj.coverImage ? (
                                    <IDBImage src={selectedProj.coverImage} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="font-sans text-[10px] text-luxury-gray/60">No Image</span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                  <label className="cursor-pointer text-[10px] font-mono text-luxury-olive hover:text-luxury-black border border-luxury-olive/30 hover:border-luxury-black px-2 py-1 text-center transition-colors">
                                    <span>Upload Image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleProjectImageUpload(e, selectedProj.id)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Project PDF Document</label>
                              <div className="flex flex-col gap-2">
                                <label className="cursor-pointer text-[10px] font-mono text-luxury-bg bg-luxury-black hover:bg-luxury-olive px-3 py-2 text-center transition-colors">
                                  <span>{selectedProj.pdfFile ? 'Replace PDF File' : 'Upload PDF File'}</span>
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => handleProjectPdfUpload(e, selectedProj.id)}
                                    className="hidden"
                                  />
                                </label>
                                {selectedProj.pdfFile && (
                                  <div className="text-[10px] font-mono text-green-700 flex items-center gap-1">
                                    <CheckCircle size={10} /> PDF Uploaded
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })() : (
                    <div className="h-full flex items-center justify-center text-luxury-gray font-mono text-xs border border-dashed border-luxury-black/10 bg-white min-h-[300px]">
                      Select a project to edit details
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
`;
code = code.replace(/          \{\/\* TAB 3: Resume \(CV\) Editor \*\/\}/, projectsTabUI + "\n          {/* TAB 3: Resume (CV) Editor */}");

fs.writeFileSync('src/components/AdminPanel.tsx', code);
