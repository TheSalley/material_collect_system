<template>
  <div class="gallery-field">
    <FieldWidgetType :type="widgetType" />
    <div class="gallery-header">
      <span class="__field-label">Gallery</span>
      <p class="field-desc">
        多图片画廊展示，可上传或从媒体库选择 <code>gallery</code>（数组）。
      </p>
    </div>

    <div
      class="gallery-body"
      v-loading="uploading"
      element-loading-text="正在上传…"
    >
      <div v-if="displayImages.length > 0" class="gallery-grid">
        <div
          v-for="(item, index) in displayImages"
          :key="item.id || index"
          class="gallery-item"
        >
          <div class="gallery-item-inner">
            <img
              :src="item.displayUrl"
              :alt="`图片 ${index + 1}`"
              @load="onThumbLoad($event, thumbKey(item, index))"
            />
            <div v-if="thumbDims[thumbKey(item, index)]" class="thumb-dim">
              {{ thumbDims[thumbKey(item, index)] }}
            </div>
            <div class="gallery-item-actions">
              <el-button
                type="primary"
                :icon="Delete"
                circle
                size="small"
                @click="removeImage(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="gallery-upload">
        <el-upload
          action="#"
          :before-upload="handleImageUpload"
          :show-file-list="false"
          multiple
          class="upload-wrapper"
        >
          <el-button type="primary" :icon="Plus" plain>添加图片</el-button>
        </el-upload>
        <div class="field-upload-hints">
          <p class="hint-line">{{ uploadTip }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";

import FieldWidgetType from "@/components/FieldWidgetType.vue";
import {
  validateImageFileWithDimensions,
  uploadImageFile,
  IMAGE_UPLOAD_DEFAULTS,
  buildImageUploadTip,
} from "@/utils/imageUpload";
import { getFileFullUrl } from "@/apis";

const uploadRuleOptions = { ...IMAGE_UPLOAD_DEFAULTS };
const uploadTip = buildImageUploadTip(uploadRuleOptions);
const thumbDims = ref({});

function thumbKey(item, index) {
  return `${item?.id ?? "noid"}-${index}`;
}

function onThumbLoad(e, key) {
  const img = e.target;
  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    thumbDims.value = {
      ...thumbDims.value,
      [key]: `${img.naturalWidth}×${img.naturalHeight}px`,
    };
  }
}

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
  },
  widgetType: {
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

const uploading = ref(false);

const displayImages = computed(() => {
  const gallery = props.fields.gallery;
  if (!Array.isArray(gallery) || gallery.length === 0) return [];
  return gallery
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const url = item.url;
      let displayUrl = "";
      if (url && typeof url === "string") {
        const trimmed = url.trim();
        if (trimmed) {
          displayUrl =
            trimmed.startsWith("http") || trimmed.startsWith("//")
              ? trimmed.startsWith("//")
                ? `https:${trimmed}`
                : trimmed
              : getFileFullUrl(trimmed);
        }
      }
      return {
        id: item.id,
        url: item.url,
        displayUrl,
      };
    })
    .filter(Boolean);
});

watch(
  displayImages,
  () => {
    thumbDims.value = {};
  },
  { deep: true },
);

function patchGallery(newItems) {
  const cur = props.fields.gallery;
  const base = Array.isArray(cur) ? [...cur] : [];
  props.onUpdate("gallery", [...base, ...newItems]);
}

async function handleImageUpload(file) {
  const ok = await validateImageFileWithDimensions(file, uploadRuleOptions);
  if (!ok) return false;
  uploading.value = true;
  try {
    const result = await uploadImageFile(file);
    if (result) {
      const newItem = {
        id: result.id || Date.now(),
        url: result.url || "",
      };
      patchGallery([newItem]);
    }
  } finally {
    uploading.value = false;
  }
  return false;
}

function removeImage(index) {
  const cur = props.fields.gallery;
  if (!Array.isArray(cur) || index < 0 || index >= cur.length) return;
  const updated = cur.filter((_, i) => i !== index);
  props.onUpdate("gallery", updated);
}
</script>

<style scoped>
.gallery-field {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 16px 18px 14px;
  background: #f9fafb;
}

.gallery-header {
  margin-bottom: 10px;
}

.__field-label {
  font-size: 13px;
  color: #374151;
  font-weight: 600;
}

.field-desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.45;
}

.field-desc code {
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 4px;
  background: #eef2ff;
  color: #4338ca;
}

.gallery-body {
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 14px 6px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.gallery-item {
  position: relative;
}

.gallery-item-inner {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
}

.gallery-item-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-item-inner:hover .gallery-item-actions {
  opacity: 1;
}

.thumb-dim {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2px 4px;
  font-size: 10px;
  line-height: 1.2;
  color: #fff;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  text-align: center;
  pointer-events: none;
}

.gallery-upload {
  padding-top: 8px;
}

.upload-wrapper :deep(.el-upload) {
  width: 100%;
}

.field-upload-hints {
  margin-top: 0.35rem;
}

.field-upload-hints .hint-line {
  margin: 0;
  font-size: 0.75rem;
  color: #909399;
  line-height: 1.45;
}
</style>
