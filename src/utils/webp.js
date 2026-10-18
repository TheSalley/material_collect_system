/**
 * 图片自动转 WEBP 工具
 * 与 imagebase 裁切站（https://imagebase.yhct.site）同一套思路：
 * canvas 重绘后 toBlob("image/webp", 0.92)，再按原文件名换成 .webp 后缀。
 */

/** 导出质量：与 imagebase frontend.js 保持一致的 0.92 */
export const WEBP_QUALITY = 0.92;

/** 可以安全转 WEBP 的栅格格式（gif 动图、svg 矢量保留原样） */
const CONVERTIBLE_TYPES = new Set(["image/png", "image/jpeg"]);

/**
 * 读取本地文件为 img 元素并返回 object URL（调用方负责 revoke）
 * @param {File} file
 * @returns {Promise<{ img: HTMLImageElement; url: string }>}
 */
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法解码图片"));
    };
    img.src = url;
  });
}

/**
 * canvas 以 webp 导出为 Blob（不支持时返回 null）
 * @param {HTMLCanvasElement} canvas
 * @param {number} [quality]
 * @returns {Promise<Blob | null>}
 */
export function canvasToWebpBlob(canvas, quality = WEBP_QUALITY) {
  return new Promise((resolve) => {
    try {
      if (typeof canvas.toBlob !== "function") {
        resolve(null);
        return;
      }
      canvas.toBlob((blob) => resolve(blob || null), "image/webp", quality);
    } catch {
      resolve(null);
    }
  });
}

/**
 * canvas 以 webp 导出为 File
 * @param {HTMLCanvasElement} canvas
 * @param {Object} [options]
 * @param {string} [options.filename] 文件名（默认 crop_<时间戳>.webp）
 * @param {number} [options.quality]
 * @returns {Promise<File | null>}
 */
export async function canvasToWebpFile(canvas, options = {}) {
  const blob = await canvasToWebpBlob(canvas, options.quality);
  if (!blob) return null;
  const filename = options.filename || `crop_${Date.now()}.webp`;
  return new File([blob], filename, { type: "image/webp" });
}

/**
 * 把 png/jpg 原样等比转为 webp File
 * - 已经是 webp、或 gif/svg 等不支持转换的格式：原样返回
 * - 浏览器不支持 webp 编码：原样返回
 * @param {File} file
 * @param {Object} [options]
 * @param {number} [options.quality]
 * @returns {Promise<File>}
 */
export async function fileToWebp(file, options = {}) {
  if (!file || typeof file !== "object") return file;

  const mime = String(file.type || "").toLowerCase();
  if (!mime || mime === "image/webp" || !CONVERTIBLE_TYPES.has(mime)) return file;

  let loaded;
  try {
    loaded = await loadImageFromFile(file);
    const { img } = loaded;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    if (!canvas.width || !canvas.height) return file;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const webpFile = await canvasToWebpFile(canvas, {
      filename: file.name.replace(/\.[^.]+$/i, "") + ".webp",
      quality: options.quality,
    });
    return webpFile || file;
  } catch {
    return file;
  } finally {
    if (loaded?.url) URL.revokeObjectURL(loaded.url);
  }
}
