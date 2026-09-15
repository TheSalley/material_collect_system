/**
 * 用户 Store
 * 管理用户信息、登录态、权限
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { resetRoutes } from "@/utils/";

export const useUserStore = defineStore(
  "user",
  () => {
    // 用户信息
    const user = ref(null);
    const access_token = ref("");
    // 刷新令牌：登录响应若返回 refresh_token 则保存，用于 access_token 过期后静默续期
    const refresh_token = ref("");
    const isLogin = ref(false);

    /** 设置用户信息 */
    function setUser(data) {
      user.value = data;
    }

    /** 清除用户信息（登出） */
    function clearUser() {
      user.value = null;
      access_token.value = "";
      refresh_token.value = "";
      isLogin.value = false;
      // 重置路由
      resetRoutes();
    }

    /** 当前用户是否为管理员 */
    const isAdmin = computed(() => {
      const role = (user?.value?.role ?? "user").toString().toLowerCase();
      return role === "admin";
    });

    return {
      user,
      access_token,
      refresh_token,
      isLogin,
      setUser,
      clearUser,
      isAdmin,
    };
  },
  {
    persist: true,
  }
);
