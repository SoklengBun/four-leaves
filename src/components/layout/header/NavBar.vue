<script setup lang="ts">
import { requireImage } from '@/utils/helper';
import { onBeforeUnmount, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import LanguageSelection from './LanguageSelection.vue';
import Theme from './Theme.vue';
import FontSelection from './FontSelection.vue';

const showPopup = ref(false);

const menuList = [
  { name: 'home', label: 'Home', icon: 'images/nav/home.png' },
  { name: 'lyrics', label: 'Lyrics', icon: 'images/nav/lyrics.png' },
  // { name: 'sokleng', label: 'Yahallo' },
  // { name: 'slot-machine', label: 'Slot' },
  // { name: 'about', label: 'About me' },
];

//icon source: https://www.iconfinder.com/iconsets/colorful-guache-social-media-logos-1

const socialMedia = [
  {
    name: 'Facebook',
    link: 'https://www.facebook.com/sokleng.bun.22/',
    src: 'facebook.svg',
  },
  {
    name: 'Youtube',
    link: 'https://www.youtube.com/@soklengbun',
    src: 'youtube.svg',
  },
  {
    name: 'Twitter',
    link: 'https://twitter.com/Sokleng28198854',
    src: 'twitter.svg',
  },
  {
    name: 'Telegram',
    link: 'https://t.me/bunsokleng',
    src: 'telegram.svg',
  },
  {
    name: 'Github',
    link: 'https://github.com/SoklengBun',
    src: 'github.svg',
  },
];

const togglePopup = () => {
  console.log('toggle');
  if (!showPopup.value) {
    showPopup.value = true;
  } else {
    const element = document.getElementById('popup');
    element?.classList.add('hide');
    setTimeout(() => {
      showPopup.value = false;
    }, 350);
  }
};

watch(showPopup, () => {
  if (showPopup.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <header>
    <nav>
      <div
        class="fixed top-0 z-50 flex h-nav w-full select-none items-center justify-between border-b border-border bg-background px-1 backdrop-blur-md md:shadow-md"
      >
        <!-- <RouterLink :to="{ name: 'home' }" class="h-full">
          <img :src="requireImage('logo.png')" class="contain h-full" />
        </RouterLink> -->

        <div class="hidden items-center gap-3 md:flex">
          <template v-for="item in menuList" :key="item.name">
            <RouterLink
              :to="{ name: item.name }"
              class="text-foreground-muted transition-all duration-300 hover:scale-125 hover:font-bold hover:text-primary"
            >
              {{ item.label }}
            </RouterLink>
          </template>

          <Theme />
          <LanguageSelection />
          <FontSelection />

          <template v-for="item in socialMedia" :key="item.name">
            <a :href="item.link" target="_blank">
              <img :src="requireImage(item.src)" class="h-6 w-6 duration-300 hover:scale-125" :alt="item.name" />
            </a>
          </template>
        </div>
      </div>

      <!---Mobile Screen-->

      <button
        type="button"
        class="menu-circle fixed right-1 top-1 z-[53] size-11 bg-surface md:hidden"
        @click="togglePopup"
        :class="{ active: showPopup }"
      >
        <div class="menu-circle size-9">
          <div class="menu-circle size-8 flex-col text-[10px]">
            <div class="h-3 w-5 -translate-y-0.5">
              <div class="menu-line top" :style="{ height: '1px' }" />
              <div class="menu-line bottom mt-1" :style="{ height: '1px' }" />
            </div>
            <div class="relative flex items-center justify-center text-foreground">
              <transition name="fade">
                <span v-if="!showPopup" class="absolute z-10">MENU</span>
                <span v-else class="absolute z-10 text-danger">CLOSE</span>
              </transition>
            </div>
          </div>
        </div>
      </button>

      <!--Mobile Popup-->
      <div id="popup" class="show fixed right-0 top-0 z-[52] h-body w-full" :class="{ hidden: !showPopup }">
        <div class="flex flex-col bg-background px-5 pt-16 text-foreground">
          <div class="darkL grid grid-cols-4 border-t border-border pt-5">
            <RouterLink
              v-for="item in menuList"
              :key="item.name"
              :to="{ name: item.name }"
              class="flex flex-col items-center justify-center"
              @click="togglePopup"
            >
              <div class="size-10">
                <img v-if="item.icon" :src="requireImage(item.icon)" class="size-full" />
              </div>
              <span>{{ item.label }}</span>
            </RouterLink>
          </div>

          <p class="mt-10 w-full border-b border-border pb-2 text-foreground-muted">Me?</p>
          <div class="mt-2 flex space-x-2">
            <a v-for="item in socialMedia" :key="item.name" :href="item.link" target="_blank">
              <img :src="requireImage(item.src)" class="h-5 w-5" :alt="item.name" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
nav a.router-link-exact-active,
.text-active:hover {
  color: var(--color-primary);
  font-weight: bold;
}

.menu-circle {
  @apply flex items-center justify-center rounded-full border border-border md:hidden;
}

.menu-line {
  @apply w-5 bg-foreground transition-all duration-300 ease-linear;
  transform-origin: 0px 0px;
  transform: rotate(0deg);
}

.active {
  .menu-line {
    @apply bg-danger;

    &.top {
      transform: rotate(13.5deg);
    }

    &.bottom {
      transform: rotate(-13.5deg);
    }
  }
}

nav a.router-link-exact-active {
  text-shadow: 0 0 16px color-mix(in srgb, var(--color-primary) 45%, transparent);
}

.show {
  opacity: 1;
  animation: fade-in 0.5s ease-in-out;
  background-image: url('@/assets/images/bg_cross.png');

  background-color: var(--color-background);
  background-size: 35px auto;
  background-repeat: repeat;
}

.hide {
  opacity: 0;
  animation: fade-out 0.5s ease-in-out;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
