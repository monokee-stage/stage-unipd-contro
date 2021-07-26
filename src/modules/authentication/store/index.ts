import authProvidersModule from '@/store/authProviders';
import accountsModule from '@/store/accounts';

export default {
  namespaced: true,
  modules: {
    authProvidersModule,
    accountsModule
  }
}