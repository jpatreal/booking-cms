import api from './api';
import { useBusinessStore } from '../stores/business';

export type Role = 'OWNER' | 'MANAGER' | 'STAFF';

export interface Membership {
  id: string;
  userId: string;
  userEmail: string;
  role: Role;
  disabledAt: string | null;
  createdAt: string;
}

export interface Invite {
  id: string;
  businessId: string;
  email: string;
  role: Exclude<Role, 'OWNER'>;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

function getBusinessIdOrThrow(): string {
  const biz = useBusinessStore().current;
  if (!biz) throw new Error('No current business selected');
  return biz.id;
}

/* MEMBERSHIPS */

export async function listMemberships(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  includeDisabled?: boolean;
}): Promise<{ items: Membership[]; total: number }> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.get(`/businesses/${businessId}/memberships`, {
    params: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      q: params?.q || undefined,
      includeDisabled: params?.includeDisabled ? 'true' : undefined,
    },
  });

  const data = res.data?.data ?? [];
  const meta = res.data?.meta ?? {};
  const items: Membership[] = data.map((m: any) => ({
    id: m.id,
    userId: m.userId,
    userEmail: m.userEmail,
    role: m.role,
    disabledAt: m.disabledAt ?? null,
    createdAt: m.createdAt,
  }));

  return {
    items,
    total: meta.total ?? items.length,
  };
}

export async function addMember(input: {
  email?: string;
  userId?: string;
  role: Role;
}): Promise<Membership> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(`/businesses/${businessId}/memberships`, input);
  const m = res.data?.data;
  return {
    id: m.id,
    userId: m.userId,
    userEmail: m.userEmail,
    role: m.role,
    disabledAt: m.disabledAt ?? null,
    createdAt: m.createdAt,
  };
}

export async function changeMemberRole(membershipId: string, role: Role): Promise<Membership> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.patch(`/businesses/${businessId}/memberships/${membershipId}/role`, {
    role,
  });
  const m = res.data?.data;
  return {
    id: m.id,
    userId: m.userId,
    userEmail: m.userEmail,
    role: m.role,
    disabledAt: m.disabledAt ?? null,
    createdAt: m.createdAt,
  };
}

export async function disableMember(membershipId: string): Promise<Membership> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.patch(`/businesses/${businessId}/memberships/${membershipId}/disable`);
  const m = res.data?.data;
  return {
    id: m.id,
    userId: m.userId,
    userEmail: m.userEmail,
    role: m.role,
    disabledAt: m.disabledAt ?? new Date().toISOString(),
    createdAt: m.createdAt,
  };
}

export async function enableMember(membershipId: string): Promise<Membership> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.patch(`/businesses/${businessId}/memberships/${membershipId}/enable`);
  const m = res.data?.data;
  return {
    id: m.id,
    userId: m.userId,
    userEmail: m.userEmail,
    role: m.role,
    disabledAt: null,
    createdAt: m.createdAt,
  };
}

export async function deleteMember(membershipId: string): Promise<void> {
  const businessId = getBusinessIdOrThrow();
  await api.delete(`/businesses/${businessId}/memberships/${membershipId}`);
}

/* INVITES */

export async function listInvites(): Promise<Invite[]> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.get(`/businesses/${businessId}/memberships/invites`);
  const data = res.data?.data ?? [];
  return data.map((i: any) => ({
    id: i.id,
    businessId: i.businessId,
    email: i.email,
    role: i.role,
    createdAt: i.createdAt,
    expiresAt: i.expiresAt,
    acceptedAt: i.acceptedAt,
  }));
}

export async function createInvite(input: {
  email: string;
  role: Exclude<Role, 'OWNER'>;
  ttlHours?: number;
}): Promise<Invite> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(`/businesses/${businessId}/memberships/invites`, input);
  const i = res.data?.data;
  return {
    id: i.id,
    businessId: i.businessId,
    email: i.email,
    role: i.role,
    createdAt: i.createdAt,
    expiresAt: i.expiresAt,
    acceptedAt: i.acceptedAt,
  };
}

export async function resendInvite(inviteId: string, ttlHours?: number): Promise<Invite> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(
    `/businesses/${businessId}/memberships/invites/${inviteId}/resend`,
    ttlHours ? { ttlHours } : {}
  );
  const i = res.data?.data;
  return {
    id: i.id,
    businessId: i.businessId,
    email: i.email,
    role: i.role,
    createdAt: i.createdAt,
    expiresAt: i.expiresAt,
    acceptedAt: i.acceptedAt,
  };
}

export async function cancelInvite(inviteId: string): Promise<void> {
  const businessId = getBusinessIdOrThrow();
  await api.delete(`/businesses/${businessId}/memberships/invites/${inviteId}`);
}
