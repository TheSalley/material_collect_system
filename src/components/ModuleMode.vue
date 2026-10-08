<template>
  <div class="page-mode-container">
    <!-- 左侧：板块预览 -->
    <PreviewPanel
      :visible-parts="visibleParts"
      :active-part-index="activePartIndex"
      :is-admin="isAdmin"
      :get-module-image="getModuleImage"
      :removing-image-key="removingImageKey"
      :binding-demo-image-key="bindingDemoImageKey"
      :is-demo-screenshot-bound="isDemoScreenshotBound"
      @preview-click="handlePreviewClick"
      @open-upload="openUploadDialog"
      @remove-image="removeModuleImage"
      @toggle-demo-screenshot="toggleDemoScreenshot"
    />

    <!-- 右侧：编辑区 -->
    <EditorPanel
      :visible-parts="visibleParts"
      v-model:active-collapse-name="activeCollapseName"
      :active-part-index="activePartIndex"
      :state="state"
      :editor-scroll-ref="editorScrollRef"
      @field-update="handleFieldUpdate"
    />
  </div>

  <!-- 上传图片弹窗 -->
  <UploadDialog
    v-model:dialog-visible="dialogVisible"
    v-model:upload-tab="uploadTab"
    v-model:upload-page-name="uploadPageName"
    v-model:media-keyword="mediaKeyword"
    v-model:selected-media-id="selectedMediaId"
    v-model:page="page"
    :uploading="uploading"
    :media-loading="mediaLoading"
    :has-upload-page-name="hasUploadPageName"
    :loading="loading"
    :rows="rows"
    :total="total"
    :total-pages="totalPages"
    :searched="searched"
    :get-file-full-url="getFileFullUrl"
    @before-upload="handleBeforeUpload"
    @media-search="handleMediaSearch"
    @confirm-select="confirmSelectMedia"
    @page-change="handlePageChange"
  />
</template>
<script setup>
import { ref, reactive, onMounted, nextTick, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { getPageById, getFileFullUrl } from "@/apis/index.js";
import { useGlobalStore } from "@/stores/global";
import PreviewPanel from "@/components/module-mode/PreviewPanel.vue";
import EditorPanel from "@/components/module-mode/EditorPanel.vue";
import UploadDialog from "@/components/module-mode/UploadDialog.vue";
import { extractEditableData, updateField, mapToObject } from "@/utils/dataExtractor.js";
import { normalizeElementorRoots, pickFieldModule } from "@/utils/elementorFieldUi.js";
import { buildUrlMatchTokens, hasSafeContainsMatch, hasTokenIntersection } from "@/utils/imageBlacklist.js";



import { useModuleParts } from "@/composables/useModuleParts.js";
import { useModuleUpload } from "@/composables/useModuleUpload.js";
import { useDemoConfig } from "@/composables/useDemoConfig.js";













































































/** 输出数组结构，供 POST /api/page_config/save_sizes */




































const props = defineProps({
  pageId: {
    type: [Number, String],
    required: true,
  },
});

const state = reactive({
  pageData: null,
  originData: null,
  editableMap: null,
  moduleId: null,
  meta_id: null,
  ImageList: [],
});

const globalStore = useGlobalStore();
const { websiteInfo, isAdmin } = storeToRefs(globalStore);

// 板块高亮 + 截图管理（从 composable 提取）
const {
  activePartIndex,
  activeCollapseName,
  editorScrollRef,
  moduleImages,
  handlePreviewClick,
  getModuleImage,
} = useModuleParts({
  websiteInfo,
  pageId: computed(() => props.pageId),
});



// ── 与 PageMode 相同的 visibleParts：左右列共用，保证一一对应 ────────────────

const fieldModules = import.meta.glob("/src/components/ElementorFields/**/*.vue", {
  eager: true,
});

function hasFieldComponent(widgetType) {
  return pickFieldModule(fieldModules, widgetType) != null;
}

function hasRenderableEditableInTree(node, editableMap) {
  if (!node || !editableMap) return false;
  if (node.id && editableMap.has(node.id)) {
    const editableNode = editableMap.get(node.id);
    if (hasFieldComponent(editableNode?.widgetType)) return true;
  }
  const children = node.elements;
  if (Array.isArray(children)) {
    for (const child of children) {
      if (hasRenderableEditableInTree(child, editableMap)) return true;
    }
  }
  return false;
}

const visibleParts = computed(() => {
  const parts = normalizeElementorRoots(state.originData);
  const editableMap = state.editableMap;
  if (!editableMap) return [];
  return parts.filter((part) => part && hasRenderableEditableInTree(part, editableMap));
});

// Demo 配置管理（从 composable 提取，最复杂的部分）
const {
  demoConfigState,
  bindingDemoImageKey,
  bindingDemoSizeKey,
  sectionSizes,
  removingImageKey,
  currentDemoName,
  fetchDemoConfigState,
  buildPageMaterialsPayload,
  buildDemoImagePayloadByModuleId,
  buildModuleImageUrlPayload,
  buildPageSizesPayload,
  buildDemoSizePayloadByNodeId,
  findDemoImageRecord,
  applyPageConfigState,
  refreshPageConfigState,
  isDemoScreenshotBound,
  isDemoSizeBound,
  saveSectionSizes,
  removeModuleImage,
  bindDemoScreenshot,
  toggleDemoScreenshot,
  bindAllDemoScreenshots,
  bindDemoSizeByNodeId,
  toggleDemoSizeByNodeId,
  bindAllDemoSizes,
  applyDemoScreenshots,
  applyDemoSizes,
} = useDemoConfig({
  websiteInfo,
  pageId: computed(() => props.pageId),
  moduleImages,
  getModuleImage,
  visibleParts,
});

// 上传弹窗 + 媒体库（从 composable 提取）
const {
  dialogVisible,
  uploading,
  uploadTab,
  mediaLoading,
  mediaKeyword,
  uploadPageName,
  selectedMediaId,
  hasUploadPageName,
  filteredMediaList,
  queryDemo,
  page_name,
  loading,
  rows,
  page,
  total,
  totalPages,
  searched,
  openUploadDialog,
  openUploadDialogFromHeader,
  handleMediaSearch,
  getFileName,
  confirmSelectMedia,
  handleBeforeUpload,
  customUpload,
  loadMedia,
  handleQuery,
  handlePageChange,
  handleSizeChange,
} = useModuleUpload({
  websiteInfo,
  pageId: computed(() => props.pageId),
  moduleImages,
  visibleParts,
  mediaDemoName: currentDemoName,
  buildPageMaterialsPayload,
});

onMounted(async () => {

  queryDemo.value = currentDemoName();
  await loadMedia();
});

// ── 递归更新原始数据中的节点 ─────────────────────────────────────────────────

function updateNodeInOriginalData(data, nodeId, fieldName, value) {
  if (!data) return false;

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      if (updateNodeInOriginalData(data[i], nodeId, fieldName, value)) return true;
    }
    return false;
  }

  const node = data;
  if (String(node?.id) === String(nodeId)) {
    if (!node.settings || Array.isArray(node.settings)) node.settings = {};
    node.settings[fieldName] = value;
    return true;
  }

  if (node?.elements && Array.isArray(node.elements)) {
    return updateNodeInOriginalData(node.elements, nodeId, fieldName, value);
  }

  return false;
}

// ── 字段更新 ─────────────────────────────────────────────────────────────────

function handleFieldUpdate(payload) {
  const { nodeId, fieldName, value } = payload;
  if (!nodeId || !fieldName) return;
  try {
    updateNodeInOriginalData(state.pageData, nodeId, fieldName, value);
    updateNodeInOriginalData(state.originData, nodeId, fieldName, value);
  } catch (error) {
    console.error("更新字段时出错:", error);
  }
}

// ── 批量更新 ─────────────────────────────────────────────────────────────────

function applyBulkFieldUpdates(updates = []) {
  if (!Array.isArray(updates) || updates.length === 0) return;
  if (!state.editableMap || !state.pageData) return;
  for (const item of updates) {
    const { nodeId, fieldName, value } = item;
    if (!nodeId || !fieldName) continue;
    try {
      updateField(state.editableMap, nodeId, fieldName, value);
      updateNodeInOriginalData(state.pageData, nodeId, fieldName, value);
      updateNodeInOriginalData(state.originData, nodeId, fieldName, value);
    } catch (e) {
      console.error("applyBulkFieldUpdates error:", e);
    }
  }
}

// ── 获取最终保存数据 ─────────────────────────────────────────────────────────

function getFinalData() {
  if (!state.pageData) {
    console.warn("[ModuleMode] getFinalData: pageData 为 null", {
      moduleId: state.moduleId,
      meta_id: state.meta_id,
      editableMapSize: state.editableMap?.size,
    });
  }
  return state.pageData;
}

// ── 提取可编辑数据 ───────────────────────────────────────────────────────────

function extractData(data) {

  const editableMap = extractEditableData(data);


  return editableMap;
}

// ── 上传截图 ─────────────────────────────────────────────────────────────────




















// ── 监听 pageId 变化加载数据 ───────────────────────────────────────────────────

watch(
  () => props.pageId,
  async (newId) => {
    if (!newId) return;
    const loadingInstance = ElLoading.service({ fullscreen: true });
    const site_id = websiteInfo.value?.site_id;

    const res1 = await getPageById(newId, site_id);
    if (res1.code === 0 && res1.data.post_id) {
      state.moduleId = res1.data.post_id;
      state.meta_id = res1.data.meta_id;
      try {
        const parsedData = JSON.parse(res1.data.meta_value);
        state.pageData = parsedData;
        state.originData = parsedData;
        state.editableMap = extractData(parsedData);
      } catch (error) {
        console.error("JSON 解析错误:", error);
        state.pageData = null;
        state.originData = null;
        state.editableMap = null;
        ElMessage.error("数据格式错误，无法解析 JSON");
      }
    }

    moduleImages.value = {};
    sectionSizes.value = {};
    if (site_id && newId) {
      await refreshPageConfigState(newId);
    }

    nextTick(() => {
      loadingInstance.close();
    });
  },
  { immediate: true },
);

watch(
  () => currentDemoName(),
  () => {
    fetchDemoConfigState();
  },
  { immediate: true },
);

// ── 监听高亮索引：展开后滚动（等折叠动画/layout 稳定再滚，避免错位） ────────────







defineExpose({
  state,
  getFinalData,
  applyBulkFieldUpdates,
  applyDemoScreenshots,
  applyDemoSizes,
  saveSectionSizes,
  bindDemoScreenshot,
  bindAllDemoScreenshots,
  bindDemoSizeByNodeId,
  bindAllDemoSizes,
});
</script>

<style scoped>
.page-mode-container {
  display: flex;
  gap: 2rem;
  padding: 2.5rem;
  background: #f5f7fa;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
