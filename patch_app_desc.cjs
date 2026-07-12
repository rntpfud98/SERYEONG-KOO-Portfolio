const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const homeCardOld = `                            <div className="space-y-1">
                              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-luxury-olive font-semibold block">
                                {proj.category} &mdash; {proj.duration}
                              </span>
                              <h3 className="font-display text-xl sm:text-2xl text-luxury-black font-medium leading-tight group-hover:text-luxury-olive transition-colors">
                                {proj.title}
                              </h3>
                            </div>
                            <ChevronRight size={16} className="text-luxury-gray group-hover:text-luxury-black transition-colors mt-1.5 flex-shrink-0" />`;
const homeCardNew = `                            <div className="space-y-2 w-full pr-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-display text-xl sm:text-2xl text-luxury-black font-medium leading-tight group-hover:text-luxury-olive transition-colors">
                                  {proj.title}
                                </h3>
                              </div>
                              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-luxury-olive font-semibold block">
                                {proj.category} &mdash; {proj.duration}
                              </div>
                              {proj.description && (
                                <p className="font-sans text-sm text-luxury-gray line-clamp-2 leading-relaxed">
                                  {proj.description}
                                </p>
                              )}
                            </div>
                            <ChevronRight size={16} className="text-luxury-gray group-hover:text-luxury-black transition-colors mt-1.5 flex-shrink-0" />`;

code = code.replace(homeCardOld, homeCardNew);

const projectCardOld = `                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive font-semibold">
                                {proj.category}
                              </span>
                              <span className="font-mono text-[9px] text-luxury-gray">{proj.duration}</span>
                            </div>
                            <h3 className="font-display text-lg font-medium text-luxury-black leading-snug group-hover:text-luxury-olive transition-colors">
                              {proj.title}
                            </h3>
                          </div>`;
const projectCardNew = `                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="font-display text-lg font-medium text-luxury-black leading-snug group-hover:text-luxury-olive transition-colors">
                                {proj.title}
                              </h3>
                              <span className="font-mono text-[9px] text-luxury-gray">{proj.duration}</span>
                            </div>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-olive font-semibold block">
                              {proj.category}
                            </span>
                            {proj.description && (
                              <p className="font-sans text-xs text-luxury-gray line-clamp-3 leading-relaxed">
                                {proj.description}
                              </p>
                            )}
                          </div>`;

code = code.replace(projectCardOld, projectCardNew);
code = code.replace(/Strategic Case Studies/g, "Projects");

fs.writeFileSync('src/App.tsx', code);
