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
        <div class="uppercase tracking-wide">Mock data</div>
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
        :value="`₱${stats.revenueToday.toLocaleString()}`"
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
          <span class="text-[10px] text-slate-500"> Mock sample for layout only </span>
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
              <span class="text-slate-300"> ₱{{ b.price.toLocaleString() }} </span>
              <span class="px-2 py-0.5 rounded-full text-[9px]" :class="statusClass(b.status)">
                {{ b.status }}
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
            <span class="text-[10px] text-slate-500">Mock snapshot</span>
          </div>

          <ul class="space-y-1.5 text-xs">
            <li v-for="s in topServices" :key="s.name" class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-slate-100">{{ s.name }}</span>
                <span class="text-slate-500">
                  {{ s.count }} bookings • ₱{{ s.revenue.toLocaleString() }}
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
import { computed } from 'vue';
import { useBusinessStore } from '../../stores/business';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.vue';

const businessStore = useBusinessStore();

const businessName = computed(() => businessStore.current?.name || 'Your business');

const today = new Date().toLocaleDateString('en-PH', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

/**
 * Mock stats for now.
 * Replace with API calls later.
 */
const stats = {
  bookingsToday: 9,
  upcomingWeek: 34,
  revenueToday: 8920,
  noShowRate: 3.2,
};

const upcomingBookings = [
  {
    id: '1',
    time: '09:00 AM',
    customer: 'Juan Dela Cruz',
    service: 'General Consultation',
    staff: 'Dr. Santos',
    price: 600,
    status: 'Confirmed',
  },
  {
    id: '2',
    time: '10:30 AM',
    customer: 'Maria Reyes',
    service: 'Teeth Cleaning',
    staff: 'Dr. Cruz',
    price: 1200,
    status: 'Confirmed',
  },
  {
    id: '3',
    time: '01:00 PM',
    customer: 'Mark Lee',
    service: 'Haircut + Beard',
    staff: 'Alex (Barber)',
    price: 350,
    status: 'Pending',
  },
  {
    id: '4',
    time: '03:15 PM',
    customer: 'Anna Kim',
    service: 'Full Body Massage',
    staff: 'Joy',
    price: 800,
    status: 'Confirmed',
  },
];

const topServices = [
  {
    name: 'General Consultation',
    count: 42,
    revenue: 25200,
    share: 35,
  },
  {
    name: 'Teeth Cleaning',
    count: 27,
    revenue: 32400,
    share: 30,
  },
  {
    name: 'Haircut + Styling',
    count: 31,
    revenue: 9300,
    share: 20,
  },
  {
    name: 'Massage (1 hr)',
    count: 15,
    revenue: 12000,
    share: 15,
  },
];

const staffStats = [
  {
    name: 'Dr. Santos',
    bookings: 18,
    revenue: 10800,
  },
  {
    name: 'Dr. Cruz',
    bookings: 14,
    revenue: 16800,
  },
  {
    name: 'Alex (Barber)',
    bookings: 10,
    revenue: 3500,
  },
  {
    name: 'Joy',
    bookings: 8,
    revenue: 6400,
  },
];

function statusClass(status: string) {
  switch (status) {
    case 'Confirmed':
      return 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/60';
    case 'Pending':
      return 'bg-amber-900/60 text-amber-300 border border-amber-700/60';
    case 'Cancelled':
      return 'bg-rose-900/60 text-rose-300 border border-rose-700/60';
    default:
      return 'bg-slate-800 text-slate-300';
  }
}
</script>
