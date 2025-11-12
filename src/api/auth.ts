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
  const res = await api.post('/auth/refresh', {}, {
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
    _skipAuthRefresh: true,
  } as any);

  const token = res.data?.data?.accessToken as string | undefined;
  if (!token) {
    throw new Error('No accessToken in /auth/refresh response');
  }
  return token;
}

export async function apiRegister(input: {
  email: string;
  password: string;
  businessName?: string;
  registrationKey?: string;
  inviteToken?: string;
}) {
  const res = await api.post('/auth/register', input);
  return res.data?.data;
}

export async function apiRequestReset(email: string) {
  const res = await api.post('/auth/request-reset', { email });
  return res.data;
}

export async function apiResetPassword(token: string, newPassword: string) {
  const res = await api.post('/auth/reset-password', {
    token,
    newPassword,
  });
  return res.data;
}

export async function apiVerifyEmail(token: string) {
  const res = await api.post('/auth/verify-email', { token });
  return res.data;
}
