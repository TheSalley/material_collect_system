/**
 * 预设内容数据（静态演示）
 * ------------------------------------------------------------------------
 * 供两处使用：
 * 1. 管理端「预设内容」页（PresetContent.vue）—— 维护分类与内容包
 * 2. 客户/管理端「页面编辑」（ModuleMode.vue）—— 选择内容包替换板块素材
 *
 * 说明：当前为静态演示数据；接入真实后端后，改为从接口加载同一份数据，
 *      保证「预设内容页维护的内容」与「页面编辑时可选的内容」一致。
 * ------------------------------------------------------------------------
 */

// 行业分类：{ key, name, desc }
export const INITIAL_CATEGORIES = [
  { key: "energy", name: "新能源", desc: "光伏、储能、充电桩、电池等新能源场景" },
  { key: "home", name: "家居行业", desc: "家具、家电、全屋定制等家居场景" },
  { key: "robot", name: "智能机器人", desc: "工业机器人、服务机器人、AGV 等" },
  { key: "industry", name: "工业", desc: "装备制造、电气、自动化等工业场景" },
  { key: "common", name: "通用", desc: "不区分行业的通用素材，各客户端都能用" },
];

// 内容包：{ id, category, name, desc, enabled, images, texts }
export const INITIAL_PRESET_GROUPS = [
  {
    id: 1,
    category: "energy",
    name: "光伏电站",
    desc: "光伏项目业主的首页主视觉与开场文案",
    enabled: true,
    images: [
      { url: "https://picsum.photos/seed/solar1/640/400", name: "光伏电站航拍" },
      { url: "https://picsum.photos/seed/solar2/640/400", name: "逆变器特写" },
    ],
    texts: [
      { title: "品牌主张", content: "阳光入网，收益看得见" },
      { title: "副标题", content: "单站日发电 1200 度起" },
    ],
  },
  {
    id: 2,
    category: "energy",
    name: "储能系统",
    desc: "工商业储能的卖点图与方案文案",
    enabled: true,
    images: [
      { url: "https://picsum.photos/seed/battery1/640/400", name: "储能柜外观" },
    ],
    texts: [
      { title: "卖点一", content: "峰谷价差套利，回本周期 3.2 年" },
      { title: "卖点二", content: "循环寿命 6000 次不衰减" },
    ],
  },
  {
    id: 3,
    category: "home",
    name: "全屋定制",
    desc: "全屋定制门店的样板间图片与话术",
    enabled: true,
    images: [
      { url: "https://picsum.photos/seed/kitchen1/640/400", name: "厨房样板间" },
      { url: "https://picsum.photos/seed/wardrobe1/640/400", name: "衣帽间" },
    ],
    texts: [
      { title: "主推", content: "28 天交付，甲醛低于国标" },
      { title: "工艺", content: "一门到顶，五金质保 10 年" },
    ],
  },
  {
    id: 4,
    category: "home",
    name: "智能家居",
    desc: "全屋智能的场景联动演示素材",
    enabled: false,
    images: [
      { url: "https://picsum.photos/seed/smarthome1/640/400", name: "智能客厅" },
    ],
    texts: [
      { title: "场景", content: "离家一键，灯、锁、空调全关" },
    ],
  },
  {
    id: 5,
    category: "robot",
    name: "协作机器人",
    desc: "六轴协作机械臂的应用案例素材",
    enabled: true,
    images: [
      { url: "https://picsum.photos/seed/cobot1/640/400", name: "产线装配" },
    ],
    texts: [
      { title: "参数", content: "负载 12kg，重复精度 ±0.02mm" },
      { title: "价值", content: "换产线 15 分钟，人机共线安全" },
    ],
  },
  {
    id: 6,
    category: "robot",
    name: "AGV 搬运",
    desc: "仓储物流 AGV 的调度与案例文案",
    enabled: true,
    images: [],
    texts: [
      { title: "效率", content: "单台日搬运 800 托，误差 ±5mm" },
      { title: "调度", content: "20 台同时跑，不堵车不打架" },
    ],
  },
  {
    id: 7,
    category: "industry",
    name: "数控机床",
    desc: "机床企业的产品宣传与展会素材",
    enabled: true,
    images: [
      { url: "https://picsum.photos/seed/cnc1/640/400", name: "五轴加工中心" },
      { url: "https://picsum.photos/seed/cnc2/640/400", name: "车间实拍" },
    ],
    texts: [
      { title: "精度", content: "定位精度 0.005mm，24 小时连续加工" },
      { title: "售后", content: "全国 72 个服务网点，24 小时响应" },
    ],
  },
  {
    id: 8,
    category: "industry",
    name: "工厂数字化",
    desc: "MES 与产线大屏的演示素材",
    enabled: false,
    images: [],
    texts: [
      { title: "效果", content: "订单准交率从 78% 提到 96%" },
    ],
  },
  {
    id: 9,
    category: "common",
    name: "通用首页",
    desc: "不区分行业的通用首页主视觉",
    enabled: true,
    images: [
      { url: "https://picsum.photos/seed/home1/640/400", name: "主视觉背景" },
    ],
    texts: [
      { title: "主张", content: "把复杂留给我们，把简单交给你" },
    ],
  },
];

/**
 * 本地存储键：管理端「预设内容」保存后写入，页面编辑读取同一份数据。
 * 接入真实后端后，把 loadPresetData / savePresetData / clearPresetData
 * 替换为接口调用即可，调用方无需改动。
 */
export const PRESET_STORAGE_KEY = "preset_content_data_v1";

export function getInitialPresetData() {
  return {
    categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES)),
    groups: JSON.parse(JSON.stringify(INITIAL_PRESET_GROUPS)),
  };
}

/**
 * 读取预设数据：优先取本地保存（管理页维护），否则返回初始演示数据
 */
export function loadPresetData() {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.groups)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("[presetContentData] 读取本地预设数据失败:", e);
  }
  return getInitialPresetData();
}

/**
 * 保存预设数据（管理端「预设内容」页保存时调用）
 */
export function savePresetData(data) {
  try {
    localStorage.setItem(
      PRESET_STORAGE_KEY,
      JSON.stringify({
        categories: data?.categories || [],
        groups: data?.groups || [],
      })
    );
    return true;
  } catch (e) {
    console.warn("[presetContentData] 保存本地预设数据失败:", e);
    return false;
  }
}

/**
 * 清除本地预设数据（恢复演示数据时调用）
 */
export function clearPresetData() {
  try {
    localStorage.removeItem(PRESET_STORAGE_KEY);
  } catch (e) {
    console.warn("[presetContentData] 清除本地预设数据失败:", e);
  }
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
  const url = presetImage?.url || "";
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
