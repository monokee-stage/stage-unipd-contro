import { isPlatform } from '@ionic/vue';
import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from "@capacitor/push-notifications";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import router from "@/router";

const FIREBASE_TOKEN_KEY = 'FIREBASE_TOKEN_KEY';

class FCMService {

  initPush() {
    if (isPlatform('mobile')) {
      this.registerPush();
    }
  }

  private registerPush() {
    PushNotifications.requestPermissions()
      .then((permission) => {
        if (permission.receive === 'granted') {
          console.log('Permission granted')
          PushNotifications.register()
            .then(() => console.log('Registered'))
            .catch((error) => console.log(error))
        } else {
          console.log('No permission granted')
        }
      })
      .catch((error) => console.log(error))

    PushNotifications.addListener(
      'registration',
      (token: Token) => {
        console.log('Save this token: ',token.value)
        SecureStoragePlugin.set({key: FIREBASE_TOKEN_KEY, value: token.value})
          .then(() => console.log('Successfully registered'))
          .catch(() => console.log('Error saving'))
      }
    )

    PushNotifications.addListener(
      'registrationError',
      (error: any) => {
        console.log('Error: ',error)
      }
    )

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    )

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        const data = notification.notification.data
        console.log('Action performed: ' + JSON.stringify(notification.notification))
        // if (data.challenge && data.session_id) {
        const accountId = '1234567890'
        await router.push(`/authorize/${accountId}/${data.session_id}/${data.challenge}`)
        // }
      }
    )
  }

  getToken(): Promise<string> {
    return SecureStoragePlugin.get({ key: FIREBASE_TOKEN_KEY})
      .then(token => token.value)
      .catch(error => { throw error })
  }
}

export const FCM = new FCMService();