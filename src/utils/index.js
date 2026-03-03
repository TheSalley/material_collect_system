import router from "@/router";
import { adminRoutes, userRoutes, publicRoutes, notFoundRoute } from "@/router";
import { nextTick } from "vue";

// 根据角色动态添加对应的路由（最后再添加 404，保证 "/" 先被角色路由匹配）
export function addProtectedRoutes(role) {
  return new Promise(async (resolve) => {
    let routesToAdd = [];
    const r = (role || "user").toString().toLowerCase();

    if (r === "admin" || r === "administrator") {
      routesToAdd = adminRoutes;
    } else if (r === "customer" || r === "user") {
      routesToAdd = userRoutes;
    }
    
    // 添加路由
    routesToAdd.forEach((route) => {
      router.addRoute(route);
    });
    router.addRoute(notFoundRoute);
    
    // 等待多个 tick，确保路由完全添加完成并可以被匹配
    await nextTick();
    await nextTick();
    
    // 验证路由是否添加成功，最多重试3次
    let retryCount = 0;
    let routeAdded = false;
    
    while (retryCount < 3 && !routeAdded) {
      const routes = router.getRoutes();
      // admin 使用 /admin，user 使用 /
      const rootRoutePath = (r === "admin" || r === "administrator") ? "/admin" : "/";
      const rootRoute = routes.find(route => route.path === rootRoutePath && route.meta?.requiresAuth);
      
      if (rootRoute) {
        // 验证子路由是否存在
        const hasChildRoute = rootRoute.children?.some(child => {
          if (r === "admin" || r === "administrator") {
            return child.path === "list"; // admin 使用 list
          } else {
            return child.path === "siteInfo"; // user 使用 siteInfo
          }
        });
        
        if (hasChildRoute) {
          routeAdded = true;
        }
      }
      
      if (!routeAdded) {
        retryCount++;
        if (retryCount < 3) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 50));
          await nextTick();
        }
      }
    }
    
    if (!routeAdded) {
      console.warn("路由添加验证失败，但继续执行");
    }
    
    resolve();
  });
}

// 重置路由（登出时移除所有动态路由，含 404，只保留 /login）
export function resetRoutes() {
  return new Promise((resolve) => {
    const allRoutes = router.getRoutes();
    allRoutes.forEach((route) => {
      if (route.name && route.name !== "Login") {
        router.removeRoute(route.name);
      }
    });
    resolve();
  });
}