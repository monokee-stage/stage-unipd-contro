import {
  AuthorizationResponse,
  AuthorizationServiceConfiguration, AuthorizationServiceConfigurationJson,
  GRANT_TYPE_AUTHORIZATION_CODE, StringMap,
  // TokenRequest
} from "@openid/appauth";
import AuthService from "@/services/AuthService";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { BackEndApiService } from "@/services/BackEndApiService";

export interface AuthProviderJson {
  domainId: string;
  clientId: string;
  metadataURL: string;
  configuration: AuthorizationServiceConfigurationJson;
}

export class AuthProvider {

  private static readonly _redirectURI:  string = 'http://localhost/redirect';

  private _domainId: string;
  private _metadataURL: string;
  private _clientId: string;
  private _state!: string;
  private _configuration!: AuthorizationServiceConfiguration;

  public static getAuthProvider(domainId: string): Promise<AuthProvider> {
    return SecureStoragePlugin.get({key: domainId})
      .then((stringifiedAuthProvider) => {
        console.log('From storage');
        const {domainId, clientId, metadataURL, configuration}: AuthProviderJson = JSON.parse(stringifiedAuthProvider.value);
        // return AuthProvider.fromSecureStorage(stringifiedProvider.value)
        return new AuthProvider(domainId).setClientId(clientId).setMetadataUrl(metadataURL).setConfiguration(configuration);
      })
      .catch(error => {
        console.log('No provider was saved with the given domainId, please create a new one');
        throw error;
      });
  }

  public static newAuthProviderFromDomainId(domainId: string): Promise<AuthProvider> {
    return new AuthProvider(domainId).init();
  }

  private static fromSecureStorage(stringifiedAuthProvider: string): AuthProvider {
    const {domainId, clientId, metadataURL, configuration}: AuthProviderJson = JSON.parse(stringifiedAuthProvider);
    // const modifiedStringedAuthProvider = stringifiedAuthProvider.replace(/{/gi, "|{");
    // const [ authProviderData, configuration] = modifiedStringedAuthProvider.split('|')
    // const [domainId, clientId, metadataURL] = authProviderData.split(' ');
    console.log('Strings: ',domainId, clientId, metadataURL);
    console.log('Config: ', configuration)
    return new AuthProvider(domainId).setClientId(clientId).setMetadataUrl(metadataURL).setConfiguration(configuration);
  }


  private constructor(domainId: string) {
      this._domainId = domainId;
      return this;
  }

  private async init(): Promise<AuthProvider> {
    // Fetch metadataURL and client_id from backend
    const metadataResponse = await BackEndApiService.getAuthProviderMetadata(this.domainId);
    // console.log(metadataResponse);
    this._metadataURL = metadataResponse.metadataUrl;
    this._clientId = metadataResponse.client_id;
    // Fetch provider configuration from metadataURL
    this._configuration = await AuthService.getAuthProviderConfiguration(this.metadataURL);
    // console.log(this.configuration);
    // Save the newly created provider in secure storage
    this.save()

    return this;
  }

  private save() {
    SecureStoragePlugin.set({key: this.domainId, value: this.toString()})
      .then(success => console.log('Saved', success))
      .catch(error => console.log('Error', error));
  }

  private setClientId(clientId: string): AuthProvider {
    this._clientId = clientId;
    return this;
  }

  private setMetadataUrl(metadataUrl: string): AuthProvider {
    this._metadataURL = metadataUrl;
    return this;
  }

  private setConfiguration(configuration: AuthorizationServiceConfigurationJson): AuthProvider {
    this._configuration = new AuthorizationServiceConfiguration({
      authorization_endpoint: configuration.authorization_endpoint,
      end_session_endpoint: configuration.end_session_endpoint,
      revocation_endpoint: configuration.revocation_endpoint,
      token_endpoint: configuration.token_endpoint,
      userinfo_endpoint: configuration.userinfo_endpoint,
    });
    return this;
  }

  private static generateState(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static get redirectURI(): string {
    return AuthProvider._redirectURI;
  }

  get domainId(): string {
    return this._domainId;
  }

  get metadataURL(): string {
    return this._metadataURL;
  }

  get configuration(): AuthorizationServiceConfiguration {
    return this._configuration;
  }

  get clientId(): string {
    return this._clientId;
  }

  authorizationRequestURL(): string {
    this._state = AuthProvider.generateState();

    return this.configuration.authorizationEndpoint +
      (this.configuration.authorizationEndpoint.indexOf('?') !== -1 ? '&' : '?')+
      `response_type=code`+
      `&client_id=${encodeURIComponent(this.clientId)}`+
      `&state=${this._state}`+
      `&scope=admin`+
      `&code_challenge=h3-rO_IJQ3Vr8C5UzVQ6L-ZTK95KUI5F-cNcFxUlHRg`+
      `&code_challenge_method=S256`;
      // + '&code_challenge=2413fb3709b05939f04cf2e92f7d0897fc2596f9ad0b8a9ea855c7bfebaae892'+
      // '&code_challenge_method=S256'
  }

  toString(): string {
    const jsonAuthProvider: AuthProviderJson = {
      domainId: this.domainId,
      clientId: this.clientId,
      metadataURL: this.metadataURL,
      configuration: this.configuration.toJson(),
    }
    return JSON.stringify(jsonAuthProvider);
  }

  validState(urlEncodedState: string): boolean {
    return this._state === decodeURI(urlEncodedState);
  }

  log() {
    console.log(this.domainId, this.clientId, this.metadataURL, this.configuration.toJson())
  }

  requestToken(authResponse: AuthorizationResponse) {
    // const extras: StringMap = {};
    // const tokenRequest = new TokenRequest({
    const tokenRequest = {
      // client_id: this.clientId,
      // code_verifier: '8gwIpn~xQ_-v26on3MTlPNkdS3YgRNmYk9EMaE7Tq60GgrhRFZ.bGrz5yTC7oKkGYEQk2F11FqlukXI01~D0sH-SH3R-D2cofcknlnERVBIt0zv8rkbNOlp935FQkq1X',
      // redirect_uri: AuthProvider.redirectURI,
      grant_type: 'authorization_code',
      // code: authResponse.code,
      // refresh_token: undefined,
    };
    AuthService.requestToken(this.configuration, tokenRequest)
      // .then(r => console.log(r.toJson()))
      // .catch(error => console.log(error));
  }
}

export interface TokenRequest {
  client_id?: string;
  code_verifier?: string;
  redirect_uri?: string;
  grant_type?: string;
  code?: string;
  // refresh_token
}