import api from './api';
import { useBusinessStore } from '../stores/business';

export interface BusinessHourItem {
  dayOfWeek: number;
  openTimeLocal: string;
  closeTimeLocal: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  primaryColor: string;
  logoUrl: string;
  tagline: string;
  addressJson: any;
  hours: BusinessHourItem[];
}

function getBusinessIdOrThrow(): string {
  const store = useBusinessStore();
  const biz = store.current;
  if (!biz) throw new Error('No current business selected');
  return biz.id;
}

function mapBusiness(raw: any): Business {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    timezone: raw.timezone || 'UTC',
    primaryColor: raw.primaryColor,
    logoUrl: raw.logoUrl,
    tagline: raw.tagline,
    addressJson: raw.addressJson,
    hours: Array.isArray(raw.hours)
      ? raw.hours.map((h: any) => ({
          dayOfWeek: h.dayOfWeek,
          openTimeLocal: h.openTimeLocal,
          closeTimeLocal: h.closeTimeLocal,
        }))
      : [],
  };
}

export async function listMyBusinesses() {
  const res = await api.get('/businesses');
  const payload = res.data?.data;
  const items = payload?.data || payload || [];
  const mapped = items.map(mapBusiness);
  return {
    items: mapped,
    page: payload?.page ?? 1,
    pageSize: payload?.pageSize ?? mapped.length,
    total: payload?.total ?? mapped.length,
  };
}

export async function getBusiness(businessId?: string): Promise<Business> {
  const id = businessId || getBusinessIdOrThrow();
  const res = await api.get(`/businesses/${id}`);
  return mapBusiness(res.data?.data);
}

export async function createBusiness(input: {
  name: string;
  hours?: { items: BusinessHourItem[] };
}): Promise<Business> {
  const res = await api.post('/businesses', input);
  return mapBusiness(res.data?.data);
}

export async function updateBusiness(
  businessId: string,
  input: {
    name?: string;
    timezone?: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    tagline?: string | null;
    address?: any;
    hours?: { items: BusinessHourItem[] };
  }
): Promise<Business> {
  const res = await api.patch(`/businesses/${businessId}`, input);
  return mapBusiness(res.data?.data);
}

export async function replaceBusinessHours(
  businessId: string,
  items: BusinessHourItem[]
): Promise<Business> {
  const res = await api.post(`/businesses/${businessId}/hours/replace`, {
    items,
  });
  return mapBusiness(res.data?.data);
}

export async function getBusinessHours(businessId: string): Promise<BusinessHourItem[]> {
  const res = await api.get(`/businesses/${businessId}/hours`);
  const rows = res.data?.data || [];
  return rows.map((h: any) => ({
    dayOfWeek: h.dayOfWeek,
    openTimeLocal: h.openTimeLocal,
    closeTimeLocal: h.closeTimeLocal,
  }));
}

export async function softDeleteBusiness(businessId: string) {
  await api.delete(`/businesses/${businessId}`);
}
