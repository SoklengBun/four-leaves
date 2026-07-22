import { computed, ref, shallowRef, watch } from 'vue';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { usePlaylist } from './playlist';

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

export const usePlayer = defineStore('player', () => {
  const playlist = usePlaylist();
  const current = ref<PlaylistItem | null>(null);
  const videoId = ref<string>('');
  const artists = ref<LyricsArtist[]>([]);

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

  const shuffle = ref(false);
  const repeatOne = ref(false);

  const showPlaylist = ref(false);
  const router = useRouter();

  let timer: number | null = null;

  const progress = computed(() => {
    if (!duration.value) return 0;
    return (currentTime.value / duration.value) * 100;
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
      videoId: videoId.value,
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
          console.log('current videoId', videoId.value);
        },
      },
    });

    console.log('YT Player initialized', player.value);
  };

  const play = () => player.value?.playVideo();

  const pause = () => player.value?.pauseVideo();

  const seekTo = (time: number) => {
    player.value?.seekTo(Math.max(0, time), true);
  };

  const selectSong = async (song: PlaylistItem, coverId?: string, selectedPlaylist?: Playlist | null) => {
    const selectedId = coverId || song.defaultCoverId || song.videoId;

    if (selectedPlaylist) {
      playlist.list = selectedPlaylist;
    }

    if (videoId.value === selectedId) return;

    videoId.value = selectedId;
    current.value = song;

    if (coverId || song.defaultCoverId) {
      const cover = song.covers?.find((c) => c.id === selectedId);
      artists.value = cover?.artists ?? [];
    } else {
      artists.value = song.artists;
    }

    if (!videoId.value || !player.value || !isReady.value) return;

    pause();
    duration.value = 0;
    player.value.loadVideoById(videoId.value);
    play();

    const route = router.currentRoute.value;
    const isDetail = route.name === 'lyrics-detail';
    if (isDetail && route.params.id !== song.videoId) {
      router.replace({ params: { id: song.videoId } });
    }

    if (mode.value === 'off') mode.value = 'full';

    clearLoopRange();
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

  const playNext = (fromSongEnd = false) => {
    const lyricsList = playlist.list?.items ?? [];
    if (!lyricsList.length || !current.value) return;
    const currentIndex = lyricsList.findIndex((s) => s.id === current.value?.id);

    // Repeat current song
    if (repeatOne.value && fromSongEnd) {
      seekTo(0);
      play();
      return;
    }

    // Shuffle -> pick random different song when possible
    if (shuffle.value && lyricsList.length > 1) {
      let idx = currentIndex;
      while (idx === currentIndex) {
        idx = Math.floor(Math.random() * lyricsList.length);
      }
      const nextSong = lyricsList[idx];
      selectSong(nextSong);
      if (router.currentRoute.value.name === 'lyrics-detail') {
        router.replace({ params: { id: nextSong.videoId } });
      }
      return;
    }

    // Normal sequential next
    let nextIndex = currentIndex + 1;
    if (nextIndex >= lyricsList.length) {
      nextIndex = 0;
    }

    const nextSong = lyricsList[nextIndex];
    selectSong(nextSong);
    if (router.currentRoute.value.name === 'lyrics-detail') {
      router.replace({ params: { id: nextSong.videoId } });
    }
  };

  const playPrevious = () => {
    const lyricsList = playlist.list?.items ?? [];
    if (!lyricsList.length || !current.value) return;
    const currentIndex = lyricsList.findIndex((s) => s.id === current.value?.id);

    // Shuffle -> pick random different song when possible
    if (shuffle.value && lyricsList.length > 1) {
      let idx = currentIndex;
      while (idx === currentIndex) {
        idx = Math.floor(Math.random() * lyricsList.length);
      }
      const prevSong = lyricsList[idx];
      selectSong(prevSong);
      if (router.currentRoute.value.name === 'lyrics-detail') {
        router.replace({ params: { id: prevSong.videoId } });
      }
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = lyricsList.length - 1;
    }

    const previousSong = lyricsList[prevIndex];
    selectSong(previousSong);
    if (router.currentRoute.value.name === 'lyrics-detail') {
      router.replace({ params: { id: previousSong.videoId } });
    }
  };

  watch(songEnded, (ended) => {
    if (ended) playNext(true);
  });

  return {
    videoId,
    artists,
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
    setLoopPointA,
    setLoopPointB,
    clearLoopRange,
    toggleLoopEnabled,
    showPlaylist,
  };
});
