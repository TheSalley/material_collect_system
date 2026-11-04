<template>
  <PageContainer
    title="客户基础信息"
    subtitle="品牌和联系人，一次说清。"
    :icon="Postcard"
  >
    <CustomerInfoPanel />
  </PageContainer>
</template>

<script setup>
import { Postcard } from "@element-plus/icons-vue";
import PageContainer from "@/components/common/PageContainer.vue";
import CustomerInfoPanel from "@/components/CustomerInfoPanel.vue";
</script>
