import { config, fetchWithAuth } from "@/utils/http";

/**
 * 3.1 获取用户列表
 * GET /api/user/list
 */
export const getUserList = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.id) queryParams.append('id', params.id);
  if (params.username) queryParams.append('username', params.username);
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const url = config.baseUrl + "/api/user/list" + (queryParams.toString() ? `?${queryParams.toString()}` : '');
  
  return await fetchWithAuth(url, {
  });
};

/**
 * 3.2 获取已删除用户列表
 * GET /api/user/deleted
 */
export const getDeletedUserList = async () => {
  return await fetchWithAuth(config.baseUrl + "/api/user/deleted", {
  });
};

/**
 * 3.3 获取用户详情
 * GET /api/user/:id
 */
export const getUserDetail = async (id) => {
  return await fetchWithAuth(config.baseUrl + `/api/user/${id}`, {
  });
};

/**
 * 3.4 创建用户
 * POST /api/user/add
 * Body 需包含 site_ids（至少一个站点）
 */
export const createUser = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/add", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * 获取某用户在某站点下的页面授权列表
 * GET /api/user/page_permissions?id=&site_id=
 * 响应 data: { page_id: number, allow: boolean }[]
 */
export const getPagePermissions = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.id != null && params.id !== "") {
    queryParams.append("id", String(params.id));
  }
  if (params.site_id != null && params.site_id !== "") {
    queryParams.append("site_id", String(params.site_id));
  }
  const qs = queryParams.toString();
  const url =
    config.baseUrl +
    "/api/user/page_permissions" +
    (qs ? `?${qs}` : "");
  return await fetchWithAuth(url, {
  });
};

/**
 * 设置客户在某站点下对某页面的访问权限
 * POST /api/user/set_page_permission
 * Body: { id: number, site_id: string, page_id: number, allow: boolean }
 */
export const setPagePermission = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/set_page_permission", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * 3.5 更新用户
 * POST /api/user/update
 * Body: { id, username, password?, role, site_ids: string[] }
 */
export const updateUser = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/update", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * 用户编辑 page_list（保留向后兼容）
 */
export const updateUserPageList = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/update_page_list", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * 3.6 删除用户
 * POST /api/user/delete
 */
export const deleteUser = async (id) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/delete", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
};

/**
 * 3.7 取消用户站点授权
 * POST /api/user/revoke_sites
 */
export const revokeUserSites = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/revoke_sites", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * 3.8 恢复已删除用户
 * POST /api/user/restore
 */
export const restoreUser = async (id) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/restore", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
};

/**
 * 获取站点级页面排序
 * GET /api/user/page_order?site_id=
 * 响应 data: { order: number[] }
 */
export const getPageOrder = async (site_id) => {
  const url =
    config.baseUrl +
    "/api/user/page_order?site_id=" +
    encodeURIComponent(site_id);
  return await fetchWithAuth(url, {});
};

/**
 * 保存站点级页面排序
 * POST /api/user/set_page_order
 * Body: { site_id, order: number[] }
 */
export const setPageOrder = async ({ site_id, order }) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/set_page_order", {
    method: "POST",
    body: JSON.stringify({ site_id, order }),
  });
};

/**
 * 获取当前登录用户的可访问权限（菜单 + 各站点可看页面）
 * GET /api/user/my_permissions
 * 响应 data: { role, menus: string[], sites: { site_id, page_ids: number[] }[] }
 */
export const getMyPermissions = async () => {
  return await fetchWithAuth(config.baseUrl + "/api/user/my_permissions", {});
};

/**
 * 查看某角色的菜单权限
 * GET /api/user/role_menu_permissions?role=admin|user
 */
export const getRoleMenuPermissions = async (role) => {
  const url =
    config.baseUrl +
    "/api/user/role_menu_permissions?role=" +
    encodeURIComponent(role);
  return await fetchWithAuth(url, {});
};

/**
 * 设置角色菜单权限
 * POST /api/user/set_role_menu_permission
 * Body: { role, menu_key, allow }
 */
export const setRoleMenuPermission = async (payload) => {
  return await fetchWithAuth(
    config.baseUrl + "/api/user/set_role_menu_permission",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};

/**
 * 清除角色菜单权限
 * POST /api/user/clear_role_menu_permissions
 * Body: { role, menu_keys?: string[] }
 */
export const clearRoleMenuPermissions = async (payload) => {
  return await fetchWithAuth(
    config.baseUrl + "/api/user/clear_role_menu_permissions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};
