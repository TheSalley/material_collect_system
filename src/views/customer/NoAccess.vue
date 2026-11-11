<template>
  <PageContainer
    title="先等等"
    subtitle="管理员还没给你开权限。"
  >
    <div class="no-access">
      <div class="no-access__mark" aria-hidden="true">
        <el-icon :size="30"><Lock /></el-icon>
      </div>
      <p class="no-access__lead">这个账号暂时没有可用页面。</p>
      <p class="no-access__hint">找管理员开一下，马上就好。</p>
    </div>
  </PageContainer>
</template>

<script setup>
import { Lock } from "@element-plus/icons-vue";
import PageContainer from "@/components/common/PageContainer.vue";
</script>

<style scoped>
.no-access {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 460px;
  margin-top: 8px;
  padding: 28px 26px 30px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background-color: #fdfefe;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E"),
    linear-gradient(125deg, #ffffff 0%, #f4f8fc 58%, #eef4fb 100%);
}
.no-access__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin-bottom: 6px;
  border-radius: 16px;
  color: #2b7cee;
  background: linear-gradient(145deg, rgba(43, 124, 238, 0.16), rgba(43, 124, 238, 0.04));
}
.no-access__lead {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
}
.no-access__hint {
  margin: 0;
  font-size: 13.5px;
  color: #6b7280;
}
</style>
