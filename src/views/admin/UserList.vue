<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面标题区域 -->
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex flex-col gap-2">
        <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
          <el-icon class="text-blue-500 text-4xl"><User /></el-icon>
          用户管理
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">管理系统中的所有用户账户信息</p>
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
            placeholder="搜索用户名、邮箱或角色..."
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
            添加新用户
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
          v-loading="loading"
        >
          <el-table-column prop="id" label="ID" width="100">
            <template #default="scope">
              <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ scope.row.id }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="username" label="用户名" width="150">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <el-icon class="text-blue-500 text-base"><UserFilled /></el-icon>
                <span class="font-medium text-gray-900 dark:text-white">{{ scope.row.username || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="role" label="角色" width="120" align="center">
            <template #default="scope">
              <el-tag 
                :type="scope.row.role === 'admin' ? 'danger' : 'info'"
                size="small"
                effect="dark"
              >
                {{ scope.row.role === 'admin' ? '管理员' : '客户' }}
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
          
          <el-table-column prop="created_at" label="创建时间" width="280">
            <template #default="scope">
              <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon class="text-gray-400 dark:text-gray-500"><Clock /></el-icon>
                <span>{{ formatDate(scope.row.created_at) }}</span>
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
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :pager-count="11"
          layout="total, prev, pager, next, jumper"
          :total="filteredTableData.length"
          background
        />
      </div>
    </div>

    <!-- 编辑抽屉 -->
    <el-drawer 
      v-model="drawer" 
      title="编辑用户"
      size="500px"
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <el-icon class="text-blue-500 text-xl"><Edit /></el-icon>
          <span class="text-lg font-semibold text-gray-900 dark:text-white">编辑用户信息</span>
        </div>
      </template>
      <template #default>
        <el-form 
          :model="form" 
          label-width="100px" 
          class="py-5"
          label-position="left"
        >
          <el-form-item label="用户名">
            <el-input 
              v-model="form.username" 
              placeholder="请输入用户名"
              clearable
              :disabled="true"
            />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input 
              v-model="form.email" 
              placeholder="请输入邮箱"
              clearable
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="昵称">
            <el-input 
              v-model="form.nickname" 
              placeholder="请输入昵称"
              clearable
            />
          </el-form-item>
          <el-form-item label="角色">
            <el-select 
              v-model="form.role" 
              placeholder="请选择角色"
              class="w-full"
            >
              <el-option label="管理员" value="administrator" />
              <el-option label="客户" value="customer" />
            </el-select>
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
          <el-button type="primary" @click="onSubmit" size="large" :icon="Check" :loading="saving">
            保存
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { getUserList, updateUser } from "@/apis/index.js";
import { useRouter } from "vue-router";
import { 
  Search, Plus, Edit, Delete, Clock, 
  User, UserFilled, CircleCheck, CircleClose, Check, Message
} from '@element-plus/icons-vue';

const tableData = reactive([]);
const searchValue = ref("");
const loading = ref(false);
const saving = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);

const router = useRouter();

const drawer = ref(false);

const form = reactive({
  id: "",
  username: "",
  email: "",
  nickname: "",
  role: "customer",
  status: true,
});

// 过滤后的表格数据
const filteredTableData = computed(() => {
  if (!searchValue.value) {
    return tableData;
  }
  const keyword = searchValue.value.toLowerCase();
  return tableData.filter(item => 
    (item.username && item.username.toLowerCase().includes(keyword)) ||
    (item.email && item.email.toLowerCase().includes(keyword)) ||
    (item.role && item.role.toLowerCase().includes(keyword)) ||
    (item.nickname && item.nickname.toLowerCase().includes(keyword))
  );
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

// 编辑用户
function edit(data) {
  form.id = data.id;
  form.username = data.username || '';
  form.email = data.email || '';
  form.nickname = data.nickname || '';
  form.role = data.role || 'customer';
  form.status = data.status === 1 ? true : false;
  drawer.value = true;
}

// 删除用户
async function handleDelete(data) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${data.username}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // TODO: 调用删除 API
    ElMessage.success('删除功能待实现');
  } catch {
    // 用户取消删除
  }
}

// 保存用户信息
async function onSubmit() {
  saving.value = true;
  try {
    const res = await updateUser({
      id: form.id,
      username: form.username,
      email: form.email,
      nickname: form.nickname,
      role: form.role,
      status: form.status ? 1 : 2,
    });
    
    if (res.code === 0) {
      ElMessage({
        message: "保存成功",
        type: "success",
      });
      
      // 更新表格数据
      const index = tableData.findIndex(item => item.id === form.id);
      if (index !== -1) {
        Object.assign(tableData[index], res.data);
      }
      
      drawer.value = false;
    } else {
      ElMessage({
        message: res.message || "保存失败",
        type: "error",
      });
    }
  } catch (error) {
    ElMessage({
      message: "保存失败：" + error.message,
      type: "error",
    });
  } finally {
    saving.value = false;
  }
}

// 获取用户列表
async function fetchUserList() {
  loading.value = true;
  try {
    const res = await getUserList();
    if (res.code === 0) {
      tableData.length = 0;
      tableData.push(...(res.data || []));
    } else {
      ElMessage({
        message: res.message || "获取用户列表失败",
        type: "error",
      });
    }
  } catch (error) {
    ElMessage({
      message: "获取用户列表失败：" + error.message,
      type: "error",
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchUserList();
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
