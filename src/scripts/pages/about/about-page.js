export default class AboutPage {
  constructor() {
      this.title = 'Tentang Storyku - Lebih Dekat dengan Cerita Anda';
  }
  async render() {
    const currentTime = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    return `
      <section class="container about-page-pro" aria-labelledby="about-heading">
        <style>
          .about-page-pro { padding-block: var(--spacing-lg) var(--spacing-xxxl); max-width: 950px; margin-bottom: var(--spacing-xl); }
          .about-page-pro h1 { text-align: center; color: var(--white-color); font-size: 2.6rem; margin-bottom: var(--spacing-lg); letter-spacing: -0.025em; font-weight: var(--font-weight-bold); }
          .about-page-pro h2 { margin-top: var(--spacing-xxl); margin-bottom: var(--spacing-lg); font-size: 1.8rem; padding-bottom: var(--spacing-md); border-bottom: 2px solid var(--primary-color); color: var(--primary-color-light); display: flex; align-items: center; gap: 15px; font-weight: var(--font-weight-semibold); letter-spacing: -0.01em;}
          .about-page-pro h2 .fa-icon { color: var(--primary-color); font-size: 1.3em; }
          .about-page-pro h3 { font-size: 1.25rem; color: var(--secondary-color); margin-top: var(--spacing-xl); margin-bottom: var(--spacing-md); font-weight: var(--font-weight-semibold); }
          .about-page-pro p { margin-bottom: var(--spacing-md); line-height: 1.8; color: var(--medium-text); font-size: 1.05rem; }
          .about-page-pro .page-subtitle { font-size: 1.2em; color: var(--dark-text); margin-bottom: var(--spacing-xl); text-align: center; font-style: normal; font-weight: var(--font-weight-normal); max-width: 800px; margin-inline: auto; }
          .about-page-pro ul:not(.social-links) { list-style: none; padding-left: 0; margin-bottom: var(--spacing-lg); }
          .about-page-pro ul:not(.social-links) li { margin-bottom: 1em; padding-left: 35px; position: relative; line-height: 1.7; }
          .about-page-pro ul:not(.social-links) li::before { content: '\\f00c'; font-family: 'Font Awesome 6 Free'; font-weight: 900; color: var(--primary-color); position: absolute; left: 0; top: 4px; font-size: 1.1em; }
          .about-page-pro strong { color: var(--secondary-color-light, #FEEBC8); font-weight: var(--font-weight-semibold); }
          .about-page-pro code { background-color: var(--light-bg); padding: 3px 7px; border-radius: var(--border-radius-sm); font-family: monospace; font-size: 0.9em; border: 1px solid var(--border-color); color: var(--primary-color-light); }
          .about-page-pro dl { margin-bottom: var(--spacing-lg); }
          .about-page-pro dt { font-weight: var(--font-weight-bold); color: var(--primary-color-light); font-size: 1.15rem; margin-top: var(--spacing-lg); margin-bottom: var(--spacing-sm); padding-left: 10px; border-left: 3px solid var(--primary-color); }
          .about-page-pro dd { margin-left: 25px; padding-left: 15px; border-left: 1px solid var(--border-color); color: var(--medium-text); font-size: 1rem; margin-bottom: var(--spacing-md);}
          .about-page-pro dd ul { list-style: none; padding: 0; margin-block: var(--spacing-sm) 0; }
          .about-page-pro dd ul li { margin-bottom: 0.7em; padding-left: 25px; }
          .about-page-pro dd ul li::before { content: '\\f0da'; font-family: 'Font Awesome 6 Free'; font-weight: 900; color: var(--medium-text); position: absolute; left: 0; top: 5px; font-size: 1em; }
          .about-page-pro .developer-section { margin-top: var(--spacing-xxxl); padding: var(--spacing-xl) var(--spacing-lg); border-top: 1px solid var(--border-color); text-align: center; background-color: rgba(45, 55, 72, 0.3); border-radius: var(--border-radius-lg); }
          .about-page-pro .developer-section h2 { border-bottom: none; justify-content: center; margin-bottom: var(--spacing-md); font-size: 1.6rem; color: var(--white-color);}
          .about-page-pro .developer-intro { font-size: 1.1rem; max-width: 750px; margin-inline: auto; margin-bottom: var(--spacing-lg); color: var(--dark-text); line-height: 1.8; }
          .about-page-pro .social-links { display: flex; justify-content: center; gap: var(--spacing-xl); list-style: none; padding: 0; margin-top: 0; }
          .about-page-pro .social-links li { padding: 0; margin: 0; }
          .about-page-pro .social-links li::before { content: none; }
          .about-page-pro .social-links a { font-size: 2.2rem; color: var(--medium-text); transition: color 0.2s ease-in-out, transform 0.2s ease-in-out; display: inline-block; }
          .about-page-pro .social-links a:hover, .about-page-pro .social-links a:focus { color: var(--primary-color); transform: scale(1.15) translateY(-2px); }
          .about-page-pro .final-note { margin-top: var(--spacing-xxxl); font-style: normal; color: var(--medium-text); text-align: center; font-size: 1rem; line-height: 1.7;}
          .about-page-pro .last-updated { display: block; font-size: 0.8rem; color: var(--light-text); margin-top: var(--spacing-md); }
        </style>

        <h1 id="about-heading">Storyku: Bagikan Cerita Keseruan Anda</h1>
        <p class="page-subtitle">
          Aplikasi web modern untuk berbagi momen, dibangun dengan semangat belajar dan teknologi terkini sebagai bagian dari program Dicoding.
        </p>

        <p class="intro-paragraph">
          Selamat datang di dunia Storyku! Ini adalah ruang digital tempat Anda bisa dengan mudah berbagi dan menemukan cerita. Lebih dari sekadar proyek biasa, aplikasi ini adalah buah dari pembelajaran intensif di kelas <strong>Belajar Pengembangan Web Intermediate</strong> Dicoding, yang saya ikuti sebagai bagian dari program bergengsi <strong>Coding Camp 2025 powered by DBS Foundations</strong>. Tujuannya adalah menciptakan sebuah <strong>Single-Page Application (SPA)</strong> yang tidak hanya fungsional dan interaktif, tapi juga mengadopsi kekuatan <strong>Progressive Web App (PWA)</strong> untuk pengalaman yang mulus dan andal.
        </p>

        <h2><i class="fas fa-feather-alt fa-icon" aria-hidden="true"></i> Apa yang Bisa Anda Lakukan?</h2>
        <ul>
          <li>
            <strong>Buat & Bagikan Cerita Anda:</strong> Tuangkan momen Anda dalam kata-kata, tambahkan foto menarik (langsung dari kamera atau pilih dari galeri), dan jika ingin, sertakan lokasi kejadian dengan mudah via peta interaktif.
          </li>
          <li>
            <strong>Jelajahi Dunia Cerita:</strong> Lihat berbagai cerita yang dibagikan oleh pengguna lain dalam tampilan linimasa yang dinamis. Temukan detail menarik dan lihat lokasi cerita di peta LeafletJS.
          </li>
          <li>
            <strong>Akses Aman & Terjaga:</strong> Masuk atau daftar dengan akun Anda. Sesi login Anda akan terjaga, memberikan pengalaman personal yang aman.
          </li>
           <li>
            <strong>Nikmati Pengalaman Modern:</strong> Rasakan perpindahan antar halaman yang halus berkat <strong>View Transitions API</strong> dan antarmuka yang nyaman di berbagai perangkat (<strong>Mobile First & Responsif</strong>). Aplikasi ini juga dirancang dengan memperhatikan <strong>Aksesibilitas (WCAG)</strong>.
          </li>
        </ul>

         <h2><i class="fas fa-mobile-alt fa-icon" aria-hidden="true"></i> Keunggulan Teknologi PWA</h2>
         <ul>
           <li>
             <strong>Instal di Perangkat:</strong> Ingin akses cepat? Pasang Storyku ke *homescreen* Anda layaknya aplikasi native (pastikan Anda sudah menyediakan file ikonnya!).
           </li>
           <li>
             <strong>Andal Saat Offline:</strong> Kehabisan kuota atau sinyal lemah? Tenang! Dengan Service Worker dan **Workbox**, Anda tetap bisa membuka aplikasi dan melihat cerita yang sudah tersimpan di halaman "Tersimpan".
           </li>
           <li>
             <strong>Simpan Cerita Favorit Lokal:</strong> Gunakan tombol "Simpan Offline" untuk menyimpan cerita penting di perangkat Anda menggunakan IndexedDB (didukung <code>idb</code>). Mudah diakses kapan saja!
           </li>
           <li>
             <strong>Notifikasi Instan:</strong> Dapatkan pemberitahuan *push* secara langsung (membutuhkan VAPID Key valid & dukungan API).
           </li>
           <li>
             <strong>Akses Cepat via Shortcut:</strong> Langsung menuju fitur "Tambah Cerita" dari ikon aplikasi Anda (fitur opsional PWA).
           </li>
         </ul>


        <h2><i class="fas fa-cogs fa-icon" aria-hidden="true"></i> Dibangun Dengan Teknologi Pilihan</h2>
        <dl class="tech-list">
          <dt>Fondasi Utama</dt>
          <dd>Menggunakan teknologi web standar: HTML5, CSS3, JavaScript ES6+. Dirancang sebagai Single-Page Application (SPA) dengan pola MVP.</dd>

          <dt>Interaksi Data & Hardware</dt>
          <dd>Menggunakan Fetch API untuk berkomunikasi dengan Dicoding Story API, MediaDevices API (<code>getUserMedia</code>) untuk akses kamera, dan LocalStorage untuk data sesi sederhana.</dd>

          <dt>Fitur PWA & Offline</dt>
          <dd>Didukung oleh Service Worker API, Push API, Notifications API, IndexedDB API (via library <code>idb</code>), dan Web App Manifest.</dd>

          <dt>Perkakas & Library Eksternal</dt>
          <dd>
            <ul>
              <li>LeafletJS & MapTiler API: Untuk pengalaman peta yang kaya.</li>
              <li>Workbox: Memudahkan manajemen Service Worker & strategi caching.</li>
              <li>Font Awesome: Menyediakan ikonografi yang menarik.</li>
              <li>Webpack & Babel: Memastikan proses build yang modern dan efisien.</li>
              <li>NPM: Mengelola semua dependensi proyek.</li>
            </ul>
          </dd>
        </dl>

        <section class="developer-section" aria-labelledby="developer-heading">
          <h2 id="developer-heading"><i class="fas fa-user-graduate fa-icon" aria-hidden="true"></i> Mengenal Pengembang</h2>
          <p class="developer-intro">
            Hai! Saya <strong>Aprido Ilham</strong>, mahasiswa semester 6 dari program studi <strong>Sistem Informasi</strong> di <strong>UIN Syarif Hidayatullah Jakarta</strong>. Storyku ini adalah salah satu wujud semangat belajar saya, terutama sebagai bagian dari program <strong>Coding Camp 2025 powered by DBS Foundations</strong> melalui kelas <strong>Belajar Pengembangan Web Intermediate</strong> di Dicoding. Saya sangat antusias menerapkan teknologi web modern untuk menciptakan solusi yang bermanfaat dan menarik.
          </p>
          <ul class="social-links">
            <li>
              <a href="https://linkedin.com/in/aprido-ilham-900344253" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Aprido Ilham" title="LinkedIn Aprido Ilham">
                <i class="fab fa-linkedin" aria-hidden="true"></i>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/apridoilham/" target="_blank" rel="noopener noreferrer" aria-label="Instagram Aprido Ilham" title="Instagram Aprido Ilham">
                <i class="fab fa-instagram" aria-hidden="true"></i>
              </a>
            </li>
            </ul>
        </section>

        <p class="final-note">
          Terima kasih telah menjelajahi Storyku! Proyek ini adalah bukti nyata bagaimana materi pembelajaran dapat diubah menjadi aplikasi web fungsional yang mengintegrasikan berbagai teknologi canggih.
          <span class="last-updated">Informasi ini relevan per ${currentTime} WIB, Depok.</span>
        </p>
      </section>
    `;
  }

  async afterRender() {
    // Tetap kosong
  }
}