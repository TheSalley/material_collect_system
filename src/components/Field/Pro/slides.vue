<template>
  <div v-if="hasSlidesField" class="__field-item space-y-3">
    <div class="flex items-center justify-between">
      <label class="__field-label">
        <el-icon><PictureFilled /></el-icon>
        <span>轮播图幻灯片</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <div class="flex items-center gap-2">
        <el-tag type="info">{{ slides.length }} 个幻灯片</el-tag>
        <el-button size="small" type="primary" :icon="Plus" @click="addSlide">
          新增
        </el-button>
      </div>
    </div>

    <el-collapse v-if="slides.length" v-model="activeSlide" accordion>
      <el-collapse-item
        v-for="(slide, index) in slides"
        :key="slide._id || index"
        :name="getSlideName(index)"
      >
        <template #title>
          <div class="flex flex-1 items-center justify-between gap-2 pr-3">
            <div class="flex items-center gap-2 font-medium">
              <el-icon class="text-[var(--el-color-primary)]"><Picture /></el-icon>
              <span>幻灯片 {{ index + 1 }}</span>
            </div>
            <el-button
              :icon="Delete"
              size="small"
              type="danger"
              @click.stop="removeSlide(index)"
            >
              删除
            </el-button>
          </div>
        </template>

        <div class="space-y-4 py-3">
          <div
            v-for="field in getVisibleTextFields(slide)"
            :key="field.key"
            class="__field-group"
          >
            <label class="__field-label">
              <el-icon><component :is="field.icon" /></el-icon>
              <span>{{ field.label }}</span>
            </label>
            <el-input
              :model-value="slide[field.key]"
              :placeholder="field.placeholder"
              :rows="field.rows"
              :type="field.type"
              show-word-limit
              @update:model-value="setSlideField(index, field.key, $event)"
            />
          </div>

          <div v-if="hasField(slide, 'background_image')" class="__field-group">
            <label class="__field-label">
              <el-icon><PictureFilled /></el-icon>
              <span>背景图片</span>
            </label>

            <div v-if="getSlideImageUrl(slide)" class="w-full max-w-[400px]">
              <img
                :src="getSlideImageUrl(slide)"
                alt="背景图片"
                class="block max-h-[300px] w-full rounded object-contain"
                @load="setSlideDim($event, index)"
              />
            </div>

            <el-upload
              action="#"
              class="w-full [&_.el-upload]:w-full"
              :before-upload="(file) => handleSlideImageUpload(file, index)"
              :show-file-list="false"
            >
              <el-button class="w-full" type="primary" :icon="Upload">
                上传图片
              </el-button>
            </el-upload>

            <div class="space-y-1 text-xs leading-relaxed text-[var(--el-text-color-secondary)]">
              <p v-if="slideDims[index]" class="m-0">{{ slideDims[index].label }}</p>
              <p class="m-0">{{ uploadTip }}</p>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-empty v-else description="暂无幻灯片" :image-size="72" />
  </div>
</template>

<script setup>
import { computed, shallowRef, watch } from "vue";
import {
  Document,
  Delete,
  Link,
  Picture,
  PictureFilled,
  Plus,
  Promotion,
  Upload,
} from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import { getFileFullUrl } from "@/apis";
import { genId } from "@/utils";
import {
  buildImageUploadTip,
  formatNaturalSizeLabel,
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
const activeSlide = shallowRef("slide-0");
const slideDims = shallowRef({});

const textFields = [
  {
    key: "heading",
    label: "标题",
    icon: Promotion,
    type: "textarea",
    rows: 2,
    placeholder: "请输入幻灯片标题",
  },
  {
    key: "description",
    label: "描述",
    icon: Document,
    type: "textarea",
    rows: 3,
    placeholder: "请输入幻灯片描述",
  },
  {
    key: "button_text",
    label: "按钮文本",
    icon: Link,
    type: "text",
    rows: undefined,
    placeholder: "请输入按钮文本",
  },
];

const hasSlidesField = computed(() => hasField(props.fields, "slides"));

const slides = computed(() => {
  const value = props.fields.slides;
  return Array.isArray(value) ? value : [];
});

watch(
  slides,
  () => {
    slideDims.value = {};
  },
  { deep: true }
);

function hasField(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
}

function getVisibleTextFields(slide) {
  return textFields.filter(({ key }) => hasField(slide, key));
}

function getSlideName(index) {
  return `slide-${index}`;
}

function getSlideImageUrl(slide) {
  const url = slide?.background_image?.url;
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  return getFileFullUrl(trimmed);
}

function setSlideDim(event, index) {
  const { naturalWidth, naturalHeight } = event.target;
  if (!naturalWidth || !naturalHeight) return;

  const dims = { width: naturalWidth, height: naturalHeight };
  slideDims.value = {
    ...slideDims.value,
    [index]: {
      label: formatNaturalSizeLabel(dims),
      dims,
    },
  };
}

function emitSlides(nextSlides) {
  props.onUpdate("slides", nextSlides);
}

function createSlide() {
  const sample = slides.value[0] || {};
  const slide = {
    _id: genId(),
  };

  textFields.forEach(({ key }) => {
    if (!slides.value.length || hasField(sample, key)) {
      slide[key] = "";
    }
  });

  if (!slides.value.length || hasField(sample, "background_image")) {
    slide.background_image = { url: "", id: "" };
  }

  return slide;
}

function addSlide() {
  const nextSlides = [...slides.value, createSlide()];
  activeSlide.value = getSlideName(nextSlides.length - 1);
  emitSlides(nextSlides);
}

function removeSlide(index) {
  const nextSlides = slides.value.filter((_, currentIndex) => currentIndex !== index);
  const nextActiveIndex = Math.min(index, nextSlides.length - 1);
  activeSlide.value = nextActiveIndex >= 0 ? getSlideName(nextActiveIndex) : "";
  emitSlides(nextSlides);
}

function updateSlide(index, getNextSlide) {
  emitSlides(
    slides.value.map((slide, currentIndex) =>
      currentIndex === index ? getNextSlide(slide) : slide
    )
  );
}

function setSlideField(index, key, value) {
  updateSlide(index, (slide) => ({ ...slide, [key]: value }));
}

function setSlideImage(index, image) {
  updateSlide(index, (slide) => ({
    ...slide,
    background_image: {
      ...(slide.background_image || {}),
      ...image,
    },
  }));
}

function handleSlideImageUpload(file, index) {
  const slideDim = slideDims.value[index];
  const options = slideDim?.dims
    ? { strictMatch: true, refDimensions: slideDim.dims }
    : {};

  handleImageUpload(
    file,
    (url, id) => {
      setSlideImage(index, { url, id });
    },
    options
  );

  return false;
}
</script>
