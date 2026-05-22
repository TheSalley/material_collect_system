<template>
  <div v-if="visibleFields.length" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><DataAnalysis /></el-icon>
        <span>数字统计</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <div
        v-for="field in visibleFields"
        :key="field.key"
        class="__field-group"
      >
        <label class="__field-label">
          <el-icon><component :is="field.icon" /></el-icon>
          <span>{{ field.label }}</span>
        </label>
        <el-input
          :model-value="fields[field.key]"
          :type="field.type"
          :rows="field.rows"
          :placeholder="field.placeholder"
          show-word-limit
          @update:model-value="(value) => updateField(field.key, value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  DataAnalysis,
  Document,
  PriceTag,
  Promotion,
} from "@element-plus/icons-vue";
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

const fieldOptions = [
  {
    key: "premium_counter_end_value",
    label: "结束数字",
    icon: DataAnalysis,
    type: "number",
    placeholder: "例如：100",
    visible: () => hasMeaningfulValue("premium_counter_end_value"),
  },
  {
    key: "premium_counter_suffix",
    label: "后缀",
    icon: PriceTag,
    type: "text",
    placeholder: "请输入后缀",
    visible: () => hasMeaningfulValue("premium_counter_suffix"),
  },
  {
    key: "premium_counter_title",
    label: "标题",
    icon: Promotion,
    type: "text",
    placeholder: "请输入标题",
    visible: () => hasMeaningfulValue("premium_counter_title"),
  },
  {
    key: "premium_counter_desc",
    label: "描述",
    icon: Document,
    type: "textarea",
    rows: 4,
    placeholder: "请输入描述",
    visible: () => hasMeaningfulValue("premium_counter_desc"),
  },
];

const visibleFields = computed(() =>
  fieldOptions.filter((field) => field.visible()),
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function hasMeaningfulValue(key) {
  if (!hasField(key)) return false;

  const value = props.fields?.[key];
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && value !== "";
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
