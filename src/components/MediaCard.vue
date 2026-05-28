<script setup>
import { computed, onBeforeUnmount, shallowRef, watch } from "vue";
import { Picture, View, Document, Delete } from "@element-plus/icons-vue";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import { deleteMedia } from "@/apis/media";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["preview", "deleted"]);
const deleting = shallowRef(false);
const runtimeMeta = shallowRef({
  dimensions: null,
  fileSize: null,
});
let currentMetaTaskId = 0;

const IMAGE_FIELDS = ["url", "src", "image", "img", "thumbnail", "cover"];
const DIMENSION_STRING_FIELDS = ["size", "dimensions", "resolution"];
const FILE_SIZE_FIELDS = [
  "filesize",
  "file_size",
  "size_bytes",
  "bytes",
  "byte",
  "content_length",
  "contentlength",
];

function getImageUrl(item) {
  if (!item || typeof item !== "object") return null;
  for (const key of Object.keys(item)) {
    if (IMAGE_FIELDS.some(f => key.toLowerCase().includes(f))) {
      const val = item[key];
      if (typeof val === "string" && /^https?:\/\//i.test(val)) return val;
    }
  }
  return null;
}

function getImageExt(item) {
  const url = getImageUrl(item);
  if (!url) return "FILE";
  const m = url.match(/\.([a-z0-9]+)(\?|$)/i);
  return m ? m[1].toUpperCase() : "IMG";
}

function loadImageDimensions(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve(formatDimensions(img.naturalWidth, img.naturalHeight));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function loadImageFileSizeFromUrl(url) {
  if (!url) return null;

  try {
    const headResponse = await fetch(url, { method: "HEAD" });
    const contentLength = headResponse.headers.get("content-length");
    const formatted = formatFileSize(contentLength);
    if (formatted) return formatted;
  } catch {
    // Ignore and fall back to GET below.
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return formatFileSize(blob.size);
  } catch {
    return null;
  }
}

function normalizeObjectKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return null;

  if (size < 1024) return `${Math.round(size)} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(size < 10 * 1024 ? 1 : 0)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(size < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function parseFileSizeValue(value) {
  if (value == null) return null;

  if (typeof value === "number") {
    return formatFileSize(value);
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  const compact = trimmed.replace(/,/g, "");

  if (/^\d+(\.\d+)?$/.test(compact)) {
    return formatFileSize(compact);
  }

  const bytesMatch = compact.match(/^(\d+(?:\.\d+)?)\s*bytes?$/i);
  if (bytesMatch) {
    return formatFileSize(bytesMatch[1]);
  }

  const unitMatch = compact.match(/(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb)\b/i);
  if (!unitMatch) return null;

  const num = Number(unitMatch[1]);
  if (!Number.isFinite(num) || num <= 0) return null;

  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)} ${unitMatch[2].toUpperCase()}`;
}

function resolveFileSize(source, visited = new WeakSet()) {
  if (!source || typeof source !== "object") return null;
  if (visited.has(source)) return null;
  visited.add(source);

  for (const [key, value] of Object.entries(source)) {
    const normalizedKey = normalizeObjectKey(key);
    const isLikelyFileSizeKey =
      FILE_SIZE_FIELDS.some(field => normalizedKey.includes(field)) ||
      (normalizedKey === "size" && !parseDimensionString(value));

    if (!isLikelyFileSizeKey) continue;

    const formatted = parseFileSizeValue(value);
    if (formatted) return formatted;
  }

  for (const value of Object.values(source)) {
    if (!value || typeof value !== "object") continue;
    const nested = resolveFileSize(value, visited);
    if (nested) return nested;
  }

  return null;
}

function getImageFileSize(item) {
  if (!item || typeof item !== "object") return null;

  const sources = [
    item,
    item.media_details,
    item.dimensions,
    item.metadata,
    item.attachment_metadata,
    item.image_meta,
    item.file_meta,
    item.file,
  ];

  for (const source of sources) {
    const formatted = resolveFileSize(source);
    if (formatted) return formatted;
  }

  for (const value of Object.values(item)) {
    if (!value || typeof value !== "object") continue;
    const formatted = resolveFileSize(value);
    if (formatted) return formatted;
  }

  return null;
}

function toPositiveNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.round(num) : null;
}

function formatDimensions(width, height) {
  return width && height ? `${width} x ${height} px` : null;
}

function parseDimensionString(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/(\d+(?:\.\d+)?)\s*(?:x|\u00D7)\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;

  const width = toPositiveNumber(match[1]);
  const height = toPositiveNumber(match[2]);
  return formatDimensions(width, height);
}

function resolveDimensions(source) {
  if (!source || typeof source !== "object") return null;

  const width = toPositiveNumber(source.width ?? source.image_width ?? source.img_width ?? source.w);
  const height = toPositiveNumber(source.height ?? source.image_height ?? source.img_height ?? source.h);
  const directDimensions = formatDimensions(width, height);
  if (directDimensions) return directDimensions;

  for (const key of Object.keys(source)) {
    if (!DIMENSION_STRING_FIELDS.some(field => key.toLowerCase().includes(field))) {
      continue;
    }

    const parsed = parseDimensionString(source[key]);
    if (parsed) return parsed;
  }

  return null;
}

function getImageSize(item) {
  if (!item || typeof item !== "object") return null;

  const sources = [
    item,
    item.media_details,
    item.dimensions,
    item.metadata,
    item.attachment_metadata,
    item.image_meta,
    item.file_meta,
  ];

  for (const source of sources) {
    const dimensions = resolveDimensions(source);
    if (dimensions) return dimensions;
  }

  for (const value of Object.values(item)) {
    if (!value || typeof value !== "object") continue;
    const dimensions = resolveDimensions(value);
    if (dimensions) return dimensions;
  }

  return null;
}

const imageUrl = computed(() => getImageUrl(props.item));
const imageExt = computed(() => getImageExt(props.item));
const imageSizeLabel = computed(() => getImageSize(props.item) || runtimeMeta.value.dimensions);
const imageFileSizeLabel = computed(() => getImageFileSize(props.item) || runtimeMeta.value.fileSize);

watch(
  imageUrl,
  async (url) => {
    const taskId = ++currentMetaTaskId;

    runtimeMeta.value = {
      dimensions: null,
      fileSize: null,
    };

    if (!url) return;

    const [dimensions, fileSize] = await Promise.all([
      loadImageDimensions(url),
      loadImageFileSizeFromUrl(url),
    ]);

    if (taskId !== currentMetaTaskId) return;

    runtimeMeta.value = {
      dimensions,
      fileSize,
    };
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  currentMetaTaskId += 1;
});

function getField(item, key) {
  if (!item || typeof item !== "object") return null;
  return item[key] ?? item[key.replace(/_/g, "")] ?? null;
}

function getMediaId(item) {
  return getField(item, "id");
}

function formatDate(str) {
  if (!str) return "-";
  const d = new Date(str);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function openPreview() {
  if (!imageUrl.value) return;
  emit("preview", imageUrl.value);
}

async function handleDelete() {
  const id = getMediaId(props.item);
  if (id == null || id === "") {
    ElMessage.warning("缺少素材 ID，无法删除");
    return;
  }

  try {
    await ElMessageBox.confirm("确定要删除该素材吗？此操作不可恢复。", "删除素材", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      closeOnClickModal: false,
    });
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error("删除失败：" + (error?.message || ""));
    }
    return;
  }

  deleting.value = true;
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    lock: true,
    text: "正在删除素材...",
  });
  try {
    const res = await deleteMedia({ id });
    if (res?.code === 0) {
      ElMessage.success(res.message || "删除成功");
      emit("deleted", props.item);
    } else {
      ElMessage.error(res?.message || res?.msg || "删除失败");
    }
  } catch (error) {
    ElMessage.error("删除失败：" + (error?.message || ""));
  } finally {
    loadingInstance.close();
    deleting.value = false;
  }
}
</script>

<template>
  <div class="media-card group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-600">
    <div
      class="relative aspect-[4/3] bg-gray-100 dark:bg-gray-600 overflow-hidden"
      :class="{ 'cursor-zoom-in': imageUrl }"
      @click="openPreview"
    >
      <template v-if="imageUrl">
        <el-image
          :src="imageUrl"
          fit="cover"
          class="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
      </template>
      <template v-else>
        <div class="w-full h-full flex items-center justify-center">
          <el-icon class="text-5xl text-gray-300 dark:text-gray-500"><Document /></el-icon>
        </div>
      </template>

      <div class="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
        <el-button
          v-if="imageUrl"
          class="pointer-events-auto"
          circle
          size="large"
          type="primary"
          :icon="View"
          @click.stop="openPreview"
        />
        <el-button
          class="pointer-events-auto"
          circle
          size="large"
          type="danger"
          :icon="Delete"
          :loading="deleting"
          @click.stop="handleDelete"
        />
      </div>

      <div class="absolute top-2 right-2 flex items-center gap-1">
        <div
          v-if="imageUrl"
          class="px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm"
        >
          {{ imageExt }}
        </div>

        <div
          v-if="imageSizeLabel"
          class="px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm"
        >
          {{ imageSizeLabel }}
        </div>

        <div
          v-if="imageFileSizeLabel"
          class="px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm"
        >
          {{ imageFileSizeLabel }}
        </div>
      </div>
    </div>

    <div class="p-3">
      <div class="flex flex-wrap gap-1">
        <el-tag v-if="getField(item, 'demo')" size="small" type="info" effect="plain" class="!text-[10px]">
          {{ getField(item, 'demo') }}
        </el-tag>
        <el-tag v-if="getField(item, 'page')" size="small" type="warning" effect="plain" class="!text-[10px]">
          {{ getField(item, 'page') }}
        </el-tag>
        <el-tag v-if="getField(item, 'created_at')" size="small" type="info" effect="plain" class="!text-[10px]">
          {{ formatDate(getField(item, 'created_at')) }}
        </el-tag>
      </div>
    </div>
  </div>
</template>
