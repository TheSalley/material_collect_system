<template>
  <main class="flex-1 flex flex-col">
    <header
      class="bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-sm sticky top-0 z-10 px-6 lg:px-8 border-b border-border-light dark:border-border-dark h-[6.25rem] flex items-center">
      <div class="flex justify-between items-center w-full">
        <div class="flex flex-col gap-1">
          <p class="text-xl font-semibold text-gray-900 dark:text-white">
            客户详情
          </p>
          <div class="flex flex-wrap gap-1.5 items-center">
            <a class="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary"
              href="#">客户管理</a>
            <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-base"
              style="font-size: 16px">></span>
            <span class="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal">{{ websiteInfo.nickname }}</span>
          </div>
        </div>
        <div class="flex gap-4">
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal tracking-wide hover:bg-gray-200 transition-colors">
            <span class="truncate">返回</span>
          </button>
          <button
            @click="handleSave"
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#2b7cee] text-white text-sm font-medium leading-normal tracking-wide hover:bg-primary/90 transition-colors gap-2">
            <span class="truncate">保存更改</span>
          </button>
        </div>
      </div>
    </header>
    <div class="p-6 lg:p-8 flex-1 space-y-8">
      <div class="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          <div class="flex flex-col gap-1.5">
            <p class="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
              客户名称
            </p>
            <p class="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal">
              {{ websiteInfo.nickname }}
            </p>
          </div>
          <div class="flex flex-col gap-1.5">
            <p class="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
              客户ID
            </p>
            <p class="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal">
              {{ websiteInfo.id }}
            </p>
          </div>
          <div class="flex flex-col gap-1.5">
            <p class="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
              账户状态
            </p>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <p class="text-green-600 dark:text-green-400 text-base font-medium leading-normal">
                {{ websiteInfo.status === 1 ? '正常' : '禁用' }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <p class="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
              到期时间
            </p>
            <p class="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal">
              2025-12-31
            </p>
          </div>
        </div>
      </div>
      <div class="flex flex-col">
        <div class="border-b border-border-light dark:border-border-dark">
          <nav aria-label="Tabs" class="-mb-px flex space-x-8">
            <a aria-current="page"
              class="shrink-0 border-b-2 border-primary px-1 pb-4 text-base font-semibold text-primary"
              href="#">页面设置</a>
          </nav>
        </div>
        <div class="pt-8">
          <div
            class="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
            <div class="overflow-x-auto">
              <el-table :data="transform_page_list" style="width: 100%">
                <el-table-column prop="id" label="ID" width="180" />
                <el-table-column prop="post_name" label="Post Name" width="180" />
                <el-table-column fixed="right" label="状态" min-width="120">
                  <template #default="scope">
                    <el-tag :type="scope.row.status ? 'success' : 'danger'">{{
                      scope.row.status ? "启用" : "禁用"
                    }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" min-width="120">
                  <template #default="scope">
                    <el-switch v-model="scope.row.status"
                      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
                    <el-button type="primary" size="small" @click="edit(scope.row)">编辑</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { getPages, updateUserPageList } from "@/apis/index.js";
import { useRouter } from "vue-router";
import TW from "@/components/TW.vue";
import { useGlobalStore } from "@/stores/global.js";
const { user, setUser } = useGlobalStore();

let pageList = reactive([]);
const activePage = ref("test");
const router = useRouter();

const { websiteInfo, setWebsiteInfo } = useGlobalStore();

onMounted(async () => {
  const res = await getPages();
  if (res.code === 0) {
    pageList.push(...res.data);
  }
});

const transform_page_list = computed(() => {
  let arr = [];
  let user_page_list = JSON.parse(websiteInfo.page_list);
  pageList.forEach((item) => {
    if (user_page_list.find(i => i.id === item.id)) {
      arr.unshift({
        id: item.id,
        post_name: item.post_name,
        status: true,
      });
    } else {
      arr.push({
        id: item.id,
        post_name: item.post_name,
        status: false,
      });
    }
  });
  return arr;
});


function edit(row) {
  router.push({ path: `/pages/${row.id}` });
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
