<template>
  <div v-if="hasGalleryField" class="__field-item space-y-3">
    <label class="__field-label">
      <el-icon><Picture /></el-icon>
      <span>图片画廊</span>
      <FieldWidgetType :type="widgetType" />
    </label>

    <div v-if="galleryItems.length" class="space-y-2">
      <div
        v-for="image in galleryItems"
        :key="image.key"
        class="grid grid-cols-[92px_1fr_auto] items-center gap-3 rounded-lg border border-[var(--el-border-color-lighter)] bg-white p-2.5"
      >
        <div
          class="relative flex h-16 w-[92px] items-center justify-center overflow-hidden rounded-md border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-lighter)]"
        >
          <img
            v-if="image.url"
            :src="image.url"
            alt="gallery"
            class="block h-full w-full object-cover"
            @load="setThumbDim($event, image.key)"
          />
          <span v-else class="text-xs text-[var(--el-text-color-secondary)]">
            无 URL
          </span>
          <span
            v-if="thumbDims[image.key]"
            class="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 px-0.5 py-px text-center text-[9px] leading-tight text-white"
          >
            {{ thumbDims[image.key] }}
          </span>
        </div>

        <div class="min-w-0">
          <div
            class="truncate text-sm font-semibold text-[var(--el-text-color-primary)]"
            :title="image.title"
          >
            {{ image.title }}
          </div>
        </div>

        <div class="flex gap-1.5">
          <el-button
            :disabled="image.index === 0"
            :icon="ArrowUp"
            size="small"
            @click="move(image.index, -1)"
          />
          <el-button
            :disabled="image.index === galleryItems.length - 1"
            :icon="ArrowDown"
            size="small"
            @click="move(image.index, 1)"
          />
          <el-button
            :icon="Delete"
            size="small"
            type="danger"
            @click="removeAt(image.index)"
          />
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无图片画廊" :image-size="72" />

    <el-upload
      action="#"
      class="w-full [&_.el-upload]:w-full"
      :before-upload="handleBeforeUpload"
      :show-file-list="false"
    >
      <el-button class="w-full" type="primary" :icon="Upload">
        上传并追加
      </el-button>
    </el-upload>

    <p class="text-xs leading-relaxed text-[var(--el-text-color-secondary)]">
      {{ uploadTip }}
    </p>
  </div>
</template>

<script setup>
import { computed, shallowRef, watch } from "vue";
import {
  ArrowDown,
  ArrowUp,
  Delete,
  Picture,
  Upload,
} from "@element-plus/icons-vue";
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
const uploadTip = `每次上传追加 1 张。${buildImageUploadTip(uploadRuleOptions)}`;
const thumbDims = shallowRef({});

const hasGalleryField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "wp_gallery"),
);

const gallery = computed(() => {
  const value = props.fields.wp_gallery;
  return Array.isArray(value) ? value : [];
});

const galleryItems = computed(() =>
  gallery.value.map((item, index) => ({
    item,
    index,
    key: `${item?.id || item?.url || "image"}-${index}`,
    title: getItemTitle(item, index),
    url: toDisplayUrl(item?.url),
  })),
);

watch(
  gallery,
  () => {
    thumbDims.value = {};
  },
  { deep: true },
);

function toDisplayUrl(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";

  if (!value) return "";
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  return getFileFullUrl(value);
}

function getItemTitle(item, index) {
  const filename = getFilename(item?.url);
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
  props.onUpdate("wp_gallery", next);
}

function removeAt(index) {
  emitGallery(gallery.value.filter((_, currentIndex) => currentIndex !== index));
}

function move(index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= gallery.value.length) return;

  const next = gallery.value.slice();
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  emitGallery(next);
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
      emitGallery([
        ...gallery.value,
        {
          id: id ?? "",
          url: url || "",
        },
      ]);
    },
    uploadRuleOptions,
  )
    .catch(() => {})
    .finally(() => {
      loading.close();
    });

  return false;
}
</script>
