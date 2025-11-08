<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="onCancel"
    >
      <div class="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl">
        <div class="flex items-start gap-3 mb-3">
          <div
            class="w-7 h-7 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/40"
          >
            !
          </div>
          <div class="flex-1">
            <h2 class="text-sm font-semibold text-slate-100">
              {{ title }}
            </h2>
            <p class="mt-1 text-[10px] text-slate-400 leading-relaxed">
              {{ message }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-2">
          <BaseButton variant="ghost" type="button" @click="onCancel">
            {{ cancelLabel }}
          </BaseButton>

          <BaseButton :variant="confirmVariant" type="button" :loading="loading" @click="onConfirm">
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: 'danger' | 'primary';
    loading?: boolean;
  }>(),
  {
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmVariant: 'danger',
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const onCancel = () => {
  if (!props.loading) emit('close');
};

const onConfirm = () => {
  if (!props.loading) emit('confirm');
};
</script>
