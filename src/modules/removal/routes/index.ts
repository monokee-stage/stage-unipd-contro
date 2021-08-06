import { RouteRecordRaw } from "vue-router";

export default [
  {
    path: '/removal',
    name: 'Removal',
    component: () => import('@/modules/removal/views/Removal.vue')
  }
]