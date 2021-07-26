import { state, AuthProvidersState } from "@/store/authProviders/state";
import { AuthProvider } from "@/store/models/AuthProvider";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { Action, ActionContext } from "vuex";
import { AppState } from "@/store";
import { cordovaWarn } from "@ionic-native/core/decorators/common";

export default {
  loadProvider: (context: ActionContext<AuthProvidersState, AppState>, domainId: string): Promise<any> => {
    return AuthProvider.getAuthProvider(domainId)
      .then(provider => context.state.authProviders.push(provider))
      .catch(() => {
        console.log('Created new one');
        return AuthProvider.newAuthProviderFromDomainId(domainId).then(newProvider => context.state.authProviders.push(newProvider))
      });
  },
  saveProviders: (context: ActionContext<AuthProvidersState, AppState>) => {
    context.state.authProviders.forEach(authProvider => {
      const stringifiedAuthProvider: string = authProvider.toString();
      SecureStoragePlugin.set({key: authProvider.domainId, value: stringifiedAuthProvider})
        .then(success => console.log('Saved ' + success))
        .catch(error => console.log(error));
    })
  },
}