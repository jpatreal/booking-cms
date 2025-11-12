// src/api/bookings.ts
import api from './api';
import { useBusinessStore } from '../stores/business';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';

export interface Booking {
  id: string;
  businessId: string;
  serviceId: string;
  staffId: string;
  customerId?: string | null;
  customerName: string;
  customerEmail?: string | null;
  status: BookingStatus;
  startUtc: string;
  endUtc: string;
  notes?: string | null;
  bookedPriceCents: number;
  bookedDurationMin: number;
  serviceSnapshotJson: {
    name: string;
    serviceId: string;
    basePriceCents: number;
    baseDurationMin: number;
    capacity?: number;
    bufferBeforeMin?: number;
    bufferAfterMin?: number;
    staffPriceCents?: number | null;
    staffDurationMin?: number | null;
  };
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  noShowAt?: string | null;
  source?: string | null;
  channelRef?: string | null;
  paymentStatus?: 'unpaid' | 'paid' | 'partial' | string;
  depositCents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingListParams {
  staffId?: string;
  serviceId?: string;
  customerId?: string;
  status?: BookingStatus;
  startUtcFrom?: string;
  startUtcTo?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

function getBusinessIdOrThrow(): string {
  const biz = useBusinessStore().current;
  if (!biz) throw new Error('No current business selected');
  return biz.id;
}

function mapBooking(raw: any): Booking {
  return {
    id: raw.id,
    businessId: raw.businessId,
    serviceId: raw.serviceId,
    staffId: raw.staffId,
    customerId: raw.customerId ?? null,
    customerName: raw.customerName,
    customerEmail: raw.customerEmail ?? null,
    status: raw.status,
    startUtc: raw.startUtc,
    endUtc: raw.endUtc,
    notes: raw.notes ?? null,
    bookedPriceCents: raw.bookedPriceCents,
    bookedDurationMin: raw.bookedDurationMin,
    serviceSnapshotJson: raw.serviceSnapshotJson,
    confirmedAt: raw.confirmedAt ?? null,
    cancelledAt: raw.cancelledAt ?? null,
    cancelReason: raw.cancelReason ?? null,
    noShowAt: raw.noShowAt ?? null,
    source: raw.source ?? null,
    channelRef: raw.channelRef ?? null,
    paymentStatus: raw.paymentStatus ?? 'unpaid',
    depositCents: raw.depositCents ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function listBookings(
  params: BookingListParams = {}
): Promise<{
  items: Booking[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.get(`/businesses/${businessId}/bookings`, {
    params: {
      staffId: params.staffId || undefined,
      serviceId: params.serviceId || undefined,
      customerId: params.customerId || undefined,
      status: params.status || undefined,
      startUtcFrom: params.startUtcFrom || undefined,
      startUtcTo: params.startUtcTo || undefined,
      q: params.q || undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });

  const data = res.data?.data ?? [];
  const meta = res.data?.meta ?? {};
  const items = Array.isArray(data) ? data.map(mapBooking) : [];

  return {
    items,
    total: meta.total ?? items.length,
    page: meta.page ?? 1,
    pageSize: meta.pageSize ?? items.length,
    totalPages: meta.totalPages ?? 1,
  };
}

export async function getBooking(id: string): Promise<Booking> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.get(`/businesses/${businessId}/bookings/${id}`);
  return mapBooking(res.data?.data);
}

export async function createBooking(payload: {
  serviceId: string;
  staffId: string;
  customerName: string;
  customerEmail?: string;
  startUtc: string;
  endUtc: string;
  notes?: string;
  channelRef?: string;
}): Promise<Booking> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(`/businesses/${businessId}/bookings`, payload);
  return mapBooking(res.data?.data);
}

export async function confirmBooking(id: string, note?: string): Promise<Booking> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(
    `/businesses/${businessId}/bookings/${id}/confirm`,
    note ? { note } : {}
  );
  return mapBooking(res.data?.data);
}

export async function completeBooking(id: string): Promise<Booking> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(`/businesses/${businessId}/bookings/${id}/complete`);
  return mapBooking(res.data?.data);
}

export async function cancelBooking(id: string, reason: string): Promise<Booking> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(`/businesses/${businessId}/bookings/${id}/cancel`, { reason });
  return mapBooking(res.data?.data);
}

export async function noShowBooking(id: string): Promise<Booking> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(`/businesses/${businessId}/bookings/${id}/no-show`);
  return mapBooking(res.data?.data);
}

export async function rescheduleBooking(
  id: string,
  payload: { startUtc: string; endUtc: string; note?: string }
): Promise<Booking> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.patch(`/businesses/${businessId}/bookings/${id}/reschedule`, payload);
  return mapBooking(res.data?.data);
}
