const fs = require('fs');

const content = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/018c3799-c030-4eaf-a4a1-4aac2d61a678/.system_generated/steps/727/content.md', 'utf8');

const idx = content.indexOf('inner-frame-minified.html');
if (idx !== -1) {
  console.log(content.slice(Math.max(0, idx - 400), idx + 600));
} else {
  console.log('Not found');
}
