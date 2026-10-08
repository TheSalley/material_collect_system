<template>
  <div v-if="visibleFields.length" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>图标盒子</span>
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
          :rows="field.rows"
          :placeholder="field.placeholder"
          @update:model-value="(value) => updateField(field.key, value)"
        />
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

const fieldOptions = [
  {
    key: "title_text",
    label: "标题",
    placeholder: "请输入标题",
  },
  {
    key: "description_text",
    label: "描述",
    type: "textarea",
    rows: 2,
    placeholder: "请输入描述",
  },
];

const visibleFields = computed(() =>
  fieldOptions.filter((field) => hasField(field.key))
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
