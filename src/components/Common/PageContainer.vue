<template>
  <div class="page-container">
    <!-- 页面标题区 -->
    <div class="page-header" v-if="title || $slots.header || $slots.actions">
      <slot name="header">
        <div class="page-header__main">
          <h1 class="page-title" v-if="title">
            <el-icon v-if="icon" class="page-title__icon" :size="28">
              <component :is="icon" />
            </el-icon>
            {{ title }}
          </h1>
          <p class="page-subtitle" v-if="subtitle">{{ subtitle }}</p>
        </div>
        <div class="page-header__actions" v-if="$slots.actions">
          <slot name="actions" />
        </div>
      </slot>
    </div>

    <!-- 页面内容区 -->
    <div class="page-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: [Object, String],
    default: null,
  },
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: var(--spacing-page);
  gap: var(--spacing-page);
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  flex-shrink: 0;
}

.page-header__main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
}

.page-title__icon {
  color: var(--color-primary);
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.page-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
