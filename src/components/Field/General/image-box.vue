<template>
  <div v-if="shouldShowField" class="__field-item">
    <div v-if="hasImageField" class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>图文</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <ImageWp
        :model-value="fields.image"
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
        show-word-limit
        type="textarea"
        @update:model-value="handleTextUpdate(field.key, $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Document, Picture, Promotion } from "@element-plus/icons-vue";
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
    key: "title_text",
    label: "标题",
    icon: Promotion,
    rows: 2,
    placeholder: "请输入图片盒子标题",
  },
  {
    key: "description_text",
    label: "描述",
    icon: Document,
    rows: 3,
    placeholder: "请输入图片盒子描述",
  },
];

const hasImageField = computed(() => hasField("image"));

const visibleTextFields = computed(() =>
  textFields.filter(({ key }) => hasFieldContent(key))
);

const shouldShowField = computed(
  () => hasImageField.value || visibleTextFields.value.length > 0
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function hasFieldContent(key) {
  const value = props.fields[key];
  return hasField(key) && value !== null && value !== undefined && value !== "";
}

function handleImageUpdate(imageData) {
  props.onUpdate("image", imageData);
}

function handleTextUpdate(key, value) {
  props.onUpdate(key, value);
}
</script>
