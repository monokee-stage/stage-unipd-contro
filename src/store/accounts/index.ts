import { state } from "@/store/accounts/state";
import getters from "@/store/accounts/getters";
import mutations from "@/store/accounts/mutations";
import actions from "@/store/accounts/actions";

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};