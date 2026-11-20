/**
 * ModuleMode 纯工具函数
 * 无状态、无副作用，可独立测试
 */
import { buildUrlMatchTokens, hasSafeContainsMatch, hasTokenIntersection } from "./imageBlacklist.js";

/**
 * 板块隐藏标记：隐藏时写入 settings._title 的值
 */
export const HIDDEN_PART_TITLE = "客户隐藏组件";

/**
 * 判断板块是否处于隐藏状态
 */
export function isPartHidden(part) {
  return part?.settings?._title === HIDDEN_PART_TITLE;
}

/**
 * 生成模块图片的 key
 */
export function moduleImageKey(id) {
  return id == null ? "" : String(id);
}

/**
 * 规范化 URL 字符串（去空格）
 */
export function normalizeComparableUrl(value) {
  return String(value || "").trim();
}

/**
 * 构建尺寸配置的 key（moduleId + imageUrl）
 */
export function buildSizeConfigKey(moduleId, imageUrl = "") {
  const key = String(moduleId || "").trim();
  if (!key) return "";

  const normalizedImageUrl = normalizeComparableUrl(imageUrl);
  if (!normalizedImageUrl) return key;

  return `${key}::${encodeURIComponent(normalizedImageUrl)}`;
}

/**
 * 解析尺寸配置的 key
 */
export function parseSizeConfigKey(key = "") {
  const raw = String(key || "").trim();
  if (!raw) {
    return { moduleId: "", imageUrl: "" };
  }

  const separatorIndex = raw.indexOf("::");
  if (separatorIndex < 0) {
    return { moduleId: raw, imageUrl: "" };
  }

  const moduleId = raw.slice(0, separatorIndex).trim();
  const encodedImageUrl = raw.slice(separatorIndex + 2).trim();

  if (!encodedImageUrl) {
    return { moduleId, imageUrl: "" };
  }

  try {
    return { moduleId, imageUrl: decodeURIComponent(encodedImageUrl) };
  } catch {
    return { moduleId, imageUrl: encodedImageUrl };
  }
}

/**
 * 从尺寸信息中提取记录 key
 */
export function getSizeRecordKey(sizeInfo = {}, fallbackModuleId = "", fallbackImageUrl = "") {
  const moduleId = String(sizeInfo?.module_id || fallbackModuleId || "").trim();
  if (!moduleId) return "";

  const imageUrl = normalizeComparableUrl(
    sizeInfo?.image_url || fallbackImageUrl || sizeInfo?.url || sizeInfo?.file_url || sizeInfo?.imageUrl
  );
  return buildSizeConfigKey(moduleId, imageUrl);
}

/**
 * 从尺寸 map 中获取记录（支持精确 key 和旧版 legacy key）
 */
export function getSizeRecord(sizeMap = {}, moduleId = "", imageUrl = "") {
  const exactKey = buildSizeConfigKey(moduleId, imageUrl);
  const legacyKey = String(moduleId || "").trim();

  if (exactKey && sizeMap?.[exactKey]) {
    return { key: exactKey, value: sizeMap[exactKey] };
  }

  if (legacyKey && sizeMap?.[legacyKey]) {
    return { key: legacyKey, value: sizeMap[legacyKey] };
  }

  return { key: exactKey || legacyKey, value: null };
}

/**
 * 规范化 Demo 尺寸记录（支持字符串、数组、对象）
 */
export function normalizeDemoSizeRecords(value) {
  let raw = value;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw).flatMap(([key, item]) => {
      if (Array.isArray(item)) {
        return item;
      }

      if (item && typeof item === "object") {
        if (!item.module_id && key) {
          return [{ ...item, module_id: key }];
        }
        return [item];
      }

      return [];
    });
  }

  return [];
}

/**
 * 从尺寸信息中提取图片 URL 候选
 */
export function extractSizeImageCandidate(sizeInfo = {}) {
  const candidates = [sizeInfo?.image_url, sizeInfo?.url, sizeInfo?.file_url, sizeInfo?.imageUrl];

  for (const candidate of candidates) {
    const url = normalizeComparableUrl(candidate);
    if (url) return url;
  }

  return "";
}

/**
 * 判断两个图片来源是否相同（支持 URL token 比较）
 */
export function isSameImageSource(sourceA = "", sourceB = "") {
  const a = normalizeComparableUrl(sourceA);
  const b = normalizeComparableUrl(sourceB);
  if (!a || !b) return false;
  if (a === b) return true;

  const aTokens = buildUrlMatchTokens(a);
  const bTokens = buildUrlMatchTokens(b);
  if (aTokens.length === 0 || bTokens.length === 0) return false;

  return hasTokenIntersection(aTokens, bTokens) || hasSafeContainsMatch(aTokens, bTokens);
}

/**
 * 替换尺寸记录（按 key）
 */
export function replaceSizeRecordByKey(sizeList = [], nextSize) {
  const targetKey = getSizeRecordKey(nextSize);
  const targetId = String(nextSize?.module_id || "").trim();
  const targetImageUrl = normalizeComparableUrl(nextSize?.image_url || "");

  const filtered = Array.isArray(sizeList)
    ? sizeList.filter((item) => {
        const itemKey = getSizeRecordKey(item);
        if (targetKey && itemKey === targetKey) return false;
        if (targetImageUrl && String(item?.module_id || "").trim() === targetId && normalizeComparableUrl(item?.image_url || "") === targetImageUrl) {
          return false;
        }
        return targetImageUrl ? true : String(item?.module_id || "").trim() !== targetId;
      })
    : [];

  if (nextSize) {
    filtered.push(nextSize);
  }

  return filtered;
}

/**
 * 替换 Demo 图片记录（按 moduleId）
 */
export function replaceDemoImageRecordByModuleId(imageList = [], nextImage, partIndex = null) {
  const targetId = String(nextImage?.module_id || "");
  const filtered = Array.isArray(imageList)
    ? imageList.filter((item, index) => {
        if (String(item?.module_id || "") === targetId) return false;
        if ((!item?.module_id || String(item?.module_id || "") === "") && partIndex != null && index === partIndex) {
          return false;
        }
        return true;
      })
    : [];

  if (nextImage) {
    filtered.push(nextImage);
  }

  return filtered;
}

/**
 * 移除 Demo 图片记录（按 moduleId）
 */
export function removeDemoImageRecordByModuleId(imageList = [], moduleId, partIndex = null) {
  const targetId = String(moduleId || "");
  if (!targetId) return Array.isArray(imageList) ? [...imageList] : [];

  return Array.isArray(imageList)
    ? imageList.filter((item, index) => {
        if (String(item?.module_id || "") === targetId) return false;
        if ((!item?.module_id || String(item?.module_id || "") === "") && partIndex != null && index === partIndex) {
          return false;
        }
        return true;
      })
    : [];
}

/**
 * 移除尺寸记录（按 moduleId）
 */
export function removeSizeRecordByModuleId(sizeList = [], moduleId) {
  const targetId = String(moduleId || "").trim();
  if (!targetId) return Array.isArray(sizeList) ? [...sizeList] : [];

  return Array.isArray(sizeList)
    ? sizeList.filter((item) => String(item?.module_id || "").trim() !== targetId)
    : [];
}

/**
 * 移除尺寸记录（按 key）
 */
export function removeSizeRecordByKey(sizeList = [], moduleId, imageUrl = "") {
  const targetId = String(moduleId || "").trim();
  const targetImageUrl = normalizeComparableUrl(imageUrl);
  if (!targetId) return Array.isArray(sizeList) ? [...sizeList] : [];

  const targetKey = buildSizeConfigKey(targetId, targetImageUrl);
  return Array.isArray(sizeList)
    ? sizeList.filter((item) => {
        const itemModuleId = String(item?.module_id || "").trim();
        const itemImageUrl = normalizeComparableUrl(item?.image_url || "");
        const itemKey = buildSizeConfigKey(itemModuleId, itemImageUrl);
        if (itemKey && targetKey && itemKey === targetKey) return false;
        if (targetImageUrl) {
          return !(itemModuleId === targetId && itemImageUrl === targetImageUrl);
        }
        return itemModuleId !== targetId;
      })
    : [];
}

/**
 * 从页面数据中收集「图片字段」清单，用于按图片 URL 匹配尺寸。
 *
 * editor-section 里的每个图片组件（ImageWp）读取的是它所在节点 fields 里的图片 url，
 * 而尺寸配置 key = buildSizeConfigKey(顶层板块id, 图片url)。本函数遍历：
 *   顶层板块(originData 数组元素) → 递归子树 → 在 editableMap 命中节点 → 扫 fields
 * 收集每个图片字段的 { sectionId, nodeId, imageUrl }。
 *
 * @param {Array} originData - 顶层板块数组（normalizeElementorRoots 的结果）
 * @param {Map} editableMap - extractEditableData 生成的节点映射
 * @returns {Array<{sectionId:string, nodeId:string, imageUrl:string}>}
 */
export function collectImageFields(originData = [], editableMap = null) {
  const result = [];
  if (!Array.isArray(originData) || !editableMap) return result;

  const isImageLikeValue = (v) => v && typeof v === "object" && typeof v.url === "string";

  function pushUrlsFromFields(sectionId, nodeId, fields) {
    if (!fields || typeof fields !== "object") return;
    for (const key of Object.keys(fields)) {
      const value = fields[key];
      if (isImageLikeValue(value)) {
        const url = normalizeComparableUrl(value.url);
        if (url) result.push({ sectionId, nodeId, imageUrl: url });
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (isImageLikeValue(item)) {
            const url = normalizeComparableUrl(item.url);
            if (url) result.push({ sectionId, nodeId, imageUrl: url });
          }
        }
      }
    }
  }

  function walk(node, sectionId) {
    if (!node || !node.id) return;
    const editable = editableMap.get(node.id);
    if (editable?.fields) {
      pushUrlsFromFields(sectionId, String(node.id), editable.fields);
    }
    if (Array.isArray(node.elements)) {
      for (const child of node.elements) walk(child, sectionId);
    }
  }

  for (const part of originData) {
    if (!part?.id) continue;
    walk(part, String(part.id));
  }

  return result;
}
