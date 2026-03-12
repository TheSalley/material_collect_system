import { createWebHashHistory, createRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";
import { addProtectedRoutes } from "@/utils";
import { nextTick } from "vue";

const publicRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/login.vue"),
    meta: {
      hidden: true,
    },
  },
];

// 404 单独定义，在动态添加角色路由之后再注册，避免匹配到 "/"
const notFoundRoute = {
  path: "/:pathMatch(.*)*",
  name: "NotFound",
  component: () => import("@/views/404.vue"),
  meta: { hidden: true },
};

// adminRoutes 优化
const adminRoutes = [
  {
    path: "/admin",
    meta: { requiresAuth: true, role: "administrator", hidden: true },
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "list",
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
        meta: { title: "页面列表", hidden: true },
      },
    ],
  },
];

// 用户身份路由（role 为 user 或 customer 时使用）
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
        meta: { title: "网站信息" },
      },
      {
        path: "pages/:id",
        name: "CustomerPages",
        component: () => import("@/views/customer/Pages.vue"),
        meta: { title: "页面列表" },
      },
      {
        path: "productUpload",
        name: "ProductUpload",
        component: () => import("@/views/customer/ProductUpload.vue"),
        meta: { title: "产品上传" },
      },
      {
        path: "newsUpload",
        name: "NewsUpload",
        component: () => import("@/views/customer/NewsUpload.vue"),
        meta: { title: "新闻上传" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...publicRoutes],
});

let isDynamicRoutesAdded = false;
let isAddingRoutes = false;

// 路由守卫：检测登录状态
router.beforeEach(async (to, from, next) => {
  const globalStore = useGlobalStore();
  const { user, access_token } = globalStore;
  
  // /login 路径永远放行（无论是否登录，都允许访问）
  if (to.path === "/login") {
    next();
    return;
  }
  
  // 重置动态路由添加状态，确保登出后重新登录可以正确添加路由
  if (!access_token) {
    isDynamicRoutesAdded = false;
    isAddingRoutes = false;
  }

  // 未登录访问非登录页 → 去登录
  if (!access_token) {
    next("/login");
    return;
  }

  // 已登录用户：确保路由已添加
  if (access_token && user) {
    const routes = router.getRoutes();
    const hasProtectedRoute = routes.some(r => 
      (r.path === "/admin" || r.path === "/" || r.path === "") && r.meta?.requiresAuth
    );
    
    if (!hasProtectedRoute && !isAddingRoutes) {
      isAddingRoutes = true;
      try {
        const role = (user?.role ?? "user").toString().toLowerCase();
        await addProtectedRoutes(role);
        isDynamicRoutesAdded = true;
        
        // 等待路由完全就绪
        await nextTick();
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 验证当前路由是否可以匹配
        let canMatch = false;
        try {
          const resolved = router.resolve(to.path);
          if (resolved.name && resolved.name !== "NotFound") {
            canMatch = true;
          }
        } catch (err) {
          // 路由无法匹配
        }
        
        isAddingRoutes = false;
        
        // 如果路由可以匹配，继续
        if (canMatch) {
          // 如果访问的是根路径，需要跳转
          if (to.path === "/" || to.path === "") {
            const targetPath = role === "admin" || role === "administrator" ? "/admin/list" : "/siteInfo";
            next({ path: targetPath, replace: true });
            return;
          }
          next();
          return;
        }
      } catch (err) {
        console.error("添加路由失败:", err);
        isAddingRoutes = false;
        next("/login");
        return;
      }
    } else {
      isDynamicRoutesAdded = true;
    }
  }

  // 检查当前访问的路由是否需要认证
  if (to.meta.requiresAuth && !access_token) {
    next("/login");
    return;
  }

  // 已登录访问根路径 → 根据角色跳转
  if (access_token && (to.path === "/" || to.path === "")) {
    const role = (user?.role ?? "user").toString().toLowerCase();
    if (role === "admin" || role === "administrator") {
      next({ path: "/admin/list", replace: true });
      return;
    } else {
      next({ path: "/siteInfo", replace: true });
      return;
    }
  }

  // 处理已登录用户访问 /pages/:id 的情况
  if (access_token && to.path.startsWith("/pages/")) {
    const role = (user?.role ?? "user").toString().toLowerCase();
    if (role === "admin" || role === "administrator") {
      const pageId = to.path.replace("/pages/", "");
      next({ path: `/admin/pages/${pageId}`, replace: true });
      return;
    }
  }

  next();
});

export default router;
export { adminRoutes, userRoutes, publicRoutes, notFoundRoute };