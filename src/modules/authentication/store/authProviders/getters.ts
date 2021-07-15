import { AuthProvidersState } from "@/modules/authentication/store/authProviders/state";
import { AuthProvider } from "@/modules/authentication/models/AuthProvider";

export default {
  getAuthProviderFromDomainId: (state: AuthProvidersState) => (domainId: string): AuthProvider | undefined => {
    return state.authProviders.find(authProvider => authProvider.domainId === domainId);
  },
}