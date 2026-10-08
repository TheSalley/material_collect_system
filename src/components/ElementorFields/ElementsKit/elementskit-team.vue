<template>
  <div v-if="shouldShowField" class="__field-item">
    <div v-if="hasImageField" class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>团队图片</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <ImageWp
        :model-value="fields.ekit_team_image"
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
import { Document, Picture, Promotion, User } from "@element-plus/icons-vue";
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
    key: "ekit_team_name",
    label: "姓名",
    icon: User,
    type: "text",
    placeholder: "请输入姓名",
    visible: () => hasField("ekit_team_name"),
  },
  {
    key: "ekit_team_position",
    label: "职位",
    icon: Promotion,
    type: "text",
    placeholder: "请输入职位",
    visible: () => hasField("ekit_team_position"),
  },
  {
    key: "ekit_team_short_description",
    label: "简介",
    icon: Document,
    type: "textarea",
    rows: 4,
    placeholder: "请输入简介",
    visible: () =>
      hasField("ekit_team_short_description") &&
      props.fields.ekit_team_show_short_description === "yes",
  },
];

const hasImageField = computed(() => hasField("ekit_team_image"));

const visibleFields = computed(() =>
  fieldOptions.filter((field) => field.visible()),
);

const shouldShowField = computed(
  () => hasImageField.value || visibleFields.value.length > 0,
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function handleImageUpdate(imageData) {
  props.onUpdate("ekit_team_image", imageData);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
