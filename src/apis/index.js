// 统一导出所有 API
export * from "./auth";
export * from "./user";
export * from "./site";
export * from "./file";
export * from "./proxy";
export * from "./translate";
export * from "./media";

// 导出请求工具函数（从 @/utils/http 导入）
export {
  config,
  fetchWithAuth,
  getAuthHeaders,
  request,
  requestWithoutAuth,
} from "@/utils/http";
export { getFileFullUrl } from "./file";

// 从 @/config 重新导出全局配置，方便其他地方使用
export {
  APP_VERSION,
  STRICT_IMAGE_DIMENSION_ENABLED,
  API_TIMEOUT,
  API_BASE_URL,
  HTTP_ERROR_MESSAGES,
  languageList,
} from "@/config";
