<!-- src/pages/auth/VerifyEmail.vue -->
<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-3">
    <div
      class="w-full max-w-md bg-slate-950/90 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3 text-center"
    >
      <div v-if="state === 'loading'" class="space-y-2">
        <h1 class="text-lg font-semibold text-slate-50">Verifying your email...</h1>
        <p class="text-[9px] text-slate-400">Please wait a moment.</p>
      </div>

      <div v-else-if="state === 'success'" class="space-y-2">
        <h1 class="text-lg font-semibold text-emerald-400">Email verified</h1>
        <p class="text-[9px] text-slate-400">
          Your email has been successfully verified. You can now sign in.
        </p>
        <BaseButton variant="primary" class="w-full justify-center" @click="goLogin">
          Go to login
        </BaseButton>
      </div>

      <div v-else class="space-y-2">
        <h1 class="text-lg font-semibold text-rose-400">Verification failed</h1>
        <p class="text-[9px] text-slate-400">The verification link is invalid or has expired.</p>
        <BaseButton variant="outline" class="w-full justify-center" @click="goLogin">
          Back to login
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '../../components/ui/BaseButton.vue';
import { useToastsStore } from '../../stores/toasts';
import { apiVerifyEmail } from '../../api/auth';

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();

const token = computed(() => (route.query.token as string) || '');
const state = ref<'loading' | 'success' | 'error'>('loading');

onMounted(async () => {
  if (!token.value) {
    state.value = 'error';
    return;
  }
  try {
    await apiVerifyEmail(token.value);
    state.value = 'success';
    toasts.success('Email verified successfully.');
  } catch {
    state.value = 'error';
    toasts.error('Failed to verify email.');
  }
});

function goLogin() {
  router.push({ name: 'login' });
}
</script>
