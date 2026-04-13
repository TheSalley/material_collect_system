/**
 * 图片上传工具函数
 * 提供统一的图片验证和上传功能
 */

import { uploadImage } from "@/apis";
import { ElMessage } from "element-plus";
import { useGlobalStore } from "@/stores/global";
import { STRICT_IMAGE_DIMENSION_ENABLED } from "@/config/index";

/** 默认上传规则 */
export const IMAGE_UPLOAD_DEFAULTS = {
  maxSizeMB: 5,
  accept: "webp,png,jpg,jpeg",
};

/** 兼容多种 upload_image 返回结构 */
function parseWpUploadResult(res) {
  if (!res || res.code !== 0 || res.data == null) return null;
  const row = Array.isArray(res.data) ? res.data[0] : res.data;
  if (!row || typeof row !== "object") return null;
  if (row.success && row.data) {
    const u = row.data.url || row.data.file_url || "";
    const id = row.data.attachment_id ?? row.data.id;
    if (u || id != null) return { url: u || "", id };
    return null;
  }
  if (row.url || row.id != null) {
    return {
      url: row.url || row.file_url || "",
      id: row.id ?? row.attachment_id,
    };
  }
  return null;
}

/**
 * 读取本地文件的像素尺寸
 * @param {File} file
 * @returns {Promise<{ width: number; height: number } | null>}
 */
export function getImageNaturalSizeFromFile(file) {
  if (!file) return Promise.resolve(null);
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    const finish = (dim) => {
      URL.revokeObjectURL(objectUrl);
      img.onload = null;
      img.onerror = null;
      resolve(dim);
    };
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w > 0 && h > 0) finish({ width: w, height: h });
      else finish(null);
    };
    img.onerror = () => finish(null);
    img.src = objectUrl;
  });
}

/**
 * 通过网络地址读取像素尺寸（受跨域策略影响，失败时返回 null）
 * @param {string} url
 * @returns {Promise<{ width: number; height: number } | null>}
 */
export function getImageNaturalSizeFromUrl(url) {
  if (!url || typeof url !== "string") return Promise.resolve(null);
  const trimmed = url.trim();
  if (!trimmed) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    const done = (dim) => {
      img.onload = null;
      img.onerror = null;
      resolve(dim);
    };
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w > 0 && h > 0) done({ width: w, height: h });
      else done(null);
    };
    img.onerror = () => done(null);
    img.src = trimmed;
  });
}

/**
 * 校验像素是否不超过上限
 * @param {{ width: number; height: number } | null} dim
 * @param {{ maxWidth?: number; maxHeight?: number }} limits
 * @returns {boolean}
 */
export function assertImageDimensionsWithin(dim, limits) {
  const { maxWidth, maxHeight } = limits;
  if (maxWidth == null && maxHeight == null) return true;
  if (!dim || !dim.width || !dim.height) {
    ElMessage.error("无法读取图片尺寸，请换一张图片重试");
    return false;
  }
  if (maxWidth != null && dim.width > maxWidth) {
    ElMessage.error(`图片宽度 ${dim.width}px 超过限制 ${maxWidth}px`);
    return false;
  }
  if (maxHeight != null && dim.height > maxHeight) {
    ElMessage.error(`图片高度 ${dim.height}px 超过限制 ${maxHeight}px`);
    return false;
  }
  return true;
}

/**
 * 生成上传说明文案（格式、大小）
 * @param {Object} options
 */
export function buildImageUploadTip(options = {}) {
  const config = {
    ...IMAGE_UPLOAD_DEFAULTS,
    ...options,
  };
  return `上传要求：支持 ${config.accept.split(",").join("/")} 等格式，单张不超过 ${config.maxSizeMB}MB`;
}

/**
 * 生成选图后的尺寸提示（实际像素 + 自身尺寸作为等值限制参考）
 * @param {{ width: number; height: number } | null} dim
 * @returns {string}
 */
export function formatNaturalSizeLabel(dim) {
  if (!dim || !dim.width || !dim.height) return "";
  return `当前图片尺寸：${dim.width}×${dim.height}px`;
}

/**
 * 严格等值尺寸校验（宽高必须与参考尺寸完全一致）
 * @param {{ width: number; height: number } | null} dim
 * @param {{ width: number; height: number }} ref
 * @returns {boolean}
 */
export function assertImageDimensionsMatch(dim, ref) {
  if (!dim || !dim.width || !dim.height) {
    ElMessage.error("无法读取图片尺寸，请换一张图片重试");
    return false;
  }
  if (dim.width !== ref.width || dim.height !== ref.height) {
    ElMessage.error(
      `图片尺寸必须为 ${ref.width}×${ref.height}px，当前为 ${dim.width}×${dim.height}px`,
    );
    return false;
  }
  return true;
}

/**
 * 验证图片文件（大小）
 * @param {File} file - 要验证的文件
 * @param {Object} options - 验证选项
 * @param {number} options.maxSizeMB - 最大文件大小（MB），默认 10
 * @returns {boolean} - 验证是否通过
 */
export function validateImageFile(file, options = {}) {
  const { maxSizeMB = IMAGE_UPLOAD_DEFAULTS.maxSizeMB } = {
    ...IMAGE_UPLOAD_DEFAULTS,
    ...options,
  };

  const isLtMaxSize = file.size / 1024 / 1024 < maxSizeMB;

  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${maxSizeMB}MB!`);
    return false;
  }

  return true;
}

/**
 * 验证文件大小 + 像素尺寸（异步，用于 el-upload before-upload 返回 Promise）
 * @param {File} file
 * @param {Object} [options]
 * @param {number} [options.maxSizeMB]
 * @param {number} [options.maxWidth] 为 null 时不校验宽度
 * @param {number} [options.maxHeight] 为 null 时不校验高度
 * @param {boolean} [options.strictMatch] 为 true 时严格等值校验（宽高必须与 refDimensions 完全一致）
 * @param {{ width: number; height: number }} [options.refDimensions] 严格等值模式下的参考尺寸
 * @returns {Promise<boolean>}
 */
export async function validateImageFileWithDimensions(file, options = {}) {
  if (!validateImageFile(file, options)) return false;
  const { maxWidth, maxHeight, strictMatch, refDimensions } = options;
  if (strictMatch && refDimensions && STRICT_IMAGE_DIMENSION_ENABLED) {
    const dim = await getImageNaturalSizeFromFile(file);
    return assertImageDimensionsMatch(dim, refDimensions);
  }
  if (maxWidth == null && maxHeight == null) return true;
  const dim = await getImageNaturalSizeFromFile(file);
  return assertImageDimensionsWithin(dim, { maxWidth, maxHeight });
}

/**
 * 上传图片到服务器
 * @param {File} file - 要上传的文件
 * @returns {Promise<{url: string, id: number} | null>} - 上传成功返回 {url, id}，失败返回 null
 */
export async function uploadImageFile(file) {
  try {
    const { websiteInfo } = useGlobalStore();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("site_id", websiteInfo.site_id);

    const res = await uploadImage(formData);

    const parsed = parseWpUploadResult(res);
    if (parsed) {
      ElMessage.success("图片上传成功！");
      return parsed;
    }
    const msg = res?.data?.[0]?.message || res?.message || "上传失败";
    ElMessage.error("上传失败：" + msg);
    return null;
  } catch (err) {
    ElMessage.error("上传失败：" + err.message);
    return null;
  }
}

/**
 * 处理图片上传（包含验证和上传）
 * @param {File} file - 要上传的文件
 * @param {Function} onSuccess - 成功回调函数，接收 (url, id) 参数
 * @param {Object} options - 选项，同 validateImageFileWithDimensions / IMAGE_UPLOAD_DEFAULTS
 * @returns {Promise<boolean>} - 是否应该阻止默认上传行为（用于 el-upload 的 before-upload）
 */
export async function handleImageUpload(file, onSuccess, options = {}) {
  const ok = await validateImageFileWithDimensions(file, options);
  if (!ok) return false;

  const result = await uploadImageFile(file);

  if (result && onSuccess) {
    onSuccess(result.url, result.id);
  }

  return false;
}
