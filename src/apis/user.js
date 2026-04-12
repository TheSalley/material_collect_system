import { config, fetchWithAuth, getAuthHeaders } from "@/utils/http";

/**
 * 3.1 获取用户列表
 * GET /api/user/list
 */
export const getUserList = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.id) queryParams.append('id', params.id);
  if (params.username) queryParams.append('username', params.username);
  
  const url = config.baseUrl + "/api/user/list" + (queryParams.toString() ? `?${queryParams.toString()}` : '');
  
  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 3.2 获取已删除用户列表
 * GET /api/user/deleted
 */
export const getDeletedUserList = async () => {
  return await fetchWithAuth(config.baseUrl + "/api/user/deleted", {
    headers: getAuthHeaders(false),
  });
};

/**
 * 3.3 获取用户详情
 * GET /api/user/:id
 */
export const getUserDetail = async (id) => {
  return await fetchWithAuth(config.baseUrl + `/api/user/${id}`, {
    headers: getAuthHeaders(false),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(false),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 用户编辑 page_list（保留向后兼容）
 */
export const updateUserPageList = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/update_page_list", {
    method: "POST",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify({ id }),
  });
};
