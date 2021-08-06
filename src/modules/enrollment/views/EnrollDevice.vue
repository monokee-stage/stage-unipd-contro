<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Enroll device</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
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
  } from "@ionic/vue";
  import { Account } from "@/store/models/Account";

export default defineComponent({
  name: "EnrollDevice",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
  },
  computed: {
    accountId: function(): string {
      const { accountId } = this.$route.params
      return accountId.toString()
    },
    account: function (): Account {
      return this.$store.getters['accountsModule/getAccountFromAccountId'](this.accountId);
    },
  },
  mounted() {
    this.account.saveDevice();
    console.log('Saved')
    this.$router.replace('/home')
  }
});
</script>

<style scoped>

</style>