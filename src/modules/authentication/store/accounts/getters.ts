import { AccountsState } from "@/modules/authentication/store/accounts/state";
import { Account } from "@/modules/authentication/models/Account";

export default {
  getAccountFromAccountId: (state: AccountsState) => (accountId: string): Account | undefined => {
    return state.accounts.find((account) => account.id === accountId);
  }
}