/**
 * 图片上传工具函数
 * 提供统一的图片验证和上传功能
 */

import { uploadImage } from "@/apis";
import { useGlobalStore } from "@/stores/global";

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

    if (res.code === 0 && res.data[0].success) {
      ElMessage.success("图片上传成功！");
      return {
        url: res.data[0].data.url,
        id: res.data[0].data.attachment_id
      };
    } else {
      ElMessage.error("上传失败：" + res.message);
      return null;
    }
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
