import { PRESET_API_BASE_URL } from "@/config";
import { fetchWithAuth } from "@/utils/http";

const BASE_URL = String(PRESET_API_BASE_URL).replace(/\/+$/, "");

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

function jsonPost(path, payload) {
  return fetchWithAuth(`${BASE_URL}${path}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /api/presets/list */
export function listPresets(params = {}) {
  return fetchWithAuth(`${BASE_URL}/api/presets/list${buildQuery(params)}`, {
    method: "GET",
  });
}

/** POST /api/presets/add */
export function createPreset(payload) {
  return jsonPost("/api/presets/add", payload);
}

/** POST /api/presets/update */
export function updatePreset(payload) {
  return jsonPost("/api/presets/update", payload);
}

/** POST /api/presets/delete */
export function deletePreset(id) {
  return jsonPost("/api/presets/delete", { id });
}

/** GET /api/presets/categories */
export function listPresetCategories() {
  return fetchWithAuth(`${BASE_URL}/api/presets/categories`, { method: "GET" });
}

/** POST /api/presets/categories/add */
export function createPresetCategory(payload) {
  return jsonPost("/api/presets/categories/add", payload);
}

/** POST /api/presets/categories/update */
export function updatePresetCategory(payload) {
  return jsonPost("/api/presets/categories/update", payload);
}

/** POST /api/presets/categories/delete */
export function deletePresetCategory(key) {
  return jsonPost("/api/presets/categories/delete", { key });
}

/** POST /api/presets/upload（预设后端图片上传） */
export function uploadPresetMedia(file) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchWithAuth(`${BASE_URL}/api/presets/upload`, {
    method: "POST",
    body: formData,
  });
}

/** 把预设后端的站内图片地址解析为可直接访问的地址 */
export function resolvePresetMediaUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  return `${BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}
