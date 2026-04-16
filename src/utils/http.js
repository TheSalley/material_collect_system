/**
 * HTTP 请求工具函数（统一从 @/config 导入配置）
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
 * 处理 HTTP 错误状态码
 */
function handleHttpError(status, data) {
  const message = ERROR_MESSAGES[status] || data?.msg || data?.message || "请求失败";

  if (status === 401 || data?.code === 401) {
    const globalStore = useGlobalStore();
    globalStore.clearUser();
    router.push("/login");
    ElMessage.error("登录已过期，请重新登录");
  } else {
    ElMessage.error(message);
  }

  return { success: false, message, data };
}

/**
 * 获取认证头
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

/**
 * 统一请求封装 - 无需认证
 */
export async function requestWithoutAuth(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      const msg = ERROR_MESSAGES[res.status] || data?.msg || data?.message || "请求失败";
      if (res.status === 401 || data?.code === 401) {
        const globalStore = useGlobalStore();
        globalStore.clearUser();
        router.push("/login");
        ElMessage.error("登录已过期，请重新登录");
      } else {
        ElMessage.error(msg);
      }
      return data;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      ElMessage.error("请求超时，请稍后重试");
      return { code: -1, message: "请求超时" };
    }

    console.error("请求错误:", error);
    ElMessage.error(ERROR_MESSAGES.network);
    return { code: -1, message: error.message || ERROR_MESSAGES.network };
  }
}

/**
 * 统一请求封装 - 需要认证
 */
export async function fetchWithAuth(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    // 检查 HTTP 状态码是否成功
    if (!res.ok) {
      const msg = data?.msg || data?.message || `请求失败 (${res.status})`;
      ElMessage.error(msg);
      return { code: res.status, data, message: msg };
    }

    if (res.status === 401 || data?.code === 401) {
      const globalStore = useGlobalStore();
      globalStore.clearUser();
      router.push("/login");
      ElMessage.error("登录已过期，请重新登录");
      return data;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      ElMessage.error("请求超时，请稍后重试");
      throw error;
    }

    console.error("请求错误:", error);
    throw error;
  }
}

/**
 * 统一请求封装（需要认证）- 规范化返回格式
 */
export async function request(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok || data?.code >= 400) {
      return handleHttpError(res.status, data);
    }

    return { success: true, data };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return { success: false, message: "请求超时" };
    }

    console.error("请求错误:", error);
    return { success: false, message: error.message || "网络请求失败" };
  }
}
