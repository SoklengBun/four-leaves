<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import MarqueeText from '~/components/shares/MarqueeText.vue';
import { usePlayer } from '~/stores/player';
import PlayerSeekBar from '~/components/music/PlayerSeekBar.vue';

import NextImage from '~/assets/images/player/next.png';
import PrevImage from '~/assets/images/player/previous.png';
import PauseImage from '~/assets/images/player/pause.png';
import PlayImage from '~/assets/images/player/play.png';
import ShuffleImage from '~/assets/images/player/shuffle.png';
import RepeatImage from '~/assets/images/player/repeat.png';

import YoutubeThumbnail from '~/components/music/YoutubeThumbnail.vue';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import LyricsLoadingState from './components/LyricsLoadingState.vue';
import LoopSetting from './components/LoopSetting.vue';
import SongCoverList from './components/SongCoverList.vue';
import CreatePlaylist from '~/components/music/CreatePlaylist.vue';
import { getLyricsById } from '~/services/lyrics.js';
import LyricsDetailMoreOptions from './components/LyricsDetailMoreOptions.vue';
import BackButton from '~/components/shares/BackButton.vue';
import RoundButton from '~/components/shares/RoundButton.vue';

const router = useRouter();
const player = usePlayer();
const { videoId, artists, current, isPlaying, mode, shuffle, repeatOne } = storeToRefs(player);

const currentLang = ref<LyricsKeys>('romaji');
const isLoading = ref(false);
const showMore = ref(false);
const displayTitle = computed(() => getLyricsTitleLabel(current.value));
const displayArtist = computed(() => getLyricsArtistsLabel(artists.value));
const lyricsContent = computed(() => current.value?.contents?.find((e) => e.kind === currentLang.value)?.content?.replace(/е/g, 'e') ?? '');
const availableLangs = ref<LyricsKeys[]>(['romaji']);

const langKey: { [key: string]: string } = {
  japanese: '日本語',
  romaji: 'Romaji',
  english: 'English',
};
const langOrder: LyricsKeys[] = ['japanese', 'romaji', 'english', 'chinese', 'pinyin'];

const fetchLyricsDetail = async (id: string, force = false) => {
  isLoading.value = true;
  try {
    const song = await getLyricsById(id, force);
    if (!song) return null;
    current.value = { ...current.value, ...song };

    availableLangs.value = ((current.value.contents?.map((e) => e.kind) ?? ['romaji']) as LyricsKeys[]).sort(
      (a, b) => langOrder.indexOf(a) - langOrder.indexOf(b),
    );

    return song;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const id = router.currentRoute.value.params.id;
  if (typeof id === 'string' && id) {
    fetchLyricsDetail(id);
  }
});

watch(
  () => router.currentRoute.value.params.id,
  (id, previousId) => {
    if (typeof id !== 'string' || !id || id === previousId) return;
    fetchLyricsDetail(id);
  },
);

watch(
  () => player.isReady,
  () => {
    if (!player.videoId && current.value) {
      player.selectSong(current.value);
    }
  },
);

const togglePlay = () => {
  if (mode.value === 'off') return;

  if (isPlaying.value) {
    player.pause();
  } else {
    player.play();
  }
};

const refreshCurrentLyrics = () => {
  if (!videoId.value) return;
  void fetchLyricsDetail(videoId.value, true);
};
</script>

<template>
  <div class="flex h-full min-h-[80vh] w-full flex-col items-center px-3 pb-1 pt-3">
    <BackButton />
    <RoundButton @click="showMore = true" />

    <div class="relative mt-5 size-[150px] shrink-0">
      <YoutubeThumbnail :id="videoId" class="box-cover overflow-hidden rounded-card" />

      <SongCoverList />
    </div>
    <div
      class="mt-2 flex h-[50px] w-full max-w-[340px] shrink-0 flex-col items-center justify-center space-y-1 overflow-hidden px-2 md:max-w-[450px]"
    >
      <MarqueeText :text="displayTitle" class="w-full min-w-0 shrink-0 text-center text-lg font-bold" :gap="50" />
      <MarqueeText :text="displayArtist" class="w-full min-w-0 shrink-0 text-center text-sm font-bold text-gray-500" :gap="50" />
    </div>

    <div class="mt-3 w-[340px] md:w-[450px]">
      <PlayerSeekBar time-class="text-xs text-gray-500" />

      <div class="flex w-full items-center justify-center">
        <div class="flex flex-1"></div>
        <button class="mr-4 size-4 md:mr-8 md:size-6" @click="player.toggleShuffle()" :class="{ 'opacity-50': !shuffle }">
          <img :src="ShuffleImage" />
        </button>
        <button class="size-6 md:size-8" @click="player.playPrevious()"><img :src="PrevImage" /></button>
        <button class="mx-4 size-7 md:mx-10 md:size-10" @click="togglePlay"><img :src="isPlaying ? PauseImage : PlayImage" /></button>
        <button class="size-6 md:size-8" @click="player.playNext()"><img :src="NextImage" /></button>
        <button class="ml-4 size-4 md:ml-8 md:size-6" @click="player.toggleRepeatOne()" :class="{ 'opacity-50': !repeatOne }">
          <img :src="RepeatImage" />
        </button>

        <div class="flex flex-1 justify-end">
          <LoopSetting />
        </div>
      </div>
    </div>

    <LyricsLoadingState v-if="isLoading" />

    <div v-else class="box-cover mt-5 w-full flex-1 rounded-xl bg-white pb-4 pt-4 md:max-w-[700px] md:rounded-2xl md:pb-6 md:pt-6">
      <div class="mb-3 flex w-full items-center gap-2 px-3 md:px-6">
        <button
          v-for="lang in availableLangs"
          :key="lang"
          @click="currentLang = lang"
          class="p-1 font-semibold hover:text-[#b960b3] md:text-lg"
          :class="{ 'text-[#b960b3]': currentLang == lang }"
          :disabled="currentLang == lang"
        >
          {{ langKey[lang] ?? lang }}
        </button>
      </div>
      <p class="h-fit whitespace-pre-line text-center text-base lowercase md:text-2xl">
        {{ lyricsContent || 'No lyrics available' }}
      </p>
    </div>

    <LyricsDetailMoreOptions v-model:show="showMore" @refresh="refreshCurrentLyrics" />
    <CreatePlaylist />
  </div>
</template>
