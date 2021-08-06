import { AccountsState } from "@/store/accounts/state";
import { Account } from "@/store/models/Account";

export default {
  getAccountFromAccountId: (state: AccountsState) => (accountId: string): Account | undefined => {
    return state.accounts.find((account) => account.id === accountId);
  },
  isAccountAlreadyLinked: (state: AccountsState) => (accountId: string): boolean => {
    return state.accountIds.includes(accountId)
  }
}