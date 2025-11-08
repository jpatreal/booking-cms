import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

let idCounter = 1;

export const useToastsStore = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([]);

  function show(type: ToastType, message: string, duration = 2500) {
    const id = idCounter++;
    toasts.value.push({ id, type, message, duration });
    if (duration > 0) setTimeout(() => remove(id), duration);
  }

  function success(message: string, duration?: number) {
    show('success', message, duration);
  }
  function error(message: string, duration?: number) {
    show('error', message, duration);
  }
  function info(message: string, duration?: number) {
    show('info', message, duration);
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, show, success, error, info, remove };
});
