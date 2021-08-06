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
        <ion-button @click="$router.replace('/home')">Return home</ion-button>
        <h3 v-if="error">An error occurred, please try again later</h3>
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
import {
  InAppBrowser,
  InAppBrowserEvent, InAppBrowserObject
} from "@ionic-native/in-app-browser";
import { defineComponent } from 'vue';
import { OAuthProvider } from "@/store/models/OAuthProvider";
import { Account } from "@/store/models/Account";
import { Token } from "@/store/models/Token";

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
  props: {
    test: {
      type: String,
      default: ''
    }
  },
  data () {
    return ({
      accountId: '',
      browser: null as InAppBrowserObject | null,
      });
  },
  methods: {
    initProvider: async function (): Promise<OAuthProvider> {
      return await this.$store.dispatch('OAuthProvidersModule/loadOAuthProvider', this.domainId)
    },
    authenticate: function (event: InAppBrowserEvent) {
      // Close browser if url includes the redirect url (code returned from authorization request)
      if (event.url.includes(this.redirectUri)) {
        this.browser?.close();
        this.browser = null
        // The in app browser url contains the redirect url (authentication finished with success/failure depending on the url parameters)
        // Split the url and pass the second substring (query parameters)
        const parameters = new URLSearchParams(event.url.split('?')[1])
        // Check if authentication is successful
        if (parameters.has('code') && parameters.has('state')) {
          // Authentication successful, check state's validity
          if (!this.provider?.validState(parameters.get('state') || '')) {
            console.log('Invalid state');
            // Request wasn't made by application, return to home page
            this.$router.replace('/home');
          }
          this.provider?.requestToken(parameters.get('code') || '')
              .then((token) => {
                console.log('DomainId: ' + this.domainId)
                console.log('Token: ' + token)
                console.log('Provider: ' + this.provider)
                if (this.account !== undefined) {
                  this.authenticateExistingAccount(token)
                } else {
                  this.authenticateNewAccount(token)
                }
              })
        } else {
          console.log('Error response');
          this.$router.replace('/home');
        }
      }
      // else no redirect Uri in url
    },
    authenticateNewAccount: function (token: Token) {
      this.provider?.getUserData(token).then((userData) => {
        if (this.$store.getters['accountsModule/isAccountAlreadyLinked'](userData.id)) {
          console.log('Account already linked')
          this.$store.getters['accountsModule/getAccountFromAccountId'](userData.id).updateToken(token)
              .then(() => this.$router.replace('/home'))
        } else {
          this.$store.dispatch(
            'accountsModule/addAccount',
            {
              provider: this.provider,
              token: token,
              id: userData.id,
              username: userData.username
            })
            .then((account: Account) => {
              console.log('Account info:',account.toString())
              this.accountId = account.id
            })
            .then(() => {
              console.log('Id account:',this.accountId);
              console.log('Account:',this.account);
              console.log('Account creato')
              console.log('Redirect to be save')
              this.$router.replace(`/enrollment/account/${this.accountId}/device`);
            })
            .catch((error: Error) => console.log('Errore autenticazione: ' + error))
        }
      })
    },
    authenticateExistingAccount: function (token: Token) {
      this.account.updateToken(token)
          .then(() => this.$router.back())
    },
    openBrowser: function () {
      if (this.provider !== undefined) {
        // Open browser and redirects to the authorization request's url
        console.log(this.provider?.authorizationRequestURL());
        this.browser = InAppBrowser.create(
            this.provider?.authorizationRequestURL() || this.redirectUri,
            '_blank',
            {
              location: 'no',
              clearcache: 'yes',
              clearsessioncache: 'yes',
              cleardata: 'yes',
            });

        this.browser?.on("loadstart").subscribe((event: InAppBrowserEvent) => this.authenticate(event))
      }
    },
  },
  computed: {
    domainId: function (): string {
      const {domainId} = this.$route.params;
      return domainId.toString();
    },
    provider: function (): OAuthProvider | undefined {
      return this.$store.getters['OAuthProvidersModule/getOAuthProviderFromDomainId'](this.domainId);
    },
    account: function (): Account {
      return this.$store.getters['accountsModule/getAccountFromAccountId'](this.accountId);
    },
    redirectUri: function (): string {
      return this.$store.state.OAuthProvidersModule.redirectUri;
    }
  },
  mounted() {
    console.log('Route:')
    console.log(this.$route)
    console.log('Prop test:', this.test)
    this.accountId = (this.$route.params.accountId === 'new' ? '' : this.$route.params.accountId as string)
    console.log('AccountId:',this.accountId)
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
