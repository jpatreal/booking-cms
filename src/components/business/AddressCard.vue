<template>
  <div class="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 space-y-3">
    <div>
      <h2 class="text-sm font-semibold text-slate-50">Address</h2>
      <p class="cms-caption">Displayed on your booking page and in confirmations.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      <!-- Line 1 -->
      <div class="space-y-1 md:col-span-2">
        <label class="block cms-label">Address line 1</label>
        <input
          v-model="form.line1"
          type="text"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="House/Building, Street"
        />
      </div>

      <!-- Line 2 -->
      <div class="space-y-1 md:col-span-2">
        <label class="block cms-label">Address line 2</label>
        <input
          v-model="form.line2"
          type="text"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="Barangay, Suite/Unit (optional)"
        />
      </div>

      <!-- City -->
      <div class="space-y-1">
        <label class="block cms-label">City / Municipality</label>
        <input
          v-model="form.city"
          type="text"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="e.g. Sindangan"
        />
      </div>

      <!-- Province -->
      <div class="space-y-1">
        <label class="block cms-label">Province / State</label>
        <input
          v-model="form.province"
          type="text"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="e.g. Zamboanga del Norte"
        />
      </div>

      <!-- Postal -->
      <div class="space-y-1">
        <label class="block cms-label">Postal code</label>
        <input
          v-model="form.postalCode"
          type="text"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="e.g. 7112"
        />
      </div>

      <!-- Country -->
      <div class="space-y-1">
        <label class="block cms-label">Country</label>
        <input
          v-model="form.country"
          type="text"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="e.g. Philippines"
        />
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-1">
      <BaseButton variant="outline" size="sm" :loading="saving" @click="emit('save')">
        Save address
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRaw } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';

type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
};

const props = defineProps<{
  modelValue: Address;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: Address): void;
  (e: 'save'): void;
}>();

// Local editable copy
const form = ref<Address>({
  line1: props.modelValue?.line1 ?? '',
  line2: props.modelValue?.line2 ?? '',
  city: props.modelValue?.city ?? '',
  province: props.modelValue?.province ?? '',
  postalCode: props.modelValue?.postalCode ?? '',
  country: props.modelValue?.country ?? '',
});

// Sync down from parent when modelValue changes
watch(
  () => props.modelValue,
  (v) => {
    form.value = {
      line1: v?.line1 ?? '',
      line2: v?.line2 ?? '',
      city: v?.city ?? '',
      province: v?.province ?? '',
      postalCode: v?.postalCode ?? '',
      country: v?.country ?? '',
    };
  },
  { deep: true }
);

// Emit up on edits
watch(
  form,
  (v) => {
    emit('update:modelValue', { ...toRaw(v) });
  },
  { deep: true }
);

const saving = props.saving ?? false;
</script>
