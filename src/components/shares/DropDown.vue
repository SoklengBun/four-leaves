<script setup lang="ts">
import IconArrowDown from '../icons/IconArrowDown.vue';

const props = defineProps<{
  title?: string;
  customTitle?: boolean;
  options: { iconImage?: string; name: string }[];
  onClickItem?: () => (index: number) => void;
}>();

const onClick = (index: number) => {
  const refetch = props.onClickItem?.();
  refetch?.(index);
};
</script>

<template>
  <el-dropdown trigger="click" class="w-32 rounded border-2 px-2 py-1">
    <div class="el-dropdown-link flex w-full justify-between">
      <slot name="customTitle">
        <span>
          {{ title || 'Choose' }}
        </span>
      </slot>
      <IconArrowDown class="h-5 w-5" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="(item, key) in options" :key="item.name">
          <el-dropdown-item class="w-32" @click="onClick(key)">
            {{ item.name }}
          </el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style>
.el-dropdown-link,
.el-dropdown-menu__item {
  font-size: var(--over-all-font-size);
  font-family: 'Patrick Hand', sans-serif;
}
</style>
