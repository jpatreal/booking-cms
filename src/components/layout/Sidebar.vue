<template>
  <aside
    class="w-60 shrink-0 bg-slate-950/95 border-r border-slate-900 px-3 py-4 flex flex-col gap-4"
  >
    <!-- App mini brand / title -->
    <div class="px-2">
      <div class="flex items-baseline gap-1.5">
        <span class="text-[10px] uppercase tracking-[0.16em] text-slate-500"> Control Center </span>
      </div>
      <div class="text-xs text-slate-400">Manage bookings & operations</div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-4 mt-2">
      <!-- Overview -->
      <div v-if="businessSlug">
        <div class="px-2 mb-1 text-[8px] uppercase tracking-[0.16em] text-slate-500">Overview</div>
        <NavItem :to="`${base}/dashboard`" label="Dashboard" :icon="LayoutDashboard" />
      </div>

      <!-- Operations -->
      <div v-if="businessSlug">
        <div class="px-2 mb-1 text-[8px] uppercase tracking-[0.16em] text-slate-500">
          Operations
        </div>
        <NavItem :to="`${base}/bookings`" label="Bookings" :icon="CalendarCheck" />
        <NavItem :to="`${base}/staff`" label="Staff" :icon="UserCog" />
        <NavItem :to="`${base}/services`" label="Services" :icon="Sparkles" />
        <NavItem :to="`${base}/customers`" label="Customers" :icon="Users" />
      </div>

      <!-- Settings / future -->
      <div v-if="businessSlug">
        <div class="px-2 mb-1 text-[8px] uppercase tracking-[0.16em] text-slate-500">
          Configuration
        </div>
        <NavItem :to="`${base}/settings`" label="Business settings" :icon="Settings2" />
        <NavItem :to="`${base}/team`" label="Team & access" :icon="Users" />
        <NavItem :to="`${base}/audit-logs`" label="Audit logs" :icon="History" />

        <!-- <NavItem to="#" label="Integrations" :icon="PlugZap" disabled hint="Coming soon" /> -->
      </div>
    </nav>

    <!-- Footer hint -->
    <div class="px-2 pb-1 text-[8px] text-slate-500 flex items-center gap-1">
      <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
      <span>All changes sync in real-time.</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  UserCog,
  Sparkles,
  Settings2,
  History,
} from 'lucide-vue-next';
import NavItem from './SidebarNavItem.vue';

const route = useRoute();

const businessSlug = computed(() => route.params.businessSlug as string | undefined);
const base = computed(() => (businessSlug.value ? `/app/${businessSlug.value}` : ''));
</script>
