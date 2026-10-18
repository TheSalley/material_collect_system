<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="760px"
    :close-on-click-modal="false"
    append-to-body
    class="image-crop-dialog"
    @update:model-value="onVisibleChange"
    @closed="destroyCropper"
  >
    <div class="crop-stage">
      <img
        ref="imageRef"
        :src="src"
        class="crop-stage__image"
        alt="待裁切图片"
      />
    </div>

    <div class="crop-toolbar">
      <div class="crop-toolbar__group">
        <span class="crop-toolbar__label">比例</span>
        <el-radio-group v-model="aspectMode" size="small" @change="applyAspect">
          <el-radio-button
            v-for="preset in aspectPresets"
            :key="preset.key"
            :value="preset.key"
          >
            {{ preset.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="crop-toolbar__group">
        <el-tooltip content="左转 90°" placement="top">
          <el-button size="small" circle :icon="RefreshLeft" @click="rotate(-90)" />
        </el-tooltip>
        <el-tooltip content="右转 90°" placement="top">
          <el-button size="small" circle :icon="RefreshRight" @click="rotate(90)" />
        </el-tooltip>
        <el-tooltip content="水平翻转" placement="top">
          <el-button size="small" circle :icon="Switch" @click="flipX" />
        </el-tooltip>
        <el-tooltip content="重置" placement="top">
          <el-button size="small" circle :icon="Refresh" @click="handleReset" />
        </el-tooltip>
      </div>

      <div class="crop-toolbar__group crop-toolbar__zoom">
        <span class="crop-toolbar__label">缩放</span>
        <el-slider
          v-model="zoomValue"
          class="crop-toolbar__slider"
          :min="20"
          :max="300"
          :step="1"
          @input="handleZoom"
        />
      </div>
    </div>

    <div class="crop-output">
      <span class="crop-output__label">输出尺寸</span>
      <el-input-number
        v-model="outputWidth"
        :min="1"
        :max="8192"
        controls-position="right"
        size="small"
        class="crop-output__input"
        placeholder="宽"
      />
      <span class="crop-output__x">×</span>
      <el-input-number
        v-model="outputHeight"
        :min="1"
        :max="8192"
        controls-position="right"
        size="small"
        class="crop-output__input"
        placeholder="高"
      />
      <span class="crop-output__unit">px</span>
      <span class="crop-output__hint">留空则按裁切选区实际像素输出</span>
    </div>

    <template #footer>
      <div class="crop-footer">
        <el-button :disabled="exporting" @click="skip">不裁切直接上传</el-button>
        <span class="crop-footer__spacer"></span>
        <el-button :disabled="exporting" @click="emitCancel">取消</el-button>
        <el-button type="primary" :loading="exporting" @click="handleConfirm">
          确认裁切并上传
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { Refresh, RefreshLeft, RefreshRight, Switch } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { canvasToWebpFile } from "@/utils/webp";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** 待裁切图片地址（本地 object URL 或远程 URL） */
  src: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "裁切图片",
  },
  /** 初始比例：free | 1:1 | 4:3 | 3:4 | 16:9 | 9:16 | 数字比例（如 "800/600"） */
  aspect: {
    type: String,
    default: "free",
  },
  /** 初始输出宽度（建议尺寸） */
  defaultWidth: {
    type: Number,
    default: 0,
  },
  /** 初始输出高度（建议尺寸） */
  defaultHeight: {
    type: Number,
    default: 0,
  },
  /** 原图文件名：导出 webp 时沿用原名（仅替换扩展名） */
  filename: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const aspectPresets = [
  { key: "free", label: "自由" },
  { key: "1:1", label: "1:1" },
  { key: "4:3", label: "4:3" },
  { key: "3:4", label: "3:4" },
  { key: "16:9", label: "16:9" },
  { key: "9:16", label: "9:16" },
];

const imageRef = ref(null);
const aspectMode = ref("free");
const zoomValue = ref(100);
const outputWidth = ref(undefined);
const outputHeight = ref(undefined);
const exporting = ref(false);

let cropper = null;
let flipState = 1;

function formatAspectKey(raw) {
  const val = String(raw || "free");
  const known = aspectPresets.some((p) => p.key === val);
  if (known) return val;
  if (/^\d+[/:]\d+$/.test(val)) return val;
  return "free";
}

function parseAspect(key) {
  if (!key || key === "free") return NaN;
  const m = /^(\d+)[/:](\d+)$/.exec(key);
  if (!m) return NaN;
  const w = Number(m[1]);
  const h = Number(m[2]);
  return w > 0 && h > 0 ? w / h : NaN;
}

function applyAspect(key) {
  if (!cropper) return;
  cropper.setAspectRatio(parseAspect(key));
}

function initCropper() {
  const image = imageRef.value;
  if (!image || !image.src) return;

  if (cropper) cropper.destroy();
  flipState = 1;
  zoomValue.value = 100;
  aspectMode.value = formatAspectKey(initialAspect);

  cropper = new Cropper(image, {
    viewMode: 1,
    dragMode: "crop",
    autoCrop: true,
    autoCropArea: 0.8,
    responsive: true,
    background: false,
    guides: true,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
    ready: () => applyAspect(aspectMode.value),
  });
}

function destroyCropper() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

let initialAspect = "free";
function onVisibleChange(next) {
  emit("update:modelValue", next);
  if (next) {
    initialAspect = formatAspectKey(props.aspect);
    outputWidth.value = props.defaultWidth > 0 ? props.defaultWidth : undefined;
    outputHeight.value = props.defaultHeight > 0 ? props.defaultHeight : undefined;
    nextTick(initCropper);
  } else {
    emit("cancel");
  }
}

watch(
  () => props.src,
  () => {
    if (props.modelValue) nextTick(initCropper);
  },
);

function rotate(deg) {
  cropper?.rotate(deg);
}

function flipX() {
  if (!cropper) return;
  flipState *= -1;
  cropper.scaleX(flipState);
}

function handleZoom() {
  if (!cropper) return;
  cropper.zoomTo(zoomValue.value / 100);
}

function handleReset() {
  if (!cropper) return;
  cropper.reset();
  flipState = 1;
  zoomValue.value = 100;
  applyAspect(aspectMode.value);
}

function skip() {
  emit("confirm", null);
  emit("update:modelValue", false);
}

function emitCancel() {
  emit("update:modelValue", false);
}

async function handleConfirm() {
  if (!cropper) return;
  if (exporting.value) return;

  exporting.value = true;
  try {
    const canvas = cropper.getCroppedCanvas({
      width: outputWidth.value || undefined,
      height: outputHeight.value || undefined,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });
    if (!canvas || !canvas.width || !canvas.height) {
      ElMessage.error("生成图片失败，请重试");
      return;
    }
    const baseName = String(props.filename || "")
      .trim()
      .replace(/\.[^.]+$/i, "");
    const file = await canvasToWebpFile(canvas, {
      filename: baseName ? `${baseName}.webp` : `crop_${Date.now()}.webp`,
    });
    if (!file) {
      ElMessage.error("当前浏览器不支持 WEBP 导出");
      return;
    }
    emit("confirm", file);
    emit("update:modelValue", false);
  } catch (error) {
    ElMessage.error("裁切失败：" + (error.message || "图片可能受跨域限制"));
  } finally {
    exporting.value = false;
  }
}
</script>

<style scoped>
.crop-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 420px;
  overflow: hidden;
  border-radius: var(--radius-field);
  border: 1px solid var(--color-border);
  background:
    linear-gradient(45deg, var(--color-surface-hover) 25%, transparent 25%),
    linear-gradient(-45deg, var(--color-surface-hover) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--color-surface-hover) 75%),
    linear-gradient(-45deg, transparent 75%, var(--color-surface-hover) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
}

.crop-stage__image {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.crop-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}

.crop-toolbar__group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crop-toolbar__zoom {
  flex: 1;
  min-width: 200px;
}

.crop-toolbar__slider {
  flex: 1;
}

.crop-toolbar__label {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.crop-output {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: var(--radius-field);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border-light);
}

.crop-output__label {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.crop-output__input {
  width: 110px;
}

.crop-output__x,
.crop-output__unit {
  color: var(--color-text-muted);
  font-size: 13px;
}

.crop-output__hint {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.crop-footer {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.crop-footer__spacer {
  flex: 1;
}
</style>
