import { AuthProvider } from "@/store/models/AuthProvider";

export const state = {
  authProviders: [] as AuthProvider[],
  redirectURI: AuthProvider.redirectURI,
};

export type AuthProvidersState = typeof state;