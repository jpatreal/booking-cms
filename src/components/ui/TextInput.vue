<template>
  <div class="space-y-1">
    <label v-if="label" class="text-[10px] uppercase tracking-wide text-slate-400">
      {{ label }}
      <span v-if="required" class="text-rose-400">*</span>
    </label>
    <div class="relative">
      <input
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand-500/80 placeholder:text-slate-600"
      />
    </div>
    <p v-if="hint" class="text-[9px] text-slate-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | number | undefined;
  label?: string;
  required?: boolean;
  hint?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>
