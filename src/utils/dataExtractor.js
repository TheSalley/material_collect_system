/**
 * 定义各个组件类型需要提取的字段
 */
const EDITABLE_FIELDS_MAP = {
  // Basic 组件
  "heading": ["title"],
  "text-editor": ["editor"],
  "button": ["text"],
  "image": ["image"],
  "video": ["youtube_url"],
  "divider": ["text", "look"],
  // General 组件
  "icon-box": ["title_text", "description_text"],
  "icon-list": ["icon_list"],
  "counter": ["title", "ending_number", "suffix"],
  "image-box": ["image", "title_text", "description_text"],
  "image-carousel": ["carousel"],
  "accordion": ["tabs"],
  "toggle": ["tabs"],
  "testimonial": ["testimonial_image", "testimonial_name", "testimonial_job", "testimonial_content",],
  "tabs": ["tabs"],
  "image-gallery": ["wp_gallery"],
  "progress": ["title", "inner_text", "display_percentage", "percent"],
  // Pro 组件
  "slides": ["slides"],
  "gallery": ["gallery"],
  "animated-headline": ["before_text", "highlighted_text"],
  "hotspot": ["image", "hotspot"],
  "flip-box": ["title_text_a", "description_text_a", "title_text_b", "description_text_b", "button_text"],
  "call-to-action": [ "bg_image", "title", "description", "button",],
  "testimonial-carousel": ["slides"],
  "reviews": ["slides"],
  // JegElementorKit 组件
  "jkit_heading": ["sg_title_before", "sg_title_focused", "sg_title_after", "sg_subtitle_enable", "sg_subtitle_heading", "sg_description_enable", "sg_description", "sg_shadow_enable", "sg_shadow_content"],
  "jkit_button": ["sg_content_label"],
  "jkit_video_button": ["sg_video_url"],
  "jkit_icon_box": ["sg_icon_text", "sg_icon_description", "sg_readmore_enable_button", "sg_readmore_button_label", "sg_badge_show", "sg_badge_text", "sg_icon_type", "sg_icon_image"],
  "jkit_image_box": ["sg_image_choose", "sg_body_title", "sg_body_description", "sg_button_enable", "sg_button_label"],
  "jkit_fun_fact": ["sg_content_number_prefix", "sg_content_number", "sg_content_number_suffix", "sg_content_title", "sg_icon_type", "sg_icon_image"],
  "jkit_progress_bar": ["sg_progress_title", "sg_progress_percentage"],
  "jkit_client_logo": ["sg_logo_list"],
  "jkit_testimonials": ["sg_testimonials_list"],
  "jkit_accordion": ["sg_accordion_list"],
  "jkit_gallery": ["sg_filter_list", "sg_gallery_list"],
  "jkit_team": ["sg_member_image", "sg_member_name", "sg_member_show_description", "sg_member_description"],
  "jkit_portfolio_gallery": ["sg_gallery_list"],
  "jkit_feature_list": ["sg_setting_list"],
  // ElementsKit 组件
  "elementskit-image-accordion": ["ekit_img_accordion_items"],
  "elementskit-accordion": ["ekit_accordion_items"],
  "elementskit-button": ["ekit_btn_text"],
  "elementskit-heading": ["ekit_heading_title", "ekit_heading_sub_title_show", "ekit_heading_sub_title", "ekit_heading_section_extra_title_show", "ekit_heading_extra_title", "show_shadow_text", "shadow_text_content"],
  "elementskit-icon-box": ["ekit_icon_box_enable_header_icon", "ekit_icon_box_header_image", "ekit_icon_box_title_text", "ekit_icon_box_description_text", "ekit_icon_box_enable_btn", "ekit_icon_box_btn_text", "ekit_icon_box_badge_control", "ekit_icon_box_badge_title"],
  "elementskit-image-box": [ "ekit_image_box_image", "ekit_image_box_title_text", "ekit_image_box_description_text", "ekit_image_box_enable_btn", "ekit_image_box_btn_text",],
  "elementskit-client-logo": ["ekit_client_logo_repiter"],
  "elementskit-faq": ["ekit_faq_content_items"],
  "elementskit-funfact": ["ekit_funfact_number", "ekit_funfact_number_suffix", "ekit_funfact_title_text",],
  "elementskit-testimonial": ["ekit_testimonial_data"],
  "elementskit-team": ["ekit_team_image", "ekit_team_name", "ekit_team_position", "ekit_team_show_short_description", "ekit_team_short_description"],
  "elementskit-progressbar": ["ekit_progressbar_title", "ekit_progressbar_percentage", "ekit_progressbar_percentage_show"],
  // Essential Addons
  "eael-feature-list": ["eael_feature_list"],
  // Premium Addons
  "premium-counter": ["premium_counter_title", "premium_counter_desc", "premium_counter_end_value", "premium_counter_suffix"],
  // Other 组件
  "timeline-widget-addon": ["twae_list"],

  // 上方为已适配
};

/**
 * 从 Elementor JSON 中提取核心可编辑数据
 * @param {Array} elementorData - Elementor 完整数据
 * @returns {Object} 提取的轻量级数据结构
 */
export function extractEditableData(elementorData) {
  const editableMap = new Map(); // 使用 Map 存储 ID -> 可编辑数据的映射

  const DEFAULT_TEXT_EDITOR_HTML =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.";

  /**
   * 判断 __dynamic__ 是否包含实际动态配置
   * - 空数组 / 空对象视为「没有动态配置」
   */
  function hasRealDynamic(dynamicValue) {
    if (!dynamicValue) return false;

    // 空数组
    if (Array.isArray(dynamicValue)) {
      return dynamicValue.length > 0;
    }

    // 空对象
    if (typeof dynamicValue === "object") {
      return Object.keys(dynamicValue).length > 0;
    }

    // 其他类型（字符串等）只要有值就认为有动态配置
    return true;
  }

  /**
   * 检查节点是否应该被跳过处理
   * 1. 有 hide_desktop 属性的节点
   * 2. 有 __dynamic__ 属性的节点
   */
  function shouldSkipNode(node) {
    if (!node) return false;

    // 检查 settings 中的 hide_desktop
    // 只要存在该属性（无论值为何），都视为「不参与编辑」
    if (
      node.settings &&
      Object.prototype.hasOwnProperty.call(node.settings, "hide_desktop")
    ) {
      return true;
    }

    // 检查节点或 settings 中的 __dynamic__，仅当存在「实际动态配置」时才跳过
    const nodeDynamic = node?.__dynamic__;
    const settingsDynamic = node.settings?.__dynamic__;
    if (hasRealDynamic(nodeDynamic) || hasRealDynamic(settingsDynamic)) {
      return true;
    }

    return false;
  }

  /**
   * 清理字段值，移除带有 __dynamic__ 的数组项
   * @param {any} value - 字段值
   * @returns {any} 清理后的值
   */
  function cleanFieldValue(value) {
    if (!value) return value;

    // 如果是数组，过滤掉带有 __dynamic__ 的项
    if (Array.isArray(value)) {
      return value.filter((item) => {
        // 如果项是对象，检查是否有 __dynamic__ 属性
        if (typeof item === "object" && item !== null) {
          // 仅当存在「非空」动态配置时才过滤掉
          return !hasRealDynamic(item.__dynamic__);
        }
        return true;
      });
    }

    // 如果是对象，递归清理嵌套的数组
    if (typeof value === "object" && value !== null) {
      const cleaned = {};
      for (const key in value) {
        if (key === "__dynamic__") {
          // 跳过 __dynamic__ 键本身
          continue;
        }
        cleaned[key] = cleanFieldValue(value[key]);
      }
      return cleaned;
    }

    return value;
  }

  /**
   * 递归提取节点数据
   */
  function extractNode(node) {
    if (!node || !node.id) return;

    // 如果节点应该被跳过（有 hide_desktop 或 __dynamic__ 属性），跳过整个子树
    if (shouldSkipNode(node)) {
      return;
    }

    // 兼容异常数据：有些节点 settings 竟然是 []，必须转为对象，否则写入不会被 JSON 序列化
    if (node.settings && Array.isArray(node.settings)) {
      node.settings = {};
    }

    const widgetType = node.widgetType;
    const editableFields = EDITABLE_FIELDS_MAP[widgetType];

    // text-editor：settings.editor 不存在时填充默认文案，确保编辑器有内容可编辑/保存
    if (
      widgetType === "text-editor" &&
      node.settings &&
      !Object.prototype.hasOwnProperty.call(node.settings, "editor")
    ) {
      node.settings.editor = DEFAULT_TEXT_EDITOR_HTML;
    }

    if (
      widgetType === "counter" &&
      node.settings &&
      !Object.prototype.hasOwnProperty.call(node.settings, "ending_number")
    ) {
      node.settings.ending_number = 100;
    }

    // call-to-action（Elementor Pro）：补全文案与 bg_image（媒体库结构）
    if (
      widgetType === "call-to-action" &&
      node.settings &&
      typeof node.settings === "object" &&
      !Array.isArray(node.settings)
    ) {
      for (const key of ["title", "description", "button"]) {
        if (node.settings[key] === undefined) {
          node.settings[key] = "";
        }
      }
      const bg = node.settings.bg_image;
      if (!bg || typeof bg !== "object" || Array.isArray(bg)) {
        node.settings.bg_image = {
          url: "",
          id: "",
          size: "",
          alt: "",
          source: "library",
        };
      } else {
        if (bg.url === undefined) bg.url = "";
        if (bg.id === undefined) bg.id = "";
        if (bg.size === undefined) bg.size = "";
        if (bg.alt === undefined) bg.alt = "";
        if (bg.source === undefined) bg.source = "library";
      }
    }

    // 如果这个组件类型有可编辑字段
    if (editableFields && node.settings) {
      const editableData = {
        id: node.id,
        widgetType: widgetType,
        elType: node.elType,
        fields: {},
      };

      // 提取可编辑字段
      editableFields.forEach((field) => {
        if (node.settings[field] !== undefined) {
          // 清理字段值，移除带有 __dynamic__ 的数组项
          editableData.fields[field] = cleanFieldValue(node.settings[field]);
        }
      });

      // 只保存有实际数据的节点
      if (Object.keys(editableData.fields).length > 0) {
        editableMap.set(node.id, editableData);
      }
    }

    // 列 / 区块 / 容器：经典背景图 → 独立 Field
    const isLayoutBgNode =
      !widgetType &&
      (node.elType === "column" ||
        node.elType === "section" ||
        node.elType === "container");
    if (
      isLayoutBgNode &&
      node.settings &&
      !node.settings.hide_desktop &&
      (node.settings.background_background === "classic" ||
        node.settings.background_background === "slideshow")
    ) {
      if (!editableMap.has(node.id)) {
        const backgroundType = node.settings.background_background;
        const bg = node.settings.background_image;
        const bgUrl =
          typeof bg === "string"
            ? bg.trim()
            : bg && typeof bg === "object"
              ? String(bg.url || "").trim()
              : "";
        const ov = node.settings.background_overlay_image;
        const overlayIsClassic =
          node.settings.background_overlay_background === "classic";
        const ovUrl = overlayIsClassic
          ? typeof ov === "string"
            ? ov.trim()
            : ov && typeof ov === "object"
              ? String(ov.url || "").trim()
              : ""
          : "";

        // 仅当有有效值时才记录该字段，透传原始值不做任何修改
        const fields = {};
        if (backgroundType === "classic" && bgUrl) {
          fields.background_image = bg;
        }
        if (overlayIsClassic && ovUrl) fields.background_overlay_image = ov;
        if (backgroundType === "slideshow") {
          const slideshowGallery = cleanFieldValue(
            node.settings.background_slideshow_gallery
          );
          if (
            Array.isArray(slideshowGallery) &&
            slideshowGallery.length > 0
          ) {
            fields.background_slideshow_gallery = slideshowGallery;
          }
        }

        if (Object.keys(fields).length > 0) {
          editableMap.set(node.id, {
            id: node.id,
            widgetType: "section-background-image",
            elType: node.elType,
            fields,
          });
        }
      }
    }

    // 递归处理子元素
    if (node.elements && Array.isArray(node.elements)) {
      node.elements.forEach((child) => extractNode(child));
    }
  }

  // 处理顶层数组
  if (Array.isArray(elementorData)) {
    elementorData.forEach((part) => {
      extractNode(part);
    });
  }

  return editableMap;
}

/**
 * 将编辑后的数据同步回原始 Elementor JSON
 * @param {Array} originalData - 原始 Elementor 数据
 * @param {Map} editableMap - 编辑后的数据 Map
 * @returns {Array} 更新后的 Elementor 数据
 */
export function syncDataToOriginal(originalData, editableMap) {
  // 深拷贝原始数据以避免直接修改
  const clonedData = JSON.parse(JSON.stringify(originalData));

  /**
   * 递归查找并更新节点
   */
  function updateNode(node) {
    if (!node || !node.id) return;

    // 如果这个节点有编辑数据
    if (editableMap.has(node.id)) {
      const editableData = editableMap.get(node.id);

      if (!node.settings) {
        node.settings = {};
      }
      Object.keys(editableData.fields).forEach((field) => {
        node.settings[field] = editableData.fields[field];
      });
    }

    // 递归处理子元素
    if (node.elements && Array.isArray(node.elements)) {
      node.elements.forEach((child) => updateNode(child));
    }
  }

  // 处理顶层数组
  if (Array.isArray(clonedData)) {
    clonedData.forEach((part) => {
      updateNode(part);
    });
  }

  return clonedData;
}

/**
 * 更新单个字段
 * @param {Map} editableMap - 可编辑数据 Map
 * @param {String} nodeId - 节点 ID
 * @param {String} fieldName - 字段名
 * @param {any} value - 新值
 */
export function updateField(editableMap, nodeId, fieldName, value) {
  if (editableMap.has(nodeId)) {
    const nodeData = editableMap.get(nodeId);
    nodeData.fields[fieldName] = value;
  } else {
    console.warn(`节点 ${nodeId} 不存在于可编辑数据中`);
  }
}

/**
 * 获取节点的可编辑数据
 * @param {Map} editableMap - 可编辑数据 Map
 * @param {String} nodeId - 节点 ID
 * @returns {Object|null} 节点的可编辑数据
 */
export function getNodeData(editableMap, nodeId) {
  return editableMap.get(nodeId) || null;
}

/**
 * 将 Map 转换为普通对象（用于查看和调试）
 * @param {Map} editableMap - 可编辑数据 Map
 * @returns {Object} 普通对象
 */
export function mapToObject(editableMap) {
  const obj = {};
  editableMap.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}
