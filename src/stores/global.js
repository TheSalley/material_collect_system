import { defineStore } from "pinia";
import { ref } from "vue";

export const useGlobalStore = defineStore(
  "global",
  () => {
    // 用户信息
    const user = ref(null);
    const token = ref("");
    const isLogin = ref(false);

    function clearUser() {
      user.value = null;
      token.value = "";
      isLogin.value = false;
    }

    return { user, token, isLogin, clearUser };
  },
  { persist: true }
);
