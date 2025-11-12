<!-- src/pages/auth/Register.vue -->
<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-3">
    <div
      class="w-full max-w-md bg-slate-950/90 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4"
    >
      <!-- Header -->
      <div class="space-y-1">
        <h1 class="text-lg font-semibold text-slate-50">Create your account</h1>
        <p v-if="isInvite" class="text-[9px] text-slate-400">
          You’re joining
          <span class="font-medium text-slate-200">a business via invite.</span>
          Use the same email the invite was sent to.
        </p>
        <p v-else class="text-[9px] text-slate-400">
          Use your registration key to create your first business workspace.
        </p>
      </div>

      <!-- Form -->
      <form class="space-y-3" @submit.prevent="onSubmit">
        <!-- Email -->
        <div class="space-y-1">
          <label class="block text-[8px] text-slate-500">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
          />
        </div>

        <!-- Password -->
        <div class="space-y-1">
          <label class="block text-[8px] text-slate-500">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            placeholder="At least 8 characters"
            class="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
          />
        </div>

        <!-- Owner signup fields -->
        <template v-if="!isInvite">
          <div class="space-y-1">
            <label class="block text-[8px] text-slate-500"> Business name </label>
            <input
              v-model="businessName"
              type="text"
              required
              placeholder="e.g. Spidey Clinic"
              class="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-[8px] text-slate-500"> Registration key </label>
            <input
              v-model="registrationKey"
              type="text"
              required
              placeholder="Paste the key provided to you"
              class="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-[10px] text-slate-100 outline-none focus:border-brand-500/80"
            />
            <p class="text-[7px] text-slate-500">
              This keeps access limited while you’re in beta or invite-only mode.
            </p>
          </div>
        </template>

        <!-- Invite token note -->
        <template v-else>
          <p
            class="text-[8px] text-slate-500 bg-slate-950/80 border border-slate-900 rounded-2xl px-3 py-2"
          >
            You’re signing up from an invite. Once registered, you’ll be added to the business
            automatically.
          </p>
        </template>

        <div class="pt-1 flex flex-col gap-2">
          <BaseButton
            type="submit"
            variant="primary"
            :loading="loading"
            class="w-full justify-center"
          >
            Create account
          </BaseButton>

          <RouterLink
            :to="{ name: 'login' }"
            class="text-[8px] text-slate-500 hover:text-slate-300 text-center"
          >
            Already have an account? <span class="text-brand-400">Log in</span>
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '../../components/ui/BaseButton.vue';
import { useToastsStore } from '../../stores/toasts';
import { apiRegister } from '../../api/auth';

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();

const email = ref('');
const password = ref('');
const businessName = ref('');
const registrationKey = ref('');
const loading = ref(false);

const inviteToken = computed(() => (route.query.inviteToken as string) || '');
const isInvite = computed(() => !!inviteToken.value);

onMounted(() => {
  const emailPrefill = route.query.email as string | undefined;
  if (emailPrefill) email.value = emailPrefill;
});

async function onSubmit() {
  if (!email.value.trim() || !password.value.trim()) {
    toasts.error('Email and password are required.');
    return;
  }

  const payload: any = {
    email: email.value.trim(),
    password: password.value.trim(),
  };

  if (isInvite.value) {
    payload.inviteToken = inviteToken.value;
  } else {
    if (!businessName.value.trim() || !registrationKey.value.trim()) {
      toasts.error('Business name and registration key are required.');
      return;
    }
    payload.businessName = businessName.value.trim();
    payload.registrationKey = registrationKey.value.trim();
  }

  loading.value = true;
  try {
    await apiRegister(payload);
    toasts.success(
      isInvite.value
        ? 'Account created. You can now log in to your invited business.'
        : 'Account created. Check your email to verify, then log in.'
    );
    router.push({ name: 'login' });
  } catch (e: any) {
    const msg =
      e?.response?.data?.message || 'Failed to register. Please check your details or token.';
    toasts.error(msg);
  } finally {
    loading.value = false;
  }
}
</script>
