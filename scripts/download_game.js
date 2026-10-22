const fs = require('fs');
const path = require('path');

const apiTreeUrl = 'https://api.github.com/repos/coolubg2/coolubg-list/git/trees/main?recursive=1';
const rawBase = 'https://raw.githubusercontent.com/coolubg2/coolubg-list/main/';
const gamesDir = path.join(__dirname, '..', 'games');

if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

let cachedTree = null;

async function getTree() {
  if (cachedTree) return cachedTree;
  console.log('Fetching GitHub tree from coolubg-list...');
  const res = await fetch(apiTreeUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch tree: ${res.status}`);
  }
  const data = await res.json();
  cachedTree = data.tree;
  return cachedTree;
}

async function downloadSingleGame(gameSlug) {
  const tree = await getTree();
  // Check if it is a directory or a single swf/html file
  const dirPrefix = `${gameSlug}/`;
  const matchingFiles = tree.filter(item => item.path.startsWith(dirPrefix) && item.type === 'blob');

  if (matchingFiles.length === 0) {
    // Check for .swf file
    const swfMatch = tree.find(item => item.path === `${gameSlug}.swf` && item.type === 'blob');
    if (swfMatch) {
      console.log(`Downloading SWF game: ${swfMatch.path}`);
      await downloadFile(swfMatch.path);
      return true;
    }
    console.warn(`No files found for game "${gameSlug}" in coolubg-list.`);
    return false;
  }

  console.log(`Downloading ${matchingFiles.length} files for "${gameSlug}"...`);
  let count = 0;
  for (const item of matchingFiles) {
    await downloadFile(item.path);
    count++;
    if (count % 10 === 0 || count === matchingFiles.length) {
      console.log(`  [${gameSlug}] ${count}/${matchingFiles.length} files downloaded.`);
    }
  }
  return true;
}

async function downloadFile(relPath) {
  const destPath = path.join(gamesDir, relPath);
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const url = `${rawBase}${relPath}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  Failed: ${relPath} (${res.status})`);
    return;
  }
  const ab = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(ab));
}

async function main() {
  const target = process.argv[2] || 'retro-bowl-college';
  if (target === 'all') {
    const gamesData = require('../js/games-data.js');
    console.log(`Downloading ALL ${gamesData.length} games...`);
    for (const g of gamesData) {
      await downloadSingleGame(g.id);
    }
  } else {
    await downloadSingleGame(target);
  }
  console.log('Done!');
}

main().catch(console.error);
