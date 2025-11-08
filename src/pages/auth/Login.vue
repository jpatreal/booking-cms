<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950">
    <div class="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800">
      <h1 class="text-xl font-semibold mb-6 text-slate-50">Sign in to Booking CMS</h1>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-xs mb-1 text-slate-400">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label class="block text-xs mb-1 text-slate-400">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          class="w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-sm font-medium"
        >
          Sign in
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();

const onSubmit = async () => {
  await auth.login(email.value, password.value);
  router.push('/app');
};
</script>
