<template>
  <teleport to="body">
    <div
      v-if="open && staff"
      class="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm"
      @click.self="emitClose"
    >
      <div
        class="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 p-4 flex flex-col gap-3"
      >
        <header class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-semibold text-slate-50">Availability for {{ staff.name }}</h2>
            <p class="text-[10px] text-slate-500">Define regular working hours per weekday.</p>
          </div>
          <button class="text-slate-500 hover:text-slate-200 text-xs" @click="emitClose">✕</button>
        </header>

        <div class="flex-1 overflow-y-auto space-y-2">
          <div v-if="loading" class="text-xs text-slate-500">Loading availability...</div>

          <div v-else class="space-y-1.5 text-[9px]">
            <div
              v-for="day in days"
              :key="day.value"
              class="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800"
            >
              <label class="w-16 font-medium text-slate-100">
                {{ day.label }}
              </label>
              <label class="inline-flex items-center gap-1 text-slate-400">
                <input type="checkbox" v-model="day.enabled" class="w-3 h-3 accent-brand-500" />
                <span>Open</span>
              </label>
              <input
                v-model="day.start"
                :disabled="!day.enabled"
                type="time"
                class="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 outline-none text-[9px] text-slate-100 disabled:opacity-40"
              />
              <span>-</span>
              <input
                v-model="day.end"
                :disabled="!day.enabled"
                type="time"
                class="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 outline-none text-[9px] text-slate-100 disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
          <BaseButton variant="ghost" @click="emitClose"> Cancel </BaseButton>
          <BaseButton variant="primary" :loading="saving" @click="save">
            Save availability
          </BaseButton>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import { useToastsStore } from '../../stores/toasts';
import { fetchStaffAvailability, upsertStaffAvailability, type Staff } from '../../api/staff';

const props = defineProps<{
  open: boolean;
  staff: Staff | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated'): void;
}>();

const toasts = useToastsStore();

const loading = ref(false);
const saving = ref(false);

const staffId = computed(() => props.staff?.id || '');

const days = ref([
  { value: 1, label: 'Mon', enabled: false, start: '09:00', end: '17:00' },
  { value: 2, label: 'Tue', enabled: false, start: '09:00', end: '17:00' },
  { value: 3, label: 'Wed', enabled: false, start: '09:00', end: '17:00' },
  { value: 4, label: 'Thu', enabled: false, start: '09:00', end: '17:00' },
  { value: 5, label: 'Fri', enabled: false, start: '09:00', end: '17:00' },
  { value: 6, label: 'Sat', enabled: false, start: '09:00', end: '17:00' },
  { value: 7, label: 'Sun', enabled: false, start: '09:00', end: '17:00' },
]);

function emitClose() {
  if (!saving.value) emit('close');
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && staffId.value) {
      await load();
    }
  }
);

async function load() {
  loading.value = true;
  try {
    const existing = await fetchStaffAvailability(staffId.value);
    const map = new Map(existing.map((a) => [a.dayOfWeek, a]));
    days.value.forEach((d) => {
      const found = map.get(d.value);
      if (found) {
        d.enabled = true;
        d.start = found.startTimeLocal.slice(0, 5);
        d.end = found.endTimeLocal.slice(0, 5);
      } else {
        d.enabled = false;
      }
    });
  } catch (e) {
    toasts.error('Failed to load availability.');
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!staffId.value) return;
  saving.value = true;
  try {
    const items = days.value
      .filter((d) => d.enabled)
      .map((d) => ({
        dayOfWeek: d.value,
        startTimeLocal: d.start + ':00',
        endTimeLocal: d.end + ':00',
      }));

    await upsertStaffAvailability(staffId.value, items);
    toasts.success('Availability updated.');
    emit('updated');
    emitClose();
  } catch (e) {
    toasts.error('Failed to save availability.');
  } finally {
    saving.value = false;
  }
}
</script>
