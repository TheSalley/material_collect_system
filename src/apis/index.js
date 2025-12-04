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
}

/** *
 * 
 * 获取Elementor 所有页面
 */
export const getPages = async () => {
  const { websiteInfo } = useGlobalStore();
  const website = websiteInfo.url;

  const baseUrl = config.baseUrl + "/api/proxy";
  const parmas = {
    path: "publish_pages",
  };

  const urlObj = new URL(baseUrl);
  urlObj.search = new URLSearchParams(parmas).toString();

  const res = await fetch(urlObj.toString(), {
    headers: {
      "website": website,
    },
  });
  const data = await res.json();
  return data;
};

export const getPageById = async (id) => {
  const { websiteInfo } = useGlobalStore();
  const website = websiteInfo.url;

  const baseUrl = config.baseUrl + "/api/proxy";
  const parmas = {
    path: "elementor_data",
    params: JSON.stringify({
      id,
    }),
  };

  const urlObj = new URL(baseUrl);
  urlObj.search = new URLSearchParams(parmas).toString();

  const res = await fetch(urlObj.toString(), {
    headers: {
      "website": website,
    },
  });
  const data = await res.json();
  return data;
};

export const updatePageById = async (payload) => {
  const res = await fetch(config.baseUrl + `/update_elementor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
