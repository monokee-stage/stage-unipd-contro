import { ActionContext } from "vuex";
import { AccountsState } from "@/store/accounts/state";
import { AppState } from "@/store/state";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { Account } from "@/store/models/Account";
import { loadEnvironmentVariable } from "@/util";

const ACCOUNTS_IDS_KEY = 'ACCOUNTS_IDS'

export default {
  loadAccountsIds: (context: ActionContext<AccountsState, AppState>): Promise<string[]> => {
    return SecureStoragePlugin.get({ key: ACCOUNTS_IDS_KEY})
      .then((accountsIds) => {
        context.commit('setAccountsIds', accountsIds.value.split(' '))
        return context.state.accountIds
      })
      .catch(() => {
        context.commit('setAccountsIds', [])
        return context.state.accountIds
      });
  },
  loadAccount: (context: ActionContext<AccountsState, AppState>, { accountId, provider }: any): Promise<Account> => {
    return Account.loadFromId(accountId, provider)
      .then((account) => {
        console.log('Loaded account:',account.id)
        context.commit('addAccount', account)
        context.dispatch('addAccountId', account.id)
        return account
      })
  },
  addAccountId: (context: ActionContext<AccountsState, AppState>, accountId: string): Promise<any> => {
    context.commit('addAccountId', accountId)
    return SecureStoragePlugin.remove({ key: ACCOUNTS_IDS_KEY })
      .catch(() => console.log('No accounts yet'))
      .then(() =>
        SecureStoragePlugin.set( {key: ACCOUNTS_IDS_KEY, value: `${context.state.accountIds.join(' ')}`}))
  },
  addAccount: (context: ActionContext<AccountsState, AppState>, { provider, token, id, username}: any): Promise<Account> => {
    console.log('Adding account')
    return Account.createAccount(provider, token, id, username)
      .then((account) => {
        context.commit('addAccount', account)
        context.dispatch('addAccountId', account.id)
        return account
      })
  },
  getAccountsProvidersId: (context:  ActionContext<AccountsState, AppState>, accountId: string): Promise<string> => {
    return Account.getOAuthProviderId(accountId)
  },
  removeAccount: (context: ActionContext<AccountsState, AppState>, account: Account): Promise<void> => {
    return account.removeAccount()
      .then(() => SecureStoragePlugin.remove({ key: account.id}))
      .then(() => context.dispatch('removeAccountId', account.id))
      .then(() => context.commit('removeAccount', account))
      .then(() => {
        console.log('Ids after removal:',context.state.accountIds)
        console.log('Accounts after removal:',context.state.accounts)
      })
  },
  removeAccountId: (context: ActionContext<AccountsState, AppState>, accountId: string): Promise<any> => {
    return SecureStoragePlugin.remove({ key: ACCOUNTS_IDS_KEY })
      .catch(() => console.log('No accountIds setted'))
      .then(() => {
        context.commit('removeAccountId', accountId)
        return SecureStoragePlugin.set({ key: ACCOUNTS_IDS_KEY, value: context.state.accountIds.join(' ')})
          .then(() => console.log('Account removed'))
          .catch(() => context.commit('addAccountId', accountId))
      })
  },
};