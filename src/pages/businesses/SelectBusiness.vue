<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
    <div class="w-full max-w-xl bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <h2 class="text-lg font-semibold mb-4">Select a business to manage</h2>
      <div v-if="loading" class="text-sm text-slate-500">Loading...</div>
      <div v-else-if="businesses.length === 0" class="text-sm text-slate-500">
        You have no businesses yet.
      </div>
      <ul class="space-y-2">
        <li
          v-for="b in businesses"
          :key="b.id"
          class="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500 cursor-pointer flex justify-between items-center"
          @click="go(b)"
        >
          <div>
            <div class="font-medium text-white">{{ b.name }}</div>
            <div class="text-xs text-slate-500">{{ b.slug }}</div>
          </div>
          <div class="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-300">
            {{ b.role }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useBusinessStore } from '../../stores/business';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

const businessStore = useBusinessStore();
const router = useRouter();
const loading = ref(true);

const { fetchMyBusinesses, setCurrent } = businessStore;
const { list } = storeToRefs(businessStore);

onMounted(async () => {
  await fetchMyBusinesses();
  loading.value = false;
});

const businesses = computed(() => list.value);

const go = (b: any) => {
  setCurrent(b);
  router.push({
    name: 'dashboard',
    params: {
      businessSlug: b.slug,
    },
  });
};
</script>
