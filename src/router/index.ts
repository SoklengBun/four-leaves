import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SoklengView from '../views/SoklengView.vue';

import LyricsLayoutView from '../views/lyrics/LayoutView.vue';
import LyricsListView from '../views/lyrics/ListView.vue';
import LyricsDetailView from '../views/lyrics/DetailView.vue';

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
    // {
    //   path: '/sokleng',
    //   name: 'sokleng',
    //   component: SoklengView,
    // },
    {
      path: '/lyrics',
      component: LyricsLayoutView,
      children: [
        {
          path: '',
          name: 'lyrics',
          component: LyricsListView,
        },
        {
          path: '/lyrics/:id',
          name: 'lyrics-detail',
          component: LyricsDetailView,
        },
      ],
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
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/shake',
      name: 'shake',
      component: () => import('../views/ShakeView.vue'),
    },
    // {
    //   path: '/slot-machine',
    //   name: 'slot-machine',
    //   component: () => import('../views/SlotMachineView.vue'),
    // },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
});

export default router;
