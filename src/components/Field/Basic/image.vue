<template>
  <div class="field-item">
    <el-upload action="#" :before-upload="handleBeforeUpload">
      <el-button type="primary">Click to upload</el-button>
      <template #tip>
        <div class="el-upload__tip">
          jpg/png files with a size less than 500KB.
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { handleImageUpload } from "@/utils/imageUpload";

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

// 从fields中获取图像值
const value = computed(() => props.fields.image || {});

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