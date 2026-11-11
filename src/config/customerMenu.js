/**
 * 客户侧页面权限
 *
 * 这里定义客户登录后能看到哪些功能页面。
 * 权限全站共用一份，由后台「客户权限」面板统一维护。
 */
export const CUSTOMER_MENU_ITEMS = [
  {
    key: "instruction",
    title: "教程页",
    path: "/instruction",
    group: "开始",
    note: "第一次进来先看这里",
    defaultAllowed: true,
  },
  {
    key: "customerInfo",
    title: "客户基础信息",
    path: "/customerInfo",
    group: "客户资料",
    note: "品牌、联系人、结算方式",
    defaultAllowed: false,
  },
  {
    key: "bannerCollection",
    title: "Banner 收集",
    path: "/bannerCollection",
    group: "客户资料",
    note: "主视觉和配套文案",
    defaultAllowed: false,
  },
  {
    key: "siteInfo",
    title: "网站信息",
    path: "/siteInfo",
    group: "站点内容",
    note: "站点名称、域名等配置",
    defaultAllowed: true,
  },
  {
    key: "pages",
    title: "页面列表",
    path: "/pages",
    group: "站点内容",
    note: "按页面授权进入上传",
    defaultAllowed: true,
  },
  {
    key: "productList",
    title: "产品列表",
    path: "/productList",
    group: "站点内容",
    note: "产品素材和文案维护",
    defaultAllowed: false,
  },
  {
    key: "newsList",
    title: "新闻列表",
    path: "/newsList",
    group: "站点内容",
    note: "新闻素材和文案维护",
    defaultAllowed: false,
  },
];

export const DEFAULT_CUSTOMER_MENU_PERMISSIONS = Object.fromEntries(
  CUSTOMER_MENU_ITEMS.map((item) => [item.key, item.defaultAllowed])
);

/** 补齐缺失项，非布尔值按默认值处理，避免旧配置把新页面锁死 */
export function normalizeCustomerMenuPermissions(input) {
  const source = input && typeof input === "object" ? input : {};
  const result = {};
  for (const item of CUSTOMER_MENU_ITEMS) {
    result[item.key] =
      typeof source[item.key] === "boolean"
        ? source[item.key]
        : item.defaultAllowed;
  }
  return result;
}

/** 管理员始终放行；权限未加载时按默认值，加载后以显式关闭为准 */
export function canUseCustomerMenu(menuKey, permissions, role = "user") {
  if (!menuKey) return true;
  if (String(role || "user").toLowerCase() === "admin") return true;
  const source = permissions && typeof permissions === "object" ? permissions : {};
  if (typeof source[menuKey] === "boolean") return source[menuKey];
  return normalizeCustomerMenuPermissions(null)[menuKey] === true;
}

/** 当前权限下客户的默认落地页 */
export function getCustomerHomePath(permissions, siteId = "") {
  const normalized = normalizeCustomerMenuPermissions(permissions);
  for (const item of CUSTOMER_MENU_ITEMS) {
    if (!normalized[item.key]) continue;
    if (item.key === "pages") {
      if (siteId) return `/pages/${siteId}`;
      continue;
    }
    return item.path;
  }
  return "/no-access";
}
