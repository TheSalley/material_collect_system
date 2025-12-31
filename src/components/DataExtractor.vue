<template>
  <component :is="getFieldComponent(currentNode?.widgetType)"
    v-if="currentNode && getFieldComponent(currentNode?.widgetType)" 
    :current-node="currentNode" 
    :node-id="currentNode.id" 
    :local-settings="localSettings"
    :on-update="handleFieldUpdate" />

  <template v-if="currentNode?.elements?.length">
    <div class="child-nodes">
      <DataExtractor v-for="(childNode, index) in currentNode.elements" :key="childNode.id || Math.random()"
        :current-node="childNode" 
        @update:node="(updatedChild) => handleChildUpdate(index, updatedChild)" />
    </div>
  </template>
</template>
<script setup>
import { ref, watch, watchEffect, inject, computed } from "vue";
import DataExtractor from "@/components/DataExtractor.vue";
import { translate } from "@/apis/index.js";

// 自动导入Field目录下的所有组件（包括子目录）
const modules = import.meta.glob("/src/components/Field/**/*.vue", { eager: true });

const getFieldComponent = (widgetType) => {
  if (!widgetType) return null;

  // 尝试不同的路径模式来查找组件
  const possiblePaths = [
    `/src/components/Field/${widgetType}.vue`,
    `/src/components/Field/Basic/${widgetType}.vue`,
    `/src/components/Field/General/${widgetType}.vue`
  ];

  // 返回第一个找到的组件
  for (const path of possiblePaths) {
    if (modules[path]) {
      return modules[path].default;
    }
  }

  return null;
};

const props = defineProps({
  currentNode: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const isTranslate = inject('isTranslate', ref(false));
const translateConfig = inject('translateConfig', { sourceLanguage: 'zh', targetLanguage: 'en' });
const sourceLanguage = computed(() => translateConfig.sourceLanguage);
const targetLanguage = computed(() => translateConfig.targetLanguage);

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

// 监听翻译状态变化
watchEffect(async () => {
  if (isTranslate.value) {
    // 执行翻译逻辑
    await handleTranslation();
  }
});

// 处理翻译逻辑
async function handleTranslation() {
  // 这里应该实现具体的翻译逻辑
  // 例如提取文本内容并调用翻译API
  console.log("正在翻译节点:", props.currentNode.id);
  
  // 示例：如果节点包含文本内容，则进行翻译
  const textFields = ['title', 'editor', 'content', 'text', 'description', 'caption'];
  let hasTextToTranslate = false;
  
  for (const field of textFields) {
    if (localSettings.value[field] && typeof localSettings.value[field] === 'string') {
      hasTextToTranslate = true;
      // 调用翻译API
      try {
        // 示例调用，实际应该传入正确的参数
        // const res = await translate({
        //   sourceText: localSettings.value[field],
        //   sourceLanguage: props.sourceLanguage,
        //   targetLanguage: props.targetLanguage
        // });
        // if (res.code === 0) {
        //   handleFieldUpdate(field, res.data.translatedText);
        // }
      } catch (error) {
        console.error("翻译出错:", error);
      }
    }
  }
  
  if (hasTextToTranslate) {
    console.log(`节点 ${props.currentNode.id} 的文本内容已尝试翻译`);
  }
}

const handleFieldUpdate = (fieldName, value) => {
  const updatedNode = {
    ...props.currentNode,
    settings: { ...localSettings.value, [fieldName]: value },
  };
  emit("update:node", updatedNode);
};

const handleChildUpdate = (childIndex, updatedChild) => {
  const updatedElements = [...props.currentNode.elements];
  updatedElements[childIndex] = updatedChild;
  const updatedNode = { ...props.currentNode, elements: updatedElements };
  emit("update:node", updatedNode);
};
</script>