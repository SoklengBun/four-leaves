<script setup lang="ts">
import { ref } from 'vue';
import DropDown from '~/components/shares/DropDown.vue';

interface Job {
  name: string;
  skills: any[];
}

interface Data {
  baseJob: Job;
  nextJob: Job[][];
}

const currentJobIndex = ref();
const secondJobIndex = ref();

const data = ref<Data[]>([
  {
    baseJob: { name: 'Swordsman', skills: [] },
    nextJob: [
      [
        { name: 'Knight', skills: [] },
        { name: 'Lord Knight', skills: [] },
      ],
      [
        { name: 'Crusader', skills: [] },
        { name: 'Paladin', skills: [] },
      ],
    ],
  },
  {
    baseJob: { name: 'Mage', skills: [] },
    nextJob: [
      [
        { name: 'Wizard', skills: [] },
        { name: 'High Wizard', skills: [] },
      ],
      [
        { name: 'Sage', skills: [] },
        { name: 'Professor', skills: [] },
      ],
    ],
  },
]);

const onClickBaseJobDropdownItem = () => (index: number) => {
  currentJobIndex.value = index;

  const resetSecondClass = onClickSecondJobDropdownItem();
  resetSecondClass(undefined);
};
const onClickSecondJobDropdownItem = () => (index: number | undefined) => {
  secondJobIndex.value = index;
};
</script>

<template>
  <div class="flex flex-wrap">
    <div>
      <DropDown
        :options="
          data.map((item) => {
            return { name: item.baseJob.name, iconImage: item.baseJob.name };
          })
        "
        :on-click-item="onClickBaseJobDropdownItem"
      >
        <template #customTitle>
          <div>
            {{ data[currentJobIndex]?.baseJob?.name || 'Choose' }}
          </div>
        </template>
      </DropDown>

      <DropDown
        v-if="currentJobIndex >= 0"
        :options="
          data[currentJobIndex]?.nextJob.map((item) => {
            return { name: item[0].name, iconImage: item[0].name };
          })
        "
        :on-click-item="onClickSecondJobDropdownItem"
      >
        <template #customTitle>
          <div>
            {{
              data?.[currentJobIndex]?.nextJob?.[secondJobIndex]?.[0]?.name ||
              'Choose'
            }}
          </div>
        </template>
      </DropDown>
    </div>
    <!-- <div class="flex gap-2">
      <button
        v-for="(d, key) in data"
        :key="key"
        @click="currentJobIndex = key"
      >
        {{ d.baseJob.name }}
      </button>
    </div>

    <div v-if="currentJobIndex >= 0" class="flex gap-2">
      <template v-for="(d, key) in data[currentJobIndex].nextJob" :key="key">
        <button @click="secondJobIndex = key">
          {{ d[0].name }}
        </button>
      </template>
    </div>

    <div v-if="currentJobIndex >= 0 && secondJobIndex >= 0" class="flex gap-2">
      {{ data[currentJobIndex].nextJob[secondJobIndex][1].name }}
    </div> -->
  </div>
</template>
