import { OAuthProvidersState } from "@/store/oauthProviders/state";
import { OAuthProvider } from "@/store/models/OAuthProvider";

export default {
  setOAuthProviderIds: (state: OAuthProvidersState, OAuthProvidersIds: string[]) => {
    state.OAuthProvidersIds = OAuthProvidersIds
    console.log('OAuth providers Ids loaded:',state.OAuthProvidersIds)
  },
  addOAuthProviderId: (state: OAuthProvidersState, OAuthProviderId: string) => {
    if (state.OAuthProvidersIds.indexOf(OAuthProviderId) === -1) {
      state.OAuthProvidersIds.push(OAuthProviderId)
    }
  },
  addOAuthProvider: (state: OAuthProvidersState, OAuthProvider: OAuthProvider) => {
    if (state.OAuthProviders.indexOf(OAuthProvider) === -1) {
      state.OAuthProviders.push(OAuthProvider)
    }
    if (state.OAuthProvidersIds.indexOf(OAuthProvider.domainId) === -1) {
      state.OAuthProvidersIds.push(OAuthProvider.domainId)
    }
  },
  removeOAuthProviderId: (state: OAuthProvidersState, OAuthProviderId: string) => {
    const index = state.OAuthProvidersIds.indexOf(OAuthProviderId)
    if (index > -1) {
      state.OAuthProvidersIds.splice(index, 1)
    }
  },
  removeOAuthProvider: (state: OAuthProvidersState, OAuthProvider: OAuthProvider) => {
    const index = state.OAuthProviders.indexOf(OAuthProvider)
    if (index > -1) {
      state.OAuthProviders.splice(index, 1)
    }
  },
}