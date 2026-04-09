import { useGlobalStore } from "@/stores/global";
import router from "@/router";
import { ElMessage } from "element-plus";

export const config = {
  baseUrl: "https://apitest.yhct.site",
  // baseUrl: "http://127.0.0.1:3501",
  // 默认超时时间（毫秒）
  timeout: 30000,
};

/**
 * 统一错误响应码提示
 */
const ERROR_MESSAGES = {
  401: "登录已过期，请重新登录",
  403: "没有权限访问该资源",
  404: "请求的资源不存在",
  500: "服务器内部错误，请稍后重试",
  502: "网关错误，请稍后重试",
  503: "服务暂时不可用，请稍后重试",
  network: "网络连接失败，请检查网络",
};

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
 * 统一请求封装 - 无需认证
 * @param {string} url - 请求地址
 * @param {RequestInit} options - fetch 选项
 * @returns {Promise<any>} 响应数据（保持原有返回格式）
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
 * 统一请求封装 - 需要认证
 * @param {string} url - 请求地址
 * @param {RequestInit} options - fetch 选项
 * @returns {Promise<any>} 响应数据
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

    // 401 未授权
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
 * @param {string} url - 请求地址
 * @param {RequestInit} options - fetch 选项
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
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