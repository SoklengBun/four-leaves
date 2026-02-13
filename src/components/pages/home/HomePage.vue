<script setup lang="ts">
import { useWindowSize } from '@vant/use';
import { onMounted } from 'vue';
import FirstLoad from './components/FirstLoad.vue';
import MobileFrontPage from './components/MobileFrontPage.vue';

const onFirstLoadEnd = () => {};
</script>

<template>
  <FirstLoad @end="onFirstLoadEnd" />
  <MobileFrontPage />
</template>
<style scoped></style>
