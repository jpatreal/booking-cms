<template>
  <span
    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] border"
    :class="classes"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  role: 'OWNER' | 'MANAGER' | 'STAFF';
}>();

const map = {
  OWNER: {
    label: 'Owner',
    classes: 'border-amber-400/70 text-amber-300 bg-amber-900/30',
  },
  MANAGER: {
    label: 'Manager',
    classes: 'border-sky-400/60 text-sky-300 bg-sky-900/30',
  },
  STAFF: {
    label: 'Staff',
    classes: 'border-slate-600 text-slate-300 bg-slate-900/40',
  },
} as const;

const label = map[props.role].label;
const classes = map[props.role].classes;
</script>
