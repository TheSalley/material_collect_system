<template>
  <span class="field-widget-extra">
    <el-tag v-if="isAdmin" type="primary">{{ type }}</el-tag>
    <button
      v-if="context?.nodeId"
      type="button"
      class="hidden-toggle-btn"
      :class="{ 'is-hidden': context?.hidden }"
      :title="context?.hidden ? '恢复显示' : '隐藏组件'"
      @click.stop="onToggle"
    >
      {{ context?.hidden ? "已隐藏" : "显示" }}
    </button>
    <button
      v-if="hasPreset"
      type="button"
      class="preset-btn"
      title="从行业预设中手动挑选图片/文案"
      @click.stop="onPreset"
    >
      预设
    </button>
  </span>
</template>

<script setup>
import { computed, inject } from "vue";
import { useGlobalStore } from "@/stores/global";

defineProps({
  type: {
    type: String,
    default: "",
  },
});

const globalStore = useGlobalStore();
const isAdmin = computed(() => globalStore.isAdmin);

// 由 DataExtractor 注入：当前组件节点的隐藏状态 + 切换回调
const provided = inject("fieldWidgetContext", null);
const toggleWidget = inject("toggleFieldWidget", null);
const context = computed(() => provided?.value ?? null);

// 由 DataExtractor 注入：打开预设弹窗（仅当组件有可替换素材时可用）
const openFieldPreset = inject("openFieldPreset", null);
const hasReplaceable = inject("hasReplaceableFields", false);
const hasPreset = computed(() => {
  const replaceableValue = hasReplaceable && typeof hasReplaceable === "object" && "value" in hasReplaceable
    ? hasReplaceable.value
    : hasReplaceable;
  return Boolean(openFieldPreset && replaceableValue);
});

function onToggle() {
  if (context.value?.nodeId && toggleWidget) toggleWidget(context.value.nodeId);
}

function onPreset() {
  if (openFieldPreset) openFieldPreset();
}
</script>

<style scoped>
.field-widget-extra {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hidden-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid #d3dae4;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.6;
  color: #5b6472;
  background: #ffffff;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}
.hidden-toggle-btn:hover {
  color: #2b7cee;
  border-color: rgba(43, 124, 238, 0.4);
  background: rgba(43, 124, 238, 0.05);
}
.preset-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid #c6e2ff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.6;
  color: #2b7cee;
  background: #f0f7ff;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}
.preset-btn:hover {
  color: #1b66d4;
  border-color: #2b7cee;
  background: #e3f0ff;
}

.hidden-toggle-btn.is-hidden {
  color: #b45309;
  border-color: rgba(217, 119, 6, 0.45);
  background: rgba(217, 119, 6, 0.08);
}
</style>
