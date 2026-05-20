<template>
  <div v-if="shouldShowField" class="__field-item">
    <div v-if="hasImageField" class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>成员图片</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <ImageWp
        :model-value="fields.sg_member_image"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="handleImageUpdate"
      />
    </div>

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
</template>

<script setup>
import { computed } from "vue";
import { Document, Picture, User } from "@element-plus/icons-vue";
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
    key: "sg_member_name",
    label: "成员名称",
    icon: User,
    type: "text",
    placeholder: "请输入成员名称",
    visible: () => hasMeaningfulValue("sg_member_name"),
  },
  {
    key: "sg_member_description",
    label: "成员描述",
    icon: Document,
    type: "textarea",
    rows: 4,
    placeholder: "请输入成员描述",
    visible: () =>
      hasMeaningfulValue("sg_member_description") &&
      props.fields.sg_member_show_description === "yes",
  },
];

const hasImageField = computed(() => hasMeaningfulImage(props.fields?.sg_member_image));

const visibleFields = computed(() =>
  fieldOptions.filter((field) => field.visible()),
);

const shouldShowField = computed(
  () => hasImageField.value || visibleFields.value.length > 0,
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

function hasMeaningfulImage(value) {
  if (!value) return false;

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const urlCandidates = [
      value.url,
      value.src,
      value.path,
      value.link,
      value.thumb,
      value.image?.url,
      value.sizes?.full?.url,
      value.sizes?.large?.url,
      value.sizes?.medium?.url,
    ];

    if (
      urlCandidates.some(
        (candidate) =>
          typeof candidate === "string" && candidate.trim().length > 0
      )
    ) {
      return true;
    }

    const id = value.id;
    if (id === undefined || id === null) return false;

    const normalizedId = String(id).trim();
    return normalizedId !== "" && normalizedId !== "0";
  }

  return false;
}

function handleImageUpdate(imageData) {
  props.onUpdate("sg_member_image", imageData);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
