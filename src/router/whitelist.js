/**
 * 路由白名单配置
 * 不需要登录即可访问的路由统一在此管理
 *
 * 新增公开页（注册/忘记密码等）有两种方式：
 * 1. 在 WHITELIST_PATHS 中添加路径（适合固定路径路由）
 * 2. 在 WHITELIST_NAMES 中添加路由 name（适合动态路径路由，如 404）
 * 3. 或直接在路由 meta 中加 public: true（灵活补充）
 */

// 路径白名单（精确匹配）
export const WHITELIST_PATHS = ["/login"];

// 路由名白名单（用于动态路径路由，如 404 的实际访问路径不固定）
export const WHITELIST_NAMES = ["NotFound"];

/**
 * 判断路由是否在白名单中
 * @param {object} to - vue-router 导航守卫的 to 对象
 * @returns {boolean}
 */
export function isWhitelistRoute(to) {
  // 1. 路径精确匹配
  if (WHITELIST_PATHS.includes(to.path)) return true;
  // 2. 路由名匹配（动态路径路由）
  if (to.name && WHITELIST_NAMES.includes(to.name)) return true;
  // 3. meta.public 标记（灵活补充）
  if (to.meta?.public) return true;
  return false;
}
