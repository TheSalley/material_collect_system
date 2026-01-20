<template>
  <!-- 渲染可编辑组件 -->
  <component 
    :is="getFieldComponent(editableNode?.widgetType)"
    v-if="editableNode && getFieldComponent(editableNode?.widgetType)" 
    :node-id="editableNode.id" 
    :fields="editableNode.fields"
    :on-update="handleFieldUpdate" />

  <!-- 递归渲染子节点 -->
  <template v-if="originalNode?.elements?.length">
    <div class="child-nodes">
      <DataExtractor 
        v-for="childNode in originalNode.elements" 
        :key="childNode.id"
        :original-node="childNode"
        :editable-map="editableMap" />
    </div>
  </template>
</template>

<script setup>
import { computed } from "vue";
import DataExtractor from "@/components/DataExtractor.vue";

// 自动导入Field目录下的所有组件（包括子目录）
const modules = import.meta.glob("/src/components/Field/**/*.vue", { eager: true });

const getFieldComponent = (widgetType) => {
  if (!widgetType) return null;

  // 尝试不同的路径模式来查找组件
  const possiblePaths = [
    `/src/components/Field/${widgetType}.vue`,
    `/src/components/Field/Basic/${widgetType}.vue`,
    `/src/components/Field/General/${widgetType}.vue`,
    `/src/components/Field/Jkit/${widgetType}.vue`,
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
  // 原始节点数据（用于遍历结构）
  originalNode: {
    type: Object,
    required: true,
  },
  // 可编辑数据 Map
  editableMap: {
    type: Map,
    required: true,
  },
});

const emit = defineEmits(["update:field"]);

// 从 editableMap 中获取当前节点的可编辑数据
const editableNode = computed(() => {
  if (!props.originalNode?.id) return null;
  return props.editableMap.get(props.originalNode.id) || null;
});

/**
 * 处理字段更新
 */
const handleFieldUpdate = (fieldName, value) => {
  if (!editableNode.value) return;
  
  // 更新 editableMap 中的字段
  editableNode.value.fields[fieldName] = value;
  
  // 向上传递更新事件
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
