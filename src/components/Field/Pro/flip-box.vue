<template>
  <div v-if="visibleSections.length" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>翻转卡片</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <div
        v-for="section in visibleSections"
        :key="section.title"
        class="flip-section"
      >
        <div class="flip-section-title">{{ section.title }}</div>

        <div
          v-for="field in section.fields"
          :key="field.key"
          class="__field-group"
        >
          <label class="__field-label">{{ field.label }}</label>
          <el-input
            :model-value="fields[field.key] || ''"
            :type="field.type"
            :rows="field.rows"
            :placeholder="field.placeholder"
            @update:model-value="(value) => updateField(field.key, value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Promotion } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
  },
  widgetType: {
    type: String,
    required: true,
  },
  fields: {
    type: Object,
    required: true,
  },
  onUpdate: {
    type: Function,
    required: true,
  },
});

const sections = [
  {
    title: "正面内容",
    fields: [
      {
        key: "title_text_a",
        label: "编号 / 小标题",
        placeholder: "例如：1.",
      },
      {
        key: "description_text_a",
        label: "主标题 / 描述",
        type: "textarea",
        rows: 2,
        placeholder: "例如：Recycling Networks",
      },
    ],
  },
  {
    title: "背面内容",
    fields: [
      {
        key: "title_text_b",
        label: "标题",
        placeholder: "例如：1. Recycling Networks",
      },
      {
        key: "description_text_b",
        label: "详细描述",
        type: "textarea",
        rows: 2,
        placeholder: "请输入详细描述",
      },
      {
        key: "button_text",
        label: "按钮文本",
        placeholder: "例如：Learn more",
      },
    ],
  },
];

const visibleSections = computed(() =>
  sections
    .map((section) => ({
      ...section,
      fields: section.fields.filter((field) => hasFieldContent(field.key)),
    }))
    .filter((section) => section.fields.length)
);

function hasFieldContent(key) {
  const value = props.fields[key];
  return value !== undefined && value !== null && value !== "";
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>

<style scoped>
.flip-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
}

.flip-section + .flip-section {
  border-top: 1px dashed #e4e7ed;
}

.flip-section-title {
  color: #909399;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
