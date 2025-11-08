<template>
  <button
    class="p-2 rounded-lg transition text-slate-400 hover:text-brand-400 hover:bg-slate-900 border border-transparent hover:border-slate-800"
    :title="title"
    @click="$emit('click', $event)"
  >
    <component :is="icon" class="w-4 h-4" />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  icon: Component;
  title?: string;
}>();

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>
