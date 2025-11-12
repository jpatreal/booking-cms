<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-3">
    <div
      class="w-full max-w-md bg-slate-950/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5"
    >
      <div class="space-y-1">
        <div
          class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/80 border border-slate-800"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span class="text-[8px] text-slate-400">Booking CMS</span>
        </div>
        <h1 class="text-lg font-semibold text-slate-50">Sign in to your workspace</h1>
        <p class="text-[9px] text-slate-400">
          Access your bookings, team, and services in one place.
        </p>
      </div>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <div class="space-y-1">
          <label class="block text-[8px] text-slate-500"> Email </label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="block text-[8px] text-slate-500"> Password </label>
            <RouterLink
              :to="{ name: 'request-reset' }"
              class="text-[8px] text-slate-500 hover:text-brand-400"
            >
              Forgot password?
            </RouterLink>
          </div>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
          />
        </div>

        <p v-if="error" class="text-[8px] text-rose-400">
          {{ error }}
        </p>

        <div class="pt-1">
          <BaseButton
            type="submit"
            variant="primary"
            class="w-full justify-center"
            :loading="loading"
          >
            Sign in
          </BaseButton>
        </div>
      </form>

      <div class="flex flex-col gap-1.5 text-center">
        <p class="text-[8px] text-slate-500">
          Have an invite or registration key?
          <RouterLink :to="{ name: 'register' }" class="text-brand-400 hover:text-slate-300 ml-1">
            Create an account
          </RouterLink>
        </p>
        <p class="text-[7px] text-slate-500">
          By signing in, you agree to the terms provided for your workspace.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useToastsStore } from '../../stores/toasts';
import BaseButton from '../../components/ui/BaseButton.vue';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const auth = useAuthStore();
const router = useRouter();
const toasts = useToastsStore();

const onSubmit = async () => {
  error.value = '';
  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Please enter your email and password.';
    return;
  }

  loading.value = true;
  try {
    await auth.login(email.value.trim(), password.value);
    router.push('/app');
    toasts.success('Welcome back 👋');
  } catch (e: any) {
    const msg = e?.response?.data?.message || 'Invalid email or password. Please try again.';
    error.value = msg;
    toasts.error(msg);
  } finally {
    loading.value = false;
  }
};
</script>
