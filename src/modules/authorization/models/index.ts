import store, { AppStore } from "@/store";
import { Account } from "@/store/models/Account";

class Authorization {
  private store: AppStore =store

  // authorize(accountId: string) {
  // }

  // account(accountId: string): Account {
  //   return this.store.getters['accountsModule/getAccountFromAccountId'](accountId) ?? this.store.dispatch('accountsModule/load');
  // }
}

export const authorization = new Authorization();