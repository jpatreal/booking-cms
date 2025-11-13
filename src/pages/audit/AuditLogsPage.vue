<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
      <div>
        <h1 class="text-xl font-semibold text-slate-50">Audit logs</h1>
        <p class="cms-caption">
          See who changed what in your workspace. Filter and export for compliance or debugging.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton size="xs" variant="ghost" @click="reload">
          <RefreshCcw class="w-4 h-4" />
          <span class="cms-helper">Refresh</span>
        </BaseButton>
        <BaseButton size="xs" variant="outline" :loading="exporting" @click="onExport('csv')">
          <Download class="w-4 h-4" />
          <span class="cms-helper">Export CSV</span>
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="bg-slate-950/90 border border-slate-900 rounded-2xl px-3 py-3 flex flex-col md:flex-row gap-3 md:items-end"
    >
      <div class="flex-1 space-y-1">
        <label class="cms-label">Entity (e.g. Service, Staff)</label>
        <input
          v-model="filters.entity"
          type="text"
          placeholder="All entities"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[11px] text-slate-100 outline-none focus:border-brand-500/80"
        />
      </div>

      <div class="flex-1 space-y-1">
        <label class="cms-label">Action contains</label>
        <input
          v-model="filters.action"
          type="text"
          placeholder="e.g. service.create, staff.update"
          class="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[11px] text-slate-100 outline-none focus:border-brand-500/80"
        />
      </div>

      <div class="space-y-1">
        <label class="cms-label">From</label>
        <input
          v-model="filters.dateFrom"
          type="date"
          class="w-32 rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[11px] text-slate-100 outline-none focus:border-brand-500/80"
        />
      </div>

      <div class="space-y-1">
        <label class="cms-label">To</label>
        <input
          v-model="filters.dateTo"
          type="date"
          class="w-32 rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[11px] text-slate-100 outline-none focus:border-brand-500/80"
        />
      </div>

      <div class="flex items-center gap-2">
        <BaseButton size="xs" variant="ghost" @click="resetFilters">
          <XCircle class="w-4 h-4" />
          <span class="cms-helper">Clear</span>
        </BaseButton>
        <BaseButton size="xs" variant="primary" @click="applyFilters">
          <Filter class="w-4 h-4" />
          <span class="cms-helper">Apply</span>
        </BaseButton>
      </div>
    </div>

    <!-- Logs table -->
    <div class="bg-slate-950/90 border border-slate-900 rounded-2xl overflow-hidden">
      <!-- header -->
      <div
        class="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,2fr)] gap-3 px-3 py-2 text-[11px] text-slate-500 border-b border-slate-900 uppercase tracking-wide"
      >
        <div>When</div>
        <div>Actor</div>
        <div>Action</div>
        <div>Details</div>
      </div>

      <!-- states -->
      <div v-if="loading && rows.length === 0" class="px-3 py-4 cms-helper">
        Loading audit logs...
      </div>

      <div v-else-if="!loading && rows.length === 0" class="px-3 py-4 cms-caption">
        No audit events found for this business yet.
      </div>

      <!-- rows -->
      <div v-else class="divide-y divide-slate-900">
        <div
          v-for="log in rows"
          :key="log.id"
          class="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,2fr)] gap-3 px-3 py-2 text-sm text-slate-200 hover:bg-slate-950"
        >
          <!-- When -->
          <div class="flex flex-col">
            <span class="text-slate-100">
              {{ formatDate(log.createdAt) }}
            </span>
            <span class="text-xs text-slate-500">
              {{ formatTime(log.createdAt) }}
            </span>
          </div>

          <!-- Actor -->
          <div class="flex flex-col">
            <span class="text-sm text-slate-200">
              {{ log.actorUserId || 'System' }}
            </span>
            <span class="text-xs text-slate-500">User ID</span>
          </div>

          <!-- Action -->
          <div class="flex flex-col">
            <span class="cms-caption text-brand-400">
              {{ log.action }}
            </span>
            <span class="text-xs text-slate-500">
              {{ log.entity || '—' }} <span v-if="log.entityId">· {{ shortId(log.entityId) }}</span>
            </span>
          </div>

          <!-- Details (meta) -->
          <div class="flex flex-col gap-0.5">
            <div
              v-if="log.meta && Object.keys(log.meta).length"
              class="inline-flex flex-wrap gap-1"
            >
              <span
                v-for="(value, key) in limitedMeta(log.meta)"
                :key="key"
                class="px-1.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-300 max-w-[9rem] truncate"
              >
                <span class="text-slate-500 mr-0.5">{{ key }}:</span>
                <span>{{ String(value) }}</span>
              </span>
              <span
                v-if="Object.keys(log.meta).length > metaPreviewLimit"
                class="text-[11px] text-slate-500"
              >
                +{{ Object.keys(log.meta).length - metaPreviewLimit }} more
              </span>
            </div>
            <span v-else class="text-[9px] text-slate-600">No extra details</span>
          </div>
        </div>
      </div>

      <!-- Load more -->
      <div v-if="nextCursor" class="px-3 py-2 border-t border-slate-900 flex justify-center">
        <BaseButton size="xs" variant="ghost" :loading="loadingMore" @click="loadMore">
          Load more
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBusinessStore } from '../../stores/business';
import { useToastsStore } from '../../stores/toasts';

import BaseButton from '../../components/ui/BaseButton.vue';
// import IconButton from '@/components/ui/IconButton.vue';

import { listAuditLogs, exportAuditLogs, type AuditLogRow } from '../../api/auditLogs';

import { RefreshCcw, Download, Filter, XCircle } from 'lucide-vue-next';

const businessStore = useBusinessStore();
const toasts = useToastsStore();

const rows = ref<AuditLogRow[]>([]);
const nextCursor = ref<string | null>(null);

const loading = ref(false);
const loadingMore = ref(false);
const exporting = ref(false);

const metaPreviewLimit = 4;

const filters = ref({
  entity: '',
  action: '',
  dateFrom: '',
  dateTo: '',
});

onMounted(async () => {
  if (!businessStore.current) {
    await businessStore.fetchMyBusinesses();
  }
  await fetchLogs();
});

async function fetchLogs(cursor?: string | null, append = false) {
  if (!businessStore.current) return;

  if (cursor && append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
    if (!append) rows.value = [];
  }

  try {
    const { rows: fetched, nextCursor: nc } = await listAuditLogs({
      entity: filters.value.entity || undefined,
      action: filters.value.action || undefined,
      dateFrom: filters.value.dateFrom || undefined,
      dateTo: filters.value.dateTo || undefined,
      cursor: cursor || null,
      take: 50,
    });

    rows.value = append ? [...rows.value, ...fetched] : fetched;
    nextCursor.value = nc;
  } catch {
    toasts.error('Failed to load audit logs.');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function reload() {
  fetchLogs();
}

function applyFilters() {
  fetchLogs();
}

function resetFilters() {
  filters.value = {
    entity: '',
    action: '',
    dateFrom: '',
    dateTo: '',
  };
  fetchLogs();
}

async function loadMore() {
  if (!nextCursor.value) return;
  await fetchLogs(nextCursor.value, true);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function shortId(id: string | null) {
  if (!id) return '';
  return id.slice(0, 6) + '…';
}

function limitedMeta(meta: Record<string, any>) {
  const entries = Object.entries(meta).slice(0, metaPreviewLimit);
  const out: Record<string, any> = {};
  for (const [k, v] of entries) out[k] = v;
  return out;
}

async function onExport(format: 'csv' | 'ndjson') {
  if (!businessStore.current) return;
  exporting.value = true;

  try {
    const blob = await exportAuditLogs({
      format,
      entity: filters.value.entity || undefined,
      action: filters.value.action || undefined,
      dateFrom: filters.value.dateFrom || undefined,
      dateTo: filters.value.dateTo || undefined,
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `audit-logs-${businessStore.current.slug}-${ts}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toasts.success('Audit logs exported.');
  } catch {
    toasts.error('Failed to export audit logs.');
  } finally {
    exporting.value = false;
  }
}
</script>
