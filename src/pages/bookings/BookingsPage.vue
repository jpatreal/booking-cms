<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-50">Bookings</h1>
        <p class="cms-caption">
          See all appointments, manage status, and keep your day under control.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton
          size="sm"
          variant="outline"
          class="hidden sm:inline-flex text-xs"
          @click="setTodayRange"
        >
          Today
        </BaseButton>
        <BaseButton
          size="sm"
          variant="outline"
          class="hidden sm:inline-flex text-xs"
          @click="setNext7Days"
        >
          Next 7 days
        </BaseButton>
        <BaseButton
          size="sm"
          class="hidden sm:inline-flex text-xs"
          :variant="viewMode === 'list' ? 'primary' : 'ghost'"
          @click="viewMode = 'list'"
        >
          <ListIcon class="w-3.5 h-3.5 mr-1" />
          List
        </BaseButton>
        <BaseButton
          size="sm"
          class="hidden sm:inline-flex text-xs"
          :variant="viewMode === 'calendar' ? 'primary' : 'ghost'"
          @click="viewMode = 'calendar'"
        >
          <CalendarDays class="w-3.5 h-3.5 mr-1" />
          Calendar
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="openCreate">
          <Plus class="w-3.5 h-3.5" />
          <span>New booking</span>
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col lg:flex-row lg:items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-3 py-3"
    >
      <!-- Search -->
      <div class="flex-1">
        <TextInput
          v-model="filters.q"
          placeholder="Search by customer, email, notes, service..."
          @keyup.enter="reload"
        />
      </div>

      <!-- Status -->
      <div class="flex items-center gap-2 cms-caption">
        <select
          v-model="filters.status"
          class="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 outline-none"
          @change="onFilterStatus"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No-show</option>
        </select>

        <!-- Staff filter -->
        <select
          v-model="filters.staffId"
          class="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 outline-none max-w-[130px]"
          @change="reload"
        >
          <option value="">All staff</option>
          <option v-for="s in staffOptions" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </select>
      </div>

      <!-- Date range quick -->
      <div class="flex items-center gap-1 text-xs text-slate-500">
        <span class="hidden md:inline">Date:</span>
        <BaseButton size="xs" variant="ghost" @click="setTodayRange"> Today </BaseButton>
        <BaseButton size="xs" variant="ghost" @click="setNext7Days"> 7d </BaseButton>
        <BaseButton size="xs" variant="ghost" @click="setNext30Days"> 30d </BaseButton>
      </div>

      <!-- View toggle, apply/reset -->
      <div class="flex items-center gap-2 text-xs">
        <BaseButton size="xs" variant="ghost" @click="resetFilters">
          <RefreshCcw class="w-3 h-3" />
          Reset
        </BaseButton>
        <BaseButton size="xs" variant="outline" @click="reload">
          <Filter class="w-3 h-3" />
          Apply
        </BaseButton>
        <div class="flex items-center gap-1 border-l border-slate-800 pl-2 ml-1">
          <button
            class="p-1 rounded-lg"
            :class="viewMode === 'list' ? 'bg-slate-800 text-brand-400' : 'text-slate-500'"
            @click="viewMode = 'list'"
          >
            <ListIcon class="w-3 h-3" />
          </button>
          <button
            class="p-1 rounded-lg"
            :class="viewMode === 'calendar' ? 'bg-slate-800 text-brand-400' : 'text-slate-500'"
            @click="viewMode = 'calendar'"
          >
            <CalendarDays class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl min-h-[260px]">
      <!-- List view -->
      <template v-if="viewMode === 'list'">
        <!-- header row -->
        <div
          class="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] gap-3 px-4 py-2 text-xs text-slate-500 border-b border-slate-800"
        >
          <div>When & service</div>
          <div>Customer</div>
          <div>Staff</div>
          <div>Status</div>
          <div class="text-right">Actions</div>
        </div>

        <div v-if="loading" class="px-4 py-6 cms-caption">Loading bookings...</div>

        <div v-else-if="bookings.length === 0" class="px-4 py-6 cms-caption">
          No bookings in this range yet. Try adjusting filters or create one manually.
        </div>

        <div v-else class="divide-y divide-slate-800">
          <div
            v-for="b in bookings"
            :key="b.id"
            class="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] gap-3 px-4 py-2.5 items-center text-sm hover:bg-slate-900/80"
          >
            <!-- When & service -->
            <div class="flex flex-col">
              <div class="text-slate-100">
                {{ formatDateTimeRange(b.startUtc, b.endUtc) }}
              </div>
              <div class="text-xs text-slate-400">
                {{ b.serviceSnapshotJson?.name || 'Service' }}
                <span v-if="b.channelRef" class="ml-1 text-xs text-slate-500">
                  • {{ b.channelRef }}
                </span>
              </div>
            </div>

            <!-- Customer -->
            <div class="flex flex-col">
              <div class="text-slate-100 truncate">
                {{ b.customerName || 'Walk-in' }}
              </div>
              <div v-if="b.customerEmail" class="text-xs text-slate-500 truncate">
                {{ b.customerEmail }}
              </div>
              <div v-if="b.notes" class="text-xs text-slate-600 line-clamp-1">
                {{ b.notes }}
              </div>
            </div>

            <!-- Staff -->
            <div class="text-slate-300 text-sm">
              <span :class="staffMap[b.staffId] ? '' : 'text-slate-500'">
                {{ staffMap[b.staffId]?.name || 'Unassigned' }}
              </span>
            </div>

            <!-- Status -->
            <div class="flex flex-col gap-0.5">
              <BookingStatusBadge :status="b.status" />
              <!-- <span
                v-if="b.paymentStatus"
                class="inline-flex w-fit px-1.5 py-0.5 rounded-full text-xs"
                :class="paymentClass(b.paymentStatus)"
              >
                {{ b.paymentStatus }}
              </span> -->
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-1.5">
              <IconButton
                :icon="CalendarClock"
                size="xs"
                title="Reschedule"
                @click="openReschedule(b)"
              />
              <IconButton
                v-if="b.status === 'PENDING'"
                :icon="CheckCircle2"
                size="xs"
                title="Confirm"
                @click="quickConfirm(b)"
              />
              <IconButton
                v-if="b.status === 'CONFIRMED'"
                :icon="CheckCircle2"
                size="xs"
                title="Mark completed"
                @click="quickComplete(b)"
              />
              <IconButton
                v-if="b.status === 'CONFIRMED' || b.status === 'PENDING'"
                :icon="XCircle"
                size="xs"
                title="Cancel"
                @click="openCancel(b)"
              />
              <IconButton
                v-if="b.status === 'CONFIRMED'"
                :icon="CircleOff"
                size="xs"
                title="Mark no-show"
                @click="quickNoShow(b)"
              />
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <PaginationBar
          v-if="total > pageSize"
          :page="page"
          :page-size="pageSize"
          :total="total"
          @update:page="onChangePage"
        />
      </template>

      <!-- Calendar view -->
      <template v-else>
        <div class="px-4 py-3 space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
            <div class="flex items-center gap-1.5">
              <BaseButton size="xs" variant="ghost" @click="prevCalendarRange"> ‹ </BaseButton>
              <BaseButton size="xs" variant="ghost" @click="nextCalendarRange"> › </BaseButton>
              <span class="text-slate-300 font-medium">
                {{ calendarLabel }}
              </span>
            </div>
            <div class="flex items-center gap-1 text-xs">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <span class="text-slate-500">Pending</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="text-slate-500">Confirmed</span>
              <span class="w-2 h-2 rounded-full bg-slate-500"></span>
              <span class="text-slate-500">Other</span>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1.5 text-xs">
            <div
              v-for="day in calendarDays"
              :key="day.key"
              class="flex flex-col bg-slate-950/80 border border-slate-850/70 rounded-xl min-h-[120px] p-1.5 gap-1"
            >
              <div class="flex items-baseline justify-between gap-1 mb-0.5">
                <span class="text-slate-400">
                  {{ day.label }}
                </span>
                <span class="text-xs text-slate-500"> {{ day.count }} appt </span>
              </div>

              <div class="space-y-0.5 overflow-y-auto max-h-40 pr-0.5">
                <button
                  v-for="b in day.bookings"
                  :key="b.id"
                  class="w-full text-left px-1.5 py-0.5 rounded-lg border text-xs flex flex-col gap-0.5 hover:border-brand-500/70 hover:bg-slate-900/90 transition"
                  :class="calendarBookingClass(b)"
                  @click="openReschedule(b)"
                >
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-medium truncate">
                      {{ formatTime(b.startUtc) }} •
                      {{ b.serviceSnapshotJson?.name || 'Service' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between gap-1 text-xs">
                    <span class="truncate">
                      {{ b.customerName }}
                    </span>
                    <span class="truncate text-slate-500">
                      {{ staffMap[b.staffId]?.name || '—' }}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Create / Edit Booking Modal (manual create) -->
    <Modal
      :open="showForm"
      title="Create booking"
      subtitle="Manually block time for a customer."
      @close="closeForm"
    >
      <form class="space-y-3" @submit.prevent="saveBooking">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Service</label>
            <select
              v-model="form.serviceId"
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-sm text-slate-100 outline-none"
            >
              <option value="" disabled>Select service</option>
              <option v-for="s in serviceOptions" :key="s.id" :value="s.id">
                {{ s.name }} • ₱{{ (s.price || 0).toFixed(2) }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Staff</label>
            <select
              v-model="form.staffId"
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-sm text-slate-100 outline-none"
            >
              <option value="" disabled>Select staff</option>
              <option v-for="s in staffOptions" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Date</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-sm text-slate-100 outline-none"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-slate-400 mb-1">Start time</label>
              <input
                v-model="form.startTime"
                type="time"
                required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-sm text-slate-100 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">End time</label>
              <input
                v-model="form.endTime"
                type="time"
                required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-sm text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            v-model="form.customerName"
            label="Customer name"
            required
            placeholder="Full name"
          />
          <TextInput
            v-model="form.customerEmail"
            label="Customer email"
            type="email"
            placeholder="Optional"
          />
        </div>

        <TextInput
          v-model="form.notes"
          label="Notes"
          placeholder="Internal note or special request"
        />

        <div class="flex justify-end gap-2 pt-2">
          <BaseButton variant="ghost" type="button" @click="closeForm"> Cancel </BaseButton>
          <BaseButton variant="primary" type="submit" :loading="saving">
            Create booking
          </BaseButton>
        </div>
      </form>
    </Modal>

    <!-- Cancel Modal -->
    <Modal
      :open="showCancel"
      title="Cancel booking"
      subtitle="Add a reason so your team knows what happened."
      @close="closeCancel"
    >
      <div class="space-y-3">
        <p class="text-sm text-slate-400">
          Booking:
          <span class="text-slate-200">
            {{ activeBooking && formatDateTimeRange(activeBooking.startUtc, activeBooking.endUtc) }}
            • {{ activeBooking?.customerName }}
          </span>
        </p>
        <TextInput
          v-model="cancelReason"
          label="Reason"
          placeholder="e.g. Client requested to cancel"
        />
        <div class="flex justify-end gap-2 pt-1">
          <BaseButton variant="ghost" size="sm" @click="closeCancel">Close</BaseButton>
          <BaseButton variant="danger" size="sm" :loading="savingAction" @click="confirmCancel">
            Cancel booking
          </BaseButton>
        </div>
      </div>
    </Modal>

    <!-- Reschedule Modal -->
    <Modal
      :open="showReschedule"
      title="Reschedule booking"
      subtitle="Pick a new time for this booking."
      @close="closeReschedule"
    >
      <div v-if="activeBooking" class="space-y-3">
        <p class="text-sm text-slate-400">
          {{ activeBooking.customerName }} —
          {{ activeBooking.serviceSnapshotJson?.name }}
          <br />
          Current:
          <span class="text-slate-200">
            {{ formatDateTimeRange(activeBooking.startUtc, activeBooking.endUtc) }}
          </span>
        </p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">New date</label>
            <input
              v-model="resched.date"
              type="date"
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-sm text-slate-100 outline-none"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-slate-400 mb-1">Start</label>
              <input
                v-model="resched.startTime"
                type="time"
                required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-sm text-slate-100 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">End</label>
              <input
                v-model="resched.endTime"
                type="time"
                required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-sm text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>
        <TextInput
          v-model="resched.note"
          label="Note"
          placeholder="Optional internal note for this change"
        />
        <div class="flex justify-end gap-2 pt-1">
          <BaseButton variant="ghost" size="sm" @click="closeReschedule">Close</BaseButton>
          <BaseButton
            variant="primary"
            size="sm"
            :loading="savingAction"
            @click="confirmReschedule"
          >
            Save changes
          </BaseButton>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { toZonedTime } from 'date-fns-tz';
import { useBusinessStore } from '../../stores/business';
import { useToastsStore } from '../../stores/toasts';

import BaseButton from '../../components/ui/BaseButton.vue';
import TextInput from '../../components/ui/TextInput.vue';
import Modal from '../../components/ui/Modal.vue';
import IconButton from '../../components/ui/IconButton.vue';
import PaginationBar from '../../components/ui/PaginationBar.vue';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge.vue';
// import ConfirmDialog from '../../components/ui/ConfirmDialog.vue'; // if you want for extra confirms

import {
  listBookings,
  createBooking,
  confirmBooking,
  completeBooking,
  cancelBooking,
  noShowBooking,
  rescheduleBooking,
  type Booking,
  type BookingStatus,
} from '../../api/bookings';

import { listStaff, type Staff } from '../../api/staff';
import { listServices, type Service } from '../../api/services';

import {
  Plus,
  Filter,
  RefreshCcw,
  List as ListIcon,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  XCircle,
  CircleOff,
} from 'lucide-vue-next';

import { buildUtcRangeFromBizLocal } from '../../utils/time';

const bizStore = useBusinessStore();
const toasts = useToastsStore();

const viewMode = ref<'list' | 'calendar'>('list');

const bookings = ref<Booking[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);

// Filters
const filters = ref<{
  q: string;
  status: '' | BookingStatus;
  staffId: string;
  startUtcFrom?: string | null;
  startUtcTo?: string | null;
}>({
  q: '',
  status: '',
  staffId: '',
  startUtcFrom: null,
  startUtcTo: null,
});

// Staff & services for selects & mapping
const staffOptions = ref<Staff[]>([]);
const staffMap = computed<Record<string, Staff>>(() => {
  const map: Record<string, Staff> = {};
  staffOptions.value.forEach((s) => (map[s.id] = s));
  return map;
});

const serviceOptions = ref<Service[]>([]);

// Create booking form
const showForm = ref(false);
const saving = ref(false);
const form = ref({
  serviceId: '',
  staffId: '',
  date: '',
  startTime: '',
  endTime: '',
  customerName: '',
  customerEmail: '',
  notes: '',
});

// Action state
const activeBooking = ref<Booking | null>(null);
const showCancel = ref(false);
const cancelReason = ref('');
const showReschedule = ref(false);
const resched = ref({
  date: '',
  startTime: '',
  endTime: '',
  note: '',
});
const savingAction = ref(false);

// --------- Load helpers ---------

async function loadFiltersSupport() {
  if (!bizStore.current) return;
  try {
    const [staffRes, servicesRes] = await Promise.all([
      listStaff({ page: 1, pageSize: 100 }),
      listServices({ page: 1, pageSize: 100 }),
    ]);
    staffOptions.value = staffRes.items;
    serviceOptions.value = servicesRes.items;
  } catch {
    // soft fail
  }
}

async function loadBookings() {
  if (!bizStore.current) return;
  loading.value = true;
  try {
    const {
      items,
      total: t,
      page: p,
    } = await listBookings({
      q: filters.value.q || undefined,
      status: filters.value.status || undefined,
      staffId: filters.value.staffId || undefined,
      startUtcFrom: filters.value.startUtcFrom || undefined,
      startUtcTo: filters.value.startUtcTo || undefined,
      page: page.value,
      pageSize,
    });
    bookings.value = items;
    total.value = t;
    page.value = p;
  } catch {
    toasts.error('Failed to load bookings.');
  } finally {
    loading.value = false;
  }
}

function reload() {
  page.value = 1;
  loadBookings();
}

function toBizLocal(isoUtc: string): Date {
  const tz =
    bizStore.current?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const utcDate = new Date(isoUtc);
  // isoUtc is UTC; interpret in that zone
  return toZonedTime(utcDate, tz);
}

// --------- Filters & date ranges ---------

function resetFilters() {
  filters.value = {
    q: '',
    status: '',
    staffId: '',
    startUtcFrom: null,
    startUtcTo: null,
  };
  page.value = 1;
  loadBookings();
}

function onFilterStatus() {
  page.value = 1;
  loadBookings();
}

function setTodayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  filters.value.startUtcFrom = start.toISOString();
  filters.value.startUtcTo = end.toISOString();
  reload();
}

function setNext7Days() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  filters.value.startUtcFrom = start.toISOString();
  filters.value.startUtcTo = end.toISOString();
  reload();
}

function setNext30Days() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);
  filters.value.startUtcFrom = start.toISOString();
  filters.value.startUtcTo = end.toISOString();
  reload();
}

function onChangePage(newPage: number) {
  page.value = newPage;
  loadBookings();
}

// --------- Calendar view computed ---------

const calendarDays = computed(() => {
  // use startUtcFrom/To if set, else default to 7-day window from today
  const start = filters.value.startUtcFrom
    ? new Date(filters.value.startUtcFrom)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();
  const days: {
    key: string;
    label: string;
    dateStr: string;
    bookings: Booking[];
    count: number;
  }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
    });
    const dayBookings = bookings.value.filter((b) => {
      const local = toBizLocal(b.startUtc);
      const localKey = local.toISOString().slice(0, 10);
      return localKey === key;
    });

    days.push({
      key,
      label,
      dateStr: key,
      bookings: dayBookings,
      count: dayBookings.length,
    });
  }
  return days;
});

const calendarLabel = computed(() => {
  const days = calendarDays.value;
  if (!days || days.length === 0) return '';

  const firstDay = days[0]!;
  const lastDay = days[days.length - 1]!;

  const f = new Date(firstDay.dateStr);
  const l = new Date(lastDay.dateStr);

  if (Number.isNaN(f.getTime()) || Number.isNaN(l.getTime())) return '';

  return (
    f.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' - ' +
    l.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );
});

function prevCalendarRange() {
  shiftCalendar(-7);
}

function nextCalendarRange() {
  shiftCalendar(7);
}

function shiftCalendar(offsetDays: number) {
  const from = filters.value.startUtcFrom ? new Date(filters.value.startUtcFrom) : new Date();
  from.setDate(from.getDate() + offsetDays);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  filters.value.startUtcFrom = from.toISOString();
  filters.value.startUtcTo = to.toISOString();
  reload();
}

function calendarBookingClass(b: Booking) {
  if (b.status === 'PENDING') {
    return 'border-amber-400/70 bg-amber-500/5 text-amber-200';
  }
  if (b.status === 'CONFIRMED') {
    return 'border-emerald-400/70 bg-emerald-500/5 text-emerald-200';
  }
  return 'border-slate-700/70 bg-slate-900/70 text-slate-200';
}

// --------- Formatting helpers ---------

function formatDateTimeRange(startUtc: string, endUtc: string) {
  if (!startUtc || !endUtc) return '';

  const s = toBizLocal(startUtc);
  const e = toBizLocal(endUtc);

  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 'Invalid date';

  const date = s.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const st = s.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // or false if you want 24h
  });

  const et = e.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${date} • ${st} - ${et}`;
}

function formatTime(isoUtc: string) {
  if (!isoUtc) return '';
  const d = toBizLocal(isoUtc);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function paymentClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'paid') return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40';
  if (s === 'partial') return 'bg-amber-500/10 text-amber-300 border border-amber-500/40';
  return 'bg-slate-900 text-slate-400 border border-slate-700/70';
}

// --------- Create booking ---------

function openCreate() {
  const now = new Date();
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  form.value = {
    serviceId: '',
    staffId: '',
    date: start.toISOString().slice(0, 10),
    startTime: start.toISOString().slice(11, 16),
    endTime: end.toISOString().slice(11, 16),
    customerName: '',
    customerEmail: '',
    notes: '',
  };
  showForm.value = true;
}

function closeForm() {
  if (saving.value) return;
  showForm.value = false;
}

async function saveBooking() {
  if (!bizStore.current) return;

  if (!form.value.serviceId || !form.value.staffId) {
    toasts.error('Select service and staff.');
    return;
  }
  if (!form.value.date || !form.value.startTime || !form.value.endTime) {
    toasts.error('Select date and time.');
    return;
  }
  if (!form.value.customerName.trim()) {
    toasts.error('Customer name is required.');
    return;
  }

  const [shStr = '0', smStr = '0'] = form.value.startTime.split(':');
  const [ehStr = '0', emStr = '0'] = form.value.endTime.split(':');

  const sh = Number(shStr);
  const sm = Number(smStr);
  const eh = Number(ehStr);
  const em = Number(emStr);

  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const durationMin = endMinutes - startMinutes;

  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    toasts.error('End time must be after start time.');
    return;
  }

  const businessTz = bizStore.current.timezone || 'UTC';

  const { startUtc, endUtc } = buildUtcRangeFromBizLocal({
    date: form.value.date,
    startTime: form.value.startTime,
    durationMin,
    businessTz,
  });

  saving.value = true;
  try {
    await createBooking({
      serviceId: form.value.serviceId,
      staffId: form.value.staffId,
      customerName: form.value.customerName.trim(),
      customerEmail: form.value.customerEmail.trim() || undefined,
      startUtc,
      endUtc,
      notes: form.value.notes.trim() || undefined,
      channelRef: 'internal',
    });
    toasts.success('Booking created.');
    showForm.value = false;
    reload();
  } catch (e: any) {
    toasts.error(e?.response?.data?.message || 'Failed to create booking.');
  } finally {
    saving.value = false;
  }
}

// --------- Actions: confirm, complete, cancel, no-show, resched ---------

function setActive(b: Booking | null) {
  activeBooking.value = b;
}

async function quickConfirm(b: Booking) {
  savingAction.value = true;
  try {
    const updated = await confirmBooking(b.id);
    replaceBooking(updated);
    toasts.success('Booking confirmed.');
  } catch {
    toasts.error('Failed to confirm booking.');
  } finally {
    savingAction.value = false;
  }
}

async function quickComplete(b: Booking) {
  savingAction.value = true;
  try {
    const updated = await completeBooking(b.id);
    replaceBooking(updated);
    toasts.success('Marked as completed.');
  } catch {
    toasts.error('Failed to complete booking.');
  } finally {
    savingAction.value = false;
  }
}

function openCancel(b: Booking) {
  setActive(b);
  cancelReason.value = '';
  showCancel.value = true;
}

function closeCancel() {
  if (savingAction.value) return;
  showCancel.value = false;
  setActive(null);
}

async function confirmCancel() {
  if (!activeBooking.value) return;
  if (!cancelReason.value.trim()) {
    toasts.error('Please enter a reason.');
    return;
  }
  savingAction.value = true;
  try {
    const updated = await cancelBooking(activeBooking.value.id, cancelReason.value.trim());
    replaceBooking(updated);
    toasts.success('Booking cancelled.');
    closeCancel();
  } catch {
    toasts.error('Failed to cancel booking.');
  } finally {
    savingAction.value = false;
  }
}

async function quickNoShow(b: Booking) {
  savingAction.value = true;
  try {
    const updated = await noShowBooking(b.id);
    replaceBooking(updated);
    toasts.success('Marked as no-show.');
  } catch {
    toasts.error('Failed to mark no-show.');
  } finally {
    savingAction.value = false;
  }
}

function openReschedule(b: Booking) {
  setActive(b);
  const start = new Date(b.startUtc);
  const end = new Date(b.endUtc);
  resched.value = {
    date: start.toISOString().slice(0, 10),
    startTime: start.toISOString().slice(11, 16),
    endTime: end.toISOString().slice(11, 16),
    note: '',
  };
  showReschedule.value = true;
}

function closeReschedule() {
  if (savingAction.value) return;
  showReschedule.value = false;
  setActive(null);
}

async function confirmReschedule() {
  if (!activeBooking.value) return;

  const { date, startTime, endTime, note } = resched.value;
  if (!date || !startTime || !endTime) {
    toasts.error('Pick new date and time.');
    return;
  }

  const [shStr = '0', smStr = '0'] = startTime.split(':');
  const [ehStr = '0', emStr = '0'] = endTime.split(':');

  const sh = Number(shStr);
  const sm = Number(smStr);
  const eh = Number(ehStr);
  const em = Number(emStr);

  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  const durationMin = endMinutes - startMinutes;

  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    toasts.error('End time must be after start time.');
    return;
  }

  const businessTz = bizStore.current?.timezone || 'UTC';
  const { startUtc, endUtc } = buildUtcRangeFromBizLocal({
    date,
    startTime,
    durationMin,
    businessTz,
  });

  savingAction.value = true;
  try {
    const updated = await rescheduleBooking(activeBooking.value.id, {
      startUtc,
      endUtc,
      note: note?.trim() || undefined,
    });
    replaceBooking(updated);
    toasts.success('Booking rescheduled.');
    closeReschedule();
  } catch {
    toasts.error('Failed to reschedule booking.');
  } finally {
    savingAction.value = false;
  }
}

function replaceBooking(updated: Booking) {
  bookings.value = bookings.value.map((b) => (b.id === updated.id ? updated : b));
}

// --------- Init ---------

onMounted(async () => {
  if (!bizStore.current) {
    await bizStore.fetchMyBusinesses();
    // auto set first or keep slug logic from router
  }
  await loadFiltersSupport();
  setTodayRange();
});
</script>

<!-- <script setup lang="ts">
// BookingStatusBadge local component
const BookingStatusBadge = defineComponent({
  name: 'BookingStatusBadge',
  props: {
    status: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const label = computed(() => {
      switch (props.status) {
        case 'PENDING':
          return 'Pending';
        case 'CONFIRMED':
          return 'Confirmed';
        case 'COMPLETED':
          return 'Completed';
        case 'CANCELLED':
          return 'Cancelled';
        case 'NO_SHOW':
          return 'No-show';
        default:
          return props.status;
      }
    });

    const cls = computed(() => {
      switch (props.status) {
        case 'PENDING':
          return 'bg-amber-500/10 text-amber-300 border border-amber-500/40';
        case 'CONFIRMED':
          return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40';
        case 'COMPLETED':
          return 'bg-sky-500/10 text-sky-300 border border-sky-500/40';
        case 'CANCELLED':
          return 'bg-rose-500/10 text-rose-300 border border-rose-500/40';
        case 'NO_SHOW':
          return 'bg-slate-700/40 text-slate-200 border border-slate-600/70';
        default:
          return 'bg-slate-800 text-slate-300 border border-slate-700';
      }
    });

    return () => (
      <span
        class={
          'inline-flex items-center px-1.75 py-0.5 rounded-full text-[7px] font-medium ' +
          cls.value
        }
      >
        {label.value}
      </span>
    );
  },
});
</script> -->
