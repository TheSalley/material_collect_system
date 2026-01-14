import router from "@/router";
import { adminRoutes, userRoutes, publicRoutes } from "@/router"; // 导入角色专属路由

// 根据角色动态添加对应的路由
export function addProtectedRoutes(role) {
  return new Promise((resolve) => {
    let routesToAdd = [];

    // 1. 根据角色选择要添加的路由
    if (role === "admin") {
      routesToAdd = adminRoutes;
    } else if (role === "customer") {
      routesToAdd = userRoutes;
    }
    routesToAdd.forEach((route) => {
      router.addRoute(route);
    });
    resolve();
  });
}

// 重置路由
export function resetRoutes() {
  return new Promise((resolve) => {
    
    // 获取当前所有路由
    const allRoutes = router.getRoutes();
    
    // 移除所有动态添加的路由（除了公共路由）
    allRoutes.forEach((route) => {
      // 只移除非公共路由
      if (route.name && !['Login', 'NotFound'].includes(route.name)) {
        router.removeRoute(route.name);
      }
    });
    resolve();
  });
}