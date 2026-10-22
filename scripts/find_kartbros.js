const fs = require('fs');

const content = fs.readFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/018c3799-c030-4eaf-a4a1-4aac2d61a678/.system_generated/steps/727/content.md', 'utf8');

let idx = 0;
while ((idx = content.toLowerCase().indexOf('kartbros', idx)) !== -1) {
  console.log('--- Found kartbros at', idx, '---');
  console.log(content.slice(Math.max(0, idx - 200), idx + 300));
  idx += 8;
}
