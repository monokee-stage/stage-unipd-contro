import crypto from "crypto";
import {
  authorizationService,
  CODE_CHALLENGE_METHOD,
  GRANT_TYPE,
  RESPONSE_TYPE, UserData
} from "@/services/OAuthService";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { mfaCoreService } from "@/services/MFACoreService";
import {
  base64URLEncode,
  sha256
} from "@/util";
import {
  OAuthProviderConfiguration,
  OAuthProviderConfigurationJson
} from "@/store/models/OAuthProviderConfiguration";
import { Token } from "@/store/models/Token";

export interface OAuthProviderJson {
  domainId: string;
  clientId: string;
  metadataURL: string;
  configuration: OAuthProviderConfigurationJson;
}

export class OAuthProvider {

  private static _REDIRECT_URI = 'http://localhost/redirect'

  private _domainId: string
  private _metadataUrl: string
  private _clientId: string
  private _state!: string
  private _codeVerifier!: string
  private _codeChallenge!: string
  private _codeChallengeMethod: CODE_CHALLENGE_METHOD = CODE_CHALLENGE_METHOD.SHA256
  private _configuration!: OAuthProviderConfiguration

  public static loadOAuthProvider(domainId: string): Promise<OAuthProvider> {
    return SecureStoragePlugin.get({key: domainId})
      .then((stringifiedAuthProvider) => {
        console.log('From storage');
        const {domainId, clientId, metadataURL, configuration}: OAuthProviderJson = JSON.parse(stringifiedAuthProvider.value);
        return new OAuthProvider(domainId).setClientId(clientId).setMetadataUrl(metadataURL).setConfiguration(configuration);
      })
      .catch(error => {
        console.log('No provider was saved with the given domainId, please create a new one');
        throw error;
      });
  }

  public static createOAuthProviderFromDomainId(domainId: string): Promise<OAuthProvider> {
    return new OAuthProvider(domainId).init();
  }

  private constructor(domainId: string) {
      this._domainId = domainId;
      return this;
  }

  private async init(): Promise<OAuthProvider> {
    // Fetch metadataURL and client_id from backend
    const metadataResponse = await mfaCoreService.getOAuthProviderMetadata(this.domainId)
    this._metadataUrl = metadataResponse.metadataUrl;
    this._clientId = metadataResponse.clientId;
    // Fetch provider configuration from metadataURL
    this._configuration = new OAuthProviderConfiguration(await authorizationService.getOAuthProviderConfiguration(this.metadataUrl));
    // Save the newly created provider in secure storage
    this.save()

    return this;
  }

  private save(): Promise<void> {
    return SecureStoragePlugin.remove({ key: this.domainId })
      .catch(() => console.log('New provider'))
      .then(() =>
        SecureStoragePlugin.set({key: this.domainId, value: this.toString()})
          .then(success => console.log('Saved', success))
          .catch(error => console.log('Error', error)))
  }

  private setClientId(clientId: string): OAuthProvider {
    this._clientId = clientId;
    return this;
  }

  private setMetadataUrl(metadataUrl: string): OAuthProvider {
    this._metadataUrl = metadataUrl;
    return this;
  }

  private setConfiguration(configuration: OAuthProviderConfigurationJson): OAuthProvider {
    this._configuration = new OAuthProviderConfiguration(configuration)
    return this;
  }

  private static generateState(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private static generateCodeVerifier(): string {
    return base64URLEncode(crypto.randomBytes(32))
  }

  private generateCodeChallenge(): string {
    return base64URLEncode(sha256(this.codeVerifier))
  }

  private set codeChallengeMethod(codeChallengeMethod: CODE_CHALLENGE_METHOD) {
    this._codeChallengeMethod = codeChallengeMethod
  }

  private get codeChallengeMethod(): CODE_CHALLENGE_METHOD {
    return this._codeChallengeMethod
  }

  static get REDIRECT_URI(): string {
    return OAuthProvider._REDIRECT_URI;
  }

  get domainId(): string {
    return this._domainId;
  }

  get metadataUrl(): string {
    return this._metadataUrl;
  }

  get configuration(): OAuthProviderConfiguration {
    return this._configuration;
  }

  get clientId(): string {
    return this._clientId;
  }

  get state(): string {
    return this._state
  }

  get name(): string {
    return new URL(this._metadataUrl).hostname
  }

  private get codeVerifier(): string {
    return this._codeVerifier
  }

  private get codeChallenge(): string {
    return this._codeChallenge
  }

  authorizationRequestURL(): string {
    this._state = OAuthProvider.generateState();
    this._codeVerifier = OAuthProvider.generateCodeVerifier()
    this._codeChallenge = this.generateCodeChallenge()

    return authorizationService.getAuthorizationRequestUrl(
      this.configuration.authorizationEndpoint,
      RESPONSE_TYPE.CODE,
      this.clientId,
      this.state,
      this.configuration.scopesSupported,
      this.codeChallenge,
      this.codeChallengeMethod)
  }

  toString(): string {
    const jsonAuthProvider: OAuthProviderJson = {
      domainId: this.domainId,
      clientId: this.clientId,
      metadataURL: this.metadataUrl,
      configuration: this.configuration.toJson(),
    }
    return JSON.stringify(jsonAuthProvider);
  }

  validState(urlEncodedState: string): boolean {
    return this._state === decodeURI(urlEncodedState);
  }

  requestToken(code: string): Promise<Token> {
    return authorizationService.requestToken(
      this.configuration.tokenEndpoint,
      GRANT_TYPE.AUTHORIZATION_CODE,
      code,
      this.codeVerifier,
      this.clientId,
      OAuthProvider.REDIRECT_URI)
  }

  getUserData(token: Token): Promise<UserData> {
    return authorizationService.getUserData(
      this.configuration.introspectionEndpoint,
      token.accessToken,
      this.clientId)
  }
}