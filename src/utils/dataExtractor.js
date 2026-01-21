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
   * 递归提取节点数据
   */
  function extractNode(node) {
    if (!node || !node.id) return;
    
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
          editableData.fields[field] = node.settings[field];
        }
      });
      
      // 只保存有实际数据的节点
      if (Object.keys(editableData.fields).length > 0) {
        editableMap.set(node.id, editableData);
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
      if (part.elements) {
        part.elements.forEach(element => extractNode(element));
      }
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
      
      // 更新节点的 settings
      if (!node.settings) {
        node.settings = {};
      }
      
      // 将编辑的字段同步回原数据
      Object.keys(editableData.fields).forEach(field => {
        node.settings[field] = editableData.fields[field];
      });
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
      if (part.elements) {
        part.elements.forEach(element => updateNode(element));
      }
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
