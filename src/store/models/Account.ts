import { AuthProvider } from "@/store/models/AuthProvider";
import AuthService from "@/services/AuthService";
import {
  AuthorizationRequest,
  AuthorizationResponse,
  GRANT_TYPE_AUTHORIZATION_CODE,
  TokenRequest, TokenResponse, TokenResponseJson
} from "@openid/appauth";
import jwtDecode from "jwt-decode";
import { NodeCrypto } from "@openid/appauth/built/node_support";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { BackEndApiService } from "@/services/BackEndApiService";
import { enrollmentAuthProviders } from "@/modules/enrollment/models/AuthProviders";
import { FCM } from "@/services/FCMService";

export interface TokenId {
  iss: string;
  sub: string;
  exp: number;
  iat: number;
}

export interface AccountJson {
  id: string;
  providerId: string;
  deviceId: string;
  token: TokenResponseJson;
  data: object;
}
export class Account{
  private _id: string;
  private _deviceId: string;
  private _provider: AuthProvider;
  private _token!: TokenResponse;
  private _data: object = {};

  public static getAccount(provider: AuthProvider, token: TokenResponse): Promise<Account> {
    return SecureStoragePlugin.get({key: Account.getAccountIdFromToken(token)})
      .then(stringifiedAccount => Account.fromStorage(stringifiedAccount.value, provider))
      .catch(error => new Account(token).setProvider(provider).setToken(token).save());
  }

  public static loadFromId(accountId: string): Promise<Account> {
    return SecureStoragePlugin.get({ key: accountId })
      .then(async (stringifiedAccount) => {
        const { id, providerId, deviceId, token, data }: AccountJson = JSON.parse(stringifiedAccount.value)
        const provider: AuthProvider = enrollmentAuthProviders.getLoadedAuthProviderFromDomainId(providerId) || await enrollmentAuthProviders.loadAuthProvider(providerId)
        return new Account(new TokenResponse(token)).setDeviceId(deviceId).setProvider(provider).setData(data)
      })
  }

  private static fromStorage(stringifiedAccount: string, provider: AuthProvider): Account {
    const {token, deviceId }: AccountJson = JSON.parse(stringifiedAccount);
    return new Account(new TokenResponse(token)).setProvider(provider).setDeviceId(deviceId);
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
    this._id = Account.getAccountIdFromToken(this.token);

    console.log('Account created', this.id);
    return this;
  }

  private setDeviceId(deviceId: string): Account {
    this._deviceId = deviceId;
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

  private setId(accountId: string): Account {
    this._id = accountId
    return this
  }

  private setData(data: object): Account {
    this._data = data
    return this
  }

  private save() {
    SecureStoragePlugin.set({key: this.id, value: this.toString()})
      .then(success => console.log('Saved', success))
      .catch(error => console.log('Error', error));

    return this;
  }

  isAuthenticated(): boolean {
    return (!!this._token)
      // && !this._token.isValid();
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

  refreshToken() {
    if (!this.isAuthenticated()) {
       AuthService.requestToken(
         this.provider.configuration,
         new TokenRequest({
           client_id: this.provider.clientId,
           extras: undefined,
           grant_type: "authorization_code",
           redirect_uri: AuthProvider.redirectURI,
           refresh_token: this.token.refreshToken,
         }))
         .then((token) => this._token = token)
         .catch((error) => { throw error });
    }
  }

  get id(): string {
    return this._id;
  }

  get token(): TokenResponse {
    return this._token;
  }

  get provider(): AuthProvider {
    return this._provider;
  }

  get deviceId(): string {
    return this._deviceId
  }

  toString(): string {
    const jsonAccount: AccountJson = {
      id: this.id,
      providerId: this._provider.domainId,
      deviceId: this._deviceId,
      token: this._token.toJson(),
      data: this._data,
    }
    return JSON.stringify(jsonAccount);
  }

  async saveDevice() {
    console.log('Saving')
    if (!this.isAuthenticated()) {
      await this.refreshToken();
    }
    BackEndApiService.saveDeviceForAccount(this.id, this.provider.domainId, await FCM.getToken(), this.token.accessToken)
      .then((deviceId) => {
        this.setDeviceId(deviceId)
        this.save()
        console.log('Saved in be')
      })
      .catch((error) => { throw error })
  }

  async authorize(challenge: string, sessionId: string) {
    console.log('Authorizing')
    if (!this.isAuthenticated()) {
      await this.refreshToken()
    }
    await BackEndApiService.authorizeOperation(this.id, this.deviceId, this.provider.domainId, challenge, sessionId)
  }

  async refuse(challenge: string,  sessionId: string) {
    console.log('Refusing')
    if (!this.isAuthenticated()) {
      await this.refreshToken()
    }
    await BackEndApiService.refuseOperation(this.id, this.deviceId, this.provider.domainId, challenge, sessionId)
  }
}