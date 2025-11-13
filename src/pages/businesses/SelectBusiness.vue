<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-3">
    <div
      class="w-full max-w-4xl bg-slate-950/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4"
    >
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div class="space-y-1">
          <h1 class="text-xl font-semibold text-slate-50">Choose a business to manage</h1>
          <p class="cms-caption">
            Workspaces for each of your locations or brands. You can create up to
            <span class="font-semibold text-slate-200">{{ maxBusinesses }}</span>
            businesses.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="atLimit" class="cms-helper text-amber-400">
            You’ve reached the maximum number of businesses.
          </span>
          <BaseButton variant="primary" size="sm" :disabled="atLimit" @click="openCreateModal">
            <span class="text-sm">+ New business</span>
          </BaseButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="cms-helper">Loading your businesses...</div>

      <!-- Empty state -->
      <div
        v-else-if="!loading && businesses.length === 0"
        class="border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2"
      >
        <p class="text-base text-slate-200 font-medium">No businesses yet</p>
        <p class="cms-caption">Create your first business to start accepting bookings.</p>
        <BaseButton variant="primary" size="sm" @click="openCreateModal">
          Create your first business
        </BaseButton>
      </div>

      <!-- List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="b in businesses"
          :key="b.id"
          class="group relative border border-slate-800 rounded-2xl px-3 py-3 bg-slate-950/80 hover:bg-slate-900/90 transition shadow-[0_0_12px_rgba(15,23,42,0.6)]"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-0.5">
              <div class="flex items-center gap-1.5">
                <div
                  class="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-sm text-brand-400 font-semibold"
                >
                  {{ b.name.charAt(0).toUpperCase() }}
                </div>
                <h2 class="text-base font-semibold text-slate-50 truncate">
                  {{ b.name }}
                </h2>
              </div>
              <p class="cms-helper truncate">/{{ b.slug }}</p>
            </div>
            <div class="flex flex-col items-end gap-0.5">
              <span
                class="cms-chip px-2 py-0.5 rounded-full border"
                :class="planBadgeClass(b.plan)"
              >
                {{ b.plan || 'TRIAL' }}
              </span>
              <span v-if="b.status" class="cms-caption-muted">
                {{ b.status }}
              </span>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between gap-2 text-sm text-slate-500">
            <div class="flex flex-col gap-0.5">
              <span class="cms-helper">
                Timezone:
                <span class="text-slate-300">
                  {{ b.timezone || 'UTC' }}
                </span>
              </span>
              <span class="cms-caption-muted">
                Click "Open" to access dashboard, bookings, staff, and services.
              </span>
            </div>
            <div class="flex flex-col gap-1 items-end">
              <BaseButton variant="outline" size="xs" @click="goToDashboard(b)"> Open </BaseButton>
              <BaseButton variant="ghost" size="xs" @click="goToSettings(b)"> Settings </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Business Modal -->
    <BusinessCreateModal
      :open="createOpen"
      :existing-count="businesses.length"
      :max-businesses="maxBusinesses"
      @close="createOpen = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useBusinessStore } from '../../stores/business';
import BaseButton from '../../components/ui/BaseButton.vue';
import BusinessCreateModal from '../../components/business/BusinessCreateModal.vue';

const router = useRouter();
const businessStore = useBusinessStore();

const { list: businesses, loading } = storeToRefs(businessStore);

const createOpen = ref(false);

const maxBusinesses = 2;
const atLimit = computed(() => businesses.value.length >= maxBusinesses);

onMounted(async () => {
  if (!businesses.value.length) {
    await businessStore.fetchMyBusinesses();
  }
});

function openCreateModal() {
  if (atLimit.value) return;
  createOpen.value = true;
}

function goToDashboard(biz: any) {
  businessStore.setCurrent(biz);
  router.push({
    name: 'dashboard',
    params: { businessSlug: biz.slug },
  });
}

function goToSettings(biz: any) {
  businessStore.setCurrent(biz);
  router.push({
    name: 'business-settings',
    params: { businessSlug: biz.slug },
  });
}

function handleCreated(payload: { id: string; name: string; slug: string }) {
  businessStore.addBusiness({
    id: payload.id,
    name: payload.name,
    slug: payload.slug,
    plan: 'TRIAL',
    status: 'trialing',
    timezone: 'UTC',
    role: 'OWNER',
  } as any);

  router.push({
    name: 'dashboard',
    params: { businessSlug: payload.slug },
  });
}

function planBadgeClass(plan?: string | null) {
  const p = (plan || 'TRIAL').toUpperCase();
  if (p === 'PRO') {
    return 'border-emerald-500/60 text-emerald-300 bg-emerald-900/40';
  }
  if (p === 'FREE') {
    return 'border-slate-700 text-slate-300 bg-slate-900/60';
  }
  if (p === 'TRIAL') {
    return 'border-amber-500/60 text-amber-300 bg-amber-900/30';
  }
  if (p === 'TEST') {
    return 'border-sky-500/60 text-sky-300 bg-sky-900/30';
  }
  return 'border-slate-700 text-slate-300 bg-slate-900/60';
}
</script>
