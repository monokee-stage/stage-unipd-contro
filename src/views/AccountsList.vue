<template>
  <ion-list>
    <ion-list-header>{{ listTitle }}:</ion-list-header>
    <div v-if="clickable">
      <ion-item button @click="onClick(account)" v-for="account in accounts" v-bind:key="account.id">
        <ion-label>
          <h3>Username: {{ account.username }}</h3>
          <h4>Host: {{ account.provider.name }}</h4>
        </ion-label>
      </ion-item>
    </div>
    <div v-else>
      <ion-item v-for="account in accounts" v-bind:key="account.id">
        <ion-label>
          <h3>Username: {{ account.username }}</h3>
          <h4>Host: {{ account.provider.name }}</h4>
        </ion-label>
      </ion-item>
    </div>
  </ion-list>
</template>

<script lang="ts">
import { Account } from "@/store/models/Account";
import { defineComponent } from "vue";
import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader, IonText
} from "@ionic/vue";

export default defineComponent({
  name: "AccountsList",
  components: {
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
  },
  props: {
    listTitle: {
      type: String,
      default: 'Accounts'
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    onClick: {
      type: Function,
      default: (account: Account) => {
        return
      }
    }
  },
  computed: {
    accounts: function (): Account[] {
      return this.$store.state.accountsModule.accounts;
    }
  },
})
</script>

<style scoped>
</style>