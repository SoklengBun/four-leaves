import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /** Route requires authentication */
    requiresAuth?: boolean;
  }
}
