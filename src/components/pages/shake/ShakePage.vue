<script setup lang="ts">
import { showToast } from 'vant';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const shakeCount = ref(0);

const permissionDialog = ref(false);

const shaking = (event: DeviceMotionEvent) => {
  event.preventDefault();
  if (shakeCount.value >= 10) return;

  const shakeThreshold = 5;
  const x = event?.acceleration?.x;
  if (!x) return;
  if (Math.abs(x) < shakeThreshold) return;

  console.log(`${x} m/s2`);
  showToast(`${x} m/s2`);
  shakeCount.value += 1;
};
onMounted(async () => {
  showToast(`res: ----`);

  try {
    //check if need permission, if it needs the it will throw and popup will open
    await (DeviceMotionEvent as any)?.requestPermission?.();

    window.addEventListener('devicemotion', shaking);
    showToast(`done listen`);
  } catch (e) {
    // showToast(`no res: ${e}`);
    permissionDialog.value = true;
  }

  //   if (typeof DeviceMotionEvent.requestPermission === 'function') {
  //     DeviceMotionEvent.requestPermission().then(() => {
  //       window.addEventListener('devicemotion', shaking);
  //     });
  //   } else {
  //     window.addEventListener('devicemotion', shaking);
  //   }
});

onUnmounted(() => {
  window.removeEventListener('devicemotion', shaking);
});

const requestPermission = () => {
  navigator?.vibrate?.(200);
  showToast('Permission requesting');
  showToast('Permission requesting');
  (DeviceMotionEvent as any).requestPermission().then((res: any) => {
    showToast(res);
  });

  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  ) {
    (DeviceMotionEvent as any)
      .requestPermission()
      .then((response: any) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', shaking);
          showToast('Permission granted');
        } else {
          console.log('Permission denied');
          showToast('Permission denied');
        }
      })
      .catch(() => {
        showToast('This device not Support Shake event');
      })
      .finally(() => {
        permissionDialog.value = false;
      });
  }
};

watch(shakeCount, () => {
  if (shakeCount.value >= 10) {
    navigator?.vibrate?.(200);
    setTimeout(() => (shakeCount.value = 0), 3000);
  }
});
</script>
<template>
  <div class="flex h-[50vh] flex-1 items-center justify-center">
    <van-popup
      v-model:show="permissionDialog"
      :style="{ background: 'transparent' }"
    >
      <div class="flex h-[200px] w-[300px] flex-col rounded-xl bg-white">
        <div class="flex flex-1 flex-col justify-center p-3 text-center">
          <div class="font-bold text-blue-500">
            Request for device permission
          </div>
          <div class="my-auto">Please turn on permission to play the game.</div>
        </div>
        <div class="flex h-[50px] w-full items-center text-blue-500">
          <button class="w-1/2" @click="permissionDialog = false">
            Cancel
          </button>
          <div class="h-1/2 w-px bg-red-500/20" />
          <button class="w-1/2" @click="requestPermission">
            Turn on Permission
          </button>
        </div>
      </div>
    </van-popup>

    <div
      class="fixed left-1/2 top-1/2 flex h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-white transition-all duration-500"
      :class="{ 'scale-0': shakeCount < 10 }"
      @click="requestPermission"
    >
      You got it!
    </div>
  </div>
</template>
