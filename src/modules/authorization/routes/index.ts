import { RouteRecordRaw } from "vue-router";

export default [
  {
    path: '/authorize/:accountId/:sessionId/:challenge',
    name: 'Authorization',
    component: () => import('@/modules/authorization/views/Authorization.vue')
  },
] as RouteRecordRaw[];
