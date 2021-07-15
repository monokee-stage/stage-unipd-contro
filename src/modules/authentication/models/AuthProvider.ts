import {
  AuthorizationResponse,
  AuthorizationServiceConfiguration, AuthorizationServiceConfigurationJson,
  GRANT_TYPE_AUTHORIZATION_CODE,
  TokenRequest
} from "@openid/appauth";
import AuthService from "@/modules/authentication/services/AuthService";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

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
      .then((stringifiedProvider) => {
        console.log('From storage');
        return AuthProvider.fromSecureStorage(stringifiedProvider.value)
      })
      .catch(error => {
        console.log('Recreated')
        // No provider was saved with the given domainId, create a new one
        return new AuthProvider(domainId).init();
      });
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


  private constructor(domainId: string, clientId?: string, metadataURL?: string, configuration?: string) {
      this._domainId = domainId;
      return this;
  }

  private init(): AuthProvider {
    // this._metadataURL = AuthService.getAuthProviderConfigurationURL(this._domainId);
    // Fetch metadataURL from be
    // BackEndApiService.getAuthProviderMetadataURL(this.domainId)
    //   .then(response => this._metadataURL = response.data)
    //   .catch(error => { throw error;});
    this._metadataURL = 'https://new.monokee.com/oauth2/.well-known/oauth-authorization-server/de037da2-054e-496e-b701-791cf65f0947?domain_id=8214e0ab-5f42-410a-b393-8966a1066d06';
    // Fetch client_id from be
    // BackEndApiService.getApplicationClientId(this.domainId)
    //   .then(response => this._clientId = response.data)
    //   .catch(error => { throw error;});
    this._clientId = 'R^zd$vZ8KRf5MDbR';
    AuthService.getAuthProviderConfiguration(this.metadataURL)
      .then(response => {
        this._configuration = response;
        this.save();
      })
      .catch(error => { throw error});

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
    return encodeURI(this.configuration.authorizationEndpoint +
      (this.configuration.authorizationEndpoint.indexOf('?') !== -1 ? '&' : '?')+
      `response_type=code
      &client_id=${this.clientId}
      &redirect_uri=${AuthProvider.redirectURI}
      &state=${this._state}
      &scope=admin`
      // +
      // '&code_challenge=2413fb3709b05939f04cf2e92f7d0897fc2596f9ad0b8a9ea855c7bfebaae892'+
      // +challenge+
      // '&code_challenge_method=S256'
    );
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
    const tokenRequest = new TokenRequest({
      client_id: this.clientId,
      redirect_uri: AuthProvider.redirectURI,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code: authResponse.code,
      refresh_token: undefined,
    });
    AuthService.requestToken(this.configuration, tokenRequest);
  }
}