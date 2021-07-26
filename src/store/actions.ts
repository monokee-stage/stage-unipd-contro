import { ActionContext } from "vuex";
import { AppState } from "@/store/index";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import * as uuid from "uuid";

const USER_ID_KEY = 'USER_ID';
export default {
  loadUserId: (context: ActionContext<AppState, AppState>) => {
    SecureStoragePlugin.get({ key: USER_ID_KEY})
      .then((userId) => {
        context.state.userId = userId.value
        console.log(context.state.userId)
      })
      .catch(() => {
      //  No user id previously setted (first app execution)
        context.state.userId = uuid.v4();
        console.log(context.state.userId)
        SecureStoragePlugin.set({ key: USER_ID_KEY, value: context.state.userId})
          .catch((error) => console.log(error));
      });
  }
};