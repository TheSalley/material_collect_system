/**
 * 用户 Store
 * 管理用户信息、登录态、权限
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { resetRoutes } from "@/utils/";
import { normalizeCustomerMenuPermissions } from "@/config/customerMenu";

export const useUserStore = defineStore(
  "user",
  () => {
    // 用户信息
    const user = ref(null);
    const access_token = ref("");
    /** 当前站点下客户可用的功能菜单，null 表示尚未加载 */
    const customerMenuPermissions = ref(null);

    const isLogin = ref(false);

    /** 设置用户信息 */
    function setUser(data) {
      user.value = data;
    }

    /** 清除用户信息（登出） */
    function clearUser() {
      user.value = null;
      access_token.value = "";
      customerMenuPermissions.value = null;

      isLogin.value = false;
      // 重置路由
      resetRoutes();
    }

    /** 设置客户菜单权限 */
    function setCustomerMenuPermissions(permissions) {
      customerMenuPermissions.value = normalizeCustomerMenuPermissions(permissions);
    }

    /** 当前用户是否为管理员 */
    const isAdmin = computed(() => {
      const role = (user?.value?.role ?? "user").toString().toLowerCase();
      return role === "admin";
    });

    return {
      user,
      access_token,
      customerMenuPermissions,

      isLogin,
      setUser,
      clearUser,
      setCustomerMenuPermissions,
      isAdmin,
    };
  },
  {
    persist: true,
  }
);
