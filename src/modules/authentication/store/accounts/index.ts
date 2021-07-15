import { state } from "@/modules/authentication/store/accounts/state";
import getters from "@/modules/authentication/store/accounts/getters";
import mutations from "@/modules/authentication/store/accounts/mutations";
import actions from "@/modules/authentication/store/accounts/actions";

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};