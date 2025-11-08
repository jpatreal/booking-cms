<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium',
      variantClass,
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'success' | 'muted';
  }>(),
  { variant: 'default' }
);

const variantClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/70';
    case 'muted':
      return 'bg-slate-900 text-slate-400 border border-slate-800';
    default:
      return 'bg-brand-600/20 text-brand-300 border border-brand-500/40';
  }
});
</script>
