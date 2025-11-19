const config = {
  // baseUrl: 'http://localhost:8008', // 本机node
  baseUrl: "http://192.168.110.21/wp-json/custom-db-api/v1", // mac
};

/**
 *
 * 登录
 */
export const wp_login = async (payload) => {
  const res = await fetch(config.baseUrl + "/login", {
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

/**
 *
 * 获取Elementor 所有页面
 */
export const getPages = async () => {
  const res = await fetch(config.baseUrl + "/publish_pages");
  const data = await res.json();
  return data;
};

/**
 *
 * 获取Elementor 单页面数
 */
export const getPageById = async (id) => {
  const res = await fetch(config.baseUrl + `/elementor_data/?id=${id}`);
  const data = await res.json();
  return data;
};

export const updatePageById = async (payload) => {
  const res = await fetch(config.baseUrl + `/update_elementor_data`, {
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
