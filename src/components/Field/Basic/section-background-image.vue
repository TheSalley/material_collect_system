<template>
  <!-- 无有效 url / id 时不渲染整块（不展示空状态与上传入口） -->
  <div v-if="shouldShowSection" class="field-item section-bg-field">
    <label class="field-label">
      <el-icon><PictureFilled /></el-icon>
      背景图
    </label>
    <div class="bg-block">
      <div v-if="bgImageUrl" class="image-preview mb-3">
        <img :src="bgImageUrl" alt="背景预览" @error="onBgImgError" />
      </div>
      <p v-else-if="bgResolveLoading" class="resolve-loading">正在解析图片地址…</p>
      <p v-else-if="bgResolveFailed" class="resolve-failed">
        仅有媒体 ID、无法在媒体库中解析出地址时无法预览，请重新上传。
      </p>
      <el-upload
        action="#"
        :before-upload="handleBeforeUpload"
        :show-file-list="false"
        class="upload-wrapper"
      >
        <el-button type="primary" :icon="Upload">上传背景图</el-button>
        <template #tip>
          <div class="el-upload__tip">支持 jpg/png 等格式，大小不超过 10MB</div>
        </template>
      </el-upload>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { PictureFilled, Upload } from "@element-plus/icons-vue";
import { handleImageUpload } from "@/utils/imageUpload";
import { getFileFullUrl } from "@/apis";
import { useGlobalStore } from "@/stores/global";
import { resolveAttachmentPreviewUrl } from "@/utils/mediaResolve";

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
  },
  fields: {
    type: Object,
    required: true,
  },
  onUpdate: {
    type: Function,
    required: true,
  },
});

/** Elementor background_image：字符串 URL 或多种对象形态 */
function pickRawImageUrl(val) {
  if (val == null) return "";
  if (typeof val === "string") {
    const s = val.trim();
    return s;
  }
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

  const onImgError = () => {
    resolvedUrl.value = "";
  };

  return { imageUrl, resolveLoading, resolveFailed, onImgError };
}

const {
  imageUrl: bgImageUrl,
  resolveLoading: bgResolveLoading,
  resolveFailed: bgResolveFailed,
  onImgError: onBgImgError,
} = useMaybeResolveImage("background_image");

/** JSON 中已有可解析的 url，或非 0 的媒体 id 时才展示本区块 */
function hasBackgroundData(fields) {
  const v = fields?.background_image;
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

const shouldShowSection = computed(() => hasBackgroundData(props.fields));

const handleBeforeUpload = (file) => {
  return handleImageUpload(file, (url, id) => {
    const fieldKey = "background_image";
    const cur = props.fields?.[fieldKey];
    const base =
      cur != null && typeof cur === "object" && !Array.isArray(cur) ? { ...cur } : {};
    props.onUpdate(fieldKey, {
      ...base,
      url: url || base.url || "",
      id: id != null ? id : base.id,
    });
  });
};
</script>

<style scoped>
.section-bg-field {
  border: 1px dashed var(--el-color-primary-light-5);
  border-radius: 8px;
  padding: 12px;
  background: var(--el-fill-color-lighter);
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

.field-hint {
  margin: 0 0 0.5rem 0;
  font-size: 0.75rem;
  color: #909399;
  line-height: 1.4;
}

.bg-block {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 10px;
  background: #fff;
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
  max-height: 280px;
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

.el-upload__tip {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #909399;
  line-height: 1.4;
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

</style>
