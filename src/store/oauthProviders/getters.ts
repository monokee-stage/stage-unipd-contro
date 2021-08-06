import { OAuthProvidersState } from "@/store/oauthProviders/state";
import { OAuthProvider } from "@/store/models/OAuthProvider";

export default {
  getOAuthProviderFromDomainId: (state: OAuthProvidersState) => (domainId: string): OAuthProvider | undefined => {
    return state.OAuthProviders.find(OAuthProvider => OAuthProvider.domainId === domainId);
  },
}