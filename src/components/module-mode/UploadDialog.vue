<template>
  <el-dialog v-model="dialogVisible" title="图片上传" width="900">
    <div v-loading="uploading || mediaLoading" class="upload-dialog-content">
      <el-tabs v-model="uploadTab" class="upload-tabs">
        <!-- 本地上传 -->
        <el-tab-pane label="本地上传" name="upload">
          <el-form label-position="top">
            <el-form-item label="页面标识">
              <el-input v-model="uploadPageName" placeholder="手动填写页面标识" />
            </el-form-item>
          </el-form>
          <el-upload
            drag
            action="#"
            :before-upload="(file) => $emit('before-upload', file)"
            :disabled="!hasUploadPageName"
          >
            <el-icon class="el-icon--upload">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path fill="currentColor" d="M544 864V672h128L512 480 352 672h128v192H320v-1.6c-5.376.32-10.496 1.6-16 1.6A240 240 0 0 1 64 624c0-123.136 93.12-223.488 212.608-237.248A239.81 239.81 0 0 1 512 192a239.87 239.87 0 0 1 235.456 194.752c119.488 13.76 212.48 114.112 212.48 237.248a240 240 0 0 1-240 240c-5.376 0-10.56-1.28-16-1.6v1.6z"></path>
              </svg>
            </el-icon>
            <div class="el-upload__text">拖动文件或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">jpg/png/webp 图片，大小不超过 20MB</div>
            </template>
          </el-upload>
        </el-tab-pane>

        <!-- 媒体库 -->
        <el-tab-pane label="媒体库" name="library">
          <div class="media-library">
            <el-input
              v-model="mediaKeyword"
              placeholder="搜索素材名称"
              clearable
              class="media-search"
              @input="$emit('media-search')"
            >
              <template #prefix
                ><el-icon> <Search /> </el-icon
              ></template>
            </el-input>
            <div v-loading="loading" class="media-content">
              <div v-if="rows.length === 0 && !loading" class="media-empty">
                <el-empty description="媒体库为空，请先上传" />
              </div>
              <div v-else class="flex flex-col">
                <div class="media-grid pretty-scroll">
                  <div
                    v-for="item in rows"
                    :key="item.id"
                    class="media-item"
                    :class="{ 'is-selected': selectedMediaId === item.id }"
                    @click="selectedMediaId = item.id"
                  >
                    <el-image :src="getFileFullUrl(item.file_url || item.url)" fit="cover" class="media-thumb">
                      <template #error>
                        <div class="media-thumb-fallback">
                          <el-icon>
                            <Picture />
                          </el-icon>
                        </div>
                      </template>
                    </el-image>
                    <div class="media-item-name">
                      {{ item.page }}
                    </div>
                    <div v-if="selectedMediaId === item.id" class="media-item-check">
                      <el-icon>
                        <Check />
                      </el-icon>
                    </div>
                  </div>
                </div>
                <!-- 分页 -->
                <div class="px-6 pb-2 flex-shrink-0 flex items-center justify-between">
                  <span v-if="total > 0" class="text-xs text-gray-400 dark:text-gray-500">
                    共
                    <strong class="text-gray-600 dark:text-gray-300">{{ total }}</strong>
                    条素材
                    <span class="ml-2 text-gray-400">当前第 {{ page }}/{{ totalPages }} 页</span>
                  </span>
                  <span v-else-if="rows.length > 0 || searched" class="text-xs text-gray-400 dark:text-gray-500">
                    共
                    <strong class="text-gray-600 dark:text-gray-300">{{ rows.length }}</strong>
                    条素材
                  </span>
                  <div v-else />

                  <el-pagination
                    v-if="total > 0"
                    v-model:current-page="page"
                    :total="total"
                    layout="sizes, prev, pager, next"
                    background
                    size="small"
                    @current-change="(p) => $emit('page-change', p)"
                  />
                </div>
              </div>
            </div>

            <div v-if="rows.length > 0" class="media-footer">
              <span class="media-selected-tip">
                {{ selectedMediaId ? "已选择 1 项" : "请选择一项" }}
              </span>
              <el-button type="primary" :disabled="!selectedMediaId" :loading="loading" @click="$emit('confirm-select')">
                确认选择
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup>
import { Search, Picture, Check } from "@element-plus/icons-vue";

const dialogVisible = defineModel("dialogVisible", { type: Boolean, default: false });
const uploadTab = defineModel("uploadTab", { type: String, default: "upload" });
const uploadPageName = defineModel("uploadPageName", { type: String, default: "" });
const mediaKeyword = defineModel("mediaKeyword", { type: String, default: "" });
const selectedMediaId = defineModel("selectedMediaId", { type: [String, Number], default: null });
const page = defineModel("page", { type: Number, default: 1 });

defineProps({
  uploading: {
    type: Boolean,
    default: false,
  },
  mediaLoading: {
    type: Boolean,
    default: false,
  },
  hasUploadPageName: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  totalPages: {
    type: Number,
    default: 0,
  },
  searched: {
    type: Boolean,
    default: false,
  },
  getFileFullUrl: {
    type: Function,
    required: true,
  },
});

defineEmits(["before-upload", "media-search", "confirm-select", "page-change"]);
</script>

<style scoped>
.upload-dialog-content {
  min-height: 300px;
}

/* 媒体库 */
:deep(.upload-tabs) {
  margin-top: -8px;
}

:deep(.upload-tabs .el-tabs__header) {
  margin-bottom: 16px;
}

.media-library {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-search {
  max-width: 280px;
}

.media-empty {
  padding: 40px 0;
  text-align: center;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
  padding: 4px;
}

.media-item {
  position: relative;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background: #fafbfc;
}

.media-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.media-item.is-selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.media-thumb {
  width: 100%;
  height: 90px;
  display: block;
}

.media-thumb-fallback {
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 24px;
  background: #f1f2f4;
}

.media-item-name {
  font-size: 0.7rem;
  color: #606266;
  padding: 4px 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.media-item-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.media-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.media-selected-tip {
  font-size: 0.875rem;
  color: #909399;
}
</style>
