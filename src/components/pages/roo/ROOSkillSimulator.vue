<script setup lang="ts">
import { ref } from 'vue';

const color = ref('#ffc1c1');
</script>

<template>
  <div class="kk">List of basic job</div>
  <div>List of 2nd job</div>
  <div>List of 3rd job</div>
  <div class="bbb h-32 w-32"></div>
</template>

<style>
.kk {
  color: v-bind(color);
}
</style>
