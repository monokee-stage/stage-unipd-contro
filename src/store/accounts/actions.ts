import { ActionContext } from "vuex";
import { AccountsState } from "@/store/accounts/state";
import { AppState } from "@/store";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { AuthProvider } from "@/store/models/AuthProvider";
import { TokenResponse } from "@openid/appauth";
import { Account } from "@/store/models/Account";
import { enrollmentAuthProviders } from "@/modules/enrollment/models/AuthProviders";

const ACCOUNT_IDS_KEY = 'account_ids';
export default {
  loadAccountsIds: (context: ActionContext<AccountsState, AppState>): Promise<any> => {
    return SecureStoragePlugin.get({ key: ACCOUNT_IDS_KEY})
      .then((accountIds) => context.state.accountIds = accountIds.value.split(' '))
      .catch(() => context.state.accountIds = []);
  },
  loadAccount: (context: ActionContext<AccountsState, AppState>, accountId: string): Promise<any> => {
    return Account.loadFromId(accountId)
      // .then(() => console.log('Loaded'))
      // .catch((error) => console.log('Inexistent account'))
  },
  addAccountIdToIds: (context: ActionContext<AccountsState, AppState>, accountId: string): Promise<any> => {
    return SecureStoragePlugin.get({ key: ACCOUNT_IDS_KEY })
      .then((accountIds) =>
        SecureStoragePlugin.set( {key: ACCOUNT_IDS_KEY, value: `${accountIds.value} ${accountId}`}))
      .catch(() => {
        console.log('Empty')
        SecureStoragePlugin.set( { key: ACCOUNT_IDS_KEY, value: accountId});
      });
  },
  addAccount: (context: ActionContext<AccountsState, AppState>, {provider, token}: any): Promise<void> => {
    return Account.getAccount(provider, token)
      .then((newAccount) => {
        context.state.accounts.push(newAccount)
        context.dispatch('addAccountIdToIds', newAccount.id)
      })
      .catch((error) => { throw error})
  }
};