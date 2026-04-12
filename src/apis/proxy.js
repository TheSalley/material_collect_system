import { config, fetchWithAuth, getAuthHeaders } from "@/utils/http";

/**
 * 6.1 获取页面列表
 * GET /api/proxy/get_pages
 */
export const getPages = async (site_id) => {
  return await fetchWithAuth(config.baseUrl + `/api/proxy/get_pages?site_id=${site_id}`, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.2 获取 Elementor 数据
 * GET /api/proxy/elementor_data/:id
 */
export const getElementorData = async (id, site_id) => {
  return await fetchWithAuth(
    config.baseUrl + `/api/proxy/elementor_data/${id}?site_id=${site_id}`,
    {
      headers: getAuthHeaders(false),
    }
  );
};

/**
 * 6.2.1 更新 Elementor 数据
 * POST /api/proxy/update_elementor_data
 */
export const updateElementorData = async ({ site_id, id, data }) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/update_elementor_data", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ site_id, id, data }),
  });
};

/**
 * 6.3 上传图片到 WordPress
 * POST /api/proxy/upload_image
 */
export const uploadImage = async (formData) => {
  const headers = getAuthHeaders(false);

  return await fetchWithAuth(config.baseUrl + "/api/proxy/upload_image", {
    method: "POST",
    headers,
    body: formData,
  });
};

/**
 * 6.4 获取媒体列表
 * GET /api/proxy/media_list
 */
export const getMediaList = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append('site_id', params.site_id);
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  if (params.attachment_id != null && params.attachment_id !== "") {
    queryParams.append("attachment_id", String(params.attachment_id));
  }

  const url = config.baseUrl + "/api/proxy/media_list?" + queryParams.toString();

  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.5 删除媒体
 * POST /api/proxy/media_delete
 */
export const deleteMedia = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/media_delete", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 6.6 设置站点图标
 * POST /api/proxy/site_icon
 */
export const setSiteIcon = async (formData) => {
  const headers = getAuthHeaders(false);

  return await fetchWithAuth(config.baseUrl + "/api/proxy/site_icon", {
    method: "POST",
    headers,
    body: formData,
  });
};

/**
 * 6.7 获取站点图标
 * GET /api/proxy/site_icon
 */
export const getSiteIcon = async (site_id) => {
  return await fetchWithAuth(config.baseUrl + `/api/proxy/site_icon?site_id=${site_id}`, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.8 设置站点标题
 * POST /api/proxy/site_title
 */
export const setSiteTitle = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/site_title", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 6.9 获取站点标题
 * GET /api/proxy/site_title
 */
export const getSiteTitle = async (site_id) => {
  return await fetchWithAuth(config.baseUrl + `/api/proxy/site_title?site_id=${site_id}`, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.10 获取新闻列表
 * GET /api/proxy/get_news_list
 */
export const getNewsList = async (params) => {
  const queryParams = new URLSearchParams();
  if (params.site_id) queryParams.append("site_id", params.site_id);
  if (params.page) queryParams.append("page", params.page);
  if (params.page_size) queryParams.append("page_size", params.page_size);

  const url = config.baseUrl + "/api/proxy/get_news_list?" + queryParams.toString();
  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.11 删除内容
 * POST /api/proxy/content_delete
 */
export const deleteContent = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/content_delete", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 6.12 获取新闻详情
 * GET /api/proxy/get_news
 */
export const getNews = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append("site_id", params.site_id);
  queryParams.append("id", params.id);

  const url = config.baseUrl + "/api/proxy/get_news?" + queryParams.toString();
  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.13 获取新闻分类列表
 * GET /api/proxy/get_news_categories
 */
export const getNewsCategories = async (site_id) => {
  return await fetchWithAuth(config.baseUrl + `/api/proxy/get_news_categories?site_id=${site_id}`, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.14 创建内容（新闻/产品）
 * POST /api/proxy/content_create
 */
export const contentCreate = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/content_create", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 6.15 获取产品详情
 * GET /api/proxy/get_product
 */
export const getProduct = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append("site_id", params.site_id);
  queryParams.append("id", params.id);

  const url = config.baseUrl + "/api/proxy/get_product?" + queryParams.toString();
  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.16 获取产品列表
 * GET /api/proxy/get_product_list
 */
export const getProductList = async (params) => {
  const queryParams = new URLSearchParams();
  if (params.site_id) queryParams.append("site_id", params.site_id);
  if (params.page) queryParams.append("page", params.page);
  if (params.page_size) queryParams.append("page_size", params.page_size);

  const url = config.baseUrl + "/api/proxy/get_product_list?" + queryParams.toString();
  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

// 向后兼容的别名
export const getPageById = getElementorData;
export const updatePageById = updateElementorData;
export const updateSiteTitle = (site_id, title) => setSiteTitle({ site_id, title });
export const updateSiteIcon = (site_id, file) => {
  const formData = new FormData();
  formData.append('site_id', site_id);
  formData.append('file', file);
  return setSiteIcon(formData);
};