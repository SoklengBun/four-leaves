<script setup lang="ts">
import FooterBar from "./components/FooterBar.vue";
import NavBar from "./components/NavBar.vue";
</script>

<template>
  <div class="body w-full min-h-screen flex flex-col">
    <NavBar />
    <main>
      <RouterView />
    </main>

    <FooterBar />
  </div>
</template>
