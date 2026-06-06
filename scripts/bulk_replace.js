const fs = require('fs');
const path = require('path');

const colors = {
  '#5EBBAB': '#3B82F6',
  '#4AA89A': '#2563EB',
  '#3C8F7A': '#1D4ED8',
  '#6CC8B5': '#60A5FA',
  '#7DD4C2': '#93C5FD',
  '#E5F3FF': '#EFF6FF',
  '#d4eaf7': '#BFDBFE',
  'Saúde Inteligente': 'Pulmo Vida',
};

function replaceColors(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    if (filePath.includes('node_modules') || filePath.includes('.next') || filePath.includes('.git')) return;
    const files = fs.readdirSync(filePath);
    files.forEach(file => replaceColors(path.join(filePath, file)));
  } else if (stat.isFile() && (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css'))) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [oldC, newC] of Object.entries(colors)) {
      if (content.includes(oldC)) {
        content = content.split(oldC).join(newC);
        changed = true;
      }
    }
    // Also remove R$
    if (content.includes('R$ ')) {
      content = content.split('R$ ').join('');
      changed = true;
    }
    
    // Add Slogan
    if (filePath.includes('HeroSlider.tsx') && content.includes('Plataforma #1 em saúde inteligente')) {
      content = content.replace('Plataforma #1 em saúde inteligente', 'Prevendo doenças, preservando vidas no ambiente público');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
}

replaceColors(path.join(__dirname, 'app'));
replaceColors(path.join(__dirname, 'components'));
