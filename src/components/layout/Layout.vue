<script setup lang="ts">
import FooterBar from './footer/FooterBar.vue';
import NavBar from './header/NavBar.vue';
</script>

<template>
  <NavBar />
  <main>
    <slot></slot>
  </main>
  <!-- <FooterBar /> -->
</template>
