import { config, fetchWithAuth, getAuthHeaders } from "@/utils/http";

/**
 * 5.1 涓婁紶鏂囦欢
 * POST /api/file/upload
 */
export const uploadFile = async (formData) => {
  const headers = getAuthHeaders(false);
  
  return await fetchWithAuth(config.baseUrl + "/api/file/upload", {
    method: "POST",
    headers,
    body: formData,
  });
};

/**
 * 5.2 鏌ヨ鏂囦欢鍒楄〃
 * GET /api/file/get
 */
export const getFileList = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append('site_id', params.site_id);
  if (params.page_id) queryParams.append('page_id', params.page_id);
  if (params.component_id) queryParams.append('component_id', params.component_id);
  if (params.page) queryParams.append('page', params.page);
  if (params.page_size) queryParams.append('page_size', params.page_size);
  
  const url = config.baseUrl + "/api/file/get?" + queryParams.toString();
  
  return await fetchWithAuth(url, {
    headers: getAuthHeaders(false),
  });
};

/**
 * 灏嗘帴鍙ｈ繑鍥炵殑鐩稿 file_url 杞负瀹屾暣鍙闂?URL
 */
export const getFileFullUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : config.baseUrl + "/" + path.replace(/^\//, "");
};

/**
 * 鏌ヨ椤甸潰鎴浘閰嶇疆
 * GET /api/page_config/get?site_id=&page_id=
 */
export const getPageConfig = async (site_id, page_id) => {
  const queryParams = new URLSearchParams();
  queryParams.append("site_id", site_id);
  if (page_id) queryParams.append("page_id", page_id);
  const url = config.baseUrl + "/api/page_config/get?" + queryParams.toString();
  return await fetchWithAuth(url, {
    method: "GET",
    headers: getAuthHeaders(false),
  });
};

/**
 * 淇濆瓨椤甸潰鎴浘閰嶇疆
 * POST /api/page_config/save_materials
 * body: { site_id, data: { [page_id]: [...] } }
 */
export const savePageConfig = async (site_id, pageId, materialsData = []) => {
  const payload = {
    site_id,
    data: {
      [pageId]: materialsData,
    },
  };
  const headers = getAuthHeaders(false);
  headers["Content-Type"] = "application/json";
  return await fetchWithAuth(config.baseUrl + "/api/page_config/save_materials", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
};

/**
 * 淇濆瓨椤甸潰鎴浘鐩爣灏哄
 * POST /api/page_config/save_sizes
 * body: { site_id, data: { [page_id]: [{ module_id, width, height, image_url? }, ...] } }
 * @param {string} site_id - 绔欑偣 ID
 * @param {string} pageId - 椤甸潰 ID
 * @param {Array} sizesData - 尺寸数据数组，每个元素包含 { module_id, width, height, image_url? }
 */
export const savePageSizes = async (site_id, pageId, sizesData = []) => {
  const payload = {
    site_id,
    data: {
      [pageId]: sizesData,
    },
  };
  const headers = getAuthHeaders(false);
  headers["Content-Type"] = "application/json";
  return await fetchWithAuth(config.baseUrl + "/api/page_config/save_sizes", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
};

// 鍚戝悗鍏煎鐨勫埆鍚?
export const upload_bind_img = uploadFile;
export const get_bind_img = (site_id, elementor_id, page_id, component_id) => {
  return getFileList({
    site_id,
    page_id: page_id || elementor_id,
    component_id,
  });
};
