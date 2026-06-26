const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = path.join(__dirname, 'src');
const tsConfig = {
  jsx: ts.JsxEmit.Preserve,
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  importHelpers: false,
  noEmitOnError: false,
  removeComments: false,
  isolatedModules: true,
  allowNonTsExtensions: true,
  importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
};

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!['.ts', '.tsx'].includes(ext)) {
      continue;
    }
    if (entry.name.endsWith('.d.ts')) {
      continue;
    }

    const text = fs.readFileSync(fullPath, 'utf8');
    const output = ts.transpileModule(text, {
      compilerOptions: tsConfig,
      fileName: fullPath,
    }).outputText;
    const outExt = ext === '.tsx' ? '.jsx' : '.js';
    const outPath = fullPath.slice(0, -ext.length) + outExt;
    fs.writeFileSync(outPath, output, 'utf8');
    console.log('transpiled', path.relative(__dirname, fullPath), '->', path.relative(__dirname, outPath));
  }
}

walk(root);
console.log('Done transpiling TS/TSX files to JS/JSX.');
