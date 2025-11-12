import api from './api';
import { useBusinessStore } from '../stores/business';

export interface AuditLogMeta {
  [key: string]: any;
}

export interface AuditLogRow {
  id: string;
  businessId: string;
  actorUserId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  meta: AuditLogMeta | null;
  createdAt: string;
}

export interface AuditLogListResult {
  rows: AuditLogRow[];
  nextCursor: string | null;
}

function getBusinessIdOrThrow(): string {
  const biz = useBusinessStore().current;
  if (!biz) throw new Error('No current business selected');
  return biz.id;
}

export async function listAuditLogs(params?: {
  actorUserId?: string;
  entity?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  cursor?: string | null;
  take?: number;
}): Promise<AuditLogListResult> {
  const businessId = getBusinessIdOrThrow();

  const res = await api.get('/audit-logs', {
    params: {
      businessId,
      actorUserId: params?.actorUserId || undefined,
      entity: params?.entity || undefined,
      action: params?.action || undefined,
      dateFrom: params?.dateFrom || undefined,
      dateTo: params?.dateTo || undefined,
      cursor: params?.cursor || undefined,
      take: params?.take || 50,
    },
  });

  const data = res.data?.data;
  return {
    rows: (data?.rows || []).map((r: any) => ({
      id: r.id,
      businessId: r.businessId,
      actorUserId: r.actorUserId ?? null,
      action: r.action,
      entity: r.entity ?? null,
      entityId: r.entityId ?? null,
      meta: r.meta ?? null,
      createdAt: r.createdAt,
    })),
    nextCursor: data?.nextCursor ?? null,
  };
}

export async function exportAuditLogs(params: {
  format: 'csv' | 'ndjson';
  actorUserId?: string;
  entity?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Blob> {
  const businessId = getBusinessIdOrThrow();

  const res = await api.get('/audit-logs/export', {
    params: {
      businessId,
      format: params.format,
      actorUserId: params.actorUserId || undefined,
      entity: params.entity || undefined,
      action: params.action || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
    },
    responseType: 'blob',
  });

  return res.data as Blob;
}
