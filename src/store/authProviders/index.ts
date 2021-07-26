import { state } from "@/store/authProviders/state";
import getters from "@/store/authProviders/getters";
import mutations from "@/store/authProviders/mutations";
import actions from "@/store/authProviders/actions";

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}