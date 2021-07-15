import { state, AuthProvidersState } from "@/modules/authentication/store/authProviders/state";
import { AuthProvider } from "@/modules/authentication/models/AuthProvider";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { Action, ActionContext } from "vuex";
import { AppState } from "@/store";

export default {
  // initProviders: (context: ActionContext<AuthProvidersState, AppState>) => {
  //   const key = 'providers';
  //   SecureStoragePlugin.get({key})
  //     .then(value => context.commit('addProvider'))
  //     .catch(error => console.error(error));
  // },
  loadProvider: (context: ActionContext<AuthProvidersState, AppState>, domainId: string): Promise<any> => {
    return AuthProvider.getAuthProvider(domainId)
      .then(provider => {
        context.state.authProviders.push(provider)
      })
      .catch(error => console.log('Error loading provider', error));
  },
  saveProviders: (context: ActionContext<AuthProvidersState, AppState>) => {
    context.state.authProviders.forEach(authProvider => {
      const stringifiedAuthProvider: string = authProvider.toString();
      SecureStoragePlugin.set({key: authProvider.domainId, value: stringifiedAuthProvider})
        .then(success => console.log('Saved ' + success))
        .catch(error => console.log(error));
    })
  }
}