<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Remove account</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <h2>Are you sure to remove the following account?</h2>
    <h3>Username:</h3>
    <h3 class="content">{{ account.username }}</h3>
    <h4>Hostname:</h4>
    <h4 class="content">{{ account.provider.name }}</h4>
    <ion-button @click="confirmRemoval">Confirm</ion-button>
    <ion-button @click="dismiss">Dismiss</ion-button>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Account } from "@/store/models/Account";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { toastController } from "@ionic/core";

export default defineComponent({
  name: "Remove",
  components: {
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  },
  props: {
    account: {
      type: Account
    }
  },
  methods: {
    confirmRemoval: function () {
      console.log('Confirm:', this.account?.id)
      this.$store.dispatch('accountsModule/removeAccount', this.account)
          .then(() => this.dismiss())
          .then(() => this.$router.replace('/home'))
    },
    dismiss: async function () {
      const modal = await modalController.getTop()
      modal?.dismiss()
    },
  }
})
</script>

<style scoped>

h2 {
  font-size: 1.2em;
  padding-left: 20px;
}

h3 {
  font-size: 1em;
  padding-left: 20px;
}

h4 {
  font-size: 1em;
  padding-left: 20px;
}

.content {
  padding-left: 40px;
}
</style>