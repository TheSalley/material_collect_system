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
 *
 * 上传Elementor 图片到媒体库
 */
export const uploadImage = async (formdata) => {
  const { websiteInfo, access_token } = useGlobalStore();
  return await fetchWithAuth(config.baseUrl + "/api/proxy/upload_image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      website: websiteInfo.url,
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
 *
 * 上传并绑定图片
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
 *
 * 获取绑定的图片
 */
export const get_bind_img = async (demo, bind_id, bind_mode) => {
  const globalStore = useGlobalStore();
  return await fetchWithAuth(
    config.baseUrl +
    "/api/file/get" +
    `?demo=${demo}&bind_id=${bind_id}&bind_mode=${bind_mode}`,
    {
      headers: {
        Authorization: `Bearer ${globalStore.access_token}`,
      },
    }
  );
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
