/**
 * Retro Bowl Unblocked 6x - Dynamic Ads Manager
 * Seamlessly loads all 6 Adsterra ad codes from ads.json
 * Supports both Homepage and Player Pages via data-ad-slot attributes and direct IDs
 */

const DEFAULT_ADS_CONFIG = {
  "ad_728x90_1": {
    "key": "4b03159602cba0243869c415124b923e",
    "format": "iframe",
    "width": 728,
    "height": 90,
    "scriptUrl": "https://grop.net/22/4b03159602cba0243869c415124b923e"
  },
  "ad_728x90_2": {
    "key": "72aae8a75da17a34e48ed84feaa311bf",
    "format": "iframe",
    "width": 728,
    "height": 90,
    "scriptUrl": "https://grop.net/22/72aae8a75da17a34e48ed84feaa311bf"
  },
  "ad_728x90_3": {
    "key": "85bbdaacdf152821709cd827d312e590",
    "format": "iframe",
    "width": 728,
    "height": 90,
    "scriptUrl": "https://grop.net/22/85bbdaacdf152821709cd827d312e590"
  },
  "ad_300x250_1": {
    "key": "ef5cdc72a62a03d1d689161ba6bc82f6",
    "format": "iframe",
    "width": 300,
    "height": 250,
    "scriptUrl": "https://grop.net/22/ef5cdc72a62a03d1d689161ba6bc82f6"
  },
  "ad_300x250_2": {
    "key": "5c2ef2cb97dff829617ea4c4e1d5ca7b",
    "format": "iframe",
    "width": 300,
    "height": 250,
    "scriptUrl": "https://grop.net/22/5c2ef2cb97dff829617ea4c4e1d5ca7b"
  },
  "ad_300x250_3": {
    "key": "519498d43535d47784913541921195b0",
    "format": "iframe",
    "width": 300,
    "height": 250,
    "scriptUrl": "https://grop.net/22/519498d43535d47784913541921195b0"
  }
};

class AdsManager {
  constructor() {
    this.config = DEFAULT_ADS_CONFIG;
    this.loaded = false;
  }

  async loadConfig() {
    try {
      const isSub = window.location.pathname.includes('/play/');
      const jsonPath = isSub ? '../ads.json' : 'ads.json';
      const res = await fetch(jsonPath);
      if (res.ok) {
        this.config = await res.json();
      }
    } catch (e) {
      console.info('Using default embedded ads config.');
    }
    this.loaded = true;
  }

  // Render an isolated Adsterra ad iframe to prevent atOptions collisions
  renderAd(slotKey, containerElementOrId) {
    const el = (typeof containerElementOrId === 'string')
      ? document.getElementById(containerElementOrId)
      : containerElementOrId;

    if (!el) return;

    const unit = this.config[slotKey];
    if (!unit || !unit.key) return;

    // Clear and build frame wrapper
    el.innerHTML = `
      <div class="ad-label" style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px; font-weight:600; text-align:center;">Advertisement</div>
      <div class="ad-frame-wrapper" style="width:${unit.width}px; height:${unit.height}px; max-width:100%; display:flex; justify-content:center; align-items:center; margin:0 auto; overflow:hidden;"></div>
    `;

    const holder = el.querySelector('.ad-frame-wrapper');
    if (!holder) return;

    const iframe = document.createElement('iframe');
    iframe.width = String(unit.width);
    iframe.height = String(unit.height);
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.style.cssText = `border:none; overflow:hidden; width:${unit.width}px; height:${unit.height}px; max-width:100%; display:block;`;
    iframe.setAttribute('allowtransparency', 'true');
    holder.appendChild(iframe);

    try {
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; display:flex; align-items:center; justify-content:center; background:transparent; overflow:hidden; }
  </style>
</head>
<body>
  <script>
    var atOptions = {
      'key' : '${unit.key}',
      'format' : '${unit.format || "iframe"}',
      'height' : ${unit.height},
      'width' : ${unit.width},
      'params' : {}
    };
  <\/script>
  <script src="${unit.scriptUrl}"><\/script>
</body>
</html>`);
        doc.close();
      }
    } catch (e) {
      console.warn('Ad frame write error:', e);
    }
  }

  // Compatibility stubs for legacy calls
  renderLeaderboard(id) {
    const el = document.getElementById(id);
    if (el && !el.hasAttribute('data-ad-slot')) {
      this.renderAd('ad_728x90_1', el);
    }
  }

  renderSkyscrapers() {
    // legacy stub
  }

  async initAllSlots() {
    await this.loadConfig();

    // Process all elements with data-ad-slot attribute
    document.querySelectorAll('[data-ad-slot]').forEach(el => {
      const slotKey = el.getAttribute('data-ad-slot');
      if (slotKey) {
        this.renderAd(slotKey, el);
      }
    });

    // Specific named ID fallbacks
    const idMap = {
      'top-leaderboard-ad': 'ad_728x90_1',
      'player-top-ad': 'ad_728x90_1',
      'player-bottom-ad': 'ad_728x90_2',
      'pregame-ad-box': 'ad_300x250_1',
      'sidebar-ad-top': 'ad_300x250_1',
      'sidebar-ad-mid': 'ad_300x250_2',
      'sidebar-ad-bottom': 'ad_300x250_3',
      'player-footer-ad': 'ad_728x90_3'
    };

    for (const [id, slotKey] of Object.entries(idMap)) {
      const el = document.getElementById(id);
      if (el && !el.hasAttribute('data-ad-slot') && !el.innerHTML.trim()) {
        this.renderAd(slotKey, el);
      }
    }
  }
}

const adsManager = new AdsManager();
document.addEventListener('DOMContentLoaded', () => {
  adsManager.initAllSlots();
});
