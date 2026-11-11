import { canUseCustomerMenu } from "@/config/customerMenu.js";

/**
 * 路由权限判断
 *
 * meta.role：路由所属端（admin / user），user 路由管理员也可访问
 * meta.allowRoles：更细的可见角色白名单，设置后优先于 meta.role
 *
 * 例：客户侧页面暂时不给客户看时，给路由加 allowRoles: ["admin"]，
 * 侧边栏和直接输入地址都会被拦截；恢复时移除该字段即可。
 */
export function normalizeRole(role) {
  return (role || "user").toString().toLowerCase();
}

export function canAccessRoute(meta, role) {
  const currentRole = normalizeRole(role);
  const allowRoles = meta?.allowRoles;

  if (Array.isArray(allowRoles)) {
    return allowRoles.map(normalizeRole).includes(currentRole);
  }

  const routeRole = meta?.role;
  if (routeRole === "admin") return currentRole === "admin";
  if (routeRole === "user") return currentRole === "user" || currentRole === "admin";

  return true;
}

/**
 * 客户侧功能页权限
 * meta.menuKey 指向「客户权限」面板里的开关；管理员始终放行。
 */
export function canAccessCustomerRoute(meta, role, permissions) {
  if (!canAccessRoute(meta, role)) return false;
  const menuKey = meta?.menuKey;
  if (!menuKey) return true;
  return canUseCustomerMenu(menuKey, permissions, role);
}
