import api from './api';

export async function apiLogin(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  const token = res.data?.data?.accessToken as string | undefined;
  if (!token) {
    throw new Error('No accessToken in /auth/login response');
  }
  return token;
}

export async function apiMe() {
  const res = await api.get('/auth/me');
  return res.data?.data;
}

export async function apiRefresh(currentToken: string) {
  const res = await api.post(
    '/auth/refresh',
    {},
    {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    }
  );
  const token = res.data?.data?.accessToken as string | undefined;
  if (!token) {
    throw new Error('No accessToken in /auth/refresh response');
  }
  return token;
}
