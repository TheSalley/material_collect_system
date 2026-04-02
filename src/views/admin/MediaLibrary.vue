<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 顶部标题 -->
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

    <!-- 搜索上传工具栏 -->
    <div class="flex flex-wrap gap-3 items-end px-6 py-4 flex-shrink-0">
      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">Demo 名称</span>
        <el-input
          v-model="demo"
          size="large"
          placeholder="例如 demo67"
          clearable
          class="w-56"
          @keyup.enter="loadMedia"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <el-button type="primary" size="large" :icon="Search" :loading="loading" @click="loadMedia">
        查询
      </el-button>
      <el-button type="success" size="large" :icon="Upload" @click="openUploadDrawer">
        上传素材
      </el-button>
    </div>

    <!-- 统计信息 -->
    <div v-if="rows.length > 0" class="px-6 pb-2 flex-shrink-0">
      <span class="text-xs text-gray-400 dark:text-gray-500">
        共 <strong class="text-gray-600 dark:text-gray-300">{{ rows.length }}</strong> 条素材
      </span>
    </div>

    <!-- 画廊区域 -->
    <div class="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
      <!-- 加载态 -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <el-icon class="is-loading text-4xl text-blue-400"><Loading /></el-icon>
      </div>

      <!-- 空状态 -->
      <div v-else-if="rows.length === 0 && searched" class="flex flex-col items-center justify-center h-64 gap-4 text-gray-400 dark:text-gray-500">
        <el-icon class="text-7xl"><Picture /></el-icon>
        <p class="text-base">暂无素材</p>
        <p class="text-sm">输入 Demo 名称后点击查询，或上传新素材</p>
      </div>

      <!-- 画廊网格 -->
      <div v-else-if="rows.length > 0" class="grid gap-4 media-grid">
        <div
          v-for="(item, idx) in rows"
          :key="idx"
          class="media-card group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-600"
        >
          <!-- 图片预览区 -->
          <div class="relative aspect-[4/3] bg-gray-100 dark:bg-gray-600 overflow-hidden">
            <template v-if="getImageUrl(item)">
              <el-image
                :src="getImageUrl(item)"
                fit="cover"
                class="w-full h-full transition-transform duration-500 group-hover:scale-105"
                :preview-src-list="[getImageUrl(item)]"
                preview-teleported
              />
            </template>
            <template v-else>
              <div class="w-full h-full flex items-center justify-center">
                <el-icon class="text-5xl text-gray-300 dark:text-gray-500"><Document /></el-icon>
              </div>
            </template>

            <!-- 悬浮操作按钮 -->
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <el-button
                v-if="getImageUrl(item)"
                circle
                size="large"
                type="primary"
                :icon="View"
                @click="previewImage(getImageUrl(item))"
              />
            </div>

            <!-- 图片类型角标 -->
            <div
              v-if="getImageUrl(item)"
              class="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm"
            >
              {{ getImageExt(item) }}
            </div>
          </div>

          <!-- 卡片底部信息 -->
          <div class="p-3">
            <div class="flex flex-wrap gap-1">
              <el-tag
                v-if="getField(item, 'demo')"
                size="small"
                type="info"
                effect="plain"
                class="!text-[10px]"
              >
                {{ getField(item, 'demo') }}
              </el-tag>
              <el-tag
                v-if="getField(item, 'page')"
                size="small"
                type="warning"
                effect="plain"
                class="!text-[10px]"
              >
                {{ getField(item, 'page') }}
              </el-tag>
              <el-tag
                v-if="getField(item, 'created_at')"
                size="small"
                type="info"
                effect="plain"
                class="!text-[10px]"
              >
                {{ formatDate(getField(item, 'created_at')) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 上传抽屉 -->
  <el-drawer
    v-model="uploadDrawerVisible"
    title="上传素材"
    size="420px"
    :before-close="closeUploadDrawer"
  >
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

  <!-- 全屏预览弹窗 -->
  <el-dialog
    v-model="previewVisible"
    :show-close="true"
    align-center
    class="preview-dialog"
  >
    <img v-if="previewUrl" :src="previewUrl" class="w-full max-h-[80vh] object-contain rounded-lg" :alt="previewUrl" />
  </el-dialog>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  Picture, Search, Upload, UploadFilled,
  Document, View, Loading
} from "@element-plus/icons-vue";
import { getMediaByDemo, saveMedia } from "@/apis/media";

const demo = ref("demo67");
const loading = ref(false);
const rows = ref([]);
const searched = ref(false);

// ── 工具函数 ──────────────────────────────────────────────────────────────────

const IMAGE_FIELDS = ["url", "src", "image", "img", "thumbnail", "cover"];

function getImageUrl(item) {
  if (!item || typeof item !== "object") return null;
  for (const key of Object.keys(item)) {
    if (IMAGE_FIELDS.some(f => key.toLowerCase().includes(f))) {
      const val = item[key];
      if (typeof val === "string" && /^https?:\/\//i.test(val)) return val;
    }
  }
  return null;
}

function getImageExt(item) {
  const url = getImageUrl(item);
  if (!url) return "FILE";
  const m = url.match(/\.([a-z0-9]+)(\?|$)/i);
  return m ? m[1].toUpperCase() : "IMG";
}

function getField(item, key) {
  if (!item || typeof item !== "object") return null;
  return item[key] ?? item[key.replace(/_/g, "")] ?? null;
}

function formatDate(str) {
  if (!str) return "-";
  const d = new Date(str);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

// ── 查询 ───────────────────────────────────────────────────────────────────────

async function loadMedia() {
  const d = (demo.value || "").trim();
  if (!d) {
    ElMessage.warning("请输入 Demo 名称");
    return;
  }
  loading.value = true;
  searched.value = true;
  try {
    const res = await getMediaByDemo(d);
    if (res.code === 0) {
      const list = Array.isArray(res.data) ? res.data : [];
      rows.value = list;
    } else {
      rows.value = [];
      ElMessage.error(res.message || "获取失败");
    }
  } catch (e) {
    rows.value = [];
    ElMessage.error("请求失败：" + (e?.message || "网络错误"));
  } finally {
    loading.value = false;
  }
}

// ── 预览 ───────────────────────────────────────────────────────────────────────

const previewVisible = ref(false);
const previewUrl = ref("");

function previewImage(url) {
  previewUrl.value = url;
  previewVisible.value = true;
}

// ── 上传抽屉 ──────────────────────────────────────────────────────────────────

const uploadDrawerVisible = ref(false);
const uploading = ref(false);
const uploadFormRef = ref(null);
const uploadRef = ref(null);
const uploadFile = ref(null);

const uploadForm = reactive({
  demo: "",
  page: "",
});

const uploadFormRules = {
  demo: [{ required: true, message: "请输入 Demo 名称", trigger: "blur" }],
  page: [{ required: true, message: "请输入页面标识", trigger: "blur" }],
};

function openUploadDrawer() {
  uploadForm.demo = demo.value;
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
    if (!uploadFile.value) {
      ElMessage.warning("请选择要上传的文件");
      return;
    }
    uploading.value = true;
    try {
      const res = await saveMedia({
        file: uploadFile.value,
        demo: uploadForm.demo,
        page: uploadForm.page,
      });
      if (res.code === 0) {
        ElMessage.success(res.message || "上传成功");
        closeUploadDrawer();
        demo.value = uploadForm.demo;
        await nextTick();
        await loadMedia();
      } else {
        ElMessage.error(res.message || "上传失败");
      }
    } catch (e) {
      ElMessage.error("上传失败：" + (e?.message || "网络错误"));
    } finally {
      uploading.value = false;
    }
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
