<template>
  <button
    :type="type"
    :class="[
      'inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition',
      'focus:outline-none focus:ring-2 focus:ring-brand-500/70 focus:ring-offset-0',
      variantClass,
      block ? 'w-full' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-[1px]',
    ]"
    :disabled="disabled || loading"
  >
    <span
      v-if="loading"
      class="w-3 h-3 border-[2px] border-slate-400 border-t-transparent rounded-full animate-spin"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'outline' | 'danger';
    type?: 'button' | 'submit';
    block?: boolean;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    type: 'button',
    block: false,
    loading: false,
    disabled: false,
  }
);

const variantClass = computed(() => {
  switch (props.variant) {
    case 'ghost':
      return 'bg-transparent text-slate-300 hover:bg-slate-900/60';
    case 'outline':
      return 'bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-900/60';
    case 'danger':
      return 'bg-rose-600/90 text-white hover:bg-rose-500';
    default:
      return 'bg-brand-600 text-white hover:bg-brand-500';
  }
});
</script>
