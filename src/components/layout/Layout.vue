<script setup lang="ts">
import FooterBar from './footer/FooterBar.vue';
import FloatingEdgeMenu from './FloatingEdgeMenu.vue';
import NavBar from './header/NavBar.vue';
</script>

<template>
  <!-- <NavBar /> -->
  <main>
    <slot />
  </main>
  <FloatingEdgeMenu />
  <!-- <FooterBar /> -->
</template>
