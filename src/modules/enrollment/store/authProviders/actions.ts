import { ActionContext } from "vuex";
import { AuthProvidersState } from "@/modules/enrollment/store/authProviders/state";
import { AppState } from "@/store";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { AuthProvider } from "@/store/models/AuthProvider";

export default {
  getAuthProviderFromDomainId: (context: ActionContext<AuthProvidersState, AppState>, domainId: string): Promise<any> => {
    return AuthProvider.getAuthProvider(domainId)
      .then(provider => {
        context.state.authProviders.push(provider)
      })
      .catch(error => {
        // context.state.authProviders.push(AuthProvider.newAuthProviderFromDomainId(domainId));
        // console.log('Created new one');
      });
  },
  // getAuthProviderFromDomainId: (context: ActionContext<AuthProvidersState, AppState>, domainId: string): Promise<any> => {
  //   return SecureStoragePlugin.get({ key: domainId})
  //     .then(response => {
  //       // Load from storage
  //       response.value
  //     })
  //     .catch(error => {
  //       // Create provider
  //       // return AuthProvider.getAuthProvider(domainId);
  //       });
  // }
};