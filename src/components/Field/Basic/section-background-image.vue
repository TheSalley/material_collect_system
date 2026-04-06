<template>
  <div v-if="shouldShowSection" class="field-item section-bg-field">
    <label class="field-label">
      <el-icon><PictureFilled /></el-icon>
      背景图
    </label>

    <div v-if="hasSizeEditor" class="size-config-row">
      <span class="hint-line size-config-label">截图目标尺寸（板块 {{ sectionIndex + 1 }}，与左侧截图一致）</span>
      <div class="size-inputs">
        <el-input-number
          v-model="sectionSizes[sectionIndex].width"
          :min="1"
          :max="16384"
          controls-position="right"
          placeholder="宽"
        />
        <span class="size-x">×</span>
        <el-input-number
          v-model="sectionSizes[sectionIndex].height"
          :min="1"
          :max="16384"
          controls-position="right"
          placeholder="高"
        />
        <span class="size-unit">px</span>
      </div>
      <p v-if="configuredDimsLabel" class="hint-line">{{ configuredDimsLabel }}</p>
    </div>

    <!-- 主背景图：仅当数据里已有主背景时才渲染（与 WP 一致，不在此凭空补空块） -->
    <div
      v-if="hasMainBg"
      class="bg-block"
      v-loading="bgUploading"
      element-loading-text="正在上传…"
    >
      <div class="bg-block__title">主背景图</div>
      <div v-if="bgImageUrl" class="image-preview mb-3">
        <img :src="bgImageUrl" alt="背景预览" @error="onBgImgError" />
      </div>
      <p v-else-if="bgResolveLoading" class="resolve-loading">正在解析图片地址…</p>
      <p v-else-if="bgResolveFailed" class="resolve-failed">
        仅有媒体 ID、无法在媒体库中解析出地址时无法预览，请重新上传。
      </p>
      <el-upload
        action="#"
        :before-upload="(file) => handleBeforeUpload(file, 'background_image')"
        :show-file-list="false"
        class="upload-wrapper"
      >
        <el-button
          type="primary"
          :icon="Upload"
          :loading="bgUploading"
          :disabled="bgUploading"
        >
          上传主背景图
        </el-button>
      </el-upload>
      <div class="field-upload-hints">
        <p v-if="bgSizeInfo.label" class="hint-line">{{ bgSizeInfo.label }}</p>
        <p class="hint-line">{{ uploadTip }}</p>
      </div>
    </div>

    <!-- 叠加层图：仅当数据里已有叠加层图时才渲染 -->
    <div
      v-if="hasOverlayBg"
      class="bg-block"
      v-loading="overlayUploading"
      element-loading-text="正在上传…"
    >
      <div class="bg-block__title">叠加层图</div>
      <div v-if="overlayImageUrl" class="image-preview mb-3">
        <img :src="overlayImageUrl" alt="叠加层预览" @error="onOverlayImgError" />
      </div>
      <p v-else-if="overlayResolveLoading" class="resolve-loading">正在解析图片地址…</p>
      <p v-else-if="overlayResolveFailed" class="resolve-failed">
        仅有媒体 ID、无法在媒体库中解析出地址时无法预览，请重新上传。
      </p>
      <el-upload
        action="#"
        :before-upload="(file) => handleBeforeUpload(file, 'background_overlay_image')"
        :show-file-list="false"
        class="upload-wrapper"
      >
        <el-button
          type="primary"
          :icon="Upload"
          :loading="overlayUploading"
          :disabled="overlayUploading"
        >
          上传叠加层图
        </el-button>
      </el-upload>
      <div class="field-upload-hints">
        <p v-if="overlaySizeInfo.label" class="hint-line">{{ overlaySizeInfo.label }}</p>
        <p class="hint-line">{{ uploadTip }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, inject } from "vue";
import { PictureFilled, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  uploadImageFile,
  IMAGE_UPLOAD_DEFAULTS,
  buildImageUploadTip,
  getImageNaturalSizeFromUrl,
  getImageNaturalSizeFromFile,
  formatNaturalSizeLabel,
} from "@/utils/imageUpload";
import { getFileFullUrl } from "@/apis";
import { useGlobalStore } from "@/stores/global";
import { resolveAttachmentPreviewUrl } from "@/utils/mediaResolve";

const props = defineProps({
  nodeId: { type: String, required: true },
  fields: { type: Object, required: true },
  onUpdate: { type: Function, required: true },
  /** 与 ModuleMode 左侧板块 index 对齐（0-based） */
  sectionIndex: { type: Number, default: undefined },
});

const sectionSizes = inject("sectionSizes", null);
const hasSizeEditor = computed(
  () =>
    sectionSizes != null &&
    props.sectionIndex != null &&
    props.sectionIndex >= 0 &&
    sectionSizes.value[props.sectionIndex]
);
const configuredDims = computed(() => {
  if (!hasSizeEditor.value) return null;
  const s = sectionSizes.value[props.sectionIndex];
  const w = Number(s.width);
  const h = Number(s.height);
  if (!Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0) return { width: w, height: h };
  return null;
});
const configuredDimsLabel = computed(() => {
  const d = configuredDims.value;
  if (!d) return "";
  return `上传建议尺寸 ${d.width}×${d.height}px（可在「保存尺寸」中记录当前值）`;
});

function pickRawImageUrl(val) {
  if (val == null) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val !== "object") return "";
  const candidates = [
    val.url,
    val.src,
    val.path,
    val.link,
    val.thumb,
    val.image?.url,
    val.sizes?.full?.url,
    val.sizes?.large?.url,
    val.sizes?.medium?.url,
  ];
  for (const u of candidates) {
    if (typeof u === "string" && u.trim()) {
      const t = u.trim();
      if (t.includes("elementor-placeholder")) continue;
      return t;
    }
    if (Array.isArray(u) && typeof u[0] === "string" && u[0].trim()) {
      const t = u[0].trim();
      if (t.includes("elementor-placeholder")) continue;
      return t;
    }
  }
  return "";
}

function toDisplayUrl(raw) {
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("//")) {
    return raw.startsWith("//") ? `https:${raw}` : raw;
  }
  return getFileFullUrl(raw);
}

const globalStore = useGlobalStore();
function useMaybeResolveImage(fieldKey) {
  const resolvedUrl = ref("");
  const resolveLoading = ref(false);
  const resolveFailed = ref(false);
  let resolveSeq = 0;

  const directUrl = computed(() =>
    toDisplayUrl(pickRawImageUrl(props.fields?.[fieldKey]))
  );
  const imageUrl = computed(() => directUrl.value || resolvedUrl.value);

  const attachmentIdFromVal = (v) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return "";
    const id = v.id;
    if (id == null || id === "") return "";
    const s = String(id).trim();
    return s && s !== "0" ? s : "";
  };

  watch(
    () => ({
      v: props.fields?.[fieldKey],
      siteId: globalStore.websiteInfo?.site_id,
      direct: directUrl.value,
    }),
    async ({ v, siteId, direct }) => {
      resolvedUrl.value = "";
      resolveFailed.value = false;
      if (direct) return;
      const aid = attachmentIdFromVal(v);
      if (!aid || !siteId) return;

      const seq = ++resolveSeq;
      resolveLoading.value = true;
      try {
        const url = await resolveAttachmentPreviewUrl(siteId, aid);
        if (seq !== resolveSeq) return;
        if (url) {
          resolvedUrl.value = url;
          resolveFailed.value = false;
        } else {
          resolveFailed.value = true;
        }
      } finally {
        if (seq === resolveSeq) resolveLoading.value = false;
      }
    },
    { immediate: true, deep: true }
  );

  const onImgError = () => { resolvedUrl.value = ""; };

  return { imageUrl, resolveLoading, resolveFailed, onImgError };
}

const {
  imageUrl: bgImageUrl,
  resolveLoading: bgResolveLoading,
  resolveFailed: bgResolveFailed,
  onImgError: onBgImgError,
} = useMaybeResolveImage("background_image");

const {
  imageUrl: overlayImageUrl,
  resolveLoading: overlayResolveLoading,
  resolveFailed: overlayResolveFailed,
  onImgError: onOverlayImgError,
} = useMaybeResolveImage("background_overlay_image");

function hasData(v) {
  if (v == null || v === "") return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "object" && !Array.isArray(v)) {
    if (pickRawImageUrl(v)) return true;
    const id = v.id;
    if (id == null || id === "") return false;
    const s = String(id).trim();
    return s.length > 0 && s !== "0";
  }
  return false;
}

const hasMainBg = computed(() => hasData(props.fields?.background_image));
const hasOverlayBg = computed(() => hasData(props.fields?.background_overlay_image));
const shouldShowSection = computed(() => hasMainBg.value || hasOverlayBg.value);

const uploadTip = buildImageUploadTip(IMAGE_UPLOAD_DEFAULTS);
const bgUploading = ref(false);
const overlayUploading = ref(false);
const bgSizeInfo = ref({ label: "", dims: null });
const overlaySizeInfo = ref({ label: "", dims: null });

watch(
  () => bgImageUrl.value,
  async (url) => {
    bgSizeInfo.value = { label: "", dims: null };
    if (!url) return;
    const dim = await getImageNaturalSizeFromUrl(url);
    bgSizeInfo.value = { label: formatNaturalSizeLabel(dim), dims: dim };
  },
  { immediate: true }
);

watch(
  () => overlayImageUrl.value,
  async (url) => {
    overlaySizeInfo.value = { label: "", dims: null };
    if (!url) return;
    const dim = await getImageNaturalSizeFromUrl(url);
    overlaySizeInfo.value = { label: formatNaturalSizeLabel(dim), dims: dim };
  },
  { immediate: true }
);

async function handleBeforeUpload(file, fieldKey) {
  const sizeInfo = fieldKey === "background_overlay_image" ? overlaySizeInfo : bgSizeInfo;
  const refDim = configuredDims.value || sizeInfo.value.dims;
  if (refDim) {
    const dim = await getImageNaturalSizeFromFile(file);
    if (dim && (dim.width !== refDim.width || dim.height !== refDim.height)) {
      ElMessage.warning(
        `图片尺寸 ${dim.width}×${dim.height}px 与建议尺寸 ${refDim.width}×${refDim.height}px 不一致，但仍将上传`
      );
    }
  }

  const uploadingRef = fieldKey === "background_overlay_image" ? overlayUploading : bgUploading;
  uploadingRef.value = true;
  try {
    const result = await uploadImageFile(file);
    if (result) {
      const cur = props.fields?.[fieldKey];
      const base =
        cur != null && typeof cur === "object" && !Array.isArray(cur) ? { ...cur } : {};
      props.onUpdate(fieldKey, {
        ...base,
        url: result.url || base.url || "",
        id: result.id != null ? result.id : base.id,
      });
    }
  } finally {
    uploadingRef.value = false;
  }
  return false;
}
</script>

<style scoped>
.section-bg-field {
  border: 1px dashed var(--el-color-primary-light-5);
  border-radius: 8px;
  padding: 12px;
  background: var(--el-fill-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.field-label .el-icon {
  color: var(--el-color-primary);
  font-size: 1.1rem;
}

.bg-block {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 10px;
  background: #fff;
  position: relative;
}

.bg-block__title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #606266;
  margin-bottom: 0.5rem;
}

.image-preview {
  width: 100%;
  max-width: 400px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

.upload-wrapper {
  width: 100%;
}

.upload-wrapper :deep(.el-upload) {
  width: 100%;
}

.upload-wrapper :deep(.el-button) {
  width: 100%;
}

.field-upload-hints {
  margin-top: 0.5rem;
}

.field-upload-hints .hint-line {
  margin: 0 0 0.35rem;
  font-size: 0.75rem;
  color: #909399;
  line-height: 1.45;
}

.field-upload-hints .hint-line:last-child {
  margin-bottom: 0;
}

.resolve-loading,
.resolve-failed {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
}

.resolve-loading {
  color: var(--el-color-primary);
}

.resolve-failed {
  color: var(--el-color-warning);
}

.size-config-row {
  margin-top: 0.5rem;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  border: 1px dashed var(--el-border-color);
}

.size-config-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  color: #606266;
}

.size-inputs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.size-inputs .el-input-number {
  width: 120px;
}

.size-x,
.size-unit {
  font-size: 0.85rem;
  color: #909399;
}
</style>
