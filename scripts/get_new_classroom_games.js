const fs = require('fs');
const existingGames = require('../js/games-data.js');

const content = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/018c3799-c030-4eaf-a4a1-4aac2d61a678/.system_generated/steps/709/content.md', 'utf8');

const existingIds = new Set(existingGames.map(g => g.id.toLowerCase()));
const existingTitles = new Set(existingGames.map(g => g.title.toLowerCase().replace(/[^a-z0-9]/g, '')));

// Extract cards from the Google Sites homepage
// Structure: <a ... href="/view/classroom6x/{slug}"> ... <img src="{src}"> ... </a>
const cardRegex = /<a\s+[^>]*href=["']\/view\/classroom6x\/([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
let match;
const cardsMap = new Map();

function slugToTitle(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

while ((match = cardRegex.exec(content)) !== null) {
  const slug = match[1].toLowerCase().trim();
  const inner = match[2];
  const imgMatch = inner.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
  
  if (imgMatch && !['home', 'contact-us', 'unblocked-games'].includes(slug)) {
    if (!cardsMap.has(slug)) {
      cardsMap.set(slug, {
        slug,
        title: slugToTitle(slug),
        thumbUrl: imgMatch[1]
      });
    }
  }
}

const newGamesList = [];
for (const [slug, item] of cardsMap) {
  const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!existingIds.has(slug) && !existingTitles.has(normalizedTitle)) {
    newGamesList.push(item);
  }
}

console.log(`Found ${cardsMap.size} total featured cards on homepage.`);
console.log(`New games not in our repo: ${newGamesList.length}`);
console.log(JSON.stringify(newGamesList.slice(0, 50), null, 2));
