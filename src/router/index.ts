import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SoklengView from '../views/SoklengView.vue';
import NotFound from '../views/PageNotFoundView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/sokleng',
      name: 'sokleng',
      component: SoklengView,
    },
    {
      path: '/princess-connect',
      name: 'priconne',
      component: () => import('../views/PriconneHomeView.vue'),
    },
    {
      path: '/priconne',
      name: 'priconne-short',
      redirect: { name: 'priconne' },
    },
    {
      path: '/ragnarok-origin',
      name: 'roo',
      component: () => import('../views/ROOHomeView.vue'),
    },
    {
      path: '/roo',
      name: 'roo-short',
      redirect: { name: 'roo' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
});

export default router;
