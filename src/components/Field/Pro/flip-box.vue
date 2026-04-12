<template>
  <div class="flip-box-field">
    <div class="flip-box-header">
      <span class="__field-label">翻转卡片（Flip Box）</span>
      <p class="field-desc">配置卡片正反面的标题、描述和按钮文案。</p>
    </div>

    <div class="flip-box-body">
      <el-form label-position="top" class="flip-box-form">
        <!-- 正面内容 -->
        <div class="flip-section">
          <div class="flip-section-title">
            <span>正面内容（A）</span>
          </div>
          <el-form-item label="编号 / 小标题">
            <el-input
              v-model="fields.title_text_a"
              placeholder="例如：01."
              @input="onUpdate('title_text_a', fields.title_text_a)"
            />
          </el-form-item>
          <el-form-item label="主标题 / 描述">
            <el-input
              v-model="fields.description_text_a"
              type="textarea"
              :rows="2"
              placeholder="例如：Recycling Networks"
              @input="onUpdate('description_text_a', fields.description_text_a)"
            />
          </el-form-item>
        </div>

        <!-- 背面内容 -->
        <div class="flip-section">
          <div class="flip-section-title">
            <span>背面内容（B）</span>
          </div>
          <el-form-item label="标题">
            <el-input
              v-model="fields.title_text_b"
              placeholder="例如：01. Recycling Networks"
              @input="onUpdate('title_text_b', fields.title_text_b)"
            />
          </el-form-item>
          <el-form-item label="详细描述">
            <el-input
              v-model="fields.description_text_b"
              type="textarea"
              :rows="4"
              placeholder="请输入详细描述"
              @input="onUpdate('description_text_b', fields.description_text_b)"
            />
          </el-form-item>
          <el-form-item label="按钮文本">
            <el-input
              v-model="fields.button_text"
              placeholder="例如：Learn more"
              @input="onUpdate('button_text', fields.button_text)"
            />
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  nodeId: {
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
.flip-box-field {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 16px 18px 14px;
  background: #f9fafb;
}

.flip-box-header {
  margin-bottom: 10px;
}

.__field-label {
  font-size: 13px;
  color: #374151;
  font-weight: 600;
}

.field-desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.flip-box-body {
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 14px 6px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.flip-section {
  padding-bottom: 8px;
}

.flip-section + .flip-section {
  border-top: 1px dashed #e5e7eb;
  margin-top: 10px;
  padding-top: 10px;
}

.flip-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 6px;
}

.flip-box-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.flip-box-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-size: 12px;
  color: #6b7280;
}

.flip-box-form :deep(.el-input__inner),
.flip-box-form :deep(.el-textarea__inner) {
  border-radius: 8px;
}
</style>
