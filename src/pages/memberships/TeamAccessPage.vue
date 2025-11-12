<!-- src/pages/memberships/TeamAccessPage.vue -->
<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
      <div>
        <h1 class="text-xl font-semibold text-slate-50">Team & access</h1>
        <p class="text-[10px] text-slate-500">
          Manage who can access this business and what they’re allowed to do.
        </p>
      </div>
      <div class="flex items-center gap-2 text-[8px] text-slate-500">
        <span class="px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800">
          Only owners can manage members.
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.3fr)] gap-4">
      <!-- Members -->
      <section class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-[11px] font-semibold text-slate-50">Members</h2>
            <p class="text-[9px] text-slate-500">People who can log in and manage this business.</p>
          </div>
          <div class="flex items-center gap-1 text-[8px]">
            <label class="inline-flex items-center gap-1 text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                v-model="includeDisabled"
                class="w-3 h-3 accent-brand-500"
                @change="loadMemberships"
              />
              <span>Show disabled</span>
            </label>
          </div>
        </div>

        <!-- Add member -->
        <div
          class="flex flex-col md:flex-row gap-2 items-stretch md:items-end bg-slate-950 border border-slate-900 rounded-2xl px-2.5 py-2"
        >
          <div class="flex-1 space-y-1">
            <label class="block text-[8px] text-slate-500"> Invite member by email </label>
            <input
              v-model="inviteEmail"
              type="email"
              placeholder="name@example.com"
              class="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[9px] text-slate-100 outline-none focus:border-brand-500/80"
            />
          </div>
          <div class="w-28 space-y-1">
            <label class="block text-[8px] text-slate-500"> Role </label>
            <select
              v-model="inviteRole"
              class="w-full rounded-xl bg-slate-950 border border-slate-800 px-2 py-1.5 text-[9px] text-slate-100 outline-none focus:border-brand-500/80"
            >
              <option value="MANAGER">Manager</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
          <div class="flex items-end">
            <BaseButton size="xs" variant="primary" :loading="inviting" @click="submitInvite">
              Invite
            </BaseButton>
          </div>
        </div>

        <!-- Members table -->
        <div class="mt-1">
          <div
            class="grid grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)] gap-2 px-2 py-1 text-[8px] text-slate-500 border-b border-slate-800"
          >
            <div>Member</div>
            <div>Role</div>
            <div>Status</div>
            <div class="text-right">Actions</div>
          </div>

          <div v-if="loadingMembers" class="px-2 py-3 text-[9px] text-slate-500">
            Loading members...
          </div>

          <div v-else-if="members.length === 0" class="px-2 py-3 text-[9px] text-slate-500">
            No members yet. Invite your team to help manage bookings.
          </div>

          <div v-else class="divide-y divide-slate-800">
            <div
              v-for="m in members"
              :key="m.id"
              class="grid grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)] gap-2 px-2 py-2 items-center text-[9px]"
            >
              <!-- Member identity -->
              <div class="flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-[8px] text-slate-300"
                >
                  {{ m.userEmail.charAt(0).toUpperCase() }}
                </div>
                <div class="flex flex-col">
                  <span class="text-slate-100 truncate">
                    {{ m.userEmail }}
                    <span v-if="isSelf(m)" class="ml-1 text-[7px] text-emerald-400"> (You) </span>
                  </span>
                  <span class="text-[7px] text-slate-500">
                    Joined: {{ formatDate(m.createdAt) }}
                  </span>
                </div>
              </div>

              <!-- Role -->
              <div>
                <RoleBadge :role="m.role" />
              </div>

              <!-- Status -->
              <div class="flex items-center gap-1">
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="m.disabledAt ? 'bg-slate-600' : 'bg-emerald-400'"
                />
                <span
                  class="text-[8px]"
                  :class="m.disabledAt ? 'text-slate-500' : 'text-emerald-400'"
                >
                  {{ m.disabledAt ? 'Disabled' : 'Active' }}
                </span>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-1.5">
                <!-- Role select (cannot change OWNER or yourself) -->
                <select
                  v-model="roleDraft[m.id]"
                  class="bg-slate-950 border border-slate-800 rounded-lg px-1 py-0.5 text-[7px] text-slate-300 outline-none"
                  :disabled="!canEditMember(m)"
                  @change="onChangeRole(m)"
                >
                  <option value="OWNER" :disabled="true">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="STAFF">Staff</option>
                </select>

                <!-- Enable/disable -->
                <IconButton
                  v-if="canEditMember(m)"
                  :icon="m.disabledAt ? ToggleLeft : ToggleRight"
                  :title="m.disabledAt ? 'Enable access' : 'Disable access'"
                  size="xs"
                  @click="toggleMember(m)"
                />

                <!-- Delete -->
                <IconButton
                  v-if="canEditMember(m)"
                  :icon="Trash2"
                  title="Remove member"
                  size="xs"
                  @click="confirmRemove(m)"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Invites -->
      <section class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-[11px] font-semibold text-slate-50">Pending invites</h2>
            <p class="text-[9px] text-slate-500">Invites waiting to be accepted.</p>
          </div>
        </div>

        <div v-if="loadingInvites" class="text-[9px] text-slate-500">Loading invites...</div>

        <div v-else-if="invites.length === 0" class="text-[9px] text-slate-500">
          No pending invites.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="i in invites"
            :key="i.id"
            class="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-900 text-[8px]"
          >
            <div class="flex flex-col">
              <span class="text-slate-100">
                {{ i.email }}
              </span>
              <span class="text-[7px] text-slate-500">
                Role: {{ i.role }} • Expires: {{ formatDate(i.expiresAt) }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <IconButton
                :icon="RefreshCcw"
                title="Resend invite"
                size="xs"
                @click="onResendInvite(i)"
              />
              <IconButton
                :icon="XCircle"
                title="Cancel invite"
                size="xs"
                @click="onCancelInvite(i)"
              />
            </div>
          </div>
        </div>
      </section>
    </div>

    <PaginationBar
      v-if="totalMembers > pageSize"
      :page="page"
      :page-size="pageSize"
      :total="totalMembers"
      @update:page="onPageChange"
    />

    <!-- Confirm delete member -->
    <ConfirmDialog
      :open="confirmOpen"
      :loading="deleting"
      title="Remove member"
      :message="confirmMessage"
      confirm-label="Remove"
      cancel-label="Cancel"
      confirm-variant="danger"
      @close="onCloseConfirm"
      @confirm="performDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../../stores/auth';
import { useBusinessStore } from '../../stores/business';
import { useToastsStore } from '../../stores/toasts';

import BaseButton from '../../components/ui/BaseButton.vue';
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue';
import IconButton from '../../components/ui/IconButton.vue';
import RoleBadge from '../../components/memberships/RoleBadge.vue';
import PaginationBar from '../../components/ui/PaginationBar.vue';

import {
  listMemberships,
  changeMemberRole,
  disableMember,
  enableMember,
  deleteMember,
  listInvites,
  createInvite,
  resendInvite,
  cancelInvite,
  type Membership,
  type Invite,
} from '../../api/membership';

import { ToggleLeft, ToggleRight, Trash2, RefreshCcw, XCircle } from 'lucide-vue-next';

const auth = useAuthStore();
const bizStore = useBusinessStore();
const toasts = useToastsStore();
const { current: currentBiz } = storeToRefs(bizStore);

const members = ref<Membership[]>([]);
const invites = ref<Invite[]>([]);
const loadingMembers = ref(false);
const loadingInvites = ref(false);
const includeDisabled = ref(false);

const page = ref(1);
const pageSize = 20;
const totalMembers = ref(0);

const inviteEmail = ref('');
const inviteRole = ref<'MANAGER' | 'STAFF'>('MANAGER');
const inviting = ref(false);

const roleDraft = ref<Record<string, string>>({});

const confirmOpen = ref(false);
const deleting = ref(false);
const toDelete = ref<Membership | null>(null);

const confirmMessage = computed(() =>
  toDelete.value
    ? `Remove ${toDelete.value.userEmail} from “${currentBiz.value?.name}”? They will lose access to this business.`
    : 'Remove this member?'
);

onMounted(async () => {
  if (!currentBiz.value) {
    await bizStore.fetchMyBusinesses();
  }
  await Promise.all([loadMemberships(), loadInvites()]);
});

async function loadMemberships() {
  loadingMembers.value = true;
  try {
    const { items, total } = await listMemberships({
      page: page.value,
      pageSize,
      includeDisabled: includeDisabled.value,
    });
    members.value = items;
    totalMembers.value = total ?? items.length;
    roleDraft.value = {};
    items.forEach((m) => {
      roleDraft.value[m.id] = m.role;
    });
  } catch {
    toasts.error('Failed to load members.');
  } finally {
    loadingMembers.value = false;
  }
}

function onPageChange(newPage: number) {
  page.value = newPage;
  loadMemberships();
}

async function loadInvites() {
  loadingInvites.value = true;
  try {
    invites.value = await listInvites();
  } catch {
    toasts.error('Failed to load invites.');
  } finally {
    loadingInvites.value = false;
  }
}

function isSelf(m: Membership) {
  return auth.me && m.userId === auth.me.id;
}

function canEditMember(m: Membership) {
  if (m.role === 'OWNER') return false;
  if (isSelf(m)) return false;
  return true;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* INVITE FLOW */

async function submitInvite() {
  if (!inviteEmail.value.trim()) {
    toasts.error('Please enter an email to invite.');
    return;
  }
  inviting.value = true;
  try {
    await createInvite({
      email: inviteEmail.value.trim(),
      role: inviteRole.value,
    });
    toasts.success('Invite sent.');
    inviteEmail.value = '';
    inviteRole.value = 'MANAGER';
    await loadInvites();
  } catch (e: any) {
    toasts.error(e?.response?.data?.message || 'Failed to send invite.');
  } finally {
    inviting.value = false;
  }
}

async function onResendInvite(i: Invite) {
  try {
    await resendInvite(i.id);
    toasts.success('Invite resent.');
    await loadInvites();
  } catch {
    toasts.error('Failed to resend invite.');
  }
}

async function onCancelInvite(i: Invite) {
  try {
    await cancelInvite(i.id);
    toasts.success('Invite cancelled.');
    invites.value = invites.value.filter((x) => x.id !== i.id);
  } catch {
    toasts.error('Failed to cancel invite.');
  }
}

/* MEMBER ACTIONS */

async function onChangeRole(m: Membership) {
  if (!canEditMember(m)) return;

  const newRole = roleDraft.value[m.id] as any;
  if (!newRole || newRole === m.role) return;

  if (newRole === 'OWNER') {
    roleDraft.value[m.id] = m.role;
    return;
  }

  try {
    const updated = await changeMemberRole(m.id, newRole);
    Object.assign(m, updated);
    toasts.success(`Role updated to ${updated.role}.`);
  } catch {
    roleDraft.value[m.id] = m.role;
    toasts.error('Failed to update role.');
  }
}

async function toggleMember(m: Membership) {
  if (!canEditMember(m)) return;
  try {
    if (m.disabledAt) {
      const updated = await enableMember(m.id);
      Object.assign(m, updated);
      toasts.success('Member enabled.');
    } else {
      const updated = await disableMember(m.id);
      Object.assign(m, updated);
      toasts.success('Member disabled.');
    }
  } catch {
    toasts.error('Failed to update member status.');
  }
}

function confirmRemove(m: Membership) {
  if (!canEditMember(m)) return;
  toDelete.value = m;
  confirmOpen.value = true;
}

function onCloseConfirm() {
  if (deleting.value) return;
  confirmOpen.value = false;
  toDelete.value = null;
}

async function performDelete() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await deleteMember(toDelete.value.id);
    members.value = members.value.filter((x) => x.id !== toDelete.value?.id);
    totalMembers.value = Math.max(0, totalMembers.value - 1);
    toasts.success('Member removed.');
    confirmOpen.value = false;
    toDelete.value = null;
  } catch {
    toasts.error('Failed to remove member.');
  } finally {
    deleting.value = false;
  }
}

const canManageMembers = computed(() => {
  const m = auth.me?.memberships.find((mm) => mm.businessId === currentBiz.value?.id);
  return m?.role === 'OWNER' || m?.role === 'MANAGER';
});
</script>
