<template>
  <div class="field-item">
    <span class="field-label">标题：</span>
    <el-input
      v-model="localSettingsRef.sg_title_before"
      minlength="1"
      min="1"
      maxlength="100"
      placeholder="标题(before)"
      show-word-limit
      type="textarea"
      @input="onUpdate('sg_title_before', localSettingsRef.sg_title_before)"
    />
    <el-input
      v-model="localSettingsRef.sg_title_focused"
      minlength="1"
      min="1"
      maxlength="100"
      placeholder="标题(focused)"
      show-word-limit
      type="textarea"
      @input="onUpdate('sg_title_focused', localSettingsRef.sg_title_focused)"
    />
  </div>
</template>
<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  currentNode: {
    type: Object,
    required: true,
  },
  localSettings: {
    type: Object,
    required: true,
  },
  onUpdate: {
    type: Function,
    required: true,
  },
});

const localSettingsRef = ref({ ...props.localSettings });

watch(
  () => props.localSettings,
  (newVal) => {
    localSettingsRef.value = { ...newVal };
  },
  { deep: true }
);
</script>
<style scoped></style>
