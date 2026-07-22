import { config, fetchWithAuth, getAuthHeaders } from "@/utils/http";
import { useGlobalStore } from "@/stores/global";
import { ElMessage } from "element-plus";

/**
 * Query media list by demo.
 * GET /api/media/get?demo=demo67&page_name=xxx&page=1&page_size=10
 */
export const getMediaByDemo = async ({ demo = "", page_name = "", page = 1, pageSize = 10 } = {}) => {
  const q = new URLSearchParams();
  if (demo) q.set("demo", demo);
  if (page_name) q.set("page_name", page_name);
  q.set("page", String(page));
  q.set("page_size", String(pageSize));

  return await fetchWithAuth(`${config.baseUrl}/api/media/get?${q.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(false),
  });
};

/**
 * Demo config list.
 * GET /api/media/demo-config/list
 */
export const getDemoConfigList = async ({ page = 1, page_size = 20 } = {}) => {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("page_size", String(page_size));

  return await fetchWithAuth(`${config.baseUrl}/api/media/demo-config/list?${query.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(false),
  });
};

/**
 * Query one Demo config.
 * GET /api/media/demo-config/get?demo=demo67
 */
export const getDemoConfig = async (demo) => {
  const query = new URLSearchParams();
  query.set("demo", String(demo || "").trim());

  return await fetchWithAuth(`${config.baseUrl}/api/media/demo-config/get?${query.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(false),
  });
};

/**
 * Save Demo config.
 * POST /api/media/demo-config/save
 * sizes records may include { module_id, width, height, image_url }
 */
export const saveDemoConfig = async ({ demo, imgs, sizes, blacklist }) => {
  const body = {};
  if (demo !== undefined) body.demo = demo;
  if (imgs !== undefined) body.imgs = imgs;
  if (sizes !== undefined) body.sizes = sizes;
  if (blacklist !== undefined) body.blacklist = blacklist;

  return await fetchWithAuth(`${config.baseUrl}/api/media/demo-config/save`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
};

/**
 * Delete Demo config.
 * POST /api/media/demo-config/delete
 */
export const deleteDemoConfig = async (demo) => {
  return await fetchWithAuth(`${config.baseUrl}/api/media/demo-config/delete`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ demo }),
  });
};

/**
 * Upload a file.
 * POST /api/media/save
 * body: FormData { file, demo, page }
 */
export const saveMedia = async ({ file, demo, page }) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("demo", demo);
  fd.append("page", page);

  const globalStore = useGlobalStore();
  const controller = new AbortController();
  const UPLOAD_TIMEOUT = 120000;
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

  try {
    const res = await fetch(`${config.baseUrl}/api/media/save`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${globalStore.access_token}`,
      },
      body: fd,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (data.code !== 0) {
      ElMessage.error(data?.msg || data?.message || "Upload failed");
      return data;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Image upload failed:", error);
    ElMessage.error("Image upload failed");
    return { code: -1, message: "Upload failed" };
  }
};

/**
 * Delete media.
 * DELETE /api/media/delete
 */
export const deleteMedia = async ({ id }) => {
  const globalStore = useGlobalStore();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const res = await fetch(`${config.baseUrl}/api/media/delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${globalStore.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (data.code !== 0) {
      ElMessage.error(data?.msg || data?.message || "Delete failed");
      return data;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Media delete failed:", error);
    ElMessage.error("Media delete failed");
    return { code: -1, message: "Delete failed" };
  }
};
