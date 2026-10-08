<template>
  <el-tag type="primary" v-if="isAdmin">{{ type }}</el-tag>
</template>

<script setup>
import { computed } from "vue";

defineProps({
  type: {
    type: String,
    default: "",
  },
});
import { useGlobalStore } from "@/stores/global";

const globalStore = useGlobalStore();

const isAdmin = computed(() => globalStore.isAdmin);
</script>

<style scoped></style>
