<template>
  <div class="preview-section">
    <div class="editor-scroll pretty-scroll">
      <div class="editor-content">
        <div
          v-for="(part, index) in visibleParts"
          :key="part.id"
          class="section-block section-preview-block"
          :class="{
            'is-active-part': activePartIndex === index,
            'is-hidden-part': isPartHidden(part),
          }"
          @click="$emit('preview-click', index)"
        >
          <div class="preview-block-header">
            <div class="collapse-title">
              <el-icon class="collapse-icon">
                <Grid />
              </el-icon>
              <span class="collapse-text">
                板块 {{ index + 1 }}
              </span>
              <template v-if="editingPartId === part.id">
                <el-input
                  :ref="(el) => setTitleInputRef(part.id, el)"
                  v-model="draftTitle"
                  size="small"
                  class="title-edit-input"
                  placeholder="输入板块标题"
                  @click.stop
                  @mousedown.stop
                  @keyup.enter="commitTitle(part)"
                  @keyup.esc="cancelTitle"
                  @blur="commitTitle(part)"
                />
              </template>
              <button
                v-else
                type="button"
                class="title-edit-btn"
                :title="part?.settings?._title ? '修改标题' : '添加标题'"
                @click.stop="startEdit(part)"
              >
                <template v-if="part?.settings?._title">
                  <span class="title-edit-btn__text">— {{ part.settings._title }}</span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.4,3 17.16,3.1 16.97,3.29L15.13,5.13L18.87,8.87L20.71,7.03C21.1,6.63 21.1,6 20.71,5.59L18.41,3.29C18.22,3.1 17.98,3 17.66,3Z"
                    />
                  </svg>
                </template>
                <template v-else>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.4,3 17.16,3.1 16.97,3.29L15.13,5.13L18.87,8.87L20.71,7.03C21.1,6.63 21.1,6 20.71,5.59L18.41,3.29C18.22,3.1 17.98,3 17.66,3Z"
                    />
                  </svg>
                  加标题
                </template>
              </button>
              <el-tag v-if="isDemoScreenshotBound(part.id, index)" size="small" type="success" effect="plain">
                已绑定 Demo
              </el-tag>
            </div>
            <div v-if="isAdmin" class="preview-block-header__actions">
              <div class="preview-block-header__primary-actions">
                <el-button type="primary" size="small" plain @click.stop="$emit('open-upload', part.id, index)">
                  <el-icon>
                    <Upload />
                  </el-icon>
                  上传
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  plain
                  :loading="removingImageKey === moduleImageKey(part.id)"
                  :disabled="!getModuleImage(part.id)"
                  @click.stop="$emit('remove-image', part.id)"
                >
                  移除截图
                </el-button>
              </div>
              <el-button
                size="small"
                :type="isDemoScreenshotBound(part.id, index) ? 'success' : 'primary'"
                :plain="!isDemoScreenshotBound(part.id, index)"
                :loading="bindingDemoImageKey === moduleImageKey(part.id)"
                :disabled="!getModuleImage(part.id)"
                @click.stop="$emit('toggle-demo-screenshot', part.id, index)"
              >
                {{ isDemoScreenshotBound(part.id, index) ? "取消绑定 Demo" : "绑定 Demo" }}
              </el-button>
            </div>
          </div>
          <div class="preview-block-body">
            <div v-if="getModuleImage(part.id)" class="preview-image-wrapper">
              <el-image
                :src="getModuleImage(part.id).file_url"
                :preview-src-list="[getModuleImage(part.id).file_url]"
                fit="contain"
                class="preview-image"
                preview-teleported
              />
              <div class="preview-image-overlay">
                <el-icon size="24">
                  <ZoomIn />
                </el-icon>
                <span>查看大图</span>
              </div>
              <div
                v-if="isAdmin"
                class="preview-image-actions"
                :class="{ 'is-visible': removingImageKey === moduleImageKey(part.id) }"
              >
                <el-button
                  class="preview-image-remove"
                  :icon="Delete"
                  :loading="removingImageKey === moduleImageKey(part.id)"
                  circle
                  size="small"
                  type="danger"
                  @click.stop="$emit('remove-image', part.id)"
                />
              </div>
            </div>
            <el-empty v-else description="未上传截图" :image-size="80" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from "vue";
import { Grid, Upload, ZoomIn, Delete } from "@element-plus/icons-vue";
import { moduleImageKey, isPartHidden } from "@/utils/moduleModeUtils.js";

const props = defineProps({
  visibleParts: {
    type: Array,
    required: true,
  },
  activePartIndex: {
    type: Number,
    default: -1,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  getModuleImage: {
    type: Function,
    required: true,
  },
  removingImageKey: {
    type: String,
    default: "",
  },
  bindingDemoImageKey: {
    type: String,
    default: "",
  },
  isDemoScreenshotBound: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["preview-click", "open-upload", "remove-image", "toggle-demo-screenshot", "update-title"]);

const editingPartId = ref(null);
const draftTitle = ref("");
const titleInputRefs = ref({});

function setTitleInputRef(id, el) {
  if (el) titleInputRefs.value[id] = el;
}

function startEdit(part) {
  editingPartId.value = part.id;
  draftTitle.value = part?.settings?._title ?? "";
  nextTick(() => {
    const input = titleInputRefs.value?.[part.id];
    if (input?.focus) input.focus();
  });
}

function commitTitle(part) {
  if (editingPartId.value !== part.id) return;
  emit("update-title", { id: part.id, title: draftTitle.value });
  editingPartId.value = null;
}

function cancelTitle() {
  editingPartId.value = null;
  draftTitle.value = "";
}
</script>

<style scoped>
.preview-section {
  flex: 0 0 55%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.section-block {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.section-block:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.section-preview-block {
  display: flex;
  flex-direction: column;
  position: relative;
}

.section-block.section-preview-block.is-active-part {
  transform: none;
  border-left: 4px solid #409eff;
  box-shadow: 0 4px 18px rgba(64, 158, 255, 0.16);
  background: linear-gradient(90deg, rgba(236, 245, 255, 0.75) 0%, #fff 42%);
  transition:
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #303133;
  padding: 0.25rem 0;
}

.collapse-icon {
  color: #409eff;
  font-size: 1.25rem;
}

.collapse-text {
  font-size: 1rem;
}

.title-edit-input {
  width: 220px;
}

.title-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 400;
  color: #5b6472;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}
.title-edit-btn:hover {
  color: #2b7cee;
  border-color: rgba(43, 124, 238, 0.35);
  background: rgba(43, 124, 238, 0.06);
}
.title-edit-btn__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 隐藏板块：卡片半透明 + 虚线描边提示 */
.section-preview-block.is-hidden-part {
  opacity: 0.62;
  border: 1px dashed #d4a05a;
  filter: saturate(0.85);
}

.preview-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.preview-block-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-block-header__primary-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.preview-block-body {
  padding: 1rem;
  background: #fafbfc;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.preview-image-wrapper .el-image {
  display: block;
}

.preview-image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 8px;
  pointer-events: none;
}

.preview-image-remove {
  position: static;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-image-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-image-wrapper:hover .preview-image-overlay {
  opacity: 1;
}

.preview-image-wrapper:hover .preview-image-actions,
.preview-image-actions.is-visible {
  opacity: 1;
}

.preview-image {
  width: 100%;
  max-height: 320px;
  height: auto;
  object-fit: contain;
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.preview-image-wrapper:hover .preview-image {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
</style>
