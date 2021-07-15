import { AuthProvider } from "@/modules/authentication/models/AuthProvider";
import AuthService from "@/modules/authentication/services/AuthService";
import {
  AuthorizationRequest,
  AuthorizationResponse,
  GRANT_TYPE_AUTHORIZATION_CODE,
  TokenRequest, TokenResponse, TokenResponseJson
} from "@openid/appauth";
import jwtDecode from "jwt-decode";
import { NodeCrypto } from "@openid/appauth/built/node_support";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

export interface TokenId {
  iss: string;
  sub: string;
  exp: number;
  iat: number;
}

export interface AccountJson {
  id: string;
  providerId: string;
  token: TokenResponseJson;
  data: object;
}
export class Account{
  private _id: string;
  private _provider: AuthProvider;
  private _token!: TokenResponse;
  private _data: object = {};

  public static getAccount(provider: AuthProvider, token: TokenResponse): Promise<Account> {
    return SecureStoragePlugin.get({key: this.getAccountIdFromToken(token)})
      .then(stringifiedAccount => Account.fromStorage(stringifiedAccount.value, provider))
      .catch(error => new Account(token).setProvider(provider).setToken(token));
  }

  private static fromStorage(stringifiedAccount: string, provider: AuthProvider): Account {
    const {token}: AccountJson = JSON.parse(stringifiedAccount);
    return new Account(new TokenResponse(token)).setProvider(provider);
  }

  private static getAccountIdFromToken(token: TokenResponse): string {

    if (token.idToken != null) {
      const decodedToken: TokenId = jwtDecode(token.idToken);
      return decodedToken.sub;
    } else {
      throw new Error('Invalid token');
    }
  }

  private constructor(token: TokenResponse) {

    this._token = token;
    this._id = Account.getAccountIdFromToken(this._token);

    console.log('Account created', this.id);
    this.save();
    return this;
  }

  private setProvider(provider: AuthProvider): Account {
    this._provider = provider;
    return this;
  }

  private setToken(token: TokenResponse): Account {
    this._token = token;
    return this;
  }

  private save() {
    SecureStoragePlugin.set({key: this.id, value: this.toString()})
      .then(success => console.log('Saved', success))
      .catch(error => console.log('Error', error));
  }

  isAuthenticated(): boolean {
    return this._token !== null && !this._token.isValid();
  }

  private requestAuthorization(): AuthorizationResponse | undefined {
    if (!this.isAuthenticated()) {
      const configuration = this._provider.configuration;
      const authorizationRequest = new AuthorizationRequest({
        client_id: this._provider.clientId,
        response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
        redirect_uri: AuthProvider.redirectURI,
        scope: 'openid'
      }, new NodeCrypto());
      return AuthService.requestAuthorization(configuration, authorizationRequest);
    }
  }

  requestToken(authResponse: AuthorizationResponse){
    const tokenRequest = new TokenRequest({
      client_id: this._provider.clientId,
      redirect_uri: AuthProvider.redirectURI,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code: authResponse.code,
      refresh_token: undefined
    });

    // this._token = AuthService.requestToken(this._provider.configuration, tokenRequest);
  }

  get id(): string {
    return this._id;
  }

  toString(): string {
    const jsonAccount: AccountJson = {
      id: this.id,
      providerId: this._provider.domainId,
      token: this._token.toJson(),
      data: this._data,
    }
    return JSON.stringify(jsonAccount);
  }
}