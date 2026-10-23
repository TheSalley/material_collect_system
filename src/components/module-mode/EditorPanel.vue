<template>
  <div class="editor-section">
    <div v-if="state?.moduleId && state?.editableMap" :ref="editorScrollRef" class="editor-scroll pretty-scroll">
      <el-collapse v-model="activeCollapseName" accordion class="module-parts-collapse">
        <el-collapse-item
          v-for="(part, index) in visibleParts"
          :key="part.id"
          :name="`part-${index}`"
          class="module-section-card"
          :class="{ 'is-active-part': activePartIndex === index, 'is-hidden-part': isPartHidden(part) }"
        >
          <template #title>
            <div class="collapse-title">
              <el-icon class="collapse-icon">
                <Grid />
              </el-icon>
              <span class="collapse-text">
                板块 {{ index + 1
                }}<template v-if="part?.settings?._title"> — {{ part.settings._title }}</template>
              </span>
              <el-tag size="small" type="info">{{ part.elType || "section" }}</el-tag>
              <button
                type="button"
                class="hidden-toggle-btn"
                :class="{ 'is-hidden': isPartHidden(part) }"
                :title="isPartHidden(part) ? '恢复显示' : '隐藏板块'"
                @click.stop="emit('toggle-hidden', part.id)"
              >
                {{ isPartHidden(part) ? "已隐藏" : "显示" }}
              </button>
            </div>
          </template>
          <div class="collapse-content">
            <DataExtractor
              v-if="part?.id"
              :original-node="part"
              :editable-map="state.editableMap"
              @update:field="(nodeId, fieldName, value) => $emit('field-update', nodeId, fieldName, value)"
              @toggle-hidden="$emit('toggle-hidden', $event)"
              @apply-preset-node="(e) => emit('apply-preset-node', e)"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div v-else class="editor-scroll pretty-scroll empty-state-wrap">
      <div class="empty-state">
        <el-empty description="非Elementor页面" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { provide } from "vue";
import { Grid } from "@element-plus/icons-vue";
import DataExtractor from "@/components/DataExtractor.vue";
import { isPartHidden } from "@/utils/moduleModeUtils.js";

const activeCollapseName = defineModel("activeCollapseName", { type: String, default: "" });

const props = defineProps({
  visibleParts: {
    type: Array,
    required: true,
  },
  activePartIndex: {
    type: Number,
    default: -1,
  },
  state: {
    type: Object,
    default: null,
  },
  editorScrollRef: {
    type: Object,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["field-update", "toggle-hidden", "apply-preset-node"]);

// 透传管理员身份给字段组件（DataExtractor），用于显示「用预设替换」按钮
provide("fieldPresetAdmin", props.isAdmin);
</script>

<style scoped>
.editor-section {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.empty-state-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #303133;
  padding: 0.25rem 0;
}

.collapse-icon {
  color: #409eff;
  font-size: 1.25rem;
}

.collapse-text {
  font-size: 1rem;
}

.hidden-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid #d3dae4;
  font-size: 0.75rem;
  font-weight: 500;
  color: #5b6472;
  background: #ffffff;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}
.hidden-toggle-btn:hover {
  color: #2b7cee;
  border-color: rgba(43, 124, 238, 0.4);
  background: rgba(43, 124, 238, 0.05);
}
.hidden-toggle-btn.is-hidden {
  color: #b45309;
  border-color: rgba(217, 119, 6, 0.45);
  background: rgba(217, 119, 6, 0.08);
}

/* 隐藏板块：标题行淡显提示 */
.module-section-card.is-hidden-part :deep(.el-collapse-item__header) {
  opacity: 0.62;
  filter: saturate(0.85);
}

.collapse-content {
  padding: 1rem;
  background: #fafbfc;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 4rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 100%;
}

/* 右侧：单一手风琴 + 卡片外观 */
:deep(.module-parts-collapse) {
  border: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:deep(.module-parts-collapse > .module-section-card.el-collapse-item) {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
}

:deep(.module-parts-collapse > .module-section-card.is-active-part) {
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.18);
}

:deep(.module-parts-collapse .el-collapse-item__header) {
  padding: 0.75rem 1rem;
  background: white;
  border: none;
  font-weight: 500;
  height: auto;
  line-height: 1.5;
  transition: background 0.2s ease;
}

:deep(.module-parts-collapse > .module-section-card.is-active-part .el-collapse-item__header) {
  background: linear-gradient(90deg, rgba(236, 245, 255, 0.95) 0%, #fff 50%);
  box-shadow: inset 4px 0 0 #409eff;
}

:deep(.module-parts-collapse .el-collapse-item__wrap) {
  border: none;
  background: #fafbfc;
}

:deep(.module-parts-collapse .el-collapse-item__content) {
  padding: 0;
}
</style>
