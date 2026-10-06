const fs = require('fs');
const path = require('path');

function replaceInFolder(dir, oldStr, newStr) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFolder(fullPath, oldStr, newStr);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(oldStr)) {
        content = content.replaceAll(oldStr, newStr);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInFolder(path.join(__dirname, 'src', 'app', 'client'), '/dashboard', '/client');
replaceInFolder(path.join(__dirname, 'src', 'app', 'jardinier'), '/dashboard', '/jardinier');
replaceInFolder(path.join(__dirname, 'src', 'app', 'admin'), '/dashboard', '/admin');
replaceInFolder(path.join(__dirname, 'src', 'app', 'controleur'), '/dashboard', '/controleur');
replaceInFolder(path.join(__dirname, 'src', 'app', 'connexion'), '/dashboard', '/client');
replaceInFolder(path.join(__dirname, 'src', 'app', 'inscription'), '/dashboard', '/client');

console.log('Replaced links successfully');
