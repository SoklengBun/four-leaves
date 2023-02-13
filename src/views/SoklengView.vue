<script setup lang="ts">
import { ref } from "vue";
const state = ref(0);
let count = 0;
const setState = (value: any) => {
  state.value = value;
};

const say = (msg: string) => {
  count += 1;
  alert(msg + "" + count);
};
</script>

<template>
  <div class="containers">
    <div class="container">
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>

      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <h1>Hello i'm sokleng</h1>
      <var>
        <h1>Hello i'm sokleng</h1>
        <h1>Hello i'm sokleng</h1>
        <h1>Hello i'm sokleng</h1>
        <h1>Hello i'm sokleng</h1>
        <h1>Hello i'm sokleng</h1>
        v</var
      >
      <h1>{{ count }}</h1>
      <h1>{{ state }}</h1>
      <button type="button" @click="say('bye')">Say bye</button>
      <button type="button" @click="setState(state + 1)">count+1</button>
    </div>
  </div>
</template>

<style>
.container {
  background-color: aqua;
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
</style>
