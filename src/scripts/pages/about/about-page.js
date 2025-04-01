export default class AboutPage {
  constructor() {
      this.title = 'About - Dicoding Story App';
  }
  async render() {
    return `
      <section class="container" style="padding-top: 20px; max-width: 800px;" aria-labelledby="about-heading">
        <h1 id="about-heading" style="margin-bottom: 20px;">Tentang Aplikasi Dicoding Story</h1>
        <p style="margin-bottom: 15px;">
          Aplikasi ini merupakan contoh proyek yang dibangun sebagai bagian dari kelas
          <strong>Menjadi Front-End Web Developer Expert</strong> di Dicoding Academy.
          Tujuannya adalah untuk mendemonstrasikan penerapan berbagai Web API modern
          dalam membangun sebuah Single-Page Application (SPA) yang fungsional.
        </p>
        <h2 style="margin-top: 30px; margin-bottom: 15px; font-size: 1.4rem;">Fitur Utama:</h2>
        <ul style="list-style: disc; margin-left: 20px; margin-bottom: 15px;">
          <li>Autentikasi Pengguna (Register & Login)</li>
          <li>Menampilkan Daftar Cerita (dengan gambar dan deskripsi)</li>
          <li>Menampilkan Peta Interaktif (LeafletJS) untuk Cerita Berlokasi</li>
          <li>Menambahkan Cerita Baru</li>
          <li>Pengambilan Foto via Kamera Perangkat (WebRTC - getUserMedia)</li>
          <li>Pengambilan Koordinat Lokasi via Klik Peta</li>
          <li>Desain Responsif untuk Berbagai Ukuran Layar</li>
          <li>Transisi Halaman Halus (View Transitions API)</li>
          <li>Penerapan Prinsip Aksesibilitas Dasar (WCAG)</li>
          <li>Arsitektur SPA dengan Pola Model-View-Presenter (MVP)</li>
        </ul>
         <h2 style="margin-top: 30px; margin-bottom: 15px; font-size: 1.4rem;">Teknologi yang Digunakan:</h2>
         <ul style="list-style: disc; margin-left: 20px; margin-bottom: 15px;">
            <li>HTML5 & CSS3</li>
            <li>JavaScript (ES6+)</li>
            <li>Dicoding Story API (REST API)</li>
            <li>LeafletJS (Library Peta)</li>
            <li>MapTiler (Penyedia Tile Peta)</li>
            <li>Font Awesome (Ikon)</li>
            <li>Web API: Fetch, getUserMedia, View Transitions, LocalStorage</li>
            <li>Webpack (Module Bundler)</li>
         </ul>
        <p style="margin-top: 30px; font-style: italic; color: #555;">
            Aplikasi ini dibangun untuk tujuan pembelajaran dan demonstrasi.
        </p>
      </section>
    `;
  }
  async afterRender() {
    console.log('About Page rendered');
  }
}