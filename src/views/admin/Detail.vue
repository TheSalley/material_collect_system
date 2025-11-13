<template>
    <el-tabs v-model="activePage">
        <el-tab-pane :label="page.post_title" :name="page.post_title" v-for="page in pageList" :key="page.id">
            <keep-alive>
                <TW :pageId="page.ID" />
            </keep-alive>
        </el-tab-pane>
    </el-tabs>
</template>
<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { getPages, getPageById } from '@/apis/index.js';
import { useRouter } from 'vue-router';
import TW from '@/components/TW.vue';

let pageList = reactive([]);
const activePage = ref('home');

const router = useRouter();


onMounted(async () => {
    const pages = await getPages();
    console.log(pages);
    pageList.push(...pages);

});
</script>