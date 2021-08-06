import { AppState } from "@/store/state";

export default {
  setUserId: (state: AppState, userId: string) => {
    state.userId = userId
  }
}