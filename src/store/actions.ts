import { ActionContext } from "vuex";
import { AppState } from '@/store/state';
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import * as uuid from "uuid";
import { OAuthProvider } from "@/store/models/OAuthProvider";

const USER_ID_KEY = 'USER_ID';
export default {
  loadUserId: (context: ActionContext<AppState, AppState>) => {
    SecureStoragePlugin.get({ key: USER_ID_KEY})
      .then((userId) => {
        context.commit('setUserId', userId.value)
        console.log('User id loaded:',context.state.userId)
      })
      .catch(() => {
      //  No user id previously setted (first app execution)
        context.commit('setUserId', uuid.v4())
        console.log(context.state.userId)
        SecureStoragePlugin.set({ key: USER_ID_KEY, value: context.state.userId})
          .catch((error) => console.log(error));
      });
  },
  loadAccount: (context: ActionContext<AppState, AppState>, accountId: string) => {
    context.dispatch('accountsModule/getAccountsProvidersId', accountId)
      .then(async (providersId: string) =>
        context.getters['OAuthProvidersModule/getOAuthProviderFromDomainId'](providersId) ||
        await context.dispatch('OAuthProvidersModule/loadOAuthProvider', providersId))
      .then((provider: OAuthProvider) => context.dispatch('accountsModule/loadAccount', { accountId, provider}))
  },
};