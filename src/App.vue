<script setup lang="ts">
import FooterBar from "./components/FooterBar.vue";
import NavBar from "./components/header/NavBar.vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div class="body flex min-h-screen w-full flex-col">
    <NavBar />
    <main>
      <RouterView />
    </main>
    <FooterBar v-if="route.name !== 'home'" />
  </div>
</template>

<style>
body {
  height: 100vh;
}
</style>
