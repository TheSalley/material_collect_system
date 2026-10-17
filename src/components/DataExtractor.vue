<template>
  <template v-if="editableNode && getFieldComponent(editableNode?.widgetType)">
    <component
      :is="getFieldComponent(editableNode?.widgetType)"
      :node-id="editableNode.id"
      :fields="editableNode.fields"
      :widgetType="editableNode.widgetType"
      :settings="settings"
      :class="{ 'node-hidden': isHidden }"
      :on-update="handleFieldUpdate" />
  </template>

  <!-- 递归渲染子节点 -->
  <template v-if="originalNode?.elements?.length">
    <div class="child-nodes mb-2">
      <DataExtractor
        v-for="childNode in originalNode.elements"
        :key="childNode.id"
        :original-node="childNode"
        :editable-map="editableMap"
        @update:field="emit('update:field', $event)"
        @toggle-hidden="emit('toggle-hidden', $event)" />
    </div>
  </template>
</template>

<script setup>
import { computed, inject, provide, unref } from "vue";
import DataExtractor from "@/components/DataExtractor.vue";
import { pickFieldModule } from "@/utils/elementorFieldUi.js";
import { isPartHidden } from "@/utils/moduleModeUtils.js";

const modules = import.meta.glob("/src/components/ElementorFields/**/*.vue", { eager: true });
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

const emit = defineEmits(["update:field", "toggle-hidden"]);

const settings = computed(() => props.settings ?? props.originalNode?.settings ?? {});
const isHidden = computed(() => isPartHidden(props.originalNode));
const parentSectionId = inject("currentSectionId", "");
const currentSectionId = computed(() => String(unref(parentSectionId) || props.originalNode?.id || ""));

provide("currentSectionId", currentSectionId);
provide(
  "fieldWidgetContext",
  computed(() => ({
    nodeId: props.originalNode?.id || "",
    hidden: isPartHidden(props.originalNode),
  })),
);
provide("toggleFieldWidget", (nodeId) => emit("toggle-hidden", nodeId));

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

/* 隐藏组件：内容淡显 */
.node-hidden {
  opacity: 0.6;
}
</style>
