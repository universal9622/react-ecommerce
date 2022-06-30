const fs = require('fs');
const path = require('path');

function getFileRecursive(dir, files) {
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFileRecursive(filePath, files);
    } else {
      files.push(filePath);
    }
  });
}

let files = [];

getFileRecursive(path.resolve(__dirname, './bin/serve'), files);

files.forEach((file) => {
  const source = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
  const result = source.replace(/\.\.\/src/g, '../dist');
  fs.writeFileSync(file, result, 'utf8');
});

fs.copyFile(path.resolve(__dirname, '../../README.md'), path.resolve(__dirname, './README.md'), (err) => {
  if (err) throw err;
});
