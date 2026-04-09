<template>
  <div class="field-item">
    <label class="field-label">
      <el-icon><Picture /></el-icon>
      图片
    </label>
    
    <!-- 图片预览 -->
    <div v-if="imageUrl" class="image-preview mb-3">
      <img :src="imageUrl" alt="预览图" />
    </div>
    <el-upload 
      action="#" 
      :before-upload="handleBeforeUpload"
      :show-file-list="false"
      class="upload-wrapper"
    >
      <el-button type="primary" :icon="Upload">上传图片</el-button>
    </el-upload>
    <div class="field-upload-hints">
      <p v-if="naturalSizeInfo.label" class="hint-line">{{ naturalSizeInfo.label }}</p>
      <p class="hint-line">{{ uploadTip }}</p>
      <div v-if="hasSizeEditor" class="hint-line target-size-hint">
        <span class="target-size-hint__label">截图目标尺寸</span>
        <template v-if="configuredDims && !isAdmin">
          <span class="target-size-hint__sep">：</span>
          <span class="target-size-hint__value">{{ configuredDims.width }} × {{ configuredDims.height }} px</span>
        </template>
        <template v-else-if="isAdmin">
          <span class="target-size-hint__sep">：</span>
          <el-input-number
            v-model="sectionSizes[sectionIndex].width"
            :min="1"
            :max="16384"
            controls-position="right"
            size="small"
            class="target-size-hint__input"
          />
          <span class="target-size-hint__x">×</span>
          <el-input-number
            v-model="sectionSizes[sectionIndex].height"
            :min="1"
            :max="16384"
            controls-position="right"
            size="small"
            class="target-size-hint__input"
          />
          <span class="target-size-hint__unit">px</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, inject } from "vue";
import { Picture, Upload } from '@element-plus/icons-vue';
import { useGlobalStore } from "@/stores/global";
import {
  handleImageUpload,
  IMAGE_UPLOAD_DEFAULTS,
  buildImageUploadTip,
  getImageNaturalSizeFromUrl,
  formatNaturalSizeLabel,
} from "@/utils/imageUpload";
import { getFileFullUrl } from "@/apis";

const uploadRuleOptions = { ...IMAGE_UPLOAD_DEFAULTS };
const uploadTip = buildImageUploadTip(uploadRuleOptions);
const naturalSizeInfo = ref({ label: "", dims: null });

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  fields: {
    type: Object,
    required: true
  },
  onUpdate: {
    type: Function,
    required: true
  },
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

const globalStore = useGlobalStore();
const isAdmin = computed(() => {
  const role = (globalStore.user?.role ?? "user").toString().toLowerCase();
  return role === "admin";
});

// 普通 image 控件：仅使用 settings.image 的标准 { url, id } 结构
const imageUrl = computed(() => {
  const url = props.fields.image?.url;
  if (!url || typeof url !== "string") return "";
  const t = url.trim();
  if (!t) return "";
  return t.startsWith("http") ? t : getFileFullUrl(t);
});

watch(
  () => imageUrl.value,
  async (url) => {
    naturalSizeInfo.value = { label: "", dims: null };
    if (!url) return;
    const dim = await getImageNaturalSizeFromUrl(url);
    naturalSizeInfo.value = {
      label: formatNaturalSizeLabel(dim),
      dims: dim,
    };
  },
  { immediate: true }
);

const handleBeforeUpload = (file) => {
  const refDim = configuredDims.value || naturalSizeInfo.value.dims;
  const opts = refDim ? { strictMatch: true, refDimensions: refDim } : {};
  return handleImageUpload(file, (url, id) => {
    if (!props.fields.image) {
      props.fields.image = {};
    }
    props.fields.image.url = url;
    props.fields.image.id = id;
    props.onUpdate("image", props.fields.image);
  }, opts);
};
</script>

<style scoped>
.field-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #606266;
  margin-bottom: 0.25rem;
}

.field-label .el-icon {
  color: #409eff;
  font-size: 1rem;
}

.image-preview {
  width: 100%;
  max-width: 400px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
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