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
        @toggle-hidden="emit('toggle-hidden', $event)"
        @apply-preset-node="emit('apply-preset-node', $event)" />
    </div>
  </template>

  <!-- 组件级预设弹窗 -->
  <PresetPickerDialog
    v-model="presetVisible"
    :current-fields="presetFields"
    :preset-data="presetData"
    @apply="handleApplyPreset"
  />
</template>

<script setup>
import { computed, inject, provide, ref, unref } from "vue";
import DataExtractor from "@/components/DataExtractor.vue";
import PresetPickerDialog from "@/components/module-mode/PresetPickerDialog.vue";
import { pickFieldModule } from "@/utils/elementorFieldUi.js";
import { isPartHidden } from "@/utils/moduleModeUtils.js";
import { loadPresetData, collectReplaceableFields } from "@/utils/presetContentData.js";
import { useGlobalStore } from "@/stores/global";

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

const emit = defineEmits(["update:field", "toggle-hidden", "apply-preset-node"]);

// 管理员身份：由 EditorPanel 透传（仅 admin 显示「用预设替换」）
const globalStore = useGlobalStore();
const isAdmin = inject("fieldPresetAdmin", globalStore.isAdmin);

// 当前组件节点（在 replaceableFields 之前声明，避免计算时 TDZ 报错）
const editableNode = computed(() => {
  if (!props.originalNode?.id) return null;
  return props.editableMap.get(props.originalNode.id) || null;
});

// ── 组件级行业预设 ────────────────────────────────────────────────────────
const presetVisible = ref(false);
const presetFields = ref([]);
const presetData = ref(loadPresetData());

const replaceableFields = computed(() => {
  if (!editableNode.value?.fields) return [];
  return collectReplaceableFields(editableNode.value.widgetType, editableNode.value.fields);
});

function openPresetPicker() {
  presetData.value = loadPresetData();
  // 补上 nodeId：弹窗应用时才能定位到当前组件节点写入
  presetFields.value = replaceableFields.value.map((f) => ({
    ...f,
    nodeId: editableNode.value?.id || "",
  }));
  presetVisible.value = true;
}

function handleApplyPreset(updates) {
  emit("apply-preset-node", {
    nodeId: editableNode.value?.id || "",
    updates,
  });
}

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
provide("openFieldPreset", openPresetPicker);
// 传 computed，字段变化时按钮显隐自动更新
provide("hasReplaceableFields", computed(() => replaceableFields.value.length > 0));

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
