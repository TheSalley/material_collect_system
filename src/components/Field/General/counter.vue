<template>
  <div class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><DataAnalysis /></el-icon>
        <span>数字变化</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <div class="__field-group mt-3">
        <label class="__field-label">结束数字</label>
        <el-input
          v-model="fields.ending_number"
          placeholder="例如：500"
          @input="onUpdate('ending_number', fields.ending_number)"
        />
      </div>
      <div class="__field-group mt-3">
        <label class="__field-label">后缀</label>
        <el-input
          v-model="fields.suffix"
          placeholder="例如：+ / % / 万"
          @input="onUpdate('suffix', fields.suffix)"
        />
      </div>
      <div class="__field-group mt-3">
        <label class="__field-label">标题</label>
        <el-input
          v-model="fields.title"
          placeholder="请输入计数器标题，例如：Enterprise in China"
          @input="onUpdate('title', fields.title)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { DataAnalysis } from "@element-plus/icons-vue";
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
