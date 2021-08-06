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
      <h3>Insert the desired provider's domain id</h3>
      <ion-item>
        <ion-input type="text" placeholder="Domain id" v-model="domainId"></ion-input>
      </ion-item>
      <div class="content-buttons">
        <ion-button @click="confirmDomainId">Confirm</ion-button>
        <ion-button @click="insertFromQRCode">Scan QR Code</ion-button>
      </div>
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
import { OAuthProvider } from "@/store/models/OAuthProvider";
import {
  BarcodeScanner,
  BarcodeScanResult
} from "@ionic-native/barcode-scanner";

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
        // Check if OAuthProvider is already in memory
        if (this.provider === undefined) {
          // Create/load the OAuthProvider
          console.log('Loading provider')
          this.$store.dispatch('OAuthProvidersModule/loadOAuthProvider', this.domainId)
              .then(() => this.$router.replace(`/authentication/domainId/${this.domainId}/accountId/new`))
              .catch((error: Error) => {
                console.log('Enrollment error')
                this.displayErrorAlert(error.message);
              });
        } else {
          // The requested provider is already in memory, proceed with account authentication
          this.$router.replace(`/authentication/domainId/${this.domainId}/accountId/new`)
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
    provider: function (): OAuthProvider | undefined {
      return this.$store.getters['OAuthProvidersModule/getOAuthProviderFromDomainId'](this.domainId)
    }
  }
});
</script>

<style scoped>
 h3 {
   font-size: 16px;
 }

 .content-buttons {
   align-content: center;
 }
</style>