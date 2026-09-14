<template>
  <PageContainer>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h1 class="flex items-center gap-3 text-[28px] font-bold text-gray-900">
            <el-icon class="text-primary text-3xl"><Document /></el-icon>
            新闻列表
          </h1>
          <p class="text-sm text-gray-500">管理和查看所有新闻信息</p>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <el-button type="primary" :icon="Plus" @click="goToUpload">
            添加新闻
          </el-button>
        </div>
      </div>
    </template>

    <PanelCard flush>
      <template #header>
        <div class="flex-1">
          <el-input
            v-model="searchValue"
            class="w-full max-w-md"
            size="large"
            placeholder="搜索新闻标题..."
            clearable
            @clear="fetchList"
            @keyup.enter="fetchList"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button :icon="Search" @click="fetchList" />
            </template>
          </el-input>
        </div>
      </template>

      <el-table
        :data="tableData"
        :stripe="true"
        :highlight-current-row="true"
        class="w-full"
        empty-text="暂无数据"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="100" align="center">
          <template #default="scope">
            <span class="font-mono text-xs text-gray-500">{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="新闻标题" min-width="260" show-overflow-tooltip>
          <template #default="scope">
            <span class="font-medium text-gray-900">{{ scope.row.title || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="200" align="center">
          <template #default="scope">
            <div class="flex gap-2 justify-center">
              <el-button
                type="primary"
                size="small"
                :icon="Document"
                link
                @click="viewDetail(scope.row)"
              >
                查看
              </el-button>
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                link
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="flex justify-end">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </template>
    </PanelCard>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { getNewsList, deleteContent } from "@/apis/index.js";
import { ElMessage, ElMessageBox } from "element-plus";
import "element-plus/theme-chalk/el-message-box.css";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global.js";
import PageContainer from "@/components/common/PageContainer.vue";
import PanelCard from "@/components/common/PanelCard.vue";
import {
  Search, Plus, Delete, Clock, Document
} from '@element-plus/icons-vue';

const router = useRouter();
const { websiteInfo } = useGlobalStore();

const tableData = reactive([]);
const searchValue = ref("");
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 格式化时间
const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取新闻列表
async function fetchList() {
  const site_id = websiteInfo?.site_id;
  if (!site_id) {
    ElMessage.warning("请先选择站点");
    return;
  }

  loading.value = true;
  try {
    const params = {
      site_id,
      page: currentPage.value,
      page_size: pageSize.value,
    };
    // 当前后端 /news_list 暂未提供搜索参数，这里暂不向后端传递搜索条件

    const res = await getNewsList(params);
    if (res.code === 0) {
      const list = res.data?.list || [];
      tableData.length = 0;
      tableData.push(...list);
      total.value = Number(res.data?.total ?? list.length);
    } else {
      ElMessage.error(res.message || "获取新闻列表失败");
    }
  } catch (error) {
    ElMessage.error("获取新闻列表失败：" + (error.message || "网络错误"));
  } finally {
    loading.value = false;
  }
}

// 删除新闻
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除新闻 "${row.title?.rendered || row.title || row.id}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: false,
        distinguishCancelAndClose: true,
        lockScroll: true,
        closeOnClickModal: false,
        closeOnPressEscape: true,
      }
    );

    const site_id = websiteInfo?.site_id;
    if (!site_id) {
      ElMessage.error("未选择站点");
      return;
    }

    const res = await deleteContent({
      site_id,
      post_id: row.id,
      post_type: 'post',
    });

    if (res.code === 0) {
      ElMessage.success(res.message || "删除成功");
      await fetchList();
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error("删除失败：" + (error.message || "网络错误"));
    }
  }
}

// 查看详情
function viewDetail(row) {
  if (row.link || row.permalink) {
    window.open(row.link || row.permalink, '_blank');
  } else {
    ElMessage.info("暂无详情链接");
  }
}

// 跳转到上传页面
function goToUpload() {
  router.push({ name: "NewsUpload" });
}

// 分页处理
function handleSizeChange(val) {
  pageSize.value = val;
  currentPage.value = 1;
  fetchList();
}

function handleCurrentChange(val) {
  currentPage.value = val;
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
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
  background: #f0f9ff;
}

:deep(.el-table__row:hover td) {
  background: #f0f9ff;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}
</style>
