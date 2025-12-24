import { useGlobalStore } from "@/stores/global";

const config = {
  baseUrl: "http://120.55.2.201:8008",
};

/** *
 *
 * 用户登录
 */
export const login = async (payload) => {
  const res = await fetch(config.baseUrl + "/api/login/", {
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
  const { token } = useGlobalStore();

  const res = await fetch(config.baseUrl + "/api/user/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
};


/**
 *
 * 用户编辑page_list
 */
export const updateUserPageList = async (payload) => {
  const { token } = useGlobalStore();

  const res = await fetch(config.baseUrl + "/api/user/update_page_list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
};


/**
 *
 * 获取Elementor 所有页面
 */
export const getPages = async () => {
  const { websiteInfo } = useGlobalStore();

  const res = await fetch(config.baseUrl + "/api/proxy/get_pages", {
    headers: {
      website: websiteInfo.url,
    },
  });
  const data = await res.json();
  return data;
};

/**
 *
 * 获取Elementor 单页面数据
 */
export const getPageById = async (id) => {
  const { user } = useGlobalStore();
  const website = user.url;

  const res = await fetch(
    config.baseUrl + `/api/proxy/elementor_data?id=${id}`,
    {
      headers: {
        website: website,
      },
    }
  );
  const data = await res.json();
  return data;
};


/**
 *
 * 上传Elementor 图片到媒体库
 */
export const uploadImage = async (formdata) => {
  const { user } = useGlobalStore();
  const website = user.url;
  const res = await fetch(config.baseUrl + "/api/proxy/upload_image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${user.token}`,
      website,
    },
    body: formdata,
  });
  const data = await res.json();
  return data;
};

/**
 *
 * 更新Elementor 单页面数据
 */
export const updatePageById = async (payload) => {
  const { user } = useGlobalStore();
  const website = user.url;

  const res = await fetch(config.baseUrl + "/api/proxy/update_elementor_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
      website,
    },
    body: JSON.stringify({
      ...payload,
    }),
  });
  const data = await res.json();
  return data;
};

export const getList = async () => {
  const globalStore = useGlobalStore();
  const res = await fetch(config.baseUrl + "/api/user/list", {
    headers: {
      Authorization: `Bearer ${globalStore.token}`,
    },
  });
  const data = await res.json();
  return data;
};

/**
 *
 * 上传并绑定图片
 */
export const upload_bind_img = async (formdata) => {
  const globalStore = useGlobalStore();
  const res = await fetch(config.baseUrl + "/api/file/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${globalStore.token}`,
    },
    body: formdata,
  });
  const data = await res.json();
  return data;
};

/**
 *
 * 获取绑定的图片
 */
export const get_bind_img = async (demo, bind_id, bind_mode) => {
  const globalStore = useGlobalStore();
  const res = await fetch(
    config.baseUrl +
    "/api/file/get" +
    `?demo=${demo}&bind_id=${bind_id}&bind_mode=${bind_mode}`,
    {
      headers: {
        Authorization: `Bearer ${globalStore.token}`,
      },
    }
  );
  const data = await res.json();
  return data;
};


/**
 *
 * 翻译API
 */
export const translate = async (payload) => {
  const globalStore = useGlobalStore();
  const res = await fetch(config.baseUrl + "/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${globalStore.token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
};
