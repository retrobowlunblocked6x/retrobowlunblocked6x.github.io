const fs = require('fs');
const path = require('path');

const histatsSnippet = `
<!-- Histats.com  START  (aync)-->
<script type="text/javascript">var _Hasync= _Hasync|| [];
_Hasync.push(['Histats.start', '1,5059845,4,0,0,0,00010000']);
_Hasync.push(['Histats.fasi', '1']);
_Hasync.push(['Histats.track_hits', '']);
(function() {
var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
hs.src = ('//s10.histats.com/js15_as.js');
(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
})();</script>
<noscript><a href="/" target="_blank"><img  src="//sstatic1.histats.com/0.gif?5059845&101" alt="" border="0"></a></noscript>
<!-- Histats.com  END  -->
`;

function injectIntoFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('Histats.start')) {
    return false; // already present
  }
  if (content.includes('</body>')) {
    content = content.replace('</body>', `${histatsSnippet}\n</body>`);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

const rootDir = path.join(__dirname, '..');
let updatedCount = 0;

// Root HTML files
const rootFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));
for (const file of rootFiles) {
  if (injectIntoFile(path.join(rootDir, file))) {
    updatedCount++;
    console.log(`Injected Histats into ${file}`);
  }
}

// Category HTML files
const catDir = path.join(rootDir, 'category');
if (fs.existsSync(catDir)) {
  const catFiles = fs.readdirSync(catDir).filter(f => f.endsWith('.html'));
  for (const file of catFiles) {
    if (injectIntoFile(path.join(catDir, file))) {
      updatedCount++;
      console.log(`Injected Histats into category/${file}`);
    }
  }
}

// Play HTML files
const playDir = path.join(rootDir, 'play');
if (fs.existsSync(playDir)) {
  const playFiles = fs.readdirSync(playDir).filter(f => f.endsWith('.html'));
  for (const file of playFiles) {
    if (injectIntoFile(path.join(playDir, file))) {
      updatedCount++;
    }
  }
  console.log(`Checked and updated play pages, total updated files so far: ${updatedCount}`);
}

console.log(`Total HTML files updated with Histats: ${updatedCount}`);
