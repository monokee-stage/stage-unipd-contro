import { RouteRecordRaw } from "vue-router";

export default [
  {
  path: '/enrollment',
  name: 'Enrollment',
  component: () => import('@/modules/enrollment/views/Enrollment.vue'),
  },
  {
    path: '/enrollment/account/:accountId/device',
    name: 'Enroll device',
    component: () => import('@/modules/enrollment/views/EnrollDevice.vue'),
  }
] as RouteRecordRaw[];
