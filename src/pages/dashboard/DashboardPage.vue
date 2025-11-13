<template>
  <div class="space-y-6">
    <!-- Header -->
    <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-slate-50">{{ businessName }} Dashboard</h1>
        <p class="text-xs text-slate-400">
          High-level view of today&apos;s bookings, revenue, and upcoming schedule.
        </p>
      </div>

      <div class="text-xs text-right text-slate-400">
        <div class="uppercase tracking-wide">Data</div>
        <div>Today: {{ today }}</div>
      </div>
    </header>

    <!-- Top stats -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatCard
        label="Bookings today"
        :value="stats.bookingsToday"
        helper="Confirmed bookings for today"
      />

      <DashboardStatCard
        label="Upcoming (next 7 days)"
        :value="stats.upcomingWeek"
        helper="Scheduled in the next week"
      />

      <DashboardStatCard
        label="Est. revenue today"
        :value="`₱${(stats.revenueToday ?? 0).toLocaleString()}`"
        helper="Based on confirmed bookings"
      />

      <DashboardStatCard
        label="No-show rate (last 30d)"
        :value="`${stats.noShowRate}%`"
        helper="Keep this under 5% for healthy ops"
      />
    </section>

    <!-- Main content -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Upcoming bookings -->
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-slate-100">
            Upcoming bookings (today &amp; tomorrow)
          </h2>
        </div>

        <div v-if="upcomingBookings.length === 0" class="text-xs text-slate-500">
          No upcoming bookings yet. Once customers start booking, they&apos;ll appear here.
        </div>

        <ul v-else class="space-y-2 text-xs">
          <li
            v-for="b in upcomingBookings"
            :key="b.id"
            class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-900 hover:border-slate-700"
          >
            <div class="flex flex-col">
              <span class="font-medium text-slate-100"> {{ b.time }} • {{ b.service }} </span>
              <span class="text-slate-400"> {{ b.customer }} • {{ b.staff }} </span>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-slate-300"> ₱{{ (b.price ?? 0).toLocaleString() }} </span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] mt-1"
                :class="statusClass(b.status)"
              >
                {{ statusLabel(b.status) }}
              </span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Right column: services & staff -->
      <div class="space-y-4">
        <!-- Top services -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-slate-100">Top services (last 30d)</h2>
            <span class="text-[10px] text-slate-500">Snapshot</span>
          </div>

          <ul class="space-y-1.5 text-xs">
            <li v-for="s in topServices" :key="s.name" class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-slate-100">{{ s.name }}</span>
                <span class="text-slate-500">
                  {{ s.count }} bookings • ₱{{ (s.revenue ?? 0).toLocaleString() }}
                </span>
              </div>
              <span class="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {{ s.share }}%
              </span>
            </li>
          </ul>
        </div>

        <!-- Staff summary -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-slate-100">Staff snapshot</h2>
          </div>

          <div class="text-xs text-slate-400 mb-2">Who&apos;s getting bookings recently.</div>

          <ul class="space-y-1.5 text-xs">
            <li v-for="s in staffStats" :key="s.name" class="flex items-center justify-between">
              <span class="text-slate-100">{{ s.name }}</span>
              <span class="text-slate-400">
                {{ s.bookings }} bookings • ₱{{ s.revenue.toLocaleString() }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useBusinessStore } from '../../stores/business';
import api from '../../api/api';

const businessStore = useBusinessStore();

const businessName = computed(() => businessStore.current?.name || 'Your business');
const today = new Date().toLocaleDateString('en-PH', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const stats = ref({
  bookingsToday: 0,
  upcomingWeek: 0,
  revenueToday: 0,
  noShowRate: 0,
});

const upcomingBookings = ref<any[]>([]);
const topServices = ref<any[]>([]);
const staffStats = ref<any[]>([]);

function formatTimeLocal(utc: string) {
  return new Date(utc).toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClass(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/60';
    case 'PENDING':
      return 'bg-amber-900/60 text-amber-300 border border-amber-700/60';
    case 'CANCELLED':
      return 'bg-rose-900/60 text-rose-300 border border-rose-700/60';
    default:
      return 'bg-slate-800 text-slate-300';
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'PENDING':
      return 'Pending';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

onMounted(async () => {
  const bizId = businessStore.current?.id;
  if (!bizId) return;

  const res = await api.get(`/businesses/${bizId}/dashboard`);
  const data = res.data.data;

  stats.value = {
    bookingsToday: data.stats.bookingsToday,
    upcomingWeek: data.stats.upcomingWeek,
    revenueToday: (data.stats.revenueTodayCents ?? 0) / 100,
    noShowRate: data.stats.noShowRatePercent ?? 0,
  };

  // 🔥 Map upcoming bookings into what the template expects
  upcomingBookings.value = (data.upcomingBookings || []).map((b: any) => ({
    id: b.id,
    time: formatTimeLocal(b.startUtc),
    customer: b.customerName,
    service: b.serviceName,
    staff: b.staffName,
    price: (b.bookedPriceCents ?? 0) / 100,
    status: b.status,
  }));

  topServices.value = (data.topServices || []).map((s: any) => ({
    name: s.name,
    count: s.bookings,
    revenue: (s.revenueCents ?? 0) / 100,
    share: s.sharePercent,
  }));

  staffStats.value = (data.staffStats || []).map((s: any) => ({
    name: s.name,
    bookings: s.bookings,
    revenue: (s.revenueCents ?? 0) / 100,
  }));
});
</script>
