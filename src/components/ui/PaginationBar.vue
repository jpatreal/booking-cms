<template>
  <div
    v-if="total > pageSize"
    class="flex items-center justify-between gap-2 px-3 py-2 text-[8px] text-slate-400"
  >
    <div>
      Page
      <span class="text-slate-100">{{ page }}</span>
      of
      <span class="text-slate-100">{{ totalPages }}</span>
    </div>
    <div class="flex items-center gap-1">
      <button
        class="px-2 py-1 rounded-lg border border-slate-800 bg-slate-950/80 disabled:opacity-40"
        :disabled="page <= 1"
        @click="$emit('update:page', page - 1)"
      >
        Prev
      </button>
      <button
        class="px-2 py-1 rounded-lg border border-slate-800 bg-slate-950/80 disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="$emit('update:page', page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  page: number;
  pageSize: number;
  total: number;
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
</script>
