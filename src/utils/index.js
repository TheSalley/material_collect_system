import router from '@/router';
import { adminRoutes, userRoutes } from '@/router'; // 导入角色专属路由

// 根据角色动态添加对应的路由
export function addProtectedRoutes(role) {
  return new Promise((resolve) => {
    let routesToAdd = [];

    // 1. 根据角色选择要添加的路由
    if (role === 'administrator') {
      routesToAdd = adminRoutes; // 管理员添加 adminRoutes
    } else if (role === 'customer') {
      routesToAdd = userRoutes; // 普通用户添加 userRoutes
    }

    // 2. 批量添加路由（关键：必须把角色对应的路由数组添加到 router）
    routesToAdd.forEach(route => {
      router.addRoute(route);
    });

    // 调试：打印添加的路由，确认是否正确
    console.log(`添加 ${role} 路由：`, routesToAdd);
    console.log('所有路由：', router.getRoutes().map(r => r.path));

    resolve();
  });
}