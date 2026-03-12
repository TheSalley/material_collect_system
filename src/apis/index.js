import { useGlobalStore } from "@/stores/global";
import router from "@/router";

const config = {
  baseUrl: "https://apitest.yhct.site",
};

/**
 * 统一的fetch请求包装函数，处理401等错误
 */
const fetchWithAuth = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    
    // 检查是否是401未授权错误
    if (res.status === 401 || data.code === 401) {
      const globalStore = useGlobalStore();
      
      // 清除用户信息
      globalStore.clearUser();
      
      // 跳转到登录页
      router.push('/login');
      
      // 提示用户
      ElMessage.error('登录已过期，请重新登录');
      
      return data;
    }
    
    return data;
  } catch (error) {
    console.error('请求错误:', error);
    throw error;
  }
};

/**
 *
 * 用户登录
 */
export const login = async (payload) => {
  const res = await fetch(config.baseUrl + "/api/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
};

/**
 *
 * 用户编辑
 */
export const updateUser = async (payload) => {
  const { access_token } = useGlobalStore();

  return await fetchWithAuth(config.baseUrl + "/api/user/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(payload),
  });
};


/**
 *
 * 用户编辑 page_list
 */
export const updateUserPageList = async (payload) => {
  const { access_token } = useGlobalStore();

  return await fetchWithAuth(config.baseUrl + "/api/user/update_page_list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(payload),
  });
};


/**
 *
 * 获取Elementor 所有页面
 */
export const getPages = async (site_id) => {
  const { access_token } = useGlobalStore();

  return await fetchWithAuth(config.baseUrl + `/api/proxy/get_pages?site_id=${site_id}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

/**
 *
 * 获取Elementor 单页面数据
 */
export const getPageById = async (post_id, site_id) => {
  const { access_token} = useGlobalStore();

  return await fetchWithAuth(
    config.baseUrl + `/api/proxy/elementor_data/${post_id}?site_id=${site_id}`,
  {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

/**
 * 获取站点标题
 */
export const getSiteTitle = async (site_id) => {
  const { access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + `/api/proxy/site_title?site_id=${site_id}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

/**
 * 获取站点 favicon/icon
 */
export const getSiteIcon = async (site_id) => {
  const { access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + `/api/proxy/site_icon?site_id=${site_id}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

/**
 * 更新站点标题
 */
export const updateSiteTitle = async (site_id, title) => {
  const { access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + "/api/proxy/site_title", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ site_id, title }),
  });
};

/**
 * 设置站点 favicon/icon（POST form: site_id + file）
 * 响应: { code: 0, data: { attachment_id }, message }
 */
export const updateSiteIcon = async (site_id, file) => {
  const { access_token } = useGlobalStore();
  const form = new FormData();
  form.append("site_id", site_id);
  form.append("file", file);
  return await fetchWithAuth(config.baseUrl + "/api/proxy/site_icon", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    body: form,
  });
};

/**
 *
 * 上传Elementor 图片到媒体库
 */
export const uploadImage = async (formdata) => {
  const { access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + "/api/proxy/upload_image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    body: formdata,
  });
};

/**
 *
 * 更新Elementor 单页面数据
 */
export const updatePageById = async (payload) => {
  const { access_token } = useGlobalStore();

  return await fetchWithAuth(config.baseUrl + "/api/proxy/update_elementor_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(payload),
  });
};

/**
 * 创建内容（新闻/文章等）
 */
export const contentCreate = async (payload) => {
  const { access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + "/api/proxy/content_create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(payload),
  });
};


/**
 *
 * 获取站点列表
 */
export const getList = async () => {
  const { access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + "/api/site/list", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

/**
 * 创建站点
 */
export const createSite = async (payload) => {
  const { access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + "/api/site/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(payload),
  });
};

/**
 *
 * 获取用户列表
 */
export const getUserList = async () => {
  const { access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + "/api/user/list", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

/**
 * 创建用户
 */
export const createUser = async (payload) => {
  const { access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + "/api/user/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(payload),
  });
};

/**
 * 上传页面截图（左侧截图）
 * formdata 需包含: site_id, elementor_id, file
 */
export const upload_bind_img = async (formdata) => {
  const globalStore = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + "/api/file/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${globalStore.access_token}`,
    },
    body: formdata,
  });
};

/**
 * 获取页面截图列表
 * 响应: { code, data: { list: [{ file_url, ... }], page, page_size, total }, message }
 */
export const get_bind_img = async (site_id, elementor_id) => {
  const globalStore = useGlobalStore();
  const params = new URLSearchParams({ site_id, elementor_id: String(elementor_id) });
  return await fetchWithAuth(
    config.baseUrl + "/api/file/get?" + params.toString(),
    {
      headers: {
        Authorization: `Bearer ${globalStore.access_token}`,
      },
    }
  );
};

/** 将接口返回的相对 file_url 转为完整可访问 URL */
export const getFileFullUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : config.baseUrl + "/" + path.replace(/^\//, "");
};


/**
 *
 * 翻译API
 */
export const translate = async (payload) => {
  const globalStore = useGlobalStore();
  return await fetchWithAuth("http://120.55.2.201:8008/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${globalStore.access_token}`,
    },
    body: JSON.stringify(payload),
  });
};
