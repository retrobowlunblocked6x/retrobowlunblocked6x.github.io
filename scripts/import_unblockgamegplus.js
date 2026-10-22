/**
 * Import All Games from Unblocked Games G+ (D:\VSCODE\UNBLOCKGAMESGPLUS.GITHUB.IO\unblockgamegplus.github.io)
 * Copies local webp thumbnails and appends new game metadata into js/games-data.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const sourceRepo = 'D:/VSCODE/UNBLOCKGAMESGPLUS.GITHUB.IO/unblockgamegplus.github.io';
const sourceGamesPath = path.join(sourceRepo, 'games.json');
const sourceImgDir = path.join(sourceRepo, 'img');
const targetImgDir = path.join(rootDir, 'images');
const gamesDataFile = path.join(rootDir, 'js', 'games-data.js');

if (!fs.existsSync(sourceGamesPath)) {
  console.error('Source games.json not found at:', sourceGamesPath);
  process.exit(1);
}

const sourceGames = JSON.parse(fs.readFileSync(sourceGamesPath, 'utf8'));
const currentGames = require(gamesDataFile);

console.log(`Starting import: ${currentGames.length} existing games, ${sourceGames.length} source games.`);

function createSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function mapCategories(rawCats) {
  const cats = Array.isArray(rawCats) ? rawCats : [];
  const mapped = new Set();

  for (const c of cats) {
    if (c === 'New' || c === 'Popular') continue;

    if (c === 'Platform') mapped.add('Platformer');
    else if (c === 'Car' || c === 'Racing' || c === 'Moto') mapped.add('Driving');
    else if (c === 'Shooting') mapped.add('Action');
    else if (c === '2 Player' || c === 'Multiplayer') mapped.add('Multiplayer');
    else if (c === 'Sports') mapped.add('Sports');
    else if (c === 'Puzzle' || c === 'Animal' || c === 'Board' || c === 'Skill') mapped.add('Puzzle');
    else if (c === 'Simulation' || c === 'Management' || c === 'Strategy' || c === 'Survival' || c === 'Girls') mapped.add('Casual & Strategy');
    else if (c === 'Stickman') mapped.add('Action');
    else if (c === 'Adventure') mapped.add('Platformer');
    else if (c === 'Running') mapped.add('Platformer');
    else if (c === '3D') mapped.add('Action');
  }

  if (mapped.size === 0) {
    mapped.add('Action');
    mapped.add('Casual & Strategy');
  }

  return Array.from(mapped).slice(0, 3);
}

function getControls(cats) {
  if (cats.includes('Driving')) {
    return {
      keys: ['W / A / S / D', 'Arrow Keys', 'Spacebar (Brake)', 'Shift (Nitro)'],
      instructions: 'Use W/A/S/D or Arrow keys to steer and accelerate, Spacebar for handbrake, Shift for boost.'
    };
  }
  if (cats.includes('Sports')) {
    return {
      keys: ['Arrow Keys', 'W / A / S / D', 'Spacebar', 'Mouse'],
      instructions: 'Use Arrow keys or W/A/S/D to move, Spacebar or Mouse click to pass and shoot.'
    };
  }
  if (cats.includes('Multiplayer')) {
    return {
      keys: ['P1: W / A / S / D', 'P2: Arrow Keys', 'Spacebar'],
      instructions: 'Player 1 controls with W/A/S/D, Player 2 controls with Arrow Keys. Compete or cooperate!'
    };
  }
  if (cats.includes('Platformer')) {
    return {
      keys: ['Arrow Keys', 'W / A / S / D', 'Spacebar'],
      instructions: 'Use Arrow keys or W/A/S/D to run and jump, Spacebar for special action or double-jump.'
    };
  }
  if (cats.includes('Puzzle')) {
    return {
      keys: ['Mouse Left Click', 'Drag & Drop', 'Touch Controls'],
      instructions: 'Click and drag with mouse or touch to interact with tiles, solve puzzles, and clear stages.'
    };
  }
  return {
    keys: ['Mouse', 'W / A / S / D', 'Arrow Keys', 'Spacebar'],
    instructions: 'Use W/A/S/D or Arrow keys to move, Spacebar to jump/action, and Mouse to interact.'
  };
}

const existingSlugs = new Set(currentGames.map(g => g.id.toLowerCase()));
const existingTitles = new Set(currentGames.map(g => g.title.toLowerCase().trim()));

let addedCount = 0;
let skippedCount = 0;
let thumbsCopied = 0;

const newGamesList = [];

for (const sg of sourceGames) {
  const slug = createSlug(sg.title);
  const titleLower = sg.title.toLowerCase().trim();

  if (existingSlugs.has(slug) || existingTitles.has(titleLower)) {
    skippedCount++;
    continue;
  }

  // Determine thumbnail source
  const match = sg.thumb.match(/class-(\d+)\.(png|webp|jpg)/) || sg.pageUrl.match(/class-(\d+)/) || sg.gameUrl.match(/class-(\d+)/);
  const classNum = match ? match[1] : sg.id;
  const srcWebp = path.join(sourceImgDir, `class-${classNum}.webp`);
  const targetWebpName = `${slug}.webp`;
  const targetWebp = path.join(targetImgDir, targetWebpName);

  let thumbPath = `images/${slug}.png`; // fallback if source webp not found
  if (fs.existsSync(srcWebp)) {
    fs.copyFileSync(srcWebp, targetWebp);
    thumbPath = `images/${targetWebpName}`;
    thumbsCopied++;
  } else if (fs.existsSync(path.join(targetImgDir, `${slug}.png`))) {
    thumbPath = `images/${slug}.png`;
  }

  const mappedCats = mapCategories(sg.cat);
  const rating = parseFloat((4.4 + (Math.random() * 0.5)).toFixed(1));
  const plays = Math.floor(280000 + (Math.random() * 650000));
  const controls = getControls(mappedCats);

  const cleanTitle = sg.title.trim();
  const desc = `${cleanTitle} is an exciting ${mappedCats.join(', ')} game unblocked for school Chromebooks and PC. Play free online with high performance, smooth controls, and no restrictions on Retro Bowl Unblocked 6x!`;

  const newGame = {
    id: slug,
    title: cleanTitle,
    categories: mappedCats,
    fileType: 'html',
    fileName: slug,
    gamePath: sg.gameUrl,
    gameUrl: sg.gameUrl,
    remoteUrl: sg.gameUrl,
    thumbnail: thumbPath,
    author: 'Unblocked Games',
    releaseDate: '2024',
    dateAdded: '22-10-2026',
    rating: rating,
    plays: plays,
    featured: false,
    description: desc,
    controls: controls
  };

  newGamesList.push(newGame);
  existingSlugs.add(slug);
  existingTitles.add(titleLower);
  addedCount++;
}

console.log(`Results: ${addedCount} new games prepared, ${skippedCount} duplicates skipped, ${thumbsCopied} thumbnails copied.`);

const combinedGames = [...currentGames, ...newGamesList];
console.log(`Total games will be: ${combinedGames.length}`);

// Write to js/games-data.js
const header = `/**
 * Retro Bowl Unblocked 6x - Complete Games Database
 * Total Games: ${combinedGames.length}
 * High-performance HTML5, WebGL & Flash Games playable on school Chromebooks
 */
const GAMES_DATA = ${JSON.stringify(combinedGames, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAMES_DATA;
}
`;

fs.writeFileSync(gamesDataFile, header, 'utf8');
console.log(`✓ js/games-data.js successfully written with ${combinedGames.length} games!`);
