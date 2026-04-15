const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');

// Dinamik sayfaları bul
const dynamicPages = execSync('find src/pages -name "*\\[*\\]*.tsx" -type f', { cwd: __dirname })
   .toString()
   .trim()
   .split('\n')
   .filter(f => f);

const getStaticPathsCode = `
// Also required for dynamic SSG pages
export function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking',
   };
}
`;

for (const file of dynamicPages) {
   const fullPath = path.join(__dirname, file);

   let content = fs.readFileSync(fullPath, 'utf8');

   // Zaten getStaticPaths var mı kontrol et
   if (content.includes('getStaticPaths')) {
      console.log(`Skipped (already has getStaticPaths): ${file}`);
      continue;
   }

   // getStaticProps'tan önce getStaticPaths ekle
   const getStaticPropsIndex = content.indexOf('export function getStaticProps()');

   if (getStaticPropsIndex !== -1) {
      const newContent = content.slice(0, getStaticPropsIndex) +
                        getStaticPathsCode +
                        '\n' +
                        content.slice(getStaticPropsIndex);

      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`Added getStaticPaths to: ${file}`);
   }
}

console.log('Done!');
