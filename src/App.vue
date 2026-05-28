<template>
  <UnsupportedDeviceNotice v-if="isUnsupportedDevice" />
  <RouterView v-else />
</template>

<script setup>
import UnsupportedDeviceNotice from "@/components/Common/UnsupportedDeviceNotice.vue";
import { useUnsupportedDevice } from "@/composables/useUnsupportedDevice";

const { isUnsupportedDevice } = useUnsupportedDevice();
</script>

<style scoped></style>
