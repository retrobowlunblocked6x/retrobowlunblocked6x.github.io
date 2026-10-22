const fs = require('fs');
const path = require('path');
const { generateThumbnail } = require('./generate_thumbnails.js');

const newGames = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_games_list.json'), 'utf8'));

console.log(`Starting thumbnail regeneration for ${newGames.length} new games...`);
const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

let count = 0;
for (const game of newGames) {
  const outPath = path.join(imagesDir, `${game.slug}.png`);
  const primaryCat = (game.categories && game.categories[0]) || 'Action';
  generateThumbnail(game.title, primaryCat, outPath);
  count++;
}

console.log(`Successfully regenerated ${count} brand-new custom thumbnails in images/!`);
