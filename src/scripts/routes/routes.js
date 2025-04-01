import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import LoginPage from '../pages/auth/login-page.js';
import RegisterPage from '../pages/auth/register-page.js';
import AddStoryPage from '../pages/stories/add-story-page.js';
import DetailStoryPage from '../pages/stories/detail-story-page.js';

const routes = {
  '/': new HomePage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/stories/add': new AddStoryPage(),
  '/about': new AboutPage(),
  '/stories/:id': new DetailStoryPage(),
};

export default routes;