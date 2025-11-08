<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div
        class="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl animate-in fade-in zoom-in"
      >
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-semibold text-slate-100">
            {{ title }}
          </h2>
          <button class="text-slate-500 hover:text-slate-200 text-xs" @click="$emit('close')">
            ✕
          </button>
        </div>
        <p v-if="subtitle" class="text-[10px] text-slate-500 mb-3">
          {{ subtitle }}
        </p>
        <div class="space-y-3">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  subtitle?: string;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>
