import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/api';

interface Business {
  id: string;
  slug: string;
  name: string;
  role?: 'OWNER' | 'MANAGER' | 'STAFF';
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
      const rows = (payload?.data || []) as any[];

      list.value = rows.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        role: (b.role as Business['role']) || 'OWNER',
      }));

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

  return {
    list,
    current,
    loading,
    hasBusinesses,
    fetchMyBusinesses,
    setCurrent,
    setCurrentBySlug,
  };
});
