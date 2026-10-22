/**
 * Retro Bowl Unblocked 6x - Main Application Logic
 * Pretty Permalinks (/play/title-game.html), PWA Support, Light/Dark Theme,
 * Instant Search, Category Filter, and Favorites
 */

document.addEventListener('DOMContentLoaded', () => {
  // Service Worker Registration for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  }

  // Theme Management (Default: Fresh & Clean Light Theme)
  initTheme();

  // PWA Install Prompt
  initPwaInstall();

  const gamesGrid = document.getElementById('gamesGrid');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const categoryPills = document.querySelectorAll('.pill-btn');
  const sortSelect = document.getElementById('sortSelect');
  const gamesCountBadge = document.getElementById('gamesCountBadge');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const loadMoreWrapper = document.getElementById('loadMoreWrapper');
  const randomGameBtn = document.getElementById('randomGameBtn');
  const recentSection = document.getElementById('recentSection');
  const recentGrid = document.getElementById('recentGrid');

  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'popular';
  let pageSize = 24;
  let visibleCount = pageSize;
  let filteredGames = [];

  if (typeof GAMES_DATA === 'undefined' || !Array.isArray(GAMES_DATA)) {
    console.error('GAMES_DATA is not loaded properly.');
    return;
  }

  init();

  function init() {
    if (searchInput && Array.isArray(GAMES_DATA)) {
      searchInput.placeholder = `Search ${GAMES_DATA.length}+ unblocked games...`;
    }
    renderRecentlyPlayed();
    filterAndSortGames();
    setupEventListeners();

    if (typeof adsManager !== 'undefined' && adsManager.initAllSlots) {
      adsManager.initAllSlots();
    }
  }

  function setupEventListeners() {
    // Search input
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      if (searchClear) {
        searchClear.style.display = searchQuery.length > 0 ? 'block' : 'none';
      }
      visibleCount = pageSize;
      filterAndSortGames();
    });

    searchClear?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      searchClear.style.display = 'none';
      visibleCount = pageSize;
      filterAndSortGames();
    });

    // Category pills
    categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.getAttribute('data-category') || 'all';
        visibleCount = pageSize;
        filterAndSortGames();
      });
    });

    // Sorting
    sortSelect?.addEventListener('change', (e) => {
      currentSort = e.target.value;
      visibleCount = pageSize;
      filterAndSortGames();
    });

    // Load More
    loadMoreBtn?.addEventListener('click', () => {
      visibleCount += pageSize;
      renderGrid();
    });

    // Random Game (uses pretty permalink /play/{id}.html)
    randomGameBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const randomIndex = Math.floor(Math.random() * GAMES_DATA.length);
      const randomGame = GAMES_DATA[randomIndex];
      window.location.href = `play/${encodeURIComponent(randomGame.id)}.html`;
    });
  }

  function filterAndSortGames() {
    filteredGames = GAMES_DATA.filter(game => {
      if (currentCategory !== 'all') {
        if (currentCategory === 'favorites') {
          const favs = getFavorites();
          if (!favs.includes(game.id)) return false;
        } else if (currentCategory === 'flash') {
          if (game.fileType !== 'swf') return false;
        } else {
          const matchesCategory = game.categories.some(c => c.toLowerCase() === currentCategory.toLowerCase());
          if (!matchesCategory) return false;
        }
      }

      if (searchQuery) {
        const titleMatch = game.title.toLowerCase().includes(searchQuery);
        const idMatch = game.id.toLowerCase().includes(searchQuery);
        const catMatch = game.categories.some(c => c.toLowerCase().includes(searchQuery));
        if (!titleMatch && !idMatch && !catMatch) return false;
      }

      return true;
    });

    if (currentSort === 'popular') {
      filteredGames.sort((a, b) => {
        if (a.id === 'retro-bowl') return -100;
        if (b.id === 'retro-bowl') return 100;
        return b.plays - a.plays;
      });
    } else if (currentSort === 'rating') {
      filteredGames.sort((a, b) => b.rating - a.rating);
    } else if (currentSort === 'title') {
      filteredGames.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === 'newest') {
      filteredGames.sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''));
    }

    if (gamesCountBadge) {
      gamesCountBadge.textContent = `${filteredGames.length} Games`;
    }

    renderGrid();
  }

  function renderGrid() {
    if (!gamesGrid) return;

    if (filteredGames.length === 0) {
      gamesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎮</div>
          <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.5rem; color:var(--text-primary);">No Games Found</h3>
          <p style="color: var(--text-secondary); max-width: 450px; margin: 0 auto 1.5rem;">
            We couldn't find any games matching "${searchQuery}". Try another keyword or browse our categories.
          </p>
          <button class="btn-load-more" onclick="document.getElementById('searchInput').value=''; document.getElementById('searchClear').click();">
            Clear Search
          </button>
        </div>
      `;
      if (loadMoreWrapper) loadMoreWrapper.style.display = 'none';
      return;
    }

    const itemsToRender = filteredGames.slice(0, visibleCount);
    let html = '';

    itemsToRender.forEach((game, index) => {
      // Inject Native In-Feed Sponsored Card every 12 games for High CTR
      if (index > 0 && index % 12 === 0) {
        html += getNativeAdCardHTML();
      }

      const isHot = game.featured || game.plays > 900000;
      const isFlash = game.fileType === 'swf';
      let badgeHTML = '';

      if (game.id === 'retro-bowl' || game.id === 'retro-bowl-college') {
        badgeHTML = '<span class="game-badge badge-hot">FEATURED</span>';
      } else if (isHot) {
        badgeHTML = '<span class="game-badge badge-hot">HOT</span>';
      } else if (isFlash) {
        badgeHTML = '<span class="game-badge badge-flash">FLASH</span>';
      }

      const mainCategory = game.categories[0] || 'Arcade';

      // Pretty permalink URL
      const prettyUrl = `play/${encodeURIComponent(game.id)}.html`;

      html += `
        <a href="${prettyUrl}" class="game-card" data-id="${game.id}" title="Play ${escapeHtml(game.title)} Unblocked 6x">
          <div class="game-thumb-wrapper">
            <img class="game-thumb" src="${game.thumbnail}" alt="${escapeHtml(game.title)} Unblocked 6x" loading="lazy" onerror="this.src='images/retro-bowl.png';">
            ${badgeHTML}
            <div class="game-play-overlay">
              <div class="play-circle">▶</div>
            </div>
          </div>
          <div class="game-info">
            <h3 class="game-title">${escapeHtml(game.title)}</h3>
            <div class="game-meta-row">
              <span class="game-category-tag">${mainCategory}</span>
              <span class="game-rating">★ ${game.rating}</span>
            </div>
          </div>
        </a>
      `;
    });

    gamesGrid.innerHTML = html;

    if (loadMoreWrapper) {
      loadMoreWrapper.style.display = visibleCount < filteredGames.length ? 'flex' : 'none';
    }
  }

  function getNativeAdCardHTML() {
    return `
      <div class="game-card sponsored-card" onclick="window.location.href='play/retro-bowl.html'">
        <span class="sponsored-badge">SPONSORED</span>
        <div class="game-thumb-wrapper" style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); display:flex; align-items:center; justify-content:center;">
          <div style="font-size:2.8rem;">🏈</div>
          <div class="game-play-overlay" style="opacity: 0.9;">
            <div class="play-circle" style="background: var(--accent-sport-gradient);">▶</div>
          </div>
        </div>
        <div class="game-info">
          <h3 class="game-title" style="color: var(--accent-primary);">Retro Bowl Unblocked 6x</h3>
          <div class="game-meta-row">
            <span class="game-category-tag" style="color: var(--accent-sport);">Top Rated</span>
            <span class="game-rating">★ 4.9 (1.5M+)</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderRecentlyPlayed() {
    if (!recentSection || !recentGrid) return;
    const recentIds = getRecentlyPlayed();

    if (recentIds.length === 0) {
      recentSection.style.display = 'none';
      return;
    }

    recentSection.style.display = 'block';
    const recentGames = recentIds
      .map(id => GAMES_DATA.find(g => g.id === id))
      .filter(Boolean)
      .slice(0, 6);

    let html = '';
    recentGames.forEach(game => {
      const prettyUrl = `play/${encodeURIComponent(game.id)}.html`;
      html += `
        <a href="${prettyUrl}" class="game-card" title="Play ${escapeHtml(game.title)} Again">
          <div class="game-thumb-wrapper">
            <img class="game-thumb" src="${game.thumbnail}" alt="${escapeHtml(game.title)}" loading="lazy">
            <div class="game-play-overlay">
              <div class="play-circle">▶</div>
            </div>
          </div>
          <div class="game-info">
            <h4 class="game-title">${escapeHtml(game.title)}</h4>
            <div class="game-meta-row">
              <span class="game-category-tag">${game.categories[0] || 'Game'}</span>
            </div>
          </div>
        </a>
      `;
    });
    recentGrid.innerHTML = html;
  }

  function getRecentlyPlayed() {
    try {
      return JSON.parse(localStorage.getItem('retro_recent_games')) || [];
    } catch (e) {
      return [];
    }
  }

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('retro_favorites')) || [];
    } catch (e) {
      return [];
    }
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

  function initPwaInstall() {
    let deferredPrompt = null;
    const installBtn = document.getElementById('installPwaBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) installBtn.style.display = 'inline-flex';
    });

    installBtn?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User installed Retro Bowl 6x PWA');
      }
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
