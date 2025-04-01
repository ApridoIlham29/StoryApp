import routes from '../routes/routes.js';
import { getActiveRoute, getActivePathname } from '../routes/url-parser.js';
import { isLoggedIn } from '../utils/auth-utils.js';
import { setContentBusy } from '../utils/ui-utils.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ content, drawerButton, navigationDrawer, authMenuContainer }) {
    if (!content || !drawerButton || !navigationDrawer || !authMenuContainer) {
        throw new Error('App requires content, drawerButton, navigationDrawer, and authMenuContainer elements.');
    }
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
  }

  async renderPage() {
    const currentPath = getActivePathname();
    const targetRoute = getActiveRoute();
    const page = routes[targetRoute];
    console.log(`[App] Rendering page for path: ${currentPath}, route pattern: ${targetRoute}`);
    const protectedRoutes = ['/', '/stories/add'];
    const publicOnlyRoutes = ['/login', '/register'];
    const userIsLoggedIn = isLoggedIn();

    if (!userIsLoggedIn && protectedRoutes.includes(currentPath)) {
         console.warn(`[App] Access denied. Redirecting to /login.`);
         location.hash = '#/login';
         setContentBusy(this.#content, true, 'Redirecting to login...');
         document.title = 'Redirecting...';
         return;
     }
     if (userIsLoggedIn && publicOnlyRoutes.includes(currentPath)) {
         console.warn(`[App] Already logged in. Redirecting to /. `);
         location.hash = '#/';
         setContentBusy(this.#content, true, 'Redirecting to home...');
         document.title = 'Redirecting...';
         return;
     }

    if (!page) {
      console.error(`[App] Route object not found for pattern ${targetRoute}`);
      this.#content.innerHTML = `
          <section class="container" style="text-align: center; padding-top: 50px;">
            <h1 id="page-heading" tabindex="-1">404 - Halaman Tidak Ditemukan</h1>
            <p>Maaf, halaman di alamat <code style="background: #eee; padding: 2px 4px; border-radius: 3px;">${currentPath}</code> tidak terdaftar.</p>
            <a href="#/" class="button" style="margin-top: 20px;">Kembali ke Beranda</a>
          </section>`;
      document.title = '404 - Not Found';
      const heading404 = document.getElementById('page-heading');
      if(heading404) heading404.focus();
      return;
    }

    try {
      const pageTitle = (typeof page.title === 'string' && page.title) ? page.title : 'Dicoding Story App';
      if (document.startViewTransition) {
        document.startViewTransition(async () => {
          console.log(`[App] Starting view transition for ${pageTitle}...`);
          setContentBusy(this.#content, true, 'Memuat halaman...');
          this.#content.innerHTML = await page.render();
          setContentBusy(this.#content, false);

          const mainElement = this.#content.firstElementChild;
          if (mainElement && typeof mainElement.animate === 'function') {
            mainElement.animate([
              { transform: 'translateY(10px)', opacity: 0 },
              { transform: 'translateY(0)', opacity: 1 }
            ], {
              duration: 350,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              pseudoElement: '::view-transition-new(root)',
            });
          }

          await page.afterRender();
          this.#content.focus({ preventScroll: true });
          document.title = pageTitle;
          console.log(`[App] Page "${pageTitle}" rendered successfully with transition.`);
        });
      } else {
        console.log(`[App] Rendering page "${pageTitle}" (no View Transitions).`);
        setContentBusy(this.#content, true, 'Memuat halaman...');
        this.#content.innerHTML = await page.render();
        setContentBusy(this.#content, false);
        await page.afterRender();
        this.#content.focus({ preventScroll: true });
        document.title = pageTitle;
      }
    } catch (error) {
        console.error(`[App] Error rendering page "${page?.constructor?.name || targetRoute}":`, error);
        setContentBusy(this.#content, false);
        this.#content.innerHTML = `
            <section class="container" style="text-align: center; padding-top: 50px;">
              <h1 id="page-heading" tabindex="-1">Oops! Terjadi Kesalahan</h1>
              <p>Maaf, terjadi masalah saat mencoba menampilkan halaman ini. Silakan coba lagi nanti.</p>
              <p class="error-message" style="margin-top: 10px; font-size: 0.85rem; background: #eee; padding: 5px; border-radius: 3px; display: inline-block;">Detail Error: ${error.message}</p>
              <br><a href="#/" class="button" style="margin-top: 20px;">Kembali ke Beranda</a>
            </section>`;
        document.title = 'Error - Dicoding Story App';
        const errorHeading = document.getElementById('page-heading');
        if(errorHeading) errorHeading.focus();
    }
  }
}
export default App;