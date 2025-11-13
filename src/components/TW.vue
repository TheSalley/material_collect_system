<template>
  <div
    style="
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      height: 100%;
    "
  >
    <div style="width: 50%; background-color: bisque; align-self: stretch">
      图片
    </div>
    <div style="width: 50%; background-color: #f0f2f5; align-self: stretch">
      <div v-if="state?.pageData?.post_id">
        <div v-for="(part, index) in JSON.parse(state.pageData.meta_value)" :key="index">
            板块-{{ index }}
        </div>
      </div>
      <div v-else>
        非Elementor
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, onMounted } from "vue";
import { getPageById } from "@/apis/index.js";

const props = defineProps({
  pageId: {
    type: Number,
    required: true,
  },
});

const state = reactive({
  pageData: null,
  ImageList: [],
});

onMounted(async () => {
  const page = await getPageById(props.pageId);
  state.pageData = page;
  console.log();
});
</script>
