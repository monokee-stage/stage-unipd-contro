import { state } from "@/modules/authentication/store/authProviders/state";
import getters from "@/modules/authentication/store/authProviders/getters";
import mutations from "@/modules/authentication/store/authProviders/mutations";
import actions from "@/modules/authentication/store/authProviders/actions";

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}