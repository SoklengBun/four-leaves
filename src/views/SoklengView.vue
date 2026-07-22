<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import Dice from '~/components/shares/Dice.vue';
const diceOne = ref(1);
const diceTwo = ref(1);
const diceThree = ref(1);
const isRolling = ref(false);
const resultRecord = ref<string[]>([]);

const interval = setInterval(() => {
  if (isRolling.value) {
    diceOne.value = Math.floor(Math.random() * 6) + 1;
    diceTwo.value = Math.floor(Math.random() * 6) + 1;
    diceThree.value = Math.floor(Math.random() * 6) + 1;
  }
}, 150);

const toggleRolling = () => {
  const timeout = isRolling.value ? 0 : 0;
  setTimeout(() => {
    isRolling.value = !isRolling.value;
  }, timeout);

  if (isRolling.value) {
    resultRecord.value = [`${diceOne.value} | ${diceTwo.value} | ${diceThree.value}`, ...resultRecord.value];
  }
};

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="flex w-full content-center items-center justify-center bg-[#ff0000]">
    <div class="flex w-4/5 flex-col items-center self-center bg-black pt-16">
      <div class="flex gap-2 p-2">
        <Dice v-for="num in 6" :key="num" :number="num" />
      </div>

      <button class="ani w-24 rounded-md border-2 px-5 py-1 font-bold text-cyan-500" @click="toggleRolling">
        {{ isRolling ? 'Stop' : 'Roll' }}
      </button>

      <div class="flex">
        <Dice :number="diceOne" class="m-5 h-20 w-20" />
        <Dice :number="diceTwo" class="m-5 h-20 w-20" />
        <Dice :number="diceThree" class="m-5 h-20 w-20" />
      </div>
      <div class="flex flex-col">
        <span v-for="(item, key) in resultRecord" :key="key"> {{ item }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.ani {
  animation: background-blink 5s infinite;
}

@keyframes background-blink {
  0% {
    border-color: red;
    color: red;
  }
  25% {
    border-color: pink;
    color: pink;
  }
  50% {
    border-color: cyan;
    color: cyan;
  }
  75% {
    border-color: blue;
    color: blue;
  }
  100% {
    border-color: red;
    color: red;
  }
}
</style>
