<template>
  <div class="space-y-5">
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-50">Staff</h1>
        <p class="text-[10px] text-slate-500">
          Manage your team, their visibility, and what services they can perform.
        </p>
      </div>
      <BaseButton variant="primary" @click="openCreate">
        <UserPlus class="w-3.5 h-3.5" />
        <span>Add staff</span>
      </BaseButton>
    </div>

    <div
      class="flex flex-col md:flex-row md:items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-3 py-3"
    >
      <div class="flex-1">
        <TextInput v-model="filters.q" placeholder="Search by name, email, or phone..." />
      </div>
      <div class="flex items-center gap-3 text-[10px] text-slate-400">
        <label class="inline-flex items-center gap-1 cursor-pointer">
          <input type="checkbox" v-model="filters.activeOnly" class="w-3 h-3 accent-brand-500" />
          <span>Active only</span>
        </label>
      </div>
      <div class="flex items-center gap-2 text-[10px]">
        <BaseButton variant="ghost" @click="resetFilters">
          <RefreshCcw class="w-3.5 h-3.5" />
          <span>Reset</span>
        </BaseButton>
        <BaseButton variant="outline" @click="applyFilters">
          <Filter class="w-3.5 h-3.5" />
          <span>Apply</span>
        </BaseButton>
      </div>
    </div>

    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl">
      <div
        class="grid grid-cols-[minmax(0,2.6fr)_minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.2fr)] gap-3 px-4 py-2 text-[9px] text-slate-500 border-b border-slate-800"
      >
        <div>Staff</div>
        <div>Contact</div>
        <div>Role</div>
        <div>Status</div>
        <div class="text-right">Actions</div>
      </div>

      <div v-if="loading" class="px-4 py-6 text-xs text-slate-500">Loading staff...</div>
      <div v-else-if="staffList.length === 0" class="px-4 py-6 text-xs text-slate-500">
        No staff yet. Add your team members so customers can book with them.
      </div>

      <div v-else class="divide-y divide-slate-800">
        <div
          v-for="s in staffList"
          :key="s.id"
          class="grid grid-cols-[minmax(0,2.6fr)_minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.2fr)] gap-3 px-4 py-3 text-[10px] items-center hover:bg-slate-900"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold uppercase"
              :style="{ backgroundColor: avatarBg(s), color: '#0f172a' }"
            >
              {{ initials(s.name) }}
            </div>
            <div class="flex flex-col">
              <div class="font-medium text-slate-100">
                {{ s.name }}
                <span
                  v-if="s.userId"
                  class="ml-1 text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-600/60 align-middle"
                >
                  Linked user
                </span>
              </div>
              <div v-if="s.bio" class="text-[9px] text-slate-500 line-clamp-1">
                {{ s.bio }}
              </div>
            </div>
          </div>

          <div class="flex flex-col text-slate-300 gap-0.5">
            <div v-if="s.email" class="flex items-center gap-1">
              <Mail class="w-3 h-3 text-slate-500" />
              <span class="truncate">{{ s.email }}</span>
            </div>
            <div v-if="s.phone" class="flex items-center gap-1">
              <Phone class="w-3 h-3 text-slate-500" />
              <span class="truncate">{{ s.phone }}</span>
            </div>
            <div v-if="!s.email && !s.phone" class="text-[9px] text-slate-500">No contact info</div>
          </div>

          <div>
            <Badge variant="muted"> Staff </Badge>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="flex items-center"
              :title="s.isActive ? 'Click to deactivate' : 'Click to activate'"
              @click="onToggleActive(s)"
            >
              <ToggleRight v-if="s.isActive" class="w-5 h-5 text-emerald-400" />
              <ToggleLeft v-else class="w-5 h-5 text-slate-500" />
            </button>
            <span class="text-[9px]" :class="s.isActive ? 'text-emerald-400' : 'text-slate-500'">
              {{ s.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="flex items-center justify-end gap-1">
            <IconButton :icon="Settings" title="Manage services" @click="openManageServices(s)" />
            <IconButton
              :icon="CalendarDays"
              title="Set availability"
              @click="openAvailability(s)"
            />
            <IconButton :icon="Clock" title="Time off" @click="openTimeOff(s)" />
            <IconButton :icon="Pencil" title="Edit staff" @click="openEdit(s)" />
            <IconButton :icon="Trash2" title="Remove staff" @click="confirmRemove(s)" />
          </div>
        </div>
      </div>
      <PaginationBar
        v-if="totalData > pageSize"
        :page="page"
        :page-size="pageSize"
        :total="totalData"
        @update:page="onPageChange"
      />
    </div>

    <Modal
      :open="showForm"
      :title="editing ? 'Edit staff member' : 'Add staff member'"
      :subtitle="
        editing
          ? 'Update details shown to customers and inside your calendar.'
          : 'Create a staff profile so customers can book with them.'
      "
      @close="closeForm"
    >
      <form class="space-y-3" @submit.prevent="save">
        <TextInput v-model="form.name" label="Full name" required placeholder="e.g. Dr. Jane Doe" />
        <TextInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="Optional, used for login/invites"
        />
        <TextInput v-model="form.phone" label="Phone" placeholder="Optional contact number" />
        <TextInput
          v-model="form.bio"
          label="Short bio"
          placeholder="e.g. General Physician with 5+ years of experience"
        />

        <div class="flex justify-end gap-2 pt-2">
          <BaseButton variant="ghost" type="button" @click="closeForm"> Cancel </BaseButton>
          <BaseButton variant="primary" type="submit" :loading="saving">
            {{ editing ? 'Save changes' : 'Create staff' }}
          </BaseButton>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      :open="confirmOpen"
      :loading="confirmLoading"
      title="Remove staff member"
      :message="confirmMessage"
      confirm-label="Remove"
      cancel-label="Cancel"
      confirm-variant="danger"
      @close="onConfirmClose"
      @confirm="performDelete"
    />

    <StaffServicesDrawer
      :open="showServices"
      :staff="selectedStaff"
      @close="showServices = false"
      @updated="loadStaff"
    />

    <StaffAvailabilityDrawer
      :open="showAvailability"
      :staff="selectedStaff"
      @close="showAvailability = false"
      @updated="loadStaff"
    />

    <StaffTimeOffDrawer
      :open="showTimeOff"
      :staff="selectedStaff"
      @close="showTimeOff = false"
      @updated="loadStaff"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBusinessStore } from '../../stores/business';
import { useToastsStore } from '../../stores/toasts';

import BaseButton from '../../components/ui/BaseButton.vue';
import TextInput from '../../components/ui/TextInput.vue';
import Modal from '../../components/ui/Modal.vue';
import Badge from '../../components/ui/Badge.vue';
import IconButton from '../../components/ui/IconButton.vue';
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue';
import StaffServicesDrawer from '../../components/staff/StaffServicesDrawer.vue';
import StaffAvailabilityDrawer from '../../components/staff/StaffAvailabilityDrawer.vue';
import StaffTimeOffDrawer from '../../components/staff/StaffTimeOffDrawer.vue';
import PaginationBar from '../../components/ui/PaginationBar.vue';

import {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  setStaffActive,
  type Staff,
} from '../../api/staff';

import {
  UserPlus,
  RefreshCcw,
  Filter,
  Mail,
  Phone,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Settings,
  CalendarDays,
  Clock,
} from 'lucide-vue-next';

const businessStore = useBusinessStore();
const toasts = useToastsStore();

const staffList = ref<Staff[]>([]);
const loading = ref(false);
const saving = ref(false);

const page = ref(1);
const pageSize = 20;
const totalData = ref(0);

const filters = ref({
  q: '',
  activeOnly: true,
});

const showForm = ref(false);
const editing = ref<Staff | null>(null);
const form = ref({
  name: '',
  email: '',
  phone: '',
  bio: '',
});

// delete confirm
const confirmOpen = ref(false);
const confirmLoading = ref(false);
const toDelete = ref<Staff | null>(null);

const confirmMessage = computed(() =>
  toDelete.value
    ? `Remove "${toDelete.value.name}" from this business? Existing bookings will keep this staff assigned, but they will no longer appear in new bookings unless re-added.`
    : 'Remove this staff member?'
);

// drawers
const selectedStaff = ref<Staff | null>(null);
const showServices = ref(false);
const showAvailability = ref(false);
const showTimeOff = ref(false);

// helpers
function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');
}

function avatarBg(s: Staff): string | undefined {
  if (s.color) return s.color;
  const seed = s.name || s.id;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const palette = ['#38bdf8', '#22c55e', '#a855f7', '#f97316', '#e11d48', '#14b8a6'];
  return palette[Math.abs(hash) % palette.length];
}

// load staff with pagination + filters
async function loadStaff() {
  if (!businessStore.current) return;
  loading.value = true;

  try {
    const {
      items,
      total,
      page: currentPage,
      pageSize: serverPageSize,
    } = await listStaff({
      q: filters.value.q || undefined,
      activeOnly: filters.value.activeOnly,
      page: page.value,
      pageSize,
    });

    staffList.value = items;
    totalData.value = total ?? items.length;

    if (currentPage) page.value = currentPage;
  } catch (e) {
    toasts.error('Failed to load staff.');
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  page.value = 1;
  loadStaff();
}

function resetFilters() {
  filters.value = { q: '', activeOnly: true };
  page.value = 1;
  loadStaff();
}

function onPageChange(newPage: number) {
  page.value = newPage;
  loadStaff();
}

// create/edit
function openCreate() {
  editing.value = null;
  form.value = { name: '', email: '', phone: '', bio: '' };
  showForm.value = true;
}

function openEdit(s: Staff) {
  editing.value = s;
  form.value = {
    name: s.name,
    email: s.email || '',
    phone: s.phone || '',
    bio: s.bio || '',
  };
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editing.value = null;
}

async function save() {
  if (!businessStore.current) return;

  const payload = {
    name: form.value.name.trim(),
    email: form.value.email.trim() || undefined,
    phone: form.value.phone.trim() || undefined,
    bio: form.value.bio.trim() || undefined,
  };

  if (!payload.name) {
    toasts.error('Name is required.');
    return;
  }

  saving.value = true;
  try {
    if (editing.value) {
      const updated = await updateStaff(editing.value.id, payload);
      staffList.value = staffList.value.map((s) => (s.id === updated.id ? updated : s));
      toasts.success('Staff updated successfully.');
    } else {
      const created = await createStaff(payload);
      // prepend to current page
      staffList.value = [created, ...staffList.value];
      totalData.value += 1;
      toasts.success('Staff created successfully.');
    }
    closeForm();
  } catch {
    toasts.error('Failed to save staff. Please check details and try again.');
  } finally {
    saving.value = false;
  }
}

// toggle active
async function onToggleActive(s: Staff) {
  const prev = s.isActive;
  s.isActive = !s.isActive;
  try {
    const updated = await setStaffActive(s.id, s.isActive);
    s.isActive = updated.isActive;
    toasts.success(
      updated.isActive ? `“${updated.name}” is now active.` : `“${updated.name}” is now inactive.`
    );
  } catch {
    s.isActive = prev;
    toasts.error('Failed to update status.');
  }
}

// delete
function confirmRemove(s: Staff) {
  toDelete.value = s;
  confirmOpen.value = true;
}

function onConfirmClose() {
  if (confirmLoading.value) return;
  confirmOpen.value = false;
  toDelete.value = null;
}

async function performDelete() {
  if (!toDelete.value) return;
  confirmLoading.value = true;
  try {
    await deleteStaff(toDelete.value.id);
    staffList.value = staffList.value.filter((x) => x.id !== toDelete.value?.id);
    totalData.value = Math.max(0, totalData.value - 1);
    toasts.success('Staff removed.');
    confirmOpen.value = false;
    toDelete.value = null;
  } catch {
    toasts.error('Failed to remove staff.');
  } finally {
    confirmLoading.value = false;
  }
}

// drawers openers
function openManageServices(s: Staff) {
  selectedStaff.value = s;
  showServices.value = true;
}
function openAvailability(s: Staff) {
  selectedStaff.value = s;
  showAvailability.value = true;
}
function openTimeOff(s: Staff) {
  selectedStaff.value = s;
  showTimeOff.value = true;
}

onMounted(() => {
  loadStaff();
});
</script>
