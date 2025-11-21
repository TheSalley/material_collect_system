const config = {
  // baseUrl: 'http://localhost:8008',
  baseUrl: "http://192.168.110.27:8008",
  // baseUrl: "http://192.168.110.45:8008",
};

export const getPages = async () => {
  const res = await fetch(config.baseUrl + "/pages");
  const data = await res.json();
  return data;
};

export const getPageById = async (id) => {
  const res = await fetch(config.baseUrl + `/elementor/${id}`);
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
      ...payload
    }),
  });
  const data = await res.json();
  return data;
};

export const getList = async () => {
  const res = await fetch(config.baseUrl + "/list");
  const data = await res.json();
  return data;
};
