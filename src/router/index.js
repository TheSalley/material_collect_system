import { createRouter, createWebHashHistory } from "vue-router";
import { useGlobalStore } from "@/stores/global";

const loginRoute = {
  path: "/login",
  name: "Login",
  component: () => import("@/views/login/login.vue"),
  meta: {
    hidden: true,
  },
};

const adminRoutes = [
  {
    path: "/admin",
    meta: { requiresAuth: true, role: "admin", hidden: true },
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/views/admin/Dashboard.vue"),
        meta: { title: "面板", role: "admin" },
      },
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
      {
        path: "demoList",
        name: "AdminDemoList",
        component: () => import("@/views/admin/DemoList.vue"),
        meta: { title: "Demo 截图尺寸", role: "admin" },
      },
    ],
  },
];

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

const notFoundRoute = {
  path: "/:pathMatch(.*)*",
  name: "NotFound",
  component: () => import("@/views/404.vue"),
  meta: { hidden: true },
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [loginRoute, ...adminRoutes, ...userRoutes, notFoundRoute],
});

router.beforeEach((to, from, next) => {
  const globalStore = useGlobalStore();
  const { user, access_token } = globalStore;

  if (to.path === "/login") {
    next();
    return;
  }

  if (!access_token) {
    if (to.meta.requiresAuth) {
      next("/login");
      return;
    }
    next();
    return;
  }

  if (access_token && user) {
    const role = (user?.role ?? "user").toString().toLowerCase();
    const routeRole = to.meta?.role;

    if (routeRole) {
      const isAdmin = role === "admin";
      const isUser = role === "user";

      if (routeRole === "admin" && !isAdmin) {
        next("/login");
        return;
      }

      if (routeRole === "user" && !isUser && !isAdmin) {
        next("/login");
        return;
      }
    }

    if (to.path === "/" || to.path === "") {
      if (role === "admin") {
        next({ path: "/admin/list", replace: true });
        return;
      }

      next({ path: "/siteInfo", replace: true });
      return;
    }

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
