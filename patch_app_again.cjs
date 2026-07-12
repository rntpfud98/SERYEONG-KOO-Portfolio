const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
code = code.replace(/import IDBImage from "\.\/components\/IDBImage";/, "import IDBImage from \"./components/IDBImage\";\nimport ProjectPDFViewer from \"./components/ProjectPDFViewer\";");

// State
code = code.replace(/  const \[currentPage, setCurrentPage\] = React\.useState<string>\('home'\);\n/, 
  "  const [currentPage, setCurrentPage] = React.useState<string>('home');\n  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);\n  const [activeFilter, setActiveFilter] = React.useState<string>('All');\n");

// handleProjectClick
code = code.replace(/  const handleResetToDefault = \(\) => {/, 
  `  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetToDefault = () => {`);

code = code.replace(/    setCurrentPage\('home'\);\n/, "    setCurrentPage('home');\n    setSelectedProjectId(null);\n");

// variables
code = code.replace(/const \{ profile, contact, resume, archive \} = portfolioData;/, 
  "const { profile, contact, projects, resume, archive } = portfolioData;");

// filtering
code = code.replace(/  return \(\n    <div className="min-h-screen/, 
  `  // Filter project grid
  const filteredProjects = projects.filter((proj) => {
    if (activeFilter === 'All') return true;
    return proj.category.toLowerCase() === activeFilter.toLowerCase();
  });

  // Featured projects for Hero list
  const featuredProjects = projects.slice(0, 4);

  return (
    <div className="min-h-screen`);

// Header
code = code.replace(/        isAdminActive=\{isAdminActive\}\n        setIsAdminActive=\{handleSetIsAdminActive\}\n      \/>/, 
  "        isAdminActive={isAdminActive}\n        setIsAdminActive={handleSetIsAdminActive}\n        setSelectedProjectId={setSelectedProjectId}\n      />");

// Footer
code = code.replace(/        setCurrentPage=\{setCurrentPage\}\n        setIsAdminActive=\{handleSetIsAdminActive\}\n        isAdminActive=\{isAdminActive\}\n      \/>/, 
  "        setCurrentPage={setCurrentPage}\n        setIsAdminActive={handleSetIsAdminActive}\n        setSelectedProjectId={setSelectedProjectId}\n        isAdminActive={isAdminActive}\n      />");

// PDF Viewer Route
code = code.replace(/            <motion.div\n              key=\{currentPage\}\n              initial=\{\{ opacity: 0, y: 10 \}\}/, 
  `          ) : selectedProjectId ? (
            /* Selected Case Study Detail view */
            <motion.div
              key={\`casestudy-\${selectedProjectId}\`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            >
              <ProjectPDFViewer
                project={projects.find((p) => p.id === selectedProjectId)!}
                onBack={() => setSelectedProjectId(null)}
              />
            </motion.div>
          ) : (
            /* Traditional Tab Routers */
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}`);

// Add Home page Projects section
const homeProjectsUI = `
                  {/* Selected Works Swiss Grid */}
                  <section className="max-w-7xl mx-auto px-6 sm:px-12">
                    <div className="border-b border-luxury-black/10 pb-4 mb-12 flex justify-between items-end">
                      <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-luxury-black uppercase">
                        Selected Works
                      </h2>
                      <button
                        onClick={() => setCurrentPage('projects')}
                        className="font-sans text-[10px] uppercase tracking-[0.25em] text-luxury-olive hover:text-luxury-black transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
                      >
                        <span>View All Projects</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                      {featuredProjects.map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => handleProjectClick(proj.id)}
                          className="group cursor-pointer space-y-4"
                        >
                          <div className="w-full aspect-[4/3] overflow-hidden border border-luxury-black/5 relative bg-luxury-beige/30">
                            <IDBImage
                              src={proj.coverImage}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0 grayscale-[25%]"
                            />
                            <div className="absolute top-4 right-4 bg-luxury-black text-luxury-bg text-[9px] uppercase tracking-widest px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              View Project
                            </div>
                          </div>

                          <div className="flex justify-between items-start pt-1">
                            <div className="space-y-1">
                              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-luxury-olive font-semibold block">
                                {proj.category} &mdash; {proj.duration}
                              </span>
                              <h3 className="font-display text-xl sm:text-2xl text-luxury-black font-medium leading-tight group-hover:text-luxury-olive transition-colors">
                                {proj.title}
                              </h3>
                            </div>
                            <ChevronRight size={16} className="text-luxury-gray group-hover:text-luxury-black transition-colors mt-1.5 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
`;

code = code.replace(/                  \{\/\* Clean, Humble One Line Quote Callout \*\/\}/, homeProjectsUI + "\n                  {/* Clean, Humble One Line Quote Callout */}");


// Add Projects page UI
const projectsPageUI = `
              {/* PAGE 2: PROJECTS DIRECTORY */}
              {currentPage === 'projects' && (
                <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 space-y-16">
                  {/* Category Filter and Title */}
                  <div className="border-b border-luxury-black/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-luxury-olive font-semibold block mb-1">
                        Professional Portfolios
                      </span>
                      <h1 className="font-display text-4xl sm:text-5xl text-luxury-black font-medium tracking-tight uppercase">
                        Strategic Case Studies
                      </h1>
                    </div>

                    {/* Minimalist Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Branding', 'Marketing', 'Retail', 'Research', 'Exhibition'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={\`px-4 py-1.5 font-sans text-xs uppercase tracking-[0.15em] transition-all cursor-pointer focus:outline-none \${
                            activeFilter === filter
                              ? 'bg-luxury-black text-luxury-bg font-semibold'
                              : 'text-luxury-gray hover:text-luxury-black hover:bg-luxury-beige'
                          }\`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Projects Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                      {filteredProjects.map((proj) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.4 }}
                          key={proj.id}
                          onClick={() => handleProjectClick(proj.id)}
                          className="group cursor-pointer space-y-4"
                        >
                          <div className="w-full aspect-[4/3] overflow-hidden border border-luxury-black/5 relative bg-luxury-beige/30">
                            <IDBImage
                              src={proj.coverImage}
                              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-luxury-black/5 group-hover:bg-transparent transition-colors" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive font-semibold">
                                {proj.category}
                              </span>
                              <span className="font-mono text-[9px] text-luxury-gray">{proj.duration}</span>
                            </div>
                            <h3 className="font-display text-lg font-medium text-luxury-black leading-snug group-hover:text-luxury-olive transition-colors">
                              {proj.title}
                            </h3>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
`;

code = code.replace(/              \{\/\* PAGE 3: ABOUT \*\/\}/, projectsPageUI + "\n              {/* PAGE 3: ABOUT */}");


fs.writeFileSync('src/App.tsx', code);
