import { createWebHashHistory, createRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";
import { addProtectedRoutes } from "@/utils";

const publicRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/login.vue"),
    meta: {
      hidden: true,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/404.vue"),
    meta: {
      hidden: true,
    },
  },
];

// adminRoutes 优化
const adminRoutes = [
  {
    path: "/",
    meta: { requiresAuth: true, role: "administrator", hidden: true },
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "",
        name: "AdminList",
        component: () => import("@/views/admin/List.vue"),
        meta: { title: "站点管理" },
      },
      {
        path: "userList",
        name: "UserList",
        component: () => import("@/views/admin/UserList.vue"),
        meta: { title: "用户管理" },
      },
      {
        path: "detail",
        name: "AdminDetail",
        component: () => import("@/views/admin/Detail.vue"),
        meta: { title: "详情页", hidden: true },
      },
      {
        path: "pages/:id",
        name: "CustomerPages",
        component: () => import("@/views/customer/Pages.vue"),
        meta: { title: "页面列表" },
      },
    ],
  },
];

// userRoutes 优化
const userRoutes = [
  {
    path: "/",
    meta: { requiresAuth: true, role: "customer", hidden: true },
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "",
        name: "CustomerHome",
        component: () => import("@/views/customer/index.vue"),
        meta: { title: "网站信息" },
      },
      {
        path: "pages/:id",
        name: "CustomerPages",
        component: () => import("@/views/customer/Pages.vue"),
        meta: { title: "页面列表" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...publicRoutes],
});

let isDynamicRoutesAdded = false;

// 路由守卫：检测登录状态
router.beforeEach(async (to, from, next) => {
  const globalStore = useGlobalStore();
  const { user, access_token } = globalStore;
  
  // 重置动态路由添加状态，确保登出后重新登录可以正确添加路由
  if (!access_token) {
    isDynamicRoutesAdded = false;
  }

  // 检查当前访问的路由是否需要认证
  if (to.meta.requiresAuth && !access_token) {
    next("/login");
    return;
  }

  // 3. 已登录但动态路由未添加 → 先添加再重定向
  if (access_token && !isDynamicRoutesAdded) {
    try {
      await addProtectedRoutes(user.role);
      isDynamicRoutesAdded = true;

      next({ path: to.path, replace: true });
      return;
    } catch (err) {
      next("/login");
      return;
    }
  }

  // 特殊处理：如果访问根路径且未登录，重定向到登录页
  if (to.path === "/" && !access_token) {
    next("/login");
    return;
  }
  next();
});

export default router;
export { adminRoutes, userRoutes, publicRoutes };