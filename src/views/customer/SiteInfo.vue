<script setup>
import { InfoFilled } from "@element-plus/icons-vue";
import SiteInfoPanel from "@/components/SiteInfoPanel.vue";
import PageContainer from "@/components/common/PageContainer.vue";
</script>

<template>
  <PageContainer title="网站信息" subtitle="管理和查看网站基本信息" :icon="InfoFilled">
    <SiteInfoPanel />
  </PageContainer>
</template>
