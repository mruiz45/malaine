const fs = require('fs');
const path = require('path');

/**
 * Script amélioré pour identifier les textes non traduits dans le projet Malaine
 * User Story 11 - Ensure all texts are translated
 */

const srcDir = './src';
const todoFile = '/tmp/todo_list.md';

// Patterns pour identifier les textes UI qui devraient être traduits
const uiTextPatterns = [
  // Chaînes littérales qui contiennent des mots anglais/français
  /"[^"]*[a-zA-ZÀ-ÿ]{2,}[^"]*"/g,
  /'[^']*[a-zA-ZÀ-ÿ]{2,}[^']*'/g,
  // Attributs HTML avec du texte (mais pas className, etc.)
  /(?:alt|title|placeholder|aria-label|aria-description)=["'][^"']*["']/g,
];

// Patterns spécifiques à exclure (techniques, pas de l'UI)
const excludePatterns = [
  // Imports et exports
  /^import\s/,
  /^export\s/,
  /from\s+['"`]/,
  /require\s*\(/,
  
  // Extensions de fichiers
  /\.(tsx?|css|json|svg|png|jpg|jpeg|gif|webp)$/,
  
  // URLs et chemins
  /^https?:\/\//,
  /^\/[a-z-\/]*$/,
  /^\.\.?\//,
  
  // Classes CSS Tailwind (très spécifiques)
  /^[\w\s-]*(?:px-|py-|pt-|pb-|pl-|pr-|m-|mx-|my-|mt-|mb-|ml-|mr-|w-|h-|text-|bg-|border-|rounded-|flex-|grid-|col-|row-|space-|gap-|justify-|items-|relative|absolute|fixed|static|z-|opacity-|transform|transition|duration-|ease-|cursor-|select-|overflow-|font-|leading-|tracking-|shadow-|ring-|focus:|hover:|active:|disabled:|sm:|md:|lg:|xl:|2xl:)[\w\s-]*$/,
  
  // Noms de variables et constantes
  /^[a-z][a-zA-Z0-9]*$/,
  /^[A-Z_][A-Z0-9_]*$/,
  /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/,
  
  // Méthodes et API JavaScript/React
  /console\.(log|error|warn|info)/,
  /\.(map|filter|find|forEach|reduce|some|every|includes)\(/,
  /addEventListener|removeEventListener/,
  /use(Effect|State|Ref|Callback|Memo|Context|Router|Auth|Translation)/,
  
  // React et Next.js
  /react-i18next|next\/|@heroicons|@types/,
  
  // Déjà traduit
  /^t\(|useTranslation/,
  
  // Variables dans templates
  /\$\{[^}]*\}/,
  
  // Types TypeScript
  /^[A-Z][a-zA-Z0-9]*(?:<[^>]*>)?$/,
  
  // Propriétés d'objets techniques
  /^(httpOnly|secure|sameSite|maxAge|path|NODE_ENV|development|production)$/,
  
  // Mots-clés techniques courts
  /^(true|false|null|undefined|void|any|string|number|boolean|object|function)$/,
  
  // Noms de couleurs et tailles
  /^(small|medium|large|xs|sm|md|lg|xl|primary|secondary|success|warning|error|info)$/,
];

// Extensions de fichiers à analyser
const fileExtensions = ['.tsx', '.ts'];

// Fichiers à ignorer complètement
const ignoredFiles = [
  'i18n.ts',
  'I18nProvider.tsx',
  'LanguageSwitcher.tsx',
  '.test.tsx',
  '.test.ts',
  '.spec.tsx',
  '.spec.ts',
  'jest.setup.js',
  'jest.config.js',
  'tailwind.config.js',
  'next.config.ts',
  'middleware.ts' // Routes middleware souvent techniques
];

// Dossiers à ignorer
const ignoredDirs = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build'
];

function shouldAnalyzeFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);
  const dirName = path.dirname(filePath);
  
  // Vérifier les dossiers ignorés
  for (const ignoredDir of ignoredDirs) {
    if (dirName.includes(ignoredDir)) {
      return false;
    }
  }
  
  return fileExtensions.includes(ext) && 
         !ignoredFiles.some(ignored => fileName.includes(ignored));
}

function isUIText(text, context = '') {
  // Enlever les guillemets
  const cleanText = text.replace(/^['"`]|['"`]$/g, '');
  
  // Vérifier longueur minimale
  if (cleanText.length < 3) return false;
  
  // Vérifier si c'est une classe CSS Tailwind
  if (isTailwindClass(cleanText)) return false;
  
  // Exclure les patterns techniques
  for (const pattern of excludePatterns) {
    if (pattern.test(cleanText) || pattern.test(text)) {
      return false;
    }
  }
  
  // Vérifier si ça contient des mots (pas juste des symboles/numbers)
  const hasWords = /[a-zA-ZÀ-ÿ]{3,}/.test(cleanText);
  if (!hasWords) return false;
  
  // Exclure si c'est juste un identifiant technique
  if (/^[a-z][a-zA-Z0-9_]*$/.test(cleanText) && cleanText.length < 15) return false;
  
  // Exclure si c'est une constante
  if (/^[A-Z_][A-Z0-9_]*$/.test(cleanText)) return false;
  
  // Exclure les tokens techniques courts
  if (cleanText.length < 6 && !/\s/.test(cleanText)) return false;
  
  // Accepter si ça contient des espaces (phrases)
  if (/\s/.test(cleanText)) return true;
  
  // Accepter si ça commence par une majuscule et contient des mots
  if (/^[A-Z]/.test(cleanText) && /[a-z]/.test(cleanText)) return true;
  
  // Accepter si ça ressemble à du texte UI (contient des mots communs)
  const commonUIWords = /\b(loading|error|success|warning|title|description|message|button|form|page|welcome|hello|please|click|select|enter|save|cancel|delete|edit|view|create|new|add|remove|search|filter|sort|next|previous|back|home|dashboard|profile|settings|help|about|contact|login|logout|signup|sign|register|forgot|password|email|name|address|phone|submit|confirm|continue|finish|complete)\b/i;
  if (commonUIWords.test(cleanText)) return true;
  
  return false;
}

function isTailwindClass(text) {
  // Patterns spécifiques pour Tailwind CSS
  const tailwindPatterns = [
    /^[\w\s-]*(?:px-|py-|pt-|pb-|pl-|pr-)\d+/,
    /^[\w\s-]*(?:m-|mx-|my-|mt-|mb-|ml-|mr-)\d+/,
    /^[\w\s-]*(?:w-|h-|min-w-|min-h-|max-w-|max-h-)\d+/,
    /^[\w\s-]*text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
    /^[\w\s-]*bg-(?:gray|red|yellow|green|blue|indigo|purple|pink)-\d+/,
    /^[\w\s-]*border-(?:gray|red|yellow|green|blue|indigo|purple|pink)-\d+/,
    /^[\w\s-]*(?:flex|grid|block|inline|hidden|relative|absolute|fixed|static)/,
    /^[\w\s-]*(?:justify-|items-|content-|self-|place-)/,
    /^[\w\s-]*(?:space-x-|space-y-|gap-)\d+/,
    /^[\w\s-]*(?:rounded|shadow|ring|opacity|transform|transition)/,
    /^[\w\s-]*(?:hover:|focus:|active:|disabled:|sm:|md:|lg:|xl:|2xl:)/,
    /container|mx-auto|antialiased|min-h-screen/
  ];
  
  return tailwindPatterns.some(pattern => pattern.test(text));
}

function extractUITexts(content, filePath) {
  const texts = [];
  const lines = content.split('\n');
  
  // Exclure les sections de commentaires et imports
  let inMultiLineComment = false;
  let relevantLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Gérer les commentaires multi-lignes
    if (trimmed.includes('/*')) inMultiLineComment = true;
    if (trimmed.includes('*/')) inMultiLineComment = false;
    
    // Exclure les lignes non pertinentes
    if (!inMultiLineComment &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('import ') &&
        !(trimmed.startsWith('export ') && !trimmed.includes('const ')) &&
        !trimmed.startsWith('type ') &&
        !trimmed.startsWith('interface ')) {
      relevantLines.push({ content: line, number: i + 1 });
    }
  }
  
  const relevantContent = relevantLines.map(l => l.content).join('\n');
  
  // Chercher tous les patterns de texte
  for (const pattern of uiTextPatterns) {
    const matches = relevantContent.match(pattern) || [];
    for (const match of matches) {
      if (isUIText(match)) {
        // Trouver le numéro de ligne plus précisément
        const lineObj = relevantLines.find(l => l.content.includes(match));
        const lineNumber = lineObj ? lineObj.number : 1;
        
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
    try {
      const files = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(currentDir, file.name);
        
        if (file.isDirectory() && !ignoredDirs.includes(file.name)) {
          walkDir(fullPath);
        } else if (shouldAnalyzeFile(fullPath)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const texts = extractUITexts(content, fullPath);
            
            if (texts.length > 0) {
              results.push({
                file: fullPath.replace(/\\/g, '/'), // Normaliser les chemins
                texts: texts
              });
            }
          } catch (error) {
            console.error(`Error reading file ${fullPath}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}:`, error.message);
    }
  }
  
  walkDir(dir);
  return results;
}

function generateTodoList(results) {
  let markdown = `# Translation TODO List - US_11\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  markdown += `Files with untranslated text: ${results.length}\n\n`;
  markdown += `## Summary\n\n`;
  
  // Classer par priorité
  const highPriority = results.filter(r => r.file.includes('/page.tsx') || r.file.includes('/layout.tsx'));
  const mediumPriority = results.filter(r => r.file.includes('/components/') && !highPriority.includes(r));
  const lowPriority = results.filter(r => !highPriority.includes(r) && !mediumPriority.includes(r));
  
  markdown += `- 🔴 High Priority (Pages/Layouts): ${highPriority.length} files\n`;
  markdown += `- 🟡 Medium Priority (Components): ${mediumPriority.length} files\n`;
  markdown += `- 🟢 Low Priority (Other): ${lowPriority.length} files\n\n`;
  
  const allResults = [...highPriority, ...mediumPriority, ...lowPriority];
  
  for (const result of allResults) {
    const priority = highPriority.includes(result) ? '🔴' : 
                    mediumPriority.includes(result) ? '🟡' : '🟢';
    
    markdown += `## ${priority} ${result.file}\n\n`;
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
  console.log('🔍 Scanning for untranslated texts (improved)...');
  
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
    console.log('\n📋 Top files to review:');
    const sortedResults = results.sort((a, b) => b.texts.length - a.texts.length);
    for (const result of sortedResults.slice(0, 15)) {
      console.log(`  ${result.file}: ${result.texts.length} texts`);
    }
    if (results.length > 15) {
      console.log(`  ... and ${results.length - 15} more files`);
    }
  } else {
    console.log('✅ No untranslated texts found!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, extractUITexts, isUIText }; 