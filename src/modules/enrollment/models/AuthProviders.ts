import store, { AppStore } from "@/store";
import { AuthProvider } from "@/store/models/AuthProvider";
class AuthProviders {
  private store: AppStore =store;

  getLoadedAuthProviderFromDomainId(domainId: string): AuthProvider | undefined {
    return this.store.getters['authProvidersModule/getAuthProviderFromDomainId'](domainId);
  }

  loadAuthProvider(domainId: string): Promise<AuthProvider> {
    return this.store.dispatch('authProvidersModule/loadProvider', domainId);
  }
}

export const enrollmentAuthProviders= new AuthProviders();