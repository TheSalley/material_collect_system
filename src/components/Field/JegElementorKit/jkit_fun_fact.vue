<template>
  <div v-if="shouldShowField" class="__field-item">
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

      <div v-if="showIconImageField" class="__field-group">
        <label class="__field-label">
          <el-icon><Picture /></el-icon>
          <span>图标图片</span>
        </label>
        <ImageWp
          :model-value="fields.sg_icon_image"
          :node-id="nodeId"
          :show-size-config="true"
          :width="160"
          @update:model-value="handleImageUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  DataAnalysis,
  Picture,
  PriceTag,
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

const fieldOptions = [
  {
    key: "sg_content_number_prefix",
    label: "数字前缀",
    icon: PriceTag,
    type: "text",
    placeholder: "请输入数字前缀",
    visible: () => hasField("sg_content_number_prefix"),
  },
  {
    key: "sg_content_number",
    label: "数字",
    icon: DataAnalysis,
    type: "text",
    placeholder: "请输入数字",
    visible: () => hasField("sg_content_number"),
  },
  {
    key: "sg_content_number_suffix",
    label: "数字后缀",
    icon: PriceTag,
    type: "text",
    placeholder: "请输入数字后缀",
    visible: () => hasField("sg_content_number_suffix"),
  },
  {
    key: "sg_content_title",
    label: "标题文本",
    icon: Promotion,
    type: "text",
    placeholder: "请输入标题文本",
    visible: () => hasField("sg_content_title"),
  },
  {
    key: "sg_icon_type",
    label: "图标类型",
    icon: Promotion,
    type: "text",
    placeholder: "请输入图标类型",
    visible: () => hasField("sg_icon_type"),
  },
];

const visibleFields = computed(() =>
  fieldOptions.filter((field) => field.visible()),
);

const showIconImageField = computed(
  () =>
    hasField("sg_icon_image") &&
    props.fields.sg_icon_type === "image",
);

const shouldShowField = computed(
  () => visibleFields.value.length > 0 || showIconImageField.value,
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function handleImageUpdate(imageData) {
  props.onUpdate("sg_icon_image", imageData);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
