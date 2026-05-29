<template>
  <div v-if="shouldShowSection" class="__field-item section-bg-field">
    <label class="__field-label">
      <el-icon><PictureFilled /></el-icon>
      背景图
    </label>
    <div v-if="hasMainBg" class="bg-block">
      <div class="bg-block__title">主背景图</div>
      <ImageWp
        :model-value="fields.background_image"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="(newImageData) => onUpdate('background_image', newImageData)"
      />
    </div>

    <div v-if="hasOverlayBg" class="bg-block">
      <div class="bg-block__title">叠加层图</div>
      <ImageWp
        :model-value="fields.background_overlay_image"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="(newImageData) => onUpdate('background_overlay_image', newImageData)"
      />
    </div>

    <div v-if="hasSlideshowGalleryField" class="bg-block">
      <div class="bg-block__header">
        <div class="bg-block__title mb-0">轮播背景图库</div>
        <el-button size="small" type="primary" plain :icon="Plus" @click="addSlideshowImage">
          新增图片
        </el-button>
      </div>

      <div v-if="slideshowGallery.length" class="slideshow-list">
        <div
          v-for="(image, index) in slideshowGallery"
          :key="getSlideshowItemKey(image, index)"
          class="slideshow-item"
        >
          <div class="slideshow-item__header">
            <span class="slideshow-item__title">图片 {{ index + 1 }}</span>
            <el-button
              size="small"
              type="danger"
              plain
              :icon="Delete"
              @click="removeSlideshowImage(index)"
            >
              删除
            </el-button>
          </div>

          <ImageWp
            :model-value="normalizeGalleryItem(image)"
            :node-id="nodeId"
            :show-size-config="true"
            @update:model-value="(value) => updateSlideshowImage(index, value)"
          />
        </div>
      </div>

      <el-empty v-else description="暂无轮播背景图片" :image-size="60" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Delete, PictureFilled, Plus } from "@element-plus/icons-vue";
import ImageWp from "@/components/Common/imageWp.vue";

const props = defineProps({
  nodeId: { type: String, required: true },
  fields: { type: Object, required: true },
  onUpdate: { type: Function, required: true },
});

function pickRawImageUrl(val) {
  if (val == null) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val !== "object" || Array.isArray(val)) return "";

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

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      const value = candidate.trim();
      if (!value.includes("elementor-placeholder")) return value;
    }

    if (
      Array.isArray(candidate) &&
      typeof candidate[0] === "string" &&
      candidate[0].trim()
    ) {
      const value = candidate[0].trim();
      if (!value.includes("elementor-placeholder")) return value;
    }
  }

  return "";
}

function hasImageData(value) {
  if (value == null || value === "") return false;
  if (typeof value === "string") return value.trim().length > 0;

  if (typeof value === "object" && !Array.isArray(value)) {
    if (pickRawImageUrl(value)) return true;

    const id = value.id;
    if (id == null || id === "") return false;

    const normalizedId = String(id).trim();
    return normalizedId.length > 0 && normalizedId !== "0";
  }

  return false;
}

function createEmptyGalleryItem() {
  return {
    url: "",
    id: "",
    size: "",
    alt: "",
    source: "library",
  };
}

function normalizeGalleryItem(item) {
  if (typeof item === "string") {
    return {
      ...createEmptyGalleryItem(),
      url: item.trim(),
    };
  }

  if (item && typeof item === "object" && !Array.isArray(item)) {
    return {
      ...createEmptyGalleryItem(),
      ...item,
    };
  }

  return createEmptyGalleryItem();
}

function getSlideshowItemKey(item, index) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    return `${item.id || item.url || "slideshow"}-${index}`;
  }

  if (typeof item === "string" && item.trim()) {
    return `${item.trim()}-${index}`;
  }

  return `slideshow-${index}`;
}

const hasMainBg = computed(() => hasImageData(props.fields?.background_image));
const hasOverlayBg = computed(() =>
  hasImageData(props.fields?.background_overlay_image)
);
const hasSlideshowGalleryField = computed(() =>
  Object.prototype.hasOwnProperty.call(
    props.fields || {},
    "background_slideshow_gallery"
  )
);
const slideshowGallery = computed(() =>
  Array.isArray(props.fields?.background_slideshow_gallery)
    ? props.fields.background_slideshow_gallery
    : []
);
const shouldShowSection = computed(
  () =>
    hasMainBg.value ||
    hasOverlayBg.value ||
    hasSlideshowGalleryField.value
);

function emitSlideshowGallery(next) {
  props.onUpdate("background_slideshow_gallery", next);
}

function addSlideshowImage() {
  emitSlideshowGallery([...slideshowGallery.value, createEmptyGalleryItem()]);
}

function removeSlideshowImage(index) {
  emitSlideshowGallery(
    slideshowGallery.value.filter((_, currentIndex) => currentIndex !== index)
  );
}

function updateSlideshowImage(index, value) {
  emitSlideshowGallery(
    slideshowGallery.value.map((item, currentIndex) =>
      currentIndex === index
        ? {
            ...normalizeGalleryItem(item),
            ...(value && typeof value === "object" ? value : {}),
          }
        : item
    )
  );
}
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
}

.bg-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.bg-block__title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #606266;
  margin-bottom: 0.5rem;
}

.slideshow-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.slideshow-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 10px;
  background: var(--el-fill-color-blank);
}

.slideshow-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.slideshow-item__title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #606266;
}

.mb-0 {
  margin-bottom: 0;
}
</style>
