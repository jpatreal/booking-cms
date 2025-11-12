import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/api';
import { useAuthStore } from './auth';

export type BusinessRole = 'OWNER' | 'MANAGER' | 'STAFF';

export interface Business {
  id: string;
  slug: string;
  name: string;
  plan?: string | null;
  status?: string | null;
  timezone?: string | null;
  role: BusinessRole;
}

export const useBusinessStore = defineStore('business', () => {
  const list = ref<Business[]>([]);
  const current = ref<Business | null>(null);
  const loading = ref(false);

  const hasBusinesses = computed(() => list.value.length > 0);

  async function fetchMyBusinesses() {
    loading.value = true;
    try {
      const res = await api.get('/businesses');
      const payload = res.data?.data;
      const items = payload?.data ?? payload ?? [];

      const auth = useAuthStore();
      const memberships = auth.me?.memberships || [];

      list.value = items.map((b: any) => {
        const m = memberships.find((mm) => mm.businessId === b.id);
        return {
          id: b.id,
          slug: b.slug,
          name: b.name,
          plan: m?.plan ?? b.plan ?? null,
          status: m?.status ?? b.status ?? null,
          timezone: b.timezone ?? 'UTC',
          role: m?.role ?? 'OWNER',
        };
      });

      if (!current.value && list.value.length === 1) {
        current.value = list.value[0] ?? null;
      }
    } finally {
      loading.value = false;
    }
  }

  function setCurrent(biz: Business) {
    current.value = biz;
  }

  function setCurrentBySlug(slug: string) {
    const found = list.value.find((b) => b.slug === slug);
    if (found) {
      current.value = found;
    }
  }

  function addBusiness(biz: Business) {
    list.value = [biz, ...list.value];
    current.value = biz;
  }

  return {
    list,
    current,
    loading,

    hasBusinesses,

    fetchMyBusinesses,
    setCurrent,
    setCurrentBySlug,
    addBusiness,
  };
});
