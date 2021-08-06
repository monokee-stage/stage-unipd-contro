import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue'
import authenticationRoutes from '@/modules/authentication/routes';
import enrollmentRoutes from '@/modules/enrollment/routes';
import authorizationRoutes from '@/modules/authorization/routes';
import removalRoutes from '@/modules/removal/routes';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/redirect',
    name: 'Redirect',
    component: () => import('../modules/authentication/views/Authentication.vue')
  },
  ...authenticationRoutes,
  ...enrollmentRoutes,
  ...authorizationRoutes,
  ...removalRoutes,
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router;