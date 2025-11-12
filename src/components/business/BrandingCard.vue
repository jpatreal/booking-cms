<template>
  <!-- Branding card -->
  <div class="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 space-y-3">
    <div>
      <h2 class="text-[11px] font-semibold text-slate-50">Branding</h2>
      <p class="text-[9px] text-slate-500">
        Logo, primary color, and tagline displayed on your booking page.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
      <!-- Logo URL -->
      <div class="space-y-1 md:col-span-2">
        <label class="block text-[8px] text-slate-500">Logo URL</label>
        <input
          v-model="form.logoUrl"
          type="url"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="https://…/logo.png"
        />
        <div v-if="form.logoUrl" class="mt-2 flex items-center gap-2">
          <img :src="form.logoUrl" alt="Logo preview" class="h-8 w-auto rounded" />
          <span class="text-[8px] text-slate-500">Preview</span>
        </div>
      </div>

      <!-- Primary color -->
      <div class="space-y-1">
        <label class="block text-[8px] text-slate-500">Primary color</label>
        <div class="flex items-center gap-2">
          <input
            v-model="form.primaryColor"
            type="text"
            class="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
            placeholder="#3b82f6"
          />
          <input
            v-model="form.primaryColor"
            type="color"
            class="h-7 w-7 rounded border border-slate-800"
          />
        </div>
        <p class="text-[7px] text-slate-500">Use a hex color like #3b82f6.</p>
      </div>

      <!-- Tagline -->
      <div class="space-y-1">
        <label class="block text-[8px] text-slate-500">Tagline</label>
        <input
          v-model="form.tagline"
          type="text"
          maxlength="160"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
          placeholder="Book your appointment in seconds."
        />
        <p class="text-[7px] text-slate-500">Up to 160 characters.</p>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-1">
      <BaseButton variant="outline" size="xs" :loading="saving" @click="emit('save')">
        Save branding
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRaw } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';

type Branding = {
  logoUrl?: string | null;
  primaryColor?: string;
  tagline?: string | null;
};

const props = defineProps<{
  modelValue: Branding;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: Branding): void;
  (e: 'save'): void;
}>();

const form = ref<Branding>({
  logoUrl: props.modelValue?.logoUrl ?? '',
  primaryColor: props.modelValue?.primaryColor ?? '#3b82f6',
  tagline: props.modelValue?.tagline ?? 'Book your appointment in seconds.',
});

watch(
  () => props.modelValue,
  (v) => {
    form.value = {
      logoUrl: v?.logoUrl ?? '',
      primaryColor: v?.primaryColor ?? '#3b82f6',
      tagline: v?.tagline ?? 'Book your appointment in seconds.',
    };
  },
  { deep: true }
);

watch(
  form,
  (v) => {
    emit('update:modelValue', { ...toRaw(v) });
  },
  { deep: true }
);

const saving = props.saving ?? false;
</script>
