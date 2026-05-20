<template>
  <div v-if="visibleFields.length" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><Promotion /></el-icon>
        <span>标题</span>
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
  ChatDotSquare,
  Discount,
  Document,
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
    key: "sg_title_before",
    label: "前置标题",
    icon: Promotion,
    type: "text",
    placeholder: "请输入前置标题",
    visible: () => hasMeaningfulValue("sg_title_before"),
  },
  {
    key: "sg_title_focused",
    label: "高亮标题",
    icon: Discount,
    type: "text",
    placeholder: "请输入高亮标题",
    visible: () => hasMeaningfulValue("sg_title_focused"),
  },
  {
    key: "sg_title_after",
    label: "后置标题",
    icon: Promotion,
    type: "text",
    placeholder: "请输入后置标题",
    visible: () => hasMeaningfulValue("sg_title_after"),
  },
  {
    key: "sg_subtitle_heading",
    label: "副标题",
    icon: ChatDotSquare,
    type: "text",
    placeholder: "请输入副标题",
    visible: () =>
      hasMeaningfulValue("sg_subtitle_heading") &&
      props.fields.sg_subtitle_enable === "yes",
  },
  {
    key: "sg_description",
    label: "描述",
    icon: Document,
    type: "textarea",
    rows: 4,
    placeholder: "请输入描述",
    visible: () =>
      hasMeaningfulValue("sg_description") &&
      props.fields.sg_description_enable === "yes",
  },
  {
    key: "sg_shadow_content",
    label: "阴影文字",
    icon: Discount,
    type: "text",
    placeholder: "请输入阴影文字",
    visible: () =>
      hasMeaningfulValue("sg_shadow_content") &&
      props.fields.sg_shadow_enable === "yes",
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
