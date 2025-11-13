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
            <h2 class="text-base font-semibold text-slate-50">Services for {{ staff.name }}</h2>
            <p class="cms-caption">
              Choose which services this staff can perform and override pricing if needed.
            </p>
          </div>
          <button class="text-slate-500 hover:text-slate-200 text-sm" @click="emitClose">✕</button>
        </header>

        <div class="flex-1 overflow-y-auto space-y-2">
          <div v-if="loading" class="text-sm text-slate-500">Loading services...</div>

          <div v-else-if="rows.length === 0" class="text-sm text-slate-500">
            No services found. Create services first.
          </div>

          <div
            v-else
            v-for="row in rows"
            :key="row.serviceId"
            class="border border-slate-800 rounded-xl px-3 py-2.5 flex flex-col gap-1 bg-slate-950/80 text-sm"
          >
            <div class="flex items-center justify-between gap-2">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="row.assigned" class="w-4 h-4 accent-brand-500" />
                <div class="flex flex-col">
                  <span class="text-sm text-slate-100 font-medium">
                    {{ row.name }}
                  </span>
                  <span class="text-xs text-slate-500">
                    Base: ₱{{ row.basePrice }} • {{ row.baseDuration }} min
                  </span>
                </div>
              </label>
              <span
                v-if="row.assigned"
                class="text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/70"
              >
                Assigned
              </span>
            </div>

            <div v-if="row.assigned" class="grid grid-cols-2 gap-2 mt-1">
              <div>
                <label class="block text-xs text-slate-500 mb-0.5"> Price override (₱) </label>
                <input
                  v-model="row.priceOverrideInput"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-sm text-slate-100 outline-none focus:border-brand-500/80"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-0.5"> Duration override (min) </label>
                <input
                  v-model="row.durationOverrideInput"
                  type="number"
                  min="1"
                  step="1"
                  class="w-full rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-sm text-slate-100 outline-none focus:border-brand-500/80"
                />
              </div>
            </div>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
          <BaseButton variant="ghost" @click="emitClose"> Cancel </BaseButton>
          <BaseButton variant="primary" :loading="saving" @click="save"> Save changes </BaseButton>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import { useToastsStore } from '../../stores/toasts';
import { listServices } from '../../api/services';
import {
  fetchStaffServices,
  upsertStaffServices,
  removeStaffService,
  type Staff,
} from '../../api/staff';

const props = defineProps<{
  open: boolean;
  staff: Staff | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated'): void;
}>();

const toasts = useToastsStore();

interface Row {
  serviceId: string;
  name: string;
  basePrice: number;
  baseDuration: number;
  assigned: boolean;
  linkId?: string;
  priceOverrideInput: string;
  durationOverrideInput: string;
}

const rows = ref<Row[]>([]);
const loading = ref(false);
const saving = ref(false);

const staffId = computed(() => props.staff?.id || '');

function emitClose() {
  if (!saving.value) emit('close');
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.staff) {
      load();
    }
  }
);

async function load() {
  if (!staffId.value) return;
  loading.value = true;
  try {
    const [allServices, staffServices] = await Promise.all([
      listServices({ page: 1, pageSize: 500 }),
      fetchStaffServices(staffId.value),
    ]);

    const map = new Map(staffServices.map((ss) => [ss.serviceId, ss]));

    rows.value = allServices.items.map((svc) => {
      const link = map.get(svc.id);
      return {
        serviceId: svc.id,
        name: svc.name,
        basePrice: svc.price,
        baseDuration: svc.durationMin,
        assigned: !!link,
        linkId: link?.id,
        priceOverrideInput:
          link?.priceCentsOverride != null ? String(link.priceCentsOverride / 100) : '',
        durationOverrideInput:
          link?.durationMinOverride != null ? String(link.durationMinOverride) : '',
      };
    });
  } catch (e) {
    toasts.error('Failed to load staff services.');
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!staffId.value) return;
  saving.value = true;
  try {
    const toUpsert = rows.value
      .filter((r) => r.assigned)
      .map((r) => {
        const price =
          r.priceOverrideInput.trim() === ''
            ? null
            : Math.round(Number(r.priceOverrideInput) * 100);
        const dur = r.durationOverrideInput.trim() === '' ? null : Number(r.durationOverrideInput);
        return {
          serviceId: r.serviceId,
          isActive: true,
          priceCentsOverride: price,
          durationMinOverride: dur,
        };
      });

    const previouslyAssigned = rows.value.filter((r) => r.linkId).map((r) => r.serviceId);
    const nowAssigned = new Set(rows.value.filter((r) => r.assigned).map((r) => r.serviceId));
    const toRemove = previouslyAssigned.filter((sid) => !nowAssigned.has(sid));

    if (toUpsert.length) {
      await upsertStaffServices(staffId.value, toUpsert);
    }

    for (const sid of toRemove) {
      await removeStaffService(staffId.value, sid);
    }

    toasts.success('Staff services updated.');
    emit('updated');
    emitClose();
  } catch (e) {
    toasts.error('Failed to update staff services.');
  } finally {
    saving.value = false;
  }
}
</script>
