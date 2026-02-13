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
  <div
    class="background"
    :class="[loadingCharClass, { hidden: !appSetting.isFirstLoadHomePage }]"
  >
    <div id="loading_character" :class="loadingCharClass">
      <div class="character-container char03"></div>
    </div>
  </div>
</template>

<style scoped>
.background {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 100;
  background: url('@/assets/images/background.gif') repeat center top;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transition: transform 330ms;
  transition-timing-function: ease-in-out;
  transform: translate3d(0, 0, 0);
}

.background.remove {
  transform: translate3d(100%, 0, 0);
  transition-delay: 300ms;
  transition-duration: 200ms;
}

#loading_character {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  transition: all 1100ms;
  transition-timing-function: ease-in-out;
}

#loading_character.ready {
  left: -100%;
}
#loading_character.remove {
  left: 200%;
}

#loading_character .character-container {
  width: 200px;
  height: 200px;
  overflow: hidden;
  background: url('@/assets/images/kokkoro.png') no-repeat center;
  background-size: 100%;
}
#loading_character .character-container.char03 {
  background-image: url('@/assets/images/kokkoro.png');
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
