import { defineStore } from "pinia";
import { ref } from "vue";

export const useGlobalStore = defineStore(
  "global",
  () => {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    function increment() {
      count.value++;
    }

    // 用户信息
    const user = ref({
      username: "",
      token: "",
      isLogin: false,
    });

    return { count, increment, user };
  },
  { persist: true }
);
