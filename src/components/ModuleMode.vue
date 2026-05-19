<template>
  <div class="page-mode-container">
    <!-- 左侧：与右侧同结构的独立卡片列表，标题/标签/间距一致 -->
    <div class="preview-section">
      <div class="editor-scroll pretty-scroll">
        <div class="editor-content">
          <div
            v-for="(part, index) in visibleParts"
            :key="part.id"
            class="section-block section-preview-block"
            :class="{ 'is-active-part': activePartIndex === index }"
            @click="handlePreviewClick(index)"
          >
            <div class="preview-block-header">
              <div class="collapse-title">
                <el-icon class="collapse-icon"><Grid /></el-icon>
                <span class="collapse-text">板块 {{ index + 1 }}</span>
              </div>
              <el-button
                v-if="isAdmin"
                type="primary"
                size="small"
                plain
                @click.stop="openUploadDialog(part.id, index)"
              >
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
            </div>
            <div class="preview-block-body">
              <div v-if="getModuleImage(part.id)" class="preview-image-wrapper">
                <el-image
                  :src="getModuleImage(part.id).file_url"
                  :preview-src-list="[getModuleImage(part.id).file_url]"
                  fit="contain"
                  class="preview-image"
                  preview-teleported
                />
                <div class="preview-image-overlay">
                  <el-icon size="24"><ZoomIn /></el-icon>
                  <span>查看大图</span>
                </div>
                <el-button
                  v-if="isAdmin"
                  class="preview-image-remove"
                  :icon="Delete"
                  :loading="removingImageKey === moduleImageKey(part.id)"
                  circle
                  size="small"
                  type="danger"
                  @click.stop="removeModuleImage(part.id)"
                />
              </div>
              <el-empty v-else description="未上传截图" :image-size="80" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：编辑区（独立滚动）；单个手风琴，避免「每板块一个 collapse」导致展开不同步 -->
    <div class="editor-section">
      <div
        v-if="state?.moduleId && state?.editableMap"
        ref="editorScrollRef"
        class="editor-scroll pretty-scroll"
      >
        <el-collapse
          v-model="activeCollapseName"
          accordion
          class="module-parts-collapse"
        >
          <el-collapse-item
            v-for="(part, index) in visibleParts"
            :key="part.id"
            :name="`part-${index}`"
            class="module-section-card"
            :class="{ 'is-active-part': activePartIndex === index }"
          >
            <template #title>
              <div class="collapse-title">
                <el-icon class="collapse-icon"><Grid /></el-icon>
                <span class="collapse-text">板块 {{ index + 1 }}</span>
                <el-tag size="small" type="info">{{
                  part.elType || "section"
                }}</el-tag>
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
      <div v-else class="editor-scroll pretty-scroll empty-state-wrap">
        <div class="empty-state">
          <el-empty description="非Elementor页面" />
        </div>
      </div>
    </div>
  </div>

  <!-- 上传图片弹窗 -->
  <el-dialog v-model="dialogVisible" title="图片上传" width="900">
    <div v-loading="uploading || mediaLoading" class="upload-dialog-content">
      <el-tabs v-model="uploadTab" class="upload-tabs">
        <!-- 本地上传 -->
        <el-tab-pane label="本地上传" name="upload">
          <el-form label-position="top">
            <el-form-item label="页面标识">
              <el-input
                v-model="uploadPageName"
                placeholder="手动填写页面标识"
              />
            </el-form-item>
          </el-form>
          <el-upload
            drag
            action="#"
            :before-upload="handleBeforeUpload"
            :disabled="!hasUploadPageName"
          >
            <el-icon class="el-icon--upload">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path
                  fill="currentColor"
                  d="M544 864V672h128L512 480 352 672h128v192H320v-1.6c-5.376.32-10.496 1.6-16 1.6A240 240 0 0 1 64 624c0-123.136 93.12-223.488 212.608-237.248A239.81 239.81 0 0 1 512 192a239.87 239.87 0 0 1 235.456 194.752c119.488 13.76 212.48 114.112 212.48 237.248a240 240 0 0 1-240 240c-5.376 0-10.56-1.28-16-1.6v1.6z"
                ></path>
              </svg>
            </el-icon>
            <div class="el-upload__text">拖动文件或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">
                jpg/png/webp 图片，大小不超过 20MB
              </div>
            </template>
          </el-upload>
        </el-tab-pane>

        <!-- 媒体库 -->
        <el-tab-pane label="媒体库" name="library">
          <div class="media-library">
            <el-input
              v-model="mediaKeyword"
              placeholder="搜索素材名称"
              clearable
              class="media-search"
              @input="handleMediaSearch"
            >
              <template #prefix
                ><el-icon><Search /></el-icon
              ></template>
            </el-input>
            <div v-if="mediaList.length === 0" class="media-empty">
              <el-empty description="媒体库为空，请先上传" />
            </div>
            <div v-else class="media-grid pretty-scroll">
              <div
                v-for="item in filteredMediaList"
                :key="item.id"
                class="media-item"
                :class="{ 'is-selected': selectedMediaId === item.id }"
                @click="selectedMediaId = item.id"
              >
                <el-image
                  :src="getFileFullUrl(item.file_url || item.url)"
                  fit="cover"
                  class="media-thumb"
                >
                  <template #error>
                    <div class="media-thumb-fallback">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="media-item-name">
                  {{
                    item.name ||
                    item.file_name ||
                    getFileName(item.file_url || item.url)
                  }}
                </div>
                <div
                  v-if="selectedMediaId === item.id"
                  class="media-item-check"
                >
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
            <div v-if="filteredMediaList.length > 0" class="media-footer">
              <span class="media-selected-tip">
                {{ selectedMediaId ? "已选择 1 项" : "请选择一项" }}
              </span>
              <el-button
                type="primary"
                :disabled="!selectedMediaId"
                @click="confirmSelectMedia"
              >
                确认选择
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  nextTick,
  watch,
  computed,
  provide,
} from "vue";
import {
  Upload,
  Grid,
  Search,
  Picture,
  Check,
  ZoomIn,
  Delete,
} from "@element-plus/icons-vue";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import {
  getPageById,
  getPageConfig,
  getFileFullUrl,
  savePageConfig,
  savePageSizes,
} from "@/apis/index.js";
import { saveMedia, getMediaByDemo } from "@/apis/media.js";
import DataExtractor from "./DataExtractor.vue";
import { useGlobalStore } from "@/stores/global";
import {
  extractEditableData,
  updateField,
  mapToObject,
} from "@/utils/dataExtractor.js";
import {
  normalizeElementorRoots,
  pickFieldModule,
} from "@/utils/elementorFieldUi.js";

const dialogVisible = ref(false);
const uploading = ref(false);
const uploadTab = ref("upload");
const mediaLoading = ref(false);
const mediaList = ref([]);
const mediaKeyword = ref("");
const uploadPageName = ref("");
const selectedMediaId = ref(null);
const hasUploadPageName = computed(() => uploadPageName.value.trim().length > 0);
/** 同步高亮：点击左侧截图或与右侧手风琴联动 */
const activePartIndex = ref(null);
/** 与 el-collapse 双向同步（单源：仍以 activePartIndex 为准） */
const activeCollapseName = computed({
  get() {
    const i = activePartIndex.value;
    if (i === null || i === undefined) return undefined;
    return `part-${i}`;
  },
  set(v) {
    if (v === undefined || v === null || v === "") {
      activePartIndex.value = null;
      return;
    }
    const m = /^part-(\d+)$/.exec(String(v));
    activePartIndex.value = m ? Number(m[1]) : null;
  },
});
const editorScrollRef = ref(null);
/** 按模块 elementor id 存尺寸配置，与 visibleParts 顺序无关、与右侧板块一一对应 */
const sectionSizes = ref({});
provide("sectionSizes", sectionSizes);

/** 按模块 elementor id 存截图，与 visibleParts 顺序无关、与右侧板块一一对应 */
const moduleImages = ref({});
const removingImageKey = ref(null);
let currentUploadModuleId = null;
let currentUploadPartIndex = null;

function moduleImageKey(id) {
  return id == null ? "" : String(id);
}

function buildPageMaterialsPayload() {
  // 按板块顺序返回数组，保证索引对应关系
  return visibleParts.value.map((part) => {
    const key = String(part.id);
    const m = moduleImages.value[key];
    if (!m?.id || !m?.url) return null;
    const rawUrl = m.url || m.file_url;
    return {
      id: m.id,
      demo: m.demo,
      page: m.page || "",
      url: rawUrl.startsWith("http") ? rawUrl : getFileFullUrl(rawUrl),
    };
  });
}

/** 输出数组结构，供 POST /api/page_config/save_sizes */
function buildPageSizesPayload() {
  const sizes = sectionSizes.value;
  if (!sizes) return [];

  const result = Object.entries(sizes).reduce((acc, [moduleId, sizeInfo]) => {
    const w = Number(sizeInfo?.width);
    const h = Number(sizeInfo?.height);

    // Only include if there is at least one valid size
    if ((!Number.isNaN(w) && w > 0) || (!Number.isNaN(h) && h > 0)) {
      const out = { module_id: moduleId };
      if (!Number.isNaN(w) && w > 0) {
        out.width = Math.round(w);
      }
      if (!Number.isNaN(h) && h > 0) {
        out.height = Math.round(h);
      }
      acc.push(out);
    }
    return acc;
  }, []);

  console.log("buildPageSizesPayload result:", result);
  return result;
}

async function saveSectionSizes() {
  const site_id = websiteInfo?.site_id;
  if (!site_id || !props.pageId) {
    ElMessage.warning("缺少站点或页面信息");
    return;
  }
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    text: "正在保存尺寸...",
  });
  try {
    const res = await savePageSizes(
      site_id,
      String(props.pageId),
      buildPageSizesPayload(),
    );
    if (res?.code === 0) {
      ElMessage.success(res.message || "尺寸保存成功");
    } else {
      ElMessage.error(res?.message || "尺寸保存失败");
    }
  } catch (e) {
    ElMessage.error("尺寸保存失败：" + (e?.message || ""));
  } finally {
    loadingInstance.close();
  }
}

function getModuleImage(id) {
  const k = moduleImageKey(id);
  return k ? moduleImages.value[k] : null;
}

async function removeModuleImage(moduleId) {
  const key = moduleImageKey(moduleId);
  if (!key || !moduleImages.value[key]) return;

  try {
    await ElMessageBox.confirm("确定要移除该板块截图吗？", "移除截图", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      closeOnClickModal: false,
    });
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error("移除截图失败：" + (error?.message || ""));
    }
    return;
  }

  const site_id = websiteInfo?.site_id;
  if (!site_id || !props.pageId) {
    ElMessage.warning("缺少站点或页面信息");
    return;
  }

  const previousImages = moduleImages.value;
  const nextImages = { ...previousImages };
  delete nextImages[key];
  moduleImages.value = nextImages;
  removingImageKey.value = key;

  try {
    const res = await savePageConfig(
      site_id,
      String(props.pageId),
      buildPageMaterialsPayload(),
    );
    if (res?.code === 0) {
      ElMessage.success(res.message || "截图已移除");
    } else {
      moduleImages.value = previousImages;
      ElMessage.error(res?.message || "移除截图失败");
    }
  } catch (error) {
    moduleImages.value = previousImages;
    ElMessage.error("移除截图失败：" + (error?.message || ""));
  } finally {
    removingImageKey.value = null;
  }
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

const { websiteInfo, isAdmin } = useGlobalStore();

/** 媒体库 /api/media/* 的 demo 参数须为站点 Demo 名称（如 demo67），不可传 site_id */
function mediaDemoName() {
  const d = websiteInfo?.demo_site;
  return d != null && String(d).trim() !== "" ? String(d).trim() : "";
}

// ── 与 PageMode 相同的 visibleParts：左右列共用，保证一一对应 ────────────────

const fieldModules = import.meta.glob("/src/components/Field/**/*.vue", {
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
  return parts.filter(
    (part) => part && hasRenderableEditableInTree(part, editableMap),
  );
});

onMounted(async () => {});

// ── 递归更新原始数据中的节点 ─────────────────────────────────────────────────

function updateNodeInOriginalData(data, nodeId, fieldName, value) {
  if (!data) return false;

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      if (updateNodeInOriginalData(data[i], nodeId, fieldName, value))
        return true;
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
  console.log("开始提取可编辑数据...");
  const editableMap = extractEditableData(data);
  console.log("提取完成，可编辑节点数量:", editableMap.size);
  console.log("可编辑数据:", mapToObject(editableMap));
  return editableMap;
}

// ── 上传截图 ─────────────────────────────────────────────────────────────────

function openUploadDialog(moduleId, partIndex) {
  currentUploadModuleId = moduleId;
  currentUploadPartIndex = partIndex;
  selectedMediaId.value = null;
  mediaKeyword.value = "";
  uploadPageName.value = "";
  uploadTab.value = "upload";
  dialogVisible.value = true;
  loadMediaList();
}

function openUploadDialogFromHeader() {
  const first = visibleParts.value[0];
  if (!first?.id) {
    ElMessage.warning("暂无可上传截图的板块");
    return;
  }
  openUploadDialog(first.id);
}

// ── 媒体库 ──────────────────────────────────────────────────────────────────

async function loadMediaList() {
  const demo = mediaDemoName();
  if (!demo) {
    mediaList.value = [];
    ElMessage.warning("当前站点未配置 Demo 名称，无法加载媒体库");
    return;
  }
  mediaLoading.value = true;
  try {
    const res = await getMediaByDemo(demo);
    if (res?.code === 0 && Array.isArray(res.data?.list)) {
      mediaList.value = res.data.list;
    } else if (Array.isArray(res.data)) {
      mediaList.value = res.data;
    } else {
      mediaList.value = [];
    }
  } finally {
    mediaLoading.value = false;
  }
}

const filteredMediaList = computed(() => {
  if (!mediaKeyword.value.trim()) return mediaList.value;
  const kw = mediaKeyword.value.trim().toLowerCase();
  return mediaList.value.filter((item) => {
    const name = (item.name || item.file_name || "").toLowerCase();
    const url = (item.file_url || item.url || "").toLowerCase();
    return name.includes(kw) || url.includes(kw);
  });
});

let mediaSearchTimer = null;
function handleMediaSearch() {
  clearTimeout(mediaSearchTimer);
  mediaSearchTimer = setTimeout(() => {
    // 搜索已由 computed 处理
  }, 300);
}

function getFileName(path) {
  if (!path) return "";
  const parts = path.split("/");
  return parts[parts.length - 1] || "";
}

async function confirmSelectMedia() {
  const item = mediaList.value.find((m) => m.id === selectedMediaId.value);
  if (!item) return;
  const site_id = websiteInfo?.site_id;
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
  const pageId = String(props.pageId);
  await savePageConfig(site_id, pageId, buildPageMaterialsPayload());
  ElMessage.success("已从媒体库选择图片！");
  dialogVisible.value = false;
}

function handlePreviewClick(index) {
  activePartIndex.value = index;
}

function handleBeforeUpload(file) {
  if (!hasUploadPageName.value) {
    ElMessage.warning("璇峰厛濉啓椤甸潰鏍囪瘑鍐嶄笂浼犲浘鐗?");
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

const customUpload = async (file) => {
  uploading.value = true;
  try {
    const site_id = websiteInfo?.site_id;
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
    const pi = currentUploadPartIndex;
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
      const pageId = String(props.pageId);
      await savePageConfig(site_id, pageId, buildPageMaterialsPayload());
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
      const res2 = await getPageConfig(site_id, newId);
      if (res2?.code === 0) {
        const { materials = [], sizes = [] } = res2.data || {};
        // sizes from API contains module_id, so we map by ID instead of index.
        sectionSizes.value = {}; // Reset before populating
        if (Array.isArray(sizes)) {
          for (const s of sizes) {
            if (s && s.module_id) {
              const key = String(s.module_id);
              let w = s.width != null ? Number(s.width) : null;
              let h = s.height != null ? Number(s.height) : null;
              if (w != null && Number.isNaN(w)) w = null;
              if (h != null && Number.isNaN(h)) h = null;
              if (w !== null || h !== null) {
                sectionSizes.value[key] = { width: w, height: h };
              }
            }
          }
        }
        // materials 按索引对应板块：索引 0 -> 板块 1，索引 1 -> 板块 2...
        visibleParts.value.forEach((part, idx) => {
          const key = String(part.id);
          const found = materials[idx];
          if (!found || !found.url) return;
          moduleImages.value[key] = {
            id: found.id,
            url: found.url,
            demo: found.demo,
            page: found.page,
            file_url: getFileFullUrl(found.url),
          };
        });
      }
    }

    nextTick(() => {
      loadingInstance.close();
    });
  },
  { immediate: true },
);

// ── 监听高亮索引：展开后滚动（等折叠动画/layout 稳定再滚，避免错位） ────────────

function scrollEditorToActivePart(index) {
  if (index == null) return;
  const scrollEl = editorScrollRef.value;
  const itemEl = scrollEl?.querySelector(
    `.module-parts-collapse > .el-collapse-item:nth-child(${index + 1})`,
  );
  if (!scrollEl || !itemEl) return;
  const se = scrollEl.getBoundingClientRect();
  const ie = itemEl.getBoundingClientRect();
  const margin = 10;
  const outAbove = ie.top < se.top + margin;
  const outBelow = ie.bottom > se.bottom - margin;
  if (outAbove || outBelow) {
    const delta = ie.top - se.top - margin;
    scrollEl.scrollTop += delta;
  }
}

function scheduleScrollToActivePart(index) {
  if (index == null) return;
  const run = () => scrollEditorToActivePart(index);
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        run();
        setTimeout(run, 120);
      });
    });
  });
}

watch(
  () => activePartIndex.value,
  (index) => {
    scheduleScrollToActivePart(index);
  },
  { flush: "post" },
);

defineExpose({
  state,
  getFinalData,
  applyBulkFieldUpdates,
  saveSectionSizes,
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

/* 左侧预览区域（与右侧同：editor-scroll + editor-content + section-block） */
.preview-section {
  flex: 0 0 55%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-preview-intro {
  flex-shrink: 0;
}

.preview-intro-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #fff;
}

.preview-intro-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #303133;
}

.section-preview-block {
  display: flex;
  flex-direction: column;
  position: relative;
}

.preview-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1.25rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.preview-block-body {
  padding: 1.5rem;
  background: #fafbfc;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.preview-image-wrapper .el-image {
  display: block;
}

.preview-image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 8px;
  pointer-events: none;
}

.preview-image-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-image-wrapper:hover .preview-image-overlay {
  opacity: 1;
}

.preview-image-wrapper:hover .preview-image-remove,
.preview-image-remove.is-loading {
  opacity: 1;
}

.preview-image {
  width: 100%;
  max-height: 320px;
  height: auto;
  object-fit: contain;
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.preview-image-wrapper:hover .preview-image {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
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

/* 左侧预览：左侧色条 + 浅底，避免粗边框与缩放带来的跳动 */
.section-block.section-preview-block.is-active-part {
  transform: none;
  border-left: 4px solid #409eff;
  box-shadow: 0 4px 18px rgba(64, 158, 255, 0.16);
  background: linear-gradient(90deg, rgba(236, 245, 255, 0.75) 0%, #fff 42%);
  transition:
    box-shadow 0.2s ease,
    background 0.2s ease;
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

/* 右侧：单一手风琴 + 卡片外观 */
:deep(.module-parts-collapse) {
  border: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
:deep(.module-parts-collapse > .module-section-card.el-collapse-item) {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
}
:deep(.module-parts-collapse > .module-section-card.is-active-part) {
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.18);
}
:deep(.module-parts-collapse .el-collapse-item__header) {
  padding: 1.25rem 1.5rem;
  background: white;
  border: none;
  font-weight: 500;
  height: auto;
  line-height: 1.5;
  transition: background 0.2s ease;
}
:deep(
  .module-parts-collapse
    > .module-section-card.is-active-part
    .el-collapse-item__header
) {
  background: linear-gradient(90deg, rgba(236, 245, 255, 0.95) 0%, #fff 50%);
  box-shadow: inset 4px 0 0 #409eff;
}
:deep(.module-parts-collapse .el-collapse-item__wrap) {
  border: none;
  background: #fafbfc;
}
:deep(.module-parts-collapse .el-collapse-item__content) {
  padding: 0;
}

.upload-dialog-content {
  min-height: 300px;
}

/* 媒体库 */
:deep(.upload-tabs) {
  margin-top: -8px;
}
:deep(.upload-tabs .el-tabs__header) {
  margin-bottom: 16px;
}

.media-library {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-search {
  max-width: 280px;
}

.media-empty {
  padding: 40px 0;
  text-align: center;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
  padding: 4px;
}

.media-item {
  position: relative;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background: #fafbfc;
}

.media-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.media-item.is-selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.media-thumb {
  width: 100%;
  height: 90px;
  display: block;
}

.media-thumb-fallback {
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 24px;
  background: #f1f2f4;
}

.media-item-name {
  font-size: 0.7rem;
  color: #606266;
  padding: 4px 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.media-item-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.media-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.media-selected-tip {
  font-size: 0.875rem;
  color: #909399;
}
</style>
