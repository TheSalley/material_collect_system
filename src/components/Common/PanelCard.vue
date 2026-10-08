<template>
  <div class="panel-card" :class="{ 'panel-card--flush': flush }">
    <!-- 头部 -->
    <div class="panel-card__header" v-if="title || $slots.header || $slots.actions">
      <slot name="header">
        <h3 class="panel-card__title" v-if="title">{{ title }}</h3>
        <div class="panel-card__actions" v-if="$slots.actions">
          <slot name="actions" />
        </div>
      </slot>
    </div>

    <!-- 内容区 -->
    <div class="panel-card__body" :class="{ 'panel-card__body--flush': flush }">
      <slot />
    </div>

    <!-- 底部 -->
    <div class="panel-card__footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
  flush: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.panel-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.panel-card:hover {
  box-shadow: var(--shadow-card-hover);
}

.panel-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-surface-hover);
  flex-shrink: 0;
}

.panel-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.panel-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-card__body {
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow: auto;
}

.panel-card__body--flush {
  padding: 0;
}

.panel-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border-light);
  background: var(--color-surface-hover);
  flex-shrink: 0;
}
</style>
