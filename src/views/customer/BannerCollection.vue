<template>
  <PageContainer
    title="Banner 收集"
    subtitle="上传主视觉，顺手补上文案。"
    :icon="PictureFilled"
  >
    <BannerCollectionPanel />
  </PageContainer>
</template>

<script setup>
import { PictureFilled } from "@element-plus/icons-vue";
import PageContainer from "@/components/common/PageContainer.vue";
import BannerCollectionPanel from "@/components/BannerCollectionPanel.vue";
</script>
