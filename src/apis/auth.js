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



import { fetchWithAuth } from "@/utils/http";

/**
 * 2.3 获取当前用户信息
 * GET /api/auth/me
 */
export const getCurrentUser = async () => {
  return await fetchWithAuth(config.baseUrl + "/api/auth/me", {
  });
};

/**
 * 2.4 修改密码
 * POST /api/auth/change_password
 */
export const changePassword = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/auth/change_password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};