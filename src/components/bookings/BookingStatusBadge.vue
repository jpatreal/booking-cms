<template>
  <span
    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-medium border"
    :class="badgeClass"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | string;
}>();

const label = computed(() => {
  switch (props.status) {
    case 'PENDING':
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'NO_SHOW':
      return 'No-show';
    default:
      return props.status || 'Unknown';
  }
});

const badgeClass = computed(() => {
  switch (props.status) {
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/40';
    case 'CONFIRMED':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40';
    case 'COMPLETED':
      return 'bg-sky-500/10 text-sky-300 border-sky-500/40';
    case 'CANCELLED':
      return 'bg-rose-500/10 text-rose-300 border-rose-500/40';
    case 'NO_SHOW':
      return 'bg-slate-800/80 text-slate-200 border-slate-600/70';
    default:
      return 'bg-slate-900 text-slate-300 border-slate-700';
  }
});
</script>
