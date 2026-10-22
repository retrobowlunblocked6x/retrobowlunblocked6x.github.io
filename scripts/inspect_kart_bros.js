const fs = require('fs');

const content = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/018c3799-c030-4eaf-a4a1-4aac2d61a678/.system_generated/steps/727/content.md', 'utf8');

// Find iframe src, embed src, or object data
const iframeMatches = [...content.matchAll(/<iframe\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
console.log('Iframe srcs:', iframeMatches);

// Find any links to external game hosts or github or google drive
const allUrls = [...content.matchAll(/https?:\/\/[^\s"'<>\\]+/gi)].map(m => m[0]);
const interestingUrls = allUrls.filter(u => 
  !u.includes('google.com/sites') && 
  !u.includes('gstatic.com') && 
  !u.includes('googleapis.com') && 
  !u.includes('w3.org') &&
  !u.includes('schema.org')
);
console.log('Interesting URLs:', [...new Set(interestingUrls)]);
