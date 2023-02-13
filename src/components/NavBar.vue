<script setup lang="ts">
import { requireImage } from "@/utils/helper";
import { ref } from "vue";

const showPopup = ref(false);

const menuList = [
  { name: "home", label: "Me" },
  { name: "sokleng", label: "Yahallo" },
  { name: "about", label: "About me" },
];

const socialMedia = [
  {
    name: "Facebook",
    link: "https://www.facebook.com/sokleng.bun.22/",
    src: "facebook.svg",
  },
  {
    name: "Youtube",
    link: "https://www.youtube.com/@soklengbun",
    src: "youtube.svg",
  },
  {
    name: "Twitter",
    link: "https://twitter.com/Sokleng28198854",
    src: "twitter.svg",
  },
  {
    name: "Telegram",
    link: "https://t.me/soklengbun",
    src: "facebook.svg",
  },
  {
    name: "Github",
    link: "https://github.com/SoklengBun",
    src: "github.svg",
  },
];

const togglePopup = () => {
  if (!showPopup.value) {
    showPopup.value = true;
  } else {
    const element = document.getElementById("popup");
    element?.classList.add("hide");
    setTimeout(() => {
      showPopup.value = false;
    }, 300);
  }
};

const changeFontSize = (fontSize: number) => {
  console.log('fsdf')
  let root = document.querySelector(":root") as HTMLElement;
  root.style.setProperty("--over-all-font-size", fontSize + "px");
};
</script>

<template>
  <header>
    <nav>
      <div class="w-full md:h-10">
        <div
          class="fixed md:bg-white/80 w-full md:shadow-md h-10 flex justify-between items-center px-2 top-0 z-50"
        >
          Logo {{ showPopup }}

          <div class="md:flex gap-3 items-center hidden">
            <button type="button" @click="changeFontSize(16)">16px</button>
            <button type="button" @click="changeFontSize(18)">18px</button>
            <button type="button" @click="changeFontSize(20)">20px</button>
            <button type="button" @click="changeFontSize(22)">22px</button>
            <template v-for="item in menuList" :key="item.name">
              <RouterLink
                :to="{ name: item.name }"
                class="text-blue-400 hover:text-blue-500 hover:font-bold"
              >
                {{ item.label }}</RouterLink
              >
            </template>

            <template v-for="item in socialMedia" :key="item.name">
              <a :href="item.link" target="_blank">
                <img
                  :src="requireImage(item.src)"
                  class="w-6 h-6"
                  :alt="item.name"
                />
              </a>
            </template>
          </div>
          <div class="flex md:hidden">
            <button
              type="button"
              class="w-7 h-7 flex items-center justify-center"
              @click="togglePopup"
            >
              <img
                :src="requireImage(!showPopup ? 'menu.svg' : 'close.svg')"
                :class="!showPopup ? 'w-7 h-7' : 'w-5 h-5'"
                alt="Menu"
              />
            </button>
          </div>
        </div>
        <div
          id="popup"
          class="bg-white/80 h-full w-full fixed top-0 right-0 show z-40"
          :class="{ hidden: !showPopup }"
        >
          <div
            class="flex flex-col gap-1 pt-16 px-10 items-start justify-start text-blue-500"
          >
            <template v-for="item in menuList" :key="item.name">
              <RouterLink :to="{ name: item.name }">
                {{ item.label }}</RouterLink
              >
            </template>

            <template v-for="item in socialMedia" :key="item.name">
              <a
                :href="item.link"
                target="_blank"
                class="flex gap-1 items-start"
              >
                <img
                  :src="requireImage(item.src)"
                  class="w-5 h-5"
                  :alt="item.name"
                />
                {{ item.name }}
              </a>
            </template>
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
