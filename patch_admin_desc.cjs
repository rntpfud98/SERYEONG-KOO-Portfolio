const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(/      duration: '2025',\n      coverImage: '',/, "      duration: '2025',\n      description: 'Project description',\n      coverImage: '',");

const descriptionInput = `                            <div className="space-y-1 sm:col-span-2">
                              <label className="font-mono text-[9px] uppercase tracking-widest text-luxury-gray">Short Description</label>
                              <textarea
                                value={selectedProj.description || ''}
                                onChange={(e) => handleProjectFieldChange(selectedProj.id, 'description', e.target.value)}
                                className="w-full bg-transparent border-b border-luxury-black/20 pb-1 font-sans text-sm focus:border-luxury-olive focus:outline-none transition-colors resize-y min-h-[40px]"
                                placeholder="Brief overview of the project..."
                              />
                            </div>
`;

code = code.replace(/                          <\/div>\n                        <\/div>\n\n                        <div className="space-y-4 pt-4 border-t border-luxury-black\/5">/, descriptionInput + "                          </div>\n                        </div>\n\n                        <div className=\"space-y-4 pt-4 border-t border-luxury-black/5\">");

// Rename "Case Studies" to "Projects"
code = code.replace(/02\. Case Studies/g, "02. Projects");
code = code.replace(/\{\/\* TAB 2: Case Studies \(Projects\) \*\/\}/g, "{/* TAB 2: Projects */}");
code = code.replace(/<h2 className="font-display text-2xl text-luxury-black uppercase tracking-tight">Case Studies<\/h2>/g, "<h2 className=\"font-display text-2xl text-luxury-black uppercase tracking-tight\">Projects</h2>");
code = code.replace(/No case studies yet\./g, "No projects yet.");

fs.writeFileSync('src/components/AdminPanel.tsx', code);
