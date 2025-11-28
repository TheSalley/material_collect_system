<template>
  <template v-if="currentNode?.settings?.title">
    <div class="field-item">
      <span class="field-label">标题：</span>
      <el-input
        v-model="localSettings.title"
        minlength="1"
        min="1"
        maxlength="100"
        placeholder="Please input"
        show-word-limit
        type="textarea"
        @input="handleFieldUpdate('title', localSettings.title)"
      />
    </div>
  </template>

  <template v-if="currentNode?.widgetType === 'text-editor'">
    <div class="field-item">
      <span class="field-label">文本：</span>
      <div :id="'editor_' + currentNode.id" class="min-h-[300px]"></div>
    </div>
  </template>

  <!-- 图片 -->
  <template v-if="currentNode?.widgetType === 'image'">
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
  </template>

  <template v-if="currentNode?.elements?.length">
    <div class="child-nodes">
      <DataExtractor
        v-for="(childNode, index) in currentNode.elements"
        :key="childNode.id || Math.random()"
        :current-node="childNode"
        @update:node="(updatedChild) => handleChildUpdate(index, updatedChild)"
      />
    </div>
  </template>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import DataExtractor from "@/components/DataExtractor.vue";

const props = defineProps({
  currentNode: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const fileList = ref([]);

onMounted(() => {
  if (props.currentNode?.settings?.editor) {
    const quill = new Quill(`#editor_${props.currentNode.id}`, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "link"],
          [{ color: [] }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
      },
      placeholder: "请输入文案",
    });
    quill.root.innerHTML = props.currentNode.settings.editor;
    quill.on("text-change", () => {
      handleFieldUpdate("editor", quill.root.innerHTML);
    });
  }
});

const emit = defineEmits(["update:node"]);

const localSettings = ref({
  ...props.currentNode.settings,
});

watch(
  () => props.currentNode.settings,
  (newSettings) => {
    localSettings.value = {
      ...newSettings,
    };
  },
  { immediate: true, deep: true }
);

const handleFieldUpdate = (fieldName, value) => {
  const updatedNode = {
    ...props.currentNode,
    settings: { ...localSettings.value, [fieldName]: value },
  };
  console.log("@@@ upodateNode: ", updatedNode);
  emit("update:node", updatedNode);
};

const handleChildUpdate = (childIndex, updatedChild) => {
  const updatedElements = [...props.currentNode.elements];
  updatedElements[childIndex] = updatedChild;
  const updatedNode = { ...props.currentNode, elements: updatedElements };
  emit("update:node", updatedNode);
};


const handleFileUpload = (res, file, files) => {
  // console.log('@@@123', res, file, files);
  if(res.code === 0 && res.data[0].success) {
    console.log(res.data[0].data.url);
    let tempSetting = {
      ...localSettings.value.image,
      url: res.data[0].data.url
    }
    console.log('123456', localSettings.value)
    console.log('123456', tempSetting)
    handleFieldUpdate('image', tempSetting);
  }
}
</script>
