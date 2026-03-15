import { config, fetchWithAuth, getAuthHeaders } from "./config";

/**
 * 5.1 上传文件
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
 * 5.2 查询文件列表
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
 * 将接口返回的相对 file_url 转为完整可访问 URL
 */
export const getFileFullUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : config.baseUrl + "/" + path.replace(/^\//, "");
};

// 向后兼容的别名
export const upload_bind_img = uploadFile;
export const get_bind_img = (site_id, elementor_id, page_id, component_id) => {
  return getFileList({
    site_id,
    page_id: page_id || elementor_id,
    component_id,
  });
};
