import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { setApiAccessToken } from '../api/api';
import { apiLogin, apiMe, apiRefresh } from '../api/auth';

interface MembershipSummary {
  businessId: string;
  businessName: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  slug: string;
}

interface MePayload {
  id: string;
  email: string;
  memberships: MembershipSummary[];
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken') || null);
  const me = ref<MePayload | null>(null);
  const loadingMe = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  if (accessToken.value) {
    setApiAccessToken(accessToken.value);
  }

  async function login(email: string, password: string) {
    const token = await apiLogin(email, password);

    accessToken.value = token;
    localStorage.setItem('accessToken', token);
    setApiAccessToken(token);

    await fetchMe();
  }

  async function fetchMe() {
    if (!accessToken.value) return;
    loadingMe.value = true;
    try {
      const data = await apiMe();
      me.value = data ?? null;
    } catch {
      // token invalid, cleanup
      logout();
    } finally {
      loadingMe.value = false;
    }
  }

  async function refreshAccessToken(): Promise<string> {
    if (!accessToken.value) {
      throw new Error('No existing token to refresh');
    }

    const newToken = await apiRefresh(accessToken.value);

    accessToken.value = newToken;
    localStorage.setItem('accessToken', newToken);
    setApiAccessToken(newToken);

    return newToken;
  }

  function logout() {
    accessToken.value = null;
    me.value = null;
    localStorage.removeItem('accessToken');
    setApiAccessToken(null);
  }

  // 🔹 Initialize on store creation (for page refresh)
  async function init() {
    if (accessToken.value && !me.value && !loadingMe.value) {
      await fetchMe();
    }
  }

  // call immediately
  init();

  return {
    accessToken,
    me,
    loadingMe,

    isAuthenticated,

    login,
    fetchMe,
    refreshAccessToken,
    logout,
  };
});
