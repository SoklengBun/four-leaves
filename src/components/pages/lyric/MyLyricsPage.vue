<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import useAppFetch from '~/services';
import showToast from '~/utils/toast';

type MyLyric = {
  id: number;
  summary?: string;
  titles?: Array<{ id?: number; title: string }>;
  artists?: Array<{ id: number; name: string }>;
  createdById?: number;
};

const router = useRouter();
const list = ref<MyLyric[]>([]);
const isLoading = ref(false);

const fetchMine = async () => {
  isLoading.value = true;
  try {
    const { data } = await useAppFetch('lyrics/mine').get().json();
    if (data.value && data.value.code === 0) {
      list.value = data.value.data || [];
    } else {
      const msg = data.value?.message || 'Failed to fetch';
      if (data.value?.code === 401) {
        showToast({ message: 'Please sign in to view your lyrics', type: 'warning' });
        router.push({ name: 'login', query: { redirect: '/lyrics/mine' } });
        return;
      }
      showToast({ message: msg, type: 'error' });
    }
  } catch (e) {
    showToast({ message: 'Network error while fetching', type: 'error' });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMine();
});

const onView = (id: number) => router.push({ name: 'lyrics-detail', params: { id } });
const onEdit = (id: number) => router.push({ name: 'lyrics-edit', params: { id } });
</script>

<template>
  <div class="mx-auto max-w-4xl p-6">
    <header class="mb-4">
      <h1 class="text-2xl font-semibold">My Lyrics</h1>
      <p class="text-muted-foreground text-sm">Your created lyrics. Edit or view entries.</p>
    </header>

    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <div v-if="!list.length">You have no lyrics yet.</div>

      <!-- Desktop table -->
      <table v-else class="hidden w-full table-auto sm:table">
        <thead>
          <tr class="text-left">
            <th class="px-2 py-1">Title</th>
            <th class="px-2 py-1">Artists</th>
            <th class="px-2 py-1">Summary</th>
            <th class="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id" class="border-t">
            <td class="px-2 py-2">{{ item.titles && item.titles[0] ? item.titles[0].title : '—' }}</td>
            <td class="px-2 py-2">{{ (item.artists || []).map((a) => a.name).join(', ') }}</td>
            <td class="px-2 py-2">{{ item.summary || '' }}</td>
            <td class="px-2 py-2">
              <button @click="onView(item.id)" class="mr-2 rounded bg-blue-600 px-2 py-1 text-white">View</button>
              <button @click="onEdit(item.id)" class="rounded bg-yellow-600 px-2 py-1 text-white">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile list -->
      <div class="space-y-3 sm:hidden">
        <div v-for="item in list" :key="item.id" class="rounded border p-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold">{{ item.titles && item.titles[0] ? item.titles[0].title : '—' }}</div>
              <div class="text-muted-foreground text-sm">{{ (item.artists || []).map((a) => a.name).join(', ') }}</div>
            </div>
            <div class="ml-2 flex flex-col items-end">
              <button @click="onView(item.id)" class="mb-2 w-24 rounded bg-blue-600 px-2 py-1 text-white">View</button>
              <button @click="onEdit(item.id)" class="w-24 rounded bg-yellow-600 px-2 py-1 text-white">Edit</button>
            </div>
          </div>
          <div class="mt-2 text-sm">{{ item.summary || '' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
