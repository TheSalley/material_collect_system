<template>
  <div class="page-mode-container">
    <!-- 左侧：截图预览 -->
    <div class="preview-section">
      <div class="preview-card">
        <div class="preview-header">
          <h3>页面预览</h3>
          <el-button v-if="isAdmin" type="primary" @click="dialogVisible = true" size="small">
            <el-icon><Upload /></el-icon>
            上传截图
          </el-button>
        </div>
        <div class="preview-content pretty-scroll">
          <img :src="pagePic.file_url" alt="page picture" v-if="pagePic" class="preview-image" />
          <el-empty v-else description="未上传截图" />
        </div>
      </div>
    </div>

    <!-- 右侧：编辑区域（独立滚动） -->
    <div class="editor-section">
      <div
        v-if="state?.pageId && state?.editableMap"
        class="editor-scroll pretty-scroll"
      >
        <div class="editor-content">
          <div v-for="(part, index) in visibleParts" :key="index" class="section-block">
            <el-collapse accordion>
              <el-collapse-item 
                :name="`part-${index}`">
                <template #title>
                  <div class="collapse-title">
                    <el-icon class="collapse-icon"><Grid /></el-icon>
                    <span class="collapse-text">板块 {{ index + 1 }}</span>
                    <el-tag size="small" type="info">{{ part.elType }}</el-tag>
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
        <div class="el-upload__tip">
          jpg/png/webp 图片，大小不超过 5MB
        </div>
      </template>
    </el-upload>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, onMounted, nextTick, watch, toRaw, computed } from "vue";
import { Upload, Grid } from '@element-plus/icons-vue';
import {
  getPageById,
  upload_bind_img,
  get_bind_img,
  getFileFullUrl,
} from "@/apis/index.js";
import DataExtractor from "./DataExtractor.vue";
import { useGlobalStore } from "@/stores/global";
import { extractEditableData, syncDataToOriginal, updateField, mapToObject } from "@/utils/dataExtractor.js";

const dialogVisible = ref(false);
const pagePic = ref(null);

const props = defineProps({
  pageId: {
    type: [Number, String],
    required: true,
  },
});

const state = reactive({
  pageData: null,           // 原始 Elementor 完整数据（用于保存）
  originData: null,         // 用于展示的数据（不会被修改）
  editableMap: null,        // 提取的可编辑数据 Map（轻量级）
  pageId: null,
  meta_id: null,
  ImageList: [],
});

function hasEditableInTree(node, editableMap) {
  if (!node || !editableMap) return false;
  if (node.id && editableMap.has(node.id)) return true;
  const children = node.elements;
  if (Array.isArray(children)) {
    for (const child of children) {
      if (hasEditableInTree(child, editableMap)) return true;
    }
  }
  return false;
}

// 判断某个 widgetType 是否有对应的 Field 组件可渲染
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
    // 板块本身没有任何元素时直接隐藏
    if (!part?.elements || part.elements.length === 0) return false;
    // 板块下必须至少存在一个“可渲染”的可编辑组件，否则隐藏（避免出现空白板块）
    return hasRenderableEditableInTree(part, editableMap);
  });
});

const { websiteInfo, user } = useGlobalStore();

// 检查是否为管理员
const isAdmin = computed(() => {
  const role = (user?.role ?? "user").toString().toLowerCase();
  return role === "admin";
});

onMounted(async () => {});

/**
 * 递归查找并更新原始数据中的节点
 */
function updateNodeInOriginalData(data, nodeId, fieldName, value) {
  if (!data) return false;

  // 兼容：根是数组（常见）或根是单个对象（部分接口/导出）
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      if (updateNodeInOriginalData(node, nodeId, fieldName, value)) {
        return true;
      }
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

/**
 * 处理字段更新（新架构）
 * @param {Object} payload - { nodeId, fieldName, value }
 */
function handleFieldUpdate(payload) {
  const { nodeId, fieldName, value } = payload;
  
  if (!nodeId || !fieldName) return;
  
  try {
    // editableMap 已在 DataExtractor 中更新，这里同步写回两份数据
    updateNodeInOriginalData(state.pageData, nodeId, fieldName, value);
    updateNodeInOriginalData(state.originData, nodeId, fieldName, value);
  } catch (error) {
    console.error('更新字段时出错:', error);
  }
}

/**
 * 供外部（Pages.vue 顶部工具栏）批量更新字段
 * - 同步更新 editableMap（用于右侧编辑器显示）
 * - 同步写回 pageData（用于保存）
 */
function applyBulkFieldUpdates(updates = []) {
  if (!Array.isArray(updates) || updates.length === 0) return;
  if (!state.editableMap || !state.pageData) return;

  for (const item of updates) {
    const nodeId = item?.nodeId;
    const fieldName = item?.fieldName;
    const value = item?.value;
    if (!nodeId || !fieldName) continue;

    try {
      // 1) 更新 editableMap（右侧面板即时显示）
      updateField(state.editableMap, nodeId, fieldName, value);
      // 2) 写回 pageData / originData（用于保存 + UI树一致）
      updateNodeInOriginalData(state.pageData, nodeId, fieldName, value);
      updateNodeInOriginalData(state.originData, nodeId, fieldName, value);
    } catch (e) {
      console.error("applyBulkFieldUpdates error:", e);
    }
  }
}

/**
 * 获取最终要保存的数据（已经实时同步，直接返回）
 * @returns {Array} 完整的 Elementor 数据
 */
function getFinalData() {
  if (!state.pageData) {
    return null;
  }
  
  // 数据已经实时同步，直接返回
  return state.pageData;
}

const handleBeforeUpload = (file) => {
  const isImage =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp";
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error("仅支持上传 jpg/png/webp 格式的图片！");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("图片大小不能超过 5MB!");
    return false;
  }
  customUpload(file);
  return false;
};

const customUpload = async (file) => {
  try {
    const { websiteInfo } = useGlobalStore();
    const site_id = websiteInfo?.site_id;
    if (!site_id) {
      ElMessage.error("未选择站点");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("site_id", site_id);
    formData.append("elementor_id", String(props.pageId));

    const res = await upload_bind_img(formData);

    if (res.code === 0) {
      const res2 = await get_bind_img(site_id, props.pageId);
      if (res2?.code === 0 && res2?.data?.list?.[0]) {
        const item = res2.data.list[0];
        pagePic.value = { ...item, file_url: getFileFullUrl(item.file_url) };
      }
      ElMessage.success("图片上传成功！");
      dialogVisible.value = false;
    } else {
      ElMessage.error("上传失败：" + (res.message || "未知错误"));
    }
  } catch (err) {
    ElMessage.error("上传失败：" + (err?.message || "未知错误"));
  }
};

/**
 * 提取可编辑数据
 */
function extractData(data) {
  console.log('开始提取可编辑数据...');
  const editableMap = extractEditableData(data);
  console.log('提取完成，可编辑节点数量:', editableMap.size);
  console.log('可编辑数据:', mapToObject(editableMap));
  return editableMap;
}

watch(
  () => props.pageId,
  async (newId, oldId) => {
    if (newId) {
      const loadingInstance = ElLoading.service({ fullscreen: true });
      const [res1, res2] = await Promise.all([
        getPageById(props.pageId, websiteInfo.site_id),
        get_bind_img(websiteInfo.site_id, props.pageId),
      ]);
      if (res1.code === 0 && res1.data.post_id) {
        state.pageId = res1.data.post_id;
        try {
          const parsedData = JSON.parse(res1.data.meta_value);
          state.pageData = parsedData;                    // 保存原始完整数据
          state.originData = parsedData;                  // 用于展示的数据
          state.meta_id = res1.data.meta_id;
          
          // 提取可编辑数据
          state.editableMap = extractData(parsedData);
        } catch (error) {
          console.error('JSON 解析错误:', error);
          console.error('原始数据:', res1.data.meta_value);
          ElMessage.error('数据格式错误，无法解析 JSON。请检查服务器返回的数据。');
          // 设置空数据，避免页面崩溃
          state.pageData = null;
          state.originData = null;
          state.editableMap = null;
        }
      }
      if (res2?.code === 0 && res2?.data?.list?.[0]) {
        const item = res2.data.list[0];
        pagePic.value = { ...item, file_url: getFileFullUrl(item.file_url) };
      } else {
        pagePic.value = null;
      }
      nextTick(() => {
        loadingInstance.close();
      });
    }
  },
  { immediate: true }
);

defineExpose({
  state,
  getFinalData,  // 导出获取最终数据的方法
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

/* 左侧预览区域（独立滚动） */
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
  padding: 1.5rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* 滚动条美化（WebKit + Firefox） */
.pretty-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.pretty-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.pretty-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 6px;
}

.pretty-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
  border-radius: 6px;
  border: 2px solid #f1f5f9;
}

.pretty-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
}

/* 全局折叠面板样式优化 */
:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  padding: 1.25rem 1.5rem;
  background: white;
  border: none;
  font-weight: 500;
  height: auto;
  line-height: 1.5;
}

:deep(.el-collapse-item__wrap) {
  border: none;
  background: #fafbfc;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}
</style>