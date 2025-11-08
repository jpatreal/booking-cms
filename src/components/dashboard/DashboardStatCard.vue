<template>
  <div
    class="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex flex-col justify-between gap-1"
  >
    <div class="text-[10px] uppercase tracking-wide text-slate-500">
      {{ label }}
    </div>
    <div class="text-xl font-semibold text-slate-50">
      {{ value }}
    </div>
    <div v-if="helper" class="text-[10px] text-slate-500">
      {{ helper }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  helper?: string;
}>();
</script>
