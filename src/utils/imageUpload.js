/**
 * 图片上传工具函数
 * 提供统一的图片验证和上传功能
 */

import { uploadImage } from "@/apis";
import { useGlobalStore } from "@/stores/global";

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
 * 验证图片文件
 * @param {File} file - 要验证的文件
 * @param {Object} options - 验证选项
 * @param {number} options.maxSizeMB - 最大文件大小（MB），默认 10
 * @returns {boolean} - 验证是否通过
 */
export function validateImageFile(file, options = {}) {
  const { maxSizeMB = 10 } = options;
  
  const isImage = file.type === "image/jpeg" || file.type === "image/png";
  const isLtMaxSize = file.size / 1024 / 1024 < maxSizeMB;

  // if (!isImage) {
  //   ElMessage.error("仅支持上传 jpg/png 格式的图片！");
  //   return false;
  // }
  
  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${maxSizeMB}MB!`);
    return false;
  }
  
  return true;
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
    const msg =
      res?.data?.[0]?.message || res?.message || "上传失败";
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
 * @param {Object} options - 选项
 * @param {number} options.maxSizeMB - 最大文件大小（MB），默认 10
 * @returns {Promise<boolean>} - 是否应该阻止默认上传行为（用于 el-upload 的 before-upload）
 */
export async function handleImageUpload(file, onSuccess, options = {}) {
  // 验证文件
  if (!validateImageFile(file, options)) {
    return false;
  }

  // 上传文件
  const result = await uploadImageFile(file);
  
  if (result && onSuccess) {
    onSuccess(result.url, result.id);
  }

  return false; // 阻止 el-upload 的默认上传行为
}
