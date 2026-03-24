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
            placeholder="按用户名搜索（调用 /api/user/list?username=）"
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
            @click="openAddDrawer"
          >
            添加新用户
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
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
          <el-table-column prop="id" label="ID" width="100">
            <template #default="scope">
              <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ scope.row.id }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip>
            <template #default="scope">
              <div class="flex items-center gap-2">
                <el-icon class="text-blue-500 text-base flex-shrink-0"><UserFilled /></el-icon>
                <span class="font-medium text-gray-900 dark:text-white truncate">{{ scope.row.username || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="role" label="角色" width="100" align="center">
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
          
          <el-table-column prop="sites" label="站点" min-width="200" show-overflow-tooltip>
            <template #default="scope">
              <div v-if="scope.row.sites && scope.row.sites.length > 0" class="flex flex-wrap gap-1.5">
                <el-tag
                  v-for="site in scope.row.sites"
                  :key="site.site_id"
                  size="small"
                  effect="plain"
                  type="info"
                  class="flex items-center gap-1"
                >
                  <el-icon class="text-xs"><Link /></el-icon>
                  <span>{{ site.site_name || site.site_id }}</span>
                </el-tag>
              </div>
              <span v-else class="text-gray-400 dark:text-gray-500">-</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="is_deleted" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag 
                :type="scope.row.is_deleted === 0 ? 'success' : 'danger'"
                size="small"
                effect="dark"
                round
              >
                <el-icon class="mr-1">
                  <CircleCheck v-if="scope.row.is_deleted === 0" />
                  <CircleClose v-else />
                </el-icon>
                {{ scope.row.is_deleted === 0 ? "启用" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="created_at" label="创建时间" width="180" show-overflow-tooltip>
            <template #default="scope">
              <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                <el-icon class="text-gray-400 dark:text-gray-500 flex-shrink-0"><Clock /></el-icon>
                <span class="truncate">{{ formatDate(scope.row.created_at) }}</span>
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
          :page-size="20"
          :pager-count="11"
          layout="total, prev, pager, next, jumper"
          :total="tableData.length"
          background
        />
      </div>
    </div>

    <!-- 添加用户抽屉 -->
    <el-drawer
      v-model="addDrawer"
      title="添加新用户"
      direction="rtl"
      size="500px"
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <el-icon class="text-green-500 text-xl"><Plus /></el-icon>
          <span class="text-lg font-semibold text-gray-900 dark:text-white">添加新用户</span>
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
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="addForm.username"
              placeholder="请输入用户名"
              clearable
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="addForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              clearable
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select
              v-model="addForm.role"
              placeholder="请选择角色"
              class="w-full"
            >
              <el-option label="管理员" value="admin" />
              <el-option label="用户" value="user" />
            </el-select>
          </el-form-item>
          <el-form-item label="站点" prop="site_id" required>
            <el-select
              v-model="addForm.site_id"
              filterable
              clearable
              placeholder="请选择站点（必填）"
              class="w-full"
              :loading="siteListLoading"
            >
              <el-option
                v-for="site in siteList"
                :key="site.site_id"
                :label="`${site.site_name || site.site_id}${site.demo_site ? ' (' + site.demo_site + ')' : ''}`"
                :value="site.site_id"
              />
            </el-select>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              新增用户必须选择一个站点。
            </div>
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

    <!-- 编辑抽屉 -->
    <el-drawer 
      v-model="drawer" 
      title="编辑用户"
      direction="rtl"
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
          ref="editFormRef"
          :model="form"
          :rules="editFormRules"
          label-width="100px"
          class="py-5"
          label-position="left"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              clearable
              autocomplete="username"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="新密码">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="留空则不修改密码"
              show-password
              clearable
              autocomplete="new-password"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-select
              v-model="form.role"
              placeholder="请选择角色"
              class="w-full"
            >
              <el-option label="管理员" value="admin" />
              <el-option label="用户" value="user" />
            </el-select>
          </el-form-item>
          <el-form-item label="站点" prop="site_ids" required>
            <el-select
              v-model="form.site_ids"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择站点（可多选）"
              class="w-full"
              :loading="siteListLoading"
            >
              <el-option
                v-for="site in siteList"
                :key="site.site_id"
                :label="`${site.site_name || site.site_id}${site.demo_site ? ' (' + site.demo_site + ')' : ''}`"
                :value="site.site_id"
              />
            </el-select>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              至少选择一个站点；与列表接口返回的站点一致，可多选。
            </div>
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

    <!-- 删除确认：使用 Element Plus Dialog -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="440px"
      align-center
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
      @closed="onDeleteDialogClosed"
    >
      <div class="flex gap-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        <el-icon class="text-xl flex-shrink-0 text-amber-500 mt-0.5"><WarningFilled /></el-icon>
        <div>
          <p>
            确定要删除用户
            <strong class="text-gray-900 dark:text-white mx-1">{{ deleteTarget?.username || "—" }}</strong>
            吗？
          </p>
          <p class="mt-2 text-gray-500 dark:text-gray-400">删除后数据将按服务端规则处理，请谨慎操作。</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="closeDeleteDialog">取消</el-button>
          <el-button type="danger" :loading="deleteDeleting" @click="confirmDelete">
            确定删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import { getUserList, updateUser, createUser, getList, deleteUser } from "@/apis/index.js";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { 
  Search, Plus, Edit, Delete, Clock,
  User, UserFilled, CircleCheck, CircleClose, Check, Lock, Link, WarningFilled
} from '@element-plus/icons-vue';
import { useGlobalStore } from "@/stores/global.js";

const tableData = reactive([]);
const searchValue = ref("");
const loading = ref(false);
const saving = ref(false);

const router = useRouter();
const globalStore = useGlobalStore();

const drawer = ref(false);
const addDrawer = ref(false);

/** 删除确认弹窗（el-dialog） */
const deleteDialogVisible = ref(false);
const deleteTarget = ref(null);
const deleteDeleting = ref(false);
const addFormRef = ref(null);
const editFormRef = ref(null);
const addSaving = ref(false);
const siteList = ref([]);
const siteListLoading = ref(false);

const addForm = reactive({
  username: "",
  password: "",
  role: "user",
  site_id: "",
});

const addFormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, message: "用户名至少 2 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" },
  ],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  site_id: [{ required: true, message: "请选择站点", trigger: "change" }],
};

/** 编辑用户：对齐 POST /api/user/update（id、username、password?、role、site_ids） */
const form = reactive({
  id: "",
  username: "",
  password: "",
  role: "user",
  site_ids: [],
});

const editFormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, message: "用户名至少 2 个字符", trigger: "blur" },
  ],
  site_ids: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        if (!Array.isArray(value) || value.length === 0) {
          callback(new Error("请至少选择一个站点"));
        } else {
          callback();
        }
      },
      trigger: ["change", "blur"],
    },
  ],
};

// 搜索框防抖后调用 fetchUserList（GET /api/user/list?username=）
let searchDebounceTimer = null;
watch(searchValue, () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchUserList();
  }, 400);
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

// 获取站点列表（用于添加用户时选择站点）
async function fetchSiteList() {
  siteListLoading.value = true;
  try {
    const res = await getList();
    if (res.code === 0 && Array.isArray(res.data)) {
      siteList.value = res.data;
    } else {
      siteList.value = [];
    }
  } catch {
    siteList.value = [];
  } finally {
    siteListLoading.value = false;
  }
}

// 打开添加用户抽屉
async function openAddDrawer() {
  addForm.username = "";
  addForm.password = "";
  addForm.role = "user";
  addForm.site_id = "";
  addDrawer.value = true;
  await fetchSiteList();
  nextTick(() => {
    addFormRef.value?.clearValidate();
  });
}

// 提交添加用户
async function onAddSubmit() {
  if (!addFormRef.value) return;
  await addFormRef.value.validate(async (valid) => {
    if (!valid) return;
    addSaving.value = true;
    try {
      const payload = {
        username: addForm.username,
        password: addForm.password,
        role: addForm.role,
        site_ids: [String(addForm.site_id)],
      };
      const res = await createUser(payload);
      if (res.code === 0) {
        ElMessage.success("添加成功");
        fetchUserList();
      } else {
        ElMessage.error(res.message || "添加失败");
      }
    } catch (error) {
      ElMessage.error("添加失败：" + (error.message || "网络错误"));
    } finally {
      addSaving.value = false;
      addDrawer.value = false;
    }
  });
}

// 编辑用户（拉取站点列表并回填 site_ids）
async function edit(data) {
  form.id = data.id;
  form.username = data.username || "";
  form.password = "";
  form.role = data.role || "user";
  form.site_ids = Array.isArray(data.site_ids)
    ? data.site_ids.map((id) => String(id))
    : [];
  drawer.value = true;
  await fetchSiteList();
  nextTick(() => {
    editFormRef.value?.clearValidate();
  });
}

// 打开删除确认弹窗
function handleDelete(data) {
  deleteTarget.value = data;
  deleteDialogVisible.value = true;
}

function closeDeleteDialog() {
  deleteDialogVisible.value = false;
}

function onDeleteDialogClosed() {
  deleteTarget.value = null;
  deleteDeleting.value = false;
}

// 在弹窗内确认删除
async function confirmDelete() {
  const id = deleteTarget.value?.id;
  if (id == null) {
    closeDeleteDialog();
    return;
  }
  deleteDeleting.value = true;
  try {
    const res = await deleteUser(id);
    if (res.code === 0) {
      ElMessage.success(res.message || "删除成功");
      closeDeleteDialog();
      await fetchUserList();
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  } catch (error) {
    ElMessage.error("删除失败：" + (error?.message || "网络错误"));
  } finally {
    deleteDeleting.value = false;
  }
}

// 保存用户信息（POST /api/user/update）
async function onSubmit() {
  if (!editFormRef.value) return;
  try {
    await editFormRef.value.validate();
  } catch {
    return;
  }
  saving.value = true;
  try {
    const payload = {
      id: form.id != null && form.id !== "" ? String(form.id) : form.id,
      username: form.username,
      role: form.role,
      site_ids: (form.site_ids || []).map((id) => String(id)),
    };
    const pwd = form.password?.trim();
    if (pwd) {
      payload.password = pwd;
    }

    const res = await updateUser(payload);
    
    if (res.code === 0) {
      ElMessage.success(res.message || "保存成功");
      form.password = "";
      drawer.value = false;
      // 刷新列表
      await fetchUserList();
    } else {
      ElMessage.error(res.message || "保存失败");
    }
  } catch (error) {
    ElMessage.error("保存失败：" + (error.message || "网络错误"));
  } finally {
    saving.value = false;
  }
}

// 获取用户列表（有输入时带 username 查询参数，与接口文档一致）
async function fetchUserList() {
  loading.value = true;
  try {
    const username = searchValue.value?.trim();
    const params = username ? { username } : {};
    const res = await getUserList(params);
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
