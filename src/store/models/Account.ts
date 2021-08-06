import { OAuthProvider } from "@/store/models/OAuthProvider";
import { authorizationService, GRANT_TYPE } from "@/services/OAuthService";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { mfaCoreService } from "@/services/MFACoreService";
import { FCM } from "@/services/FCMService";
import { Token, TokenJson } from "@/store/models/Token";

export interface AccountJson {
  id: string;
  providerId: string;
  deviceId: string;
  token: TokenJson;
  username: string;
}
export class Account{
  private _id: string;
  private _deviceId: string;
  private _provider: OAuthProvider;
  private _token: Token;
  private _username: string;

  public static getOAuthProviderId(accountId: string): Promise<string> {
    return SecureStoragePlugin.get({ key: accountId })
      .then((stringifiedAccount) => {
        const { providerId }: AccountJson = JSON.parse(stringifiedAccount.value)
        return providerId
      })
  }

  public static createAccount(provider: OAuthProvider, token: Token, id: string,  username: string): Promise<Account> {
    return new Account(token).setId(id).setProvider(provider).setUsername(username).save()
  }

  public static loadFromId(accountId: string, provider: OAuthProvider): Promise<Account> {
    return SecureStoragePlugin.get({ key: accountId })
      .then((stringifiedAccount) => {
        const { deviceId, token, username }: AccountJson = JSON.parse(stringifiedAccount.value)
        return new Account(new Token(token)).setDeviceId(deviceId).setProvider(provider).setUsername(username).setId(accountId)
      })
  }

  constructor(token: Token) {

    this._token = token;
    return this;
  }

  private setDeviceId(deviceId: string): Account {
    this._deviceId = deviceId;
    return this;
  }

  private setProvider(provider: OAuthProvider): Account {
    this._provider = provider;
    return this;
  }

  private setToken(token: Token): Account {
    this._token = token;
    return this;
  }

  private setId(accountId: string): Account {
    this._id = accountId
    return this
  }

  private setUsername(username: string): Account {
    this._username = username
    return this
  }

  private save(): Promise<Account> {
    return SecureStoragePlugin.remove({ key: this.id })
      .catch(() => console.log('New account'))
      .then(() =>
        SecureStoragePlugin.set({key: this.id, value: this.toString()})
          .then((success) => {
            console.log('Saved account', success)
            console.log(this.toString())
            return this
          })
          .catch((error) => {
            console.log('Error saving account: ', error)
            throw error
          }))
  }

  isAuthenticated(): boolean {
    return this._token.isValid();
  }

  refreshToken(): Promise<Token> {
    return authorizationService.refreshToken(
      this.provider.configuration.tokenEndpoint,
      GRANT_TYPE.REFRESH_TOKEN,
      this.token.refreshToken,
      this.token.scope)
      .catch((error) => { throw error })
      .then((token) => this._token = token)
      .then(() => this.save())
      .then(() => this.token)
      .catch((error) => { throw error });
  }

  get id(): string {
    return this._id;
  }

  get token(): Token {
    return this._token;
  }

  get provider(): OAuthProvider {
    return this._provider;
  }

  get deviceId(): string {
    return this._deviceId
  }

  get username(): string {
    return this._username
  }

  toString(): string {
    const jsonAccount: AccountJson = {
      id: this.id,
      providerId: this._provider.domainId,
      deviceId: this._deviceId,
      token: this._token.toJson(),
      username: this._username,
    }
    return JSON.stringify(jsonAccount);
  }

  saveDevice(): Promise<Account> {
    console.log('Saving')
    return FCM.getToken().
    then((pushNotificationsToken: string) =>
      mfaCoreService.saveDeviceForAccount(
        this.id,
        this.provider.domainId,
        pushNotificationsToken,
        this.token.accessToken)
      .then((deviceId: string) => {
        this.setDeviceId(deviceId)
        console.log('Saved in be')
        return this.save()
      })
      .catch((error: Error) => { throw error }))
  }

  authorize(challenge: string, sessionId: string): Promise<void> {
    console.log('Authorizing')
    return mfaCoreService.authorizeOperation(
      this.id,
      this.deviceId,
      this.provider.domainId,
      challenge,
      sessionId,
      this.token.accessToken)
    // this.refreshToken()
    //   .then(() =>
  // )
  }

  refuse(challenge: string,  sessionId: string): Promise<void> {
    console.log('Refusing')

    return mfaCoreService.refuseOperation(
      this.id,
      this.deviceId,
      this.provider.domainId,
      challenge,
      sessionId,
      this.token.accessToken)
    // this.refreshToken().then(() =>
    // )
  }

  removeAccount() {
    return mfaCoreService.removeDeviceForAccount(
      this.id,
      this.deviceId,
      this.provider.domainId,
      this.token.accessToken)
  }

  updateToken(token: Token): Promise<Account> {
    this._token = token
    return this.save()
  }
}