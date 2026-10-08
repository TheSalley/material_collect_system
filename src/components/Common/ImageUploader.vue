<script setup>
import { nextTick, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";

/**
 * 图片上传组件
 * 支持点击选择、拖拽上传、聚焦粘贴（Ctrl+V）
 * 用法：<ImageUploader v-model="fileList" :limit="30" />
 */
const props = defineProps({
  /** 文件列表 v-model */
  modelValue: {
    type: Array,
    default: () => [],
  },
  /** 最大上传数量 */
  limit: {
    type: Number,
    default: 30,
  },
  /** 接受的文件类型 */
  accept: {
    type: String,
    default: "image/*",
  },
  /** 是否多选 */
  multiple: {
    type: Boolean,
    default: true,
  },
  /** 是否支持拖拽 */
  drag: {
    type: Boolean,
    default: true,
  },
  /** 列表类型 */
  listType: {
    type: String,
    default: "picture",
    validator: (val) => ["text", "picture", "picture-card"].includes(val),
  },
  /** 底部提示文字 */
  tip: {
    type: String,
    default: "支持 jpg / png / gif / webp 等图片格式，可批量选择多张",
  },
  /** 是否自动聚焦（用于打开弹窗/抽屉后直接可粘贴） */
  autoFocus: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "change", "exceed"]);

const uploadRef = ref(null);
const uploadAreaRef = ref(null);

/** 内部文件列表（与 el-upload 同步） */
const innerFiles = ref([]);

// 监听外部 modelValue 变化，同步到内部
watch(
  () => props.modelValue,
  (val) => {
    innerFiles.value = Array.isArray(val) ? [...val] : [];
  },
  { immediate: true, deep: true },
);

/** 自动聚焦 */
watch(
  () => props.autoFocus,
  (val) => {
    if (val) {
      nextTick(() => uploadAreaRef.value?.focus());
    }
  },
  { immediate: true },
);

/** 文件变化（选择/拖拽/粘贴都会触发） */
function handleChange(file) {
  if (!innerFiles.value.some((f) => f.uid === file.uid)) {
    innerFiles.value.push(file);
    emit("update:modelValue", innerFiles.value);
    emit("change", innerFiles.value, file);
  }
}

/** 移除文件 */
function handleRemove(file) {
  innerFiles.value = innerFiles.value.filter((f) => f.uid !== file.uid);
  emit("update:modelValue", innerFiles.value);
  emit("change", innerFiles.value, file);
}

/** 超出数量限制 */
function handleExceed() {
  ElMessage.warning(`最多只能上传 ${props.limit} 张图片，请先删除部分文件`);
  emit("exceed");
}

/**
 * 粘贴上传
 * 从剪贴板提取图片，通过 el-upload 的 handleStart 加入列表
 */
function handlePaste(event) {
  const items = event.clipboardData?.items;
  if (!items) return;

  const imageFiles = [];
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        const ext = file.type.split("/")[1] || "png";
        const renamedFile = new File(
          [file],
          `paste-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`,
          { type: file.type },
        );
        imageFiles.push(renamedFile);
      }
    }
  }

  if (imageFiles.length === 0) return;

  // 检查 limit
  const remaining = props.limit - innerFiles.value.length;
  if (remaining <= 0) {
    handleExceed();
    return;
  }

  const filesToAdd = imageFiles.slice(0, remaining);
  if (imageFiles.length > remaining) {
    ElMessage.warning(`最多只能上传 ${props.limit} 张，已忽略 ${imageFiles.length - remaining} 张`);
  }

  // 调用 el-upload 的 handleStart，让组件自己生成预览 URL
  filesToAdd.forEach((file) => {
    uploadRef.value?.handleStart(file);
  });

  ElMessage.success(`已粘贴 ${filesToAdd.length} 张图片`);
}

/** 清空所有文件 */
function clearFiles() {
  uploadRef.value?.clearFiles();
  innerFiles.value = [];
  emit("update:modelValue", []);
  emit("change", []);
}

/** 手动聚焦上传区域 */
function focus() {
  uploadAreaRef.value?.focus();
}

defineExpose({ clearFiles, focus, uploadRef });
</script>

<template>
  <div
    ref="uploadAreaRef"
    class="image-uploader"
    tabindex="0"
    @paste="handlePaste"
  >
    <el-upload
      ref="uploadRef"
      class="w-full"
      :drag="drag"
      :multiple="multiple"
      :auto-upload="false"
      :limit="limit"
      :accept="accept"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :file-list="innerFiles"
      :list-type="listType"
    >
      <el-icon class="el-icon--upload text-4xl text-primary mb-2"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处，或 <em>点击上传</em>，也可 <em>点击后 Ctrl+V 粘贴</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">{{ tip }}，最多 {{ limit }} 张</div>
      </template>
    </el-upload>
  </div>
</template>

<style scoped>
.image-uploader {
  outline: none;
  border-radius: 12px;
  transition: box-shadow 0.2s ease;
}

.image-uploader:focus {
  box-shadow: 0 0 0 2px var(--color-primary, #2b7cee);
}
</style>
