<!-- src/components/business/BusinessCreateModal.vue -->
<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="onClose"
    >
      <div class="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        <header class="space-y-1">
          <h2 class="text-sm font-semibold text-slate-50">Create a new business</h2>
          <p class="text-[9px] text-slate-500">
            Use this for another location or brand. Each account can create up to
            <span class="font-semibold text-slate-200">{{ maxBusinesses }}</span>
            businesses.
          </p>
          <p v-if="isAtLimit" class="text-[8px] text-amber-400 flex items-center gap-1">
            <span class="w-1 h-1 rounded-full bg-amber-400"></span>
            You’ve reached the maximum allowed businesses. Delete one to create another.
          </p>
        </header>

        <form class="space-y-3" @submit.prevent="submit" novalidate>
          <!-- Name -->
          <div class="space-y-1">
            <label class="block text-[8px] text-slate-500">Business name</label>
            <input
              v-model="name"
              type="text"
              class="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
              placeholder="e.g. Spidey Clinic - Downtown"
              :disabled="isAtLimit || loading"
            />
          </div>

          <!-- Timezone -->
          <div class="space-y-1">
            <label class="block text-[8px] text-slate-500">Timezone</label>
            <select
              v-model="timezone"
              class="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[9px] text-slate-100 outline-none focus:border-brand-500/80"
              :disabled="isAtLimit || loading"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Manila">Asia/Manila</option>
              <option value="Asia/Singapore">Asia/Singapore</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
            <p class="text-[7px] text-slate-500">
              This timezone will apply to opening hours and booking times.
            </p>
          </div>

          <!-- Hours (optional at create) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <label class="block text-[8px] text-slate-500"> Opening hours (optional) </label>
              <span class="text-[7px] text-slate-600">
                You can change this later in settings.
              </span>
            </div>
            <BusinessHoursEditor v-model="hours" />
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <BaseButton
              type="button"
              variant="ghost"
              size="xs"
              :disabled="loading"
              @click="onClose"
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              size="xs"
              :loading="loading"
              :disabled="isAtLimit"
            >
              Create business
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BusinessHoursEditor from '../../components/business/BusinessHoursEditor.vue';
import { useToastsStore } from '../../stores/toasts';
import { createBusiness, type BusinessHourItem } from '../../api/business';

const props = defineProps<{
  open: boolean;
  existingCount: number;
  maxBusinesses?: number; // default 2
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', payload: { id: string; name: string; slug: string }): void;
}>();

const toasts = useToastsStore();

const name = ref('');
const timezone = ref('UTC');
const hours = ref<BusinessHourItem[]>([]);
const loading = ref(false);

const maxBusinesses = computed(() => props.maxBusinesses ?? 2);
const isAtLimit = computed(() => props.existingCount >= maxBusinesses.value);

watch(
  () => props.open,
  (open) => {
    if (open) {
      // reset form when opened
      name.value = '';
      timezone.value = 'UTC';
      hours.value = [];
      loading.value = false;
    }
  }
);

function onClose() {
  if (loading.value) return;
  emit('close');
}

async function submit() {
  if (isAtLimit.value) {
    toasts.error('You have reached the maximum number of businesses for this account.');
    return;
  }

  if (!name.value.trim()) {
    toasts.error('Please enter a business name.');
    return;
  }

  loading.value = true;
  try {
    const payload: any = {
      name: name.value.trim(),
    };

    if (hours.value.length) {
      payload.hours = { items: hours.value };
    }

    const created = await createBusiness(payload);

    toasts.success('Business created successfully.');

    emit('created', {
      id: created.id,
      name: created.name,
      slug: created.slug,
    });

    onClose();
  } catch (e: any) {
    // If backend enforces 2-business rule, you might see 400/403 here
    toasts.error(
      e?.response?.data?.message || 'Failed to create business. You might have reached the limit.'
    );
  } finally {
    loading.value = false;
  }
}
</script>
