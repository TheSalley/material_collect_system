<template>
  <div class="page-mode-container">
    <!-- 左侧：与右侧同结构的独立卡片列表，标题/标签/间距一致 -->
    <div class="preview-section">
      <div class="editor-scroll pretty-scroll">
        <div class="editor-content">
          <div v-for="(part, index) in visibleParts" :key="part.id" class="section-block section-preview-block" :class="{ 'is-active-part': activePartIndex === index }" @click="handlePreviewClick(index)">
            <div class="preview-block-header">
              <div class="collapse-title">
                <el-icon class="collapse-icon">
                  <Grid />
                </el-icon>
                <span class="collapse-text">板块 {{ index + 1 }}</span>
                <el-tag v-if="isDemoScreenshotBound(part.id, index)" size="small" type="success" effect="plain">
                  已绑定 Demo
                </el-tag>
              </div>
              <div v-if="isAdmin" class="preview-block-header__actions">
                <div class="preview-block-header__primary-actions">
                  <el-button type="primary" size="small" plain @click.stop="openUploadDialog(part.id, index)">
                    <el-icon>
                      <Upload />
                    </el-icon>
                    上传
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    plain
                    :loading="removingImageKey === moduleImageKey(part.id)"
                    :disabled="!getModuleImage(part.id)"
                    @click.stop="removeModuleImage(part.id)"
                  >
                    移除截图
                  </el-button>
                </div>
                <el-button
                  size="small"
                  :type="isDemoScreenshotBound(part.id, index) ? 'success' : 'primary'"
                  :plain="!isDemoScreenshotBound(part.id, index)"
                  :loading="bindingDemoImageKey === moduleImageKey(part.id)"
                  :disabled="!getModuleImage(part.id)"
                  @click.stop="toggleDemoScreenshot(part.id, index)"
                >
                  {{ isDemoScreenshotBound(part.id, index) ? "取消绑定 Demo" : "绑定 Demo" }}
                </el-button>
              </div>
            </div>
            <div class="preview-block-body">
              <div v-if="getModuleImage(part.id)" class="preview-image-wrapper">
                <el-image :src="getModuleImage(part.id).file_url" :preview-src-list="[getModuleImage(part.id).file_url]" fit="contain" class="preview-image" preview-teleported />
                <div class="preview-image-overlay">
                  <el-icon size="24">
                    <ZoomIn />
                  </el-icon>
                  <span>查看大图</span>
                </div>
                <div v-if="isAdmin" class="preview-image-actions" :class="{ 'is-visible': removingImageKey === moduleImageKey(part.id) }">
                  <el-button
                    class="preview-image-remove"
                    :icon="Delete"
                    :loading="removingImageKey === moduleImageKey(part.id)"
                    circle
                    size="small"
                    type="danger"
                    @click.stop="removeModuleImage(part.id)"
                  />
                </div>
              </div>
              <el-empty v-else description="未上传截图" :image-size="80" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：编辑区（独立滚动）；单个手风琴，避免「每板块一个 collapse」导致展开不同步 -->
    <div class="editor-section">
      <div v-if="state?.moduleId && state?.editableMap" ref="editorScrollRef" class="editor-scroll pretty-scroll">
        <el-collapse v-model="activeCollapseName" accordion class="module-parts-collapse">
          <el-collapse-item v-for="(part, index) in visibleParts" :key="part.id" :name="`part-${index}`" class="module-section-card" :class="{ 'is-active-part': activePartIndex === index }">
            <template #title>
              <div class="collapse-title">
                <el-icon class="collapse-icon">
                  <Grid />
                </el-icon>
                <span class="collapse-text">板块 {{ index + 1 }}</span>
                <el-tag size="small" type="info">{{ part.elType || "section" }}</el-tag>
              </div>
            </template>
            <div class="collapse-content">
              <DataExtractor v-if="part?.id" :original-node="part" :editable-map="state.editableMap" @update:field="handleFieldUpdate" />
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
              <el-input v-model="uploadPageName" placeholder="手动填写页面标识" />
            </el-form-item>
          </el-form>
          <el-upload drag action="#" :before-upload="handleBeforeUpload" :disabled="!hasUploadPageName">
            <el-icon class="el-icon--upload">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path fill="currentColor" d="M544 864V672h128L512 480 352 672h128v192H320v-1.6c-5.376.32-10.496 1.6-16 1.6A240 240 0 0 1 64 624c0-123.136 93.12-223.488 212.608-237.248A239.81 239.81 0 0 1 512 192a239.87 239.87 0 0 1 235.456 194.752c119.488 13.76 212.48 114.112 212.48 237.248a240 240 0 0 1-240 240c-5.376 0-10.56-1.28-16-1.6v1.6z"></path>
              </svg>
            </el-icon>
            <div class="el-upload__text">拖动文件或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">jpg/png/webp 图片，大小不超过 20MB</div>
            </template>
          </el-upload>
        </el-tab-pane>

        <!-- 媒体库 -->
        <el-tab-pane label="媒体库" name="library">
          <div class="media-library">
            <el-input v-model="mediaKeyword" placeholder="搜索素材名称" clearable class="media-search" @input="handleMediaSearch">
              <template #prefix
                ><el-icon> <Search /> </el-icon
              ></template>
            </el-input>
            <div v-loading="loading" class="media-content">
              <div v-if="rows.length === 0 && !loading" class="media-empty">
                <el-empty description="媒体库为空，请先上传" />
              </div>
              <div v-else class="flex flex-col">
                <div class="media-grid pretty-scroll">
                  <div v-for="item in rows" :key="item.id" class="media-item" :class="{ 'is-selected': selectedMediaId === item.id }" @click="selectedMediaId = item.id">
                    <el-image :src="getFileFullUrl(item.file_url || item.url)" fit="cover" class="media-thumb">
                      <template #error>
                        <div class="media-thumb-fallback">
                          <el-icon>
                            <Picture />
                          </el-icon>
                        </div>
                      </template>
                    </el-image>
                    <div class="media-item-name">
                      {{ item.page }}
                    </div>
                    <div v-if="selectedMediaId === item.id" class="media-item-check">
                      <el-icon>
                        <Check />
                      </el-icon>
                    </div>
                  </div>
                </div>
                <!-- 分页 -->
                <div class="px-6 pb-2 flex-shrink-0 flex items-center justify-between">
                  <span v-if="total > 0" class="text-xs text-gray-400 dark:text-gray-500">
                    共
                    <strong class="text-gray-600 dark:text-gray-300">{{ total }}</strong>
                    条素材
                    <span class="ml-2 text-gray-400">当前第 {{ page }}/{{ totalPages }} 页</span>
                  </span>
                  <span v-else-if="rows.length > 0 || searched" class="text-xs text-gray-400 dark:text-gray-500">
                    共
                    <strong class="text-gray-600 dark:text-gray-300">{{ rows.length }}</strong>
                    条素材
                  </span>
                  <div v-else />

                  <el-pagination v-if="total > 0" v-model:current-page="page" :total="total" layout="sizes, prev, pager, next" background size="small" @current-change="handlePageChange" />
                </div>
              </div>
            </div>

            <div v-if="rows.length > 0" class="media-footer">
              <span class="media-selected-tip">
                {{ selectedMediaId ? "已选择 1 项" : "请选择一项" }}
              </span>
              <el-button type="primary" :disabled="!selectedMediaId" :loading="loading" @click="confirmSelectMedia"> 确认选择 </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, computed, provide } from "vue";
import { storeToRefs } from "pinia";
import { Upload, Grid, Search, Picture, Check, ZoomIn, Delete } from "@element-plus/icons-vue";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import { getDemoConfig, getPageById, getPageConfig, getFileFullUrl, saveDemoConfig, savePageConfig, savePageSizes } from "@/apis/index.js";
import { saveMedia, getMediaByDemo } from "@/apis/media.js";
import DataExtractor from "./DataExtractor.vue";
import { useGlobalStore } from "@/stores/global";
import { extractEditableData, updateField, mapToObject } from "@/utils/dataExtractor.js";
import { normalizeElementorRoots, pickFieldModule } from "@/utils/elementorFieldUi.js";
import { buildUrlMatchTokens, hasSafeContainsMatch, hasTokenIntersection } from "@/utils/imageBlacklist.js";
import { useMedia } from "@/composables/useMedia";

const { queryDemo, page_name, loading, rows, page, total, totalPages, searched, loadMedia, handleQuery, handlePageChange, handleSizeChange, handleUpload: doUpload } = useMedia();

const dialogVisible = ref(false);
const uploading = ref(false);
const uploadTab = ref("upload");
const mediaLoading = ref(false);
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
const demoConfigState = ref({
  imgs: [],
  sizes: [],
  blacklist: [],
});
const removingImageKey = ref(null);
const bindingDemoImageKey = ref("");
const bindingDemoSizeKey = ref("");
let currentUploadModuleId = null;
let currentUploadPartIndex = null;

provide("bindDemoSize", toggleDemoSizeByNodeId);
provide("bindDemoSizeLoadingKey", bindingDemoSizeKey);
provide("isDemoSizeBound", isDemoSizeBound);

function moduleImageKey(id) {
  return id == null ? "" : String(id);
}

function currentDemoName() {
  const demo = websiteInfo.value?.demo_site || "";
  return String(demo || "").trim();
}

function cloneDemoConfigRecord(record = {}, demoName = "") {
  return {
    demo: demoName,
    imgs: Array.isArray(record?.imgs) ? [...record.imgs] : [],
    sizes: normalizeDemoSizeRecords(record?.sizes),
    blacklist: Array.isArray(record?.blacklist) ? [...record.blacklist] : [],
  };
}

function syncDemoConfigState(record = {}, demoName = "") {
  demoConfigState.value = cloneDemoConfigRecord(record, demoName);
}

async function fetchDemoConfigState() {
  const demoName = currentDemoName();
  if (!demoName) {
    syncDemoConfigState({}, "");
    return;
  }

  try {
    const res = await getDemoConfig(demoName);
    if (res?.code === 0) {
      syncDemoConfigState(res.data || {}, demoName);
      return;
    }
  } catch {
    // noop
  }

  syncDemoConfigState({}, demoName);
}

function normalizeComparableUrl(value) {
  return String(value || "").trim();
}

function normalizeDemoSizeRecords(value) {
  let raw = value;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw).flatMap(([key, item]) => {
      if (Array.isArray(item)) {
        return item;
      }

      if (item && typeof item === "object") {
        if (!item.module_id && key) {
          return [{ ...item, module_id: key }];
        }
        return [item];
      }

      return [];
    });
  }

  return [];
}

function resolveSizeImageUrl(sizeInfo = {}, moduleId = "", fallbackUrl = "") {
  const candidates = [fallbackUrl, buildModuleImageUrlPayload(moduleId), sizeInfo?.image_url];

  for (const candidate of candidates) {
    const url = normalizeComparableUrl(candidate);
    if (url) return url;
  }

  return "";
}

function extractSizeImageCandidate(sizeInfo = {}) {
  const candidates = [sizeInfo?.image_url, sizeInfo?.url, sizeInfo?.file_url, sizeInfo?.imageUrl];

  for (const candidate of candidates) {
    const url = normalizeComparableUrl(candidate);
    if (url) return url;
  }

  return "";
}

function isSameImageSource(sourceA = "", sourceB = "") {
  const a = normalizeComparableUrl(sourceA);
  const b = normalizeComparableUrl(sourceB);
  if (!a || !b) return false;
  if (a === b) return true;

  const aTokens = buildUrlMatchTokens(a);
  const bTokens = buildUrlMatchTokens(b);
  if (aTokens.length === 0 || bTokens.length === 0) return false;

  return hasTokenIntersection(aTokens, bTokens) || hasSafeContainsMatch(aTokens, bTokens);
}

function resolveDemoSizeModuleId(sizeInfo = {}, fallbackIndex = -1, visibleModuleIds = null) {
  const directModuleId = String(sizeInfo?.module_id || "").trim();
  if (directModuleId && (!visibleModuleIds || visibleModuleIds.has(directModuleId))) {
    return directModuleId;
  }

  const sizeImageUrl = extractSizeImageCandidate(sizeInfo);
  if (sizeImageUrl) {
    const matchedPartByCurrentImage = visibleParts.value.find((part) =>
      isSameImageSource(sizeImageUrl, buildModuleImageUrlPayload(part?.id)),
    );
    if (matchedPartByCurrentImage) {
      const matchedId = String(matchedPartByCurrentImage.id || "");
      if (matchedId && (!visibleModuleIds || visibleModuleIds.has(matchedId))) {
        return matchedId;
      }
    }

    const demoImages = Array.isArray(demoConfigState.value?.imgs) ? demoConfigState.value.imgs : [];
    const matchedDemoImageIndex = demoImages.findIndex((item) =>
      isSameImageSource(sizeImageUrl, item?.url || item?.file_url),
    );

    if (matchedDemoImageIndex >= 0) {
      const matchedDemoImage = demoImages[matchedDemoImageIndex];
      const matchedDemoModuleId = String(matchedDemoImage?.module_id || "").trim();
      if (matchedDemoModuleId && (!visibleModuleIds || visibleModuleIds.has(matchedDemoModuleId))) {
        return matchedDemoModuleId;
      }

      const matchedPartByIndex = visibleParts.value[matchedDemoImageIndex];
      const matchedIndexModuleId = String(matchedPartByIndex?.id || "").trim();
      if (matchedIndexModuleId && (!visibleModuleIds || visibleModuleIds.has(matchedIndexModuleId))) {
        return matchedIndexModuleId;
      }
    }
  }

  if (fallbackIndex >= 0) {
    const fallbackPart = visibleParts.value[fallbackIndex];
    const fallbackModuleId = String(fallbackPart?.id || "").trim();
    if (fallbackModuleId && (!visibleModuleIds || visibleModuleIds.has(fallbackModuleId))) {
      return fallbackModuleId;
    }
  }

  return "";
}

function replaceSizeRecordByModuleId(sizeList = [], nextSize) {
  const targetId = String(nextSize?.module_id || "");
  const filtered = Array.isArray(sizeList)
    ? sizeList.filter((item) => String(item?.module_id || "") !== targetId)
    : [];

  if (nextSize) {
    filtered.push(nextSize);
  }

  return filtered;
}

function replaceDemoImageRecordByModuleId(imageList = [], nextImage, partIndex = null) {
  const targetId = String(nextImage?.module_id || "");
  const filtered = Array.isArray(imageList)
    ? imageList.filter((item, index) => {
        if (String(item?.module_id || "") === targetId) return false;
        if ((!item?.module_id || String(item?.module_id || "") === "") && partIndex != null && index === partIndex) {
          return false;
        }
        return true;
      })
    : [];

  if (nextImage) {
    filtered.push(nextImage);
  }

  return filtered;
}

function removeDemoImageRecordByModuleId(imageList = [], moduleId, partIndex = null) {
  const targetId = String(moduleId || "");
  if (!targetId) return Array.isArray(imageList) ? [...imageList] : [];

  return Array.isArray(imageList)
    ? imageList.filter((item, index) => {
        if (String(item?.module_id || "") === targetId) return false;
        if ((!item?.module_id || String(item?.module_id || "") === "") && partIndex != null && index === partIndex) {
          return false;
        }
        return true;
      })
    : [];
}

function removeSizeRecordByModuleId(sizeList = [], moduleId) {
  const targetId = String(moduleId || "");
  if (!targetId) return Array.isArray(sizeList) ? [...sizeList] : [];

  return Array.isArray(sizeList)
    ? sizeList.filter((item) => String(item?.module_id || "") !== targetId)
    : [];
}

async function updateDemoConfig(mutator, successMessage, fields = ["imgs", "sizes", "blacklist"]) {
  const demoName = currentDemoName();
  if (!demoName) {
    ElMessage.warning("当前站点还没有绑定 Demo，无法同步");
    return { ok: false };
  }

  try {
    const detailRes = await getDemoConfig(demoName);
    const payload = cloneDemoConfigRecord(detailRes?.code === 0 ? detailRes.data : {}, demoName);

    await mutator(payload);

    const savePayload = { demo: demoName };
    fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        savePayload[field] = payload[field];
      }
    });

    const saveRes = await saveDemoConfig(savePayload);
    if (saveRes?.code === 0) {
      const nextState = saveRes?.data
        ? { ...payload, ...saveRes.data }
        : payload;
      syncDemoConfigState(nextState, demoName);
      ElMessage.success(saveRes.message || successMessage);
      return { ok: true, data: nextState };
    }

    ElMessage.error(saveRes?.message || "同步 Demo 配置失败");
    return { ok: false };
  } catch (error) {
    ElMessage.error(error?.message || "同步 Demo 配置失败");
    return { ok: false };
  }
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

function buildDemoImagePayloadByModuleId(moduleId) {
  const currentImage = getModuleImage(moduleId);
  const rawUrl = String(currentImage?.url || currentImage?.file_url || "").trim();
  if (!moduleId || !rawUrl) return null;

  return {
    module_id: String(moduleId),
    url: rawUrl.startsWith("http") ? rawUrl : getFileFullUrl(rawUrl),
  };
}

function buildModuleImageUrlPayload(moduleId) {
  const currentImage = getModuleImage(moduleId);
  const rawUrl = String(currentImage?.url || currentImage?.file_url || "").trim();
  if (!rawUrl) return "";
  return rawUrl.startsWith("http") ? rawUrl : getFileFullUrl(rawUrl);
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
      const imageUrl = resolveSizeImageUrl(sizeInfo, moduleId);
      if (imageUrl) {
        out.image_url = imageUrl;
      }
      acc.push(out);
    }
    return acc;
  }, []);

  console.log("buildPageSizesPayload result:", result);
  return result;
}

function buildDemoSizePayloadByNodeId(nodeId, imageUrlOverride = "") {
  const key = String(nodeId || "");
  if (!key) return null;

  const sizeInfo = sectionSizes.value?.[key];
  const width = Number(sizeInfo?.width);
  const height = Number(sizeInfo?.height);
  const payload = { module_id: key };

  if (!Number.isNaN(width) && width > 0) {
    payload.width = Math.round(width);
  }
  if (!Number.isNaN(height) && height > 0) {
    payload.height = Math.round(height);
  }
  const imageUrl = resolveSizeImageUrl(sizeInfo, key, imageUrlOverride);
  if (imageUrl) {
    payload.image_url = imageUrl;
  }

  return payload.width || payload.height ? payload : null;
}

function findDemoImageRecord(moduleId, partIndex) {
  const targetId = String(moduleId || "");
  const demoImages = Array.isArray(demoConfigState.value?.imgs) ? demoConfigState.value.imgs : [];
  const matchedByModuleId = demoImages.find((item) => String(item?.module_id || "") === targetId);
  if (matchedByModuleId) return matchedByModuleId;
  return partIndex != null ? demoImages[partIndex] || null : null;
}

function applyPageConfigState(materials = [], sizes = []) {
  sectionSizes.value = {};
  if (Array.isArray(sizes)) {
    for (const s of sizes) {
      if (s && s.module_id) {
        const key = String(s.module_id);
        let w = s.width != null ? Number(s.width) : null;
        let h = s.height != null ? Number(s.height) : null;
        if (w != null && Number.isNaN(w)) w = null;
        if (h != null && Number.isNaN(h)) h = null;
        if (w !== null || h !== null) {
          sectionSizes.value[key] = {
            width: w,
            height: h,
            image_url: resolveSizeImageUrl(s, key),
          };
        }
      }
    }
  }

  const nextImages = {};
  visibleParts.value.forEach((part, idx) => {
    const key = String(part.id);
    const found = Array.isArray(materials) ? materials[idx] : null;
    if (!found || !found.url) return;
    nextImages[key] = {
      id: found.id,
      url: found.url,
      demo: found.demo,
      page: found.page,
      file_url: getFileFullUrl(found.url),
    };
  });
  moduleImages.value = nextImages;
}

async function refreshPageConfigState(pageId = props.pageId) {
  const site_id = websiteInfo.value?.site_id;
  if (!site_id || !pageId) {
    moduleImages.value = {};
    sectionSizes.value = {};
    return { ok: false };
  }

  try {
    const res = await getPageConfig(site_id, String(pageId));
    if (res?.code === 0) {
      const { materials = [], sizes = [] } = res.data || {};
      applyPageConfigState(materials, sizes);
      return { ok: true, data: res.data || {} };
    }
  } catch {
    // noop
  }

  moduleImages.value = {};
  sectionSizes.value = {};
  return { ok: false };
}

function isDemoScreenshotBound(moduleId, partIndex) {
  const currentImage = getModuleImage(moduleId);
  const demoImage = findDemoImageRecord(moduleId, partIndex);
  if (!currentImage || !demoImage) return false;

  const currentUrl = normalizeComparableUrl(currentImage.url || currentImage.file_url);
  const demoUrl = normalizeComparableUrl(demoImage.url || demoImage.file_url);

  return Boolean(currentUrl) && currentUrl === demoUrl;
}

function isDemoSizeBound(nodeId) {
  const currentSize = buildDemoSizePayloadByNodeId(nodeId);
  if (!currentSize) return false;

  const matched = normalizeDemoSizeRecords(demoConfigState.value?.sizes).find(
    (item) => String(item?.module_id || "") === String(nodeId || ""),
  );

  if (!matched) return false;

  const currentWidth = currentSize.width ?? null;
  const currentHeight = currentSize.height ?? null;
  const currentImageUrl = resolveSizeImageUrl(currentSize, nodeId);
  const matchedWidth = matched?.width != null ? Number(matched.width) : null;
  const matchedHeight = matched?.height != null ? Number(matched.height) : null;
  const matchedImageUrl = resolveSizeImageUrl(matched, nodeId);

  if (currentImageUrl || matchedImageUrl) {
    return currentWidth === matchedWidth && currentHeight === matchedHeight && currentImageUrl === matchedImageUrl;
  }

  return currentWidth === matchedWidth && currentHeight === matchedHeight;
}

async function saveSectionSizes() {
  const site_id = websiteInfo.value?.site_id;
  if (!site_id || !props.pageId) {
    ElMessage.warning("缺少站点或页面信息");
    return;
  }
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    text: "正在保存尺寸...",
  });
  try {
    const res = await savePageSizes(site_id, String(props.pageId), buildPageSizesPayload());
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

async function bindDemoScreenshot(moduleId, partIndex) {
  const imageKey = moduleImageKey(moduleId);
  const imagePayload = buildDemoImagePayloadByModuleId(moduleId);
  if (!imageKey) {
    return;
  }
  if (!imagePayload) {
    ElMessage.warning("当前板块还没有可绑定的截图");
    return;
  }

  bindingDemoImageKey.value = imageKey;
  try {
    await updateDemoConfig((payload) => {
      payload.imgs = replaceDemoImageRecordByModuleId(payload.imgs, imagePayload, partIndex);
    }, "当前板块截图已绑定到 Demo", ["imgs"]);
  } finally {
    bindingDemoImageKey.value = "";
  }
}

async function toggleDemoScreenshot(moduleId, partIndex) {
  if (!isDemoScreenshotBound(moduleId, partIndex)) {
    return await bindDemoScreenshot(moduleId, partIndex);
  }

  const imageKey = moduleImageKey(moduleId);
  if (!imageKey) {
    return { ok: false };
  }

  bindingDemoImageKey.value = imageKey;
  try {
    return await updateDemoConfig((payload) => {
      payload.imgs = removeDemoImageRecordByModuleId(payload.imgs, moduleId, partIndex);
    }, "已取消 Demo 截图绑定", ["imgs"]);
  } finally {
    bindingDemoImageKey.value = "";
  }
}

async function bindAllDemoScreenshots() {
  const site_id = websiteInfo.value?.site_id;
  if (!site_id || !props.pageId) {
    ElMessage.warning("缺少站点或页面信息");
    return { ok: false };
  }

  let materials = [];

  try {
    const res = await getPageConfig(site_id, String(props.pageId));
    materials = Array.isArray(res?.data?.materials) ? res.data.materials : [];
  } catch (error) {
    ElMessage.error(error?.message || "获取页面截图配置失败");
    return { ok: false };
  }

  const normalizedMaterials = materials.map((item) => {
    if (!item?.url) return null;
    return {
      ...item,
      url: String(item.url || "").startsWith("http") ? item.url : getFileFullUrl(item.url),
    };
  });

  const count = normalizedMaterials.filter(Boolean).length;
  if (count === 0) {
    ElMessage.warning("当前页面还没有已保存的截图配置");
    return { ok: false };
  }

  return await updateDemoConfig((payload) => {
    payload.imgs = normalizedMaterials
      .map((item, index) => {
        const part = visibleParts.value[index];
        if (!item?.url || !part?.id) return null;
        return {
          module_id: String(part.id),
          url: item.url,
        };
      })
      .filter(Boolean);
  }, `已同步 ${count} 张截图到 Demo`, ["imgs"]);
}

async function bindDemoSizeByNodeId(nodeId, imageUrl = "") {
  const sizePayload = buildDemoSizePayloadByNodeId(nodeId, imageUrl);
  if (!sizePayload) {
    ElMessage.warning("请先填写建议尺寸后再绑定 Demo");
    return { ok: false };
  }

  bindingDemoSizeKey.value = String(nodeId || "");
  try {
    return await updateDemoConfig((payload) => {
      payload.sizes = replaceSizeRecordByModuleId(payload.sizes, sizePayload);
      if (sectionSizes.value?.[String(nodeId || "")]) {
        sectionSizes.value[String(nodeId || "")] = {
          ...sectionSizes.value[String(nodeId || "")],
          image_url: sizePayload.image_url || "",
        };
      }
    }, "当前建议尺寸已绑定到 Demo", ["sizes"]);
  } finally {
    bindingDemoSizeKey.value = "";
  }
}

async function toggleDemoSizeByNodeId(nodeId, imageUrl = "") {
  if (!isDemoSizeBound(nodeId)) {
    return await bindDemoSizeByNodeId(nodeId, imageUrl);
  }

  bindingDemoSizeKey.value = String(nodeId || "");
  try {
    return await updateDemoConfig((payload) => {
      payload.sizes = removeSizeRecordByModuleId(payload.sizes, nodeId);
    }, "已取消 Demo 尺寸绑定", ["sizes"]);
  } finally {
    bindingDemoSizeKey.value = "";
  }
}

async function bindAllDemoSizes() {
  const sizes = buildPageSizesPayload();
  if (sizes.length === 0) {
    ElMessage.warning("当前页面还没有可同步的图片尺寸");
    return { ok: false };
  }

  return await updateDemoConfig((payload) => {
    payload.sizes = sizes;
  }, `已同步 ${sizes.length} 条图片尺寸到 Demo`, ["sizes"]);
}

async function applyDemoScreenshots(demoImages = []) {
  const site_id = websiteInfo.value?.site_id;
  if (!site_id || !props.pageId) {
    ElMessage.warning("缺少站点或页面信息");
    return { ok: false };
  }

  const imageList = Array.isArray(demoImages) ? demoImages : [];
  const normalizedMaterials = visibleParts.value.map((part) => {
    const item = imageList.find((entry) => String(entry?.module_id || "") === String(part?.id || ""));
    const rawUrl = String(item?.url || item?.file_url || "").trim();
    if (!rawUrl) return null;

    const fullUrl = rawUrl.startsWith("http") ? rawUrl : getFileFullUrl(rawUrl);
    return {
      id: item?.id,
      demo: item?.demo || currentDemoName(),
      page: item?.page || "",
      url: fullUrl,
      file_url: fullUrl,
      moduleId: String(part.id),
    };
  });

  const count = normalizedMaterials.filter(Boolean).length;
  if (count === 0) {
    ElMessage.warning("当前 Demo 没有可用截图");
    return { ok: false };
  }

  try {
    const payload = normalizedMaterials.map((item) => {
      if (!item) return null;
      return {
        id: item.id,
        demo: item.demo,
        page: item.page,
        url: item.url,
      };
    });

    const res = await savePageConfig(site_id, String(props.pageId), payload);
    if (res?.code === 0) {
      const nextImages = {};
      normalizedMaterials.forEach((item) => {
        if (!item?.moduleId) return;
        nextImages[String(item.moduleId)] = {
          id: item.id,
          demo: item.demo,
          page: item.page,
          url: item.url,
          file_url: item.file_url,
        };
      });
      moduleImages.value = nextImages;
      ElMessage.success(res.message || `已获取 ${count} 张 Demo 截图`);
      return { ok: true };
    }

    ElMessage.error(res?.message || "获取 Demo 截图失败");
    return { ok: false };
  } catch (error) {
    ElMessage.error(error?.message || "获取 Demo 截图失败");
    return { ok: false };
  }
}

async function applyDemoSizes(demoSizes = []) {
  if (!props.pageId) {
    ElMessage.warning("缺少页面信息");
    return { ok: false };
  }

  const visibleModuleIds = new Set(
    visibleParts.value
      .map((part) => String(part?.id || ""))
      .filter(Boolean),
  );

  const currentSizes = { ...sectionSizes.value };
  const nextSizes = Object.entries(currentSizes).reduce((acc, [moduleId, value]) => {
    if (!visibleModuleIds.has(String(moduleId || ""))) {
      acc[moduleId] = value;
    }
    return acc;
  }, {});

  const normalizedDemoSizes = normalizeDemoSizeRecords(demoSizes);

  for (const [index, item] of normalizedDemoSizes.entries()) {
    const moduleId = resolveDemoSizeModuleId(item, index, visibleModuleIds);
    if (!moduleId) continue;

    const width = item?.width != null ? Number(item.width) : null;
    const height = item?.height != null ? Number(item.height) : null;
    const hasWidth = Number.isFinite(width) && width > 0;
    const hasHeight = Number.isFinite(height) && height > 0;
    if (!hasWidth && !hasHeight) continue;
    const imageUrl = resolveSizeImageUrl(item, moduleId);

    nextSizes[moduleId] = {
      width: hasWidth ? Math.round(width) : null,
      height: hasHeight ? Math.round(height) : null,
      image_url: imageUrl,
    };
  }

  const payload = Object.entries(nextSizes).reduce((acc, [moduleId, size]) => {
    const width = size?.width != null ? Number(size.width) : null;
    const height = size?.height != null ? Number(size.height) : null;
    const hasWidth = Number.isFinite(width) && width > 0;
    const hasHeight = Number.isFinite(height) && height > 0;

    if (!hasWidth && !hasHeight) return acc;

    const record = { module_id: moduleId };
    if (hasWidth) {
      record.width = Math.round(width);
    }
    if (hasHeight) {
      record.height = Math.round(height);
    }
    const imageUrl = normalizeComparableUrl(size?.image_url || "");
    if (imageUrl) {
      record.image_url = imageUrl;
    }
    acc.push(record);
    return acc;
  }, []);

  if (payload.length === 0) {
    ElMessage.warning("当前 Demo 没有可用图片尺寸");
    return { ok: false };
  }

  sectionSizes.value = nextSizes;
  ElMessage.success(`已获取 ${payload.length} 条 Demo 图片尺寸`);
  return { ok: true };
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

  const site_id = websiteInfo.value?.site_id;
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
    const res = await savePageConfig(site_id, String(props.pageId), buildPageMaterialsPayload());
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

const globalStore = useGlobalStore();
const { websiteInfo, isAdmin } = storeToRefs(globalStore);

/** 媒体库 /api/media/* 的 demo 参数须为站点 Demo 名称（如 demo67），不可传 site_id */
function mediaDemoName() {
  const d = websiteInfo.value?.demo_site;
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
  return parts.filter((part) => part && hasRenderableEditableInTree(part, editableMap));
});

onMounted(async () => {
  console.log("ModuleMode mounted, loading media with demo:", mediaDemoName());
  queryDemo.value = mediaDemoName();
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
  page_name.value = "";
  uploadPageName.value = "";
  uploadTab.value = "upload";
  dialogVisible.value = true;
  // 重置分页并加载媒体列表
  page.value = 1;
  loadMedia();
}

function openUploadDialogFromHeader() {
  const first = visibleParts.value[0];
  if (!first?.id) {
    ElMessage.warning("暂无可上传截图的板块");
    return;
  }
  openUploadDialog(first.id);
}

const filteredMediaList = computed(() => {
  return rows.value;
});

let mediaSearchTimer = null;
async function handleMediaSearch() {
  if (mediaSearchTimer) clearTimeout(mediaSearchTimer);
  mediaSearchTimer = setTimeout(async () => {
    const keyword = mediaKeyword.value.trim();
    console.log('搜索关键词:', keyword);
    page_name.value = keyword;
    console.log('设置 page_name:', page_name.value);
    page.value = 1;
    console.log('开始加载媒体列表...');
    await loadMedia();
    console.log('加载完成，结果数量:', rows.value.length);
  }, 300);
}

function getFileName(path) {
  if (!path) return "";
  const parts = path.split("/");
  return parts[parts.length - 1] || "";
}

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
  const pageId = String(props.pageId);
  try {
    await savePageConfig(site_id, pageId, buildPageMaterialsPayload());
    ElMessage.success("已从媒体库选择图片！");
    dialogVisible.value = false;
  } catch (e) {
    ElMessage.error("保存失败：" + (e?.message || "未知错误"));
  }
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

function scrollEditorToActivePart(index) {
  if (index == null) return;
  const scrollEl = editorScrollRef.value;
  const itemEl = scrollEl?.querySelector(`.module-parts-collapse > .el-collapse-item:nth-child(${index + 1})`);
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

.preview-block-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-block-header__primary-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
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
  position: static;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-image-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-image-wrapper:hover .preview-image-overlay {
  opacity: 1;
}

.preview-image-wrapper:hover .preview-image-actions,
.preview-image-actions.is-visible {
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

:deep(.module-parts-collapse > .module-section-card.is-active-part .el-collapse-item__header) {
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
  grid-template-columns: repeat(5, 1fr);
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
