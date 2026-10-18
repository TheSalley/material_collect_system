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
      @update-title="handleUpdatePartTitle"
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
      @toggle-hidden="handleTogglePartHidden"
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

  <SortPartsDialog
    v-model:visible="sortDialogVisible"
    :parts="visibleParts"
    @reorder="handleReorderParts"
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
import SortPartsDialog from "@/components/module-mode/SortPartsDialog.vue";
import { extractEditableData, updateField, mapToObject } from "@/utils/dataExtractor.js";
import { normalizeElementorRoots, pickFieldModule } from "@/utils/elementorFieldUi.js";
import { HIDDEN_PART_TITLE } from "@/utils/moduleModeUtils.js";
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

const sortDialogVisible = ref(false);

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

// ── 板块标题（_title）更新 ────────────────────────────────────────────────────

function handleUpdatePartTitle({ id, title }) {
  if (!id) return;
  const value = typeof title === "string" ? title.trim() : "";
  try {
    updateNodeInOriginalData(state.pageData, id, "_title", value);
    updateNodeInOriginalData(state.originData, id, "_title", value);
  } catch (error) {
    console.error("更新板块标题时出错:", error);
  }
}

// ── 板块隐藏状态切换 ──────────────────────────────────────────────────────────

function findNodeInData(data, nodeId) {
  if (!data) return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findNodeInData(item, nodeId);
      if (found) return found;
    }
    return null;
  }
  if (String(data?.id) === String(nodeId)) return data;
  return findNodeInData(data?.elements, nodeId);
}

/**
 * 幂等写入隐藏状态：重复应用到同一份数据也不会来回翻转
 * hidden=true  写入隐藏标记（仅当还不是隐藏状态，避免覆盖备份）
 * hidden=false 还原标题并清理备份（仅当仍是隐藏状态）
 */
function applyPartHiddenState(node, hidden) {
  if (!node) return;
  if (!node.settings || Array.isArray(node.settings)) node.settings = {};
  if (hidden) {
    if (node.settings._title !== HIDDEN_PART_TITLE) {
      node.settings._title_backup = node.settings._title || "";
      node.settings._title = HIDDEN_PART_TITLE;
    }
  } else {
    if (node.settings._title === HIDDEN_PART_TITLE) {
      const backup = node.settings._title_backup;
      if (backup) node.settings._title = backup;
      else delete node.settings._title;
    }
    delete node.settings._title_backup;
  }
}

/** 对 pageData 与 originData 应用同一目标状态（幂等，无需关心是否同引用） */
function setPartHiddenState(id, hidden) {
  if (!id) return;
  for (const data of [state.pageData, state.originData]) {
    if (!data) continue;
    applyPartHiddenState(findNodeInData(data, id), hidden);
  }
}

function handleTogglePartHidden(id) {
  if (!id) return;
  try {
    const node =
      findNodeInData(state.pageData, id) ||
      findNodeInData(state.originData, id);
    if (!node) return;
    const hidden = node.settings?._title !== HIDDEN_PART_TITLE;
    setPartHiddenState(id, hidden);
  } catch (error) {
    console.error("切换板块隐藏状态时出错:", error);
  }
}

// ── 板块排序 ──────────────────────────────────────────────────────────────────

function handleReorderParts({ fromId, toId }) {
  if (!fromId || !toId || String(fromId) === String(toId)) return;
  try {
    // pageData 与 originData 可能是同一个引用，去重避免同一份数据被移动两次
    const seen = new Set();
    for (const data of [state.pageData, state.originData]) {
      if (!data || seen.has(data)) continue;
      seen.add(data);
      const roots = normalizeElementorRoots(data);
      if (!Array.isArray(roots) || roots.length <= 1) continue;
      const fromIndex = roots.findIndex((r) => String(r?.id) === String(fromId));
      const toIndex = roots.findIndex((r) => String(r?.id) === String(toId));
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) continue;
      const [moved] = roots.splice(fromIndex, 1);
      const target = toIndex > fromIndex ? toIndex - 1 : toIndex;
      roots.splice(target, 0, moved);
    }
  } catch (error) {
    console.error("调整板块顺序时出错:", error);
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
  openSortDialog: () => {
    sortDialogVisible.value = true;
  },
});
</script>

<style scoped>
.page-mode-container {
  display: flex;
  gap: 2rem;
  background: #f5f7fa;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
