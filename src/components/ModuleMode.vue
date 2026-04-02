<template>
  <div class="page-mode-container">
    <!-- 左侧：多模块截图预览（每个模块一行） -->
    <div class="preview-section">
      <div class="preview-card">
        <div class="preview-header">
          <h3>页面示例</h3>
          <el-button v-if="isAdmin" type="primary" size="small" @click="openUploadDialogFromHeader">
            <el-icon><Upload /></el-icon>
            上传截图
          </el-button>
        </div>
        <div class="preview-content pretty-scroll">
          <!-- 与右侧 visibleParts 同一列表，序号与「板块 N」一一对应 -->
          <div
            v-for="(part, index) in visibleParts"
            :key="part.id"
            class="module-preview-item"
          >
            <div class="module-preview-label">
              <span>模块 {{ index + 1 }}</span>
              <el-button
                v-if="isAdmin"
                link
                type="primary"
                size="small"
                @click="openUploadDialog(part.id)"
              >
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
            </div>
            <img
              v-if="getModuleImage(part.id)"
              :src="getModuleImage(part.id).file_url"
              alt="module picture"
              class="preview-image"
            />
            <el-empty v-else description="未上传截图" image-size="80" />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：编辑区（独立滚动） -->
    <div class="editor-section">
      <div
        v-if="state?.moduleId && state?.editableMap"
        class="editor-scroll pretty-scroll"
      >
        <div class="editor-content">
          <div
            v-for="(part, index) in visibleParts"
            :key="part.id"
            class="section-block"
          >
            <el-collapse accordion>
              <el-collapse-item :name="`part-${index}`">
                <template #title>
                  <div class="collapse-title">
                    <el-icon class="collapse-icon"><Grid /></el-icon>
                    <span class="collapse-text">板块 {{ index + 1 }}</span>
                    <el-tag size="small" type="info">{{ part.elType || 'section' }}</el-tag>
                  </div>
                </template>
                <div class="collapse-content">
                  <DataExtractor
                    v-if="part?.id"
                    :original-node="part"
                    :editable-map="state.editableMap"
                    @update:field="handleFieldUpdate"
                  />
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
      <div v-else class="editor-scroll pretty-scroll empty-state-wrap">
        <div class="empty-state">
          <el-empty description="非Elementor页面" />
        </div>
      </div>
    </div>
  </div>

  <!-- 上传图片弹窗 -->
  <el-dialog v-model="dialogVisible" title="图片上传" width="800">
    <div v-loading="uploading" class="upload-dialog-content">
      <el-upload drag action="#" :before-upload="handleBeforeUpload">
        <el-icon class="el-icon--upload">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
            <path fill="currentColor"
              d="M544 864V672h128L512 480 352 672h128v192H320v-1.6c-5.376.32-10.496 1.6-16 1.6A240 240 0 0 1 64 624c0-123.136 93.12-223.488 212.608-237.248A239.81 239.81 0 0 1 512 192a239.87 239.87 0 0 1 235.456 194.752c119.488 13.76 212.48 114.112 212.48 237.248a240 240 0 0 1-240 240c-5.376 0-10.56-1.28-16-1.6v1.6z">
            </path>
          </svg>
        </el-icon>
        <div class="el-upload__text">拖动文件或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">jpg/png/webp 图片，大小不超过 20MB</div>
        </template>
      </el-upload>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, computed } from "vue";
import { Upload, Grid } from '@element-plus/icons-vue';
import {
  getPageById,
  upload_bind_img,
  get_bind_img,
  getFileFullUrl,
} from "@/apis/index.js";
import DataExtractor from "./DataExtractor.vue";
import { useGlobalStore } from "@/stores/global";
import { extractEditableData, updateField, mapToObject } from "@/utils/dataExtractor.js";

const dialogVisible = ref(false);
const uploading = ref(false);
/** 按模块 elementor id 存截图，与 visibleParts 顺序无关、与右侧板块一一对应 */
const moduleImages = ref({});
let currentUploadModuleId = null;

function moduleImageKey(id) {
  return id == null ? "" : String(id);
}

function getModuleImage(id) {
  const k = moduleImageKey(id);
  return k ? moduleImages.value[k] : null;
}

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

const { websiteInfo, user } = useGlobalStore();

const isAdmin = computed(() => {
  const role = (user?.role ?? "user").toString().toLowerCase();
  return role === "admin";
});

// ── 与 PageMode 相同的 visibleParts：左右列共用，保证一一对应 ────────────────

const fieldModules = import.meta.glob("/src/components/Field/**/*.vue", { eager: true });
function hasFieldComponent(widgetType) {
  if (!widgetType) return false;
  const possiblePaths = [
    `/src/components/Field/${widgetType}.vue`,
    `/src/components/Field/Basic/${widgetType}.vue`,
    `/src/components/Field/General/${widgetType}.vue`,
    `/src/components/Field/Jkit/${widgetType}.vue`,
    `/src/components/Field/Pro/${widgetType}.vue`,
    `/src/components/Field/Other/${widgetType}.vue`,
  ];
  return possiblePaths.some((p) => Boolean(fieldModules[p]));
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
  const parts = state.originData;
  const editableMap = state.editableMap;
  if (!Array.isArray(parts) || !editableMap) return [];
  return parts.filter((part) => {
    if (!part?.elements || part.elements.length === 0) return false;
    return hasRenderableEditableInTree(part, editableMap);
  });
});

onMounted(async () => {});

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
    console.error('更新字段时出错:', error);
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
  return state.pageData;
}

// ── 提取可编辑数据 ───────────────────────────────────────────────────────────

function extractData(data) {
  console.log('开始提取可编辑数据...');
  const editableMap = extractEditableData(data);
  console.log('提取完成，可编辑节点数量:', editableMap.size);
  console.log('可编辑数据:', mapToObject(editableMap));
  return editableMap;
}

// ── 上传截图 ─────────────────────────────────────────────────────────────────

function openUploadDialog(moduleId) {
  currentUploadModuleId = moduleId;
  dialogVisible.value = true;
}

function openUploadDialogFromHeader() {
  const first = visibleParts.value[0];
  if (!first?.id) {
    ElMessage.warning("暂无可上传截图的板块");
    return;
  }
  openUploadDialog(first.id);
}

function handleBeforeUpload(file) {
  const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  const isLt20M = file.size / 1024 / 1024 < 20;
  if (!isImage) { ElMessage.error("仅支持上传 jpg/png/webp 格式的图片！"); return false; }
  if (!isLt20M) { ElMessage.error("图片大小不能超过 20MB!"); return false; }
  customUpload(file);
  return false;
}

const customUpload = async (file) => {
  uploading.value = true;
  try {
    const site_id = websiteInfo?.site_id;
    if (!site_id) { ElMessage.error("未选择站点"); return; }
    const mid = currentUploadModuleId;
    if (mid == null) {
      ElMessage.error("未选择模块");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("site_id", site_id);
    fd.append("elementor_id", String(mid));

    const res = await upload_bind_img(fd);
    if (res.code === 0) {
      const res2 = await get_bind_img(site_id, mid);
      if (res2?.code === 0 && res2?.data?.list?.[0]) {
        const item = res2.data.list[0];
        const k = moduleImageKey(mid);
        moduleImages.value[k] = { ...item, file_url: getFileFullUrl(item.file_url) };
      }
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

// ── 监听 pageId 变化加载数据 ───────────────────────────────────────────────────

watch(
  () => props.pageId,
  async (newId) => {
    if (!newId) return;
    const loadingInstance = ElLoading.service({ fullscreen: true });
    const site_id = websiteInfo?.site_id;

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
        console.error('JSON 解析错误:', error);
        state.pageData = null;
        state.originData = null;
        state.editableMap = null;
        ElMessage.error('数据格式错误，无法解析 JSON');
      }
    }

    moduleImages.value = {};
    if (site_id && state.originData) {
      for (let i = 0; i < state.originData.length; i++) {
        const mod = state.originData[i];
        const mid = mod?.id;
        if (mid == null) continue;
        const res2 = await get_bind_img(site_id, mid);
        if (res2?.code === 0 && res2?.data?.list?.[0]) {
          const item = res2.data.list[0];
          moduleImages.value[moduleImageKey(mid)] = { ...item, file_url: getFileFullUrl(item.file_url) };
        }
      }
    }

    nextTick(() => { loadingInstance.close(); });
  },
  { immediate: true }
);

defineExpose({
  state,
  getFinalData,
  applyBulkFieldUpdates,
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

/* 左侧预览区域 */
.preview-section {
  flex: 0 0 45%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.preview-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.preview-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(to bottom, #ffffff, #fafbfc);
}

.preview-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #303133;
}

.preview-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-preview-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.module-preview-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #fafbfc;
  border-bottom: 1px solid #e4e7ed;
  font-size: 0.8rem;
  color: #606266;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

/* 右侧编辑区域 */
.editor-section {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.empty-state-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-block {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.section-block:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #303133;
  padding: 0.25rem 0;
}

.collapse-icon {
  color: #409eff;
  font-size: 1.25rem;
}

.collapse-text {
  font-size: 1rem;
}

.collapse-content {
  padding: 1.5rem;
  background: #fafbfc;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 4rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 100%;
}

/* 滚动条美化 */
.pretty-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.pretty-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.pretty-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 6px; }
.pretty-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
  border-radius: 6px;
  border: 2px solid #f1f5f9;
}
.pretty-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
}

/* 折叠面板 */
:deep(.el-collapse) { border: none; }
:deep(.el-collapse-item__header) {
  padding: 1.25rem 1.5rem;
  background: white;
  border: none;
  font-weight: 500;
  height: auto;
  line-height: 1.5;
}
:deep(.el-collapse-item__wrap) { border: none; background: #fafbfc; }
:deep(.el-collapse-item__content) { padding: 0; }

.upload-dialog-content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
