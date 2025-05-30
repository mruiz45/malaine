const fs = require('fs');
const path = require('path');

/**
 * Script pour identifier les textes non traduits dans le projet Malaine
 * User Story 11 - Ensure all texts are translated
 */

const srcDir = './src';
const todoFile = '/tmp/todo_list.md';

// Patterns pour identifier les textes UI qui devraient être traduits
const uiTextPatterns = [
  // Chaînes littérales qui contiennent des mots anglais/français
  /"[^"]*[a-zA-ZÀ-ÿ]{2,}[^"]*"/g,
  /'[^']*[a-zA-ZÀ-ÿ]{2,}[^']*'/g,
  // Attributs HTML avec du texte
  /(?:alt|title|placeholder|aria-label|aria-description)=["'][^"']*["']/g,
  // Template literals avec du texte
  /`[^`]*[a-zA-ZÀ-ÿ]{2,}[^`]*`/g
];

// Patterns à exclure (techniques, pas de l'UI)
const excludePatterns = [
  /^import\s/,
  /^export\s/,
  /from\s+['"`]/,
  /require\s*\(/,
  /\.tsx?$/,
  /\.css$/,
  /\.json$/,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /^https?:\/\//,
  /^\/[a-z-]+/,  // Chemins de route
  /className\s*=/,
  /style\s*=/,
  /^[a-z][a-zA-Z]*$/,  // Noms de variables simple
  /^[A-Z_][A-Z0-9_]*$/,  // Constantes
  /console\.(log|error|warn)/,
  /\.map\(/,
  /\.filter\(/,
  /\.find\(/,
  /addEventListener/,
  /removeEventListener/,
  /useEffect/,
  /useState/,
  /useTranslation/,
  /react-i18next/,
  /next\/navigation/,
  /next\/link/,
  /^t\(/,  // Déjà traduit
  /\$\{.*\}/,  // Variables dans template literals
];

// Extensions de fichiers à analyser
const fileExtensions = ['.tsx', '.ts'];

// Fichiers à ignorer
const ignoredFiles = [
  'i18n.ts',
  'I18nProvider.tsx',
  'LanguageSwitcher.tsx',
  '.test.tsx',
  '.test.ts',
  '.spec.tsx',
  '.spec.ts'
];

function shouldAnalyzeFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);
  
  return fileExtensions.includes(ext) && 
         !ignoredFiles.some(ignored => fileName.includes(ignored));
}

function isUIText(text) {
  // Enlever les guillemets
  const cleanText = text.replace(/^['"`]|['"`]$/g, '');
  
  // Vérifier si c'est probablement du texte UI
  if (cleanText.length < 2) return false;
  
  // Exclure les patterns techniques
  for (const pattern of excludePatterns) {
    if (pattern.test(cleanText) || pattern.test(text)) {
      return false;
    }
  }
  
  // Vérifier si ça contient des mots (pas juste des symboles/numbers)
  const hasWords = /[a-zA-ZÀ-ÿ]{2,}/.test(cleanText);
  if (!hasWords) return false;
  
  // Exclure les identifiants techniques communs
  if (/^[a-z][a-zA-Z0-9]*$/.test(cleanText)) return false;
  if (/^[A-Z_][A-Z0-9_]*$/.test(cleanText)) return false;
  
  // Exclure les classes CSS
  if (/^[\w-]+$/.test(cleanText) && cleanText.includes('-')) return false;
  
  // Accepter si ça ressemble à du texte UI
  return true;
}

function extractUITexts(content, filePath) {
  const texts = [];
  
  // Exclure les lignes de commentaires et imports
  const lines = content.split('\n');
  const relevantContent = lines
    .filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('//') && 
             !trimmed.startsWith('/*') && 
             !trimmed.startsWith('*') &&
             !trimmed.startsWith('import ') &&
             !trimmed.startsWith('export ') &&
             !trimmed.startsWith('const ') ||
             trimmed.includes('=');
    })
    .join('\n');
  
  // Chercher tous les patterns de texte
  for (const pattern of uiTextPatterns) {
    const matches = relevantContent.match(pattern) || [];
    for (const match of matches) {
      if (isUIText(match)) {
        // Trouver le numéro de ligne
        const lineNumber = content.indexOf(match) !== -1 ? 
          content.substring(0, content.indexOf(match)).split('\n').length : 1;
        
        texts.push({
          text: match,
          line: lineNumber,
          file: filePath
        });
      }
    }
  }
  
  return texts;
}

function scanDirectory(dir) {
  const results = [];
  
  function walkDir(currentDir) {
    const files = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(currentDir, file.name);
      
      if (file.isDirectory()) {
        walkDir(fullPath);
      } else if (shouldAnalyzeFile(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const texts = extractUITexts(content, fullPath);
          
          if (texts.length > 0) {
            results.push({
              file: fullPath,
              texts: texts
            });
          }
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error);
        }
      }
    }
  }
  
  walkDir(dir);
  return results;
}

function generateTodoList(results) {
  let markdown = `# Translation TODO List - US_11\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  markdown += `Files with untranslated text: ${results.length}\n\n`;
  
  for (const result of results) {
    markdown += `## 📄 ${result.file}\n\n`;
    markdown += `- [ ] **File:** \`${result.file}\`\n`;
    markdown += `- [ ] **Texts found:** ${result.texts.length}\n\n`;
    
    markdown += `### Untranslated texts:\n\n`;
    for (const text of result.texts) {
      markdown += `- Line ${text.line}: \`${text.text}\`\n`;
    }
    markdown += `\n`;
    
    markdown += `### Actions needed:\n`;
    markdown += `- [ ] Replace hardcoded strings with translation keys\n`;
    markdown += `- [ ] Add translations to \`/public/locales/en/common.json\`\n`;
    markdown += `- [ ] Add translations to \`/public/locales/fr/common.json\`\n`;
    markdown += `- [ ] Test both language versions\n\n`;
    
    markdown += `---\n\n`;
  }
  
  return markdown;
}

function main() {
  console.log('🔍 Scanning for untranslated texts...');
  
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory ${srcDir} not found!`);
    process.exit(1);
  }
  
  const results = scanDirectory(srcDir);
  
  console.log(`📊 Found ${results.length} files with potentially untranslated text`);
  
  if (results.length > 0) {
    const todoContent = generateTodoList(results);
    
    // Créer le répertoire /tmp s'il n'existe pas
    const tmpDir = path.dirname(todoFile);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    fs.writeFileSync(todoFile, todoContent, 'utf8');
    console.log(`📝 TODO list generated: ${todoFile}`);
    
    // Afficher un résumé
    console.log('\n📋 Summary:');
    for (const result of results.slice(0, 10)) { // Top 10
      console.log(`  ${result.file}: ${result.texts.length} texts`);
    }
    if (results.length > 10) {
      console.log(`  ... and ${results.length - 10} more files`);
    }
  } else {
    console.log('✅ No untranslated texts found!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, extractUITexts, isUIText }; 