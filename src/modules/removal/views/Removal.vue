<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Account removal</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <AccountsList :onClick="selectForRemoval" :list-title="title" :clickable="true"></AccountsList>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { Account } from "@/store/models/Account";
import AccountsList from "@/views/AccountsList.vue";
import Remove from "@/modules/removal/views/Remove.vue";

export default defineComponent({
  name: "Removal",
  data () {
    return{
      title: 'Select the account to remove',
    }
  },
  components: {
    AccountsList,
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
  },
  methods: {
    selectForRemoval: async function (account: Account) {
      console.log('Requested removal')
      console.log('Id:',account.id)
      console.log('Name:',account.username)
      console.log('Provider:',account.provider.name)
      const modal = await modalController.create({
        component: Remove,
        componentProps: {
          account: account
        }
      })

      return modal.present()
    },
  },
  computed: {
    accounts: function (): Account[] {
      return this.$store.state.accountsModule.accounts;
    }
  },
})
</script>

<style scoped>
.subheader {
  padding-left: 1.5em;
}
h2 {
  font-size: 1em;
}
</style>