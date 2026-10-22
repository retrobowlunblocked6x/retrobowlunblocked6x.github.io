/**
 * Retro Bowl Unblocked 6x - Game Player Controller
 * Seamless Local & Remote Execution, Ruffle SWF Emulator, Fullscreen,
 * Theater Mode, Interactive User Rating & Dynamic Schema.org Snippet, PWA Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // Service Worker Registration for PWA
  if ('serviceWorker' in navigator) {
    const swPath = window.location.pathname.includes('/play/') ? '../sw.js' : 'sw.js';
    navigator.serviceWorker.register(swPath).catch(err => {
      console.warn('SW registration failed:', err);
    });
  }

  // Theme Management (Default: Fresh & Clean Light Theme)
  initTheme();

  // Determine current game
  let gameId = '';
  // Check if pretty permalink format: /play/title-game.html
  const pathParts = window.location.pathname.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  if (lastPart && lastPart.endsWith('.html') && lastPart !== 'play.html' && lastPart !== 'index.html') {
    gameId = lastPart.replace('.html', '');
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    gameId = urlParams.get('game') || 'retro-bowl';
  }

  if (typeof GAMES_DATA === 'undefined') {
    console.error('GAMES_DATA not available.');
    return;
  }

  const currentGame = GAMES_DATA.find(g => g.id === gameId) || GAMES_DATA[0];

  initPlayer(currentGame);

  function initPlayer(game) {
    // Save to recently played
    addToRecentlyPlayed(game.id);

    // Update Page Meta & SEO Schema
    updateSEO(game);

    // DOM Elements
    const gameScreenWrapper = document.getElementById('gameScreenWrapper');
    const gameIframe = document.getElementById('gameIframe');
    const pregameOverlay = document.getElementById('pregameOverlay');
    const startPlayBtn = document.getElementById('startPlayBtn');
    const pregameGameTitle = document.getElementById('pregameGameTitle');
    const pregameCategory = document.getElementById('pregameCategory');

    const toolbarGameTitle = document.getElementById('toolbarGameTitle');
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnTheater = document.getElementById('btnTheater');
    const btnReload = document.getElementById('btnReload');
    const btnFavorite = document.getElementById('btnFavorite');
    const btnShare = document.getElementById('btnShare');

    const gameTitleH1 = document.getElementById('gameTitleH1');
    const gameTagsList = document.getElementById('gameTagsList');
    const gameDescBody = document.getElementById('gameDescBody');
    const controlsKeysList = document.getElementById('controlsKeysList');
    const controlsInstructions = document.getElementById('controlsInstructions');
    const gameMetaInfo = document.getElementById('gameMetaInfo');
    const relatedGamesGrid = document.getElementById('relatedGamesGrid');

    // Populate pre-game overlay
    if (pregameGameTitle) pregameGameTitle.textContent = game.title;
    if (pregameCategory) pregameCategory.textContent = game.categories.join(' • ');

    // Populate Toolbar & Details
    if (toolbarGameTitle) toolbarGameTitle.textContent = game.title;
    if (gameTitleH1) gameTitleH1.textContent = `${game.title} Unblocked`;

    // Populate Tags
    if (gameTagsList) {
      gameTagsList.innerHTML = game.categories.map(c => `
        <span class="game-tag-pill">${escapeHtml(c)}</span>
      `).join('') + `<span class="game-tag-pill" style="color:var(--accent-primary); font-weight:700;">Unblocked 6x</span>`;
    }

    // Populate Description
    if (gameDescBody) {
      gameDescBody.innerHTML = `
        <p>${escapeHtml(game.description)}</p>
        <h3>About ${escapeHtml(game.title)}</h3>
        <p>
          ${escapeHtml(game.title)} is one of the most popular unblocked games played by millions of students, gamers, and sports enthusiasts worldwide. 
          Enjoy full unblocked access without lag or installation on any school Chromebook, Windows PC, Mac, or mobile device.
        </p>
        <h3>Features</h3>
        <ul style="margin-left: 1.5rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
          <li>⚡ <strong>Zero Restrictions:</strong> 100% unblocked on school Wi-Fi and Chromebooks.</li>
          <li>🎯 <strong>High Frame Rates:</strong> Optimized canvas and WebGL rendering for ultra-smooth gameplay.</li>
          <li>💾 <strong>Auto-Save Support:</strong> Your progress and high scores are saved locally in browser storage.</li>
          <li>🖥️ <strong>Fullscreen & Theater Modes:</strong> Play with maximum immersion on any display size.</li>
        </ul>
      `;
    }

    // Populate Controls
    if (controlsKeysList && game.controls && Array.isArray(game.controls.keys)) {
      controlsKeysList.innerHTML = game.controls.keys.map(k => `
        <kbd class="kbd-key">${escapeHtml(k)}</kbd>
      `).join('');
    }
    if (controlsInstructions && game.controls) {
      controlsInstructions.textContent = game.controls.instructions || 'Use mouse clicks and arrow keys to control the game.';
    }

    // Metadata
    if (gameMetaInfo) {
      gameMetaInfo.innerHTML = `
        <div style="font-size:0.88rem;color:var(--text-muted);display:flex;flex-direction:column;gap:0.4rem;">
          <div><strong>Developer:</strong> ${escapeHtml(game.author)}</div>
          <div><strong>Release Date:</strong> ${escapeHtml(game.releaseDate)}</div>
          <div><strong>Category:</strong> ${escapeHtml(game.categories.join(', '))}</div>
          <div><strong>Technology:</strong> ${game.fileType === 'swf' ? 'Flash / Ruffle Emulator' : 'HTML5 / WebGL'}</div>
        </div>
      `;
    }

    // Initialize Interactive Rating System
    initUserRatingSystem(game);

    // Setup Start Game Action
    startPlayBtn?.addEventListener('click', () => {
      launchGame(game);
    });

    // Check favorite state
    updateFavoriteBtnState(game.id, btnFavorite);
    btnFavorite?.addEventListener('click', () => {
      toggleFavorite(game.id);
      updateFavoriteBtnState(game.id, btnFavorite);
    });

    // Fullscreen action
    btnFullscreen?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        gameScreenWrapper.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });

    // Theater mode action
    btnTheater?.addEventListener('click', () => {
      document.body.classList.toggle('theater-mode');
      btnTheater.classList.toggle('active');
    });

    // Reload game
    btnReload?.addEventListener('click', () => {
      if (gameIframe && gameIframe.src) {
        const src = gameIframe.src;
        gameIframe.src = '';
        setTimeout(() => { gameIframe.src = src; }, 50);
      }
    });

    // Share action
    btnShare?.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          const original = btnShare.innerHTML;
          btnShare.innerHTML = '✓ Copied!';
          setTimeout(() => { btnShare.innerHTML = original; }, 2000);
        });
      }
    });

    // Render Related Games
    renderRelatedGames(game, relatedGamesGrid);

    // Render Ads
    if (typeof adsManager !== 'undefined' && adsManager.initAllSlots) {
      adsManager.initAllSlots();
    }
  }

  // =========================================================================
  // Interactive User Rating System & Schema.org JSON-LD Updating
  // =========================================================================
  function initUserRatingSystem(game) {
    const starBtns = document.querySelectorAll('.star-btn');
    const ratingScoreNum = document.getElementById('ratingScoreNum');
    const ratingVoteCount = document.getElementById('ratingVoteCount');
    const ratingToast = document.getElementById('ratingToast');
    const userRatingMsg = document.getElementById('userRatingMsg');

    const ratingKey = `retro_user_rating_${game.id}`;
    let savedUserRating = parseInt(localStorage.getItem(ratingKey), 10) || 0;
    let baseVotes = Math.max(120, Math.floor(game.plays / 12));
    let baseScore = game.rating;

    // Recalculate if user already rated
    let currentScore = baseScore;
    let totalVotes = baseVotes;
    if (savedUserRating > 0) {
      totalVotes += 1;
      currentScore = parseFloat(((baseScore * baseVotes + savedUserRating) / totalVotes).toFixed(1));
    }

    function updateRatingDisplay(score, votes, userVal) {
      if (ratingScoreNum) ratingScoreNum.textContent = score.toFixed(1);
      if (ratingVoteCount) ratingVoteCount.textContent = `(${votes.toLocaleString()} votes)`;

      starBtns.forEach((btn, idx) => {
        const starVal = idx + 1;
        if (starVal <= (userVal || Math.round(score))) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (userVal > 0 && userRatingMsg) {
        userRatingMsg.textContent = `You rated this ${userVal}/5 stars!`;
      }

      // Update Schema.org JSON-LD Snippet live!
      updateSchemaSnippet(game, score, votes);
    }

    // Hover effect
    const starLabels = ['', 'Poor 😐', 'Fair 🙂', 'Good 👍', 'Great! 🔥', 'Masterpiece! 🏆'];
    starBtns.forEach((btn, idx) => {
      btn.addEventListener('mouseenter', () => {
        const hoverVal = idx + 1;
        starBtns.forEach((b, i) => {
          if (i < hoverVal) b.classList.add('hover');
          else b.classList.remove('hover');
        });
        if (userRatingMsg) userRatingMsg.textContent = starLabels[hoverVal];
      });

      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(b => b.classList.remove('hover'));
        if (savedUserRating > 0 && userRatingMsg) {
          userRatingMsg.textContent = `You rated this ${savedUserRating}/5 stars!`;
        } else if (userRatingMsg) {
          userRatingMsg.textContent = 'Click stars to rate this game!';
        }
      });

      btn.addEventListener('click', () => {
        const newRating = idx + 1;
        savedUserRating = newRating;
        localStorage.setItem(ratingKey, newRating.toString());

        totalVotes = baseVotes + 1;
        currentScore = parseFloat(((baseScore * baseVotes + newRating) / totalVotes).toFixed(1));

        updateRatingDisplay(currentScore, totalVotes, newRating);

        if (ratingToast) {
          ratingToast.style.display = 'inline-block';
          ratingToast.textContent = `✨ Rating submitted! Thank you for rating ${newRating}/5 stars.`;
          setTimeout(() => { ratingToast.style.display = 'none'; }, 3000);
        }
      });
    });

    updateRatingDisplay(currentScore, totalVotes, savedUserRating);
  }

  function updateSchemaSnippet(game, score, votes) {
    const scriptSchema = document.getElementById('schemaJsonLd');
    if (scriptSchema) {
      const isSub = window.location.pathname.includes('/play/');
      const pageUrl = isSub 
        ? `https://retrobowlunblocked6x.github.io/play/${encodeURIComponent(game.id)}.html`
        : `https://retrobowlunblocked6x.github.io/play.html?game=${encodeURIComponent(game.id)}`;

      const schemaData = {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": game.title,
        "url": pageUrl,
        "description": game.description,
        "genre": game.categories,
        "inLanguage": "en",
        "author": {
          "@type": "Person",
          "name": game.author
        },
        "operatingSystem": "Web Browser (Chrome, Safari, Edge, Firefox, Chromebook)",
        "applicationCategory": "Game",
        "playMode": "SinglePlayer",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": score.toString(),
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": votes,
          "reviewCount": votes
        }
      };
      scriptSchema.textContent = JSON.stringify(schemaData, null, 2);
    }
  }

  // Known games downloaded locally into games/ directory
  const KNOWN_LOCAL_GAMES = new Set([
    'retro-bowl', 'retro-bowl-college', 'slope', '2048', 'basket-random', 'rooftop-snipers',
    'papas-pizzeria', 'learn-to-fly-2', 'learn-to-fly-3', 'age-of-war', 'mirrors-edge-2d',
    'gluey-2', 'gravitee-2', 'asteroids', 'breaking-the-bank', 'elephant-rave-2',
    'the-impossible-quiz-2', 'dont-look-back', 'super-mario-bros-crossover', 'snailbob',
    'fireboy&watergirl', 'riddle-transfer-2'
  ]);

  // Determine game source and launch into iframe or Ruffle canvas
  function launchGame(game) {
    const pregameOverlay = document.getElementById('pregameOverlay');
    const gameIframe = document.getElementById('gameIframe');
    const gameScreenAspect = document.querySelector('.game-screen-aspect');

    if (pregameOverlay) {
      pregameOverlay.classList.add('hidden');
    }

    let gameSrc = determineGameUrl(game);

    if (game.fileType === 'swf') {
      loadRuffleSwf(gameSrc, gameScreenAspect, game);
    } else {
      gameIframe.onerror = () => {
        console.warn('Local iframe error, falling back to coolubg2 CDN');
        gameIframe.src = `https://coolubg2.github.io/coolubg-list/${game.fileName || game.id}/`;
      };
      gameIframe.src = gameSrc;
      gameIframe.focus();
    }
  }

  function determineGameUrl(game) {
    const isSub = window.location.pathname.includes('/play/');
    const prefix = isSub ? '../' : '';

    if (game.id === 'retro-bowl') {
      return `${prefix}games/retro-bowl/v1.5.9.0/index.html`;
    }
    if (game.id === 'retro-bowl-college') {
      return `${prefix}games/retro-bowl-college/game.html`;
    }

    if (game.remoteUrl) {
      return game.remoteUrl;
    }

    // Check if game exists locally
    if (KNOWN_LOCAL_GAMES.has(game.id)) {
      if (game.fileType === 'swf') {
        return `${prefix}games/${game.id}.swf`;
      }
      return `${prefix}games/${game.id}/index.html`;
    }

    // Check if game has local gamePath in repo
    if (game.gamePath && (game.author === 'Classroom6x Unblocked' || game.gamePath.startsWith('games/'))) {
      return `${prefix}${game.gamePath}`;
    }

    // Fallback for all other 200+ games so none ever fails with 404
    if (game.fileType === 'swf') {
      return `https://coolubg2.github.io/coolubg-list/${game.fileName || game.id}.swf`;
    }
    return `https://coolubg2.github.io/coolubg-list/${game.fileName || game.id}/`;
  }

  function loadRuffleSwf(swfUrl, container, game) {
    if (!container) return;
    container.innerHTML = '<div id="ruffle-player-container" style="position:absolute;inset:0;width:100%;height:100%;"></div>';

    if (!window.RufflePlayer) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@ruffle-rs/ruffle';
      script.onload = () => { embedRuffle(swfUrl, game); };
      document.head.appendChild(script);
    } else {
      embedRuffle(swfUrl, game);
    }
  }

  function embedRuffle(swfUrl, game) {
    const playerContainer = document.getElementById('ruffle-player-container');
    if (!playerContainer) return;

    const ruffle = window.RufflePlayer.newest();
    const player = ruffle.createPlayer();
    player.style.width = '100%';
    player.style.height = '100%';
    playerContainer.appendChild(player);

    player.load({
      url: swfUrl,
      parameters: '',
      allowScriptAccess: true
    }).catch(err => {
      console.warn('Ruffle failed to load SWF:', err);
      if (!swfUrl.startsWith('http') && game) {
        const fallbackUrl = `https://coolubg2.github.io/coolubg-list/${game.id}.swf`;
        console.log('Retrying Ruffle with CDN fallback:', fallbackUrl);
        player.load({
          url: fallbackUrl,
          parameters: '',
          allowScriptAccess: true
        });
      } else {
        playerContainer.innerHTML = `
          <div style="display:grid;place-items:center;height:100%;color:#fff;padding:2rem;text-align:center;">
            <p style="font-weight:700;margin-bottom:0.5rem;">Could not load Flash game.</p>
            <a href="${swfUrl}" download class="btn-primary" style="padding:0.5rem 1.25rem;border-radius:9999px;">Download .SWF File</a>
          </div>
        `;
      }
    });
  }

  function renderRelatedGames(currentGame, gridEl) {
    if (!gridEl) return;
    const cat = currentGame.categories[0] || 'Sports';
    const isSub = window.location.pathname.includes('/play/');
    const imgPrefix = isSub ? '../' : '';
    const linkPrefix = isSub ? '' : 'play/';

    let related = GAMES_DATA.filter(g => g.id !== currentGame.id && g.categories.includes(cat));
    if (related.length < 6) {
      related = GAMES_DATA.filter(g => g.id !== currentGame.id);
    }
    const sample = related.slice(0, 6);

    let html = '';
    sample.forEach(g => {
      html += `
        <a href="${linkPrefix}${encodeURIComponent(g.id)}.html" class="game-card" title="Play ${escapeHtml(g.title)}">
          <div class="game-thumb-wrapper">
            <img class="game-thumb" src="${imgPrefix}${g.thumbnail}" alt="${escapeHtml(g.title)}" loading="lazy" onerror="this.src='${imgPrefix}images/retro-bowl.png';">
            <div class="game-play-overlay">
              <div class="play-circle">▶</div>
            </div>
          </div>
          <div class="game-info">
            <h4 class="game-title">${escapeHtml(g.title)}</h4>
            <div class="game-meta-row">
              <span class="game-category-tag">${g.categories[0] || 'Game'}</span>
              <span class="game-rating">★ ${g.rating}</span>
            </div>
          </div>
        </a>
      `;
    });
    gridEl.innerHTML = html;
  }

  function updateSEO(game) {
    const pageTitle = `${game.title} Unblocked 6x - Play Free Online at School`;
    document.title = pageTitle;

    const isSub = window.location.pathname.includes('/play/');
    const canonicalUrl = isSub
      ? `https://retrobowlunblocked6x.github.io/play/${encodeURIComponent(game.id)}.html`
      : `https://retrobowlunblocked6x.github.io/play.html?game=${encodeURIComponent(game.id)}`;

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) canonicalEl.setAttribute('href', canonicalUrl);

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `Play ${game.title} unblocked 6x for free on Chromebook, PC or mobile. Rated ${game.rating}/5. No flash, no download needed!`);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('href', canonicalUrl);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', `https://retrobowlunblocked6x.github.io/${game.thumbnail}`);
  }

  function addToRecentlyPlayed(id) {
    try {
      let recents = JSON.parse(localStorage.getItem('retro_recent_games')) || [];
      recents = recents.filter(item => item !== id);
      recents.unshift(id);
      if (recents.length > 10) recents = recents.slice(0, 10);
      localStorage.setItem('retro_recent_games', JSON.stringify(recents));
    } catch (e) {}
  }

  function toggleFavorite(id) {
    try {
      let favs = JSON.parse(localStorage.getItem('retro_favorites')) || [];
      if (favs.includes(id)) {
        favs = favs.filter(item => item !== id);
      } else {
        favs.push(id);
      }
      localStorage.setItem('retro_favorites', JSON.stringify(favs));
    } catch (e) {}
  }

  function updateFavoriteBtnState(id, btn) {
    if (!btn) return;
    try {
      const favs = JSON.parse(localStorage.getItem('retro_favorites')) || [];
      if (favs.includes(id)) {
        btn.classList.add('active');
        btn.innerHTML = '♥ Favorited';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '♡ Favorite';
      }
    } catch (e) {}
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('retro_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
      themeToggleBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('retro_theme', next);
        themeToggleBtn.textContent = next === 'dark' ? '☀️' : '🌙';
      });
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
