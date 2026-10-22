const fs = require('fs');
const existingGames = require('../js/games-data.js');

const content = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/018c3799-c030-4eaf-a4a1-4aac2d61a678/.system_generated/steps/709/content.md', 'utf8');

const existingIds = new Set(existingGames.map(g => g.id.toLowerCase()));
const existingTitles = new Set(existingGames.map(g => g.title.toLowerCase().replace(/[^a-z0-9]/g, '')));

const cardRegex = /<a\s+[^>]*href=["']\/view\/classroom6x\/([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
let match;
const cardsMap = new Map();

function cleanTitle(slug) {
  // Common fixes
  const map = {
    '1v1-lol': '1v1.LOL',
    'mr-racer': 'Mr. Racer',
    'ragdoll-runner': 'Ragdoll Runner',
    'smash-karts': 'Smash Karts',
    'kart-bros': 'Kart Bros',
    'football-bros': 'Football Bros',
    'baseball-bros': 'Baseball Bros',
    'basketball-stars-new': 'Basketball Stars New',
    'steal-and-catch-obby': 'Steal & Catch Obby',
    'obby-climb-and-slide-2': 'Obby Climb & Slide 2',
    'snow-rush-3d': 'Snow Rush 3D',
    'car-destruction-king': 'Car Destruction King',
    'crazy-motorcycle': 'Crazy Motorcycle',
    'ragdoll-crash-test': 'Ragdoll Crash Test',
    'r-vs-b': 'Red vs Blue',
    'r-a-c-e': 'R.A.C.E',
    'the-machinegg': 'The Machinegg',
    'capy-cafe': 'Capy Cafe',
    'cat-life-simulator-devil-cat': 'Cat Life Simulator: Devil Cat',
    'fight-club-simulator': 'Fight Club Simulator',
    'box-simulator': 'Box Simulator',
    'dude-life': 'Dude Life',
    'zombies-sandbox': 'Zombies Sandbox',
    'island-expander': 'Island Expander',
    'soccer-lat': 'Soccer Lat',
    'wonder-goal': 'Wonder Goal',
    'rocket-goal': 'Rocket Goal',
    'stickman-duel': 'Stickman Duel',
    'car-driving': 'Car Driving',
    'squid-gme': 'Squid Game',
    'pickaxe-escape': 'Pickaxe Escape',
    'bottle-flip': 'Bottle Flip',
    'save-my-pet': 'Save My Pet',
    'zombie-space-episode-2': 'Zombie Space: Episode 2',
    'obby-run-star': 'Obby Run Star',
    'fun-ragdoll-arena': 'Fun Ragdoll Arena',
    'steal-the-egg': 'Steal The Egg'
  };

  if (map[slug]) return map[slug];

  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Map slug to smart category
function detectCategories(slug, title) {
  const s = slug.toLowerCase();
  const t = title.toLowerCase();
  
  if (s.includes('football') || s.includes('soccer') || s.includes('goal') || s.includes('basket') || s.includes('baseball') || s.includes('tennis') || s.includes('cricket') || s.includes('hockey')) {
    return ['Sports', 'Multiplayer'];
  }
  if (s.includes('kart') || s.includes('race') || s.includes('car') || s.includes('motor') || s.includes('drive') || s.includes('driving') || s.includes('drift')) {
    return ['Driving', 'Action'];
  }
  if (s.includes('obby') || s.includes('run') || s.includes('slide') || s.includes('escape') || s.includes('jump')) {
    return ['Platformer', 'Action'];
  }
  if (s.includes('ragdoll') || s.includes('duel') || s.includes('fight') || s.includes('combat') || s.includes('arena') || s.includes('zombie') || s.includes('smash') || s.includes('shoot')) {
    return ['Action', 'Multiplayer'];
  }
  if (s.includes('puzzle') || s.includes('flip') || s.includes('pet') || s.includes('cafe') || s.includes('simulator') || s.includes('box') || s.includes('egg')) {
    return ['Puzzle', 'Retro'];
  }
  return ['Action', 'Retro'];
}

while ((match = cardRegex.exec(content)) !== null) {
  const slug = match[1].toLowerCase().trim();
  const inner = match[2];
  const imgMatch = inner.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
  
  if (imgMatch && !['home', 'contact-us', 'unblocked-games'].includes(slug)) {
    if (!cardsMap.has(slug)) {
      const title = cleanTitle(slug);
      cardsMap.set(slug, {
        slug,
        title,
        categories: detectCategories(slug, title),
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

console.log('Total new games from Classroom6x homepage:', newGamesList.length);
fs.writeFileSync('scripts/new_games_list.json', JSON.stringify(newGamesList, null, 2));
console.log('Saved to scripts/new_games_list.json');
