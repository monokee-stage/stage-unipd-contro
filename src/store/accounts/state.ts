import { Account } from "@/store/models/Account";

export const state = {
  accounts: [] as Account[],
  accountIds: [] as string[],
}

export type AccountsState = typeof state;