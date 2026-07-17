import { config, fetchWithAuth, getAuthHeaders } from "@/utils/http";

export const getBlacklistConfig = async (demo) => {
  const queryParams = new URLSearchParams();
  queryParams.append("demo", demo);
  const url = config.baseUrl + "/api/media/demo-config/get?" + queryParams.toString();
  return await fetchWithAuth(url, {
    method: "GET",
    headers: getAuthHeaders(false),
  });
};

export const saveBlacklistConfig = async (demo, blacklistUrls = []) => {
  const payload = {
    demo,
    blacklist: blacklistUrls,
  };
  const headers = getAuthHeaders(false);
  headers["Content-Type"] = "application/json";
  return await fetchWithAuth(config.baseUrl + "/api/media/demo-config/save", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
};
