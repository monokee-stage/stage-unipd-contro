<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Authorize operation</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <h1>{{ $route.query.title }}</h1>
        <h2>{{ $route.query.message }}</h2>
        <h3>Location: {{ location }}</h3>
        <h3>Time: {{ info.time }}</h3>
        <ion-button @click="authorize">Authorize</ion-button>
        <ion-button @click="refuse">Refuse</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NativeBiometric } from "capacitor-native-biometric";
import { NativeGeocoder } from "@ionic-native/native-geocoder";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from "@ionic/vue";
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
  data() {
    return {
      location: '',
      info: {
        time: '',
        latitude: 0,
        longitude: 0,
      }
    }
  },
  methods: {
    authorize: function () {
      console.log('Authorize')
      NativeBiometric.isAvailable()
          .then((result) => {
            if (result.isAvailable) {
              return NativeBiometric.verifyIdentity({
                reason: 'Authorize operation',
                title: 'Authorize operation'
              })
            } else {
              throw new Error('Biometric not available')
            }
          })
          .then(() => {
            console.log('Authorized, stuff')
            // if (!this.account.isAuthenticated()) {
            //   return this.account.refreshToken()
            //   .catch(() => this.$router.push(`/authentication/domainId/${this.account.provider.domainId}/accountId/${this.account.id}`))
            //   .then(() => this.account.authorize(this.challenge, this.sessionId))
            // } else
            return this.account.authorize(this.challenge, this.sessionId)
          })
          .then(() => {
            console.log('Redirect')
            return this.$router.back()
          })
          .catch((error) => console.log('Error authorizing:',error))
    },
    refuse: function () {
      console.log('Refuse')
      this.account.refuse(this.challenge, this.sessionId)
      .then(() => this.$router.replace('/home'))
    },
    calculateLocation: function (): Promise<string> {
      return NativeGeocoder.reverseGeocode(this.info.latitude, this.info.longitude)
          .then((result) => result[0].locality)
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
    },
  },
  mounted() {
    console.log(this.$route)
    this.info = JSON.parse(this.$route.query.info as string);
    this.calculateLocation()
      .then((location) => this.location = location)
      .then(() => {
        if (!this.account) {
          this.$store.dispatch('loadAccount', this.accountId)
            .catch(() => {
              console.log('Inexistent account')
              this.$router.replace('/home')
            })
        }
      })
  }
})
</script>

<style scoped>

h1 {
  font-size: 1.2em;
  padding-left: 20px;
}

h2 {
  font-size: 1.1em;
  padding-left: 20px;
}

h3 {
  font-size: 1em;
  padding-left: 20px;
}
</style>