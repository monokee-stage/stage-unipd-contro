import { RouteRecordRaw } from "vue-router";

export default [
  {
  path: '/authentication/device/:domainId',
  name: 'Authentication',
  component: () => import('@/modules/authentication/views/Authentication.vue')
  },
] as RouteRecordRaw[];