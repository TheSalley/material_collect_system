import { config, fetchWithAuth, getAuthHeaders } from "@/utils/http";
import { useGlobalStore } from "@/stores/global";
import { ElMessage } from "element-plus";

/**
 * 管理员查询素材列表
 * GET /api/media/get?demo=demo67&page_name=xxx&page=1&page_size=10
 */
export const getMediaByDemo = async ({ demo = "", page_name = "", page = 1, pageSize = 10 } = {}) => {
  const q = new URLSearchParams();
  if (demo) q.set("demo", demo);
  if (page_name) q.set("page_name", page_name);
  q.set("page", page);
  q.set("page_size", pageSize);
  return await fetchWithAuth(`${config.baseUrl}/api/media/get?${q.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(false),
  });
};

/**
 * Demo 配置列表
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
 * 查询单个 Demo 配置
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
 * 保存 Demo 配置
 * POST /api/media/demo-config/save
 */
export const saveDemoConfig = async ({ demo, imgs = [], sizes = [], blacklist = [] }) => {
  return await fetchWithAuth(`${config.baseUrl}/api/media/demo-config/save`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      demo,
      imgs,
      sizes,
      blacklist,
    }),
  });
};

/**
 * 删除 Demo 配置
 * POST /api/media/demo-config/delete
 */
export const deleteDemoConfig = async (demo) => {
  return await fetchWithAuth(`${config.baseUrl}/api/media/demo-config/delete`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      demo,
    }),
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
  const controller = new AbortController();
  // 上传文件单独使用 120s 超时，避免大图/慢网速下被截断
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
      ElMessage.error(data?.msg || data?.message || "上传失败");
      return data;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("图片上传失败:", error);
    ElMessage.error("图片上传失败");
    return { code: -1, message: "上传失败" };
  }
};

/**
 * 管理员删除素材
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
      ElMessage.error(data?.msg || data?.message || "删除失败");
      return data;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("素材删除失败:", error);
    ElMessage.error("素材删除失败");
    return { code: -1, message: "删除失败" };
  }
};
