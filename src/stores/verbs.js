// stores/verbs.js
import { defineStore } from 'pinia';
import verbs from '@/assets/data/verbs.json';

export const useVerbsStore = defineStore('verbs', {
  state: () => ({
    allVerbs: verbs,
    commonVerbs: ["be", "have", "do", "say", "go", "get", "make", "take", "come", "see"]
  }),
  // getters: {
  //   preparedVerbs : (state) => (type) => {
  //     return type === 'common' 
  //       ? Object.fromEntries(Object.entries(state.allVerbs).filter(([key]) => state.commonVerbs.includes(key)))
  //       : state.allVerbs;
  //   }
  // }
});