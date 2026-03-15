<template>
  <div class="field-item">
    <label class="field-label">
      <el-icon><Picture /></el-icon>
      图片
    </label>
    
    <!-- 图片预览 -->
    <div v-if="imageUrl" class="image-preview mb-3">
      <img :src="imageUrl" alt="预览图" />
    </div>
    
    <!-- 上传按钮 -->
    <el-upload 
      action="#" 
      :before-upload="handleBeforeUpload"
      :show-file-list="false"
      class="upload-wrapper"
    >
      <el-button type="primary" :icon="Upload">上传图片</el-button>
      <template #tip>
        <div class="el-upload__tip">
          支持 jpg/png 格式，大小不超过 10MB
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Picture, Upload } from '@element-plus/icons-vue';
import { handleImageUpload } from "@/utils/imageUpload";
import { getFileFullUrl } from "@/apis";

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  fields: {
    type: Object,
    required: true
  },
  onUpdate: {
    type: Function,
    required: true
  }
});

// 获取图片URL用于预览
const imageUrl = computed(() => {
  const url = props.fields.image?.url;
  if (!url) return '';
  // 如果已经是完整URL，直接返回；否则使用 getFileFullUrl 转换
  return url.startsWith('http') ? url : getFileFullUrl(url);
});

const handleBeforeUpload = (file) => {
  return handleImageUpload(file, (url, id) => {
    // 直接修改原对象，避免创建新对象破坏数据结构
    if (!props.fields.image) {
      props.fields.image = {};
    }
    props.fields.image.url = url;
    props.fields.image.id = id;
    props.onUpdate('image', props.fields.image);
  });
};
</script>

<style scoped>
.field-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #606266;
  margin-bottom: 0.25rem;
}

.field-label .el-icon {
  color: #409eff;
  font-size: 1rem;
}

.image-preview {
  width: 100%;
  max-width: 400px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
}

.upload-wrapper {
  width: 100%;
}

.upload-wrapper :deep(.el-upload) {
  width: 100%;
}

.upload-wrapper :deep(.el-button) {
  width: 100%;
}

.el-upload__tip {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #909399;
  line-height: 1.4;
}
</style>