import { config, fetchWithAuth, getAuthHeaders } from "./config";

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
 */
export const createUser = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/user/add", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 3.5 更新用户
 * POST /api/user/update
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
