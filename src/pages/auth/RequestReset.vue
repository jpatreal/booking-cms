<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-3">
    <div
      class="w-full max-w-md bg-slate-950/90 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4"
    >
      <div class="space-y-1">
        <h1 class="text-xl font-semibold text-slate-50">Reset your password</h1>
        <p class="cms-caption">
          Enter your email and we’ll send you a secure reset link if an account exists.
        </p>
      </div>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <div class="space-y-1">
          <label class="block cms-label">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
          />
        </div>

        <div class="pt-1 flex flex-col gap-2">
          <BaseButton
            type="submit"
            variant="primary"
            :loading="loading"
            class="w-full justify-center"
          >
            Send reset link
          </BaseButton>

          <RouterLink :to="{ name: 'login' }" class="cms-helper hover:text-slate-300 text-center">
            Back to login
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '../../components/ui/BaseButton.vue';
import { useToastsStore } from '../../stores/toasts';
import { apiRequestReset } from '../../api/auth';

const email = ref('');
const loading = ref(false);
const toasts = useToastsStore();
const router = useRouter();

async function onSubmit() {
  if (!email.value.trim()) {
    toasts.error('Please enter your email.');
    return;
  }

  loading.value = true;
  try {
    await apiRequestReset(email.value.trim());
    toasts.success('If that email is registered, a reset link has been sent.');
    router.push({ name: 'login' });
  } catch {
    toasts.error('Something went wrong. Please try again.');
  } finally {
    loading.value = false;
  }
}
</script>
