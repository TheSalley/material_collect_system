const config = {
  // baseUrl: 'http://localhost:8008', // 本机node
  // baseUrl: "http://192.168.110.45/wp-json/custom-db-api/v1", // mac 公司
  baseUrl: "http://192.168.110.27/wp-json/custom-db-api/v1", // 本机
};

import { useGlobalStore } from "@/stores/global.js";

const { websiteInfo } = useGlobalStore();
console.log("websiteInfo: ", websiteInfo);

let wpBaseUrl = websiteInfo.url + "/wp-json/custom-db-api/v1";

/**
 *
 * 获取Elementor 所有页面
 */
export const getPages = async () => {
  
  const res = await fetch(wpBaseUrl + "/publish_pages");
  const data = await res.json();
  return data;
};

/**
 *
 * 获取Elementor 单页面数
 */
export const getPageById = async (id) => {
  const res = await fetch(wpBaseUrl + `/elementor_data/?id=${id}`);
  const data = await res.json();
  return data;
};

export const updatePageById = async (payload) => {
  const res = await fetch(wpBaseUrl + `/update_elementor_data`, {
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
