<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Authentication</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Authentication</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <ion-button @click="$router.replace('/home')">Go home</ion-button>
        <ion-button @click="initProvider">Authenticate</ion-button>
        <ion-button @click="requestToken">Authenticate</ion-button>
        <h3 v-if="error">Si è verificato un errore, riprovare più tardi</h3>
        <InAppBrowser></InAppBrowser>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar } from "@ionic/vue";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { defineComponent } from 'vue';
import { AuthProvider } from "@/store/models/AuthProvider";
import { Account } from "@/store/models/Account";
import { AuthorizationResponse } from "@openid/appauth";

export default defineComponent({
  name: "Authentication",
  components: {
    IonButton,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    InAppBrowser
  },
  data () {
    return ({
      closed: false,
      accountId: null,
      error: false,
      });
  },
  methods: {
    // addUser: function (): void {
    //   if (this.accountId === null) {
    //     this.accountId = this.$store.commit('accountsModule/addAccount', this.provider);
    //   }
    // },
    initProvider: async function (): Promise<AuthProvider> {
      return await this.$store.dispatch('authProvidersModule/loadProvider', this.domainId)
    },
    openBrowser: function () {
      if (this.provider !== undefined) {
        // Open browser and redirects to the authorization request's url
        console.log(this.provider?.authorizationRequestURL());
        const browser = InAppBrowser.create(this.provider?.authorizationRequestURL() || this.redirectURI, '_self', {location: 'no'});
        browser.on("loadstart").subscribe((event) => {
          // Close browser if url is equal to the redirect url (code returned from authorization request)
          if (event.url.includes(this.redirectURI)) {
            // The in app browser url contains the redirect url (authentication finished with success/failure depending on the url parameters)
            // Split the url and pass the second substring (query parameters)
            const parameters = new URLSearchParams(event.url.split('?')[1])
            // Check if authentication is successful
            if (parameters.has('code') && parameters.has('state')) {
              // Authentication successful, save code and state for check
              const authResponse = new AuthorizationResponse({
                code: parameters.get('code') || '',
                state: parameters.get('state') || '',
              });
              console.log('Authorization Response: '+authResponse.toJson().toString());
              if (!this.provider?.validState(authResponse.state)) {
                console.log('Invalid state');
                // Request wasn't made by application, return to home page
                // this.$router
                this.$router.replace('/home');
              }
              this.provider?.requestToken(authResponse);
              // this.addUser();
              // console.log(this.accountId);
              // console.log(this.account);
              // this.account.requestToken(authResponse);
            } else {
              this.error = true;
              console.log('Error response');
              for (const p of parameters) {
                console.log('Parametro ',p);
              }
            }
            browser.close();
            this.$router.replace('/home');
            this.closed = true;
          } else {
            console.log('Not redirect')
          }
        });
        console.log(browser);
      }
    },
    // requestToken: function () {
    //   this.provider?.requestToken(new AuthorizationResponse({
    //     code: '',
    //     state: '',
    //   }));
    // }
  },
  computed: {
    domainId: function (): string {
      const {domainId} = this.$route.params;
      return domainId.toString();
    },
    provider: function (): AuthProvider | undefined {
      return this.$store.getters['authProvidersModule/getAuthProviderFromDomainId'](this.domainId);
    },
    account: function (): Account {
      return this.$store.getters['accountsModule/getAccountFromAccountId'](this.accountId);
    },
    redirectURI: function (): string {
      return this.$store.state.authProvidersModule.redirectURI;
    }
  },
  mounted() {
    if (this.provider === undefined) {
      this.initProvider()
          .then(() => this.openBrowser());
      // .then(() => this.provider?.requestToken(new AuthorizationResponse({
      // })));
    } else {
      this.openBrowser();
    }
  }
});
</script>

<style scoped>
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
