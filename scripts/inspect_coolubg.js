const https = require('https');

async function testUrl(url) {
  const res = await fetch(url);
  console.log(url, res.status);
  if (res.ok) {
    const text = await res.text();
    console.log('Sample:', text.slice(0, 300));
  }
}

async function run() {
  await testUrl('https://coolubg2.github.io/coolubg-list/papas-pizzeria.swf');
  await testUrl('https://coolubg2.github.io/papas-pizzeria.html');
  await testUrl('https://coolubg2.github.io/games.js');
}

run().catch(console.error);
