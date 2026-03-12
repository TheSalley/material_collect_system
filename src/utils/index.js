import router from "@/router";
import { adminRoutes, userRoutes, publicRoutes, notFoundRoute } from "@/router";
import { nextTick } from "vue";

// 根据角色动态添加对应的路由（最后再添加 404，保证 "/" 先被角色路由匹配）
// 幂等：若该角色根路由已存在则不再添加，避免 main.js 与 beforeEach 重复添加导致重复菜单
export function addProtectedRoutes(role) {
  return new Promise(async (resolve) => {
    let routesToAdd = [];
    const r = (role || "user").toString().toLowerCase();

    if (r === "admin" || r === "administrator") {
      routesToAdd = adminRoutes;
    } else {
      // user、customer 及其他未知角色均使用用户端路由，保证总有可跳转的首页
      routesToAdd = userRoutes;
    }

    const currentRoutes = router.getRoutes();
    const rootPaths = r === "admin" || r === "administrator" ? ["/admin"] : ["/", ""];
    const alreadyAdded = currentRoutes.some(
      (route) =>
        rootPaths.includes(route.path) &&
        route.meta?.requiresAuth &&
        route.children?.some((c) => (r === "admin" || r === "administrator" ? c.path === "list" : c.path === "siteInfo"))
    );
    if (alreadyAdded) {
      resolve();
      return;
    }

    routesToAdd.forEach((route) => {
      router.addRoute(route);
    });
    router.addRoute(notFoundRoute);
    
    // 等待多个 tick，确保路由完全添加完成并可以被匹配
    await nextTick();
    await nextTick();
    
    // 验证路由是否添加成功，并确保路由可以被解析
    const targetRouteName = (r === "admin" || r === "administrator") ? "AdminList" : "CustomerHome";
    let retryCount = 0;
    let routeReady = false;
    
    while (retryCount < 10 && !routeReady) {
      try {
        // 验证路由是否可以被解析
        const resolved = router.resolve({ name: targetRouteName });
        if (resolved.name && resolved.name !== "NotFound") {
          routeReady = true;
        }
      } catch (err) {
        // 解析失败，继续重试
      }
      
      if (!routeReady) {
        retryCount++;
        if (retryCount < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          await nextTick();
        }
      }
    }
    
    if (!routeReady) {
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