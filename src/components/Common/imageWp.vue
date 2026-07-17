<template>
  <div>
    <!-- 图片预览 -->
    <div v-if="imageUrl && !isBlacklisted" class="w-full mb-3" :style="{ maxWidth: width + 'px' }">
      <img :src="imageUrl" alt="预览图" />
    </div>
    <!-- 黑名单提示 -->
    <div
      v-else-if="imageUrl && isBlacklisted"
      class="w-full mb-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center"
      :style="{ maxWidth: width + 'px' }"
    >
      <el-icon class="text-red-400 text-2xl mb-1"><RemoveFilled /></el-icon>
      <p class="text-sm text-red-500 dark:text-red-400">该图片已被列入黑名单，不予显示</p>
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
        <span v-if="naturalSizeInfo.width && naturalSizeInfo.height"
          >当前图片尺寸：{{ naturalSizeInfo.width }} ×
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
        v-if="isAdmin && showSizeConfig && nodeId"
        class="__hint-line __target-size-hint mt-2"
      >
        <span class="__target-size-hint__label">截图目标尺寸：</span>
        <el-input-number
          v-model="getOrCreateSizeConfig(nodeId).width"
          :min="1"
          :max="4096"
          controls-position="right"
          size="small"
          class="__target-size-hint__input"
        />
        <span class="__target-size-hint__x">×</span>
        <el-input-number
          v-model="getOrCreateSizeConfig(nodeId).height"
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
</template>
<script setup>
import { computed, ref, watch, inject } from "vue";
import { Upload, RemoveFilled } from "@element-plus/icons-vue";
import { ElLoading } from "element-plus";
import { useGlobalStore } from "@/stores/global";
import {
  handleImageUpload,
  IMAGE_UPLOAD_DEFAULTS,
  buildImageUploadTip,
  getImageNaturalSizeFromUrl,
} from "@/utils/imageUpload";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ url: null, id: null }),
  },
  nodeId: {
    type: String,
    required: false,
  },
  showSizeConfig: {
    type: Boolean,
    default: false,
  },
  width: { type: Number, required: false, default: 400 },
});

const emit = defineEmits(["update:modelValue"]);

const uploadTip = buildImageUploadTip({ ...IMAGE_UPLOAD_DEFAULTS });
const naturalSizeInfo = ref({ width: "", height: "" });

const { isAdmin } = useGlobalStore();

const sectionSizes = inject("sectionSizes", ref({}));

/** 黑名单图片 URL 列表（由父组件通过 provide 传入） */
const blacklist = inject("blacklist", ref([]));

const configuredDims = computed(() => {
  if (!sectionSizes.value || !props.nodeId) return null;
  const s = sectionSizes.value?.[props.nodeId];
  if (!s) return null;
  const w = Number(s.width);
  const h = Number(s.height);
  if ((!Number.isNaN(w) && w > 0) || (!Number.isNaN(h) && h > 0)) {
    return { width: w, height: h };
  }
  return null;
});

function getOrCreateSizeConfig(id) {
  if (!sectionSizes.value || !id) return { width: null, height: null };
  if (!sectionSizes.value[id]) {
    sectionSizes.value[id] = { width: null, height: null };
  }
  return sectionSizes.value[id];
}

const imageUrl = computed(() => props.modelValue?.url);

/** 判断当前图片是否在黑名单中 */
const isBlacklisted = computed(() => {
  const url = imageUrl.value;
  if (!url) return false;
  const list = blacklist.value;
  if (!Array.isArray(list) || list.length === 0) return false;
  return list.some((item) => url.includes(item) || item.includes(url));
});

watch(
  () => imageUrl.value,
  async (url) => {
    naturalSizeInfo.value = { width: "", height: "" };
    if (!url) return;
    const dim = await getImageNaturalSizeFromUrl(url);
    naturalSizeInfo.value = { width: dim.width, height: dim.height };
  },
  { immediate: true },
);

const handleBeforeUpload = (file) => {
  const refDim = props.configuredDims || naturalSizeInfo.value;
  const opts = refDim?.width && refDim?.height ? { strictMatch: true, refDimensions: refDim } : {};

  const loading = ElLoading.service({
    lock: true,
    text: "上传中...",
  });

  handleImageUpload(file, (url, id) => {
    loading.close();
    emit("update:modelValue", { ...props.modelValue, url, id });
  }, opts).then((ok) => {
    if (ok === false) {
      loading.close();
    }
  });

  return false;
};
</script>
