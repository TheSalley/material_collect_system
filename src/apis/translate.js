import { config, fetchWithAuth, getAuthHeaders } from "./config";

/**
 * 7.1 翻译文本
 * POST /api/proxy/translate
 */
export const translate = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/translate", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};
