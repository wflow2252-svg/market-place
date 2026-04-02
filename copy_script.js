const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend');
const destDir = path.join(__dirname, 'marketplace', 'frontend');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  const basename = path.basename(src);
  if (basename === 'node_modules' || basename === 'dist' || basename === '.git' || basename === '.vercel') return;

  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(srcDir, destDir);
console.log('Copy successful');
