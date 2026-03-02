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

  // 未登录访问登录页 → 直接通过
  if (!access_token && to.path === "/login") {
    next();
    return;
  }

  // 未登录访问非登录页 → 去登录
  if (!access_token && to.path !== "/login") {
    next("/login");
    return;
  }

  // 已登录访问登录页 → 根据角色跳转
  if (access_token && to.path === "/login") {
    const role = (user?.role ?? "user").toString().toLowerCase();
    // 检查路由是否已添加
    const routes = router.getRoutes();
    const hasProtectedRoute = routes.some(r => r.path === "/" && r.meta?.requiresAuth);
    
    if (!hasProtectedRoute) {
      // 路由未添加，先添加路由
      try {
        await addProtectedRoutes(role);
        isDynamicRoutesAdded = true;
        await nextTick();
        await nextTick();
      } catch (err) {
        console.error("添加路由失败:", err);
      }
    }
    
    // 根据角色跳转
    if (role === "admin" || role === "administrator") {
      next({ path: "/", replace: true });
    } else {
      next({ path: "/siteInfo", replace: true });
    }
    return;
  }

  // 已登录但动态路由未添加 → 先添加再重定向
  // 检查路由是否已添加（通过检查是否存在受保护的路由）
  const routes = router.getRoutes();
  const hasProtectedRoute = routes.some(r => r.path === "/" && r.meta?.requiresAuth);
  
  if (access_token && (!isDynamicRoutesAdded || !hasProtectedRoute)) {
    try {
      const role = (user?.role ?? "user").toString().toLowerCase();
      await addProtectedRoutes(role);
      isDynamicRoutesAdded = true;

      // 等待路由完全添加完成
      await nextTick();
      await nextTick();
      
      // 根据角色确定目标路径
      let targetPath = to.path;
      
      // 如果访问根路径，根据角色跳转
      if (to.path === "/") {
        // 验证当前角色是否有权限访问根路径
        if (role !== "admin" && role !== "administrator") {
          // user 角色不能访问根路径，跳转到 siteInfo
          targetPath = "/siteInfo";
        }
      }
      
      // 再次等待，确保路由表已更新
      await nextTick();
      
      // 验证路由是否可以解析，最多重试3次
      let retryCount = 0;
      let canResolve = false;
      
      while (retryCount < 3 && !canResolve) {
        try {
          const resolved = router.resolve(targetPath);
          if (resolved.name && resolved.name !== "NotFound") {
            canResolve = true;
            // 路由存在，导航
            next({ path: targetPath, replace: true });
            return;
          }
        } catch (err) {
          // 解析失败，继续重试
        }
        
        if (!canResolve) {
          retryCount++;
          if (retryCount < 3) {
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      }
      
      // 如果仍然无法解析，根据角色跳转（路由应该已经添加，直接导航）
      if (role === "admin" || role === "administrator") {
        next({ path: "/", replace: true });
      } else {
        next({ path: "/siteInfo", replace: true });
      }
      return;
    } catch (err) {
      console.error("添加路由失败:", err);
      next("/login");
      return;
    }
  }

  next();
});

export default router;
export { adminRoutes, userRoutes, publicRoutes, notFoundRoute };