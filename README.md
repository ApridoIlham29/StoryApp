# Dicoding Story App - Submission FE Expert (Enhanced)

Aplikasi Single-Page Application (SPA) untuk berbagi cerita (mirip Instagram Story) yang menampilkan lokasi cerita pada peta. Dibangun menggunakan Vanilla JavaScript, Webpack, dan berbagai Web API modern sebagai bagian dari submission kelas Menjadi Front-End Web Developer Expert di Dicoding Academy. Versi ini mencakup perbaikan dan peningkatan UI/UX.

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_NETLIFY_BADGE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_NETLIFY_SITE_NAME/deploys)

**Demo:** [Link ke Aplikasi Demo Anda]

## Fitur

* **Autentikasi Pengguna:** Registrasi, Login, status login persisten (LocalStorage), update UI reaktif tanpa reload halaman penuh via Event Bus sederhana.
* **Manajemen Cerita:** Menampilkan daftar cerita terbaru, menambah cerita baru (deskripsi wajib, foto wajib maks 1MB dari kamera/upload), lokasi opsional via peta.
* **Peta Interaktif:** Menampilkan lokasi cerita (LeafletJS + MapTiler API), marker dengan popup, peta input lokasi (klik/geser), kontrol layer (Streets/Satellite), lazy loading peta.
* **Fitur Web API Modern:** Camera Access (`getUserMedia`), View Transitions API, Fetch API, Web Components (`<story-item>`), LocalStorage.
* **Arsitektur:** SPA (hash routing), pola MVP per halaman, modul ES6, Webpack bundling.
* **Aksesibilitas:** Struktur Semantik, Skip Link, Label Form, Alt Text, ARIA attributes (`role`, `aria-live`, `aria-busy`, `aria-describedby`, `aria-invalid`, `aria-label`, dll.), Manajemen Fokus, Outline Fokus Keyboard.
* **User Experience:** Desain Responsif (Mobile Friendly), Indikator Loading (Spinner), Notifikasi Toast untuk pesan sukses/error, tata letak dan spasi yang ditingkatkan untuk tampilan lebih profesional.

## Teknologi & Library

* HTML5, CSS3, JavaScript (ES6+)
* [Dicoding Story API](https://story-api.dicoding.dev/)
* [LeafletJS](https://leafletjs.com/)
* [MapTiler Cloud](https://www.maptiler.com/cloud/) (API Key Peta)
* [Font Awesome](https://fontawesome.com/)
* Webpack, Babel, NPM

## Prasyarat

* Node.js (disarankan versi LTS terbaru)
* NPM (biasanya terinstal bersama Node.js)
* Akun [MapTiler Cloud](https://www.maptiler.com/cloud/) (bisa daftar gratis) untuk mendapatkan API Key Peta.

## Instalasi & Menjalankan Lokal

1.  **Clone / Unduh Proyek**
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Konfigurasi API Key Peta:**
    * Dapatkan API Key Anda dari dashboard MapTiler Cloud.
    * Buka file `STUDENT.txt` dan `src/scripts/config.js`.
    * Ganti placeholder `MASUKKAN_API_KEY_MAP_ANDA_DISINI` atau `ycYnjQnQjaybWkdGWhCZ` (jika sudah terlanjur diganti) dengan API Key MapTiler **Anda yang valid** di **kedua** file tersebut.
4.  **Jalankan Development Server:**
    ```bash
    npm run start-dev
    ```
5.  **Buka Aplikasi:** Buka browser dan navigasikan ke `http://localhost:9000` (atau port lain yang muncul di terminal).

## Build & Serve Produksi

1.  **Build:**
    ```bash
    npm run build
    ```
    (Hasil ada di folder `dist`)
2.  **Serve Lokal:**
    ```bash
    npm run serve
    ```
    (Buka `http://localhost:8080` atau alamat yang muncul)

## Struktur Proyek

```text
dicoding-story-app/
├── dist/
├── node_modules/
├── src/
│   ├── public/
│   ├── scripts/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── utils/
│   ├── styles/
│   │   ├── components/
│   │   └── styles.css
│   └── index.html
├── .gitignore
├── package.json
├── README.md
├── STUDENT.txt
├── webpack.common.js
├── webpack.dev.js
└── webpack.prod.js