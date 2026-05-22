const APP_VERSION = "0.1.25";

/** 是否启用严格尺寸限制：开启后，选图后确定的尺寸即为唯一允许上传的尺寸 */
const STRICT_IMAGE_DIMENSION_ENABLED = false;

/** API 请求超时时间（毫秒） */
const API_TIMEOUT = 30000;

/** API 基础地址：开发环境用测试服务器，生产环境用相对路径（/fe 由 nginx 重写转发到 127.0.0.1:3501） */
const API_BASE_URL = import.meta.env.MODE === "development" ? "https://apitest.yhct.site" : "/fe";

/**
 * HTTP 错误状态码对应的中文提示信息
 */
const HTTP_ERROR_MESSAGES = {
  401: "登录已过期，请重新登录",
  403: "没有权限访问该资源",
  404: "请求的资源不存在",
  500: "服务器内部错误，请稍后重试",
  502: "网关错误，请稍后重试",
  503: "服务暂时不可用，请稍后重试",
  network: "网络连接失败，请检查网络",
};

const languageList = [
    { label: "中文", value: "zh" },
    { label: "英语", value: "en" },
    { label: "俄语", value: "ru" },
    { label: "法语", value: "fr" },
    { label: "德语", value: "de" },
    { label: "意大利语", value: "it" },
    { label: "西班牙语", value: "es" },
    { label: "葡萄牙语", value: "pt" },
    { label: "阿拉伯语", value: "ar" },
    { label: "日语", value: "ja" },
    { label: "韩语", value: "ko" },
];

export {
  APP_VERSION,
  STRICT_IMAGE_DIMENSION_ENABLED,
  API_TIMEOUT,
  API_BASE_URL,
  HTTP_ERROR_MESSAGES,
  languageList,
};
