<template>
  <div class="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 space-y-3">
    <div>
      <h2 class="text-sm font-semibold text-slate-50">Contact details</h2>
      <p class="cms-caption">
        Shown on your public booking page so customers know how to reach you.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      <!-- Email -->
      <div class="space-y-1">
        <label class="block cms-label">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="hello@example.com"
        />
        <p class="cms-caption-muted">For booking confirmations and inquiries.</p>
      </div>

      <!-- Phone -->
      <div class="space-y-1">
        <label class="block cms-label">Phone</label>
        <input
          v-model="form.phone"
          type="tel"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="+63 9XX XXX XXXX"
        />
        <p class="cms-caption-muted">Optional mobile or landline number.</p>
      </div>

      <!-- Website -->
      <div class="space-y-1">
        <label class="block cms-label">Website</label>
        <input
          v-model="form.website"
          type="url"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="https://yourclinic.com"
        />
      </div>

      <!-- Facebook -->
      <div class="space-y-1">
        <label class="block cms-label">Facebook</label>
        <input
          v-model="form.facebookUrl"
          type="url"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="Facebook page URL"
        />
      </div>

      <!-- Instagram -->
      <div class="space-y-1">
        <label class="block cms-label">Instagram</label>
        <input
          v-model="form.instagramUrl"
          type="url"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="Instagram profile URL"
        />
      </div>

      <!-- TikTok -->
      <div class="space-y-1">
        <label class="block cms-label">TikTok</label>
        <input
          v-model="form.tiktokUrl"
          type="url"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="TikTok profile URL"
        />
      </div>

      <!-- Messenger -->
      <div class="space-y-1">
        <label class="block cms-label">Messenger</label>
        <input
          v-model="form.messenger"
          type="text"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="Messenger link or username"
        />
      </div>

      <!-- Viber -->
      <div class="space-y-1">
        <label class="block cms-label">Viber</label>
        <input
          v-model="form.viber"
          type="text"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="Viber number or link"
        />
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-1">
      <BaseButton variant="outline" size="sm" :loading="saving" @click="emit('save')">
        Save contact
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRaw } from 'vue';
import BaseButton from '../ui/BaseButton.vue'; // adjust path if needed

type Contact = {
  email?: string;
  phone?: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  messenger?: string;
  viber?: string;
};

const props = defineProps<{
  modelValue: Contact;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: Contact): void;
  (e: 'save'): void;
}>();

// Local editable copy (same pattern as AddressCard)
const form = ref<Contact>({
  email: props.modelValue?.email ?? '',
  phone: props.modelValue?.phone ?? '',
  website: props.modelValue?.website ?? '',
  facebookUrl: props.modelValue?.facebookUrl ?? '',
  instagramUrl: props.modelValue?.instagramUrl ?? '',
  tiktokUrl: props.modelValue?.tiktokUrl ?? '',
  messenger: props.modelValue?.messenger ?? '',
  viber: props.modelValue?.viber ?? '',
});

// Sync down from parent when modelValue changes
watch(
  () => props.modelValue,
  (v) => {
    form.value = {
      email: v?.email ?? '',
      phone: v?.phone ?? '',
      website: v?.website ?? '',
      facebookUrl: v?.facebookUrl ?? '',
      instagramUrl: v?.instagramUrl ?? '',
      tiktokUrl: v?.tiktokUrl ?? '',
      messenger: v?.messenger ?? '',
      viber: v?.viber ?? '',
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
