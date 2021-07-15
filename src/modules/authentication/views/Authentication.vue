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
        <ion-button @click="$router.push('/home')">Go home</ion-button>
        <ion-button @click="initProvider">Authenticate</ion-button>
        <h3 v-if="error">Si è verificato un errore, riprovare più tardi</h3>
        <InAppBrowser></InAppBrowser>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/vue";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { defineComponent } from 'vue';
import { AuthProvider } from "@/modules/authentication/models/AuthProvider";
import { Account } from "@/modules/authentication/models/Account";
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
    // const { domainId } = useRoute().params;
    return ({
      // domainId: domainId.toString(),
      closed: false,
      accountId: null,
      error: false,
      });
  },
  methods: {
    addUser: function (): void {
      if (this.accountId === null) {
        this.accountId = this.$store.commit('accountsModule/addAccount', this.provider);
      }
    },
    initProvider: function (): void {
      if (this.provider === undefined) {
        // Provider not yet loaded/created
        this.$store.dispatch('authProvidersModule/loadProvider', this.domainId)
            // .then(() => this.openBrowser());
      }
    //  Provider is already in store
    },
    openBrowser: function () {
      // Open browser and redirects to the authorization request's url
      const browser = InAppBrowser.create(this.provider.authorizationRequestURL(), '_self', {location: 'no'});
      browser.on("loadstart").subscribe((event) => {
        // Close browser if url is equal to the redirect url (code returned from authorization request)
        console.log(event.url);
        if (event.url.substr(0, this.$store.state.authProvidersModule.redirectURI) === this.$store.state.authProvidersModule.redirectURI) {
          // The in app browser url is equal to the redirect url (authentication finished with success/failure depending on the url parameters)
          console.log(event.url);
          console.log(this.$store.state.authProvidersModule.redirectURI);
          const parameters = new URLSearchParams(event.url)
          // Check if authentication failed
          if (parameters.has('error')) {
            this.error = true;
          } else {
            // Authentication successful, save code and state for check

            const authResponse = new AuthorizationResponse({
              code: parameters.get('code') || '',
              state: parameters.get('state') || '',
            });
            if (!this.provider.validState(authResponse.state)) {
              // Request wasn't made by application, return to home page
              this.$router.push('/home');
            }
            this.provider.requestToken(authResponse);
            // this.addUser();
            // console.log(this.accountId);
            // console.log(this.account);
            // this.account.requestToken(authResponse);
          }
          browser.close();
          this.$router.push('/home');
          this.closed = true;
        }
      });
      console.log(browser);
    },
  },
  computed: {
    domainId: function (): string {
      const {domainId} = this.$route.params;
      return domainId.toString();
    },
    provider: function (): AuthProvider {
      return this.$store.getters['authProvidersModule/getAuthProviderFromDomainId'](this.domainId);
    },
    account: function (): Account {
      return this.$store.getters['accountsModule/getAccountFromAccountId'](this.accountId);
    }
  },
  mounted() {
    // this.initProvider();
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
