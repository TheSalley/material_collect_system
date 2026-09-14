/**
 * 全局 Store（兼容层）
 *
 * 内部组合 useUserStore 和 useWebsiteStore，保持原有接口不变。
 * 新代码建议直接使用 useUserStore / useWebsiteStore，职责更清晰。
 *
 * 注意：本兼容层不做 persist，数据持久化由子 store 负责（key: "user" / "website"）。
 * 升级后首次访问需要重新登录（旧的 "global" 持久化 key 不再使用）。
 */
import { defineStore } from "pinia";
import { useUserStore } from "./user";
import { useWebsiteStore } from "./website";

export const useGlobalStore = defineStore("global", () => {
  const userStore = useUserStore();
  const websiteStore = useWebsiteStore();

  /**
   * 清除用户信息（登出）
   * 同时清除用户态和站点数据
   */
  function clearUser() {
    userStore.clearUser();
    websiteStore.clearWebsite();
  }

  return {
    // ===== 用户相关（委托给 userStore，直接返回 ref 保持可写） =====
    user: userStore.user,
    access_token: userStore.access_token,
    isLogin: userStore.isLogin,
    isAdmin: userStore.isAdmin, // computed，只读
    setUser: userStore.setUser,
    clearUser,

    // ===== 站点相关（委托给 websiteStore） =====
    websiteInfo: websiteStore.websiteInfo,
    sites: websiteStore.sites,
    sitePageList: websiteStore.sitePageList,
    setWebsiteInfo: websiteStore.setWebsiteInfo,
  };
});
