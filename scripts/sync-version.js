const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf-8'));

const files = [
  'backend/package.json',
  'frontend/package.json',
];

files.forEach((file) => {
  const filePath = path.join(root, file);
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (pkg.version !== version) {
    pkg.version = version;
    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`${file} → ${version}`);
  } else {
    console.log(`${file} → déjà à jour (${version})`);
  }
});

console.log(`\napp.config.ts lit version.json dynamiquement — OK`);
console.log(`Version synchronisée : ${version}`);
