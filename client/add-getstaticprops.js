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
   const content = fs.readFileSync(file, 'utf8');

   // Zaten getStaticProps var mı kontrol et
   if (content.includes('getStaticProps')) {
      continue;
   }

   // Dosyanın sonunda "}" ile bitip bitmediğini kontrol et
   const trimmed = content.trim();
   if (!trimmed.endsWith('}')) {
      continue;
   }

   // Sonuncu "}" karakterinden önce getStaticProps ekle
   const lastClosingBraceIndex = content.lastIndexOf('}');
   if (lastClosingBraceIndex === -1) {
      continue;
   }

   const newContent = content.slice(0, lastClosingBraceIndex) +
                     getStaticPropsCode +
                     '\n' +
                     content.slice(lastClosingBraceIndex);

   fs.writeFileSync(file, newContent, 'utf8');
   console.log(`Added getStaticProps to: ${path.relative(pagesDir, file)}`);
}

console.log('Done!');
