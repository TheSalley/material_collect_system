<template>
  <div class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>高亮标题</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <div class="flex gap-3">
        <div class="flex items-center gap-2">
          <span>前缀文本：</span>
          <el-input
            v-model="fields.before_text"
            placeholder="请输入前缀文本"
            @input="onUpdate('before_text', fields.before_text)"
          />
        </div>
        <div class="flex items-center gap-2">
          <span>高亮文本：</span>
          <el-input
            v-model="fields.highlighted_text"
            placeholder="请输入高亮文本"
            @input="onUpdate('highlighted_text', fields.highlighted_text)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Promotion } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";

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
</script>
