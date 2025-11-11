<template>
    {{ state?.pageData?.meta_value}}
</template>
<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getPageById } from '@/apis/index.js';
    
const route = useRoute();
const state = reactive({
    pageData: null,
    ImageList: [],
});

onMounted(async () => {
    const page = await getPageById(route.query.id);
    state.pageData = page;
    console.log(page)
    console.log('Elementor 页面 ID:', route.query.id);
});
</script>