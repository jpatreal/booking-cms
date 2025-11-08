import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { setApiAccessToken } from '../api/api';
import { apiLogin, apiMe, apiRefresh } from '../api/auth';

interface MePayload {
  sub: string;
  email: string;
  mb: string | null;
  iat: number;
  exp: number;
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken') || null);
  const me = ref<MePayload | null>(null);

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
    try {
      const data = await apiMe();
      me.value = data ?? null;
    } catch {
      logout();
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

  return {
    accessToken,
    me,

    isAuthenticated,

    login,
    fetchMe,
    refreshAccessToken,
    logout,
  };
});
