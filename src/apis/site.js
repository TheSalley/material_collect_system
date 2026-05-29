import { config, fetchWithAuth, getAuthHeaders, requestWithoutAuth } from "@/utils/http";

/**
 * 4.1 创建站点
 * POST /api/site/create
 */
export const createSite = async (payload) => {
  const res = await fetchWithAuth(config.baseUrl + "/api/site/create", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res;
};

/**
 * 4.2 绑定站点URL
 * POST /api/site/bind_url
 */
export const bindSiteUrl = async (payload) => {
  return await requestWithoutAuth(config.baseUrl + "/api/site/bind_url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

/**
 *  重新绑定
 * POST /api/site/bind
 */
export const bindSite = async (payload) => {
  return await requestWithoutAuth(config.baseUrl + "/api/site/bind", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const updateSite = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/site/update", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 4.3 删除站点
 * POST /api/site/delete
 */
export const deleteSite = async (site_id) => {
  return await fetchWithAuth(config.baseUrl + "/api/site/delete", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ site_id }),
  });
};

/**
 * 4.4 获取站点列表
 * GET /api/site/list
 */
export const getSiteList = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.demo_site) queryParams.append('demo_site', params.demo_site);
  if (params.site_status !== undefined) queryParams.append('site_status', params.site_status);
  if (params.include_deleted) queryParams.append('include_deleted', params.include_deleted);

  const url = config.baseUrl + "/api/site/list" + (queryParams.toString() ? `?${queryParams.toString()}` : '');

  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};
