import { createStore } from "vuex";
import authProvidersModule from "@/modules/authentication/store/authProviders";
import accountsModule from "@/modules/authentication/store/accounts";

const store: any = createStore({
  state: {},
  modules: {
    authProvidersModule,
    accountsModule,
  }
});

export default store;

export type AppStore = typeof store;
export type AppState = typeof store.state;
