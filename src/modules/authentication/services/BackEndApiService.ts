import axios, { AxiosResponse } from "axios";

export class BackEndApiService {
  private static BACKEND_URI: '';
  static getAuthProviderMetadataURL(domainId: string): Promise<AxiosResponse<string>> {
    return axios.get(BackEndApiService.BACKEND_URI+`/provider/${domainId}/metadata`);
  }

  static getApplicationClientId(domainId: string): Promise<AxiosResponse<string>> {
    return axios.get(BackEndApiService.BACKEND_URI+`/provider/${domainId}/clientId`);
  }
}