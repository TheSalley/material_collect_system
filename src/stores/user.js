/**
 * 用户 Store
 * 管理用户信息、登录态、权限
 */
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { resetRoutes } from "@/utils/";
import { normalizeRole } from "@/router/permissions.js";

/**
 * 登录态兜底存储
 *
 * pinia-plugin-persistedstate 在开发环境会随模块热替换重建 store，
 * 重建瞬间有可能把空状态写回 localStorage，表现就是「改完代码就要重新登录」。
 * 这里额外落一份独立 key，store 初始化时优先读它，热更新后也能立刻恢复。
 */
const AUTH_CACHE_KEY = "mcs:auth-session";

function readAuthCache() {
  if (typeof localStorage === "undefined") return { user: null, token: "" };

  // 兼容旧数据：pinia-plugin-persistedstate 把登录态存在 key "user" 下
  try {
    const legacy = localStorage.getItem("user");
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.access_token) {
        return {
          user: parsed.user ?? null,
          token: parsed.access_token,
        };
      }
    }
  } catch {
    // 忽略旧数据解析失败，继续读新 key
  }

  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return { user: null, token: "" };
    const parsed = JSON.parse(raw);
    return {
      user: parsed?.user ?? null,
      token: parsed?.access_token ?? "",
    };
  } catch {
    return { user: null, token: "" };
  }
}

function writeAuthCache(user, token) {
  if (typeof localStorage === "undefined") return;
  try {
    if (!token) {
      localStorage.removeItem(AUTH_CACHE_KEY);
      return;
    }
    localStorage.setItem(
      AUTH_CACHE_KEY,
      JSON.stringify({ user, access_token: token }),
    );
  } catch {
    // 存储不可用（隐私模式/配额满）时忽略，保持内存态可用
  }
}

export const useUserStore = defineStore(
  "user",
  () => {
    const cached = readAuthCache();
    // 用户信息
    const user = ref(cached.user);
    const access_token = ref(cached.token);

    const isLogin = ref(!!cached.token);

    /** 设置用户信息 */
    function setUser(data) {
      user.value = data;
    }

    /** 清除用户信息（登出） */
    function clearUser() {
      user.value = null;
      access_token.value = "";

      isLogin.value = false;
      writeAuthCache(null, "");
      // 重置路由
      resetRoutes();
    }

    watch(
      [user, access_token],
      ([nextUser, nextToken]) => {
        isLogin.value = !!nextToken;
        writeAuthCache(nextUser, nextToken);
      },
      { deep: true, flush: "post" },
    );

    /** 当前用户是否为管理员 */
    const isAdmin = computed(() => {
      return normalizeRole(user?.value?.role) === "admin";
    });

    return {
      user,
      access_token,

      isLogin,
      setUser,
      clearUser,
      isAdmin,
    };
  },
  {
    persist: true,
  },
);
