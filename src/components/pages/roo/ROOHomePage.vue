<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import IconArrowLeftRight from '~/components/icons/IconArrowLeftRight.vue';
import HeaderSpace from '~/components/shares/HeaderSpace.vue';
import { requireImage } from '~/utils/helper';
import ROOSkillSimulator from './ROOSkillSimulator.vue';

const route = useRoute();

const sideBarItems = [
  {
    label: 'Job',
    labelShort: 'Job',
    category: 'Job',
  },
  {
    label: 'Skill Simulator',
    labelShort: 'S.S',
    category: 'skill-simulator',
  },
];

const showSideBar = ref(true);
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <HeaderSpace />

    <!-- Side bar for PC view -->
    <div
      :class="[
        'fixed top-10 z-10 h-screen w-[350px]',
        'transition-transform duration-200',
        ' hidden items-start md:flex',
        { 'translate-x-[-300px]': !showSideBar },
      ]"
    >
      <div
        class="flex h-screen w-[300px] flex-col bg-gray-100 dark:bg-gray-800"
      >
        <div class="flex h-20 items-center justify-center">
          <img
            :src="requireImage('images/roo/logo.png')"
            class="contain h-full"
          />
        </div>
        <RouterLink
          v-for="item in sideBarItems"
          :key="item.category"
          :class="[
            'flex h-10 items-center justify-start',
            'border-b border-blue-400 px-5 last:border-0',
            {
              'bg-blue-600 text-gray-100':
                route.query.category === item.category,
            },
          ]"
          :to="{ name: 'roo', query: { category: item.category } }"
        >
          {{ item.label }}
        </RouterLink>
      </div>
      <button
        class="flex h-[50px] w-[50px] items-center justify-center"
        @click="showSideBar = !showSideBar"
      >
        <IconArrowLeftRight
          class="h-7 w-7 rotate-90 text-blue-400 duration-300 hover:scale-125"
        />
      </button>
    </div>

    <!-- Bottom Nav for phone view  -->
    <div
      class="fixed bottom-0 left-0 grid h-16 w-screen grid-cols-3 overflow-hidden rounded-t-xl border dark:bg-gray-800 md:hidden"
    >
      <RouterLink
        v-for="item in sideBarItems"
        :key="item.category"
        :class="[
          'flex h-full items-center justify-center text-center leading-none',
          {
            'bg-blue-600 text-gray-100': route.query.category === item.category,
          },
        ]"
        :to="{ name: 'roo', query: { category: item.category } }"
      >
        {{ item.labelShort }}
      </RouterLink>
    </div>

    <div class="flex w-screen justify-end pb-20 md:pb-0">
      <div
        :class="[
          'h-full w-screen ',
          'px-3 py-10 transition-[width] duration-200 md:px-10 md:py-5',
          { 'full-size': !showSideBar },
          { 'normal-size md:full-size': showSideBar },
        ]"
      >
        <ROOSkillSimulator v-if="route.query.category === 'skill-simulator'" />
        <div
          v-else
          class="flex h-full w-full flex-1 items-center justify-center"
        >
          Welcome to 「Princess Connect Re:Dive!」 whatever page.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.full-size {
  width: 100vw;
}

.normal-size {
  width: 100vw;
}

@media (min-width: 768px) {
  .normal-size {
    width: calc(100vw - 300px);
  }
}
</style>
