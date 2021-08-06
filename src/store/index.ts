import { createStore } from "vuex";
import { state } from "@/store/state";
import actions from "@/store/actions";
import mutations from "@/store/mutations";
import OAuthProvidersModule from "@/store/oauthProviders";
import accountsModule from "@/store/accounts";

const store: any = createStore({
  state,
  actions,
  mutations,
  modules: {
    OAuthProvidersModule,
    accountsModule,
  }
});

export default store;

export type AppStore = typeof store;