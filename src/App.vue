<script setup lang="ts">
import FooterBar from "./components/FooterBar.vue";
import NavBar from "./components/header/NavBar.vue";
</script>

<template>
  <div class="body flex min-h-screen w-full flex-col">
    <NavBar />
    <main>
      <RouterView />
    </main>
    <FooterBar />
  </div>
</template>

<style>
body {
  height: 100vh;
}
</style>
