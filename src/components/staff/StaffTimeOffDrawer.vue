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
            <h2 class="text-sm font-semibold text-slate-50">Time off for {{ staff.name }}</h2>
            <p class="text-[10px] text-slate-500">
              Block dates when this staff is unavailable for bookings.
            </p>
          </div>
          <button class="text-slate-500 hover:text-slate-200 text-xs" @click="emitClose">✕</button>
        </header>

        <!-- Add form -->
        <div class="space-y-1 border border-slate-800 rounded-2xl p-3">
          <div class="text-[9px] text-slate-400 font-medium">Add time off</div>
          <div class="space-y-1.5">
            <div class="flex flex-col gap-0.5">
              <label class="text-[8px] text-slate-500">Start</label>
              <input
                v-model="form.start"
                type="datetime-local"
                class="w-full rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-[9px] text-slate-100 outline-none focus:border-brand-500/80"
              />
            </div>
            <div class="flex flex-col gap-0.5">
              <label class="text-[8px] text-slate-500">End</label>
              <input
                v-model="form.end"
                type="datetime-local"
                class="w-full rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-[9px] text-slate-100 outline-none focus:border-brand-500/80"
              />
            </div>
            <div class="flex flex-col gap-0.5">
              <label class="text-[8px] text-slate-500">Reason</label>
              <input
                v-model="form.reason"
                type="text"
                placeholder="Optional, internal only"
                class="w-full rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-[9px] text-slate-100 outline-none placeholder:text-slate-600"
              />
            </div>
          </div>
          <div class="flex justify-end pt-1 gap-2">
            <BaseButton variant="outline" :loading="creating" @click="create"> Add </BaseButton>
          </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto space-y-2">
          <div v-if="loading" class="text-xs text-slate-500">Loading time off...</div>
          <div v-else-if="items.length === 0" class="text-xs text-slate-500">
            No time off set yet.
          </div>
          <div
            v-else
            v-for="t in items"
            :key="t.id"
            class="flex items-start justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[9px]"
          >
            <div class="flex-1">
              <div class="text-slate-100">{{ fmt(t.startUtc) }} → {{ fmt(t.endUtc) }}</div>
              <div class="text-slate-500">
                {{ t.reason || 'No reason provided' }}
              </div>
            </div>
            <button class="text-slate-500 hover:text-rose-400 text-[10px]" @click="remove(t)">
              ✕
            </button>
          </div>
        </div>

        <footer class="flex justify-end pt-1 border-t border-slate-900">
          <BaseButton variant="ghost" @click="emitClose"> Close </BaseButton>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import { useToastsStore } from '../../stores/toasts';
import {
  fetchStaffTimeOff,
  createStaffTimeOff,
  deleteStaffTimeOff,
  type Staff,
  type StaffTimeOff,
} from '../../api/staff';
import { fromZonedTime } from 'date-fns-tz';

const props = defineProps<{
  open: boolean;
  staff: Staff | null;
  businessTz: string; // <-- pass e.g. bookingConfig.business.timezone
}>();

const emit = defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>();
const toasts = useToastsStore();

const items = ref<StaffTimeOff[]>([]);
const loading = ref(false);
const creating = ref(false);

const form = ref({ start: '', end: '', reason: '' });
const staffId = computed(() => props.staff?.id || '');

function emitClose() {
  if (!creating.value) emit('close');
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && staffId.value) await load();
  }
);

async function load() {
  loading.value = true;
  try {
    items.value = await fetchStaffTimeOff(staffId.value);
  } catch {
    toasts.error('Failed to load time off.');
  } finally {
    loading.value = false;
  }
}

// Build "YYYY-MM-DDTHH:mm:00"
function asLocalIsoSeconds(v: string) {
  if (!v) return '';
  return v.length === 16 ? `${v}:00` : v;
}

function bizLocalToUtc(local: string, tz: string): string {
  const localIso = asLocalIsoSeconds(local);
  const utcDate = fromZonedTime(localIso, tz || 'UTC');
  return utcDate.toISOString();
}

function sameLocalDay(a: string, b: string, tz: string) {
  const A = new Date(fromZonedTime(asLocalIsoSeconds(a), tz));
  const B = new Date(fromZonedTime(asLocalIsoSeconds(b), tz));
  return (
    A.getUTCFullYear() === B.getUTCFullYear() &&
    A.getUTCMonth() === B.getUTCMonth() &&
    A.getUTCDate() === B.getUTCDate()
  );
}

async function create() {
  if (!staffId.value) return;

  if (!form.value.start || !form.value.end) {
    toasts.error('Start and end are required.');
    return;
  }

  // Frontend validations mirroring backend
  const tz = props.businessTz || 'UTC';
  if (!sameLocalDay(form.value.start, form.value.end, tz)) {
    toasts.error('Time off cannot cross days. Create separate entries per day.');
    return;
  }

  const startUtc = bizLocalToUtc(form.value.start, tz);
  const endUtc = bizLocalToUtc(form.value.end, tz);

  if (new Date(startUtc) >= new Date(endUtc)) {
    toasts.error('Start must be before end.');
    return;
  }

  creating.value = true;
  try {
    const created = await createStaffTimeOff(staffId.value, {
      startUtc,
      endUtc,
      reason: form.value.reason.trim(),
    });
    items.value = [created, ...items.value];
    form.value = { start: '', end: '', reason: '' };
    toasts.success('Time off added.');
    emit('updated');
  } catch (e: any) {
    toasts.error(e?.data?.message || 'Failed to add time off.');
  } finally {
    creating.value = false;
  }
}

async function remove(t: StaffTimeOff) {
  if (!staffId.value) return;
  try {
    await deleteStaffTimeOff(staffId.value, t.id);
    items.value = items.value.filter((x) => x.id !== t.id);
    toasts.success('Time off removed.');
    emit('updated');
  } catch (e: any) {
    toasts.error(e?.data?.message || 'Failed to remove time off.');
  }
}

function fmt(iso: string): string {
  const tz = props.businessTz || 'UTC';
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  }).format(new Date(iso));
}
</script>
