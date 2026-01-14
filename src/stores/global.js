import { defineStore } from "pinia";
import { ref } from "vue";
import { resetRoutes } from "@/utils/"

export const useGlobalStore = defineStore(
  "global",
  () => {
    // 用户信息
    const user = ref(null);
    const access_token = ref("");
    const isLogin = ref(false);

    function clearUser() {
      user.value = null;
      access_token.value = "";
      isLogin.value = false;
    }

    const websiteInfo = ref(null);
    
    function setWebsiteInfo(data) {
      websiteInfo.value = data;
    }

    function setUser(data) {
      user.value = data;
    }

    return { user, access_token, isLogin, clearUser, websiteInfo, setWebsiteInfo, setUser };
  },
  { 
    persist: true
  }
);