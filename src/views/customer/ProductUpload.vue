<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
            <el-icon class="text-blue-500 text-4xl"><Box /></el-icon>
            {{ isViewMode ? "产品查看" : "产品上传" }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">上传产品主图并填写基础信息</p>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="submit" :disabled="!canSubmit" :loading="submitting">提交</el-button>
        </div>
      </div>
    </div>

    <!-- 主内容卡片：左截图 + 右表单 -->
    <div class="flex-1 flex flex-col m-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0">
      <div class="flex-1 p-6 md:p-10 overflow-auto">
        <div class="space-y-6">
          <!-- 左截图 + 右表单 -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- 左侧：产品主图预览 -->
            <div class="lg:col-span-5 flex flex-col">
              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 flex-1 flex flex-col min-h-[400px]">
                <div class="flex items-center gap-2 mb-3">
                  <el-icon class="text-blue-500"><Picture /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">产品主图预览</h3>
                </div>
                <div class="flex-1 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center min-h-[360px]">
                  <img 
                    v-if="uploaded.url" 
                    :src="uploaded.url" 
                    alt="产品主图预览" 
                    class="w-full h-full object-contain max-h-[360px]"
                  />
                  <div v-else class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <el-icon class="text-6xl mb-2"><Picture /></el-icon>
                    <span class="text-sm">暂无主图</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：编辑表单 -->
            <div class="lg:col-span-7 flex flex-col gap-6">
              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Edit /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">产品名称</h3>
                </div>
                <div class="mt-4">
                  <el-input v-model="form.name" placeholder="请输入产品名称" clearable />
                </div>
              </div>

              <div v-if="isViewMode && shortDescription" class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Edit /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">简短描述</h3>
                </div>
                <div class="mt-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                  {{ shortDescription }}
                </div>
              </div>

              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Edit /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">产品描述</h3>
                </div>
                <div class="mt-4 product-editor-wrap">
                  <QuillEditor
                    v-model="form.content"
                    :node-id="'product_upload_editor'"
                    placeholder="请输入产品描述（富文本）"
                  />
                </div>
              </div>

              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Picture /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">上传主图</h3>
                </div>
                <div class="mt-4 flex items-center gap-3">
                  <el-upload action="#" :before-upload="beforeUpload" :show-file-list="false">
                    <el-button type="primary" :loading="uploading" :icon="Upload">
                      {{ uploaded.url ? "更换主图" : "上传主图" }}
                    </el-button>
                  </el-upload>
                  <span v-if="uploaded.attachment_id" class="text-xs text-gray-500 dark:text-gray-400">attachment_id：{{ uploaded.attachment_id }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">支持 jpg/png，不超过 10MB，建议 1:1</span>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Picture /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">产品图库（多图）</h3>
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <div
                    v-for="(item, index) in galleryList"
                    :key="item.attachment_id + '-' + index"
                    class="relative w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0"
                  >
                    <img :src="item.url" class="w-full h-full object-cover" alt="图库" />
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      class="absolute top-0.5 right-0.5 !p-0 !min-w-0 w-4 h-4"
                      @click="removeGallery(index)"
                    >
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </div>
                  <input
                    ref="galleryInputRef"
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    class="hidden"
                    @change="onGalleryFilesChange"
                  />
                  <div
                    role="button"
                    tabindex="0"
                    class="w-16 h-16 rounded-lg border border-dashed border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center gap-0 text-gray-400 dark:text-gray-500 cursor-pointer hover:border-blue-400 hover:text-blue-500 shrink-0"
                    @click="galleryInputRef?.click()"
                  >
                    <el-icon class="text-xl"><Plus /></el-icon>
                    <span class="text-xs">添加（可多选）</span>
                  </div>
                </div>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">图库作为 gallery_ids 提交，顺序即展示顺序</div>
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
import { computed, reactive, ref, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { uploadImage, contentCreate, getProduct } from "@/apis/index.js";
import { Box, Edit, Picture, Upload, Close, Plus } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global.js";
import QuillEditor from "@/components/QuillEditor.vue";
import { useRoute } from "vue-router";

const { websiteInfo } = useGlobalStore();
const route = useRoute();

const productId = computed(() => (route.query?.id ? String(route.query.id) : ""));
const isViewMode = computed(() => route.query?.mode === "view" && Boolean(productId.value));

const form = reactive({
  name: "",
  content: "",
});

const uploading = ref(false);
const uploaded = reactive({
  url: "",
  attachment_id: null,
});

/** 图库多图列表，每项 { url, attachment_id } */
const galleryList = ref([]);

const tip = ref("");
const submitting = ref(false);
const galleryUploading = ref(false);
const galleryInputRef = ref(null);

const canSubmit = computed(() => {
  return Boolean(form.name?.trim()) && Boolean(uploaded.url);
});

const shortDescription = ref("");

async function fetchProductDetail() {
  const site_id = websiteInfo?.site_id;
  if (!site_id || !productId.value) return;

  try {
    const res = await getProduct({ site_id, id: productId.value });
    if (res?.code === 0 && res?.data) {
      form.name = res.data.title || "";
      shortDescription.value = res.data.short_description || "";
      form.content = res.data.content || "";
      tip.value = "";
    } else {
      ElMessage.error(res?.message || "获取产品详情失败");
    }
  } catch (e) {
    ElMessage.error("获取产品详情失败：" + (e?.message || "网络错误"));
  }
}

onMounted(() => {
  if (isViewMode.value) fetchProductDetail();
});

watch(
  () => [productId.value, isViewMode.value, websiteInfo?.site_id],
  () => {
    if (isViewMode.value) fetchProductDetail();
  }
);

function beforeUpload(file) {
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

function removeGallery(index) {
  galleryList.value.splice(index, 1);
}

/** 图库多选：选择多个文件后逐个上传 */
async function onGalleryFilesChange(e) {
  const files = e.target.files;
  if (!files?.length) return;
  const site_id = websiteInfo?.site_id;
  if (!site_id) {
    ElMessage.error("未选择站点，无法上传");
    e.target.value = "";
    return;
  }
  const list = Array.from(files);
  let added = 0;
  for (const file of list) {
    const okType = ["image/jpeg", "image/png"].includes(file.type);
    const okSize = file.size / 1024 / 1024 < 10;
    if (!okType) {
      ElMessage.error(`「${file.name}」仅支持 jpg/png 格式`);
      continue;
    }
    if (!okSize) {
      ElMessage.error(`「${file.name}」不超过 10MB`);
      continue;
    }
    galleryUploading.value = true;
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("site_id", site_id);
      const res = await uploadImage(fd);
      if (res?.code !== 0 || !res?.data?.[0]?.success) {
        ElMessage.error(res?.data?.[0]?.message || res?.message || "上传失败");
        continue;
      }
      const { attachment_id, url } = res.data?.[0]?.data || {};
      galleryList.value.push({ attachment_id: attachment_id ?? null, url: url || "" });
      added++;
    } catch (err) {
      ElMessage.error(err?.message || "上传失败");
    } finally {
      galleryUploading.value = false;
    }
  }
  if (added > 0) ElMessage.success(`已添加 ${added} 张图到图库`);
  e.target.value = "";
}

function reset() {
  form.name = "";
  form.content = "";
  shortDescription.value = "";
  uploaded.url = "";
  uploaded.attachment_id = null;
  galleryList.value = [];
}

async function submit() {
  if (!canSubmit.value) return;
  const site_id = websiteInfo?.site_id;
  if (!site_id) {
    ElMessage.error("未选择站点，无法创建");
    return;
  }
  submitting.value = true;
  try {
    const payload = {
      site_id,
      post_type: "product",
      title: form.name.trim(),
      content: form.content?.trim() || "<p>产品</p>",
      category_ids: [],
      tag_ids: [],
      featured_image_id: Number(uploaded.attachment_id),
      gallery_ids: galleryList.value.map((item) => Number(item.attachment_id)).filter((id) => !Number.isNaN(id) && id > 0),
    };
    const res = await contentCreate(payload);
    if (res?.code === 0) {
      ElMessage.success(res?.message || "创建成功");
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
.product-editor-wrap :deep(.quill-editor) {
  min-height: 320px;
}
</style>
