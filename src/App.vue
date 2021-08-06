<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { toastController } from '@ionic/core';
import {
  IonApp,
  IonRouterOutlet,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { FCM } from "./services/FCMService";
import { PushNotificationSchema } from "@capacitor/push-notifications";

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  methods: {
    pushNotificationCallback: async function(notification: PushNotificationSchema): Promise<void> {
      console.log('Notification:')
      console.log(notification)
      const toast = await toastController.create({
        header: notification.title,
        message: notification.body,
        position: 'top',
        duration: 10000,
      })

      toast.addEventListener(
          'click',
          () => {
            toast.dismiss()
            this.actionOnNotificationCallback(notification)
          }
      )

      return toast.present()
    },
    actionOnNotificationCallback: async function (notification: PushNotificationSchema) {
      const data = notification.data
      console.log('Action performed:')
      console.log(notification)
      await this.$router.push({
        path:`/authorize/accountId/${data.user_id}/sessionId/${data.session_id}/challengeId/${data.challenge}`,
        query: {
          title: notification.title,
          message: notification.body,
          info: JSON.parse(data.info),
        }
      })
    }
  },
  mounted() {

    this.$store.dispatch('loadUserId')
      .then(() => FCM.initPushNotifications(this.pushNotificationCallback, this.actionOnNotificationCallback))

    this.$store.dispatch('OAuthProvidersModule/loadOAuthProvidersIds')
      .then((oauthProvidersIds: string[]) => {
        oauthProvidersIds.forEach(async (oauthProviderId) => await this.$store.dispatch('OAuthProvidersModule/loadOAuthProvider', oauthProviderId))
        console.log('OAuthProvidersIds:', this.$store.state.OAuthProvidersModule.OAuthProvidersIds)
        console.log('OAuthProviders:', this.$store.state.OAuthProvidersModule.OAuthProviders)
        return
      })
      .then(() => this.$store.dispatch('accountsModule/loadAccountsIds'))
      .then((accountsIds: string[]) => {
        accountsIds.forEach(async (accountId) => await this.$store.dispatch('loadAccount', accountId))
        console.log('Accounts ids:',this.$store.state.accountsModule.accountIds)
        console.log('Accounts:',this.$store.state.accountsModule.accounts)
      })
  }
});
</script>