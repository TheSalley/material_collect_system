import { createWebHashHistory, createRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";
import { addProtectedRoutes } from "@/utils";

const publicRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/login.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/404.vue"),
    meta: {
      hidden: true
    }
  },
];

// adminRoutes 优化
const adminRoutes = [
  {
    path: "/",
    meta: { requiresAuth: true, role: 'administrator' }, // 标记角色
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "list",
        name: "AdminList", // 唯一名称
        component: () => import("@/views/admin/List.vue"),
        meta: { title: "列表页" }
      },
      {
        path: "detail",
        name: "AdminDetail",
        component: () => import("@/views/admin/Detail.vue"),
        meta: { title: "详情页" }
      },
      {
        path: "elementor",
        name: "AdminElementor",
        component: () => import("@/views/elementor/index.vue"),
        meta: { title: "Elementor页" }
      },
    ],
  },
];

// userRoutes 优化
const userRoutes = [
  {
    path: "/",
    name: "Customer",
    meta: { requiresAuth: true, role: 'customer' },
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "list",
        name: "CustomerHome",
        component: () => import("@/views/customer/index.vue"),
        meta: { title: "用户首页" }
      },
      {
        path: "pages",
        name: "CustomerPages",
        component: () => import("@/views/customer/index.vue"),
        meta: { title: "用户页面" }
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: publicRoutes,
});

let isDynamicRoutesAdded = false;

// 路由守卫：检测登录状态
router.beforeEach(async (to, from, next) => {
  const { user, token } = useGlobalStore();

  // 1. 已登录且访问登录页 → 跳对应角色的首页（管理员跳 /list，用户跳 /customer）
  // if (to.path === "/login" && token) {
  //   const homePath = user.role === "administrator" ? "/list" : "/customer";
  //   next(homePath);
  //   return;
  // }

  // 2. 未登录访问受保护路由 → 跳登录页
  if (to.meta.requiresAuth && !token) {
    next("/login");
    return;
  }

  // 3. 已登录但动态路由未添加 → 先添加再重定向
  if (token && !isDynamicRoutesAdded) {
    try {
      await addProtectedRoutes(user.role);
      isDynamicRoutesAdded = true;

      // 关键：如果访问的是根路径（/），自动跳角色首页（避免404）
      const targetPath =
        to.path === "/"
          ? user.role === "administrator"
            ? "/list"
            : "/customer"
          : to.path;
      next({ path: targetPath, replace: true });
      return;
    } catch (err) {
      console.error("添加路由失败：", err);
      next("/login");
      return;
    }
  }

  // 4. 所有其他情况 → 正常放行
  next();
});

export default router;
export { adminRoutes, userRoutes };
