<template>
  <ion-page>
    <ion-menu side="start" menu-id="features" content-id="content">
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons>
            <ion-menu-button slot="start"></ion-menu-button>
            <ion-title size="medium">Menu</ion-title>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content id="menu-content">
        <ion-list>
          <ion-item button @click="toEnrollment">
            <ion-label>Enroll device</ion-label>
          </ion-item>
          <ion-item button @click="toRemoval">
            <ion-label>Remove device</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons>
          <ion-menu-button slot="start" menu="features"></ion-menu-button>
          <ion-title size="medium">MFA App</ion-title>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" id="content">
<!--      <ion-header collapse="condense">-->
<!--        <ion-toolbar>-->
<!--          <ion-buttons>-->
<!--            <ion-menu-button slot="start" menu="features"></ion-menu-button>-->
<!--          </ion-buttons>-->
<!--          <ion-title>MFA App</ion-title>-->
<!--        </ion-toolbar>-->
<!--      </ion-header>-->
      <AccountsList></AccountsList>
<!--      <ion-list>-->
<!--        <ion-list-header>Linked accounts</ion-list-header>-->
<!--        <ion-item v-for="account in accounts" v-bind:key="account.id">-->
<!--          <ion-label>-->
<!--            <h3>User: {{ account.username }}</h3>-->
<!--            <h4>Host: {{ account.provider.name }}</h4>-->
<!--          </ion-label>-->
<!--        </ion-item>-->
<!--      </ion-list>-->
    </ion-content>

  </ion-page>
</template>

<script lang="ts">
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonMenu,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  menuController,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { Account } from "@/store/models/Account";
import AccountsList from "@/views/AccountsList.vue";

export default defineComponent({
  name: 'Home',
  components: {
    AccountsList,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonList,
    IonLabel,
    IonItem,
    IonMenu,
    IonMenuButton,
  },
  methods: {
    toEnrollment: function () {
      menuController.close('features')
      this.$router.push('/enrollment')
    },
    toRemoval: function () {
      menuController.close('features')
      this.$router.push('/removal')
    }
  },
  computed: {
    accounts: function (): Account[] {
      return this.$store.state.accountsModule.accounts;
    }
  },
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