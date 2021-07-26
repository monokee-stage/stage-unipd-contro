import {
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationResponse,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  RedirectRequestHandler,
  TokenResponse
} from "@openid/appauth";
import axios from "axios";
import { NodeBasedHandler, NodeRequestor } from "@openid/appauth/built/node_support";
import { TokenRequest } from "@/store/models/AuthProvider";

export default class AuthService {

  static getAuthProviderConfigurationURL(domain_id: string): Promise<string> {
    return axios.get('/mfa/provider/' + domain_id + '/metadata', {
      params: {
        domain_id: domain_id
      }})
      .then((response) => {
        return response.data.toString();
      })
      .catch((error) => { throw error; })
  }

  static getAuthProviderConfiguration(openIdConnectURL: string): Promise<AuthorizationServiceConfiguration> {
    // return AuthorizationServiceConfiguration.fetchFromIssuer(openIdConnectURL, new NodeRequestor());
    return axios.get(openIdConnectURL).then(
      response => {
        return new AuthorizationServiceConfiguration(response.data);
      }
    )
  }

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

  static requestToken(authProviderConfiguration: AuthorizationServiceConfiguration, data: TokenRequest/*tokenRequest: TokenRequest*/): Promise<any> {
    // const tokenHandler = new BaseTokenRequestHandler(new NodeRequestor());
    return axios.post(authProviderConfiguration.tokenEndpoint, data,
      {
        headers: {
          // 'Authorization': 'Basic',
          'Content-type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }).then(response => {
        // console.log(response)
      console.log(response.toString())
    })
      .catch(error=> console.log(error));
    // return tokenHandler.performTokenRequest(authProviderConfiguration, tokenRequest)
    //   .then((response) => response)
    //   .catch((error) => { throw error; });
  }

  private static generateCodeVerifier(): string {

    return '';
  }
}