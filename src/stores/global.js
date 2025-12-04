import { defineStore } from "pinia";
import { ref } from "vue";
import { resetRoutes } from "@/utils/"

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
      resetRoutes();
    }

    const websiteInfo = ref(null);
    
    function setWebsiteInfo(data) {
      websiteInfo.value = data;
    }

    return { user, token, isLogin, clearUser, websiteInfo, setWebsiteInfo };
  },
  { persist: true }
);
