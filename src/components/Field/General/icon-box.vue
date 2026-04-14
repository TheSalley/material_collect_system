<template>
  <div class="__field-item">
    <FieldWidgetType :type="widgetType" />
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>标题</span>
      </label>
      <el-input
        v-model="fields.title_text"
        @input="onUpdate('title_text', fields.title_text)"
        placeholder="请输入标题"
      />
    </div>
    <div class="__field-group">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>描述</span>
      </label>
      <el-input
        v-model="fields.description_text"
        :rows="2"
        type="textarea"
        @input="onUpdate('description_text', fields.description_text)"
        placeholder="请输入描述"
      />
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

<style scoped>
</style>
