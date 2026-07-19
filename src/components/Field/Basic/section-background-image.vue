<template>
  <div v-if="shouldShowSection" class="__field-item section-bg-field">
    <label class="__field-label">
      <el-icon><PictureFilled /></el-icon>
      背景图
    </label>

    <div v-if="showMainBgBlock" class="bg-block">
      <div class="bg-block__title">主背景图</div>
      <ImageWp
        :model-value="mainBackgroundImage"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="(newImageData) => onUpdate('background_image', newImageData)"
      />
    </div>

    <div v-if="showOverlayBgBlock" class="bg-block">
      <div class="bg-block__title">叠加层图</div>
      <ImageWp
        :model-value="overlayBackgroundImage"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="(newImageData) => onUpdate('background_overlay_image', newImageData)"
      />
    </div>

    <div v-if="showSlideshowBlock" class="bg-block">
      <div class="bg-block__header">
        <div class="bg-block__title mb-0">轮播背景图库</div>
        <el-button size="small" type="primary" plain :icon="Plus" @click="addSlideshowImage">
          新增图片
        </el-button>
      </div>

      <div v-if="visibleSlideshowGallery.length" class="slideshow-list">
        <div
          v-for="item in visibleSlideshowGallery"
          :key="getSlideshowItemKey(item.image, item.index)"
          class="slideshow-item"
        >
          <div class="slideshow-item__header">
            <span class="slideshow-item__title">图片 {{ item.index + 1 }}</span>
            <el-button
              size="small"
              type="danger"
              plain
              :icon="Delete"
              @click="removeSlideshowImage(item.index)"
            >
              删除
            </el-button>
          </div>

          <ImageWp
            :model-value="item.image"
            :node-id="nodeId"
            :show-size-config="true"
            @update:model-value="(value) => updateSlideshowImage(item.index, value)"
          />
        </div>
      </div>

      <el-empty v-else description="暂无轮播背景图片" :image-size="60" />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref } from "vue";
import { Delete, PictureFilled, Plus } from "@element-plus/icons-vue";
import ImageWp from "@/components/Common/imageWp.vue";
import { isImageBlacklisted } from "@/utils/imageBlacklist";

const props = defineProps({
  nodeId: { type: String, required: true },
  fields: { type: Object, required: true },
  onUpdate: { type: Function, required: true },
});

const blacklist = inject("blacklist", ref([]));

function hasField(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
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

const hasMainBg = computed(() => hasField(props.fields, "background_image"));
const hasOverlayBg = computed(() =>
  hasField(props.fields, "background_overlay_image")
);
const hasSlideshowGalleryField = computed(() =>
  hasField(props.fields, "background_slideshow_gallery")
);
const slideshowGallery = computed(() =>
  Array.isArray(props.fields?.background_slideshow_gallery)
    ? props.fields.background_slideshow_gallery
    : []
);

const mainBackgroundImage = computed(() =>
  normalizeGalleryItem(props.fields?.background_image)
);
const overlayBackgroundImage = computed(() =>
  normalizeGalleryItem(props.fields?.background_overlay_image)
);

const showMainBgBlock = computed(() =>
  hasMainBg.value &&
  !isImageBlacklisted(mainBackgroundImage.value.url, blacklist.value)
);
const showOverlayBgBlock = computed(() =>
  hasOverlayBg.value &&
  !isImageBlacklisted(overlayBackgroundImage.value.url, blacklist.value)
);
const visibleSlideshowGallery = computed(() =>
  slideshowGallery.value
    .map((image, index) => ({
      index,
      image: normalizeGalleryItem(image),
    }))
    .filter((item) => !isImageBlacklisted(item.image.url, blacklist.value))
);
const showSlideshowBlock = computed(() =>
  hasSlideshowGalleryField.value && visibleSlideshowGallery.value.length > 0
);
const shouldShowSection = computed(
  () =>
    showMainBgBlock.value ||
    showOverlayBgBlock.value ||
    showSlideshowBlock.value
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
