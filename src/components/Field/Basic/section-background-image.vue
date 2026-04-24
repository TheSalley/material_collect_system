<template>
  <div v-if="shouldShowSection" class="__field-item section-bg-field">
    <label class="__field-label">
      <el-icon><PictureFilled /></el-icon>
      背景图
    </label>
    <!-- 主背景图：仅当数据里已有主背景时才渲染（与 WP 一致，不在此凭空补空块） -->
    <div
      v-if="hasMainBg"
      class="bg-block"
      element-loading-text="正在上传…"
    >
      <div class="bg-block__title">主背景图</div>
      <ImageWp
        :model-value="fields.background_image"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="(newImageData) => onUpdate('background_image', newImageData)"
      />
    </div>

    <!-- 叠加层图：仅当数据里已有叠加层图时才渲染 -->
    <div
      v-if="hasOverlayBg"
      class="bg-block"
      element-loading-text="正在上传…"
    >
      <div class="bg-block__title">叠加层图</div>
      <ImageWp
        :model-value="fields.background_overlay_image"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="(newImageData) => onUpdate('background_overlay_image', newImageData)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { PictureFilled } from "@element-plus/icons-vue";
import {
  getImageNaturalSizeFromUrl,
  formatNaturalSizeLabel,
} from "@/utils/imageUpload";
import { getFileFullUrl } from "@/apis";
import { useGlobalStore } from "@/stores/global";
import { resolveAttachmentPreviewUrl } from "@/utils/mediaResolve";


import ImageWp from "@/components/Common/imageWp.vue";

const props = defineProps({
  nodeId: { type: String, required: true },
  fields: { type: Object, required: true },
  onUpdate: { type: Function, required: true },
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

  const onImgError = () => { resolvedUrl.value = ""; };

  return { imageUrl, resolveLoading, resolveFailed, onImgError };
}

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

.__field-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.__field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.__field-label .el-icon {
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

/* 截图目标尺寸：内嵌在同一行提示里 */
.target-size-hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  padding: 5px 8px;
  border-radius: 5px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9) 0%,
    rgba(255, 255, 255, 0.92) 100%
  );
  border: 1px solid var(--el-color-primary-light-5);
}

.target-size-hint__label {
  font-weight: 600;
  color: var(--el-color-primary);
  font-size: 0.75rem;
}

.target-size-hint__sep {
  color: #606266;
  font-size: 0.75rem;
}

.target-size-hint__value {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--el-color-primary-dark-2);
  font-variant-numeric: tabular-nums;
}

.target-size-hint__input {
  width: 80px;
}

.target-size-hint__x,
.target-size-hint__unit {
  font-size: 0.75rem;
  color: #909399;
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

/* 截图目标尺寸：内嵌在同一行提示里 */
.target-size-hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  padding: 5px 8px;
  border-radius: 5px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9) 0%,
    rgba(255, 255, 255, 0.92) 100%
  );
  border: 1px solid var(--el-color-primary-light-5);
}

.target-size-hint__label {
  font-weight: 600;
  color: var(--el-color-primary);
  font-size: 0.75rem;
}

.target-size-hint__sep {
  color: #606266;
  font-size: 0.75rem;
}

.target-size-hint__value {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--el-color-primary-dark-2);
  font-variant-numeric: tabular-nums;
}

.target-size-hint__input {
  width: 80px;
}

.target-size-hint__x,
.target-size-hint__unit {
  font-size: 0.75rem;
  color: #909399;
}
</style>
