import { createWebHashHistory, createRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";

// 登录页路由
const loginRoute = {
  path: "/login",
  name: "Login",
  component: () => import("@/views/login/login.vue"),
  meta: {
    hidden: true,
  },
};

// 管理员路由
const adminRoutes = [
  {
    path: "/admin",
    meta: { requiresAuth: true, role: "admin", hidden: true },
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "list",
        name: "AdminList",
        component: () => import("@/views/admin/List.vue"),
        meta: { title: "站点管理", role: "admin" },
      },
      {
        path: "userList",
        name: "UserList",
        component: () => import("@/views/admin/UserList.vue"),
        meta: { title: "用户管理", role: "admin" },
      },
      {
        path: "mediaLibrary",
        name: "AdminMediaLibrary",
        component: () => import("@/views/admin/MediaLibrary.vue"),
        meta: { title: "媒体库", role: "admin" },
      },
      {
        path: "detail",
        name: "AdminDetail",
        component: () => import("@/views/admin/Detail.vue"),
        meta: { title: "详情页", hidden: true, role: "admin" },
      },
      {
        path: "pages/:id",
        name: "AdminPages",
        component: () => import("@/views/customer/Pages.vue"),
        meta: { title: "页面列表", hidden: true, role: "admin" },
      },
    ],
  },
];

// 用户身份路由
const userRoutes = [
  {
    path: "/",
    meta: { requiresAuth: true, role: "user", hidden: true },
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "siteInfo",
        name: "CustomerHome",
        component: () => import("@/views/customer/index.vue"),
        meta: { title: "网站信息", role: "user" },
      },
      {
        path: "pages/:id",
        name: "CustomerPages",
        component: () => import("@/views/customer/Pages.vue"),
        meta: { title: "页面列表", role: "user" },
      },
      {
        path: "productList",
        name: "ProductList",
        component: () => import("@/views/customer/ProductList.vue"),
        meta: { title: "产品列表", role: "user" },
      },
      {
        path: "newsList",
        name: "NewsList",
        component: () => import("@/views/customer/NewsList.vue"),
        meta: { title: "新闻列表", role: "user" },
      },
      {
        path: "productUpload",
        name: "ProductUpload",
        component: () => import("@/views/customer/ProductUpload.vue"),
        meta: { title: "产品上传", role: "user", hidden: true },
      },
      {
        path: "newsUpload",
        name: "NewsUpload",
        component: () => import("@/views/customer/NewsUpload.vue"),
        meta: { title: "新闻上传", role: "user", hidden: true },
      },
    ],
  },
];

// 404 路由
const notFoundRoute = {
  path: "/:pathMatch(.*)*",
  name: "NotFound",
  component: () => import("@/views/404.vue"),
  meta: { hidden: true },
};

// 创建路由，预先注册所有路由
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    loginRoute,
    ...adminRoutes,
    ...userRoutes,
    notFoundRoute,
  ],
});

// 路由守卫：只做权限检查和跳转
router.beforeEach((to, from, next) => {
  const globalStore = useGlobalStore();
  const { user, access_token } = globalStore;
  
  // /login 路径永远放行
  if (to.path === "/login") {
    next();
    return;
  }

  // 未登录访问需要认证的路由 → 去登录
  if (!access_token) {
    if (to.meta.requiresAuth) {
      next("/login");
      return;
    }
    next();
    return;
  }

  // 已登录用户：检查路由权限
  if (access_token && user) {
    const role = (user?.role ?? "user").toString().toLowerCase();
    const routeRole = to.meta?.role;
    
    // 检查路由是否需要特定角色
    if (routeRole) {
      const isAdmin = role === "admin";
      const isUser = role === "user";
      
      // 管理员路由，但用户不是管理员
      if (routeRole === "admin" && !isAdmin) {
        next("/login");
        return;
      }
      
      // 用户路由，但用户是管理员（管理员可以访问用户路由）
      if (routeRole === "user" && !isUser && !isAdmin) {
        next("/login");
        return;
      }
    }

      // 已登录访问根路径 → 根据角色跳转
    if (to.path === "/" || to.path === "") {
      if (role === "admin") {
        next({ path: "/admin/list", replace: true });
        return;
      } else {
        next({ path: "/siteInfo", replace: true });
        return;
      }
    }

    // 处理 /pages/:id 路径，根据角色重定向
    if (to.path.startsWith("/pages/") && !to.path.startsWith("/admin/pages/")) {
      if (role === "admin") {
        const pageId = to.path.replace("/pages/", "");
        next({ path: `/admin/pages/${pageId}`, replace: true });
        return;
      }
    }
  }

  next();
});

export default router;
export { adminRoutes, userRoutes, loginRoute, notFoundRoute };