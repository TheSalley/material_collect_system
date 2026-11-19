<template>
  <PageContainer
    title="客户基础信息"
    subtitle="填完提交，我们照这份资料建站"
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
