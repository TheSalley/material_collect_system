/**
 * useModuleUpload
 * ModuleMode 上传弹窗 + 媒体库 composable
 *
 * 职责：
 * - 上传弹窗状态管理（dialogVisible, uploadTab, uploading 等）
 * - 媒体库搜索/选择/分页
 * - 本地上传（customUpload）
 * - 媒体库选择（confirmSelectMedia）
 *
 * 依赖（通过参数传入，保持 composable 纯净化）：
 * @param {Object} options
 * @param {Ref} options.websiteInfo - 当前站点信息 ref
 * @param {Ref|ComputedRef} options.pageId - 页面 ID ref/computed
 * @param {Ref} options.moduleImages - 模块截图 ref（上传成功后更新）
 * @param {ComputedRef} options.visibleParts - 可见板块列表 computed
 * @param {Function} options.mediaDemoName - 获取媒体库 demo 名称的函数
 * @param {Function} options.buildPageMaterialsPayload - 构建页面素材 payload 的函数
 */
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { savePageConfig, getFileFullUrl } from "@/apis/index.js";
import { saveMedia } from "@/apis/media.js";
import { moduleImageKey } from "@/utils/moduleModeUtils.js";
import { useMedia } from "@/composables/useMedia";

export function useModuleUpload({
  websiteInfo,
  pageId,
  moduleImages,
  visibleParts,
  mediaDemoName,
  buildPageMaterialsPayload,
}) {
  // ── useMedia（媒体库状态和方法） ─────────────────────────────────────────────

  const {
    queryDemo,
    page_name,
    loading,
    rows,
    page,
    total,
    totalPages,
    searched,
    loadMedia,
    handleQuery,
    handlePageChange,
    handleSizeChange,
    handleUpload: doUpload,
  } = useMedia();

  // ── 上传弹窗状态 ─────────────────────────────────────────────────────────────

  const dialogVisible = ref(false);
  const uploading = ref(false);
  const uploadTab = ref("upload");
  const mediaLoading = ref(false);
  const mediaKeyword = ref("");
  const uploadPageName = ref("");
  const selectedMediaId = ref(null);

  /** 当前上传的模块信息（内部变量） */
  let currentUploadModuleId = null;
  let currentUploadPartIndex = null;
  let mediaSearchTimer = null;

  // ── computed ─────────────────────────────────────────────────────────────────

  const hasUploadPageName = computed(() => uploadPageName.value.trim().length > 0);
  const filteredMediaList = computed(() => rows.value);

  // ── 函数 ─────────────────────────────────────────────────────────────────────

  /** 打开上传弹窗 */
  function openUploadDialog(moduleId, partIndex) {
    currentUploadModuleId = moduleId;
    currentUploadPartIndex = partIndex;
    selectedMediaId.value = null;
    mediaKeyword.value = "";
    page_name.value = "";
    uploadPageName.value = "";
    uploadTab.value = "upload";
    dialogVisible.value = true;
    // 重置分页并加载媒体列表
    page.value = 1;
    loadMedia();
  }

  /** 从头部打开上传弹窗（默认第一个板块） */
  function openUploadDialogFromHeader() {
    const first = visibleParts.value[0];
    if (!first?.id) {
      ElMessage.warning("暂无可上传截图的板块");
      return;
    }
    openUploadDialog(first.id);
  }

  /** 搜索媒体（防抖 300ms） */
  async function handleMediaSearch() {
    if (mediaSearchTimer) clearTimeout(mediaSearchTimer);
    mediaSearchTimer = setTimeout(async () => {
      const keyword = mediaKeyword.value.trim();
      page_name.value = keyword;
      page.value = 1;
      await loadMedia();
    }, 300);
  }

  /** 从路径提取文件名 */
  function getFileName(path) {
    if (!path) return "";
    const parts = path.split("/");
    return parts[parts.length - 1] || "";
  }

  /** 确认选择媒体库图片 */
  async function confirmSelectMedia() {
    const item = rows.value.find((m) => m.id === selectedMediaId.value);
    if (!item) {
      ElMessage.warning("请先选择一个素材");
      return;
    }
    const site_id = websiteInfo.value?.site_id;
    const mid = currentUploadModuleId;
    const k = moduleImageKey(mid);
    const pageName = uploadPageName.value?.trim() || item.page || "";
    moduleImages.value[k] = {
      id: item.id,
      demo: item.demo ?? mediaDemoName(),
      url: item.url || item.file_url,
      page: pageName,
      file_url: getFileFullUrl(item.file_url || item.url),
    };
    const currentPageId = String(pageId.value);
    try {
      await savePageConfig(site_id, currentPageId, buildPageMaterialsPayload());
      ElMessage.success("已从媒体库选择图片！");
      dialogVisible.value = false;
    } catch (e) {
      ElMessage.error("保存失败：" + (e?.message || "未知错误"));
    }
  }

  /** 上传前校验 */
  function handleBeforeUpload(file) {
    if (!hasUploadPageName.value) {
      ElMessage.warning("请先填写页面标识再上传图片");
      return false;
    }
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isImage) {
      ElMessage.error("仅支持上传 jpg/png/webp 格式的图片！");
      return false;
    }
    if (!isLt20M) {
      ElMessage.error("图片大小不能超过 20MB!");
      return false;
    }
    customUpload(file);
    return false;
  }

  /** 自定义上传逻辑 */
  const customUpload = async (file) => {
    uploading.value = true;
    try {
      const site_id = websiteInfo.value?.site_id;
      if (!site_id) {
        ElMessage.error("未选择站点");
        return;
      }
      const demo = mediaDemoName();
      if (!demo) {
        ElMessage.error("当前站点未配置 Demo 名称，无法上传到媒体库");
        return;
      }
      const mid = currentUploadModuleId;
      if (mid == null) {
        ElMessage.error("未选择模块");
        return;
      }
      const pageName = uploadPageName.value?.trim() || "";
      const res = await saveMedia({ file, demo, page: pageName });
      if (res.code === 0 || res.success) {
        const saved = res.data; // { id, demo, page, url }
        if (!saved?.id) {
          ElMessage.error("保存媒体库记录失败，未返回素材ID");
          return;
        }
        // 更新截图预览
        const k = moduleImageKey(mid);
        moduleImages.value[k] = {
          ...saved,
          page: String(mid), // 保存板块的 elementor id
          file_url: getFileFullUrl(saved.url || saved.file_url),
        };
        const currentPageId = String(pageId.value);
        await savePageConfig(site_id, currentPageId, buildPageMaterialsPayload());
        ElMessage.success("图片上传成功！");
        dialogVisible.value = false;
      } else {
        ElMessage.error("上传失败：" + (res.message || "未知错误"));
      }
    } catch (err) {
      ElMessage.error("上传失败：" + (err?.message || "未知错误"));
    } finally {
      uploading.value = false;
    }
  };

  return {
    // 上传弹窗状态
    dialogVisible,
    uploading,
    uploadTab,
    mediaLoading,
    mediaKeyword,
    uploadPageName,
    selectedMediaId,
    hasUploadPageName,
    filteredMediaList,
    // useMedia 状态
    queryDemo,
    page_name,
    loading,
    rows,
    page,
    total,
    totalPages,
    searched,
    // 函数
    openUploadDialog,
    openUploadDialogFromHeader,
    handleMediaSearch,
    getFileName,
    confirmSelectMedia,
    handleBeforeUpload,
    customUpload,
    // useMedia 方法
    loadMedia,
    handleQuery,
    handlePageChange,
    handleSizeChange,
    doUpload,
  };
}
