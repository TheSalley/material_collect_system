/**
 * 全局 Store（兼容层）
 *
 * 内部组合 useUserStore 和 useWebsiteStore，保持原有接口不变。
 * 新代码建议直接使用 useUserStore / useWebsiteStore，职责更清晰。
 *
 * 注意：本兼容层不做 persist，数据持久化由子 store 负责（key: "user" / "website"）。
 *
 * 关键实现约束：状态字段必须通过 storeToRefs 暴露。
 * 直接写 userStore.user / userStore.access_token 取到的是 store 实例上的「解包值」，
 * 不是 ref——globalStore.user = xxx 只会写到本 store 的独立副本，
 * 子 store 不会变更、persist 永远不会触发，刷新后登录态即丢失。
 */
import { defineStore, storeToRefs } from "pinia";
import { useUserStore } from "./user";
import { useWebsiteStore } from "./website";

export const useGlobalStore = defineStore("global", () => {
  const userStore = useUserStore();
  const websiteStore = useWebsiteStore();

  // storeToRefs 返回与子 store 共享的 ref：通过 globalStore 读写会直接作用到子 store，
  // 子 store 的 persist 订阅才会被触发
  const { user, access_token, refresh_token, isLogin, isAdmin } =
    storeToRefs(userStore);
  const { websiteInfo, sites, sitePageList } = storeToRefs(websiteStore);

  /**
   * 清除用户信息（登出）
   * 同时清除用户态和站点数据
   */
  function clearUser() {
    userStore.clearUser();
    websiteStore.clearWebsite();
  }

  return {
    // ===== 用户相关（委托给 userStore，保持可写且与子 store 共享） =====
    user,
    access_token,
    refresh_token,
    isLogin,
    isAdmin, // computed，只读
    setUser: userStore.setUser,
    clearUser,

    // ===== 站点相关（委托给 websiteStore） =====
    websiteInfo,
    sites,
    sitePageList,
    setWebsiteInfo: websiteStore.setWebsiteInfo,
  };
});
