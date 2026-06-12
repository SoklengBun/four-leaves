import { computed, ref, shallowRef, watch } from 'vue';
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { useRouter } from 'vue-router';
type PlayerMode = 'off' | 'mini' | 'full';

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, options: Record<string, unknown>) => YTPlayer;
      PlayerState: {
        PLAYING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

let ytApiPromise: Promise<void> | null = null;

const loadYoutubeApi = () => {
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise<void>((resolve) => {
    const existing = document.querySelector('script[data-yt-iframe-api]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.ytIframeApi = 'true';
      document.head.appendChild(script);
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });

  return ytApiPromise;
};

const extractVideoId = (value: string) => {
  if (!value) return '';
  const v = value.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

  try {
    const url = new URL(v);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    if (url.hostname.includes('youtube.com')) {
      const byQuery = url.searchParams.get('v');
      if (byQuery) return byQuery;

      const parts = url.pathname.split('/');
      const embedIdx = parts.findIndex((p) => p === 'embed');
      if (embedIdx >= 0) return parts[embedIdx + 1] || '';
    }
  } catch {
    return '';
  }

  return '';
};

export const usePlayer = defineStore('player', () => {
  const src = ref('');
  const current = ref<Lyrics | null>(null);
  const player = shallowRef<YTPlayer | null>(null);
  const isReady = ref(false);
  const isPlaying = ref(false);
  const songEnded = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const mode = ref<PlayerMode>('off');
  const loopEnabled = ref(false);
  const loopPointA = ref<number | null>(null);
  const loopPointB = ref<number | null>(null);

  let timer: number | null = null;

  const progress = computed(() => {
    if (!duration.value) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  const currentArtist = computed(() => {
    const song = current.value;
    if (!song) return '';

    if (Array.isArray(song.url)) {
      const active = song.url.find((item) => extractVideoId(item.l) === extractVideoId(src.value));
      if (active?.a) return active.a;
    }

    if (song.artist) return song.artist;
    if (song.artists?.length) return song.artists.map((a) => a.name).join(', ');
    return '';
  });

  const hasValidLoopRange = computed(() => {
    if (loopPointA.value === null || loopPointB.value === null) return false;
    return loopPointB.value > loopPointA.value;
  });

  const clampToDuration = (time: number) => {
    if (!Number.isFinite(time)) return 0;
    return Math.min(Math.max(time, 0), duration.value || time);
  };

  const clearTimer = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  };

  const startTimer = () => {
    clearTimer();
    timer = window.setInterval(() => {
      if (!player.value || !isReady.value) return;
      currentTime.value = player.value.getCurrentTime();
      duration.value = player.value.getDuration();

      if (loopEnabled.value && hasValidLoopRange.value) {
        const pointA = loopPointA.value as number;
        const pointB = loopPointB.value as number;

        if (currentTime.value >= pointB) {
          player.value.seekTo(pointA, true);
          currentTime.value = pointA;
        }
      }
    }, 250);
  };

  const init = async (containerId: string) => {
    await loadYoutubeApi();
    if (!window.YT?.Player || player.value) return;

    console.log('containerId', containerId);
    console.log('element', document.getElementById(containerId));
    player.value = new window.YT.Player(containerId, {
      height: '0',
      width: '0',
      videoId: extractVideoId(src.value),
      playerVars: {
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          isReady.value = true;
          duration.value = player.value?.getDuration() ?? 0;
        },
        onStateChange: (e: { data: number }) => {
          console.log('YT state change', e.data);
          isPlaying.value = e.data === window.YT?.PlayerState.PLAYING;
          if (isPlaying.value) startTimer();
          else clearTimer();
          if (e.data === 0) {
            songEnded.value = true;
          } else {
            songEnded.value = false;
          }
        },
        onError: (e: any) => {
          console.log('YT error', e.data);
          console.log('current src', src.value);
        },
      },
    });

    console.log('YT Player initialized', player.value);
  };

  const selectSong = async (song: Lyrics) => {
    let youtubeId = song.url;
    if (typeof song.url === 'string') {
      youtubeId = song.url;
    } else {
      youtubeId = song.url?.[0].l || '';
    }

    console.log('selectSong called with:', { song, youtubeId });
    if (src.value === youtubeId) return;
    src.value = youtubeId;
    current.value = song;
    console.log('Selected song:', song);
    const videoId = extractVideoId(youtubeId);
    if (!videoId || !player.value || !isReady.value) return;
    console.log('videoId', videoId);
    player.value.loadVideoById(videoId);
    player.value.playVideo();

    if (mode.value === 'off') mode.value = 'full';

    clearLoopRange();
  };

  const play = () => {
    player.value?.playVideo();
  };

  const pause = () => {
    player.value?.pauseVideo();
  };

  const seekTo = (time: number) => {
    player.value?.seekTo(Math.max(0, time), true);
  };

  const destroy = () => {
    clearTimer();
    mode.value = 'off';
    player.value?.destroy();
    player.value = null;
    isReady.value = false;
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
  };

  const updateMode = (newMode: PlayerMode) => {
    if (mode.value === newMode) return;
    mode.value = newMode;
  };

  watch(mode, (newMode) => {
    let playerHeight = 'var(--player-full)';
    switch (newMode) {
      case 'mini':
        playerHeight = 'var(--player-mini)';
        break;
      case 'full':
        playerHeight = 'var(--player-full)';
        break;
      case 'off':
        playerHeight = '';
        break;
    }

    document.documentElement.style.setProperty('--player-height', playerHeight);
  });

  const lyricsList = useStorage<Lyrics[]>('lyrics-list', []);
  const router = useRouter();

  const shuffle = ref(false);
  const repeatOne = ref(false);

  const toggleShuffle = () => {
    shuffle.value = !shuffle.value;
  };

  const toggleRepeatOne = () => {
    repeatOne.value = !repeatOne.value;
  };

  const setLoopPointA = (time = currentTime.value) => {
    loopPointA.value = clampToDuration(time);
    if (hasValidLoopRange.value) return;
    loopEnabled.value = false;
  };

  const setLoopPointB = (time = currentTime.value) => {
    loopPointB.value = clampToDuration(time);
    if (hasValidLoopRange.value) return;
    loopEnabled.value = false;
  };

  const clearLoopRange = () => {
    loopEnabled.value = false;
    loopPointA.value = null;
    loopPointB.value = null;
  };

  const toggleLoopEnabled = () => {
    if (!hasValidLoopRange.value) {
      loopEnabled.value = false;
      return;
    }
    loopEnabled.value = !loopEnabled.value;
  };

  const switchVersion = (videoUrl: string) => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId || !player.value || !isReady.value) return;
    src.value = videoUrl;
    clearLoopRange();
    player.value.loadVideoById(videoId);
    player.value.playVideo();
  };

  const playNext = (fromSongEnd = false) => {
    if (!lyricsList.value.length || !current.value) return;
    const currentIndex = lyricsList.value.findIndex((s) => s.id === current.value?.id);

    // Repeat current song
    if (repeatOne.value && fromSongEnd) {
      seekTo(0);
      play();
      return;
    }

    // Shuffle -> pick random different song when possible
    if (shuffle.value && lyricsList.value.length > 1) {
      let idx = currentIndex;
      while (idx === currentIndex) {
        idx = Math.floor(Math.random() * lyricsList.value.length);
      }
      const nextSong = lyricsList.value[idx];
      selectSong(nextSong);
      if (router.currentRoute.value.name === 'lyrics-detail') {
        router.replace({ params: { id: nextSong.id } });
      }
      return;
    }

    // Normal sequential next
    let nextIndex = currentIndex + 1;
    if (nextIndex >= lyricsList.value.length) {
      // End of list and no repeat -> stop playback
      pause();
      return;
    }

    const nextSong = lyricsList.value[nextIndex];
    selectSong(nextSong);
    if (router.currentRoute.value.name === 'lyrics-detail') {
      router.replace({ params: { id: nextSong.id } });
    }
  };

  const playPrevious = () => {
    if (!lyricsList.value.length || !current.value) return;
    const currentIndex = lyricsList.value.findIndex((s) => s.id === current.value?.id);

    // Shuffle -> pick random different song when possible
    if (shuffle.value && lyricsList.value.length > 1) {
      let idx = currentIndex;
      while (idx === currentIndex) {
        idx = Math.floor(Math.random() * lyricsList.value.length);
      }
      const prevSong = lyricsList.value[idx];
      selectSong(prevSong);
      if (router.currentRoute.value.name === 'lyrics-detail') {
        router.replace({ params: { id: prevSong.id } });
      }
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      // Start of list and no repeat -> stop playback
      pause();
      return;
    }

    const previousSong = lyricsList.value[prevIndex];
    selectSong(previousSong);
    if (router.currentRoute.value.name === 'lyrics-detail') {
      router.replace({ params: { id: previousSong.id } });
    }
  };

  watch(songEnded, (ended) => {
    if (ended) playNext(true);
  });

  return {
    src,
    current,
    isReady,
    isPlaying,
    currentTime,
    duration,
    progress,
    init,
    selectSong,
    play,
    pause,
    seekTo,
    destroy,
    mode,
    updateMode,
    playNext,
    playPrevious,
    shuffle,
    repeatOne,
    loopEnabled,
    loopPointA,
    loopPointB,
    hasValidLoopRange,
    toggleShuffle,
    toggleRepeatOne,
    currentArtist,
    setLoopPointA,
    setLoopPointB,
    clearLoopRange,
    toggleLoopEnabled,
    switchVersion,
  };
});
