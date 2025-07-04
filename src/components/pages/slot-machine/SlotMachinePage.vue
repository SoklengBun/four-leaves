<script setup lang="ts">
import { ref } from 'vue';
import StarFloat from '~/components/animation/StarFloat.vue';
import StarPop from '~/components/animation/StarPop.vue';

// import Button from '~/components/buttons/button.vue';

const active = ref<number | null>(null);
const finalResult = ref<number | null>(null);
const sleepDuration = ref(0);
const stepDuration = ref(1);
const showResult = ref(false);
const resultPosition = ref({
  top: 0,
  left: 0,
});

const top = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const right = [9, 10, 11, 12];
const bottom = [13, 14, 15, 16, 17, 18, 19, 20, 21];
const left = [22, 23, 24, 25];

const sleep = (duration: number) => {
  return new Promise((r) => {
    setTimeout(() => {
      r(false);
    }, duration);
  });
};

const spinning = async () => {
  if (active.value === null) return;
  if (sleepDuration.value >= 600 && active.value === finalResult.value) {
    const elem = document.getElementById(
      `box-${finalResult.value}`,
    ) as HTMLDivElement;

    if (elem) {
      resultPosition.value = {
        left: elem.offsetLeft,
        top: (elem.offsetParent as HTMLElement)?.offsetTop ?? 0,
      };
    }
    showResult.value = true;
    return;
  }
  if (stepDuration.value < 1000) {
    sleepDuration.value += stepDuration.value;
  }
  if (sleepDuration.value > 50 && stepDuration.value === 1) {
    stepDuration.value = 2;
  }

  if (
    finalResult.value &&
    finalResult.value > 10 &&
    finalResult.value - active.value === 10
  ) {
    stepDuration.value += 100;
  }

  await sleep(sleepDuration.value);
  if (active.value === 25) {
    active.value = 0;
  } else {
    active.value += 1;
  }
  spinning();
};

const getResult = async () => {
  await sleep(3000);
  const min = 12;
  const max = 25;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const onStart = async () => {
  showResult.value = false;
  active.value = 0;
  finalResult.value = null;
  stepDuration.value = 1;
  sleepDuration.value = 0;
  spinning();
  const result = await getResult();
  finalResult.value = result;
};
</script>

<template>
  <div class="slot-machine h-[calc(100vh-50px)] w-full overflow-hidden">
    <div
      class="mx-auto flex h-fit w-fit flex-col items-center overflow-hidden rounded-lg border-4 border-red-500 bg-black p-1.5"
    >
      <div class="border-red slot-container relative">
        <div
          class="absolute z-[12]"
          :style="{
            top: resultPosition.top + 'px',
            left: resultPosition.left + 'px',
          }"
          v-if="showResult"
        >
          <!-- <div
            class="box result flex items-center justify-center text-blue-800"
          >
            {{ finalResult }}
          </div> -->
          <StarPop />
          <StarFloat />
        </div>
        <div class="absolute left-[0px] top-[0px] flex">
          <div
            v-for="item in top"
            :id="`box-${item}`"
            class="box"
            :class="{
              active: active === item,
            }"
          >
            <div class="size-[80%] bg-green-300"></div>
          </div>
        </div>

        <div
          class="absolute left-[0px] top-[calc(var(--box-size)*5)] flex flex-row-reverse"
        >
          <div
            v-for="item in bottom"
            :id="`box-${item}`"
            class="box"
            :class="{
              active: active === item,
            }"
          >
            <div class="size-[80%] bg-green-300"></div>
          </div>
        </div>

        <div
          class="absolute left-[calc(var(--box-size)*8)] top-[var(--box-size)] flex flex-col"
        >
          <div
            v-for="item in right"
            :id="`box-${item}`"
            class="box"
            :class="{
              active: active === item,
            }"
          >
            <div class="size-[80%] bg-green-300"></div>
          </div>
        </div>

        <div
          class="absolute left-[0px] top-[var(--box-size)] flex flex-col-reverse"
        >
          <div
            v-for="item in left"
            :key="item"
            :id="`box-${item}`"
            class="box"
            :class="{
              active: active === item,
            }"
          >
            <div class="size-[80%] bg-green-300"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col items-center overflow-auto">
      <div class="flex w-full items-center justify-center p-5">
        <button class="start-button" @click="onStart">Start</button>
        {{ sleepDuration }}
      </div>

      <div>Result:{{ finalResult }}</div>
      <div>CurrentActive:{{ active }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.slot-machine {
  --box-size: min(50px, 10vw);
  .slot-container {
    width: calc(var(--box-size) * 9);
    height: calc(var(--box-size) * 6);
  }

  .box {
    @apply relative flex items-center justify-center border-blue-500;
    width: var(--box-size);
    height: var(--box-size);

    &.active {
      @apply rounded;
      // background-color: red;
      // border-color: red;

      &::after {
        @apply absolute left-1/2 top-1/2 z-[1] size-[125%] -translate-x-1/2 -translate-y-1/2 rounded-full;
        content: '';
        background-color: red;
        background: repeating-conic-gradient(
          from var(--angle, 0deg),
          #ff0000 0%,
          #ffff00 5%,
          #ffff00 10%,
          #ff0000 20%
        );
        filter: blur(5px);
        animation: 5s spin-shadow linear infinite;
      }
    }

    &.result {
      @apply bg-yellow-300;
    }
  }

  .start-button {
    @apply rounded-lg border border-green-500 px-5 py-1;
  }

  .bg-green-300 {
    @apply relative z-[20];
  }
}

@keyframes spin-shadow {
  from {
    --angle: 0deg;
  }
  to {
    --angle: 360deg;
  }
}
</style>
