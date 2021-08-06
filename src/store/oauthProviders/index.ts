import { state } from "@/store/oauthProviders/state";
import getters from "@/store/oauthProviders/getters";
import mutations from "@/store/oauthProviders/mutations";
import actions from "@/store/oauthProviders/actions";

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}