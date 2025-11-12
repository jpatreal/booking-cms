<template>
  <RouterLink
    v-if="!disabled"
    :to="to"
    custom
    v-slot="{ href, navigate, isActive, isExactActive }"
  >
    <a
      :href="href"
      @click="navigate"
      class="group relative flex items-center gap-2 px-2.5 py-1.8 rounded-xl text-[10px] transition
            border border-transparent
            hover:bg-slate-900/90 hover:border-slate-800
            text-slate-300"
      :class="{
        'bg-slate-900 border-brand-500/40 text-brand-300 shadow-[0_0_12px_rgba(56,189,248,0.18)]':
          isActive || isExactActive,
      }"
    >
      <!-- Active left bar -->
      <div
        class="w-0.5 h-4.5 rounded-full bg-brand-500/0 mr-0.5 transition-all"
        :class="{ 'bg-brand-500/90': isActive || isExactActive }"
      ></div>

      <!-- Medium icon size -->
      <component
        :is="icon"
        class="w-3.5 h-3.5 shrink-0 transition-transform"
        :class="{
          'text-brand-400': isActive || isExactActive,
          'text-slate-500 group-hover:text-slate-300': !(isActive || isExactActive),
          'group-hover:-translate-y-[1px]': true,
        }"
      />

      <div class="flex flex-col leading-tight">
        <span class="truncate">{{ label }}</span>
        <span v-if="hint" class="text-[8px] text-slate-500">
          {{ hint }}
        </span>
      </div>
    </a>
  </RouterLink>

  <!-- Disabled / coming soon -->
  <div
    v-else
    class="flex items-center gap-2 px-2.5 py-1.8 rounded-xl text-[14px] text-slate-600 bg-slate-950/40 border border-slate-900 cursor-default"
  >
    <component :is="icon" class="w-3.5 h-3.5 text-slate-600" />
    <div class="flex flex-col leading-tight">
      <span class="truncate">{{ label }}</span>
      <span v-if="hint" class="text-[8px] text-slate-600">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  to: string;
  label: string;
  icon: Component;
  hint?: string;
  disabled?: boolean;
}>();
</script>
