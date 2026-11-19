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
  const value = (role ?? "").toString().trim().toLowerCase();
  // 后端可能返回 admin / superadmin / 管理员 等写法。
  // 除明确的管理员角色外一律按客户处理，避免客户被误判成「无权限」。
  if (!value) return "user";
  if (["admin", "superadmin", "super_admin", "administrator", "root"].includes(value)) {
    return "admin";
  }
  return "user";
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

