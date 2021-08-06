import { OAuthProvider } from "@/store/models/OAuthProvider";

export const state = {
  OAuthProviders: [] as OAuthProvider[],
  OAuthProvidersIds: [] as string[],
  redirectUri: OAuthProvider.REDIRECT_URI,
};

export type OAuthProvidersState = typeof state;