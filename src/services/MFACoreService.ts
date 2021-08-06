import axios from "axios";
import { Device } from '@ionic-native/device';
import { loadEnvironmentVariable } from "@/util";

export interface OAuthProviderMetadata {
  metadataUrl: string;
  clientId: string;
}

export class MFACoreService {

  private _MFA_CORE_HOST = 'http://localhost:8099'

  getOAuthProviderMetadata(domainId: string): Promise<OAuthProviderMetadata> {
    return axios.get(
      `${this._MFA_CORE_HOST}/mfa/provider/${domainId}/metadata`,
      {
        params: {
          domain_id: domainId
        },
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then((response) => ({
          metadataUrl: response.data.url,
          clientId: response.data.client_id,
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

  saveDeviceForAccount(accountId: string,
                       domainId: string,
                       pushNotificationToken: string,
                       accessToken: string): Promise<string> {

    return axios.post(
      `${this._MFA_CORE_HOST}/mfa/user/${accountId}/device`,
      {
        public_key: 'public_key',
        registration_token: pushNotificationToken,
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
      },
      {
        params: {
          domain_id: domainId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      })
      // Enrolled
      .then((response) => response.data.device_id as string)
      // Error enrolling
      .catch((error) => { throw error })
  }

  removeDeviceForAccount(accountId: string,
                         deviceId: string,
                         domainId: string,
                         accessToken: string) {
    return axios.delete(
      `${this._MFA_CORE_HOST}/mfa/user/${accountId}/device/${deviceId}`,
      {
        params: {
          domain_id: domainId
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      .then((response) => console.log(response))
      .catch((error) => console.log(error))
  }

  authorizeOperation(accountId: string, deviceId: string, domainId: string, challenge: string, sessionId: string, accessToken: string): Promise<void> {
    console.log('Challenge:',challenge)
    console.log('Session:',sessionId)
    return axios.post(
      `${this._MFA_CORE_HOST}/mfa/user/${accountId}/device/${deviceId}/approve`,
      {
        challenge: challenge,
        session_id: sessionId,
      },
      {
        params: {
          domain_id: domainId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      })
      .then(() => console.log('Authorized operation'))
      .catch((error) => {
        console.log('Unable to authorize operation')
        throw error
      })
  }

  refuseOperation(accountId: string,  deviceId: string, domainId: string, challenge: string, sessionId: string, accessToken: string): Promise<void> {
    return axios.post(
      `${this._MFA_CORE_HOST}/mfa/user/${accountId}/device/${deviceId}/refuse`,
      {
        challenge: challenge,
        session_id: sessionId,
      },
      {
        params: {
          domain_id: domainId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      .then(() => console.log('Refused'))
      .catch((error) => { throw error })
  }
}

export const mfaCoreService = new MFACoreService();