<template>
  <aside
    class="w-64 shrink-0 bg-slate-950/95 border-r border-slate-900 px-4 py-5 flex flex-col gap-6"
  >
    <!-- Brand -->
    <div class="px-2">
      <div>
        <span class="text-sm uppercase tracking-[0.14em] text-slate-400"> Control Center </span>
      </div>
      <div class="text-base text-slate-300 mt-1">Manage bookings & operations</div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-6 mt-2">
      <!-- Overview -->
      <div v-if="businessSlug">
        <div class="px-2 mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
          Overview
        </div>
        <NavItem
          :to="`${base}/dashboard`"
          label="Dashboard"
          :icon="LayoutDashboard"
          icon-class="w-5 h-5"
          label-class="text-base"
        />
      </div>

      <!-- Operations -->
      <div v-if="businessSlug">
        <div class="px-2 mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
          Operations
        </div>
        <NavItem
          :to="`${base}/bookings`"
          label="Bookings"
          :icon="CalendarCheck"
          icon-class="w-5 h-5"
          label-class="text-base"
        />
        <NavItem
          :to="`${base}/staff`"
          label="Staff"
          :icon="UserCog"
          icon-class="w-5 h-5"
          label-class="text-base"
        />
        <NavItem
          :to="`${base}/services`"
          label="Services"
          :icon="Sparkles"
          icon-class="w-5 h-5"
          label-class="text-base"
        />
        <NavItem
          :to="`${base}/customers`"
          label="Customers"
          :icon="Users"
          icon-class="w-5 h-5"
          label-class="text-base"
        />
      </div>

      <!-- Settings -->
      <div v-if="businessSlug">
        <div class="px-2 mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
          Configuration
        </div>
        <NavItem
          :to="`${base}/settings`"
          label="Business settings"
          :icon="Settings2"
          icon-class="w-5 h-5"
          label-class="text-base"
        />
        <NavItem
          :to="`${base}/team`"
          label="Team & access"
          :icon="Users"
          icon-class="w-5 h-5"
          label-class="text-base"
        />
        <NavItem
          :to="`${base}/audit-logs`"
          label="Audit logs"
          :icon="History"
          icon-class="w-5 h-5"
          label-class="text-base"
        />
      </div>
    </nav>

    <!-- Footer hint -->
    <div class="px-2 pb-1 text-sm text-slate-500 flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
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
