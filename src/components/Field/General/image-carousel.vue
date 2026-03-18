<script setup>
import { computed } from "vue";
import { Picture, Upload, Delete, ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import { handleImageUpload } from "@/utils/imageUpload";
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

const carousel = computed(() => {
  const v = props.fields?.carousel;
  return Array.isArray(v) ? v : [];
});

function toDisplayUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("//")) {
    return t.startsWith("//") ? `https:${t}` : t;
  }
  return getFileFullUrl(t);
}

function titleFromItem(item, idx) {
  const t = typeof item?.title === "string" ? item.title.trim() : "";
  if (t) return t;
  const rawUrl = typeof item?.url === "string" ? item.url.trim() : "";
  if (rawUrl) {
    const noQuery = rawUrl.split("?")[0];
    const parts = noQuery.split("/");
    const last = parts[parts.length - 1] || "";
    if (last) {
      try {
        return decodeURIComponent(last);
      } catch {
        return last;
      }
    }
  }
  return `图片 ${idx + 1}`;
}

function emitCarousel(next) {
  props.onUpdate("carousel", next);
}

function removeAt(idx) {
  const next = carousel.value.filter((_, i) => i !== idx);
  emitCarousel(next);
}

function move(idx, dir) {
  const next = carousel.value.slice();
  const to = idx + dir;
  if (to < 0 || to >= next.length) return;
  const [item] = next.splice(idx, 1);
  next.splice(to, 0, item);
  emitCarousel(next);
}

const handleBeforeUpload = (file) => {
  return handleImageUpload(file, (url, id) => {
    const next = carousel.value.slice();
    next.push({
      id: id ?? "",
      url: url || "",
    });
    emitCarousel(next);
  });
};
</script>

<template>
  <div class="field-item">
    <label class="field-label">
      <el-icon><Picture /></el-icon>
      轮播图片
    </label>

    <div v-if="carousel.length" class="carousel-list">
      <div v-for="(item, idx) in carousel" :key="`${item?.id ?? ''}-${idx}`" class="carousel-row">
        <div class="thumb">
          <img v-if="toDisplayUrl(item?.url)" :src="toDisplayUrl(item?.url)" alt="carousel" />
          <div v-else class="thumb-empty">无URL</div>
        </div>

        <div class="meta">
          <div class="title" :title="titleFromItem(item, idx)">{{ titleFromItem(item, idx) }}</div>
        </div>

        <div class="actions">
          <el-button
            size="small"
            :icon="ArrowUp"
            :disabled="idx === 0"
            @click="move(idx, -1)"
          />
          <el-button
            size="small"
            :icon="ArrowDown"
            :disabled="idx === carousel.length - 1"
            @click="move(idx, 1)"
          />
          <el-button size="small" type="danger" :icon="Delete" @click="removeAt(idx)" />
        </div>
      </div>
    </div>
    <div v-else class="empty">
      <el-empty description="暂无轮播图片" :image-size="72" />
    </div>

    <el-upload
      action="#"
      :before-upload="handleBeforeUpload"
      :show-file-list="false"
      class="upload-wrapper"
    >
      <el-button type="primary" :icon="Upload">上传并追加</el-button>
      <template #tip>
        <div class="el-upload__tip">每次上传追加 1 张，支持 jpg/png 等，大小不超过 10MB</div>
      </template>
    </el-upload>
  </div>
</template>

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
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.field-label .el-icon {
  color: var(--el-color-primary);
  font-size: 1.1rem;
}

.carousel-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.carousel-row {
  display: grid;
  grid-template-columns: 92px 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: #fff;
}

.thumb {
  width: 92px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-empty {
  font-size: 0.75rem;
  color: #909399;
}

.meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #303133;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 0.4rem;
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

.empty {
  padding: 0.25rem 0;
}
</style>

