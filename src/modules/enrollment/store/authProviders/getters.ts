import { ActionContext } from "vuex";
import { AuthProvidersState } from "@/modules/enrollment/store/authProviders/state";
import { AppState } from "@/store";
import { AuthProvider } from "@/store/models/AuthProvider";

export default {
  getLoadedAuthProvider: (context: ActionContext<AuthProvidersState, AppState>, domainId: string): AuthProvider | undefined => {
    return context.state.authProviders.find((authProvider) => authProvider.domainId === domainId);
  }
}