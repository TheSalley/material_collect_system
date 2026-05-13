<template>
  <div v-if="shouldShowField" class="__field-item space-y-3">
    <div v-if="hasImageField" class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>图片</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <ImageWp
        :model-value="fields.testimonial_image"
        :node-id="nodeId"
        :show-size-config="true"
        :width="120"
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
        @update:model-value="(value) => handleTextUpdate(field.key, value)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ChatLineRound, Picture, Postcard, User } from "@element-plus/icons-vue";
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
    key: "testimonial_content",
    label: "推荐内容",
    icon: ChatLineRound,
    type: "textarea",
    rows: 4,
    placeholder: "请输入推荐内容",
  },
  {
    key: "testimonial_name",
    label: "推荐人姓名",
    icon: User,
    type: "text",
    rows: undefined,
    placeholder: "请输入姓名",
  },
  {
    key: "testimonial_job",
    label: "推荐人职位",
    icon: Postcard,
    type: "text",
    rows: undefined,
    placeholder: "请输入职位",
  },
];

const hasImageField = computed(() => hasField("testimonial_image"));

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
  props.onUpdate("testimonial_image", imageData);
}

function handleTextUpdate(key, value) {
  props.onUpdate(key, value);
}
</script>
