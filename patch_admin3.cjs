const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(/  const handleGlobalSave = \(\) => {/g, `  const [showSuccess, setShowSuccess] = React.useState(false);
  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  const handleGlobalSave = () => {`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
