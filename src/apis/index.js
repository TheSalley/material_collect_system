import { useGlobalStore } from "@/stores/global";

const config = {
  baseUrl: "http://120.55.2.201:8008",
};



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
