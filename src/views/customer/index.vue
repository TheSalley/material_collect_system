<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面标题区域 -->
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex flex-col gap-2">
        <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
          <el-icon class="text-blue-500 text-4xl"><InfoFilled /></el-icon>
          网站信息
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">管理和查看网站基本信息</p>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="flex-1 flex flex-col m-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0">
      <div class="flex-1 p-6 md:p-10 overflow-auto" v-loading="loading">
        <div class="space-y-6">
          <!-- 表单区域（用户身份不显示截图） -->
          <div class="flex flex-col gap-6">
            <!-- 站点标题、Favicon 等输入 -->
            <div class="flex flex-col gap-6">
              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><InfoFilled /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">站点标题</h3>
                </div>
                <div class="mt-4 flex gap-2">
                  <el-input v-model="siteTitle" placeholder="请输入站点标题" clearable />
                  <el-button type="primary" :loading="savingTitle" @click="saveTitle">保存</el-button>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-500"><Sunny /></el-icon>
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">Favicon</h3>
                </div>
                <div class="mt-4 flex items-center gap-4">
                  <div class="w-14 h-14 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="siteIconUrl" :src="siteIconUrl" alt="favicon" class="w-full h-full object-contain" />
                    <el-icon v-else class="text-gray-400 text-2xl"><Upload /></el-icon>
                  </div>
                  <el-upload
                    action="#"
                    :before-upload="(file) => handleIconUpload(file)"
                    :show-file-list="false"
                  >
                    <el-button type="primary" :loading="savingIcon" :icon="Upload">
                      {{ siteIconUrl ? '更换图标' : '上传图标' }}
                    </el-button>
                    <template #tip>
                      <div class="el-upload__tip text-xs text-gray-500 mt-1">支持 jpg/png，不超过 1MB，建议尺寸 512x512 的正方形图片</div>
                    </template>
                  </el-upload>
                </div>
              </div>
            </div>
          </div>

          <el-alert
            v-if="errorMsg"
            :title="errorMsg"
            type="error"
            show-icon
            :closable="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useGlobalStore } from "@/stores/global";
import { getSiteTitle, getSiteIcon, updateSiteTitle, updateSiteIcon } from "@/apis/index.js";
import { InfoFilled, Tools, Sunny, Upload, Picture } from "@element-plus/icons-vue";

const { websiteInfo } = useGlobalStore();

const siteId = computed(() => websiteInfo?.site_id);

const loading = ref(false);
const savingTitle = ref(false);
const savingIcon = ref(false);
const errorMsg = ref("");
const siteTitle = ref("");
const siteIconUrl = ref("");

async function fetchSiteBasics() {
  if (!siteId.value) return;

  loading.value = true;
  errorMsg.value = "";
  try {
    const [titleRes, iconRes] = await Promise.all([
      getSiteTitle(siteId.value),
      getSiteIcon(siteId.value),
    ]);

    if (titleRes?.code === 0) {
      siteTitle.value = titleRes?.data?.title || "";
    } else {
      siteTitle.value = "";
      if (titleRes?.message) errorMsg.value = titleRes.message;
    }

    if (iconRes?.code === 0) {
      siteIconUrl.value = iconRes?.data?.icon_url || "";
    } else {
      siteIconUrl.value = "";
      if (!errorMsg.value && iconRes?.message) errorMsg.value = iconRes.message;
    }
  } catch (e) {
    siteTitle.value = "";
    siteIconUrl.value = "";
    errorMsg.value = e?.message || "获取失败";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (siteId.value) fetchSiteBasics();
});

watch(siteId, (newId, oldId) => {
  if (newId && newId !== oldId) fetchSiteBasics();
});

async function saveTitle() {
  if (!siteId.value) return;
  savingTitle.value = true;
  errorMsg.value = "";
  try {
    const res = await updateSiteTitle(siteId.value, siteTitle.value);
    if (res?.code === 0) {
      ElMessage.success("标题已保存");
    } else {
      ElMessage.error(res?.message || "保存失败");
    }
  } catch (e) {
    ElMessage.error(e?.message || "保存失败");
  } finally {
    savingTitle.value = false;
  }
}

function handleIconUpload(file) {
  const isImage = file.type === "image/jpeg" || file.type === "image/png";
  const isLt1M = file.size / 1024 / 1024 < 1;
  if (!isImage) {
    ElMessage.error("仅支持 jpg/png 格式");
    return false;
  }
  if (!isLt1M) {
    ElMessage.error("图片不超过 1MB");
    return false;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.naturalWidth !== img.naturalHeight) {
        ElMessage.error("请上传正方形图片（宽高一致）");
        resolve(false);
        return;
      }
      if (img.naturalWidth !== 512 || img.naturalHeight !== 512) {
        ElMessage.warning("建议使用 512×512 尺寸，当前为 " + img.naturalWidth + "×" + img.naturalHeight);
      }
      doUpdateSiteIcon(file, resolve);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      ElMessage.error("图片无法读取");
      resolve(false);
    };
    img.src = url;
  });
}

async function doUpdateSiteIcon(file, resolve) {
  savingIcon.value = true;
  errorMsg.value = "";
  try {
    const res = await updateSiteIcon(siteId.value, file);
      if (res?.code === 0) {
        const iconRes = await getSiteIcon(siteId.value);
      if (iconRes?.code === 0 && iconRes?.data?.icon_url) {
        siteIconUrl.value = iconRes.data.icon_url;
      }
      ElMessage.success(res?.message || "Favicon 已更新");
    } else {
      ElMessage.error(res?.message || "设置失败");
    }
  } catch (e) {
    ElMessage.error(e?.message || "设置失败");
  } finally {
    savingIcon.value = false;
  }
  if (resolve) resolve(false);
}
</script>
