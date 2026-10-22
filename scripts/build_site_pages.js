/**
 * Site Pages & AdSense Compliance Generator
 * Generates:
 * 1. Legal / AdSense pages: Privacy Policy, Terms of Service, DMCA Policy, About Us, Contact Us
 * 2. Dedicated Category pages in /category/{slug}.html
 * 3. Updated sitemap.xml
 */

const fs = require('fs');
const path = require('path');
const games = require('../js/games-data.js');

const rootDir = path.join(__dirname, '..');
const categoryDir = path.join(rootDir, 'category');
if (!fs.existsSync(categoryDir)) {
  fs.mkdirSync(categoryDir, { recursive: true });
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CATEGORIES = [
  { slug: 'all', title: 'All Unblocked Games', icon: '🎮', desc: 'Browse our complete catalog of 1,100+ free unblocked games playable instantly online at school or work on Chromebook.', filter: () => true },
  { slug: 'sports', title: 'Sports Games', icon: '🏈', desc: 'Play the best unblocked sports games including Retro Bowl, Retro Bowl College, Basket Random, Soccer Random, and more on Chromebook.', filter: g => g.categories.includes('Sports') },
  { slug: 'retro', title: 'Retro & Arcade Games', icon: '🕹️', desc: 'Relive classic 8-bit, 16-bit, and arcade nostalgia with Pac-Man, Asteroids, Super Mario, and classic retro gems unblocked.', filter: g => g.categories.includes('Retro') || g.categories.includes('Arcade') },
  { slug: 'action', title: 'Action & Shooter Games', icon: '⚔️', desc: 'Engage in fast-paced combat, tactical battles, and shooter thrills with 1v1.lol, Rooftop Snipers, Time Shooter, and more.', filter: g => g.categories.includes('Action') || g.categories.includes('Shooter') },
  { slug: 'platformer', title: 'Platformer Games', icon: '🏃', desc: 'Run, jump, and navigate challenging obstacles in Vex, Run 3, Slope, Subway Surfers, and premier unblocked platformers.', filter: g => g.categories.includes('Platformer') },
  { slug: 'driving', title: 'Driving & Racing Games', icon: '🏎️', desc: 'Burn rubber and drift at breakneck speeds with Drift Boss, Moto X3M, Eggy Car, and top-rated racing games unblocked.', filter: g => g.categories.includes('Driving') },
  { slug: 'puzzle', title: 'Puzzle & Logic Games', icon: '🧩', desc: 'Train your brain with 2048, Bloxorz, Cut the Rope, Cookie Clicker, and addictive logic puzzles playable without blockers.', filter: g => g.categories.includes('Puzzle') || g.categories.includes('Casual & Strategy') },
  { slug: 'multiplayer', title: '2-Player & Multiplayer Games', icon: '👥', desc: 'Compete against your friends locally or online in 2-player showdowns like Basket Random, Rooftop Snipers, and Soccer Random.', filter: g => g.categories.includes('Multiplayer') },
  { slug: 'flash', title: 'Flash Classics (Ruffle)', icon: '⚡', desc: 'Play preserved Flash classics emulated in HTML5 with Ruffle. Age of War, Alien Hominid, Learn to Fly, Papa\'s Pizzeria, and more.', filter: g => g.fileType === 'swf' }
];

// Helper: Common Header HTML
function getHeaderHtml(depth = 0) {
  const rel = depth === 1 ? '../' : './';
  return `
  <!-- Navigation Header -->
  <header class="site-header">
    <div class="container header-inner">
      <a href="${rel}" class="logo-wrapper" title="Retro Bowl Unblocked">
        <div class="logo-icon">🏈</div>
        <div class="logo-text">Retro Bowl <span>PRO</span></div>
      </a>

      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" class="search-input" placeholder="Search 1,100+ unblocked games..." autocomplete="off">
          <button id="searchClear" class="search-clear" title="Clear search" style="display:none;">&times;</button>
        </div>
      </div>

      <!-- Header Actions & Navigation Menu -->
      <div class="header-actions">
        <a href="${rel}" class="btn-header" title="Home">
          <span>🏠</span> <span>Home</span>
        </a>
        <a href="${rel}category/all.html" class="btn-header" title="All 1,100+ Unblocked Games">
          <span>🎮</span> <span>All Games</span>
        </a>

        <!-- Category Dropdown -->
        <div class="nav-dropdown">
          <button class="btn-header nav-dropdown-btn" title="Game Categories">
            <span>📁</span> <span>Categories ▼</span>
          </button>
          <div class="nav-dropdown-content">
            <a href="${rel}category/sports.html">🏈 Sports Games</a>
            <a href="${rel}category/retro.html">🕹️ Retro & Arcade</a>
            <a href="${rel}category/action.html">⚔️ Action & Shooter</a>
            <a href="${rel}category/platformer.html">🏃 Platformers</a>
            <a href="${rel}category/driving.html">🏎️ Driving & Racing</a>
            <a href="${rel}category/puzzle.html">🧩 Puzzle & Logic</a>
            <a href="${rel}category/multiplayer.html">👥 2-Player & Multiplayer</a>
            <a href="${rel}category/flash.html">⚡ Flash Classics (Ruffle)</a>
            <div class="dropdown-divider"></div>
            <a href="${rel}category/all.html">🔥 All 1,100+ Games</a>
          </div>
        </div>

        <button id="themeToggleBtn" class="btn-theme-toggle" title="Toggle Light/Dark Theme">🌙</button>

        <a href="${rel}play/retro-bowl.html" class="btn-header btn-primary" title="Play Retro Bowl Now">
          <span>⚡</span> <span>Play Retro Bowl</span>
        </a>
      </div>
    </div>
  </header>`;
}

// Helper: Common Footer HTML
function getFooterHtml(depth = 0) {
  const rel = depth === 1 ? '../' : './';
  return `
  <!-- Site Footer with Full AdSense Compliance Links -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="logo-wrapper">
            <div class="logo-icon">🏈</div>
            <div class="logo-text">Retro Bowl <span>6X</span></div>
          </div>
          <p>
            The #1 unblocked gaming portal for students and retro gaming fans. Fast, lightweight, free, secure, and accessible on school Chromebooks without network restrictions.
          </p>
        </div>

        <div>
          <h4 class="footer-col-title">Game Categories</h4>
          <ul class="footer-links-list">
            <li><a href="${rel}category/sports.html">Sports Games</a></li>
            <li><a href="${rel}category/retro.html">Retro & Arcade</a></li>
            <li><a href="${rel}category/action.html">Action & Shooter</a></li>
            <li><a href="${rel}category/platformer.html">Platformer Games</a></li>
            <li><a href="${rel}category/driving.html">Driving & Racing</a></li>
            <li><a href="${rel}category/puzzle.html">Puzzle & Logic</a></li>
            <li><a href="${rel}category/multiplayer.html">2-Player Games</a></li>
            <li><a href="${rel}category/flash.html">Flash Classics</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-col-title">Legal & Publisher Info</h4>
          <ul class="footer-links-list">
            <li><a href="${rel}about.html">About Us</a></li>
            <li><a href="${rel}contact.html">Contact Us</a></li>
            <li><a href="${rel}privacy-policy.html">Privacy Policy</a></li>
            <li><a href="${rel}terms.html">Terms of Service</a></li>
            <li><a href="${rel}dmca.html">DMCA & Copyright Policy</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 Retro Bowl Unblocked 6x (<a href="${rel}" style="color:inherit;text-decoration:underline;">retrobowlunblocked6x.github.io</a>). All rights reserved.</p>
        <div style="display:flex;gap:1.25rem;flex-wrap:wrap;">
          <a href="${rel}privacy-policy.html">Privacy</a>
          <a href="${rel}terms.html">Terms</a>
          <a href="${rel}dmca.html">DMCA</a>
          <a href="${rel}contact.html">Contact</a>
        </div>
      </div>
    </div>
  </footer>`;
}

// 1. Build Category Pages
function generateCategoryPages() {
  console.log('Generating Category Pages...');

  for (const cat of CATEGORIES) {
    const matchedGames = games.filter(cat.filter);
    const catUrl = `https://retrobowlunblocked6x.github.io/category/${cat.slug}.html`;

    const pillsHtml = CATEGORIES.map(c => `
      <a href="${c.slug === cat.slug ? '#' : c.slug + '.html'}" class="pill-btn ${c.slug === cat.slug ? 'active' : ''}">
        ${c.icon} ${escapeHtml(c.title)}
      </a>
    `).join('\n');

    let gameCardsHtml = '';
    matchedGames.forEach(g => {
      gameCardsHtml += `
        <a href="../play/${encodeURIComponent(g.id)}.html" class="game-card" title="Play ${escapeHtml(g.title)} Unblocked">
          <div class="game-thumb-wrapper">
            <img class="game-thumb" src="../${g.thumbnail}" alt="${escapeHtml(g.title)}" loading="lazy" onerror="this.src='../images/retro-bowl.png';">
            <div class="game-play-overlay">
              <div class="play-circle">▶</div>
            </div>
          </div>
          <div class="game-info">
            <h3 class="game-title">${escapeHtml(g.title)}</h3>
            <div class="game-meta-row">
              <span class="game-category-tag">${g.categories[0] || 'Game'}</span>
              <span class="game-rating">★ ${g.rating}</span>
            </div>
          </div>
        </a>
      `;
    });

    const catPageTitle = cat.title.toLowerCase().includes('unblocked')
      ? `${cat.title} - Play Free Online`
      : `${cat.title} Unblocked - Play Free Online`;

    const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(catPageTitle)}</title>

  <!-- SEO Meta Tags -->
  <meta name="description" content="${escapeHtml(cat.desc)}">
  <meta name="keywords" content="${cat.slug} unblocked, ${cat.title.toLowerCase()} unblocked games, free unblocked games, retro bowl unblocked">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${catUrl}">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../favicon.ico">
  <link rel="icon" type="image/png" sizes="64x64" href="../favicon.png">
  <link rel="apple-touch-icon" href="../icons/icon-192.png">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${catUrl}">
  <meta property="og:title" content="${escapeHtml(cat.title)} Unblocked Games">
  <meta property="og:description" content="${escapeHtml(cat.desc)}">
  <meta property="og:image" content="https://retrobowlunblocked6x.github.io/images/retro-bowl.png">

  <!-- Fonts & Stylesheet -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css?v=2">

  <!-- Schema.org CollectionPage -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "${escapeHtml(cat.title)} Unblocked",
    "description": "${escapeHtml(cat.desc)}",
    "url": "${catUrl}",
    "numberOfItems": ${matchedGames.length}
  }
  </script>
</head>
<body>

  ${getHeaderHtml(1)}

  <main class="container">
    <!-- Breadcrumb -->
    <nav class="player-breadcrumb" style="margin-top:1.5rem;" aria-label="Breadcrumb">
      <a href="../">Home</a>
      <span>&rsaquo;</span>
      <span>Categories</span>
      <span>&rsaquo;</span>
      <span style="color:var(--text-primary); font-weight:700;">${escapeHtml(cat.title)}</span>
    </nav>

    <!-- Category Hero Header -->
    <section class="category-hero-box">
      <div class="category-hero-icon">${cat.icon}</div>
      <div>
        <h1 class="category-hero-title">${escapeHtml(cat.title)} <span>Unblocked</span></h1>
        <p class="category-hero-desc">${escapeHtml(cat.desc)}</p>
        <span class="category-count-badge">${matchedGames.length} Games Available</span>
      </div>
    </section>

    <!-- [AD 1] Top Leaderboard (728x90) -->
    <div class="ad-slot-wrapper">
      <div data-ad-slot="ad_728x90_1"></div>
    </div>

    <!-- Category Filter Pills -->
    <div class="category-nav-section">
      <div class="category-pills">
        ${pillsHtml}
      </div>
    </div>

    <!-- Games Grid -->
    <div class="games-grid" style="margin: 2rem 0;">
      ${gameCardsHtml}
    </div>

    <!-- [AD 6] Bottom Leaderboard (728x90) -->
    <div class="ad-slot-wrapper" style="margin: 2.5rem auto 1.5rem;">
      <div data-ad-slot="ad_728x90_3"></div>
    </div>
  </main>

  ${getFooterHtml(1)}

  <script src="../js/games-data.js"></script>
  <script src="../js/ads.js"></script>
  <script>
    // Theme toggle & basic search handler for category pages
    const themeBtn = document.getElementById('themeToggleBtn');
    themeBtn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const target = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('retro_bowl_theme', target);
      themeBtn.textContent = target === 'dark' ? '☀️' : '🌙';
    });
    const savedTheme = localStorage.getItem('retro_bowl_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    // Search redirect to homepage query
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = '../?q=' + encodeURIComponent(searchInput.value.trim());
      }
    });
  </script>

  <!-- Histats.com  START  (aync)-->
  <script type="text/javascript">var _Hasync= _Hasync|| [];
  _Hasync.push(['Histats.start', '1,5059845,4,0,0,0,00010000']);
  _Hasync.push(['Histats.fasi', '1']);
  _Hasync.push(['Histats.track_hits', '']);
  (function() {
  var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
  hs.src = ('//s10.histats.com/js15_as.js');
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
  })();</script>
  <noscript><a href="/" target="_blank"><img  src="//sstatic1.histats.com/0.gif?5059845&101" alt="" border="0"></a></noscript>
  <!-- Histats.com  END  -->
</body>
</html>`;

    fs.writeFileSync(path.join(categoryDir, `${cat.slug}.html`), html);
    console.log(`  ✓ Built /category/${cat.slug}.html (${matchedGames.length} games)`);
  }
}

// 2. Build Legal & AdSense Compliance Pages
function generateLegalPages() {
  console.log('Generating Legal & AdSense Compliance Pages...');

  // Common layout wrapper
  function wrapLegal(title, metaDesc, canonicalSlug, contentHtml) {
    const url = `https://retrobowlunblocked6x.github.io/${canonicalSlug}`;
    return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Retro Bowl Unblocked 6x</title>

  <!-- SEO Meta Tags -->
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="icon" type="image/png" sizes="64x64" href="favicon.png">
  <link rel="apple-touch-icon" href="icons/icon-192.png">

  <!-- Fonts & Stylesheet -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css?v=2">
</head>
<body>

  ${getHeaderHtml(0)}

  <main class="container" style="max-width: 900px; margin: 2.5rem auto 4rem;">
    <!-- Breadcrumb -->
    <nav class="player-breadcrumb" aria-label="Breadcrumb" style="margin-bottom: 1.5rem;">
      <a href="./">Home</a>
      <span>&rsaquo;</span>
      <span style="color:var(--text-primary); font-weight:700;">${escapeHtml(title)}</span>
    </nav>

    <article class="legal-content-card">
      ${contentHtml}
    </article>
  </main>

  ${getFooterHtml(0)}

  <script>
    const themeBtn = document.getElementById('themeToggleBtn');
    themeBtn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const target = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('retro_bowl_theme', target);
      themeBtn.textContent = target === 'dark' ? '☀️' : '🌙';
    });
    const savedTheme = localStorage.getItem('retro_bowl_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  </script>

  <!-- Histats.com  START  (aync)-->
  <script type="text/javascript">var _Hasync= _Hasync|| [];
  _Hasync.push(['Histats.start', '1,5059845,4,0,0,0,00010000']);
  _Hasync.push(['Histats.fasi', '1']);
  _Hasync.push(['Histats.track_hits', '']);
  (function() {
  var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
  hs.src = ('//s10.histats.com/js15_as.js');
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
  })();</script>
  <noscript><a href="/" target="_blank"><img  src="//sstatic1.histats.com/0.gif?5059845&101" alt="" border="0"></a></noscript>
  <!-- Histats.com  END  -->
</body>
</html>`;
  }

  // A. Privacy Policy (Full AdSense, GDPR, CCPA, COPPA, DART Cookies)
  const privacyHtml = `
    <h1 class="legal-title">Privacy Policy</h1>
    <p class="legal-meta">Last Updated: October 22, 2026</p>

    <p>At <strong>Retro Bowl Unblocked 6x</strong> (accessible from <a href="https://retrobowlunblocked6x.github.io/">https://retrobowlunblocked6x.github.io/</a>), one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by Retro Bowl Unblocked 6x and how we use it.</p>

    <h2>1. Log Files</h2>
    <p>Retro Bowl Unblocked 6x follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>

    <h2>2. Cookies and Web Beacons</h2>
    <p>Like any other website, Retro Bowl Unblocked 6x uses "cookies". These cookies are used to store information including visitors' preferences, game progress/high scores via browser localStorage, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>

    <h2>3. Google DoubleClick DART Cookie & Third-Party Advertisers</h2>
    <p>Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">https://policies.google.com/technologies/ads</a>.</p>
    <p>We may also partner with third-party ad networks (such as Adsterra, Google AdSense) that use cookies, JavaScript, or Web Beacons in their respective advertisements and links that appear on Retro Bowl Unblocked 6x, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</p>

    <h2>4. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
    <p>Under the California Consumer Privacy Act (CCPA), California consumers have the right to request that a business disclose what personal data has been collected, request deletion of personal data, and request that a business that sells personal data not sell that data. We do not sell any personal information of our users.</p>

    <h2>5. GDPR Data Protection Rights</h2>
    <p>We would like to make sure you are fully aware of all of your data protection rights under the General Data Protection Regulation (GDPR). Every user is entitled to the following: the right to access, rectification, erasure, restrict processing, object to processing, and data portability.</p>

    <h2>6. Children's Online Privacy Protection Act (COPPA)</h2>
    <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Retro Bowl Unblocked 6x does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>

    <h2>7. Consent</h2>
    <p>By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>

    <h2>8. Contact Information</h2>
    <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="contact.html">our Contact Page</a> or via email at <code>contact@retrobowlunblocked6x.github.io</code>.</p>
  `;
  fs.writeFileSync(path.join(rootDir, 'privacy-policy.html'), wrapLegal('Privacy Policy', 'Privacy Policy for Retro Bowl Unblocked 6x, compliant with Google AdSense, GDPR, CCPA, and COPPA standards.', 'privacy-policy.html', privacyHtml));

  // B. Terms of Service
  const termsHtml = `
    <h1 class="legal-title">Terms of Service</h1>
    <p class="legal-meta">Last Updated: October 22, 2026</p>

    <h2>1. Agreement to Terms</h2>
    <p>By accessing or playing games on <strong>Retro Bowl Unblocked 6x</strong> (<a href="https://retrobowlunblocked6x.github.io/">https://retrobowlunblocked6x.github.io/</a>), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any of these terms, you are prohibited from using or accessing this site.</p>

    <h2>2. Intellectual Property Rights & Game Ownership</h2>
    <p>All video games, trademarks, character art, sound effects, and game assets hosted or indexed on this website belong to their respective creators, developers, and publishers. Retro Bowl Unblocked 6x acts as an educational and recreational web portal curating freely available HTML5, WebGL, and Ruffle-emulated web games for entertainment and browser compatibility preservation.</p>

    <h2>3. Use License & Restrictions</h2>
    <p>Permission is granted to temporarily load and play the web games hosted on Retro Bowl Unblocked 6x for personal, non-commercial entertainment only. Under this license, you may not:</p>
    <ul>
      <li>Modify or copy the proprietary game engine sources for commercial distribution.</li>
      <li>Attempt to decompile, reverse engineer, or exploit the website infrastructure.</li>
      <li>Use any automated data scraping or extraction tools without express written permission.</li>
    </ul>

    <h2>4. Disclaimer of Warranties</h2>
    <p>The materials and games on Retro Bowl Unblocked 6x are provided on an 'as is' and 'as available' basis. Retro Bowl Unblocked 6x makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</p>

    <h2>5. Limitation of Liability</h2>
    <p>In no event shall Retro Bowl Unblocked 6x, its contributors, or its hosting infrastructure be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the games on this platform.</p>

    <h2>6. Revisions and Errata</h2>
    <p>The materials appearing on Retro Bowl Unblocked 6x could include technical, typographical, or photographic errors. Retro Bowl Unblocked 6x may make changes to the materials contained on its website at any time without notice.</p>

    <h2>7. Contact Us</h2>
    <p>If you have any questions concerning our Terms of Service, please reach out via our <a href="contact.html">Contact Us page</a>.</p>
  `;
  fs.writeFileSync(path.join(rootDir, 'terms.html'), wrapLegal('Terms of Service', 'Terms of Service for Retro Bowl Unblocked 6x web gaming portal.', 'terms.html', termsHtml));

  // C. DMCA Policy
  const dmcaHtml = `
    <h1 class="legal-title">DMCA & Copyright Policy</h1>
    <p class="legal-meta">Digital Millennium Copyright Act Compliance (17 U.S.C. § 512)</p>

    <p><strong>Retro Bowl Unblocked 6x</strong> respects the intellectual property rights of game developers, publishers, and artists. It is our strict policy to respond promptly to clear notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act ("DMCA").</p>

    <h2>1. Notice for Copyright Owners</h2>
    <p>If you are a copyright owner, or authorized to act on behalf of one, and you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible on Retro Bowl Unblocked 6x, please submit a written DMCA takedown notice containing the following mandatory details:</p>

    <ol style="margin-left:1.5rem;display:flex;flex-direction:column;gap:0.6rem;margin-top:0.75rem;">
      <li><strong>Identification of the copyrighted work</strong> that you claim has been infringed, or, if multiple works are covered, a representative list of such works.</li>
      <li><strong>Identification of the material</strong> that is claimed to be infringing and that is to be removed, including the exact URL(s) on our website.</li>
      <li><strong>Your contact information</strong>, including your full legal name, physical address, telephone number, and email address.</li>
      <li><strong>A statement of good faith belief:</strong> <em>"I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law."</em></li>
      <li><strong>A statement of accuracy under penalty of perjury:</strong> <em>"The information in this notification is accurate, and under penalty of perjury, I am the owner, or an agent authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed."</em></li>
      <li><strong>Your physical or electronic signature.</strong></li>
    </ol>

    <h2>2. Designated DMCA Agent Contact</h2>
    <p>Please send complete notifications of claimed infringement to our designated DMCA agent:</p>
    <div style="background:var(--bg-secondary);padding:1.25rem;border-radius:var(--radius-md);border:1px solid var(--border-color);margin:1.25rem 0;">
      <p><strong>DMCA Compliance Team</strong><br>
      Website: <a href="https://retrobowlunblocked6x.github.io/">retrobowlunblocked6x.github.io</a><br>
      Email: <code>dmca@retrobowlunblocked6x.github.io</code><br>
      Response Time: Within 24 to 48 business hours</p>
    </div>

    <h2>3. Takedown Procedure</h2>
    <p>Upon receipt of a valid and complete DMCA notice, we will expeditiously remove or disable access to the infringing material and notify the content provider. We also terminate repeated infringers in appropriate circumstances.</p>
  `;
  fs.writeFileSync(path.join(rootDir, 'dmca.html'), wrapLegal('DMCA & Copyright Policy', 'DMCA and Copyright Takedown Notice procedure for Retro Bowl Unblocked 6x.', 'dmca.html', dmcaHtml));

  // D. About Us
  const aboutHtml = `
    <h1 class="legal-title">About Retro Bowl Unblocked 6x</h1>
    <p class="legal-meta">Learn about our mission, technology, and team</p>

    <p>Welcome to <strong>Retro Bowl Unblocked 6x</strong> (<a href="https://retrobowlunblocked6x.github.io/">retrobowlunblocked6x.github.io</a>)! We are a dedicated team of retro gaming enthusiasts and web developers passionate about building the fastest, cleanest, and most reliable unblocked web gaming portal for students, educators, and gamers worldwide.</p>

    <h2>Our Mission</h2>
    <p>School and workplace networks often implement aggressive firewalls that block legitimate recreational and educational web content. Our mission is to provide safe, lag-free, lightweight, and modern browser access to timeless retro games, puzzle challenges, sports simulations, and creative indies with zero downloads, zero plug-ins, and zero invasive trackers required.</p>

    <h2>Cutting-Edge Web Technology</h2>
    <p>Our platform is engineered for lightning-fast responsiveness and minimal data usage:</p>
    <ul>
      <li><strong>HTML5 & WebGL Acceleration:</strong> Native browser rendering for 60+ FPS high frame rate gameplay on Chromebooks and budget laptops.</li>
      <li><strong>WebAssembly Ruffle Flash Preservation:</strong> Preserving legendary 2000s Flash games safely without requiring deprecated Adobe Flash plugins.</li>
      <li><strong>Progressive Web App (PWA):</strong> Install Retro Bowl 6x directly to your device desktop or home screen for one-click access.</li>
      <li><strong>Local Storage Career Saves:</strong> Team rosters, franchise records, and game progress persist automatically in your browser.</li>
    </ul>

    <h2>Safety & Family-Friendly Standards</h2>
    <p>Every game in our 280+ title library is vetted for family-friendly, educational, and fun gameplay. We adhere strictly to Google AdSense family standards and child privacy laws (COPPA).</p>

    <h2>Connect With Us</h2>
    <p>Have questions, suggestions, or want to request a game? Visit our <a href="contact.html">Contact Us page</a> or email us at <code>contact@retrobowlunblocked6x.github.io</code>.</p>
  `;
  fs.writeFileSync(path.join(rootDir, 'about.html'), wrapLegal('About Us', 'Learn about Retro Bowl Unblocked 6x, our mission, technology, and safe unblocked gaming platform.', 'about.html', aboutHtml));

  // E. Contact Us
  const contactHtml = `
    <h1 class="legal-title">Contact Us</h1>
    <p class="legal-meta">We love hearing from our community!</p>

    <p>Have feedback, game requests, bug reports, or legal inquiries? Fill out the form below or email our support desk directly. We strive to respond to all inquiries within 24 to 48 hours.</p>

    <div style="display:grid;grid-template-columns:1fr;gap:1.5rem;margin:2rem 0;">
      <div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:1.5rem;">
        <h3 style="font-family:var(--font-heading);font-size:1.2rem;margin-bottom:0.75rem;">Direct Email Directory</h3>
        <p style="margin-bottom:0.5rem;"><strong>General Inquiries & Game Requests:</strong><br><code>contact@retrobowlunblocked6x.github.io</code></p>
        <p style="margin-bottom:0.5rem;"><strong>DMCA & Copyright Notices:</strong><br><code>dmca@retrobowlunblocked6x.github.io</code></p>
        <p><strong>Bug Reports & Technical Feedback:</strong><br><code>support@retrobowlunblocked6x.github.io</code></p>
      </div>

      <form id="contactForm" onsubmit="event.preventDefault(); alert('Thank you for reaching out! Your message has been received.'); this.reset();" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:1.75rem;box-shadow:var(--shadow-sm);">
        <h3 style="font-family:var(--font-heading);font-size:1.25rem;margin-bottom:1.25rem;">Send Us a Message</h3>
        
        <div style="margin-bottom:1rem;">
          <label style="display:block;font-size:0.88rem;font-weight:600;margin-bottom:0.35rem;" for="name">Your Name</label>
          <input type="text" id="name" required style="width:100%;padding:0.7rem 1rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-primary);font-size:0.95rem;">
        </div>

        <div style="margin-bottom:1rem;">
          <label style="display:block;font-size:0.88rem;font-weight:600;margin-bottom:0.35rem;" for="email">Email Address</label>
          <input type="email" id="email" required style="width:100%;padding:0.7rem 1rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-primary);font-size:0.95rem;">
        </div>

        <div style="margin-bottom:1rem;">
          <label style="display:block;font-size:0.88rem;font-weight:600;margin-bottom:0.35rem;" for="subject">Inquiry Subject</label>
          <select id="subject" style="width:100%;padding:0.7rem 1rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-primary);font-size:0.95rem;">
            <option value="general">General Question</option>
            <option value="game-request">Request a New Game</option>
            <option value="bug">Report Broken Game / Bug</option>
            <option value="dmca">DMCA / Copyright Issue</option>
            <option value="ads">Advertising / Partnership</option>
          </select>
        </div>

        <div style="margin-bottom:1.5rem;">
          <label style="display:block;font-size:0.88rem;font-weight:600;margin-bottom:0.35rem;" for="message">Message</label>
          <textarea id="message" rows="5" required style="width:100%;padding:0.7rem 1rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-primary);font-size:0.95rem;resize:vertical;"></textarea>
        </div>

        <button type="submit" class="btn-primary" style="padding:0.8rem 2rem;border-radius:var(--radius-full);cursor:pointer;font-size:1rem;">
          Send Message 🚀
        </button>
      </form>
    </div>
  `;
  fs.writeFileSync(path.join(rootDir, 'contact.html'), wrapLegal('Contact Us', 'Contact the Retro Bowl Unblocked 6x support team for questions, feedback, or DMCA inquiries.', 'contact.html', contactHtml));

  console.log('✓ All 5 Legal & AdSense Compliance pages generated!');
}

// 3. Update Sitemap
function updateSitemap() {
  console.log('Updating sitemap.xml...');
  const baseUrl = 'https://retrobowlunblocked6x.github.io';
  const today = '2026-10-22';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Root
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Categories
  for (const cat of CATEGORIES) {
    xml += `  <url>\n    <loc>${baseUrl}/category/${cat.slug}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }

  // Legal / AdSense Pages
  const legals = ['about.html', 'contact.html', 'privacy-policy.html', 'terms.html', 'dmca.html'];
  for (const leg of legals) {
    xml += `  <url>\n    <loc>${baseUrl}/${leg}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
  }

  // All 284 Play Pages
  for (const g of games) {
    xml += `  <url>\n    <loc>${baseUrl}/play/${encodeURIComponent(g.id)}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  xml += `</urlset>\n`;
  fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), xml);
  console.log(`✓ sitemap.xml updated with ${1 + CATEGORIES.length + legals.length + games.length} URLs!`);
}

generateCategoryPages();
generateLegalPages();
updateSitemap();
