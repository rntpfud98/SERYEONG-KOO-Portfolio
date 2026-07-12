const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const strToRemove = `          ) : selectedProjectId ? (
            /* Selected Case Study Detail view */
            <motion.div
              key={\`casestudy-\${selectedProjectId}\`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            >
              <CaseStudyView
                project={projects.find((p) => p.id === selectedProjectId)!}
                onBack={() => setSelectedProjectId(null)}
              />
            </motion.div>`;

code = code.replace(strToRemove, '');
fs.writeFileSync('src/App.tsx', code);
