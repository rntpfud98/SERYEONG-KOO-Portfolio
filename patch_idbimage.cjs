const fs = require('fs');
let code = fs.readFileSync('src/components/IDBImage.tsx', 'utf8');
code = code.replace("interface IDBImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {", "import { ImgHTMLAttributes } from 'react';\ninterface IDBImageProps extends ImgHTMLAttributes<HTMLImageElement> {");
fs.writeFileSync('src/components/IDBImage.tsx', code);
