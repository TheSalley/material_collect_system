<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面标题区域（与站点信息一致） -->
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
            <el-icon class="text-blue-500 text-4xl"><Document /></el-icon>
            {{ isViewMode ? "新闻查看" : "新闻上传" }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">上传封面并创建新闻（post）</p>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="submit" :disabled="!canSubmit" :loading="submitting">创建新闻</el-button>
        </div>
      </div>
    </div>

    <!-- 主内容卡片：左截图 + 右表单 -->
    <div class="flex-1 flex flex-col m-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0">
      <div class="flex-1 p-6 md:p-10 overflow-auto">
        <div class="space-y-6">
          <!-- 左截图 + 右表单 -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- 左侧：封面图预览 -->
            <div class="lg:col-span-5 flex flex-col">
              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 flex-1 flex flex-col min-h-[400px]">
                <div class="flex items-center gap-2 mb-3">
                  <el-icon class="text-blue-500"><Picture /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">封面预览</h3>
                </div>
                <div class="flex-1 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center min-h-[360px]">
                  <img 
                    v-if="uploaded.url" 
                    :src="uploaded.url" 
                    alt="封面预览" 
                    class="w-full h-full object-contain max-h-[360px]"
                  />
                  <div v-else class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <el-icon class="text-6xl mb-2"><Picture /></el-icon>
                    <span class="text-sm">暂无封面图</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：编辑表单 -->
            <div class="lg:col-span-7 flex flex-col gap-6">
              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Edit /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">新闻标题</h3>
                </div>
                <div class="mt-4">
                  <el-input v-model="form.title" placeholder="请输入新闻标题" clearable />
                </div>
              </div>

              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Edit /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">新闻正文</h3>
                </div>
                <div class="mt-4 news-editor-wrap">
                  <QuillEditor
                    v-model="form.content"
                    :node-id="'news_upload_editor'"
                    placeholder="请输入新闻正文"
                  />
                </div>
              </div>

              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Picture /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">上传封面</h3>
                </div>
                <div class="mt-4 flex items-center gap-3 flex-wrap">
                  <el-upload action="#" :before-upload="beforeUpload" :show-file-list="false">
                    <el-button type="primary" :loading="uploading" :icon="Upload">
                      {{ uploaded.url ? "更换封面" : "上传封面" }}
                    </el-button>
                  </el-upload>
                  <span v-if="uploaded.attachment_id" class="text-xs text-gray-500 dark:text-gray-400">attachment_id：{{ uploaded.attachment_id }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">支持 jpg/png，不超过 10MB，建议 16:9</span>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Document /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">新闻分类</h3>
                </div>
                <div class="mt-4">
                  <el-select 
                    v-model="form.category_ids" 
                    placeholder="请选择新闻分类（可选）" 
                    clearable
                    multiple
                    style="width: 100%"
                  >
                    <el-option
                      v-for="category in categories"
                      :key="category.id"
                      :label="category.name"
                      :value="category.id"
                    >
                      <span>{{ category.name }}</span>
                    </el-option>
                  </el-select>
                </div>
              </div>
            </div>
          </div>

          <el-alert v-if="tip" :title="tip" type="info" show-icon :closable="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { contentCreate, uploadImage, getNewsCategories, getNews } from "@/apis/index.js";
import { Document, Edit, Picture, Upload } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global.js";
import QuillEditor from "@/components/QuillEditor.vue";
import { useRoute } from "vue-router";

const { websiteInfo } = useGlobalStore();
const route = useRoute();

const newsId = computed(() => (route.query?.id ? String(route.query.id) : ""));
const isViewMode = computed(() => route.query?.mode === "view" && Boolean(newsId.value));

const form = reactive({
  title: "",
  content: "",
  category_ids: [],
});

const categories = ref([]);
const loadingCategories = ref(false);

const uploading = ref(false);
const submitting = ref(false);
const uploaded = reactive({
  url: "",
  attachment_id: null,
});

const tip = ref("");

const canSubmit = computed(() => {
  return (
    Boolean(form.title?.trim()) &&
    Boolean(form.content?.trim()) &&
    Boolean(uploaded.attachment_id)
  );
});

async function fetchNewsDetail() {
  const site_id = websiteInfo?.site_id;
  if (!site_id || !newsId.value) return;

  try {
    const res = await getNews({ site_id, id: newsId.value });
    if (res?.code === 0 && res?.data) {
      form.title = res.data.title || "";
      form.content = res.data.content || "";
      tip.value = "";
    } else {
      ElMessage.error(res?.message || "获取新闻详情失败");
    }
  } catch (e) {
    ElMessage.error("获取新闻详情失败：" + (e?.message || "网络错误"));
  }
}

function beforeUpload(file) {
  // 后端媒体库通常仅接受 jpg/png（favicon 上传页也是如此）
  const okType = ["image/jpeg", "image/png"].includes(file.type);
  const okSize = file.size / 1024 / 1024 < 10;
  if (!okType) {
    ElMessage.error("仅支持 jpg/png 格式");
    return false;
  }
  if (!okSize) {
    ElMessage.error("图片不超过 10MB");
    return false;
  }

    (async () => {
      const site_id = websiteInfo?.site_id;
      if (!site_id) {
        ElMessage.error("未选择站点，无法上传");
        return;
      }
      uploading.value = true;
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("site_id", site_id);
        const res = await uploadImage(fd);
        if (res?.code !== 0 || !res?.data?.[0]?.success) {
          const msg =
            res?.data?.[0]?.message ||
            res?.message ||
            "上传失败";
          ElMessage.error(msg);
          return;
        }
      const { attachment_id, url } = res.data?.[0]?.data || {};
      uploaded.attachment_id = attachment_id ?? null;
      uploaded.url = url || "";
      ElMessage.success("上传成功");
    } catch (e) {
      ElMessage.error(e?.message || "上传失败");
    } finally {
      uploading.value = false;
    }
  })();

  return false;
}

// 获取新闻分类列表
async function fetchCategories() {
  const site_id = websiteInfo?.site_id;
  if (!site_id) return;

  loadingCategories.value = true;
  try {
    const res = await getNewsCategories(site_id);
    if (res.code === 0) {
      // 排除 slug 为 "uncategorized" 的分类
      categories.value = (res.data || []).filter(category => category.slug !== 'uncategorized');
    } else {
      ElMessage.error(res.message || "获取分类列表失败");
    }
  } catch (error) {
    ElMessage.error("获取分类列表失败：" + (error.message || "网络错误"));
  } finally {
    loadingCategories.value = false;
  }
}

function reset() {
  form.title = "";
  form.content = "";
  form.category_ids = [];
  uploaded.url = "";
  uploaded.attachment_id = null;
}

async function submit() {
  if (!canSubmit.value) return;
  const site_id = websiteInfo?.site_id;
  if (!site_id) {
    ElMessage.error("未选择站点（site_id 为空）");
    return;
  }
  submitting.value = true;
  try {
    const payload = {
      site_id,
      post_type: "post",
      title: form.title.trim(),
      content: form.content || "",
      category_ids: form.category_ids || [],
      tag_ids: [],
      featured_image_id: uploaded.attachment_id,
      gallery_ids: [],
    };
    const res = await contentCreate(payload);
    if (res?.code === 0) {
      ElMessage.success("新闻创建成功");
      reset();
    } else {
      ElMessage.error(res?.message || "创建失败");
    }
  } catch (e) {
    ElMessage.error(e?.message || "创建失败");
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  fetchCategories();
  if (isViewMode.value) fetchNewsDetail();
});

watch(
  () => [newsId.value, isViewMode.value, websiteInfo?.site_id],
  () => {
    if (isViewMode.value) fetchNewsDetail();
  }
);
</script>

<style scoped>
.news-editor-wrap :deep(.quill-editor) {
  min-height: 420px;
}
</style>

