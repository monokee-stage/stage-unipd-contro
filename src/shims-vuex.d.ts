import { ComponentCustomProperties } from 'vue'
import { AppStore } from "@/store";

declare module '@vue/runtime-core' {
  // declare your own store states
  // interface State {
  //   count: number
  // }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: AppStore
  }
}