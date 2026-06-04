const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Dark Mode primary colors
  content = content.replace(/#00f5c4/g, '#a3e635'); // hex
  content = content.replace(/0, 245, 196/g, '163, 230, 53'); // rgb
  
  // Replace Dark Mode secondary shades (0, 212, 170 and #00d4aa)
  content = content.replace(/0, 212, 170/g, '163, 230, 53'); // rgb
  content = content.replace(/#00d4aa/g, '#a3e635'); // hex
  
  // Replace Light Mode primary colors
  content = content.replace(/#0d9488/g, '#4d7c0f'); // hex
  content = content.replace(/13, 148, 136/g, '77, 124, 15'); // rgb

  // Replace secondary accent (purple -> green)
  content = content.replace(/#8b5cf6/g, '#22c55e'); // hex
  content = content.replace(/139, 92, 246/g, '34, 197, 94'); // rgb
  
  // Light mode secondary (purple -> green)
  content = content.replace(/#6d28d9/g, '#15803d'); // hex
  content = content.replace(/109, 40, 217/g, '21, 128, 61'); // rgb

  fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Colors replaced!');
