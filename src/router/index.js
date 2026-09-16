import { createRouter, createWebHashHistory } from "vue-router";
import { ElMessage } from "element-plus";
import { useGlobalStore } from "@/stores/global";
import adminRoutes from "./adminRoutes";
import customerRoutes from "./customerRoutes";
import { isWhitelistRoute } from "./whitelist";

/**
 * 登录页（白名单路由，无需登录即可访问）
 */
const loginRoute = {
  path: "/login",
  name: "Login",
  component: () => import("@/views/login/login.vue"),
  meta: {
    hidden: true,
  },
};

/**
 * 404 页（白名单路由）
 */
const notFoundRoute = {
  path: "/:pathMatch(.*)*",
  name: "NotFound",
  component: () => import("@/views/404.vue"),
  meta: { hidden: true },
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [loginRoute, ...adminRoutes, ...customerRoutes, notFoundRoute],
});

/**
 * 全局路由守卫
 *
 * 执行顺序：
 * 1. 已登录用户访问 /login → 重定向到对应首页
 * 2. 白名单路由（/login、404、meta.public）→ 直接放行
 * 3. 未登录 → 跳登录（带 redirect 参数，登录后回跳）
 * 4. 角色权限校验：admin 路由仅 admin 可访问；user 路由 admin 也可访问
 * 5. 放行
 */
router.beforeEach((to, from, next) => {
  const globalStore = useGlobalStore();
  const { user, access_token } = globalStore;
  const userRole = (user?.role || "user").toString().toLowerCase();
  const isLoggedIn = !!access_token;

  // 1. 已登录用户访问登录页 → 重定向到对应首页
  if (to.path === "/login" && isLoggedIn) {
    next(userRole === "admin" ? "/admin/dashboard" : "/instruction");
    return;
  }

  // 2. 白名单路由：不需要登录即可访问
  if (isWhitelistRoute(to)) {
    next();
    return;
  }

  // 3. 未登录 → 跳登录（带 redirect 参数，登录后回跳原页面）
  if (!isLoggedIn) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  // 4. 角色权限校验
  const routeRole = to.meta.role;

  // admin 路由：仅 admin 可访问
  if (routeRole === "admin" && userRole !== "admin") {
    ElMessage.warning("您没有权限访问该页面");
    next("/instruction");
    return;
  }

  // user 路由：user 和 admin 都可访问（admin 权限更高，不拦截）

  // 5. 放行
  next();
});

export default router;
export { adminRoutes, customerRoutes, loginRoute, notFoundRoute };
