const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '..', 'index.html');
const destination = path.resolve(__dirname, 'game', 'index.html');
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
console.log(`Copied game to ${destination}`);
