<template>
  <PageContainer title="产品列表" subtitle="管理和查看所有产品信息">
    <ProductListPanel />
  </PageContainer>
</template>

<script setup>
import PageContainer from "@/components/common/PageContainer.vue";
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
</style>
