import router from "@/router";
import { adminRoutes, userRoutes, publicRoutes, notFoundRoute } from "@/router";

// 根据角色动态添加对应的路由（最后再添加 404，保证 "/" 先被角色路由匹配）
export function addProtectedRoutes(role) {
  return new Promise((resolve) => {
    let routesToAdd = [];
    const r = (role || "user").toString().toLowerCase();

    if (r === "admin" || r === "administrator") {
      routesToAdd = adminRoutes;
    } else if (r === "customer" || r === "user") {
      routesToAdd = userRoutes;
    }
    routesToAdd.forEach((route) => {
      router.addRoute(route);
    });
    router.addRoute(notFoundRoute);
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