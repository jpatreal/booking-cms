<!-- src/pages/auth/ResetPassword.vue -->
<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-3">
    <div
      class="w-full max-w-md bg-slate-950/90 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4"
    >
      <div class="space-y-1">
        <h1 class="text-lg font-semibold text-slate-50">Set a new password</h1>
        <p class="text-[9px] text-slate-400">Choose a strong password for your account.</p>
      </div>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <div class="space-y-1">
          <label class="block text-[8px] text-slate-500">New password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            placeholder="At least 8 characters"
            class="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-[8px] text-slate-500">Confirm password</label>
          <input
            v-model="confirm"
            type="password"
            required
            minlength="8"
            placeholder="Repeat your new password"
            class="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
          />
        </div>

        <div class="pt-1 flex flex-col gap-2">
          <BaseButton
            type="submit"
            variant="primary"
            :loading="loading"
            class="w-full justify-center"
          >
            Update password
          </BaseButton>

          <RouterLink
            :to="{ name: 'login' }"
            class="text-[8px] text-slate-500 hover:text-slate-300 text-center"
          >
            Back to login
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '../../components/ui/BaseButton.vue';
import { useToastsStore } from '../../stores/toasts';
import { apiResetPassword } from '../../api/auth';

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();

const token = computed(() => (route.query.token as string) || '');
const password = ref('');
const confirm = ref('');
const loading = ref(false);

async function onSubmit() {
  if (!token.value) {
    toasts.error('Reset link is invalid or missing.');
    return;
  }
  if (!password.value || password.value.length < 8) {
    toasts.error('Password must be at least 8 characters.');
    return;
  }
  if (password.value !== confirm.value) {
    toasts.error('Passwords do not match.');
    return;
  }

  loading.value = true;
  try {
    await apiResetPassword(token.value, password.value);
    toasts.success('Password updated. You can now log in.');
    router.push({ name: 'login' });
  } catch {
    toasts.error('Failed to reset password. The link may have expired.');
  } finally {
    loading.value = false;
  }
}
</script>
