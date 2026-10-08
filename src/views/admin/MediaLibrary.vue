<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { Picture, Search, Upload, Loading, Delete } from "@element-plus/icons-vue";
import MediaCard from "@/components/MediaCard.vue";
import { useMedia } from "@/composables/useMedia";
import PageContainer from "@/components/common/PageContainer.vue";
import PanelCard from "@/components/common/PanelCard.vue";
import ImageUploader from "@/components/common/ImageUploader.vue";

const {
  queryDemo, loading, rows, page, pageSize, total, totalPages, searched,
  loadMedia, handleQuery, handlePageChange, handleSizeChange, handleUpload: doUpload,
} = useMedia();

const uploadDrawerVisible = ref(false);
const uploading = ref(false);
const uploadFormRef = ref(null);
const imageUploaderRef = ref(null);
const uploadFiles = ref([]);
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
  uploadFiles.value = [];
  uploadDrawerVisible.value = true;
  nextTick(() => {
    uploadFormRef.value?.clearValidate();
    imageUploaderRef.value?.clearFiles();
    // 自动聚焦上传区域，用户打开抽屉后可直接 Ctrl+V 粘贴
    imageUploaderRef.value?.focus();
  });
}

function closeUploadDrawer() {
  uploadDrawerVisible.value = false;
}

// 文件选择/移除/粘贴逻辑已封装在 ImageUploader 组件内部
// 通过 v-model="uploadFiles" 同步文件列表

function removeFileByUid(uid) {
  uploadFiles.value = uploadFiles.value.filter((f) => f.uid !== uid);
  const uploadInstance = imageUploaderRef.value?.uploadRef;
  if (uploadInstance) {
    const target = uploadInstance.uploadFiles.find((f) => f.uid === uid);
    if (target) uploadInstance.handleRemove(target);
  }
}

function handlePreview(url) {
  if (!url) return;
  previewUrl.value = url;
  previewVisible.value = true;
}

async function handleUpload() {
  if (!uploadFormRef.value) return;
  await uploadFormRef.value.validate(async (valid) => {
    if (!valid) return;
    const files = uploadFiles.value;
    if (files.length === 0) {
      ElMessage.warning("请选择要上传的文件");
      return;
    }
    uploading.value = true;
    const CONCURRENCY = 5;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const batch = files.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((f) =>
          doUpload({
            file: f.raw,
            demo: uploadForm.demo,
            page: uploadForm.page,
          })
        )
      );
      for (const r of results) {
        if (r.status === "fulfilled" && r.value === true) successCount++;
        else failCount++;
      }
    }
    uploading.value = false;
    if (successCount > 0) {
      ElMessage.success(`上传完成：成功 ${successCount} 张${failCount > 0 ? `，失败 ${failCount} 张` : ""}`);
      closeUploadDrawer();
    } else {
      ElMessage.error("全部上传失败，请重试");
    }
  });
}

onMounted(() => {
  loadMedia();
});
</script>

<template>
  <PageContainer title="媒体库" subtitle="按站点 Demo 名称查询 / 上传已采集的素材" :icon="Picture">
    <PanelCard>
      <template #header>
        <div class="flex flex-wrap gap-3 items-end w-full">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-500">Demo 名称</span>
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
          <el-button type="primary" size="large" :icon="Search" :loading="loading" @click="handleQuery">查询</el-button>
          <el-button type="success" size="large" :icon="Upload" @click="openUploadDrawer">上传素材</el-button>
        </div>
      </template>

      <!-- 内容区 -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <el-icon class="is-loading text-4xl text-primary"><Loading /></el-icon>
      </div>

      <div v-else-if="rows.length === 0 && searched" class="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
        <el-icon class="text-7xl"><Picture /></el-icon>
        <p class="text-base">暂无素材</p>
        <p class="text-sm">输入 Demo 名称后点击查询，或上传新素材</p>
      </div>

      <div v-else-if="rows.length > 0" class="grid gap-4 media-grid">
        <MediaCard
          v-for="(item, idx) in rows"
          :key="idx"
          :item="item"
          @preview="handlePreview"
          @deleted="loadMedia"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full flex-wrap gap-3">
          <span v-if="total > 0" class="text-xs text-gray-400">
            共 <strong class="text-gray-600">{{ total }}</strong> 条素材
            <span class="ml-2 text-gray-400">当前第 {{ page }}/{{ totalPages }} 页</span>
          </span>
          <span v-else-if="rows.length > 0 || searched" class="text-xs text-gray-400">
            共 <strong class="text-gray-600">{{ rows.length }}</strong> 条素材
          </span>
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
      </template>
    </PanelCard>

    <!-- 上传素材抽屉 -->
    <el-drawer v-model="uploadDrawerVisible" title="上传素材" size="420px" :before-close="closeUploadDrawer">
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadFormRules" label-position="top">
        <el-form-item label="Demo 名称" prop="demo">
          <el-input v-model="uploadForm.demo" placeholder="例如 demo67" />
        </el-form-item>
        <el-form-item label="页面标识" prop="page">
          <el-input v-model="uploadForm.page" placeholder="例如 home" />
        </el-form-item>
        <el-form-item label="文件" prop="file">
          <ImageUploader
            ref="imageUploaderRef"
            v-model="uploadFiles"
            :limit="30"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="closeUploadDrawer">取消</el-button>
          <el-button type="primary" :loading="uploading" @click="handleUpload">确认上传</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 预览 Dialog -->
    <el-dialog v-model="previewVisible" align-center class="preview-dialog">
      <img v-if="previewUrl" :src="previewUrl" class="w-full max-h-[80vh] object-contain rounded-lg" />
    </el-dialog>
  </PageContainer>
</template>

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
