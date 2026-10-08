<template>
  <div class="stat-card" :style="{ '--stat-accent': accent }">
    <div class="stat-card__head">
      <span class="stat-card__label">{{ label }}</span>
      <div class="stat-card__actions" v-if="$slots.actions || icon">
        <slot name="actions" />
        <el-icon v-if="icon" class="stat-card__icon" :size="18">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
    <strong class="stat-card__value">{{ value }}</strong>
    <p class="stat-card__hint" v-if="hint">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  hint: {
    type: String,
    default: "",
  },
  accent: {
    type: String,
    default: "var(--color-primary)",
  },
  icon: {
    type: [Object, String],
    default: null,
  },
});
</script>

<style scoped>
.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: var(--stat-accent);
}

.stat-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stat-card__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.stat-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.stat-card__icon {
  color: var(--stat-accent);
  flex-shrink: 0;
}

.stat-card__value {
  display: block;
  margin-top: 14px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-text-primary);
}

.stat-card__hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>
