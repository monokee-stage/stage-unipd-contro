import { Account } from "@/modules/authentication/models/Account";

export const state = {
  accounts: [] as Account[]
}

export type AccountsState = typeof state;