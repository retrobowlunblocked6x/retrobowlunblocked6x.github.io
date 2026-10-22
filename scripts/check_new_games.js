const fs = require('fs');
const path = require('path');
const existingGames = require('../js/games-data.js');

const contentPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/018c3799-c030-4eaf-a4a1-4aac2d61a678/.system_generated/steps/709/content.md';
const content = fs.readFileSync(contentPath, 'utf8');

// Set of existing game IDs and titles (lowercase normalized)
const existingIds = new Set(existingGames.map(g => g.id.toLowerCase()));
const existingTitles = new Set(existingGames.map(g => g.title.toLowerCase().replace(/[^a-z0-9]/g, '')));

console.log('Existing games in repo:', existingGames.length);

// Extract all unique game slugs from hrefs
const hrefRegex = /href=["'](\/view\/classroom6x\/([^"']+))["']/gi;
let match;
const foundGamesMap = new Map();

// Helper to normalize slug to readable title
function slugToTitle(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Ignore utility pages
const ignoredSlugs = new Set([
  'home', 'contact-us', 'unblocked-games', 'dmca', 'privacy-policy', 'terms', 'about'
]);

while ((match = hrefRegex.exec(content)) !== null) {
  const fullHref = match[1];
  const slug = match[2].trim().toLowerCase();
  
  if (ignoredSlugs.has(slug)) continue;
  if (slug.includes('#') || slug.includes('?')) continue;
  
  if (!foundGamesMap.has(slug)) {
    foundGamesMap.set(slug, {
      slug,
      url: `https://sites.google.com/view/classroom6x/${slug}`,
      title: slugToTitle(slug)
    });
  }
}

console.log('Total unique game slugs found in classroom6x:', foundGamesMap.size);

// Find which are new vs which already exist
const newGames = [];
const alreadyExist = [];

for (const [slug, item] of foundGamesMap) {
  const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (existingIds.has(slug) || existingTitles.has(normalizedTitle)) {
    alreadyExist.push(item);
  } else {
    newGames.push(item);
  }
}

console.log('Already existing in repo:', alreadyExist.length);
console.log('NEW games found in classroom6x:', newGames.length);

// Also look at the 113 games that have thumbnails directly on the homepage
const cardRegex = /<a\s+[^>]*href=["']\/view\/classroom6x\/([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
const homepageCards = [];
while ((match = cardRegex.exec(content)) !== null) {
  const slug = match[1].trim().toLowerCase();
  const inner = match[2];
  const imgMatch = inner.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch && !ignoredSlugs.has(slug)) {
    homepageCards.push({
      slug,
      title: slugToTitle(slug),
      thumbSrc: imgMatch[1]
    });
  }
}

console.log('Homepage cards with image:', homepageCards.length);
const newHomepageCards = homepageCards.filter(c => !existingIds.has(c.slug) && !existingTitles.has(c.title.toLowerCase().replace(/[^a-z0-9]/g, '')));
console.log('NEW games among homepage featured cards:', newHomepageCards.length);
console.log('Sample NEW featured games:', newHomepageCards.slice(0, 15));
