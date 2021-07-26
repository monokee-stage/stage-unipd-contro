<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import {
  IonApp,
  IonRouterOutlet
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { FCM } from "@/services/FCMService";

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  mounted() {
    this.$store.dispatch('loadUserId')
    FCM.initPush();
    // FCM.onNotification().subscribe(data => {
    //   if (data.wasTapped) {
    //     console.log('Foreground')
    //   } else {
    //     console.log('Background')
    //   }
    // })
    //
    // FCM.onTokenRefresh().subscribe(token => {
    //   console.log(token);
    // })
    //
    // FCM.subscribeToTopic('Authorization');
    //
    // FCM.getToken().then((token) => console.log(token))
    // .catch((error) => console.log(error))

    // PushNotifications.addListener('registration', (data) => {
    //
    // });
  }
});
</script>