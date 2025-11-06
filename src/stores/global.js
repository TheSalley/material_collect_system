import { defineStore } from "pinia";

export const useGlobalStore = defineStore(
  "global",
  () => {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    return { count, increment };
  },
  { persist: true }
);
