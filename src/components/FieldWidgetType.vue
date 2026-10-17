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

function onToggle() {
  if (context.value?.nodeId && toggleWidget) toggleWidget(context.value.nodeId);
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
.hidden-toggle-btn.is-hidden {
  color: #b45309;
  border-color: rgba(217, 119, 6, 0.45);
  background: rgba(217, 119, 6, 0.08);
}
</style>
