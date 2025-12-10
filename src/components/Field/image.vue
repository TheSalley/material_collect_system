<template>
  <div class="field-item">
    <el-upload
      v-model:file-list="fileList"
      class="upload-demo"
      action="http://192.168.110.27/wp-json/custom-db-api/v1/upload_files"
      :on-success="handleFileUpload"
    >
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
import { ref } from "vue";

const props = defineProps({
  value: {
    type: Object,
    default: () => ({})
  },
  onUpdate: {
    type: Function,
    required: true
  }
});

const fileList = ref([]);

const handleFileUpload = (res, file, files) => {
  if(res.code === 0 && res.data[0].success) {
    const updatedImage = {
      ...props.value,
      url: res.data[0].data.url
    };
    props.onUpdate('image', updatedImage);
  }
};
</script>