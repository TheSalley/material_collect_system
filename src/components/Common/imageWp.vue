<template>
  <div v-if="!isBlacklisted">
    <div v-if="imageUrl" class="w-full mb-3" :style="{ maxWidth: width + 'px' }">
      <img :src="imageUrl" alt="预览图" />
    </div>

    <el-upload
      action="#"
      :before-upload="handleBeforeUpload"
      :show-file-list="false"
      :accept="IMAGE_UPLOAD_DEFAULTS.accept"
    >
      <el-button type="primary" :icon="Upload">上传图片</el-button>
    </el-upload>

    <div class="__field-upload-hints">
      <p class="__hint-line">
        <span v-if="naturalSizeInfo.width && naturalSizeInfo.height">
          当前图片尺寸：{{ naturalSizeInfo.width }} x {{ naturalSizeInfo.height }} px
        </span>
        <span v-if="configuredDims">
          建议尺寸：{{ configuredDims.width }} x {{ configuredDims.height }} px
        </span>
        <span v-else-if="isAdmin && showSizeConfig && nodeId">
          建议尺寸：未设置
        </span>
        <el-button
          v-if="isAdmin && nodeId && typeof bindDemoSize === 'function'"
          size="small"
          :type="isCurrentSizeBound ? 'success' : 'primary'"
          :plain="!isCurrentSizeBound"
          :loading="bindDemoSizeLoadingKey === nodeId"
          :disabled="!configuredDims"
          @click="bindDemoSize(nodeId)"
        >
          {{ isCurrentSizeBound ? "取消绑定 Demo" : "绑定 Demo" }}
        </el-button>
      </p>
      <p class="__hint-line">{{ uploadTip }}</p>

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
        <span class="__target-size-hint__x">x</span>
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
import { Upload } from "@element-plus/icons-vue";
import { ElLoading } from "element-plus";
import { useGlobalStore } from "@/stores/global";
import {
  handleImageUpload,
  IMAGE_UPLOAD_DEFAULTS,
  buildImageUploadTip,
  getImageNaturalSizeFromUrl,
} from "@/utils/imageUpload";
import { isImageBlacklisted } from "@/utils/imageBlacklist";

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
const blacklist = inject("blacklist", ref([]));
const bindDemoSize = inject("bindDemoSize", null);
const bindDemoSizeLoadingRef = inject("bindDemoSizeLoadingKey", ref(""));
const isDemoSizeBound = inject("isDemoSizeBound", null);

const bindDemoSizeLoadingKey = computed(() => String(bindDemoSizeLoadingRef?.value || ""));
const isCurrentSizeBound = computed(() => {
  if (!props.nodeId || typeof isDemoSizeBound !== "function") return false;
  return Boolean(isDemoSizeBound(props.nodeId));
});

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

const isBlacklisted = computed(() => {
  return isImageBlacklisted(imageUrl.value, blacklist.value);
});

watch(
  () => imageUrl.value,
  async (url) => {
    naturalSizeInfo.value = { width: "", height: "" };
    if (!url) return;
    const dim = await getImageNaturalSizeFromUrl(url);
    naturalSizeInfo.value = {
      width: dim?.width || "",
      height: dim?.height || "",
    };
  },
  { immediate: true },
);

const handleBeforeUpload = (file) => {
  const refDim = configuredDims.value || naturalSizeInfo.value;
  const opts = refDim?.width && refDim?.height
    ? { strictMatch: true, refDimensions: refDim }
    : {};

  const loading = ElLoading.service({
    lock: true,
    text: "上传中...",
  });

  handleImageUpload(
    file,
    (url, id) => {
      loading.close();
      emit("update:modelValue", { ...props.modelValue, url, id });
    },
    opts
  ).then((ok) => {
    if (ok === false) {
      loading.close();
    }
  });

  return false;
};
</script>
