import { AuthProvider } from '@/store/models/AuthProvider';

export const state = {
  authProviders: [] as AuthProvider[],
};

export type AuthProvidersState = typeof state;