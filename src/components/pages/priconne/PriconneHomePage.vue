<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const sideBarItems = [
  {
    label: 'Character',
    category: 'character',
  },
  {
    label: 'Item',
    category: 'item',
  },
  {
    label: 'Unique Equipment',
    category: 'ue',
  },
];

const showSideBar = ref(true);
</script>

<template>
  <div class="flex h-full w-full bg-red-100">
    <div
      :class="[
        'fixed top-0 z-10 h-screen w-[350px] ',
        'transition-transform duration-200',
        'flex items-start',
        { 'translate-x-[-300px]': !showSideBar },
      ]"
    >
      <div class="flex h-screen w-[300px] flex-col bg-gray-400">
        <div class="h-32">put any logo here?</div>
        <RouterLink
          v-for="item in sideBarItems"
          :key="item.category"
          :class="[
            'flex h-10 items-center justify-start',
            'border-b bg-blue-200 px-5 last:border-0',
            {
              'bg-green-600': route.query.category === item.category,
            },
          ]"
          :to="{ name: 'priconne', query: { category: item.category } }"
        >
          {{ item.label }}
        </RouterLink>
      </div>
      <button class="w-[50px] bg-red-500" @click="showSideBar = !showSideBar">
        Toggel
      </button>
    </div>

    <div class="flex w-screen justify-end bg-blue-100">
      <div
        :class="[
          'h-full w-screen bg-red-600',
          'transition-[width] duration-200',
          { 'full-size': !showSideBar },
          { 'normal-size': showSideBar },
        ]"
      >
        aa aa aa aa aa
        <div class="h-32 bg-green-300">aas</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.full-size {
  width: 100vw;
}

.normal-size {
  width: calc(100vw - 300px);
}
</style>
