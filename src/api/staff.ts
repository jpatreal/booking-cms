import api from './api';
import { useBusinessStore } from '../stores/business';

export interface Staff {
  id: string;
  businessId: string;
  userId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  imageUrl: string | null;
  color: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface StaffQuery {
  q?: string;
  page?: number;
  pageSize?: number;
  activeOnly?: boolean;
}

function getBusinessIdOrThrow(): string {
  const bizStore = useBusinessStore();
  const biz = bizStore.current;
  if (!biz) throw new Error('No business selected');
  return biz.id;
}

function mapStaff(raw: any): Staff {
  return {
    id: raw.id,
    businessId: raw.businessId,
    userId: raw.userId ?? null,
    name: raw.name,
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    bio: raw.bio ?? null,
    imageUrl: raw.imageUrl ?? null,
    color: raw.color ?? null,
    displayOrder: raw.displayOrder ?? 0,
    isActive: !!raw.isActive,
  };
}

export async function listStaff(params: StaffQuery = {}): Promise<{
  items: Staff[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const businessId = getBusinessIdOrThrow();

  const query: any = {
    q: params.q || undefined,
    page: params.page,
    pageSize: params.pageSize,
  };

  if (typeof params.activeOnly === 'boolean') {
    query.activeOnly = params.activeOnly;
  }

  const res = await api.get(`/businesses/${businessId}/staff`, { params: query });
  const data = res.data?.data ?? [];
  const meta = res.data?.meta ?? {};

  const items = Array.isArray(data) ? data.map(mapStaff) : [];

  return {
    items,
    total: meta.total ?? items.length,
    page: meta.page ?? 1,
    pageSize: meta.pageSize ?? items.length,
  };
}

export interface CreateStaffInput {
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export async function createStaff(payload: CreateStaffInput): Promise<Staff> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(`/businesses/${businessId}/staff`, payload);
  return mapStaff(res.data?.data);
}

export interface UpdateStaffInput {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  imageUrl?: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export async function updateStaff(id: string, payload: UpdateStaffInput): Promise<Staff> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.patch(`/businesses/${businessId}/staff/${id}`, payload);
  return mapStaff(res.data?.data);
}

export async function deleteStaff(id: string): Promise<void> {
  const businessId = getBusinessIdOrThrow();
  await api.delete(`/businesses/${businessId}/staff/${id}`);
}

// Convenience wrapper for toggling active
export async function setStaffActive(id: string, isActive: boolean): Promise<Staff> {
  return updateStaff(id, { isActive });
}

// --- Staff services mapping ---

export interface StaffServiceLink {
  id: string;
  staffId: string;
  serviceId: string;
  isActive: boolean;
  priceCentsOverride: number | null;
  durationMinOverride: number | null;
  bufferBeforeMin: number;
  bufferAfterMin: number;
}

export async function fetchStaffServices(staffId: string): Promise<StaffServiceLink[]> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.get(`/businesses/${businessId}/staff/${staffId}/services`);
  const rows = (res.data?.data || []) as any[];
  return rows.map((r) => ({
    id: r.id,
    staffId: r.staffId,
    serviceId: r.serviceId,
    isActive: !!r.isActive,
    priceCentsOverride: r.priceCentsOverride ?? null,
    durationMinOverride: r.durationMinOverride ?? null,
    bufferBeforeMin: r.bufferBeforeMin ?? 0,
    bufferAfterMin: r.bufferAfterMin ?? 0,
  }));
}

export interface UpsertStaffServiceInput {
  serviceId: string;
  isActive?: boolean;
  priceCentsOverride?: number | null;
  durationMinOverride?: number | null;
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
}

export async function upsertStaffServices(
  staffId: string,
  items: UpsertStaffServiceInput[]
): Promise<StaffServiceLink[]> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.put(`/businesses/${businessId}/staff/${staffId}/services`, { items });
  const rows = (res.data?.data || []) as any[];
  return rows.map((r) => ({
    id: r.id,
    staffId: r.staffId,
    serviceId: r.serviceId,
    isActive: !!r.isActive,
    priceCentsOverride: r.priceCentsOverride ?? null,
    durationMinOverride: r.durationMinOverride ?? null,
    bufferBeforeMin: r.bufferBeforeMin ?? 0,
    bufferAfterMin: r.bufferAfterMin ?? 0,
  }));
}

export async function removeStaffService(staffId: string, serviceId: string): Promise<void> {
  const businessId = getBusinessIdOrThrow();
  await api.delete(`/businesses/${businessId}/staff/${staffId}/services/${serviceId}`);
}

// --- Availability ---

export interface StaffAvailabilityItem {
  id?: string;
  staffId?: string;
  dayOfWeek: number; // 1-7
  startTimeLocal: string; // '09:00:00'
  endTimeLocal: string; // '17:00:00'
}

export async function fetchStaffAvailability(staffId: string): Promise<StaffAvailabilityItem[]> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.get(`/businesses/${businessId}/staff/${staffId}/availability`);
  return (res.data?.data || []) as StaffAvailabilityItem[];
}

export async function upsertStaffAvailability(
  staffId: string,
  items: Omit<StaffAvailabilityItem, 'id'>[]
): Promise<StaffAvailabilityItem[]> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.put(`/businesses/${businessId}/staff/${staffId}/availability`, { items });
  return (res.data?.data || []) as StaffAvailabilityItem[];
}

// --- Time off ---

export interface StaffTimeOff {
  id: string;
  staffId: string;
  startUtc: string;
  endUtc: string;
  reason: string;
}

export async function fetchStaffTimeOff(staffId: string): Promise<StaffTimeOff[]> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.get(`/businesses/${businessId}/staff/${staffId}/time-off`);
  return (res.data?.data || []) as StaffTimeOff[];
}

export async function createStaffTimeOff(
  staffId: string,
  payload: { startUtc: string; endUtc: string; reason: string }
): Promise<StaffTimeOff> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(`/businesses/${businessId}/staff/${staffId}/time-off`, payload);
  return res.data?.data as StaffTimeOff;
}

export async function deleteStaffTimeOff(staffId: string, timeOffId: string): Promise<void> {
  const businessId = getBusinessIdOrThrow();
  await api.delete(`/businesses/${businessId}/staff/${staffId}/time-off/${timeOffId}`);
}
