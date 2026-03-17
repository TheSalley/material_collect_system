<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <ProductListPanel />
  </div>
</template>

<script setup>
import ProductListPanel from "@/components/ProductListPanel.vue";
</script>

<style scoped>
/* 表格样式优化 */
:deep(.el-table__header) {
  background: #f9fafb;
}

:deep(.el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background: #f0f9ff;
}

:deep(.el-table__row:hover td) {
  background: #f0f9ff;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

/* 暗色模式表格 */
@media (prefers-color-scheme: dark) {
  :deep(.el-table__header) {
    background: #4b5563;
  }
  
  :deep(.el-table__header th) {
    background: #4b5563;
    color: #f9fafb;
    border-bottom-color: #6b7280;
  }
}
</style>
