<template>
  <div v-if="shouldShowField" class="__field-item">
    <div v-if="hasImageField" class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>图片盒子</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <ImageWp
        :model-value="fields.sg_image_choose"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="handleImageUpdate"
      />
    </div>

    <div
      v-for="field in visibleTextFields"
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
</template>

<script setup>
import { computed } from "vue";
import {
  Document,
  Link,
  Picture,
  Promotion,
} from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import ImageWp from "@/components/Common/imageWp.vue";

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

const textFields = [
  {
    key: "sg_body_title",
    label: "标题",
    icon: Promotion,
    type: "text",
    placeholder: "请输入标题",
    visible: () => hasField("sg_body_title"),
  },
  {
    key: "sg_body_description",
    label: "描述",
    icon: Document,
    type: "textarea",
    rows: 3,
    placeholder: "请输入描述",
    visible: () => hasField("sg_body_description"),
  },
  {
    key: "sg_button_label",
    label: "按钮文本",
    icon: Link,
    type: "text",
    placeholder: "请输入按钮文本",
    visible: () =>
      hasField("sg_button_label") &&
      props.fields.sg_button_enable === "yes",
  },
];

const hasImageField = computed(() => hasField("sg_image_choose"));

const visibleTextFields = computed(() =>
  textFields.filter((field) => field.visible()),
);

const shouldShowField = computed(
  () => hasImageField.value || visibleTextFields.value.length > 0,
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function handleImageUpdate(imageData) {
  props.onUpdate("sg_image_choose", imageData);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
