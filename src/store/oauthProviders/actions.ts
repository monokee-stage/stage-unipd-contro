import { OAuthProvidersState } from "@/store/oauthProviders/state";
import { OAuthProvider } from "@/store/models/OAuthProvider";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { ActionContext } from "vuex";
import { AppState } from "@/store/state";
import { loadEnvironmentVariable } from "@/util";

const OAUTH_PROVIDERS_IDS_KEY = 'OAUTH_PROVIDERS_IDS'

export default {
  loadOAuthProvidersIds: (context: ActionContext<OAuthProvidersState, AppState>): Promise<string[]> => {
    return SecureStoragePlugin.get({ key: OAUTH_PROVIDERS_IDS_KEY })
      .then((OAuthProvidersIds) => {
        context.commit('setOAuthProviderIds', OAuthProvidersIds.value.split(' '))
        return context.state.OAuthProvidersIds
      })
      .catch(() => {
        context.commit('setOAuthProviderIds', [])
        return context.state.OAuthProvidersIds
      })
  },
  loadOAuthProvider: (context: ActionContext<OAuthProvidersState, AppState>, domainId: string): Promise<OAuthProvider> => {
    return OAuthProvider.loadOAuthProvider(domainId)
      .then((OAuthProvider: OAuthProvider) => {
        context.commit('addOAuthProvider', OAuthProvider)
        console.log('Loaded provider:',domainId)
        return OAuthProvider
      })
      .catch(() => {
        console.log('Created new one');
        return OAuthProvider.createOAuthProviderFromDomainId(domainId)
          .then((newProvider: OAuthProvider) => {
            context.commit('addOAuthProvider', newProvider)
            return newProvider
        })
      })
  },
  saveOAuthProvider: (context: ActionContext<OAuthProvidersState, AppState>, OAuthProvider: OAuthProvider) => {
    SecureStoragePlugin.remove({ key: OAuthProvider.domainId })
      .catch(() => console.log('New provider'))
      .then(() =>
        SecureStoragePlugin.set({ key: OAuthProvider.domainId, value: OAuthProvider.toString() })
          .then(success => {
            console.log('Saved ' + success)
          })
          .catch(error => {
            console.log(error)
            throw error
          }))
  },
  saveOAuthProviders: (context: ActionContext<OAuthProvidersState, AppState>) => {
    context.state.OAuthProviders.forEach(OAuthProvider => {
      context.dispatch('saveOAuthProvider', OAuthProvider)
    })
    context.dispatch('saveOAuthProvidersIds')
  },
  saveOAuthProvidersIds: (context: ActionContext<OAuthProvidersState, AppState>) => {
    SecureStoragePlugin.remove({ key: OAUTH_PROVIDERS_IDS_KEY })
      .catch(() => console.log('No provider yet'))
      .then(() =>
        SecureStoragePlugin.set({ key: OAUTH_PROVIDERS_IDS_KEY, value: context.state.OAuthProvidersIds.join(' ')})
          .then(() => console.log('Saved OAuthProvidersIds'))
          .catch(() => console.log('Error saving OAuthProvidersIds')))
  }
}