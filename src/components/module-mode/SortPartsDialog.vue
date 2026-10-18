<template>
  <el-dialog
    v-model="visible"
    title="板块排序"
    width="480px"
    append-to-body
    @closed="resetState"
  >
    <p class="sort-dialog-tip">拖动手柄调整顺序，松手即生效</p>

    <div class="sort-dialog-list">
      <div
        v-for="(part, index) in parts"
        :key="part.id"
        class="sort-dialog-item"
        :class="{
          'is-dragging': draggingIndex === index,
          'is-drag-over': dragOverIndex === index,
        }"
        @dragover.prevent="dragOverIndex = index"
        @dragleave="onDragLeave(index)"
        @drop.prevent="onDrop(index)"
      >
        <span
          class="sort-dialog-handle"
          draggable="true"
          title="拖动排序"
          @dragstart="onDragStart(index, $event)"
          @dragend="onDragEnd"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"
            />
          </svg>
        </span>
        <span class="sort-dialog-index">板块 {{ index + 1 }}</span>
        <span class="sort-dialog-title">{{ partTitle(part) }}</span>
        <el-tag
          v-if="isPartHidden(part)"
          size="small"
          type="warning"
          effect="plain"
          class="sort-dialog-hidden-tag"
        >
          已隐藏
        </el-tag>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="visible = false">完成</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import { isPartHidden } from "@/utils/moduleModeUtils.js";

const visible = defineModel("visible", { type: Boolean, default: false });
const props = defineProps({
  parts: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(["reorder"]);

const draggingIndex = ref(null);
const dragOverIndex = ref(null);

function partTitle(part) {
  const t = part?.settings?._title;
  return typeof t === "string" && t.trim() ? t.trim() : part?.elType || "未命名";
}

function onDragStart(index, e) {
  draggingIndex.value = index;
  if (e?.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }
}

function onDragEnd() {
  draggingIndex.value = null;
  dragOverIndex.value = null;
}

function onDragLeave(index) {
  if (dragOverIndex.value === index) dragOverIndex.value = null;
}

function onDrop(index) {
  const from = draggingIndex.value;
  if (from !== null && from !== index) {
    const fromPart = props.parts[from];
    const toPart = props.parts[index];
    if (fromPart && toPart) {
      emit("reorder", { fromId: fromPart.id, toId: toPart.id });
    }
  }
  draggingIndex.value = null;
  dragOverIndex.value = null;
}

function resetState() {
  draggingIndex.value = null;
  dragOverIndex.value = null;
}
</script>

<style scoped>
.sort-dialog-tip {
  margin: 0 0 12px;
  font-size: 12px;
  color: #8a94a3;
}

.sort-dialog-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
}

.sort-dialog-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  transition: box-shadow 0.2s, opacity 0.2s, border-color 0.2s;
}
.sort-dialog-item:hover {
  border-color: rgba(43, 124, 238, 0.35);
}
.sort-dialog-item.is-dragging {
  opacity: 0.55;
}
.sort-dialog-item.is-drag-over {
  box-shadow: inset 0 3px 0 #2b7cee;
}

.sort-dialog-handle {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
  color: #a8b3c5;
  cursor: grab;
  touch-action: none;
}
.sort-dialog-handle:hover {
  color: #2b7cee;
  background: rgba(43, 124, 238, 0.08);
}
.sort-dialog-handle:active {
  cursor: grabbing;
}

.sort-dialog-index {
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 600;
  color: #33415c;
}
.sort-dialog-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #5b6472;
}
.sort-dialog-hidden-tag {
  flex: 0 0 auto;
}
</style>
