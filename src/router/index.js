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
    // 检查路由是否已添加（根路径可能是 '' 或 '/'）
    const routes = router.getRoutes();
    const hasProtectedRoute = routes.some(r => 
      (r.path === "/admin" || r.path === "/" || r.path === "") && r.meta?.requiresAuth
    );
    
    if (!hasProtectedRoute) {
      // 路由未添加，先添加路由
      try {
        await addProtectedRoutes(role);
        isDynamicRoutesAdded = true;
        // 等待路由完全添加完成
        await nextTick();
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error("添加路由失败:", err);
      }
    }
    
    // 根据角色跳转（路由已添加，使用路由名称更安全）
    // 先验证路由是否可以解析
    const targetRouteName = role === "admin" || role === "administrator" ? "AdminList" : "CustomerHome";
    let canResolve = false;
    let retryCount = 0;
    
    while (retryCount < 3 && !canResolve) {
      try {
        const resolved = router.resolve({ name: targetRouteName });
        if (resolved.name && resolved.name !== "NotFound") {
          canResolve = true;
        }
      } catch (err) {
        // 解析失败，继续重试
      }
      
      if (!canResolve) {
        retryCount++;
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 50));
          await nextTick();
        }
      }
    }
    
    if (canResolve) {
      next({ name: targetRouteName, replace: true });
    } else {
      // 如果仍然无法解析，再次等待并重试一次
      await new Promise(resolve => setTimeout(resolve, 100));
      await nextTick();
      
      // 最后尝试解析路由
      try {
        const finalResolved = router.resolve({ name: targetRouteName });
        if (finalResolved.name && finalResolved.name !== "NotFound") {
          next({ name: targetRouteName, replace: true });
          return;
        }
      } catch (err) {
        // 解析失败
      }
      
      // 如果仍然无法解析，使用路径跳转（路由应该已经添加）
      if (role === "admin" || role === "administrator") {
        next({ path: "/admin/list", replace: true });
      } else {
        next({ path: "/siteInfo", replace: true });
      }
    }
    return;
  }

  // 已登录但动态路由未添加 → 先添加再重定向（addProtectedRoutes 内部已做幂等，重复调用不会重复添加）
  const routes = router.getRoutes();
  const hasProtectedRoute = routes.some(r => 
    (r.path === "/admin" || r.path === "/" || r.path === "") && r.meta?.requiresAuth
  );
  if (access_token && (!isDynamicRoutesAdded || !hasProtectedRoute)) {
    try {
      const role = (user?.role ?? "user").toString().toLowerCase();
      await addProtectedRoutes(role);
      isDynamicRoutesAdded = true;

      // 等待路由完全添加完成
      await nextTick();
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 根据角色确定目标路径或名称
      let targetPath = to.path;
      let targetName = null;
      
      // 如果访问根路径，根据角色跳转
      if (to.path === "/") {
        // 验证当前角色是否有权限访问根路径
        if (role !== "admin" && role !== "administrator") {
          // user 角色不能访问根路径，跳转到 siteInfo
          targetName = "CustomerHome";
        } else {
          // admin 访问根路径，跳转到 admin 列表页
          targetName = "AdminList";
        }
      } else if (to.path === "/siteInfo" || to.path === "/admin") {
        // 如果访问 /siteInfo 或 /admin，根据角色跳转
        if (role === "admin" || role === "administrator") {
          // admin 访问 /siteInfo 或 /admin，重定向到 admin 列表页
          targetName = "AdminList";
        } else {
          // user 访问 /siteInfo，使用路由名称跳转
          targetName = "CustomerHome";
        }
      } else if (to.path.startsWith("/pages/")) {
        // 如果访问 /pages/:id，根据角色跳转
        if (role === "admin" || role === "administrator") {
          // admin 访问 /pages/:id，重定向到 /admin/pages/:id
          const pageId = to.path.replace("/pages/", "");
          targetPath = `/admin/pages/${pageId}`;
        } else {
          // user 访问 /pages/:id，保持原路径
          targetPath = to.path;
        }
      }
      
      // 路由已添加，优先使用路由名称跳转更安全
      // 先验证路由是否可以解析
      if (targetName) {
        let canResolve = false;
        let retryCount = 0;
        
        while (retryCount < 3 && !canResolve) {
          try {
            const resolved = router.resolve({ name: targetName });
            if (resolved.name && resolved.name !== "NotFound") {
              canResolve = true;
            }
          } catch (err) {
            // 解析失败，继续重试
          }
          
          if (!canResolve) {
            retryCount++;
            if (retryCount < 3) {
              await new Promise(resolve => setTimeout(resolve, 50));
              await nextTick();
            }
          }
        }
        
        if (canResolve) {
          next({ name: targetName, replace: true });
        } else {
          // 如果无法解析，再次等待并重试一次
          await new Promise(resolve => setTimeout(resolve, 100));
          await nextTick();
          
          // 最后尝试解析路由
          try {
            const finalResolved = router.resolve({ name: targetName });
            if (finalResolved.name && finalResolved.name !== "NotFound") {
              next({ name: targetName, replace: true });
              return;
            }
          } catch (err) {
            // 解析失败
          }
          
          // 如果仍然无法解析，使用路径跳转
          if (targetName === "AdminList") {
            next({ path: "/admin/list", replace: true });
          } else {
            next({ path: "/siteInfo", replace: true });
          }
        }
      } else {
        next({ path: targetPath, replace: true });
      }
      return;
    } catch (err) {
      console.error("添加路由失败:", err);
      next("/login");
      return;
    }
  }

  // 处理已登录用户访问 /pages/:id 的情况
  if (access_token && to.path.startsWith("/pages/")) {
    const role = (user?.role ?? "user").toString().toLowerCase();
    if (role === "admin" || role === "administrator") {
      // admin 访问 /pages/:id，重定向到 /admin/pages/:id
      const pageId = to.path.replace("/pages/", "");
      next({ path: `/admin/pages/${pageId}`, replace: true });
      return;
    }
  }

  next();
});

export default router;
export { adminRoutes, userRoutes, publicRoutes, notFoundRoute };