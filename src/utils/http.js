/**
 * HTTP 请求工具函数（统一从 @/config 导入配置）
 *
 * 设计原则：
 * 1. 统一错误处理：网络错误、超时、HTTP 错误、401 都在 baseRequest 里处理
 * 2. 自动加 token：fetchWithAuth 内部自动从 store 取 token，不需要手动传 getAuthHeaders
 * 3. 修复 401 bug：401 检查在 !res.ok 之前，确保 401 时正确 clearUser + 跳登录
 * 4. 返回格式兼容：fetchWithAuth 仍然返回后端原始格式 { code, data, message }
 * 5. 新推荐方式：request() 返回 { success, data, message, code }，便于调用方判断
 */
import { useGlobalStore } from "@/stores/global";
import router from "@/router";
import { ElMessage } from "element-plus";
import {
  API_BASE_URL,
  API_TIMEOUT,
  HTTP_ERROR_MESSAGES,
} from "@/config";

/**
 * API 配置
 */
export const config = {
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
};

/**
 * HTTP 错误状态码提示
 */
const ERROR_MESSAGES = HTTP_ERROR_MESSAGES;

/**
 * 处理 401 未授权
 */
function handleUnauthorized(silent) {
  const globalStore = useGlobalStore();
  globalStore.clearUser();
  router.push("/login");
  if (!silent) {
    ElMessage.error("登录已过期，请重新登录");
  }
}

/**
 * 核心请求函数（内部使用）
 * @param {string} url - 请求地址
 * @param {object} options - fetch options
 * @param {object} opts - 额外配置 { auth: boolean, silent: boolean }
 * @returns {Promise<object>} 后端原始响应格式 { code, data, message }
 */
async function baseRequest(url, options = {}, { auth = true, silent = false } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    // 构造请求头
    const headers = { ...(options.headers || {}) };

    // 带认证的请求：自动加 token（覆盖外部传入的，确保用 store 里的最新 token）
    if (auth) {
      const globalStore = useGlobalStore();
      if (globalStore.access_token) {
        headers.Authorization = `Bearer ${globalStore.access_token}`;
      }
    }

    // 带 body 的请求自动加 Content-Type（如果外部没传）
    if (options.body && !headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // 解析响应体（兼容非 JSON 响应）
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    // 401 处理（必须在 !res.ok 之前，因为 401 时 res.ok 为 false）
    if (res.status === 401 || data?.code === 401) {
      handleUnauthorized(silent);
      return data;
    }

    // HTTP 错误状态码
    if (!res.ok) {
      const msg = data?.msg || data?.message || ERROR_MESSAGES[res.status] || `请求失败 (${res.status})`;
      if (!silent) {
        ElMessage.error(msg);
      }
      return { code: res.status, data, message: msg };
    }

    // 业务错误码（后端约定 code !== 0 为错误，但不自动弹提示，交给调用方处理）
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // 请求超时
    if (error.name === "AbortError") {
      if (!silent) {
        ElMessage.error("请求超时，请稍后重试");
      }
      return { code: -1, message: "请求超时" };
    }

    // 网络错误
    console.error("请求错误:", error);
    if (!silent) {
      ElMessage.error(ERROR_MESSAGES.network || "网络请求失败，请检查网络连接");
    }
    return { code: -1, message: error.message || ERROR_MESSAGES.network || "网络请求失败" };
  }
}

/**
 * 带认证的请求（自动加 token）
 * 用于需要登录的接口，返回后端原始格式 { code, data, message }
 *
 * @param {string} url - 请求地址
 * @param {object} options - fetch options（不需要手动传 Authorization，内部自动加）
 * @returns {Promise<object>} 后端原始响应格式
 */
export async function fetchWithAuth(url, options = {}) {
  return baseRequest(url, options, { auth: true });
}

/**
 * 不带认证的请求
 * 用于登录、刷新 token 等公开接口
 *
 * @param {string} url - 请求地址
 * @param {object} options - fetch options
 * @returns {Promise<object>} 后端原始响应格式
 */
export async function requestWithoutAuth(url, options = {}) {
  return baseRequest(url, options, { auth: false });
}

/**
 * 统一请求封装（推荐新代码使用）
 * 返回规范化格式 { success, data, message, code }
 * 调用方不需要再判断 res.code === 0，直接判断 res.success
 *
 * @param {string} url - 请求地址
 * @param {object} options - fetch options
 * @param {object} opts - 额外配置 { silent: boolean }
 * @returns {Promise<{success: boolean, data: any, message: string, code: number}>}
 */
export async function request(url, options = {}, opts = {}) {
  const data = await baseRequest(url, options, { auth: true, silent: opts.silent });
  if (data?.code === 0) {
    return {
      success: true,
      data: data.data,
      message: data.message || "",
      code: 0,
    };
  }
  return {
    success: false,
    data: null,
    message: data?.message || "请求失败",
    code: data?.code ?? -1,
  };
}

/**
 * 获取认证头（兼容保留）
 * 现在 fetchWithAuth 内部自动加 token，这个函数主要给需要手动构造请求的场景用
 *
 * @param {boolean} includeContentType - 是否包含 Content-Type
 * @returns {object} 请求头对象
 */
export function getAuthHeaders(includeContentType = true) {
  const globalStore = useGlobalStore();
  const headers = {
    Authorization: `Bearer ${globalStore.access_token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}
