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
    resultRecord.value = [
      `${diceOne.value} | ${diceTwo.value} | ${diceThree.value}`,
      ...resultRecord.value,
    ];
  }
};

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="containers">
    <div class="container-1">
      <div class="flex gap-2 p-2">
        <Dice v-for="num in 6" :key="num" :number="num" />
      </div>

      <button
        class="ani w-24 rounded-md border-2 px-5 py-1 font-bold text-cyan-500"
        @click="toggleRolling"
      >
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
.container-1 {
  background-color: black;
  padding-top: 4rem;
  width: 80%;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.containers {
  background-color: red;
  width: 100%;
  align-items: center;
  align-content: center;
  display: flex;
  justify-content: center;
}

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
