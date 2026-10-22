const fs = require('fs');

const content = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/018c3799-c030-4eaf-a4a1-4aac2d61a678/.system_generated/steps/727/content.md', 'utf8');

// Find all iframe tags with their full attributes
const iframes = [...content.matchAll(/<iframe[\s\S]*?<\/iframe>/gi)];
console.log('Total iframes found in kart-bros page:', iframes.length);
iframes.forEach((ifr, i) => {
  console.log(`--- Iframe ${i} ---`);
  console.log(ifr[0].slice(0, 500));
});

// Also search for "atari-embeds" or "embed" or data attributes
const atariMatches = [...content.matchAll(/data-[^=]+="[^"]*atari-embeds[^"]*"/gi)];
console.log('Atari matches:', atariMatches.map(m => m[0]));
