<template>
  <div v-if="hasGalleryField" class="__field-item space-y-3">
    <div class="flex items-center justify-between">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>图片画廊</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <el-tag type="info">{{ gallery.length }} 张图片</el-tag>
    </div>

    <div
      v-if="galleryItems.length"
      class="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3"
    >
      <div
        v-for="image in galleryItems"
        :key="image.key"
        class="group relative aspect-square overflow-hidden rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-lighter)]"
      >
        <img
          v-if="image.url"
          :src="image.url"
          :alt="image.title"
          class="block h-full w-full object-cover"
          @load="setThumbDim($event, image.key)"
        />
        <div
          v-else
          class="flex h-full items-center justify-center text-xs text-[var(--el-text-color-secondary)]"
        >
          无 URL
        </div>

        <span
          v-if="thumbDims[image.key]"
          class="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-center text-[10px] leading-tight text-white"
        >
          {{ thumbDims[image.key] }}
        </span>

        <el-button
          class="!absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
          :icon="Delete"
          circle
          size="small"
          type="danger"
          @click="removeImage(image.index)"
        />
      </div>
    </div>

    <el-empty v-else description="暂无画廊图片" :image-size="72" />

    <el-upload
      action="#"
      class="w-full [&_.el-upload]:w-full"
      :before-upload="handleBeforeUpload"
      :show-file-list="false"
      multiple
    >
      <el-button class="w-full" type="primary" :icon="Plus">
        添加图片
      </el-button>
    </el-upload>

    <p class="text-xs leading-relaxed text-[var(--el-text-color-secondary)]">
      {{ uploadTip }}
    </p>
  </div>
</template>

<script setup>
import { computed, shallowRef, watch } from "vue";
import { Delete, Picture, Plus } from "@element-plus/icons-vue";
import { ElLoading } from "element-plus";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import { getFileFullUrl } from "@/apis";
import {
  buildImageUploadTip,
  handleImageUpload,
  IMAGE_UPLOAD_DEFAULTS,
} from "@/utils/imageUpload";

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

const uploadRuleOptions = { ...IMAGE_UPLOAD_DEFAULTS };
const uploadTip = buildImageUploadTip(uploadRuleOptions);
const thumbDims = shallowRef({});

const hasGalleryField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "gallery")
);

const gallery = computed(() => {
  const value = props.fields.gallery;
  return Array.isArray(value) ? value : [];
});

const galleryItems = computed(() =>
  gallery.value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;

      const url = toDisplayUrl(item.url);
      return {
        ...item,
        index,
        key: `${item.id || item.url || "gallery"}-${index}`,
        title: getImageTitle(item, index),
        url,
      };
    })
    .filter(Boolean)
);

watch(
  gallery,
  () => {
    thumbDims.value = {};
  },
  { deep: true }
);

function toDisplayUrl(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";

  if (!value) return "";
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  return getFileFullUrl(value);
}

function getImageTitle(item, index) {
  const title = typeof item.title === "string" ? item.title.trim() : "";
  if (title) return title;

  const filename = getFilename(item.url);
  return filename || `图片 ${index + 1}`;
}

function getFilename(rawUrl) {
  const value = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!value) return "";

  const filename = value.split("?")[0].split("/").pop() || "";
  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

function setThumbDim(event, key) {
  const { naturalWidth, naturalHeight } = event.target;
  if (!naturalWidth || !naturalHeight) return;

  thumbDims.value = {
    ...thumbDims.value,
    [key]: `${naturalWidth}x${naturalHeight}px`,
  };
}

function emitGallery(next) {
  props.onUpdate("gallery", next);
}

function appendImage(image) {
  emitGallery([...gallery.value, image]);
}

function removeImage(index) {
  emitGallery(gallery.value.filter((_, currentIndex) => currentIndex !== index));
}

function handleBeforeUpload(file) {
  const loading = ElLoading.service({
    fullscreen: true,
    lock: true,
    text: "上传中...",
  });

  handleImageUpload(
    file,
    (url, id) => {
      appendImage({
        id: id ?? "",
        url: url || "",
      });
    },
    uploadRuleOptions
  )
    .catch(() => {})
    .finally(() => {
      loading.close();
    });

  return false;
}
</script>
