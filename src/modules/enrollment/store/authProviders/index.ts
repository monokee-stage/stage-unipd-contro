import { state } from '@/modules/enrollment/store/authProviders/state';
import getters from "@/modules/enrollment/store/authProviders/getters";
import mutations from "@/modules/enrollment/store/authProviders/mutations";
import actions from "@/modules/enrollment/store/authProviders/actions";

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};