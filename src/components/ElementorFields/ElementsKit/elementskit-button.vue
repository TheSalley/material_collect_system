<template>
  <div v-if="shouldShowField" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Link />
        </el-icon>
        <span>按钮</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <div
        v-for="field in visibleTextFields"
        :key="field.key"
        class="__field-group"
      >
        <label class="__field-label">{{ field.label }}</label>
        <el-input
          :model-value="fields[field.key]"
          :placeholder="field.placeholder"
          @update:model-value="(value) => updateField(field.key, value)"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Link } from "@element-plus/icons-vue";
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

const textFieldOptions = [
  {
    key: "ekit_btn_text",
    label: "按钮文本",
    placeholder: "请输入按钮文本",
  },
];

const visibleTextFields = computed(() =>
  textFieldOptions.filter((field) => hasField(field.key)),
);

const shouldShowField = computed(() => visibleTextFields.value.length > 0);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
