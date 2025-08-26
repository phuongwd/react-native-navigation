const exec = require('shell-utils').exec;
const fs = require('fs');
const path = require('path');

// Ensure Python is available for git-clang-format
const setupPython = () => {
  const tmpBinPath = path.join(process.cwd(), 'tmp-bin');
  const pythonWrapperPath = path.join(tmpBinPath, 'python');
  
  // Create tmp-bin directory if it doesn't exist
  if (!fs.existsSync(tmpBinPath)) {
    fs.mkdirSync(tmpBinPath, { recursive: true });
  }
  
  // Create Python wrapper if it doesn't exist
  if (!fs.existsSync(pythonWrapperPath)) {
    const wrapperContent = '#!/bin/bash\nexec python3 "$@"\n';
    fs.writeFileSync(pythonWrapperPath, wrapperContent);
    fs.chmodSync(pythonWrapperPath, '755');
  }
  
  // Add to PATH
  process.env.PATH = `${tmpBinPath}:${process.env.PATH}`;
};

setupPython();

const files = process.argv.slice(2).join(' ');
const result = exec.execSyncRead(`./node_modules/.bin/git-clang-format --diff -- ${files}`).trim();

if (
  result !== 'no modified files to format' &&
  result !== 'clang-format did not modify any files'
) {
  throw result;
}
