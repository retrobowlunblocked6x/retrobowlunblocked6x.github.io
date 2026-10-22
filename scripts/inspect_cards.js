const fs = require('fs');

const contentPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/018c3799-c030-4eaf-a4a1-4aac2d61a678/.system_generated/steps/709/content.md';
const content = fs.readFileSync(contentPath, 'utf8');

// Look for image and link pairings in Google Sites DOM
// In Google Sites, a card often has an <a> with an <img> inside or adjacent
const cardRegex = /<a\s+[^>]*href=["'](\/view\/classroom6x\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
let match;
const items = [];

while ((match = cardRegex.exec(content)) !== null) {
  const href = match[1];
  const inner = match[2];
  
  // check if inner has img
  const imgMatch = inner.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
  const text = inner.replace(/<[^>]+>/g, '').trim();
  
  items.push({
    href,
    text,
    hasImg: !!imgMatch,
    imgSrc: imgMatch ? imgMatch[1] : null
  });
}

console.log('Total a tags with classroom6x href:', items.length);
const withImg = items.filter(i => i.hasImg);
console.log('With image:', withImg.length);
console.log('Sample with image:', withImg.slice(0, 10));

const nonNav = items.filter(i => !['home', 'contact-us', 'unblocked-games'].some(x => i.href.includes(x)));
console.log('Non-nav items:', nonNav.length);
