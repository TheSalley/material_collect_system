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
        :current-node="childNode" @update:node="(updatedChild) => handleChildUpdate(index, updatedChild)" />
    </div>
  </template>
</template>
<script setup>
import { ref, watch } from "vue";
import DataExtractor from "@/components/DataExtractor.vue";

// 自动导入Field目录下的所有组件
const modules = import.meta.glob("@/components/Field/*.vue", { eager: true });

const getFieldComponent = (widgetType) => {
  if (!widgetType) return null;

  // 构造组件路径
  const componentPath = `/src/components/Field/${widgetType}.vue`;

  // 返回对应的组件
  return modules[`/src/components/Field/${widgetType}.vue`]?.default || null;
};

const props = defineProps({
  currentNode: {
    type: Object,
    required: true,
    default: () => ({}),
  },
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
</script>