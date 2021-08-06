import { RouteRecordRaw } from "vue-router";

export default [
  {
    path: '/authentication/domainId/:domainId/accountId/:accountId',
    name: 'Authentication',
    component: () => import('@/modules/authentication/views/Authentication.vue'),
    props: true
  },
] as RouteRecordRaw[];