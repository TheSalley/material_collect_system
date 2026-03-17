import { config, fetchWithAuth, getAuthHeaders } from "./config";

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
 * 6.3 获取 Elementor JSON 数据
 * GET /api/proxy/elementor_data_json/:id
 */
export const getElementorDataJson = async (id, site_id) => {
  return await fetchWithAuth(
    config.baseUrl + `/api/proxy/elementor_data_json/${id}?site_id=${site_id}`,
    {
      headers: getAuthHeaders(false),
    }
  );
};

/**
 * 6.4 获取 Elementor ElType 列表
 * GET /api/proxy/elementor_data_eltype/:id
 */
export const getElementorDataElType = async (id, site_id) => {
  return await fetchWithAuth(
    config.baseUrl + `/api/proxy/elementor_data_eltype/${id}?site_id=${site_id}`,
    {
      headers: getAuthHeaders(false),
    }
  );
};

/**
 * 6.5 更新 Elementor 数据
 * POST /api/proxy/update_elementor_data
 */
export const updateElementorData = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/update_elementor_data", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 6.6 上传图片到 WordPress
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
 * 6.7 获取媒体列表
 * GET /api/proxy/media_list
 */
export const getMediaList = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append('site_id', params.site_id);
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const url = config.baseUrl + "/api/proxy/media_list?" + queryParams.toString();
  
  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.8 删除媒体
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
 * 6.9 设置站点图标
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
 * 6.10 获取站点图标
 * GET /api/proxy/site_icon
 */
export const getSiteIcon = async (site_id) => {
  return await fetchWithAuth(config.baseUrl + `/api/proxy/site_icon?site_id=${site_id}`, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.11 设置站点标题
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
 * 6.12 获取站点标题
 * GET /api/proxy/site_title
 */
export const getSiteTitle = async (site_id) => {
  return await fetchWithAuth(config.baseUrl + `/api/proxy/site_title?site_id=${site_id}`, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.13 更新 SMTP 配置
 * POST /api/proxy/smtp_config
 */
export const updateSmtpConfig = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/smtp_config", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 6.14 测试 SMTP
 * POST /api/proxy/smtp_test
 */
export const testSmtp = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/smtp_test", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 6.15 获取 Post Types
 * GET /api/proxy/post_types
 */
export const getPostTypes = async (site_id) => {
  return await fetchWithAuth(config.baseUrl + `/api/proxy/post_types?site_id=${site_id}`, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.16 创建内容
 * POST /api/proxy/content_create
 */
export const createContent = async (payload) => {
  return await fetchWithAuth(config.baseUrl + "/api/proxy/content_create", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

/**
 * 6.17 获取内容列表
 * GET /api/proxy/content_list
 */
export const getContentList = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append('site_id', params.site_id);
  queryParams.append('post_type', params.post_type); // 'product' 或 'post'
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  if (params.search) queryParams.append('search', params.search);
  
  const url = config.baseUrl + "/api/proxy/content_list?" + queryParams.toString();
  
  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.17.1 获取新闻列表（post/news）
 * GET /api/proxy/news_list
 */
export const getNewsList = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append('site_id', params.site_id);
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  if (params.search) queryParams.append('status', 'publish');

  const url = config.baseUrl + "/api/proxy/news_list?" + queryParams.toString();

  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.17.1.1 获取单个新闻内容
 * GET /api/proxy/news
 */
export const getNews = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append("site_id", params.site_id);
  queryParams.append("id", params.id);

  const url = config.baseUrl + "/api/proxy/news?" + queryParams.toString();

  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.17.2 获取产品列表（product）
 * GET /api/proxy/product_list
 */
export const getProductList = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append("site_id", params.site_id);
  if (params.page) queryParams.append("page", params.page);
  if (params.page_size) queryParams.append("page_size", params.page_size);
  if (params.status) queryParams.append("status", params.status);

  const url = config.baseUrl + "/api/proxy/product_list?" + queryParams.toString();

  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.17.3 获取单个产品内容
 * GET /api/proxy/product
 */
export const getProduct = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append("site_id", params.site_id);
  queryParams.append("id", params.id);

  const url = config.baseUrl + "/api/proxy/product?" + queryParams.toString();

  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 6.18 删除内容
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
 * 6.19 获取新闻分类列表
 * GET /api/proxy/news_categories
 */
export const getNewsCategories = async (site_id) => {
  return await fetchWithAuth(config.baseUrl + `/api/proxy/news_categories?site_id=${site_id}`, {
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
export const contentCreate = createContent;
