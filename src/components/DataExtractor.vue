<template>
  <template v-if="currentNode?.settings?.title">
    <div class="field-item">
      <span class="field-label">标题：</span>
      <el-input
        v-model="localSettings.title"
        style="width: 240px"
        @input="handleFieldUpdate('title', localSettings.title)"
      />
    </div>
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
import { ref, watch } from "vue";

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
