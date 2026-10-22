const https = require('https');
const fs = require('fs');
const path = require('path');

const newGames = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_games_list.json'), 'utf8'));

function fetchUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function extractGameSource(html, slug) {
  if (!html) return null;

  // 1. Check for data-code with gameXmlUrl
  const xmlMatch = html.match(/gameXmlUrl=(?:&quot;|")data:[^,]+,([^"&]+)(?:&quot;|")/);
  if (xmlMatch) {
    try {
      const decoded = Buffer.from(xmlMatch[1], 'base64').toString('utf8');
      const cdata = decoded.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
      if (cdata && cdata[1].length > 500) {
        return { type: 'local_html', content: cdata[1] };
      }
    } catch (e) {}
  }

  // 2. Check for data='<iframe ... src="https://script.google.com/macros/s/.../exec"
  const macroMatch = html.match(/https:\/\/script\.google\.com\/macros\/s\/([a-zA-Z0-9_-]+)\/exec/);
  if (macroMatch) {
    return { type: 'macro_exec', url: macroMatch[0] };
  }

  // 3. Check for external direct game domains (e.g. kartbros.io, smashkarts.io, hazmob)
  const extMatch = html.match(/https?:\/\/(?!sites\.google|www\.gstatic|fonts\.googleapis|www\.google|accounts\.google|schema\.org|w3\.org)[a-zA-Z0-9.-]+\.[a-z]{2,}(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)?/i);
  if (extMatch) {
    return { type: 'external_url', url: extMatch[0] };
  }

  return null;
}

async function run() {
  console.log(`Analyzing game sources for ${newGames.length} games...`);
  const results = [];
  const concurrency = 6;
  
  for (let i = 0; i < newGames.length; i += concurrency) {
    const chunk = newGames.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (g) => {
      const pageUrl = `https://sites.google.com/view/classroom6x/${g.slug}`;
      const html = await fetchUrl(pageUrl);
      const src = extractGameSource(html, g.slug);
      
      results.push({
        ...g,
        source: src
      });
      console.log(`[${results.length}/${newGames.length}] ${g.slug}: ${src ? src.type : 'none'}`);
    }));
  }

  fs.writeFileSync(path.join(__dirname, 'classroom_sources.json'), JSON.stringify(results, null, 2));
  console.log('Saved to scripts/classroom_sources.json');
}

run();
