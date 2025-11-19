<template>
  <el-tabs v-model="activePage">
    <el-tab-pane
      :label="page.post_name"
      :name="page.post_name"
      v-for="page in pageList"
      :key="page.id"
    >
      <!-- <keep-alive> -->
        <TW :pageId="page.id" />
      <!-- </keep-alive> -->
    </el-tab-pane>
  </el-tabs>
</template>
<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { getPages } from "@/apis/wp.js";
import TW from "@/components/TW.vue";

let pageList = reactive([]);
const activePage = ref("a-test");

onMounted(async () => {
  const res = await getPages();
  if (res.code === 0) {
    pageList.push(...res.data);
  }
});
</script>
