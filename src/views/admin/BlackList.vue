<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面标题区域 -->
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex flex-col gap-2">
        <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
          <el-icon class="text-red-500 text-4xl"><RemoveFilled /></el-icon>
          黑名单管理
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">管理各 Demo 站点的黑名单图片地址，被列入的图片将不会被采集</p>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="flex-1 flex flex-col m-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0">
      <!-- 工具栏 - Demo 选择器 -->
      <div class="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <div class="flex items-center gap-4 flex-1">
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
            <el-icon><Grid /></el-icon>
            <span>选择 Demo：</span>
          </div>
          <el-select
            v-model="selectedDemo"
            filterable
            clearable
            placeholder="请选择或搜索 Demo 站点"
            class="w-full max-w-sm"
            size="large"
            :loading="demoListLoading"
            @change="onDemoChange"
          >
            <el-option
              v-for="demo in demoOptions"
              :key="demo.value"
              :label="demo.label"
              :value="demo.value"
            />
          </el-select>
          <el-button
            type="primary"
            size="large"
            :icon="Search"
            :loading="loading"
            @click="fetchBlacklist"
            :disabled="!selectedDemo"
          >
            查询黑名单
          </el-button>
        </div>
        <div class="flex items-center gap-3">
          <el-button
            type="success"
            size="large"
            :icon="Check"
            :loading="saving"
            :disabled="!selectedDemo"
            @click="onSave"
          >
            保存黑名单
          </el-button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-auto min-h-0 p-6">
        <!-- 未选择 Demo 时的提示 -->
        <div v-if="!selectedDemo" class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-4">
          <el-icon class="text-6xl"><RemoveFilled /></el-icon>
          <p class="text-lg">请在上方选择一个 Demo 站点</p>
          <p class="text-sm">选择后点击「查询黑名单」查看和编辑黑名单图片地址</p>
        </div>

        <!-- 已加载数据 -->
        <div v-else v-loading="loading" class="h-full flex flex-col">
          <!-- 当前 Demo 信息 -->
          <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium mb-2">
              <el-icon><InfoFilled /></el-icon>
              <span>当前 Demo：{{ selectedDemo }}</span>
              <el-tag size="small" type="danger" effect="dark" class="ml-2">
                共 {{ urlList.length }} 条
              </el-tag>
            </div>
            <p class="text-sm text-red-600 dark:text-red-400">
              列表中的图片地址将被采集引擎跳过，不会下载到本地。
            </p>
          </div>

          <!-- 添加按钮 + 批量操作 -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <el-icon class="text-red-500"><Picture /></el-icon>
              黑名单图片地址
            </h3>
            <div class="flex items-center gap-2">
              <el-button size="small" type="danger" plain :icon="Delete" @click="clearAll" :disabled="urlList.length === 0">
                清空列表
              </el-button>
              <el-button size="small" type="primary" :icon="Plus" @click="addUrl">
                添加地址
              </el-button>
            </div>
          </div>

          <!-- 地址列表 -->
          <div class="flex-1 overflow-auto">
            <el-table
              :data="urlList"
              stripe
              highlight-current-row
              class="w-full"
              empty-text="暂无黑名单图片地址，点击「添加地址」新增"
              style="width: 100%"
              max-height="500"
            >
              <el-table-column label="序号" width="70" align="center">
                <template #default="scope">
                  <span class="text-gray-500 dark:text-gray-400 font-mono text-sm">{{ scope.$index + 1 }}</span>
                </template>
              </el-table-column>

              <el-table-column label="图片地址" min-width="400" show-overflow-tooltip>
                <template #default="scope">
                  <el-input
                    v-model="urlList[scope.$index]"
                    placeholder="请输入图片 URL，例如 https://example.com/image.jpg"
                    size="small"
                    clearable
                    class="url-input"
                  />
                </template>
              </el-table-column>

              <el-table-column label="操作" width="100" align="center" fixed="right">
                <template #default="scope">
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    link
                    @click="removeUrl(scope.$index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { getBlacklistConfig, saveBlacklistConfig, getSiteList } from "@/apis/index.js";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search, Plus, Delete, Check, Grid, Picture,
  RemoveFilled, InfoFilled
} from '@element-plus/icons-vue';

const loading = ref(false);
const saving = ref(false);
const selectedDemo = ref("");
const demoOptions = ref([]);
const demoListLoading = ref(false);

/** 黑名单图片地址列表（直接存字符串） */
const urlList = reactive([]);

/** 获取站点列表，提取 demo_site 作为下拉选项 */
async function fetchDemoOptions() {
  demoListLoading.value = true;
  try {
    const res = await getSiteList({ page_size: 200 });
    if (res.code === 0) {
      const list = res.data?.list || [];
      const options = list
        .filter((site) => site.demo_site)
        .map((site) => ({
          value: site.demo_site,
          label: `${site.demo_site}${site.site_name ? '（' + site.site_name + '）' : ''}`,
        }));
      // 去重
      const seen = new Set();
      demoOptions.value = options.filter((opt) => {
        const dup = seen.has(opt.value);
        seen.add(opt.value);
        return !dup;
      });
    } else {
      demoOptions.value = [];
    }
  } catch {
    demoOptions.value = [];
  } finally {
    demoListLoading.value = false;
  }
}

/** 查询指定 Demo 的黑名单列表 */
async function fetchBlacklist() {
  const demo = selectedDemo.value?.trim();
  if (!demo) {
    ElMessage.warning("请先选择一个 Demo 站点");
    return;
  }

  loading.value = true;
  try {
    const res = await getBlacklistConfig(demo);
    if (res.code === 0) {
      // 接口返回 data: { id, demo, imgs, sizes, blacklist, ... }
      const blacklistData = res.data?.blacklist;
      urlList.length = 0;
      if (Array.isArray(blacklistData)) {
        urlList.push(...blacklistData.filter((item) => typeof item === "string"));
      }
      ElMessage.success(`已加载 ${urlList.length} 条黑名单记录`);
    } else {
      ElMessage.error(res.message || "获取黑名单失败");
    }
  } catch (error) {
    ElMessage.error("获取黑名单失败：" + (error.message || "网络错误"));
  } finally {
    loading.value = false;
  }
}

/** Demo 切换时自动查询 */
function onDemoChange(val) {
  if (val) {
    fetchBlacklist();
  } else {
    urlList.length = 0;
  }
}

/** 添加空白地址输入行 */
function addUrl() {
  urlList.push("");
}

/** 删除指定索引的地址 */
function removeUrl(index) {
  urlList.splice(index, 1);
}

/** 清空整个列表（需确认） */
async function clearAll() {
  if (urlList.length === 0) return;
  try {
    await ElMessageBox.confirm(
      `确定要清空「${selectedDemo.value}」的所有黑名单图片地址吗？`,
      "确认清空",
      {
        confirmButtonText: "确定清空",
        cancelButtonText: "取消",
        type: "warning",
        distinguishCancelAndClose: true,
      }
    );
    urlList.length = 0;
    ElMessage.success("列表已清空，点击「保存黑名单」生效");
  } catch {
    // 取消操作
  }
}

/** 保存黑名单列表 */
async function onSave() {
  const demo = selectedDemo.value?.trim();
  if (!demo) {
    ElMessage.warning("请先选择一个 Demo 站点");
    return;
  }

  // 过滤掉空字符串
  const validUrls = urlList.filter((url) => url?.trim());
  if (validUrls.length === 0 && urlList.length > 0) {
    ElMessage.warning("请填写有效的图片地址，或删除空行");
    return;
  }

  saving.value = true;
  try {
    const res = await saveBlacklistConfig(demo, validUrls);
    if (res.code === 0) {
      ElMessage.success(res.message || "保存成功");
      // 同步回 urlList（去除空格行）
      urlList.length = 0;
      urlList.push(...validUrls);
    } else {
      ElMessage.error(res.message || "保存失败");
    }
  } catch (error) {
    ElMessage.error("保存失败：" + (error.message || "网络错误"));
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchDemoOptions();
});
</script>

<style scoped>
.url-input :deep(.el-input__inner) {
  font-size: 13px;
  font-family: 'Courier New', Courier, monospace;
}

/* 表格样式优化 */
:deep(.el-table__header) {
  background: #f9fafb;
}

:deep(.el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background: #fef2f2;
}

:deep(.el-table__row:hover td) {
  background: #fef2f2;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

/* 暗色模式表格 */
@media (prefers-color-scheme: dark) {
  :deep(.el-table__header) {
    background: #4b5563;
  }

  :deep(.el-table__header th) {
    background: #4b5563;
    color: #f9fafb;
    border-bottom-color: #6b7280;
  }
}
</style>
