<script setup lang="ts">
import FooterBar from './components/FooterBar.vue';
import NavBar from './components/header/NavBar.vue';
import { useRoute } from 'vue-router';
import { onMounted, watch } from 'vue';
import { useHead } from '@unhead/vue';

const route = useRoute();

const description = route.query.name?.toString() ?? 'My Name';

useHead({
  title: 'αηєℓℓα',
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: 'αηєℓℓα' },
    { property: 'og:description', content: 'Description for your page.' },
    // { property: 'og:image', content: 'https://anella.vercel.app/anella.jpg' },
    { property: 'og:url', content: 'https://anella.vercel.app/' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:title', content: 'Your Page Title' },
    { property: 'twitter:description', content: description },
    // {
    //   property: 'twitter:image',
    //   content: 'https://anella.vercel.app/anella.jpg',
    // },
  ],
});

onMounted(() => {
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  function ctrlShiftKey(e: KeyboardEvent, keyCode: string) {
    return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
  }

  document.onkeydown = (e: KeyboardEvent) => {
    // Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
    if (
      e.key === 'F12' ||
      ctrlShiftKey(e, 'I') ||
      ctrlShiftKey(e, 'J') ||
      ctrlShiftKey(e, 'C') ||
      (e.ctrlKey && e.key === 'U')
    )
      return false;

    return;
  };
});
</script>

<template>
  <div class="body flex w-full flex-col">
    <NavBar />
    <main>
      <RouterView />
    </main>
    <!-- <FooterBar v-if="route.name !== 'home'" /> -->
  </div>
</template>
