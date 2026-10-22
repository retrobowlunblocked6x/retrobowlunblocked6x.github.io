const fs = require('fs');
const path = require('path');

const contentPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/018c3799-c030-4eaf-a4a1-4aac2d61a678/.system_generated/steps/709/content.md';
const content = fs.readFileSync(contentPath, 'utf8');

// Regex to find all anchor tags with href and text
const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
let match;
const gamesFound = [];

while ((match = aRegex.exec(content)) !== null) {
  const href = match[1];
  const innerHtml = match[2];
  // Strip tags from innerHtml
  const text = innerHtml.replace(/<[^>]+>/g, '').trim();
  
  if (href.includes('/view/classroom6x/') && text && text.length > 1 && text.length < 60) {
    // Exclude generic navigation
    const lower = text.toLowerCase();
    if (!['home', 'games', 'contact', 'about', 'privacy', 'terms', 'classroom 6x'].includes(lower)) {
      gamesFound.push({ href, title: text });
    }
  }
}

console.log('Total potential game links found:', gamesFound.length);
console.log('Sample games found:', gamesFound.slice(0, 25));

// Also check all hrefs
const hrefRegex = /href=["']([^"']+)["']/gi;
const allHrefs = new Set();
while ((match = hrefRegex.exec(content)) !== null) {
  allHrefs.add(match[1]);
}

const classroomSubpages = [...allHrefs].filter(h => h.includes('/view/classroom6x/') && !h.endsWith('/view/classroom6x/'));
console.log('Total subpages in classroom6x:', classroomSubpages.length);
console.log('Sample subpages:', classroomSubpages.slice(0, 30));
