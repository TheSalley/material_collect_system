<template>
    <div style="display: flex; justify-content: space-between; align-items: stretch;height: 100%;">
        <div style="width: 50%;background-color: bisque;align-self: stretch;">图片</div>
        <div style="width: 50%;background-color: #f0f2f5;align-self: stretch;">文案</div>
    </div>
</template>
<script setup>
import { reactive, onMounted } from 'vue';
import { getPageById } from '@/apis/index.js';

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

});
</script>