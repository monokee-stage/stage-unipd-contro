<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Enrollment</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
<!--      <ion-button @click="$router.replace('/home')">Cancel enrollment</ion-button>-->
      <h3>Insert the desired provider's domain id</h3>
      <ion-item>
        <ion-input type="text" placeholder="Domain id" v-model="domainId"></ion-input>
      </ion-item>
      <ion-button @click="confirmDomainId">Confirm domain id</ion-button>
      <ion-button @click="insertFromQRCode">Scan QR Code</ion-button>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  alertController
} from "@ionic/vue";
import { AuthProvider } from "@/store/models/AuthProvider";
import { enrollmentAuthProviders } from "@/modules/enrollment/models/AuthProviders";
import { TokenResponse } from "@openid/appauth";
import { BarcodeScanner, BarcodeScanResult } from "@ionic-native/barcode-scanner";

export default defineComponent({
  name: "Enrollment",
  data () {
    return {
      domainId: '',
    }
  },
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonBackButton,
    IonItem,
    IonInput,
  },
  methods: {
    confirmDomainId: function() {
      if (this.domainId.length < 1) {
        this.displayInvalidDomainIdAlert();
      } else {
        // Check if authProvider is already in memory
        if (this.provider === undefined) {
          // Create/load the authProvider
          // enrollmentAuthProviders.loadAuthProvider(this.domainId)
          this.$store.dispatch('authProvidersModule/loadProvider', this.domainId)
              .then(() =>{
                this.$store.dispatch(
                    'accountsModule/addAccount',{
                    provider: this.$store.getters['authProvidersModule/getAuthProviderFromDomainId'](this.domainId),
                    token: new TokenResponse({
                      access_token: 'token',
                      id_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                    })}).then(() => {
                      console.log('Added account')
                      this.$router.replace(`/enrollment/account/1234567890/device`)
                    })
                  // this.$store
                  // this.$router.replace(`/authentication/device/${this.domainId}`)

              })
              .catch((error: Error) => {
                console.log('Enrollment error')
                this.displayErrorAlert(error.message);
              });
        } else {
          // The requested provider is already in memory, proceed with account authentication
          // this.$router.replace(`/authentication/device/${this.domainId}`);
          this.$router.replace(`/enrollment/account/1234567890/device`)
        }
      }
    },
    insertFromQRCode: function () {
      BarcodeScanner.scan()
          .then((data: BarcodeScanResult) => {
            console.log('Scanned: ' + data.text)
            this.domainId = data.text
          })
          .catch((error) => console.log('Error: ' + error))
    },
    displayInvalidDomainIdAlert: async function() {
      const alert = await alertController.create({
        header: 'Error',
        message: 'Please insert a valid domain id',
        buttons: ['Dismiss'],
      });

      return alert.present();
    },
    displayErrorAlert: async function(errorMessage: string) {
      const alert = await alertController.create({
        header: 'Error',
        message: errorMessage,
        buttons: [ 'Dismiss' ],
      });

      return alert.present();
    },
  },
  computed: {
    provider: function (): AuthProvider | undefined {
      // return enrollmentAuthProviders.getLoadedAuthProviderFromDomainId(this.domainId);
      return this.$store.getters['authProvidersModule/getAuthProviderFromDomainId'](this.domainId)
    }
  }
});
</script>

<style scoped>
 h3 {
   font-size: 16px;
 }
</style>