const fs = require('fs');
let code = fs.readFileSync('src/components/IDBImage.tsx', 'utf8');
code = code.replace(/import { ImgHTMLAttributes } from 'react';\ninterface IDBImageProps extends ImgHTMLAttributes<HTMLImageElement> {\n  src\?: string;\n}/, "type IDBImageProps = React.ComponentProps<'img'> & { src?: string };");
fs.writeFileSync('src/components/IDBImage.tsx', code);
