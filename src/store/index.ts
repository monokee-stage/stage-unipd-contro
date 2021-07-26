import { createStore } from "vuex";
import { state } from "@/store/store.state";
import actions from "@/store/actions";
import authProvidersModule from "@/store/authProviders";
import accountsModule from "@/store/accounts";
import enrollmentModule from "@/modules/enrollment/store";

const store: any = createStore({
  state,
  actions,
  modules: {
    authProvidersModule,
    accountsModule,
    enrollmentModule,
  }
});

export default store;

export type AppStore = typeof store;
export type AppState = typeof store.state;