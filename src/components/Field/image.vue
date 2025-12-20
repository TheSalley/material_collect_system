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
import { ref, computed } from "vue";
import { uploadImage } from "@/apis";

const props = defineProps({
  localSettings: {
    type: Object,
    default: () => ({})
  },
  onUpdate: {
    type: Function,
    required: true
  }
});

// 从localSettings中获取图像值
const value = computed(() => props.localSettings.image || {});

const handleBeforeUpload = (file) => {
  const isImage = file.type === "image/jpeg" || file.type === "image/png";
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isImage) {
    ElMessage.error("仅支持上传 jpg/png 格式的图片！");
    return false;
  }
  if (!isLt10M) {
    ElMessage.error("图片大小不能超过 10MB!");
    return false;
  }
  customUpload(file);
  return false;
};

const customUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadImage(formData);

    if (res.code === 0 && res.data[0].success) {
      ElMessage.success("图片上传成功！");
      const updatedImage = {
      ...value.value,
      url: res.data[0].data.url,
      id: res.data[0].data.attachment_id
    };
      props.onUpdate('image', updatedImage);
    } else {
      ElMessage.error("上传失败：" + res.message);
    }
  } catch (err) {
    ElMessage.error("上传失败：" + err.message);
  }
};
</script>