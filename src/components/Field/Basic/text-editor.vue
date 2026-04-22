<template>
  <div class="__field-item" v-if="fields.editor !== ''">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>文案</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <QuillEditor :node-id="nodeId" v-model="editorContent" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Promotion } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import QuillEditor from "@/components/QuillEditor.vue";

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

const editorContent = computed({
  get: () => props.fields.editor || "",
  set: (val) => {
    props.fields.editor = val;
    props.onUpdate("editor", val);
  },
});
</script>
