<template>
    <view class="flex flex-column">
        <view class="flex justify-between" v-for="page in pageList" :key="page.id">
            <span>{{ page.post_title }}</span>
            <el-button type="primary" @click="edit(page.ID)">编辑页面</el-button> 
        </view>
    </view>
</template>
<script setup>
import { reactive, onMounted } from 'vue';
import { getPages } from '@/apis/index.js';
import { useRouter } from 'vue-router';

let pageList = reactive([]);

const router = useRouter();

onMounted(async () => {
    const pages = await getPages();
    console.log(pages);
    pageList.push(...pages);

});



function edit(id) {
    router.push({ path: '/elementor', query: { id } });
    console.log('编辑页面', id);
}
</script>