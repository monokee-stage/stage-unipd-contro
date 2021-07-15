import {
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationResponse,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  RedirectRequestHandler,
  TokenRequest,
  TokenResponse
} from "@openid/appauth";
import axios from "axios";
import { NodeBasedHandler, NodeRequestor } from "@openid/appauth/built/node_support";

export default class AuthService {

  static getAuthProviderConfigurationURL(domain_id: string): string {
    let configurationUrl = '';
    axios.get('/provider/' + domain_id + '/metadata')
      .then((response) => {
        configurationUrl = response.data;
      })
      .catch((error) => { throw error; })
    return configurationUrl;
  }

  static getAuthProviderConfiguration(openIdConnectURL: string): Promise<AuthorizationServiceConfiguration> {
    return AuthorizationServiceConfiguration.fetchFromIssuer(openIdConnectURL, new NodeRequestor());
  }

  // static requestAuthorizationCode() {
  //   return oauth.client(axios.create(), {
  //     url: 'https://new.monokee.com/oauth2/4220b7a2-ddae-4ce8-8a60-95302fcba6e8/authorize',
  //     domain_id: '8214e0ab-5f42-410a-b393-8966a1066d06',
  //     grant_type: 'authorization_code',
  //     client_id: 'R^zd$vZ8KRf5MDbR',
  //     redirect_uri: 'http://localhost/redirect',
  //     code: '',
  //     scope: 'admin',
  //   })
  // }

  static requestAuthorization(authProviderConfiguration: AuthorizationServiceConfiguration, authRequest: AuthorizationRequest): AuthorizationResponse {
    let authorizationResponse!: AuthorizationResponse;
    const authorizationNotifier = new AuthorizationNotifier();
    const authorizationHandler = new NodeBasedHandler();
    authorizationHandler.setAuthorizationNotifier(authorizationNotifier);
    authorizationNotifier.setAuthorizationListener((request, response, error) => {
      if (error !== null) {
        throw error;
      } else if (response === null) {
        throw new Error('Invalid response received');
      }
      authorizationResponse = response;
    });

    authorizationHandler.performAuthorizationRequest(authProviderConfiguration, authRequest);
    return authorizationResponse;
  }

  static requestToken(authProviderConfiguration: AuthorizationServiceConfiguration, tokenRequest: TokenRequest): Promise<TokenResponse> {
    const tokenHandler = new BaseTokenRequestHandler();
    return tokenHandler.performTokenRequest(authProviderConfiguration, tokenRequest)
      .then((response) => response)
      .catch((error) => { throw error; });
  }

  private static generateCodeVerifier(): string {

    return '';
  }
}