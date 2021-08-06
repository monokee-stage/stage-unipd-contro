import { AccountsState } from "@/store/accounts/state";
import { Account } from "@/store/models/Account";

export default {
  setAccountsIds: (state: AccountsState, accountsIds: string[]) => {
    state.accountIds = accountsIds
  },
  addAccount: (state: AccountsState, account: Account) => {
    if (state.accounts.indexOf(account) === -1) {
      state.accounts.push(account)
    }
  },
  addAccountId: (state: AccountsState, accountId: string) => {
    if (state.accountIds.indexOf(accountId) === -1) {
      state.accountIds.push(accountId)
    }
  },
  removeAccount: (state: AccountsState, account: Account) => {
    const index = state.accounts.indexOf(account)
    if (index > -1)
      state.accounts.splice(index, 1)
  },
  removeAccountId: (state: AccountsState, accountId: string) => {
    const index = state.accountIds.indexOf(accountId)
    if (index > -1)
      state.accountIds.splice(index, 1)
  },
}