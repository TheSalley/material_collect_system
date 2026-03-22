<template>
  <div class="cta-field">
    <div class="cta-header">
      <span class="field-label">Call to Action</span>
      <p class="field-desc">标题、描述、按钮文案；可选背景图 <code>bg_image</code>（媒体库）。</p>
    </div>

    <div class="cta-body">
      <el-form label-position="top" class="cta-form">
        <el-form-item label="背景图">
          <div
            class="bg-image-block"
            v-loading="bgUploading"
            element-loading-text="正在上传背景图…"
          >
            <div v-if="bgImageDisplayUrl" class="image-preview mb-2">
              <img :src="bgImageDisplayUrl" alt="背景预览" />
            </div>
            <el-upload
              action="#"
              :before-upload="handleBgImageUpload"
              :show-file-list="false"
              class="upload-wrapper"
            >
              <el-button type="primary" :icon="Upload" plain :loading="bgUploading" :disabled="bgUploading">上传背景图
              </el-button>
              <template #tip>
                <div class="el-upload__tip">支持 jpg/png/webp 等，建议不超过 10MB</div>
              </template>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="标题">
          <el-input
            v-model="fields.title"
            show-word-limit
            maxlength="100"
            @input="onUpdate('title', fields.title)"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="fields.description"
            type="textarea"
            :rows="2"
            show-word-limit
            maxlength="2000"
            @input="onUpdate('description', fields.description)"
          />
        </el-form-item>
        <el-form-item label="按钮文案">
          <el-input
            v-model="fields.button"
            maxlength="50"
            show-word-limit
            @input="onUpdate('button', fields.button)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { Upload } from "@element-plus/icons-vue";
import { validateImageFile, uploadImageFile } from "@/utils/imageUpload";
import { getFileFullUrl } from "@/apis";

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

const bgUploading = ref(false);

/** 展示用完整 URL */
const bgImageDisplayUrl = computed(() => {
  const url = props.fields.bg_image?.url;
  if (!url || typeof url !== "string") return "";
  const t = url.trim();
  if (!t) return "";
  return t.startsWith("http") || t.startsWith("//") ? (t.startsWith("//") ? `https:${t}` : t) : getFileFullUrl(t);
});

function patchBgImage(partial) {
  const cur = props.fields.bg_image;
  const base =
    cur != null && typeof cur === "object" && !Array.isArray(cur) ? { ...cur } : {};
  props.onUpdate("bg_image", {
    ...base,
    url: base.url ?? "",
    id: base.id ?? "",
    size: base.size ?? "",
    alt: base.alt ?? "",
    source: base.source || "library",
    ...partial,
  });
}

async function handleBgImageUpload(file) {
  if (!validateImageFile(file)) return false;
  bgUploading.value = true;
  try {
    const result = await uploadImageFile(file);
    if (result) {
      patchBgImage({
        url: result.url || "",
        id: result.id != null ? result.id : "",
      });
    }
  } finally {
    bgUploading.value = false;
  }
  return false;
}
</script>

<style scoped>
.cta-field {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 16px 18px 14px;
  background: #f9fafb;
}

.cta-header {
  margin-bottom: 10px;
}

.field-label {
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

.cta-body {
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 14px 6px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.cta-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.bg-image-block {
  position: relative;
  min-height: 48px;
}

.bg-image-block .image-preview {
  width: 100%;
  max-width: 400px;
}

.bg-image-block .image-preview img {
  width: 100%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.bg-image-block .upload-wrapper {
  width: 100%;
}

.bg-image-block .upload-wrapper :deep(.el-upload) {
  width: 100%;
}

.bg-image-block .el-upload__tip {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #909399;
}
</style>
