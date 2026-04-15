const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');

function findTsxFiles(dir) {
   const files = [];
   const items = fs.readdirSync(dir);

   for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
         files.push(...findTsxFiles(fullPath));
      } else if (item.endsWith('.tsx')) {
         files.push(fullPath);
      }
   }

   return files;
}

const getStaticPropsCode = `
// Disable static prerendering - this page requires client-side only rendering
export function getStaticProps() {
   return {
      props: {},
   };
}
`;

const files = findTsxFiles(pagesDir);

for (const file of files) {
   const filename = path.basename(file);

   // _app.tsx ve _document.tsx'yi atla - bunlar özel dosyalardır
   if (filename === '_app.tsx' || filename === '_document.tsx' || filename.startsWith('_')) {
      continue;
   }

   let content = fs.readFileSync(file, 'utf8');

   // Zaten getStaticProps var mı kontrol et
   if (content.includes('getStaticProps')) {
      continue;
   }

   // Dosyanın son satırlarını kontrol et
   const trimmed = content.trim();

   // Eğer dosya "}" ile bitiyorsa, getStaticProps ekle
   if (trimmed.endsWith('}')) {
      // Son newline'ı koru
      const hasTrailingNewline = content.endsWith('\n');
      const newContent = content.trimEnd() + getStaticPropsCode + '\n';

      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Added getStaticProps to: ${path.relative(pagesDir, file)}`);
   }
}

console.log('Done!');
