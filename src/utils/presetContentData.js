/**
 * 预设内容数据适配
 * ------------------------------------------------------------------------
 * 供三处使用：
 * 1. 管理端「预设内容」页（PresetContent.vue）—— 维护分类与内容包
 * 2. 客户/管理端「页面编辑」（ModuleMode.vue）—— 选择内容包替换板块素材
 * 3. 组件级预设选择（DataExtractor.vue / PresetPickerDialog.vue）
 *
 * 数据全部来自后端 /api/presets/*，不再内置演示/占位数据。
 * ------------------------------------------------------------------------
 */

import {
  listPresetCategories,
  listPresets,
  resolvePresetMediaUrl,
} from "@/apis/presets";

/* ---------------- 接口数据适配 ---------------- */

function parsePresetContent(content) {
  if (content && typeof content === "object") return content;
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  return {};
}

/** 接口分类 → 页面分类 */
export function mapPresetCategory(item = {}) {
  return {
    key: item.key || "",
    name: item.name || item.key || "未命名分类",
    desc: item.description || "",
  };
}

/** 接口内容包 → 页面内容包 */
export function mapPresetGroup(item = {}) {
  const content = parsePresetContent(item.content);
  return {
    id: item.id,
    category: item.category || "",
    categoryName: item.category_name || "",
    name: item.name || "",
    desc: item.description || "",
    enabled: item.enabled !== false,
    images: Array.isArray(content.images) ? content.images : [],
    texts: Array.isArray(content.texts) ? content.texts : [],
    sort: item.sort ?? 10,
    remark: item.remark || "",
  };
}

/** 页面内容包 → 接口请求体 */
export function toPresetPayload(group = {}) {
  return {
    category: group.category,
    name: String(group.name || "").trim(),
    description: group.desc || "",
    content: {
      texts: (group.texts || [])
        .map((item) => ({
          title: String(item.title || "").trim(),
          content: String(item.content || "").trim(),
        }))
        .filter((item) => item.content),
      images: (group.images || [])
        .map((item) => ({
          name: String(item.name || "").trim(),
          url: String(item.url || "").trim(),
        }))
        .filter((item) => item.url),
    },
    sort: group.sort ?? 10,
    enabled: group.enabled !== false,
    remark: group.remark || "",
  };
}

/**
 * 从预设后端读取分类 + 内容包。
 * 调用方读取失败时仍可使用 loadPresetData() 的内置示例数据兜底。
 */
export async function fetchPresetData() {
  const [categoriesRes, groupsRes] = await Promise.all([
    listPresetCategories(),
    listPresets({ page: 1, page_size: 200 }),
  ]);

  if (categoriesRes?.code !== 0) {
    throw new Error(categoriesRes?.message || "预设分类读取失败");
  }
  if (groupsRes?.code !== 0) {
    throw new Error(groupsRes?.message || "预设内容读取失败");
  }

  const categories = (categoriesRes.data || []).map(mapPresetCategory);
  const groups = (groupsRes.data?.list || []).map(mapPresetGroup);

  // 内容包引用了未知分类时补一个占位分类，避免编辑时选不到
  for (const group of groups) {
    if (!group.category) continue;
    if (!categories.some((item) => item.key === group.category)) {
      categories.push({
        key: group.category,
        name: group.categoryName || group.category,
        desc: "",
      });
    }
  }

  return { categories, groups };
}

/**
 * 读取预设数据（同步空壳）。
 *
 * 预设内容已全部来自后端接口，不再内置占位数据。
 * 同步场景返回空集合，实际数据请用 fetchPresetData() 异步拉取。
 */
export function loadPresetData() {
  return { categories: [], groups: [] };
}

/**
 * 获取预设分类与内容包（返回副本，避免外部误改共享数据）
 * 与 loadPresetData 等价，保留别名兼容调用方语义
 */
export function getPresetData() {
  return loadPresetData();
}

/**
 * 判断一个字段值是否为「图片类型」：
 * - 对象且存在 url 字段（本项目常用 { url, id } 结构）
 * - 字符串且看起来像图片地址
 */
export function isImageFieldValue(value) {
  if (!value) return false;
  if (typeof value === "object" && !Array.isArray(value)) {
    return typeof value.url === "string" && value.url.trim().length > 0;
  }
  if (typeof value === "string") {
    const v = value.trim();
    if (!v) return false;
    if (/^https?:\/\//i.test(v) || /^\/\//i.test(v) || /^data:image\//i.test(v)) {
      return true;
    }
    return /\.(png|jpe?g|gif|webp|svg|avif|bmp)([?#].*)?$/i.test(v);
  }
  return false;
}

/**
 * 用预设图片替换字段值：
 * - 原值是对象（{ url, id }），保留原结构只替换 url/id
 * - 原值是字符串，直接替换为 url 字符串
 */
export function buildImageFieldValue(originalValue, presetImage) {
  const url = resolvePresetMediaUrl(presetImage?.url || "");
  if (typeof originalValue === "object" && originalValue !== null && !Array.isArray(originalValue)) {
    return { ...originalValue, url, id: originalValue.id ?? null };
  }
  return url;
}

/**
 * 字段中文标签（用于预设选择弹窗展示）
 */
const TEXT_FIELD_LABELS = {
  title: "标题", subtitle: "副标题", description: "描述", description_text: "描述",
  content: "内容", editor: "正文", text: "按钮文字", button_text: "按钮文字",
  button_label: "按钮文字", before_text: "前缀文案", highlighted_text: "高亮词",
  ending_number: "数字", suffix: "后缀", percent: "百分比", display_percentage: "显示百分比",
  inner_text: "内部文字", label: "标签", badge_text: "角标",
  sg_content_label: "按钮文字", sg_title_before: "前标题", sg_title_focused: "高亮标题",
  sg_title_after: "后标题", sg_subtitle_heading: "副标题", sg_description: "描述",
  sg_icon_text: "图标文字", sg_icon_description: "图标描述", sg_readmore_button_label: "按钮文字",
  sg_body_title: "标题", sg_body_description: "描述", sg_button_label: "按钮文字",
  sg_member_name: "姓名", sg_member_description: "描述", sg_progress_title: "标题",
  sg_progress_percentage: "百分比", sg_content_number: "数字", sg_content_number_prefix: "数字前缀",
  sg_content_number_suffix: "数字后缀", sg_content_title: "标题", sg_shadow_content: "阴影文字",
  shadow_text_content: "阴影文字",
  ekit_heading_title: "标题", ekit_heading_sub_title: "副标题", ekit_heading_extra_title: "附加标题",
  ekit_icon_box_title_text: "标题", ekit_icon_box_description_text: "描述",
  ekit_icon_box_btn_text: "按钮文字", ekit_icon_box_badge_title: "角标",
  ekit_image_box_title_text: "标题", ekit_image_box_description_text: "描述",
  ekit_image_box_btn_text: "按钮文字", ekit_btn_text: "按钮文字",
  ekit_funfact_number: "数字", ekit_funfact_number_suffix: "数字后缀", ekit_funfact_title_text: "标题",
  ekit_team_name: "姓名", ekit_team_position: "职位", ekit_team_short_description: "简介",
  ekit_progressbar_title: "标题", ekit_progressbar_percentage: "百分比",
  premium_counter_title: "标题", premium_counter_desc: "描述",
  premium_counter_end_value: "数字", premium_counter_suffix: "后缀",
  testimonial_name: "姓名", testimonial_job: "职位", testimonial_content: "评价",
  image: "图片", bg_image: "背景图", background_image: "背景图",
  background_overlay_image: "背景遮罩图", testimonial_image: "头像",
  sg_image_choose: "图片", sg_icon_image: "图标图片",
  ekit_image_box_image: "图片", ekit_icon_box_header_image: "图标图片",
  ekit_team_image: "头像", sg_member_image: "头像",
};

/**
 * 收集单个组件（节点）内可替换的字段：图片 + 文案
 * 过滤：空值 / 数组（多图轮播）/ 数字布尔 / 视频外链
 * @param {string} widgetType 组件类型
 * @param {Object} fields 节点 fields
 * @returns {Array<{key,label,value,isImage,stringValue,preview}>}
 */
export function collectReplaceableFields(widgetType = "", fields = {}) {
  const result = [];
  if (!fields || typeof fields !== "object") return result;
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) continue;
    if (typeof value === "object" && !isImageFieldValue(value)) continue;
    if (typeof value === "number" || typeof value === "boolean") continue;
    const strVal = typeof value === "string" ? value : value?.url || "";
    if (
      /\.(mp4|webm|mov|m3u8)([?#].*)?$/i.test(strVal) ||
      /youtube\.com|youtu\.be|vimeo\.com|wistia\.com/i.test(strVal)
    ) {
      continue;
    }
    result.push({
      key,
      label: presetFieldLabel(widgetType, key),
      value,
      isImage: isImageFieldValue(value),
      stringValue: strVal,
      preview: strVal,
    });
  }
  return result;
}

export function presetFieldLabel(widgetType = "", fieldName = "") {
  const key = String(fieldName || "");
  if (TEXT_FIELD_LABELS[key]) return TEXT_FIELD_LABELS[key];
  const w = String(widgetType || "").replace(/[_-]+/g, " ").trim();
  return w ? w + " · " + key : key;
}
