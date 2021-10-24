const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

function clearAndUpper(text) {
  return text.replace(/[-|_]/, '').toUpperCase();
}

function toPascalCase(text) {
  return text.replace(/(^\w|[-|_]\w)/g, clearAndUpper);
}

const folder = path.join(__dirname, 'heroicons');
const iconsFolder = path.join(__dirname, 'src', 'icons', 'heroicons');

const gitRepo = 'git clone https://github.com/tailwindlabs/heroicons.git';

const imports = [];

const processRepo = () => {
  try {
    ['outline', 'solid'].forEach((svgType) => {
      const srcFolder = path.join(folder, 'optimized', svgType);
      const outFolder = path.join(iconsFolder, 'templates', svgType);
      execSync(`rm -rf ${outFolder}`);

      if (!fs.existsSync(outFolder)) {
        console.log(`Creating ${outFolder}`);
        fs.mkdirSync(outFolder, { recursive: true });
      }

      console.log(`Moving icons from ${srcFolder} to ${outFolder}!`);
      fs.readdirSync(srcFolder).map((svg) => {
        const src = path.join(srcFolder, svg);

        const everythingButExtension = svg.substr(0, svg.lastIndexOf('.'));
        const outName =
          everythingButExtension.replace(/-/g, '_') + '_' + svgType;
        const outFileName = `${outName}.html`;
        const out = path.join(outFolder, outFileName);
        const pascalName = toPascalCase(outName);
        let contents = fs.readFileSync(src).toString();

        imports.push([path.join(svgType, outFileName), pascalName]);

        let processed = contents
          .trim()
          .replace(/<\s*([^\s>]+)([^>]*)\/\s*>/g, '<$1$2></$1>')
          .split('\n')
          .join('\n    ');
        const widthHeight = svgType === 'outline' ? 24 : 20;
        processed = `<svg class={computedClass} data-key={name} width="${widthHeight}" height="${widthHeight}"${processed.substr(
          4
        )}`;

        fs.writeFileSync(
          out,
          `
<template>
    ${processed}
</template>
          `.trim() + '\n'
        );
      });
    });

    const exportsList = new Array();
    fs.writeFileSync(
      path.join(iconsFolder, 'templates.js'),
      imports
        .sort(([_, a], [__, b]) => a.localeCompare(b))
        .map(([importPath]) => {
          const importName = importPath.split('/')[1].split('.')[0];
          console.log(`↳ ${importName}`);
          exportsList.push(importName);
          return `import { default as ${importName} } from './templates/${importPath}';`;
        })
        .join('\n') +
        '\n\n' +
        `
export default {
  ${exportsList.join(', ')}
};
        `.trim() +
        '\n'
    );
  } finally {
    console.log('Removing the repo...');
    exec(`rm -rf ${folder}`);
  }
};

console.log(`Cloning ${gitRepo} to ${folder}`);
exec(`${gitRepo} ${folder}`, (error) => {
  if (error) {
    console.log('The repo already exists!');
  } else {
    console.log('Successfully cloned the repo!');
  }
  processRepo();
});
