<template>
    <el-tabs class="w-full" v-model="activePage" v-if="pageList.length">
        <el-tab-pane :label="page.post_name" :name="page.post_name" v-for="page in pageList" :key="page.id">
            <template v-if="user.mode === 1">
                <TW :pageId="page.id" />
            </template>
            <template v-else>
                <PageMode />
            </template>
        </el-tab-pane>
    </el-tabs>
    <el-empty description="无可编辑页面" v-else />
</template>
<script setup>
import { ref, reactive } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import TW from "@/components/TW.vue";
import PageMode from "@/components/PageMode.vue";


const activePage = ref("home");
let pageList = reactive([]);
const { user } = useGlobalStore();
pageList = JSON.parse(user.page_list);
</script>
