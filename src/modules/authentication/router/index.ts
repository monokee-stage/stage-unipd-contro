export default {
  path: '/authentication/:domainId',
  name: 'Authentication',
  component: () => import('@/modules/authentication/views/Authentication.vue')
};