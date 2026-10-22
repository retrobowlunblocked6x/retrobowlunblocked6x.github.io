const https = require('https');
const fs = require('fs');

const newGames = JSON.parse(fs.readFileSync('scripts/new_games_list.json', 'utf8'));

// Test fetching the first 5 games
async function fetchPage(slug) {
  return new Promise((resolve) => {
    https.get(`https://sites.google.com/view/classroom6x/${slug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ slug, html: data });
      });
    }).on('error', () => resolve({ slug, html: '' }));
  });
}

async function run() {
  const sample = newGames.slice(0, 5);
  for (const g of sample) {
    console.log(`Fetching ${g.slug}...`);
    const { html } = await fetchPage(g.slug);
    
    // Look for iframes or atari embeds
    const iframes = [...html.matchAll(/<iframe\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
    const atari = [...html.matchAll(/data-url=["']([^"']+)["']/gi)].map(m => m[1]);
    
    // Also look for external links
    const externalLinks = [...html.matchAll(/href=["'](https?:\/\/(?!sites\.google|www\.gstatic|fonts\.googleapis|www\.google|accounts\.google)[^"']+)["']/gi)].map(m => m[1]);

    console.log(`[${g.slug}] iframes:`, iframes);
    console.log(`[${g.slug}] atari:`, atari);
    console.log(`[${g.slug}] externalLinks:`, externalLinks);
  }
}

run();
