<template>
  <div v-if="shouldShowField" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>行动号召</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <div v-if="hasBgImageField" class="__field-group cta-section">
        <label class="__field-label">背景图</label>
        <ImageWp
          :model-value="fields.bg_image"
          :node-id="nodeId"
          :show-size-config="true"
          @update:model-value="handleBgImageUpdate"
        />
      </div>

      <div
        v-for="field in visibleTextFields"
        :key="field.key"
        class="__field-group cta-section"
      >
        <label class="__field-label">{{ field.label }}</label>
        <el-input
          :model-value="fields[field.key]"
          :type="field.type"
          :rows="field.rows"
          :maxlength="field.maxlength"
          :show-word-limit="field.showWordLimit"
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
    key: "title",
    label: "标题",
    maxlength: 100,
    showWordLimit: true,
  },
  {
    key: "description",
    label: "描述",
    type: "textarea",
    rows: 2,
    maxlength: 2000,
    showWordLimit: true,
  },
  {
    key: "button",
    label: "按钮文案",
    maxlength: 50,
    showWordLimit: true,
  },
];

const hasBgImageField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "bg_image")
);

const visibleTextFields = computed(() =>
  textFields.filter((field) => hasField(field.key))
);

const shouldShowField = computed(
  () => hasBgImageField.value || visibleTextFields.value.length > 0
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}

function handleBgImageUpdate(nextImage) {
  const current = props.fields.bg_image;
  const base =
    current != null && typeof current === "object" && !Array.isArray(current)
      ? { ...current }
      : {};

  props.onUpdate("bg_image", {
    ...base,
    url: base.url ?? "",
    id: base.id ?? "",
    size: base.size ?? "",
    alt: base.alt ?? "",
    source: base.source || "library",
    ...nextImage,
  });
}
</script>

<style scoped>
.cta-section {
  padding-top: 0.75rem;
}

.cta-section + .cta-section {
  border-top: 1px dashed #e4e7ed;
}
</style>
