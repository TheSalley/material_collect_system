<template>
  <div v-if="shouldShowField" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><Promotion /></el-icon>
        <span>图标框</span>
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
import { Link, Picture, PriceTag, Promotion } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import ImageWp from "@/components/Common/ImageWp.vue";

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
    key: "sg_icon_text",
    label: "标题",
    icon: Promotion,
    type: "text",
    placeholder: "请输入标题",
    visible: () => hasField("sg_icon_text"),
  },
  {
    key: "sg_icon_description",
    label: "描述",
    icon: Promotion,
    type: "textarea",
    rows: 3,
    placeholder: "请输入描述",
    visible: () => hasField("sg_icon_description"),
  },
  {
    key: "sg_icon_type",
    label: "图标类型",
    icon: Promotion,
    type: "text",
    placeholder: "请输入图标类型",
    visible: () => hasField("sg_icon_type"),
  },
  {
    key: "sg_readmore_button_label",
    label: "按钮文本",
    icon: Link,
    type: "text",
    placeholder: "请输入按钮文本",
    visible: () =>
      hasField("sg_readmore_button_label") &&
      props.fields.sg_readmore_enable_button === "yes",
  },
  {
    key: "sg_badge_text",
    label: "徽章文本",
    icon: PriceTag,
    type: "text",
    placeholder: "请输入徽章文本",
    visible: () =>
      hasField("sg_badge_text") &&
      props.fields.sg_badge_show === "yes",
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
