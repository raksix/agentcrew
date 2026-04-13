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

const getStaticPropsPattern = `
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

   // _app.tsx ve _document.tsx'yi atla
   if (filename === '_app.tsx' || filename === '_document.tsx') {
      continue;
   }

   let content = fs.readFileSync(file, 'utf8');

   // Eğer getStaticProps yoksa, ekle
   if (!content.includes('getStaticProps')) {
      // Dosyanın sonunda component'in kapanışını bul
      const lines = content.split('\n');

      // Son birkaç satırı kontrol et
      let componentEndIndex = -1;
      let braceCount = 0;

      for (let i = lines.length - 1; i >= 0; i--) {
         const line = lines[i].trim();

         // Boş satırları atla
         if (line === '') continue;

         // "});" deseni - component'in sonu
         if (line === '});' || line === '}' || line === '})') {
            componentEndIndex = i;
            break;
         }

         // "// Disable" yorumu - getStaticProps zaten eklenmiş
         if (line.includes('// Disable')) {
            componentEndIndex = -1;
            break;
         }
      }

      if (componentEndIndex === -1) {
         // Desen bulunamadı, sonuna ekle
         content = content.trimEnd() + '\n' + getStaticPropsPattern + '\n';
         fs.writeFileSync(file, content, 'utf8');
         console.log(`Added getStaticProps to end: ${path.relative(pagesDir, file)}`);
      } else {
         // Component'in sonrasına ekle
         lines.splice(componentEndIndex + 1, 0, '', ...getStaticPropsPattern.trim().split('\n'));
         content = lines.join('\n');
         fs.writeFileSync(file, content, 'utf8');
         console.log(`Added getStaticProps after component: ${path.relative(pagesDir, file)}`);
      }
   }
}

console.log('Done!');
