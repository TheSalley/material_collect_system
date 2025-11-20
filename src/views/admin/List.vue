<template>
    <el-table :data="tableData" border height="550" style="width: 100%">
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column prop="username" label="客户名称" width="180" />
        <el-table-column prop="demo" label="demo 名称" width="180" />
        <el-table-column prop="website" label="网址" />
        <el-table-column prop="status" label="状态" width="180" />
        <el-table-column fixed="right" label="操作" min-width="120">
            <template #default="scope">
                <el-button link type="primary" size="small" @click="edit(scope.row.id)">编辑</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>
<script setup>
import { reactive, onMounted } from 'vue';
import { getList } from '@/apis/index.js';
import { useRouter } from 'vue-router';

const tableData = reactive([]);

let pageList = reactive([]);

const router = useRouter();

onMounted(async () => {
   const list = await getList();
   tableData.push(...list);
});



function edit(id) {
    router.push({ path: '/detail', query: { id } });
    // router.push({ path: '/elementor', query: { id } });
    // console.log('编辑页面', id);
}
</script>