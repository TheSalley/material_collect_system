<template>
  <div class="preview-section">
    <div class="editor-scroll pretty-scroll">
      <div class="editor-content">
        <div
          v-for="(part, index) in visibleParts"
          :key="part.id"
          class="section-block section-preview-block"
          :class="{ 'is-active-part': activePartIndex === index }"
          @click="$emit('preview-click', index)"
        >
          <div class="preview-block-header">
            <div class="collapse-title">
              <el-icon class="collapse-icon">
                <Grid />
              </el-icon>
              <span class="collapse-text">板块 {{ index + 1 }}</span>
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
import { Grid, Upload, ZoomIn, Delete } from "@element-plus/icons-vue";
import { moduleImageKey } from "@/utils/moduleModeUtils.js";

defineProps({
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

defineEmits(["preview-click", "open-upload", "remove-image", "toggle-demo-screenshot"]);
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
  gap: 1rem;
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

.preview-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1.25rem 1.5rem;
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
  padding: 1.5rem;
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
