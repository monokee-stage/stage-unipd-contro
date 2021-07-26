import store, { AppStore } from "@/store";
import { Account } from "@/store/models/Account";

class Accounts {
  private store: AppStore =store;
  getLoadedAccountFromAccountId(accountId: string): Account | undefined {
    return this.store.getters['accountsModule/getAccountFromAccountId'](accountId);
  };
}

export const enrollmentAccounts = new Accounts();