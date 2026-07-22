<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAppSetting } from '~/stores/app-setting';
import { sleep } from '~/utils/helper';
const props = defineProps<{ onEnd?: () => void }>();

const appSetting = useAppSetting();
const loadingCharClass = ref('ready');

onMounted(async () => {
  loadingCharClass.value = '';

  await sleep(3000);

  loadingCharClass.value = 'remove';
  await sleep(1000);
  appSetting.isFirstLoadHomePage = false;
});
</script>
<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[10001] size-full transform-gpu bg-[url('@/assets/images/background.gif')] bg-[position:center_top] bg-repeat transition-transform ease-in-out"
      :class="{
        hidden: !appSetting.isFirstLoadHomePage,
        'translate-x-full delay-300 duration-200': loadingCharClass === 'remove',
        'duration-[330ms]': loadingCharClass !== 'remove',
      }"
    >
      <div
        id="loading_character"
        class="absolute top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 transition-all duration-[1100ms] ease-in-out"
        :class="loadingCharClass === 'ready' ? '-left-full' : loadingCharClass === 'remove' ? 'left-[200%]' : 'left-1/2'"
      >
        <div class="char03 size-[200px] overflow-hidden bg-[url('@/assets/images/kokkoro.png')] bg-[length:100%] bg-center bg-no-repeat"></div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.char03 {
  animation: spriteAnime03 700ms steps(19) infinite;
}

@keyframes spriteAnime03 {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 -3800px;
  }
}
</style>
