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

const getStaticPathsCode = `
// Also required for dynamic SSG pages
export function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking',
   };
}
`;

const files = findTsxFiles(pagesDir);

for (const file of files) {
   const filename = path.basename(file);

   // Sadece dinamik sayfalar (klasör adı [something] ile başlayanlar)
   const relativePath = path.relative(pagesDir, file);
   const isDynamicPage = relativePath.includes('/[') && relativePath.includes(']/');

   if (!isDynamicPage) {
      continue;
   }

   let content = fs.readFileSync(file, 'utf8');

   // Zaten getStaticPaths var mı kontrol et
   if (content.includes('getStaticPaths')) {
      continue;
   }

   // getStaticProps'tan önce getStaticPaths ekle
   const getStaticPropsIndex = content.indexOf('export function getStaticProps()');

   if (getStaticPropsIndex !== -1) {
      const newContent = content.slice(0, getStaticPropsIndex) +
                        getStaticPathsCode +
                        '\n' +
                        content.slice(getStaticPropsIndex);

      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Added getStaticPaths to: ${relativePath}`);
   }
}

console.log('Done!');
