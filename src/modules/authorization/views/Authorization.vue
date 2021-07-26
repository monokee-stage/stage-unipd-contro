<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Authorize app</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <h1>{{ }}</h1>
        <ion-button @click="authorize">Authorize</ion-button>
        <ion-button @click="refuse">Refuse</ion-button>
        <a @click="$router.push('/home')">Authentication</a>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NativeBiometric } from "capacitor-native-biometric";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from "@ionic/vue";
import { authorization } from "@/modules/authorization/models";
import { Account } from "@/store/models/Account";

export default defineComponent({
  name: "Authorization",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  },
  methods: {
    authorize: function () {
      console.log('Authorize')
      NativeBiometric.isAvailable()
          .then((result) => {
            if (result.isAvailable) {
              NativeBiometric.verifyIdentity({
                reason: 'Authorize operation',
                title: 'Authorize operation'
              })
                  .then(() => {
                    console.log('Authorized, stuff')
                    this.account.authorize(this.challenge, this.sessionId)
                  })
                  .catch((error) => console.log('Error authorizing ' + error))
            } else {
              console.log('Not available')
            }
          })
          .catch((error) => console.log('Biometric not available' + error))
    },
    refuse: function () {
      console.log('Refuse')
      this.account.refuse(this.challenge, this.sessionId)
    }
  },
  computed: {
    account: function (): Account {
      return this.$store.getters['accountsModule/getAccountFromAccountId'](this.accountId)
    },
    accountId: function (): string {
      const { accountId } = this.$route.params
      return accountId.toString()
    },
    challenge: function (): string {
      const { challenge } = this.$route.params
      return challenge.toString()
    },
    sessionId: function (): string {
      const { sessionId } = this.$route.params
      return sessionId.toString()
    }
  },
  mounted() {
    if (!this.account) {
        this.$store.dispatch('accountsModule/loadAccount', this.accountId)
          .catch(() => {
            console.log('Inexistent account')
            // this.$router.replace('/home')
          })
    }
  }
})
</script>

<style scoped>

</style>