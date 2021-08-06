export interface OAuthProviderConfigurationJson {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  introspection_endpoint: string;
  registration_endpoint?: string;
  revocation_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported: string[];
  grant_types_supported?: string[];
}

export class OAuthProviderConfiguration {
  private readonly _configuration: OAuthProviderConfigurationJson

  constructor(configuration: OAuthProviderConfigurationJson) {
    this._configuration = configuration
  }

  toJson() {
    return this._configuration
  }

  get issuer(): string {
    return this._configuration.issuer
  }

  get authorizationEndpoint(): string {
    return this._configuration.authorization_endpoint
  }

  get tokenEndpoint(): string {
    return this._configuration.token_endpoint
  }

  get scopesSupported(): string[] {
    return this._configuration.scopes_supported || []
  }

  get responseTypesSupported(): string[] {
    return this._configuration.response_types_supported
  }

  get grantTypesSupported(): string[] {
    return this._configuration.grant_types_supported || []
  }

  get introspectionEndpoint(): string {
    return this._configuration.introspection_endpoint
  }

  get revocationEndpoint(): string {
    return this._configuration.revocation_endpoint || ''
  }
}