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
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Picture, Upload } from '@element-plus/icons-vue';
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
  }
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
  const opts = naturalSizeInfo.value.dims
    ? { strictMatch: true, refDimensions: naturalSizeInfo.value.dims }
    : {};
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
</style>