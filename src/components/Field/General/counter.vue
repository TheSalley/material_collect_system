<template>
  <div class="counter-field">
    <div class="counter-header">
      <span class="field-label">数字变化：</span>
    </div>

    <div class="counter-body">
      <el-form label-position="top" class="counter-form">
        <el-form-item label="标题">
          <el-input
            v-model="fields.title"
            placeholder="请输入计数器标题，例如：Enterprise in China"
            @input="onUpdate('title', fields.title)"
          />
        </el-form-item>

        <el-form-item label="结束数字">
          <el-input
            v-model="fields.ending_number"
            placeholder="请输入目标数字，例如：500"
            @input="onUpdate('ending_number', fields.ending_number)"
          />
        </el-form-item>

        <el-form-item label="后缀">
          <el-input
            v-model="fields.suffix"
            placeholder="例如：+ / % / 万"
            @input="onUpdate('suffix', fields.suffix)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
    nodeId: {
        type: String,
        required: true
    },
    fields: {
        type: Object,
        required: true
    },
    onUpdate: {
        type: Function,
        required: true
    }
});
</script>

<style scoped>
.counter-field {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 16px 18px 12px;
  background: #f9fafb;
}

.counter-header {
  margin-bottom: 8px;
}

.field-label {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

.counter-body {
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 14px 4px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.counter-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.counter-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-size: 12px;
  color: #6b7280;
}

.counter-form :deep(.el-input__inner),
.counter-form :deep(.el-textarea__inner) {
  border-radius: 8px;
}
</style>