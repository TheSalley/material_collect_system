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
        <span v-else-if="isAdmin && showSizeConfig && sizeConfigKey">
          建议尺寸：未设置
        </span>
        <el-button
          v-if="isAdmin && sizeConfigKey && typeof bindDemoSize === 'function'"
          size="small"
          :type="isCurrentSizeBound ? 'success' : 'primary'"
          :plain="!isCurrentSizeBound"
          :loading="bindDemoSizeLoadingKey === sizeConfigKey"
          :disabled="!configuredDims"
          @click="bindDemoSize(sectionConfigId, imageUrl)"
        >
          {{ isCurrentSizeBound ? "取消绑定 Demo" : "绑定 Demo" }}
        </el-button>
      </p>
      <p class="__hint-line">{{ uploadTip }}</p>

      <div
        v-if="isAdmin && showSizeConfig && sizeConfigKey"
        class="__hint-line __target-size-hint mt-2"
      >
        <span class="__target-size-hint__label">截图目标尺寸：</span>
        <el-input-number
          v-model="getOrCreateSizeConfig(sizeConfigKey).width"
          :min="1"
          :max="4096"
          controls-position="right"
          size="small"
          class="__target-size-hint__input"
        />
        <span class="__target-size-hint__x">x</span>
        <el-input-number
          v-model="getOrCreateSizeConfig(sizeConfigKey).height"
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
const injectedSectionId = inject("currentSectionId", "");

const bindDemoSizeLoadingKey = computed(() => String(bindDemoSizeLoadingRef?.value || ""));
const sectionConfigId = computed(() => {
  const sectionId = String(injectedSectionId?.value || injectedSectionId || "").trim();
  if (sectionId) return sectionId;
  return String(props.nodeId || "").trim();
});

function buildSizeConfigKey(sectionId, imageUrl = "") {
  const key = String(sectionId || "").trim();
  if (!key) return "";

  const normalizedImageUrl = String(imageUrl || "").trim();
  if (!normalizedImageUrl) return key;

  return `${key}::${encodeURIComponent(normalizedImageUrl)}`;
}

function parseSizeConfigKey(key = "") {
  const raw = String(key || "").trim();
  if (!raw) {
    return { sectionId: "", imageUrl: "" };
  }

  const separatorIndex = raw.indexOf("::");
  if (separatorIndex < 0) {
    return { sectionId: raw, imageUrl: "" };
  }

  const sectionId = raw.slice(0, separatorIndex).trim();
  const encodedImageUrl = raw.slice(separatorIndex + 2).trim();
  if (!encodedImageUrl) {
    return { sectionId, imageUrl: "" };
  }

  try {
    return { sectionId, imageUrl: decodeURIComponent(encodedImageUrl) };
  } catch {
    return { sectionId, imageUrl: encodedImageUrl };
  }
}

const sizeConfigKey = computed(() => {
  const sectionId = sectionConfigId.value;
  const image = String(imageUrl.value || "").trim();
  return buildSizeConfigKey(sectionId, image);
});

function hasValidSizeConfig(value) {
  if (!value || typeof value !== "object") return false;
  const w = Number(value.width);
  const h = Number(value.height);
  return (Number.isFinite(w) && w > 0) || (Number.isFinite(h) && h > 0);
}

const isCurrentSizeBound = computed(() => {
  if (!sizeConfigKey.value || typeof isDemoSizeBound !== "function") return false;
  return Boolean(isDemoSizeBound(sectionConfigId.value, imageUrl.value));
});

const configuredDims = computed(() => {
  if (!sectionSizes.value || !sizeConfigKey.value) return null;
  const direct = sectionSizes.value?.[sizeConfigKey.value];
  if (hasValidSizeConfig(direct)) {
    const w = Number(direct.width);
    const h = Number(direct.height);
    return { width: w, height: h };
  }

  const legacy = sectionSizes.value?.[sectionConfigId.value];
  if (hasValidSizeConfig(legacy)) {
    const w = Number(legacy.width);
    const h = Number(legacy.height);
    return { width: w, height: h };
  }

  const sectionIdOnly = parseSizeConfigKey(sizeConfigKey.value).sectionId;
  const sectionFallback = sectionIdOnly ? sectionSizes.value?.[sectionIdOnly] : null;
  if (hasValidSizeConfig(sectionFallback)) {
    const w = Number(sectionFallback.width);
    const h = Number(sectionFallback.height);
    return { width: w, height: h };
  }

  const s = direct || legacy || sectionFallback;
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
    const { sectionId } = parseSizeConfigKey(id);
    const legacyConfig = sectionId ? sectionSizes.value[sectionId] || sectionSizes.value[sectionConfigId.value] : null;
    sectionSizes.value[id] = legacyConfig ? { ...legacyConfig } : { width: null, height: null };
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
