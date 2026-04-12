import { config, requestWithoutAuth } from "@/utils/http";

/**
 * 2.1 用户登录
 * POST /api/auth/login
 */
export const login = async (payload) => {
  return await requestWithoutAuth(config.baseUrl + "/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

/**
 * 2.2 刷新 Token
 * POST /api/auth/refresh
 */
export const refreshToken = async (refresh_token) => {
  return await requestWithoutAuth(config.baseUrl + "/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token }),
  });
};

import { fetchWithAuth, getAuthHeaders } from "@/utils/http";

/**
 * 2.3 获取当前用户信息
 * GET /api/auth/me
 */
export const getCurrentUser = async () => {
  return await fetchWithAuth(config.baseUrl + "/api/auth/me", {
    headers: getAuthHeaders(false),
  });
};

/**
 * 2.4 修改密码
 * POST /api/auth/change_password
 */
export const changePassword = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/auth/change_password", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};