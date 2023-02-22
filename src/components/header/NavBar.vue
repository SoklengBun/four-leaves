<script setup lang="ts">
import { requireImage } from '@/utils/helper';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

import { t } from '@/locales';
import LanguageSelection from './LanguageSelection.vue';
import Theme from './Theme.vue';
import FontSelection from './FontSelection.vue';

const showPopup = ref(false);

const menuList = [
  { name: 'home', label: 'Me' },
  { name: 'sokleng', label: 'Yahallo' },
  { name: 'about', label: 'About me' },
];

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
    link: 'https://t.me/soklengbun',
    src: 'telegram.svg',
  },
  {
    name: 'Github',
    link: 'https://github.com/SoklengBun',
    src: 'github.svg',
  },
];

const togglePopup = () => {
  if (!showPopup.value) {
    showPopup.value = true;
  } else {
    const element = document.getElementById('popup');
    element?.classList.add('hide');
    setTimeout(() => {
      showPopup.value = false;
    }, 300);
  }
};
</script>

<template>
  <header>
    <nav>
      <div class="w-full select-none md:h-10">
        <div
          class="fixed top-0 z-50 flex h-10 w-full items-center justify-between px-2 md:shadow-md md:backdrop-blur-sm md:dark:bg-transparent"
        >
          Logo {{ t('hello') }}

          <div class="hidden items-center gap-3 md:flex">
            <template v-for="item in menuList" :key="item.name">
              <RouterLink
                :to="{ name: item.name }"
                class="text-blue-400 hover:scale-125 hover:font-bold hover:text-blue-500"
              >
                {{ item.label }}
              </RouterLink>
            </template>

            <Theme />
            <LanguageSelection />
            <FontSelection />

            <template v-for="item in socialMedia" :key="item.name">
              <a :href="item.link" target="_blank">
                <img
                  :src="requireImage(item.src)"
                  class="h-6 w-6 duration-300 hover:scale-125"
                  :alt="item.name"
                />
              </a>
            </template>
          </div>

          <!---Mobile Screen-->
          <div class="flex md:hidden">
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center"
              @click="togglePopup"
            >
              <img
                :src="requireImage(!showPopup ? 'menu.svg' : 'close.svg')"
                class="h-7 w-7 delay-300"
                alt="Menu"
              />
            </button>
          </div>
        </div>

        <!--Mobile Popup-->
        <div
          id="popup"
          class="show fixed top-0 right-0 z-40 h-full w-full bg-white/70 backdrop-blur-sm"
          :class="{ hidden: !showPopup }"
        >
          <div class="justify-start px-10 pt-16 text-blue-500">
            <ul>
              <li
                v-for="item in menuList"
                :key="item.name"
                class="my-2 border-b py-1"
              >
                <RouterLink
                  :to="{ name: item.name }"
                  class="flex"
                  @click="togglePopup"
                >
                  {{ item.label }}
                </RouterLink>
              </li>

              <li
                v-for="item in socialMedia"
                :key="item.name"
                class="my-2 border-b py-1"
              >
                <a
                  :href="item.link"
                  target="_blank"
                  class="flex items-start gap-1"
                >
                  <img
                    :src="requireImage(item.src)"
                    class="h-5 w-5"
                    :alt="item.name"
                  />
                  {{ item.name }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
nav a.router-link-exact-active {
  color: red;
  font-weight: bold;
}
.text-active:hover {
  color: red;
  font-weight: bold;
}

.show {
  opacity: 1;
  animation: fade-in 0.5s ease-in-out;
}

.hide {
  opacity: 0;
  animation: fade-out 0.5s ease-in-out;
}
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.5;
  }
  75% {
    opacity: 0.75;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
  }
  25% {
    opacity: 0.75;
  }
  50% {
    opacity: 0.5;
  }
  75% {
    opacity: 0.25;
  }
  100% {
    opacity: 0;
  }
}
</style>
