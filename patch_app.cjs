const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const migrationCode = `
  React.useEffect(() => {
    let migrated = false;
    const migrateData = async () => {
      const newData = JSON.parse(JSON.stringify(portfolioData));
      
      const processString = async (str) => {
        if (str && str.startsWith('data:image/')) {
          const key = \`img_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
          await idbSet(key, str);
          migrated = true;
          return \`idb://\${key}\`;
        }
        return str;
      };

      const traverse = async (obj) => {
        if (!obj) return;
        for (const k in obj) {
          if (typeof obj[k] === 'string') {
            obj[k] = await processString(obj[k]);
          } else if (typeof obj[k] === 'object') {
            await traverse(obj[k]);
          }
        }
      };

      await traverse(newData);

      if (migrated) {
        setPortfolioData(newData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
        console.log('Migrated base64 images to IndexedDB');
      }
    };

    migrateData();
  }, [portfolioData]);
`;

code = code.replace("const [passwordError, setPasswordError] = React.useState<string>('');", "const [passwordError, setPasswordError] = React.useState<string>('');\n" + migrationCode);
fs.writeFileSync('src/App.tsx', code);
