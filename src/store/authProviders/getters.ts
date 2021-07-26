import { AuthProvidersState } from "@/store/authProviders/state";
import { AuthProvider } from "@/store/models/AuthProvider";

export default {
  getAuthProviderFromDomainId: (state: AuthProvidersState) => (domainId: string): AuthProvider | undefined => {
    return state.authProviders.find(authProvider => authProvider.domainId === domainId);
  },
}