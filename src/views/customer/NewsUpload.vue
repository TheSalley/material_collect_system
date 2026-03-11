<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <div class="px-5 pt-5 flex-shrink-0">
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

    <div class="flex-1 flex flex-col m-5 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0">
      <div class="flex-1 p-5 md:p-6 overflow-auto">
        <div class="w-full space-y-5">
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div class="xl:col-span-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-5">
              <div class="flex items-center gap-2">
                <el-icon class="text-blue-500"><Edit /></el-icon>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">新闻内容</h2>
              </div>
              <el-form class="mt-4" label-position="top">
                <el-form-item label="新闻标题">
                  <el-input v-model="form.title" placeholder="请输入新闻标题" clearable />
                </el-form-item>
                <el-form-item label="新闻正文">
                  <div class="news-editor-wrap">
                    <QuillEditor
                      v-model="form.content"
                      :node-id="'news_upload_editor'"
                      placeholder="请输入新闻正文"
                    />
                  </div>
                </el-form-item>
              </el-form>
            </div>

            <div class="xl:col-span-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-5">
              <div class="flex items-center gap-2">
                <el-icon class="text-blue-500"><Picture /></el-icon>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">封面</h2>
              </div>

              <div class="mt-4">
                <div
                  class="w-full aspect-[16/9] rounded-xl border border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-900/30 flex items-center justify-center overflow-hidden"
                >
                  <img v-if="uploaded.url" :src="uploaded.url" class="w-full h-full object-cover" alt="cover" />
                  <div v-else class="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                    <el-icon class="text-4xl"><Picture /></el-icon>
                    <div class="text-sm">建议比例 16:9</div>
                  </div>
                </div>
                <div class="mt-4 flex items-center justify-between gap-3">
                  <el-upload
                    action="#"
                    :before-upload="beforeUpload"
                    :show-file-list="false"
                  >
                    <el-button type="primary" :loading="uploading" :icon="Upload">
                      {{ uploaded.url ? "更换封面" : "上传封面" }}
                    </el-button>
                  </el-upload>
                  <div class="text-xs text-gray-500 dark:text-gray-400">支持 jpg/png/webp，不超过 10MB</div>
                </div>
              </div>

              <div v-if="uploaded.url" class="mt-4 text-sm">
                <div class="text-xs text-gray-500 dark:text-gray-400">上传结果</div>
                <div class="mt-1 grid grid-cols-1 gap-2">
                  <div class="break-all">
                    <span class="text-gray-700 dark:text-gray-200 font-medium">URL：</span>
                    <span class="text-gray-600 dark:text-gray-300">{{ uploaded.url }}</span>
                  </div>
                  <div>
                    <span class="text-gray-700 dark:text-gray-200 font-medium">attachment_id：</span>
                    <span class="text-gray-600 dark:text-gray-300">{{ uploaded.attachment_id ?? "-" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <el-alert
            v-if="tip"
            :title="tip"
            type="info"
            show-icon
            :closable="false"
          />
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

