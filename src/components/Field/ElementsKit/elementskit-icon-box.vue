<template>
  <div v-if="shouldShowField" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>图标盒子</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <div v-if="showHeaderImage" class="__field-group">
        <label class="__field-label">
          <el-icon>
            <Picture />
          </el-icon>
          <span>头部图片</span>
        </label>
        <ImageWp
          :model-value="fields.ekit_icon_box_header_image"
          :node-id="nodeId"
          :show-size-config="true"
          :width="160"
          @update:model-value="
            (value) => updateField('ekit_icon_box_header_image', value)
          "
        />
      </div>

      <div
        v-for="field in visibleTextFields"
        :key="field.key"
        class="__field-group"
      >
        <label class="__field-label">
          <el-icon>
            <component :is="field.icon" />
          </el-icon>
          <span>{{ field.label }}</span>
        </label>
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
import {
  ChatDotSquare,
  Document,
  Link,
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

const textFieldOptions = [
  {
    key: "ekit_icon_box_title_text",
    label: "标题",
    icon: ChatDotSquare,
    placeholder: "请输入标题",
  },
  {
    key: "ekit_icon_box_description_text",
    label: "描述",
    icon: Document,
    type: "textarea",
    rows: 3,
    placeholder: "请输入描述",
  },
  {
    key: "ekit_icon_box_btn_text",
    label: "按钮文本",
    icon: Link,
    placeholder: "请输入按钮文本",
  },
  {
    key: "ekit_icon_box_badge_title",
    label: "徽章文本",
    icon: PriceTag,
    placeholder: "请输入徽章文本",
  },
];

const visibleTextFields = computed(() =>
  textFieldOptions.filter((field) => shouldShowTextField(field)),
);

const showHeaderImage = computed(() => {
  if (!hasObjectField("ekit_icon_box_header_image")) return false;
  return props.fields.ekit_icon_box_enable_header_icon === "image";
});

const isButtonEnabled = computed(
  () => props.fields.ekit_icon_box_enable_btn === "yes",
);

const isBadgeEnabled = computed(
  () => props.fields.ekit_icon_box_badge_control === "yes",
);

const shouldShowField = computed(
  () => showHeaderImage.value || visibleTextFields.value.length > 0,
);

function hasFieldContent(key) {
  const value = props.fields[key];
  return value !== undefined && value !== null && value !== "";
}

function hasObjectField(key) {
  const value = props.fields[key];
  return value && typeof value === "object" && !Array.isArray(value);
}

function shouldShowTextField(field) {
  if (field.key === "ekit_icon_box_btn_text") {
    return isButtonEnabled.value && hasFieldContent(field.key);
  }

  if (field.key === "ekit_icon_box_badge_title") {
    return isBadgeEnabled.value && hasFieldContent(field.key);
  }

  return hasFieldContent(field.key);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
