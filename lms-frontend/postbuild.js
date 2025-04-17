const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function deleteFolderRecursiveSync(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.readdirSync(targetPath).forEach(file => {
      const curPath = path.join(targetPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursiveSync(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(targetPath);
  }
}

// Paths
const buildDir = path.join(__dirname, 'dist');
const backendDir = path.join(__dirname, '..', 'backend');
const staticSrc = path.join(buildDir, 'assets');
const staticDest = path.join(backendDir, 'static', 'assets');
const htmlSrc = path.join(buildDir, 'index.html');
const htmlDest = path.join(backendDir, 'lms', 'templates', 'lms', 'index.html');

// Transform HTML to use Django static tags
function transformHtmlWithStatic(htmlContent) {
  // Add {% load static %} at the top
  htmlContent = `{% load static %}\n` + htmlContent;

  // Replace href="/assets/..." and src="/assets/..."
  htmlContent = htmlContent.replace(/(href|src)="\/lms\/assets\/([^"]+)"/g, (match, attr, filePath) => {
    return `${attr}="{% static 'assets/${filePath}' %}"`;
  });

  return htmlContent;
}

// Run
try {
  if (fs.existsSync(staticDest)) {
    console.log('🧹 Cleaning old static files...');
    deleteFolderRecursiveSync(staticDest);
  }

  console.log('📁 Copying static files...');
  copyFolderRecursiveSync(staticSrc, staticDest);

  const templateDir = path.dirname(htmlDest);
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }

  console.log('🛠️  Processing index.html with Django static tags...');
  let html = fs.readFileSync(htmlSrc, 'utf-8');
  const transformedHtml = transformHtmlWithStatic(html);
  fs.writeFileSync(htmlDest, transformedHtml, 'utf-8');

  console.log('✅ React build successfully integrated into Django.');
} catch (err) {
  console.error('❌ Error during postbuild:', err);
}
