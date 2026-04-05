import { config, fetchWithAuth, getAuthHeaders } from "./config";
import { useGlobalStore } from "@/stores/global";

/**
 * 管理员查询素材列表
 * GET /api/media/get?demo=demo67
 */
export const getMediaByDemo = async (demo) => {
  const q = new URLSearchParams();
  if (demo) q.set("demo", demo);
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return await fetchWithAuth(`${config.baseUrl}/api/media/get${suffix}`, {
    method: "GET",
    headers: getAuthHeaders(false),
  });
};

/**
 * 管理员上传素材
 * POST /api/media/save
 * body: FormData { file, demo, page }
 */
export const saveMedia = async ({ file, demo, page }) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("demo", demo);
  fd.append("page", page);

  const globalStore = useGlobalStore();

  return await fetch(`${config.baseUrl}/api/media/save`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${globalStore.access_token}`,
    },
    body: fd,
  }).then((r) => r.json());
};
