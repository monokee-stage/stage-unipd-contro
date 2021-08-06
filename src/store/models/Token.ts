export enum TOKEN_TYPE {
  BEARER = 'Bearer'
}

export interface TokenJson {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: TOKEN_TYPE;
  issued_at?: number;
}

export const nowInSeconds = () => Math.round(new Date().getTime() / 1000);

export class Token {

  private static AUTH_EXPIRY_BUFFER = 10 * 60 * -1

  private readonly _accessToken: string
  private readonly _refreshToken: string
  private readonly _expiresIn: number
  private readonly _scope: string[]
  private readonly _tokenType: TOKEN_TYPE
  private readonly _issuedAt: number

  constructor(tokenJson: TokenJson) {
    this._accessToken = tokenJson.access_token
    this._expiresIn = tokenJson.expires_in
    this._refreshToken = tokenJson.refresh_token
    this._scope = tokenJson.scope.split(' ')
    this._tokenType = tokenJson.token_type
    this._issuedAt = tokenJson.issued_at || nowInSeconds()
  }

  toJson(): TokenJson {
    return {
      access_token: this._accessToken,
      expires_in: this._expiresIn,
      refresh_token: this._refreshToken,
      scope: this._scope.join(' '),
      token_type: this._tokenType,
      issued_at: this._issuedAt
    }
  }

  isValid(buffer: number = Token.AUTH_EXPIRY_BUFFER): boolean {
    if (this._expiresIn) {
      const now = nowInSeconds();
      return now < this._issuedAt + this._expiresIn + buffer;
    } else {
      return true;
    }
  }

  get accessToken(): string {
    return this._accessToken
  }

  get refreshToken(): string {
    return this._refreshToken
  }

  get expiresIn(): number {
    return this._expiresIn
  }

  get scope(): string {
    return this._scope.join(' ')
  }

  get tokenType(): TOKEN_TYPE {
    return this._tokenType
  }

  get issuedAt(): number {
    return this._issuedAt
  }
}