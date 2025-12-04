import router from "@/router";
import { adminRoutes, userRoutes, publicRoutes } from "@/router"; // 导入角色专属路由

// 根据角色动态添加对应的路由
export function addProtectedRoutes(role) {
  return new Promise((resolve) => {
    let routesToAdd = [];

    // 1. 根据角色选择要添加的路由
    if (role === "administrator") {
      routesToAdd = adminRoutes; // 管理员添加 adminRoutes
    } else if (role === "customer") {
      routesToAdd = userRoutes; // 普通用户添加 userRoutes
    }
    routesToAdd.forEach((route) => {
      router.addRoute(route);
    });
    resolve();
  });
}

// 重置路由
export function resetRoutes() {
  router.getRoutes().forEach((route) => {
    if (route.name) router.removeRoute(route.name);
  });
  publicRoutes.forEach((route) => {
    router.addRoute(route);
  });
}
