import axios from "axios";
import qs from "qs";
import { OAuthProviderConfigurationJson } from "@/store/models/OAuthProviderConfiguration";
import {
  Token,
  TokenJson
} from "@/store/models/Token";

export const enum RESPONSE_TYPE {
  CODE = 'code',
}

export enum GRANT_TYPE {
  REFRESH_TOKEN = 'refresh_token',
  AUTHORIZATION_CODE = 'authorization_code',
}
export enum CODE_CHALLENGE_METHOD {
  PLAIN = 'plain',
  SHA256 = 'S256',
}

export interface UserDataJson {
  sub: string;
  username: string;
}
export class UserData {
  private readonly _id: string
  private readonly _username: string

  constructor(userDataJson: UserDataJson) {
    this._id = userDataJson.sub
    this._username = userDataJson.username
  }

  get id(): string {
    return this._id
  }

  get username(): string {
    return this._username
  }
}

export class OAuthService {

  getOAuthProviderConfiguration(configurationUrl: string): Promise<OAuthProviderConfigurationJson> {
    return axios.get(configurationUrl)
      .then(response => response.data as OAuthProviderConfigurationJson)
      .catch(() => { throw new Error('Couldn\'t connect to the OAuth provider') })

  }

  getAuthorizationRequestUrl(authorizationEndpoint: string,
                             responseType: RESPONSE_TYPE,
                             clientId: string,
                             state: string,
                             scopes: string[],
                             codeChallenge: string,
                             codeChallengeMethod: CODE_CHALLENGE_METHOD): string {

    return  `${authorizationEndpoint}${(authorizationEndpoint.indexOf('?') === -1 ? '?' : '&')}` +
            `response_type=${responseType}` +
            `&client_id=${encodeURIComponent(clientId)}` +
            `&state=${encodeURIComponent(state)}` +
            `&scope=${scopes.join(' ')}` +
            `&code_challenge=${codeChallenge}` +
            `&code_challenge_method=${codeChallengeMethod}`
  }

  requestToken(tokenEndpoint: string,
               grantType: GRANT_TYPE,
               code: string,
               codeVerifier: string,
               clientId: string,
               redirectUri: string): Promise<Token> {

    return axios.post(
      `${tokenEndpoint}`,
      qs.stringify({
        grant_type: grantType,
        code: code,
        code_verifier: codeVerifier,
        client_id: clientId,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(response => {
        console.log('Response: ')
        console.log(response)
        return new Token(response.data as TokenJson)
      })
      .catch(error => {
        console.log('Token error: ', error)
        throw error
      });
  }

  refreshToken(tokenEndpoint: string,
               grantType: GRANT_TYPE,
               refreshToken: string,
               scope: string): Promise<Token> {

    return axios.post(
      `${tokenEndpoint}`,
      qs.stringify({
        grant_type: grantType,
        refresh_token: refreshToken,
        scope: scope
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then((response) => new Token(response.data as TokenJson))
      .catch((error) => {
        console.log('Error in refresh:',error)
        throw error
      })
  }

  getUserData(introspectionEndpoint: string,
              token: string,
              clientId: string): Promise<UserData> {
    return axios.post(
      `${introspectionEndpoint}`,
      qs.stringify({
        token: token,
        client_id: clientId,
      }),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        }
      })
      .then((response) => new UserData(response.data as UserDataJson))
      .catch((error) => {
        console.log(error)
        throw error
      })
  }
}

export const authorizationService = new OAuthService()