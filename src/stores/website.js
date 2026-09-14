/**
 * 站点 Store
 * 管理当前站点信息、站点列表、页面列表
 */
import { defineStore } from "pinia";
import { ref } from "vue";

export const useWebsiteStore = defineStore(
  "website",
  () => {
    /** 当前站点信息 */
    const websiteInfo = ref(null);
    /** 当前用户关联的站点列表（登录接口返回的 sites） */
    const sites = ref([]);
    /** 当前站点的页面列表（用户身份登录后拉取，用于侧栏「页面列表」） */
    const sitePageList = ref([]);

    /** 设置当前站点信息 */
    function setWebsiteInfo(data) {
      websiteInfo.value = data;
    }

    /** 清除站点数据（登出时调用） */
    function clearWebsite() {
      websiteInfo.value = null;
      sites.value = [];
      sitePageList.value = [];
    }

    return {
      websiteInfo,
      sites,
      sitePageList,
      setWebsiteInfo,
      clearWebsite,
    };
  },
  {
    persist: true,
  }
);
