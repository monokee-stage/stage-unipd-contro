import axios from "axios";
import { Device } from '@ionic-native/device';

export interface AuthProviderMetadataResponse {
  metadataUrl: string;
  client_id: string;
}

export interface DeviceInfo {
  key: string;
  value: string;
}
export interface UserDeviceData {
  public_key: string;
  registration_id: string;
  info: DeviceInfo[];
}

export class BackEndApiService {
  private static BACKEND_HOST ='http://localhost:8099'

  static getAuthProviderMetadata(domainId: string): Promise<AuthProviderMetadataResponse> {
    console.log(`${BackEndApiService.BACKEND_HOST}/mfa/provider/${domainId}/metadata`)
    return axios.get(`${BackEndApiService.BACKEND_HOST}/mfa/provider/${domainId}/metadata`, {
      params: {
        domain_id: domainId
      },
    })
      .then((response) => ({
          metadataUrl: response.data.url,
          client_id: response.data.client_id,
      }))
      .catch(error => {
        console.log(error)
        // Check if error for invalid domainId (status === 500) or Network Error
        throw new Error(
          error.response && error.response.status === 500 ?
          'The inserted domain id is invalid, please enter a new one':
          'Unable to connect to server, please try again later');
      });
  }

  static saveDeviceForAccount(accountId: string, domainId: string, registrationId: string, accessToken: string): Promise<string> {

    const userDeviceData: UserDeviceData = {
      public_key: 'public_key',
      registration_id: registrationId,
      info: [
        {
          key: 'device_model',
          value: Device.model
        },
        {
          key: 'device_brand',
          value: Device.manufacturer
        },
      ]
    }
    console.log(userDeviceData);
    return axios.post(
      `${BackEndApiService.BACKEND_HOST}/mfa/user/${accountId}/device`,
      userDeviceData,
      {
      params: {
        domain_id: domainId,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
      .then((response) => {
        console.log('Device enrolled');
        console.log(response)
        return response.data.device_id as string;
      })
      .catch((error) => {
        console.log('Error enrolling' + error)
        throw error
      })
  }

  static authorizeOperation(accountId: string, deviceId: string, domainId: string, challenge: string, sessionId: string) {
    return axios.post(
      `${BackEndApiService.BACKEND_HOST}/mfa/user/${accountId}/device/${deviceId}/approve`,
      {
        challenge,
        session_id: sessionId,
      },
      {
        params: {
          domain_id: domainId,
        }
      })
      .then((response) => {
        console.log('Authorized operation')
      })
      .catch((error) => {
        console.log('Unable to authorize operation')
        throw error
      })
  }

  static refuseOperation(accountId: string,  deviceId: string, domainId: string, challenge: string, sessionId: string) {
    return axios.post(
      `${BackEndApiService.BACKEND_HOST}/mfa/user/${accountId}/device/${deviceId}/refuse`,
      {
        challenge,
        session_id: sessionId,
      },
      {
        params: {
          domain_id: domainId,
        }
      })
      .then((response) => console.log('Refused'))
      .catch((error) => { throw error })
  }
}