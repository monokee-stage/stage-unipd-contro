import { isPlatform } from '@ionic/vue';
import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from "@capacitor/push-notifications";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { loadEnvironmentVariable } from "@/util";

class FCMService {

  private _FIREBASE_TOKEN_KEY = 'FIREBASE_TOKEN_KEY'

  initPushNotifications(pushNotificationCallback: (notification: PushNotificationSchema) => void,
                        actionOnPushNotificationCallback: (notification: PushNotificationSchema) => void) {
    if (isPlatform('mobile')) {
      this.registerPushNotification()
      this.bindToNotificationEvent(pushNotificationCallback, actionOnPushNotificationCallback)
    }
  }

  private registerPushNotification() {
    PushNotifications.requestPermissions()
      .then((permission) => {
        if (permission.receive === 'granted') {
          // Permission granted
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
        // Upon registration the firebase's token is saved
        SecureStoragePlugin.remove({ key: this._FIREBASE_TOKEN_KEY })
          .catch(() => console.log('Never registered'))
          .then(() =>
            SecureStoragePlugin.set({key: this._FIREBASE_TOKEN_KEY, value: token.value})
              .then(() => console.log('Successfully registered to notifications'))
              .catch(() => console.log('Error saving')))
      }
    )

    PushNotifications.addListener(
      'registrationError',
      (error: any) => {
        console.log('Error: ',error)
      }
    )
  }

  private bindToNotificationEvent(pushNotificationCallback: (notification: PushNotificationSchema) => void,
                                  actionOnPushNotificationCallback: (notification: PushNotificationSchema) => void) {

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => await pushNotificationCallback(notification)
    )

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (actionPerformed: ActionPerformed) => await actionOnPushNotificationCallback(actionPerformed.notification)
    )

  }

  getToken(): Promise<string> {
    return SecureStoragePlugin.get({ key: this._FIREBASE_TOKEN_KEY })
      .then(token => {
        console.log('Firebase token found')
        return token.value
      })
      .catch(error => {
        console.log('Firebase token not found')
        throw error })
  }
}

export const FCM = new FCMService();