<template>
<!-- 渲染可编辑组件 -->
  <component
    :is="getFieldComponent(editableNode?.widgetType)"
    v-if="editableNode && getFieldComponent(editableNode?.widgetType)"
    :node-id="editableNode.id"
    :fields="editableNode.fields"
    :widgetType="editableNode.widgetType"
    :settings="settings"
    :on-update="handleFieldUpdate" />

  <!-- 递归渲染子节点 -->
  <template v-if="originalNode?.elements?.length">
    <div class="child-nodes mb-2">
      <DataExtractor
        v-for="childNode in originalNode.elements"
        :key="childNode.id"
        :original-node="childNode"
        :editable-map="editableMap"
        @update:field="emit('update:field', $event)" />
    </div>
  </template>
</template>

<script setup>
import { computed, inject, provide, unref } from "vue";
import DataExtractor from "@/components/DataExtractor.vue";
import { pickFieldModule } from "@/utils/elementorFieldUi.js";

const modules = import.meta.glob("/src/components/Field/**/*.vue", { eager: true });
const getFieldComponent = (widgetType) => pickFieldModule(modules, widgetType);

const props = defineProps({
  originalNode: {
    type: Object,
    required: true,
  },
  editableMap: {
    type: Map,
    required: true,
  },
  settings: {
    type: Object,
    default: undefined,
  },
});

const emit = defineEmits(["update:field"]);

const settings = computed(() => props.settings ?? props.originalNode?.settings ?? {});
const parentSectionId = inject("currentSectionId", "");
const currentSectionId = computed(() => String(unref(parentSectionId) || props.originalNode?.id || ""));

provide("currentSectionId", currentSectionId);

const editableNode = computed(() => {
  if (!props.originalNode?.id) return null;
  return props.editableMap.get(props.originalNode.id) || null;
});

const handleFieldUpdate = (fieldName, value) => {
  if (!editableNode.value) return;
  editableNode.value.fields[fieldName] = value;
  emit("update:field", {
    nodeId: editableNode.value.id,
    fieldName,
    value,
  });
};
</script>

<style scoped>
.child-nodes {
  padding-left: 0;
}
</style>
