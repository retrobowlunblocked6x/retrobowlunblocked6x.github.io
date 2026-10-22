# 🏈 Retro Bowl Unblocked 6x (`retrobowlunblocked6x.github.io`)

Situs game portal & game player modern, berkecepatan tinggi, berdesain **Fresh & Clean**, mendukung **PWA (Progressive Web App)**, menggunakan **Pretty Permalinks (`/play/title-game.html`)**, serta dilengkapi **Schema.org Rich Snippet Rating Interaktif** dan penempatan iklan ber-CTR tinggi.

---

## 🌟 Pembaruan & Fitur Utama

1. **Pretty Permalinks (`/play/title-game.html`) & Clean Homepage Root (`/`)**
   - Setiap game memiliki halaman statis mandiri di dalam folder `play/` (misal: `/play/retro-bowl.html`, `/play/slope.html`, `/play/2048.html`, dll.).
   - Homepage bersih langsung di root `/` tanpa akhiran `/index.html`.
   - Sangat disukai oleh bot Google SEO karena memiliki URL statis ramah pengguna (*clean & pretty slugs*).

2. **Desain Fresh, Clean, & Vibrant (Light / Dark Mode Switch)**
   - Tampilan default yang segar, cerah, bersih (*fresh & clean aesthetic*), tidak monoton gelap.
   - Menggunakan kartu putih lembut dengan elevasi bayangan halus, aksen biru cerah (*sky/cyan*), serta warna oranye energik khas football Amerika.
   - Dilengkapi tombol toggle tema (`🌙` / `☀️`) yang mengingat preferensi pengguna di `localStorage`.

3. **Interactive Star Rating & Dynamic Schema.org Snippet**
   - Di setiap halaman gameplay terdapat widget interaktif **⭐ Rate This Game** (1 sampai 5 bintang).
   - Efek hover responsif dengan label deskriptif (*Poor, Fair, Good, Great!, Masterpiece!*).
   - Pengunjung bisa memberikan rating nyata yang tersimpan di `localStorage`.
   - Kode Schema.org JSON-LD bertipe `VideoGame` dan `AggregateRating` (`ratingValue`, `ratingCount`, `reviewCount`) otomatis terupdate secara dinamis di DOM saat rating diberikan, memastikan **Google Rich Snippets Bintang Emas** tampil di hasil pencarian Google.

4. **Progressive Web App (PWA) Siap Pakai**
   - Memiliki `manifest.json` dan Service Worker (`sw.js`).
   - Tombol **📲 Install App** di header yang memungkinkan pengguna menginstal website sebagai aplikasi mandiri di HP, Tablet, Chromebook, maupun Windows PC.
   - Cache otomatis untuk aset inti agar loading instan dan hemat kuota.

5. **284 Data Game Lengkap & Thumbnail Lokal**
   - Seluruh 284 ikon game tersimpan lokal di folder `images/`.
   - Source game utama tersimpan lokal di folder `games/` (Retro Bowl v1.5.9.0 & v1.4.9.3, Retro Bowl College, Slope, Basket Random, 2048, Rooftop Snipers).
   - Emulator Ruffle Flash terintegrasi untuk game Flash SWF.

6. **High CTR Ad Placements**
   - Top Leaderboard Banner (728x90)
   - Left & Right Skyscrapers (160x600)
   - Pre-Game Click-to-Play Interactive Box
   - Native In-Feed Sponsored Cards
   - Sticky Bottom Anchor Bar (320x50 / 728x90)

---

## 📁 Struktur Direktori

```text
├── css/
│   └── style.css            # Stylesheet fresh & clean, light/dark mode & layout
├── games/                   # Folder source game offline/lokal
│   ├── retro-bowl/          # Source lengkap Retro Bowl v1.5.9.0
│   ├── retro-bowl-college/  # Source lengkap Retro Bowl College
│   ├── slope/               # Source Slope HTML5
│   ├── 2048/                # Source 2048
│   ├── basket-random/       # Source Basket Random
│   └── rooftop-snipers/     # Source Rooftop Snipers
├── icons/                   # Ikon PWA (192px & 512px)
├── images/                  # 284 ikon thumbnail game lokal (512px)
├── js/
│   ├── ads.js               # Pengaturan slot iklan, high CTR triggers, AdSense
│   ├── app.js               # Logika homepage, PWA prompt, theme toggle, pretty URLs
│   ├── games-data.js        # Database 284 game lengkap
│   └── player.js            # Controller game player, star rating, Schema.org live update
├── play/                    # 284 file HTML statis pretty permalinks
│   ├── retro-bowl.html
│   ├── retro-bowl-college.html
│   ├── slope.html
│   └── ... (284 file game)
├── scripts/
│   ├── download_game.js         # Pengunduh source game tambahan
│   └── generate_play_pages.js   # Generator halaman pretty permalinks
├── favicon.ico              # Favicon
├── index.html               # Halaman utama (Clean Root)
├── manifest.json            # PWA Manifest
├── play.html                # Fallback player page
├── robots.txt               # Aturan robot mesin pencari
├── sitemap.xml              # Peta situs 285 URL pretty permalink
├── sw.js                    # Service Worker PWA
└── README.md
```

---

## 🚀 Panduan Menjalankan & Deploy

### Jalankan Lokal
```bash
python -m http.server 8085
```
Akses di browser: `http://localhost:8085/` atau `http://localhost:8085/play/retro-bowl.html`.

### Deploy ke GitHub Pages (`retrobowlunblocked6x.github.io`)
```bash
git init
git add .
git commit -m "Launch Retro Bowl 6x Portal with PWA, Pretty Permalinks & Clean Theme"
git branch -M main
git remote add origin https://github.com/USERNAME/retrobowlunblocked6x.github.io.git
git push -u origin main
```
*Buka Settings > Pages di GitHub dan aktifkan branch `main` root `/`.*
