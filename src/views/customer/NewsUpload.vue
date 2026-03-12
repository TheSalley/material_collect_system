<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面标题区域（与站点信息一致） -->
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
            <el-icon class="text-blue-500 text-4xl"><Document /></el-icon>
            新闻上传
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">上传封面并创建新闻（post）</p>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="submit" :disabled="!canSubmit" :loading="submitting">创建新闻</el-button>
        </div>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="flex-1 flex flex-col m-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0">
      <div class="flex-1 p-6 md:p-10 overflow-auto">
        <div class="space-y-6">
          <!-- 左侧：截图（仅展示） 右侧：输入区（与站点信息布局一致） -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- 左侧：截图（本地占位图） -->
            <div class="lg:col-span-5 flex flex-col">
              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 flex-1 flex flex-col min-h-[280px]">
                <div class="flex items-center gap-2 mb-3">
                  <el-icon class="text-blue-500"><Picture /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">截图</h3>
                </div>
                <div class="rounded-lg overflow-hidden min-h-[220px]">
                  <img :src="productInfoImg" alt="新闻页面示意图" class="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            <!-- 右侧：输入区 -->
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
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">封面</h3>
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
            </div>
          </div>

          <el-alert v-if="tip" :title="tip" type="info" show-icon :closable="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { contentCreate, uploadImage } from "@/apis/index.js";
import { Document, Edit, Picture, Upload } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global.js";
import QuillEditor from "@/components/QuillEditor.vue";
import productInfoImg from "@/assets/images/product_info.png";

const { websiteInfo } = useGlobalStore();

const form = reactive({
  title: "",
  content: "",
});

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

function reset() {
  form.title = "";
  form.content = "";
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
      category_ids: [],
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
</script>

<style scoped>
.news-editor-wrap :deep(.quill-editor) {
  min-height: 420px;
}
</style>

