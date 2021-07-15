import { AuthProvider } from "@/modules/authentication/models/AuthProvider";

export const state = {
  authProviders: [] as AuthProvider[],
  redirectURI: AuthProvider.redirectURI,
};

export type AuthProvidersState = typeof state;