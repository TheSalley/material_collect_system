<template>
  <div v-if="visibleFields.length" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>标题</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <div
        v-for="field in visibleFields"
        :key="field.key"
        class="__field-group"
      >
        <label class="__field-label">
          <el-icon>
            <component :is="field.icon" />
          </el-icon>
          <span>{{ field.label }}</span><span v-if="field.key === 'ekit_heading_title'">(花括号内为高亮字)</span>
        </label>
        <QuillEditor
          v-if="field.key === 'ekit_heading_extra_title'"
          :model-value="fields[field.key]"
          :placeholder="field.placeholder"
          @update:model-value="(value) => updateField(field.key, value)"
        />
        <el-input
          v-else
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
  CollectionTag,
  Discount,
  Promotion,
} from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import QuillEditor from "@/components/QuillEditor.vue";

const props = defineProps({
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
    key: "ekit_heading_title",
    label: "主标题",
    icon: Promotion,
    placeholder: "请输入主标题",
    visible: () => hasField("ekit_heading_title"),
  },
  {
    key: "ekit_heading_sub_title",
    label: "副标题",
    icon: ChatDotSquare,
    placeholder: "请输入副标题",
    visible: () =>
      hasField("ekit_heading_sub_title") &&
      props.fields.ekit_heading_sub_title_show === "yes",
  },
  {
    key: "ekit_heading_extra_title",
    label: "额外标题",
    icon: CollectionTag,
    placeholder: "请输入额外标题",
    visible: () =>
      hasField("ekit_heading_extra_title") &&
      props.fields.ekit_heading_section_extra_title_show === "yes",
  },
  {
    key: "shadow_text_content",
    label: "阴影文字",
    icon: Discount,
    placeholder: "请输入阴影文字",
    visible: () =>
      hasField("shadow_text_content") &&
      props.fields.show_shadow_text === "yes",
  },
];

const visibleFields = computed(() =>
  fieldOptions.filter((field) => field.visible()),
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
