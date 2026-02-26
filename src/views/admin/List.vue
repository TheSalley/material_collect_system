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
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="flex items-center gap-3">
          <el-button 
            type="primary" 
            size="large"
            :icon="Plus"
            disabled
          >
            添加新客户
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="flex-1 overflow-auto min-h-0">
        <el-table 
          :data="filteredTableData" 
          :stripe="true"
          :highlight-current-row="true"
          class="w-full"
          empty-text="暂无数据"
        >
          <el-table-column prop="site_id" label="ID" width="200">
            <template #default="scope">
              <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ scope.row.site_id }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="site_name" label="站点名称" min-width="200">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <el-icon class="text-blue-500 text-base"><Link /></el-icon>
                <span class="font-medium text-gray-900 dark:text-white">{{ scope.row.site_name || '-' }}</span>
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
          
          <el-table-column prop="wp_base_url" label="网址" min-width="200">
            <template #default="scope">
              <a 
                :href="scope.row.wp_base_url" 
                target="_blank" 
                class="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 hover:underline transition-colors"
              >
                <el-icon><Link /></el-icon>
                <span>{{ scope.row.wp_base_url }}</span>
              </a>
            </template>
          </el-table-column>
          
          <el-table-column prop="mode" label="模式" width="100" align="center">
            <template #default="scope">
              <el-tag 
                :type="scope.row.mode === 1 ? 'warning' : 'info'"
                size="small"
                effect="dark"
              >
                {{ scope.row.mode === 1 ? "组件" : "页面" }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                size="small"
                effect="dark"
                round
              >
                <el-icon class="mr-1">
                  <CircleCheck v-if="scope.row.status === 1" />
                  <CircleClose v-else />
                </el-icon>
                {{ scope.row.status === 1 ? "启用" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="updated_at" label="创建时间" width="180">
            <template #default="scope">
              <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon class="text-gray-400 dark:text-gray-500"><Clock /></el-icon>
                <span>{{ formatDate(scope.row.updated_at) }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column fixed="right" label="操作" width="160" align="center">
            <template #default="scope">
              <div class="flex gap-2 justify-center">
                <el-button
                  type="primary"
                  size="small"
                  :icon="Edit"
                  link
                  @click="edit(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  :icon="Setting"
                  link
                  @click="config(scope.row)"
                >
                  配置
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

  <el-drawer 
    v-model="drawer" 
    title="客户配置"
    size="500px"
    :close-on-click-modal="false"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <el-icon class="text-blue-500 text-xl"><Setting /></el-icon>
        <span class="text-lg font-semibold text-gray-900 dark:text-white">编辑客户信息</span>
      </div>
    </template>
    <template #default>
      <el-form 
        :model="form" 
        label-width="100px" 
        class="py-5"
        label-position="left"
      >
        <el-form-item label="客户名称">
          <el-input 
            v-model="form.username" 
            placeholder="请输入客户名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="Demo 名称">
          <el-input 
            v-model="form.demo" 
            placeholder="请输入 demo 名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="网址">
          <el-input 
            v-model="form.url" 
            placeholder="https://example.com"
            clearable
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="模式">
          <el-radio-group v-model="form.mode">
            <el-radio :value="1">
              <el-icon><Grid /></el-icon>
              组件
            </el-radio>
            <el-radio :value="2">
              <el-icon><Document /></el-icon>
              页面
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch 
            v-model="form.status"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-600">
        <el-button @click="drawer = false" size="large">取消</el-button>
        <el-button type="primary" @click="onSubmit" size="large" :icon="Check">
          保存
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { getList, updateUser } from "@/apis/index.js";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global.js";
import { 
  Search, Plus, Edit, Setting, Link, Clock, 
  UserFilled, CircleCheck, CircleClose, Check, Grid, Document
} from '@element-plus/icons-vue';

const tableData = reactive([]);
const searchValue = ref("");

// 过滤后的表格数据
const filteredTableData = computed(() => {
  if (!searchValue.value) {
    return tableData;
  }
  const keyword = searchValue.value.toLowerCase();
  return tableData.filter(item => 
    (item.site_name && item.site_name.toLowerCase().includes(keyword)) ||
    (item.wp_base_url && item.wp_base_url.toLowerCase().includes(keyword)) ||
    (item.demo_site && item.demo_site.toLowerCase().includes(keyword))
  );
});

let pageList = reactive([]);

const drawer = ref(false);

const router = useRouter();

const { setUser } = useGlobalStore();

const form = reactive({
  id: "",
  username: "",
  demo: "",
  url: "",
  mode: 2,
  status: true,
});

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

async function onSubmit() {
  if(form.url.endsWith('/')) {
    return ElMessage.error("网址不能以斜杠结尾");
  }
  const res = await updateUser({
    id: form.id,
    username: form.username,
    demo: form.demo,
    url: form.url,
    mode: form.mode,
    status: form.status ? 1 : 2,
  });
  if (res.code === 0) {
    ElMessage({
      message: "保存成功",
      type: "success",
    });
    tableData.forEach((item, index) => {
      if (item.id == res.data.id) {
        tableData[index] = res.data;
      }
    });
    setUser(res.data);
    drawer.value = false;
  } else {
    ElMessage({
      message: "保存失败",
      type: "error",
    });
  }
}

onMounted(async () => {
  const res = await getList();
  if (res.code === 0) {
    res.data.forEach(i => i.mode = 2); // 临时修改
    tableData.push(...res.data);
  } else {
    if (res.code === 401) {
      ElMessage.error("账号已过期，请重新登录");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/login");
    } else {
    }
  }
});

function edit(data) {
  form.id = data.id;
  form.username = data.username;
  form.demo = data.demo;
  form.url = data.url;
  form.mode = data.mode;
  form.status = data.status === 1 ? true : false;
  drawer.value = true;
}

function config(data) {
  const { setWebsiteInfo } = useGlobalStore();
  setWebsiteInfo(data);
  router.push({ path: "/detail", query: { id: data.id } });
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
