<template>
  <div v-if="visibleFields.length" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <DataAnalysis />
        </el-icon>
        <span>数字变化</span>
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
import { DataAnalysis } from "@element-plus/icons-vue";
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
    key: "ekit_funfact_number",
    label: "结束数字",
    type: "number",
    placeholder: "例如：100",
  },
  {
    key: "ekit_funfact_number_suffix",
    label: "后缀",
    placeholder: "例如：+ / %",
  },
  {
    key: "ekit_funfact_title_text",
    label: "标题",
    placeholder: "请输入标题",
  },
];

const visibleFields = computed(() =>
  fieldOptions.filter((field) => hasField(field.key)),
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
