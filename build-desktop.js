const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building Next.js Standalone...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Copying static assets to standalone directory...');
const standaloneDir = path.join(__dirname, '.next', 'standalone');

fs.copySync(path.join(__dirname, 'public'), path.join(standaloneDir, 'public'));
fs.copySync(path.join(__dirname, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));
fs.copySync(path.join(__dirname, 'main.js'), path.join(standaloneDir, 'main.js'));
fs.copySync(path.join(__dirname, 'package.json'), path.join(standaloneDir, 'package.json'));

console.log('Ready for Electron Builder!');
