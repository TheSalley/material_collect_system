<template>
  <div class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>图片</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <!-- 图片预览 -->
      <div v-if="imageUrl" class="w-full max-w-[400px] mb-3">
        <img :src="imageUrl" alt="预览图" />
      </div>
      <!-- 上传按钮 -->
      <el-upload
        action="#"
        :before-upload="handleBeforeUpload"
        :show-file-list="false"
        :accept="IMAGE_UPLOAD_DEFAULTS.accept"
      >
        <el-button type="primary" :icon="Upload">上传图片</el-button>
      </el-upload>
      <!-- 文字提示 -->
      <div class="__field-upload-hints">
        <p class="__hint-line">
          <span v-if="naturalSizeInfo"
            >当前图片尺寸：{{ naturalSizeInfo.witdh }} ×
            {{ naturalSizeInfo.height }} px
          </span>
          <span v-if="configuredDims">
            建议尺寸：{{ configuredDims.width }} ×
            {{ configuredDims.height }} px</span
          >
        </p>
        <p class="__hint-line">{{ uploadTip }}</p>
        <!-- 截图自定义尺寸 -->
        <div
          v-if="isAdmin && sectionSizes[sectionIndex]"
          class="__hint-line __target-size-hint"
        >
          <span class="__target-size-hint__label">截图目标尺寸：</span>
          <el-input-number
            v-model="sectionSizes[sectionIndex].width"
            :min="1"
            :max="4096"
            controls-position="right"
            size="small"
            class="__target-size-hint__input"
          />
          <span class="__target-size-hint__x">×</span>
          <el-input-number
            v-model="sectionSizes[sectionIndex].height"
            :min="1"
            :max="4096"
            controls-position="right"
            size="small"
            class="__target-size-hint__input"
          />
          <span class="__target-size-hint__unit">px</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, inject } from "vue";
import { Picture, Upload } from "@element-plus/icons-vue";
import { ElLoading } from "element-plus";
import { useGlobalStore } from "@/stores/global";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import {
  handleImageUpload,
  IMAGE_UPLOAD_DEFAULTS,
  buildImageUploadTip,
  getImageNaturalSizeFromUrl,
} from "@/utils/imageUpload";

const uploadTip = buildImageUploadTip({ ...IMAGE_UPLOAD_DEFAULTS });
const naturalSizeInfo = ref({ witdh: "", height: "" });

const props = defineProps({
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
  sectionIndex: { type: Number, default: undefined },
});

const sectionSizes = inject("sectionSizes", null);

const configuredDims = computed(() => {
  const s = sectionSizes.value[props.sectionIndex];
  if (!s) return null;
  const w = Number(s.width);
  const h = Number(s.height);
  if (!Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0)
    return { width: w, height: h };
  return null;
});

const globalStore = useGlobalStore();

const isAdmin = computed(() => globalStore.isAdmin);

const imageUrl = computed(() => {
  return props.fields.image?.url;
});

watch(
  () => imageUrl.value,
  async (url) => {
    naturalSizeInfo.value = { witdh: "", height: "" };
    if (!url) return;
    const dim = await getImageNaturalSizeFromUrl(url);
    naturalSizeInfo.value = { witdh: dim.width, height: dim.height };
  },
  { immediate: true },
);

const handleBeforeUpload = (file) => {
  const refDim = configuredDims.value || naturalSizeInfo.value.dims;
  const opts = refDim ? { strictMatch: true, refDimensions: refDim } : {};

  const loading = ElLoading.service({
    lock: true,
    text: "上传中...",
    background: "rgba(0, 0, 0, 0.5)",
  });

  return handleImageUpload(
    file,
    (url, id) => {
      loading.close();
      if (!props.fields.image) {
        props.fields.image = {};
      }
      props.fields.image.url = url;
      props.fields.image.id = id;
      props.onUpdate("image", props.fields.image);
    },
    opts,
  );
};
</script>

<style scoped>
.size-config-row {
  margin-top: 0.5rem;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  border: 1px dashed var(--el-border-color);
}

/* 截图目标尺寸：内嵌在同一行提示里 */
.target-size-hint {
  /* display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  padding: 5px 8px;
  border-radius: 5px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9) 0%,
    rgba(255, 255, 255, 0.92) 100%
  );
  border: 1px solid var(--el-color-primary-light-5); */
}

.target-size-hint__label {
  /* font-weight: 600;
  color: var(--el-color-primary);
  font-size: 0.75rem; */
}

.target-size-hint__sep {
  /* color: #606266;
  font-size: 0.75rem; */
}

.target-size-hint__value {
  /* font-size: 0.78rem;
  font-weight: 700;
  color: var(--el-color-primary-dark-2);
  font-variant-numeric: tabular-nums; */
}

.target-size-hint__input {
  /* width: 80px; */
}

.target-size-hint__x,
.target-size-hint__unit {
  /* font-size: 0.75rem;
  color: #909399; */
}
</style>
