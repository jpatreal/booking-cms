import api from './api';
import { useBusinessStore } from '../stores/business';

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  durationMin: number;
  price: number;
  active: boolean;
}

export interface ServiceQuery {
  q?: string;
  active?: string;
  sortBy?: 'name' | 'price' | 'duration' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

function getBusinessIdOrThrow(): string {
  const bizStore = useBusinessStore();
  const biz = bizStore.current;
  if (!biz) throw new Error('No business selected');
  return biz.id;
}

function mapServiceRow(raw: any): Service {
  const active = typeof raw.isActive === 'boolean' ? raw.isActive : !!raw.active;

  let priceNumber = 0;
  if (typeof raw.price === 'number') priceNumber = raw.price;
  else if (typeof raw.price === 'string') priceNumber = Number(raw.price);
  else if (typeof raw.priceCents === 'number') priceNumber = raw.priceCents / 100;

  return {
    id: raw.id,
    businessId: raw.businessId,
    name: raw.name,
    description: raw.description ?? '',
    durationMin: raw.durationMin,
    price: isNaN(priceNumber) ? 0 : priceNumber,
    active,
  };
}

export async function listServices(params: ServiceQuery = {}): Promise<{
  items: Service[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}> {
  const businessId = getBusinessIdOrThrow();

  const query: any = {
    q: params.q || undefined,
    active: params.active != null ? String(params.active) : undefined,
    sortBy: params.sortBy,
    order: params.order,
    page: params.page,
    pageSize: params.pageSize,
  };

  const res = await api.get(`/businesses/${businessId}/services`, { params: query });
  const data = res.data?.data ?? [];
  const meta = res.data?.meta ?? {};

  const items = Array.isArray(data) ? data.map(mapServiceRow) : [];

  return {
    items,
    meta,
  };
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  durationMin: number;
  price: string;
  active?: boolean;
}

export async function createService(payload: CreateServiceInput): Promise<Service> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.post(`/businesses/${businessId}/services`, payload);
  return mapServiceRow(res.data?.data);
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  durationMin?: number;
  price?: string;
  active?: boolean;
}

export async function updateService(id: string, payload: UpdateServiceInput): Promise<Service> {
  const businessId = getBusinessIdOrThrow();
  const res = await api.patch(`/businesses/${businessId}/services/${id}`, payload);
  return mapServiceRow(res.data?.data);
}

export async function deleteService(id: string): Promise<void> {
  const businessId = getBusinessIdOrThrow();
  await api.delete(`/businesses/${businessId}/services/${id}`);
}
