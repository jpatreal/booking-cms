<template>
  <div class="space-y-1.5">
    <div
      v-for="day in days"
      :key="day.value"
      class="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800"
    >
      <div class="w-10 text-[9px] font-medium text-slate-100">
        {{ day.label }}
      </div>

      <label class="inline-flex items-center gap-1 text-[8px] text-slate-500 cursor-pointer">
        <input type="checkbox" v-model="day.open" class="w-3 h-3 accent-brand-500" />
        <span>Open</span>
      </label>

      <input
        v-model="day.start"
        type="time"
        :disabled="!day.open"
        class="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-[9px] text-slate-100 outline-none disabled:opacity-40 disabled:cursor-not-allowed focus:border-brand-500/80"
      />
      <span class="text-[9px] text-slate-500">-</span>
      <input
        v-model="day.end"
        type="time"
        :disabled="!day.open"
        class="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-[9px] text-slate-100 outline-none disabled:opacity-40 disabled:cursor-not-allowed focus:border-brand-500/80"
      />

      <button
        v-if="day.open"
        class="text-[8px] text-slate-500 hover:text-rose-400 px-1"
        @click="closeDay(day)"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface HourItem {
  dayOfWeek: number; // 1-7
  openTimeLocal: string; // '09:00:00'
  closeTimeLocal: string; // '17:00:00'
}

const props = defineProps<{
  modelValue: HourItem[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: HourItem[]): void;
}>();

const days = ref([
  { value: 1, label: 'Mon', open: false, start: '09:00', end: '17:00' },
  { value: 2, label: 'Tue', open: false, start: '09:00', end: '17:00' },
  { value: 3, label: 'Wed', open: false, start: '09:00', end: '17:00' },
  { value: 4, label: 'Thu', open: false, start: '09:00', end: '17:00' },
  { value: 5, label: 'Fri', open: false, start: '09:00', end: '17:00' },
  { value: 6, label: 'Sat', open: false, start: '09:00', end: '17:00' },
  { value: 7, label: 'Sun', open: false, start: '09:00', end: '17:00' },
]);

watch(
  () => props.modelValue,
  (incoming) => {
    const map = new Map((incoming || []).map((h) => [h.dayOfWeek, h]));
    days.value.forEach((d) => {
      const m = map.get(d.value);
      if (m) {
        d.open = true;
        d.start = m.openTimeLocal.slice(0, 5);
        d.end = m.closeTimeLocal.slice(0, 5);
      } else {
        d.open = false;
      }
    });
  },
  { immediate: true, deep: true }
);

watch(
  days,
  () => {
    const items: HourItem[] = days.value
      .filter((d) => d.open && d.start && d.end)
      .map((d) => ({
        dayOfWeek: d.value,
        openTimeLocal: d.start + ':00',
        closeTimeLocal: d.end + ':00',
      }));
    emit('update:modelValue', items);
  },
  { deep: true }
);

function closeDay(day: any) {
  day.open = false;
}
</script>
