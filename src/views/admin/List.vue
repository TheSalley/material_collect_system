<template>
    <div class="mx-auto w-full">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h1 class="text-[#111418] dark:text-white text-3xl font-bold leading-tight">客户管理</h1>
        </div>
        <div class="bg-white dark:bg-gray-900/50 rounded-lg shadow-sm">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex-1 min-w-[300px]">
                        <label class="relative block">
                            <span
                                class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                                <span class="material-symbols-outlined">search</span>
                            </span>
                            <input
                                class="w-full h-10 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent rounded-lg text-[#111418] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                placeholder="" type="text" />
                        </label>
                    </div>
                    <div class="flex items-center gap-3">
                        <button
                            class="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                            <span class="text-black">添加新客户</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="overflow-x-auto">
                <el-table :data="tableData" border height="350" style="width: 100%">
                    <el-table-column prop="id" label="ID" width="180" />
                    <el-table-column prop="username" label="客户名称" width="180" />
                    <el-table-column prop="demo" label="demo 名称" width="180" />
                    <el-table-column prop="url" label="网址" width="180" />
                    <el-table-column prop="status" label="状态" width="180" />
                    <el-table-column fixed="right" label="操作" min-width="120">
                        <template #default="scope">
                            <el-button link type="primary" size="small" @click="edit(scope.row)">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                    显示 <span class="font-semibold text-gray-900 dark:text-white">1-5</span> / <span
                        class="font-semibold text-gray-900 dark:text-white">100</span>
                </span>
                <div class="inline-flex -space-x-px rounded-lg text-sm h-9">
                    <a class="flex items-center justify-center px-3 h-9 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        href="#">上一页</a>
                    <a class="flex items-center justify-center px-4 h-9 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        href="#">1</a>
                    <a aria-current="page"
                        class="z-10 flex items-center justify-center px-4 h-9 text-primary border border-primary bg-primary/10 hover:bg-primary/20 dark:border-primary dark:text-white dark:bg-primary/50"
                        href="#">2</a>
                    <a class="flex items-center justify-center px-4 h-9 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        href="#">3</a>
                    <a class="flex items-center justify-center px-3 h-9 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        href="#">下一页</a>
                </div>
            </div>
        </div>
    </div>


</template>
<script setup>
import { reactive, onMounted } from 'vue';
import { getList } from '@/apis/index.js';
import { useRouter } from 'vue-router';
import { el } from 'element-plus/es/locales.mjs';
import { useGlobalStore } from "@/stores/global.js";

const tableData = reactive([]);

let pageList = reactive([]);

const router = useRouter();

onMounted(async () => {
    const res = await getList();
    if (res.code === 0) {
        tableData.push(...res.data);
    } else {
        if(res.code === 403) {
            ElMessage.error('账号已过期，请重新登录');
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/login');
        } else {
            console.error('获取列表失败:', res.message);
        }
    }
});



function edit(data) {
    const { setWebsiteInfo } = useGlobalStore();
    setWebsiteInfo(data);
    router.push({ path: '/detail', query: { id: data.id } });
    // router.push({ path: '/elementor', query: { id } });
    // console.log('编辑页面', id);
}
</script>