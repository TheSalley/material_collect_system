<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex flex-col gap-2">
        <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
          <el-icon class="text-blue-500 text-4xl"><Picture /></el-icon>
          媒体库
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          按站点 Demo 名称查询 / 上传已采集的素材
        </p>
      </div>
    </div>

    <div class="flex flex-wrap gap-3 items-end px-6 py-4 flex-shrink-0">
      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">Demo 名称</span>
        <el-input
          v-model="queryDemo"
          size="large"
          placeholder="例如 demo67"
          clearable
          class="w-56"
          @keyup.enter="handleQuery"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <el-button type="primary" size="large" :icon="Search" :loading="loading" @click="handleQuery">
        查询
      </el-button>
      <el-button type="success" size="large" :icon="Upload" @click="openUploadDrawer">
        上传素材
      </el-button>
    </div>

    <div class="px-6 pb-2 flex-shrink-0 flex items-center justify-between">
      <span v-if="total > 0" class="text-xs text-gray-400 dark:text-gray-500">
        共 <strong class="text-gray-600 dark:text-gray-300">{{ total }}</strong> 条素材
        <span class="ml-2 text-gray-400">当前第 {{ page }}/{{ totalPages }} 页</span>
      </span>
      <span v-else-if="rows.length > 0 || searched" class="text-xs text-gray-400 dark:text-gray-500">
        共 <strong class="text-gray-600 dark:text-gray-300">{{ rows.length }}</strong> 条素材
      </span>
      <div v-else />

      <el-pagination
        v-if="total > 0"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 50, 100]"
        :total="total"
        layout="sizes, prev, pager, next"
        background
        size="small"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <div class="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <el-icon class="is-loading text-4xl text-blue-400"><Loading /></el-icon>
      </div>

      <div v-else-if="rows.length === 0 && searched" class="flex flex-col items-center justify-center h-64 gap-4 text-gray-400 dark:text-gray-500">
        <el-icon class="text-7xl"><Picture /></el-icon>
        <p class="text-base">暂无素材</p>
        <p class="text-sm">输入 Demo 名称后点击查询，或上传新素材</p>
      </div>

      <div v-else-if="rows.length > 0" class="grid gap-4 media-grid">
        <MediaCard v-for="(item, idx) in rows" :key="idx" :item="item" />
      </div>
    </div>
  </div>

  <el-drawer v-model="uploadDrawerVisible" title="上传素材" size="420px" :before-close="closeUploadDrawer">
    <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadFormRules" label-position="top">
      <el-form-item label="Demo 名称" prop="demo">
        <el-input v-model="uploadForm.demo" placeholder="例如 demo67" />
      </el-form-item>
      <el-form-item label="页面标识" prop="page">
        <el-input v-model="uploadForm.page" placeholder="例如 home" />
      </el-form-item>
      <el-form-item label="文件" prop="file">
        <el-upload
          ref="uploadRef"
          class="w-full"
          drag
          :auto-upload="false"
          :limit="1"
          accept="image/*"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
        >
          <el-icon class="el-icon--upload text-4xl text-blue-400 mb-2"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处，或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 jpg / png / gif / webp 等图片格式</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="closeUploadDrawer">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">确认上传</el-button>
      </div>
    </template>
  </el-drawer>

  <el-dialog v-model="previewVisible" align-center class="preview-dialog">
    <img v-if="previewUrl" :src="previewUrl" class="w-full max-h-[80vh] object-contain rounded-lg" />
  </el-dialog>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import { Picture, Search, Upload, UploadFilled, Loading } from "@element-plus/icons-vue";
import MediaCard from "@/components/MediaCard.vue";
import { useMedia } from "@/composables/useMedia";

const {
  queryDemo, loading, rows, page, pageSize, total, totalPages, searched,
  loadMedia, handleQuery, handlePageChange, handleSizeChange, handleUpload: doUpload,
} = useMedia();

const uploadDrawerVisible = ref(false);
const uploading = ref(false);
const uploadFormRef = ref(null);
const uploadFile = ref(null);
const previewVisible = ref(false);
const previewUrl = ref("");

const uploadForm = reactive({ demo: "", page: "" });

const uploadFormRules = {
  demo: [{ required: true, message: "请输入 Demo 名称", trigger: "blur" }],
  page: [{ required: true, message: "请输入页面标识", trigger: "blur" }],
};

function openUploadDrawer() {
  uploadForm.demo = queryDemo.value;
  uploadForm.page = "";
  uploadFile.value = null;
  uploadDrawerVisible.value = true;
  nextTick(() => uploadFormRef.value?.clearValidate());
}

function closeUploadDrawer() {
  uploadDrawerVisible.value = false;
}

function handleFileChange(file) {
  uploadFile.value = file.raw;
}

function handleFileRemove() {
  uploadFile.value = null;
}

async function handleUpload() {
  if (!uploadFormRef.value) return;
  await uploadFormRef.value.validate(async (valid) => {
    if (!valid) return;
    if (!uploadFile.value) return;
    uploading.value = true;
    const success = await doUpload({
      file: uploadFile.value,
      demo: uploadForm.demo,
      page: uploadForm.page,
    });
    if (success) closeUploadDrawer();
    uploading.value = false;
  });
}

onMounted(() => {
  loadMedia();
});
</script>

<style scoped>
.media-grid {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 12px;
  background: #000;
}

.preview-dialog :deep(.el-overlay) {
  background: rgba(0, 0, 0, 0.85);
}
</style>
