// ============================================================
// 应用配置
// ============================================================

// 应用版本号：用于页面底部展示，建议与 package.json 保持一致
const APP_VERSION = "0.1.6";

// ============================================================
// 图片上传功能开关
// 所有开关默认为 false（关闭），按需启用。
// ============================================================

/** 是否启用严格尺寸限制：开启后，选图后确定的尺寸即为唯一允许上传的尺寸 */
const STRICT_IMAGE_DIMENSION_ENABLED = false;


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

export { APP_VERSION, STRICT_IMAGE_DIMENSION_ENABLED, languageList };
