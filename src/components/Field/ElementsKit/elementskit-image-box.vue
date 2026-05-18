<template>
  <div v-if="shouldShowField" class="__field-item">
    <div v-if="hasImageField" class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>图文</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <ImageWp
        :model-value="fields.ekit_image_box_image"
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
        :placeholder="field.placeholder"
        :rows="field.rows"
        :type="field.type"
        show-word-limit
        @update:model-value="handleTextUpdate(field.key, $event)"
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
    key: "ekit_image_box_title_text",
    label: "标题",
    icon: Promotion,
    type: "textarea",
    rows: 2,
    placeholder: "请输入标题",
    visible: () => hasField("ekit_image_box_title_text"),
  },
  {
    key: "ekit_image_box_description_text",
    label: "描述",
    icon: Document,
    type: "textarea",
    rows: 3,
    placeholder: "请输入描述",
    visible: () => hasField("ekit_image_box_description_text"),
  },
  {
    key: "ekit_image_box_btn_text",
    label: "按钮文本",
    icon: Link,
    type: "text",
    placeholder: "请输入按钮文本",
    visible: () =>
      hasField("ekit_image_box_btn_text") &&
      props.fields.ekit_image_box_enable_btn !== "",
  },
];

const hasImageField = computed(() => hasField("ekit_image_box_image"));

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
  props.onUpdate("ekit_image_box_image", imageData);
}

function handleTextUpdate(key, value) {
  props.onUpdate(key, value);
}
</script>
