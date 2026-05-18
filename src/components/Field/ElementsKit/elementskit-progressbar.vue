<template>
  <div v-if="visibleFields.length" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <DataLine />
        </el-icon>
        <span>进度条</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <div
        v-for="field in visibleFields"
        :key="field.key"
        class="__field-group"
      >
        <label class="__field-label">{{ field.label }}</label>
        <el-input
          :model-value="fields[field.key]"
          :type="field.type"
          :placeholder="field.placeholder"
          @update:model-value="(value) => updateField(field.key, value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { DataLine } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";

const props = defineProps({
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
    key: "ekit_progressbar_title",
    label: "标题",
    placeholder: "请输入标题",
  },
  {
    key: "ekit_progressbar_percent",
    label: "百分比",
    type: "number",
    placeholder: "请输入百分比",
    visible: () => props.fields.ekit_progressbar_percentage_show !== "none",
  },
];

const visibleFields = computed(() =>
  fieldOptions.filter(
    (field) => hasFieldContent(field.key) && (field.visible?.() ?? true),
  ),
);

function hasFieldContent(key) {
  const value = props.fields[key];
  return value !== undefined && value !== null && value !== "";
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
