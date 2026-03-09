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
      websiteInfo.value = null;
      sites.value = [];
      sitePageList.value = [];
      
      // 重置路由
      resetRoutes();
    }

    const websiteInfo = ref(null);
    /** 当前用户关联的站点列表（登录接口返回的 sites） */
    const sites = ref([]);
    /** 当前站点的页面列表（用户身份登录后拉取，用于侧栏「页面列表」） */
    const sitePageList = ref([]);
    
    function setWebsiteInfo(data) {
      websiteInfo.value = data;
    }

    function setUser(data) {
      user.value = data;
    }

    return { user, access_token, isLogin, clearUser, websiteInfo, setWebsiteInfo, setUser, sites, sitePageList };
  },
  { 
    persist: true
  }
);