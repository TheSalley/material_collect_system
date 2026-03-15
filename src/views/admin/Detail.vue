<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面头部 -->
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600 px-6 py-4 flex-shrink-0">
      <div class="flex justify-between items-center w-full">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <el-icon class="text-blue-500 text-2xl"><UserFilled /></el-icon>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">客户详情</h1>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <a 
              href="#" 
              @click.prevent="router.push({ name: 'AdminList' })"
              class="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <el-icon><House /></el-icon>
              站点管理
            </a>
            <el-icon class="text-gray-400 dark:text-gray-500"><ArrowRight /></el-icon>
            <span class="text-gray-700 dark:text-gray-300 font-medium">{{ websiteInfo.nickname || '客户详情' }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <el-button 
            :icon="ArrowLeft"
            @click="router.push({ name: 'AdminList' })"
          >
            返回
          </el-button>
          <el-button 
            type="primary"
            :icon="Check"
            @click="handleSave"
            size="large"
          >
            保存更改
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="flex-1 overflow-auto min-h-0">
      <div class="p-6 space-y-6">
        <!-- 客户信息卡片 -->
        <div class="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <el-icon class="text-blue-500"><InfoFilled /></el-icon>
            客户信息
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon><User /></el-icon>
                <span>客户名称</span>
              </div>
              <p class="text-gray-900 dark:text-white text-base font-medium">
                {{ websiteInfo.nickname || '-' }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon><Key /></el-icon>
                <span>客户ID</span>
              </div>
              <p class="text-gray-900 dark:text-white text-base font-medium font-mono">
                {{ websiteInfo.id || '-' }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon><CircleCheck /></el-icon>
                <span>账户状态</span>
              </div>
              <div class="flex items-center gap-2">
                <span 
                  :class="[
                    'w-2.5 h-2.5 rounded-full',
                    websiteInfo.status === 1 ? 'bg-green-500' : 'bg-red-500'
                  ]"
                ></span>
                <el-tag 
                  :type="websiteInfo.status === 1 ? 'success' : 'danger'"
                  size="small"
                  effect="dark"
                  round
                >
                  {{ websiteInfo.status === 1 ? '正常' : '禁用' }}
                </el-tag>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon><Calendar /></el-icon>
                <span>到期时间</span>
              </div>
              <p class="text-gray-900 dark:text-white text-base font-medium">
                2025-12-31
              </p>
            </div>
          </div>
        </div>

        <!-- 页面设置区域 -->
        <div class="flex flex-col">
          <div class="border-b border-gray-200 dark:border-gray-600 mb-6">
            <nav class="flex space-x-8">
              <div class="flex items-center gap-2 border-b-2 border-blue-500 px-1 pb-4">
                <el-icon class="text-blue-500"><Document /></el-icon>
                <span class="text-base font-semibold text-blue-500">页面设置</span>
              </div>
            </nav>
          </div>

          <!-- 页面列表表格 -->
          <div class="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div class="overflow-x-auto">
              <el-table 
                :data="pageList" 
                :stripe="true"
                :highlight-current-row="true"
                class="w-full"
                empty-text="暂无页面数据"
              >
                <el-table-column prop="ID" label="ID" width="180">
                  <template #default="scope">
                    <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ scope.row.ID }}</span>
                  </template>
                </el-table-column>
                
                <el-table-column prop="post_name" label="页面名称" min-width="200">
                  <template #default="scope">
                    <div class="flex items-center gap-2">
                      <el-icon class="text-blue-500"><Document /></el-icon>
                      <span class="font-medium text-gray-900 dark:text-white">{{ scope.row.post_name || '-' }}</span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="状态" width="120" align="center">
                  <template #default="scope">
                    <el-tag 
                      :type="scope.row.status ? 'success' : 'danger'"
                      size="small"
                      effect="dark"
                      round
                    >
                      <el-icon class="mr-1">
                        <CircleCheck v-if="scope.row.status" />
                        <CircleClose v-else />
                      </el-icon>
                      {{ scope.row.status ? "启用" : "禁用" }}
                    </el-tag>
                  </template>
                </el-table-column>
                
                <el-table-column fixed="right" label="操作" width="200" align="center">
                  <template #default="scope">
                    <div class="flex items-center justify-center gap-3">
                      <el-switch 
                        v-model="scope.row.status"
                        :active-color="'#13ce66'"
                        :inactive-color="'#ff4949'"
                      />
                      <el-button 
                        type="primary" 
                        size="small"
                        :icon="Edit"
                        @click="edit(scope.row)"
                      >
                        编辑
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { getPages, updateUserPageList } from "@/apis/index.js";
import { useRouter } from "vue-router";
import ModuleMode from "@/components/ModuleMode.vue";
import { useGlobalStore } from "@/stores/global.js";
import {
  UserFilled, ArrowLeft, ArrowRight, Check, House,
  InfoFilled, User, Key, CircleCheck, CircleClose,
  Calendar, Document, Edit
} from '@element-plus/icons-vue';

const { user, setUser } = useGlobalStore();

let pageList = reactive([]);
const activePage = ref("test");
const router = useRouter();

const { websiteInfo, setWebsiteInfo } = useGlobalStore();

onMounted(async () => {
  const res = await getPages(websiteInfo.site_id);
  if (res.code === 0) {
    pageList.push(...res.data);
  }
});

const transform_page_list = computed(() => {
  let arr = [];
  // let user_page_list = JSON.parse(websiteInfo.page_list);
  // pageList.forEach((item) => {
  //   if (user_page_list.find(i => i.id === item.id)) {
  //     arr.unshift({
  //       id: item.id,
  //       post_name: item.post_name,
  //       status: true,
  //     });
  //   } else {
  //     arr.push({
  //       id: item.id,
  //       post_name: item.post_name,
  //       status: false,
  //     });
  //   }
  // });
  return arr;
});


function edit(row) {
  // 根据用户角色决定跳转路径
  const role = (user?.role ?? "user").toString().toLowerCase();
  if (role === "admin") {
    // admin 用户跳转到 /admin/pages/:id
    router.push({ path: `/admin/pages/${row.ID}` });
  } else {
    // user 用户跳转到 /pages/:id
    router.push({ path: `/pages/${row.ID}` });
  }
}

async function handleSave() {
  const res = await updateUserPageList({
    id: websiteInfo.id,
    page_list: JSON.stringify(transform_page_list.value.filter(item => item.status).map(item => { return { id: item.id, post_name: item.post_name } })),
  });
  if (res.code === 0) {
    setWebsiteInfo({
      ...websiteInfo,
      page_list: res.data.page_list,
    })
    ElMessage.success("更新成功");
  } else {
    ElMessage.error("更新失败");
  }
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
</style>
