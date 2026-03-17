<template>
  <div class="product-panel">
    <div v-if="showHeader" class="px-6 pt-6 flex-shrink-0">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
            <el-icon class="text-blue-500 text-4xl"><Box /></el-icon>
            产品列表
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">管理和查看所有产品信息</p>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <el-button v-if="showAddButton" type="primary" :icon="Plus" @click="goToUpload">
            添加产品
          </el-button>
        </div>
      </div>
    </div>

    <div :class="cardClass">
      <!-- 工具栏（预留搜索，但当前 product_list 示例未包含 search 参数） -->
      <div class="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          产品
        </div>
        <div v-if="!showHeader && showAddButton" class="flex items-center gap-2">
          <el-button type="primary" :icon="Plus" @click="goToUpload">添加产品</el-button>
        </div>
      </div>

      <div class="flex-1 overflow-auto min-h-0 overflow-x-hidden">
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
              <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="title" label="产品名称" min-width="260" show-overflow-tooltip>
            <template #default="scope">
              <span class="font-medium text-gray-900 dark:text-white">{{ scope.row.title || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column fixed="right" label="操作" width="140" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                link
                @click="goToView(scope.row)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="flex justify-end px-6 py-5 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { getProductList } from "@/apis/index.js";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global.js";
import { Box, Plus, Clock } from "@element-plus/icons-vue";

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  showAddButton: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: "publish",
  },
});

const router = useRouter();
const { websiteInfo } = useGlobalStore();

const tableData = reactive([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

const showHeader = computed(() => !props.embedded);

const cardClass = computed(() => {
  if (props.embedded) {
    return "bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden min-h-0 flex flex-col";
  }
  return "flex-1 flex flex-col m-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0";
});

async function fetchList() {
  const site_id = websiteInfo?.site_id;
  if (!site_id) {
    ElMessage.warning("请先选择站点");
    return;
  }

  loading.value = true;
  try {
    const res = await getProductList({
      site_id,
      page: currentPage.value,
      page_size: pageSize.value,
      status: props.status,
    });
    if (res?.code === 0) {
      const list = res.data?.list || [];
      tableData.length = 0;
      tableData.push(...list);
      total.value = Number(res.data?.total ?? list.length);
    } else {
      ElMessage.error(res?.message || "获取产品列表失败");
    }
  } catch (e) {
    ElMessage.error("获取产品列表失败：" + (e?.message || "网络错误"));
  } finally {
    loading.value = false;
  }
}

function handleSizeChange(val) {
  pageSize.value = val;
  currentPage.value = 1;
  fetchList();
}

function handleCurrentChange(val) {
  currentPage.value = val;
  fetchList();
}

function goToUpload() {
  router.push({ name: "ProductUpload" });
}

function goToView(row) {
  if (!row?.id) return;
  // 复用产品上传页布局：以查看模式打开
  router.push({ name: "ProductUpload", query: { id: String(row.id), mode: "view" } });
}

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.product-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>

