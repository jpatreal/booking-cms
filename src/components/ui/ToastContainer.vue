<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <transition-group name="toast-fade" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="min-w-[220px] max-w-xs px-3 py-2 rounded-2xl border text-xs shadow-xl flex items-start gap-2 bg-slate-950/95 backdrop-blur-md"
          :class="typeClass(toast.type)"
        >
          <div class="mt-[2px]">
            <span v-if="toast.type === 'success'">✅</span>
            <span v-else-if="toast.type === 'error'">⚠️</span>
            <span v-else>💡</span>
          </div>
          <div class="flex-1 text-slate-100 leading-snug">
            {{ toast.message }}
          </div>
          <button
            class="ml-1 text-[9px] text-slate-500 hover:text-slate-200"
            @click="remove(toast.id)"
          >
            ✕
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useToastsStore, type ToastType } from '../../stores/toasts';

const store = useToastsStore();
const { toasts } = storeToRefs(store);
const { remove } = store;

const typeClass = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-emerald-500/50 text-emerald-200';
    case 'error':
      return 'border-rose-500/60 text-rose-200';
    case 'info':
    default:
      return 'border-slate-700 text-slate-100';
  }
};
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.18s ease-out;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
