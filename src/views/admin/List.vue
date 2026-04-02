<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面标题区域 -->
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex flex-col gap-2">
        <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
          <el-icon class="text-blue-500 text-4xl"><UserFilled /></el-icon>
          站点管理
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">管理和配置所有客户站点信息</p>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="flex-1 flex flex-col m-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0">
      <!-- 工具栏 -->
      <div class="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <div class="flex-1">
          <el-input
            v-model="searchValue"
            class="w-full max-w-md"
            size="large"
            placeholder="搜索站点名称、网址或 demo 名称..."
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
        <div class="flex items-center gap-3">
          <el-button 
            type="primary" 
            size="large"
            :icon="Plus"
            @click="openAddDrawer"
          >
            添加站点
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="flex-1 overflow-auto min-h-0 overflow-x-hidden">
        <el-table 
          :data="filteredTableData" 
          :stripe="true"
          :highlight-current-row="true"
          class="w-full"
          empty-text="暂无数据"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="site_id" label="ID" width="280">
            <template #default="scope">
              <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ scope.row.site_id }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="wp_auth_token" label="Token" width="280">
            <template #default="scope">
              <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ scope.row.wp_auth_token }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="site_name" label="站点名称" min-width="150" show-overflow-tooltip>
            <template #default="scope">
              <div class="flex items-center gap-2">
                <el-icon class="text-blue-500 text-base flex-shrink-0"><Link /></el-icon>
                <span class="font-medium text-gray-900 dark:text-white truncate">{{ scope.row.site_name || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="demo_site" label="Demo 名称" width="120">
            <template #default="scope">
              <el-tag v-if="scope.row.demo_site" size="small" effect="plain">
                {{ scope.row.demo_site }}
              </el-tag>
              <span v-else class="text-gray-400 dark:text-gray-500">-</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="wp_base_url" label="网址" min-width="200" show-overflow-tooltip>
            <template #default="scope">
              <a 
                :href="scope.row.wp_base_url" 
                target="_blank" 
                class="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 hover:underline transition-colors truncate"
              >
                <el-icon><Link /></el-icon>
                <span class="truncate">{{ scope.row.wp_base_url }}</span>
              </a>
            </template>
          </el-table-column>
          
          <!-- 隐藏站点状态字段 -->
          <!-- <el-table-column prop="site_status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag 
                :type="scope.row.site_status === 0 ? 'success' : 'warning'"
                size="small"
                effect="dark"
                round
              >
                <el-icon class="mr-1">
                  <CircleCheck v-if="scope.row.site_status === 0" />
                  <CircleClose v-else />
                </el-icon>
                {{ scope.row.site_status === 0 ? "可上线" : "建站中" }}
              </el-tag>
            </template>
          </el-table-column> -->
          
          <el-table-column prop="is_deleted" label="删除状态" width="100" align="center" v-if="false">
            <template #default="scope">
              <el-tag 
                :type="scope.row.is_deleted === 0 ? 'success' : 'danger'"
                size="small"
                effect="plain"
              >
                {{ scope.row.is_deleted === 0 ? "正常" : "已删除" }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="updated_at" label="创建时间" width="280">
            <template #default="scope">
              <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon class="text-gray-400 dark:text-gray-500"><Clock /></el-icon>
                <span>{{ formatDate(scope.row.updated_at) }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column fixed="right" label="操作" width="200" align="center">
            <template #default="scope">
              <div class="flex gap-2 justify-center">
                <el-button
                  type="success"
                  size="small"
                  :icon="Setting"
                  link
                  @click="config(scope.row)"
                >
                  配置
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
      </div>

      <!-- 分页 -->
      <div class="flex justify-end px-6 py-5 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <el-pagination
          :page-size="20"
          :pager-count="11"
          layout="total, prev, pager, next, jumper"
          :total="filteredTableData.length"
          background
        />
      </div>
    </div>
  </div>

  <!-- 添加站点抽屉 -->
  <el-drawer
    v-model="addDrawer"
    title="添加站点"
    direction="rtl"
    size="500px"
    :close-on-click-modal="false"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <el-icon class="text-green-500 text-xl"><Plus /></el-icon>
        <span class="text-lg font-semibold text-gray-900 dark:text-white">添加站点</span>
      </div>
    </template>
    <template #default>
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        class="py-5"
        label-position="left"
      >
        <el-form-item label="站点名称" prop="site_name">
          <el-input
            v-model="addForm.site_name"
            placeholder="请输入站点名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="Demo 名称" prop="demo_site">
          <el-input
            v-model="addForm.demo_site"
            placeholder="请输入 Demo 名称"
            clearable
          />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-600">
        <el-button @click="addDrawer = false" size="large">取消</el-button>
        <el-button type="primary" @click="onAddSubmit" size="large" :icon="Check" :loading="addSaving">
          确定添加
        </el-button>
      </div>
    </template>
  </el-drawer>

</template>
<script setup>
import { ref, reactive, onMounted, computed, nextTick } from "vue";
import { getList, createSite, deleteSite } from "@/apis/index.js";
import { ElMessage, ElMessageBox } from "element-plus";
import "element-plus/theme-chalk/el-message-box.css";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global.js";
import { 
  Search, Plus, Setting, Link, Clock, Delete,
  UserFilled, CircleCheck, CircleClose, Check, Grid, Document
} from '@element-plus/icons-vue';

const tableData = reactive([]);
const searchValue = ref("");
const loading = ref(false);

// 过滤后的表格数据（前端过滤，如果使用后端搜索则不需要）
const filteredTableData = computed(() => {
  // 如果使用后端搜索，直接返回 tableData
  // 如果需要前端过滤，可以保留此逻辑
  return tableData;
});

let pageList = reactive([]);

const addDrawer = ref(false);
const addFormRef = ref(null);
const addSaving = ref(false);

const addForm = reactive({
  site_name: "",
  demo_site: "",
});

const addFormRules = {
  site_name: [
    { required: true, message: "请输入站点名称", trigger: "blur" },
    { min: 1, message: "站点名称不能为空", trigger: "blur" },
  ],
  demo_site: [
    { required: true, message: "请输入 Demo 名称", trigger: "blur" },
    { min: 1, message: "Demo 名称不能为空", trigger: "blur" },
  ],
};

const router = useRouter();

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

// 删除站点
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除站点 "${row.site_name || row.site_id}" 吗？此操作不可恢复。`,
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
    
    const res = await deleteSite(row.site_id);
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

async function fetchList() {
  loading.value = true;
  try {
    // 根据 API 文档，可以使用 keyword 参数进行搜索
    const params = searchValue.value ? { keyword: searchValue.value } : {};
    const res = await getList(params);
    if (res.code === 0) {
      tableData.length = 0;
      const list = res.data || [];
      // 根据 API 文档，站点列表返回的字段是 site_id, site_name, site_status, wp_base_url 等
      tableData.push(...list);
    }
    return res;
  } catch (error) {
    ElMessage.error("获取站点列表失败：" + (error.message || "网络错误"));
    return { code: -1, message: error.message };
  } finally {
    loading.value = false;
  }
}

function openAddDrawer() {
  addForm.site_name = "";
  addForm.demo_site = "";
  addDrawer.value = true;
  nextTick(() => {
    addFormRef.value?.clearValidate();
  });
}

async function onAddSubmit() {
  if (!addFormRef.value) return;
  await addFormRef.value.validate(async (valid) => {
    if (!valid) return;
    addSaving.value = true;
    try {
      const res = await createSite({
        site_name: addForm.site_name,
        demo_site: addForm.demo_site,
      });
      if (res.code === 0) {
        ElMessage.success(res.message || "创建成功");
        addDrawer.value = false;
        await fetchList();
      } else {
        ElMessage.error(res.message || "创建失败");
      }
    } catch (error) {
      ElMessage.error("创建失败：" + (error.message || "网络错误"));
    } finally {
      addSaving.value = false;
    }
  });
}

onMounted(() => {
  fetchList();
});

function config(data) {
  const { setWebsiteInfo } = useGlobalStore();
  setWebsiteInfo(data);
  router.push({ name: "AdminDetail", query: { id: data.site_id } });
}
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

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
