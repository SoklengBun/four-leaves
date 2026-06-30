<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlayer } from '~/stores/player';
import { getLyricsArtistsLabel, getLyricsTitleLabel } from '~/utils/lyrics';
import { useRouter } from 'vue-router';

const router = useRouter();
const player = usePlayer();
const { mode, current, videoId, artists, isPlaying, showPlaylist, playlist } = storeToRefs(player);

const playlistItems = computed(() => playlist.value?.items ?? []);
const currentIndex = computed(() => playlistItems.value.findIndex((song) => song.id === current.value?.id));
const currentPlaylistTitle = computed(() => playlist.value?.name || 'Soft Cloud Mix');
const currentPlaylistDescription = computed(() => playlist.value?.description || 'A fluffy little queue for your current listening session.');
const currentSongArtists = computed(() =>
  artists.value?.length ? getLyricsArtistsLabel(artists.value) : getLyricsArtistsLabel(current.value?.artists),
);

const selectSong = (song: PlaylistItem) => {
  player.selectSong(song, undefined, playlist.value);
  router.replace({ name: 'lyrics-detail', params: { id: song.id } });
};

const closePlaylist = () => {
  showPlaylist.value = false;
};
</script>

<template>
  <van-popup
    v-if="playlist?.items?.length"
    v-model:show="showPlaylist"
    position="right"
    :style="{
      width: '340px',
      height: '100%',
    }"
    class="playlist-popup"
  >
    <div class="playlist-shell h-full w-full overflow-hidden">
      <div class="playlist-glow playlist-glow--top"></div>
      <div class="playlist-glow playlist-glow--bottom"></div>

      <div class="playlist-content flex h-full flex-col">
        <div class="playlist-hero">
          <button type="button" class="playlist-close" @click="closePlaylist">Close</button>

          <p class="playlist-kicker">Now playing</p>
          <h2 class="playlist-title">{{ currentPlaylistTitle }}</h2>
          <p class="playlist-description">
            {{ currentPlaylistDescription }}
          </p>
        </div>

        <div class="playlist-list-wrap flex flex-1 flex-col rounded-t-2xl px-3 pt-3">
          <div class="playlist-list-header">
            <p class="playlist-list-title">Playlist queue</p>
            <p class="playlist-list-subtitle">Tap any track to hop into a softer mood.</p>
          </div>

          <div class="playlist-list pb-3">
            <button
              v-for="(song, index) in playlistItems"
              :key="song.id"
              type="button"
              class="playlist-item"
              :class="{ 'playlist-item--active': song.id === current?.id || song.videoId === videoId }"
              @click="selectSong(song)"
            >
              <div class="playlist-item-index">
                {{ String(index + 1).padStart(2, '0') }}
              </div>

              <div class="playlist-item-copy">
                <p class="playlist-item-title">
                  {{ getLyricsTitleLabel(song) }}
                </p>
                <p class="playlist-item-artist">
                  {{ getLyricsArtistsLabel(song.artists) || 'Unknown artist' }}
                </p>
                <p v-if="song.note" class="playlist-item-note">
                  {{ song.note }}
                </p>
              </div>

              <div class="playlist-item-state">
                {{ song.id === current?.id || song.videoId === videoId ? (isPlaying ? 'Playing' : 'Ready') : 'Play' }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.playlist-popup {
  background: transparent;
}

.playlist-shell {
  position: relative;
  background: radial-gradient(circle at top left, #ffffffeb, transparent 38%),
    linear-gradient(180deg, #fff6fb 0%, #fff0f7 42%, #fdf5ff 100%);
  color: #6e4b62;
}

.playlist-content {
  position: relative;
  z-index: 1;
}

.playlist-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(12px);
  opacity: 0.8;
  pointer-events: none;
}

.playlist-glow--top {
  top: 28px;
  right: 20px;
  width: 140px;
  height: 140px;
  background: #ffc4de8c;
}

.playlist-glow--bottom {
  bottom: 48px;
  left: -24px;
  width: 160px;
  height: 160px;
  background: #d3c5ff73;
}

.playlist-hero {
  padding: 20px 18px 18px;
}

.playlist-close {
  margin-left: auto;
  display: block;
  border: 0;
  border-radius: 999px;
  background: #ffffffc7;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #8b6079;
  box-shadow: 0 8px 18px #e5b1cb3d;
}

.playlist-kicker {
  margin: 10px 0 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #d48cae;
}

.playlist-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.05;
  font-weight: 800;
  color: #7b4c69;
}

.playlist-description {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: #9d7890;
}

.playlist-now-card {
  margin-top: 18px;
  border: 1px solid #ffffffe6;
  border-radius: 28px;
  background: linear-gradient(180deg, #fffffff2, #fff4fad1);
  padding: 18px;
  box-shadow:
    0 20px 40px #e2b5ca38,
    inset 0 1px 0 #fffffff2;
}

.playlist-now-badge {
  display: inline-flex;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffb3d1, #d7c4ff);
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: white;
}

.playlist-now-song {
  font-size: 16px;
  line-height: 1.35;
  font-weight: 800;
  color: #7c5167;
}

.playlist-now-artist {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #a17b92;
}

.playlist-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.playlist-pill {
  border-radius: 999px;
  background: #ffeef6e6;
  padding: 7px 11px;
  font-size: 11px;
  font-weight: 700;
  color: #b06f92;
}

.playlist-list-wrap {
  min-height: 0;
  background: #ffffff94;
  backdrop-filter: blur(8px);
}

.playlist-list-header {
  padding: 0 4px 12px;
}

.playlist-list-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #80556f;
}

.playlist-list-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: #ab8399;
}

.playlist-list {
  display: flex;
  max-height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
  padding-right: 2px;
}

.playlist-item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border: 1px solid #ffffffe0;
  border-radius: 24px;
  background: #ffffffd1;
  padding: 14px 12px;
  text-align: left;
  box-shadow: 0 14px 26px #e6c4d82e;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.playlist-item:active {
  transform: scale(0.985);
}

.playlist-item--active {
  border-color: #f4abd1eb;
  background: linear-gradient(135deg, #fff5fafa, #f7f0fff5);
  box-shadow: 0 18px 30px #dcacd33d;
}

.playlist-item-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ffd5e6, #e1d7ff);
  font-size: 12px;
  font-weight: 800;
  color: #8a5d73;
}

.playlist-item-copy {
  min-width: 0;
}

.playlist-item-title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 800;
  color: #754f62;
}

.playlist-item-artist,
.playlist-item-note {
  margin: 4px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: #a17f93;
}

.playlist-item-state {
  border-radius: 999px;
  background: #ffeef5f2;
  padding: 8px 11px;
  font-size: 11px;
  font-weight: 800;
  color: #bb6c93;
}
</style>
