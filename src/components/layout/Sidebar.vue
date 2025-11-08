<template>
  <aside class="w-64 bg-slate-900 border-r border-slate-800 p-4">
    <div class="font-semibold text-lg mb-6">Booking CMS</div>
    <nav class="space-y-2 text-sm">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="block px-3 py-2 rounded-lg hover:bg-slate-800"
        active-class="bg-slate-800 text-brand-500"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const businessSlug = computed(() => route.params.businessSlug as string);

const items = computed(() => {
  if (!businessSlug.value) return [];
  const base = `/app/${businessSlug.value}`;
  return [
    { label: 'Dashboard', to: `${base}/dashboard` },
    { label: 'Bookings', to: `${base}/bookings` },
    { label: 'Staff', to: `${base}/staff` },
    { label: 'Staff Availability', to: `${base}/staff/availability` },
    { label: 'Services', to: `${base}/services` },
    { label: 'Customers', to: `${base}/customers` },
  ];
});
</script>
