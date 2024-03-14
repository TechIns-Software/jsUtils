// Created using blackbox.ai
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

const srcPath = path.resolve(__dirname, 'src');
const srcFiles = fs.readdirSync(srcPath);

const exportsObj = {};

srcFiles.forEach(file => {

  if (path.extname(file) === '.js') {
    const fileName = path.basename(file, '.js');
    exportsObj[`./${fileName}`] = `./src/${file}`;
  }

});

packageJson.exports = exportsObj;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Exports section updated in package.json');