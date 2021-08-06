declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VUE_APP_FIREBASE_TOKEN_KEY: string;
      VUE_APP_MFA_CORE_HOST: string;
      VUE_APP_REDIRECT_URI: string;
    }
  }
}

export {}