/**
 * Elementor 数据提取和同步工具
 * 用于从大型 Elementor JSON 中提取核心可编辑数据，并在编辑后同步回原数据
 */

/**
 * 定义各个组件类型需要提取的字段
 */
const EDITABLE_FIELDS_MAP = {
  // Basic 组件
  'button': ['text', 'link', 'size'],
  'heading': ['title'],
  'text-editor': ['editor'],
  'video': ['youtube_url', 'video_type'],
  'image': ['image', 'caption', 'link'],
  
  // General 组件  
  'toggle': ['tabs'],
  'accordion': ['tabs'],
  'counter': ['title', 'ending_number', 'suffix'],
  'icon-list': ['icon_list'],
  
  // Jkit 组件
  'elementskit-icon-box': [
    'ekit_icon_box_title_text', 
    'ekit_icon_box_description_text', 
    'ekit_icon_box_btn_text'
  ],
  'elementskit-image-box': [
    'ekit_image_box_title_text', 
    'ekit_image_box_description_text', 
    'ekit_image_box_btn_text',
    'ekit_image_box_image'
  ],
  
  // 更多 Elementor 基础组件
  'divider': ['style', 'gap'],
  'spacer': ['space'],
  'google_maps': ['address', 'zoom'],
  'icon': ['selected_icon'],
  'image-box': ['title_text', 'description_text'],
  'icon-box': ['title_text', 'description_text'],
  'star-rating': ['rating'],
  'image-carousel': ['carousel'],
  'image-gallery': ['gallery'],
  'testimonial': ['testimonial_content', 'testimonial_name', 'testimonial_job'],
  'tabs': ['tabs'],
  'slides': ['slides'],
  // Pro 组件
  'flip-box': ['title_text_a', 'description_text_a', 'title_text_b', 'description_text_b', 'button_text'],
  'timeline-widget-addon': ['twae_list'],
  'social-icons': ['social_icon_list'],
  'alert': ['alert_title', 'alert_description'],
  'audio': ['source_type'],
  'shortcode': ['shortcode'],
  'html': ['html'],
  'menu-anchor': ['anchor'],
  'sidebar': ['sidebar'],
  'read-more': ['before_text', 'after_text'],
  'progress': ['title', 'percent'],
  'nav-menu': ['menu'],
  'form': ['form_fields'],
};

/**
 * 从 Elementor JSON 中提取核心可编辑数据
 * @param {Array} elementorData - Elementor 完整数据
 * @returns {Object} 提取的轻量级数据结构
 */
export function extractEditableData(elementorData) {
  const editableMap = new Map(); // 使用 Map 存储 ID -> 可编辑数据的映射
  
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
    if (typeof dynamicValue === 'object') {
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
    if (node.settings && Object.prototype.hasOwnProperty.call(node.settings, 'hide_desktop')) {
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
      return value.filter(item => {
        // 如果项是对象，检查是否有 __dynamic__ 属性
        if (typeof item === 'object' && item !== null) {
          // 仅当存在「非空」动态配置时才过滤掉
          return !hasRealDynamic(item.__dynamic__);
        }
        return true;
      });
    }
    
    // 如果是对象，递归清理嵌套的数组
    if (typeof value === 'object' && value !== null) {
      const cleaned = {};
      for (const key in value) {
        if (key === '__dynamic__') {
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
    
    const widgetType = node.widgetType;
    const editableFields = EDITABLE_FIELDS_MAP[widgetType];
    
    // 如果这个组件类型有可编辑字段
    if (editableFields && node.settings) {
      const editableData = {
        id: node.id,
        widgetType: widgetType,
        elType: node.elType,
        fields: {}
      };
      
      // 提取可编辑字段
      editableFields.forEach(field => {
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

    // 特殊处理：列（column）/ 区块（section）的背景图，复用 image 编辑组件
    if (
      !widgetType &&                      // 非 widget 组件（section/column）
      (node.elType === 'column' || node.elType === 'section') &&
      node.settings &&
      !node.settings.hide_desktop &&      // 如果有 hide_desktop，则整体不展示
      node.settings.background_background === 'classic' &&
      node.settings.background_image
    ) {
      // 避免覆盖前面已提取的数据
      if (!editableMap.has(node.id)) {
        editableMap.set(node.id, {
          id: node.id,
          widgetType: 'image',           // 让 DataExtractor 复用 image 编辑组件
          elType: node.elType,
          fields: {
            image: cleanFieldValue(node.settings.background_image),
          },
        });
      }
    }
    
    // 递归处理子元素
    if (node.elements && Array.isArray(node.elements)) {
      node.elements.forEach(child => extractNode(child));
    }
  }
  
  // 处理顶层数组
  if (Array.isArray(elementorData)) {
    elementorData.forEach(part => {
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

      // 特殊处理：列（column）/ 区块（section）的背景图，使用 image 编辑组件写回 background_image
      if (
        !node.widgetType &&
        (node.elType === 'column' || node.elType === 'section') &&
        editableData.widgetType === 'image' &&
        editableData.fields?.image
      ) {
        if (!node.settings) {
          node.settings = {};
        }
        node.settings.background_image = editableData.fields.image;
      } else {
        // 通用路径：直接按字段名写回 settings
        if (!node.settings) {
          node.settings = {};
        }
        Object.keys(editableData.fields).forEach(field => {
          node.settings[field] = editableData.fields[field];
        });
      }
    }
    
    // 递归处理子元素
    if (node.elements && Array.isArray(node.elements)) {
      node.elements.forEach(child => updateNode(child));
    }
  }
  
  // 处理顶层数组
  if (Array.isArray(clonedData)) {
    clonedData.forEach(part => {
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
