<template>
  <div class="space-y-6">
    <!-- Header -->
    <section class="flex flex-col gap-1">
      <h1 class="text-xl font-semibold text-slate-50">Business settings</h1>
      <p class="cms-caption">Configure your business profile, opening hours, and lifecycle.</p>
      <p v-if="business" class="cms-helper text-slate-400">
        Managing:
        <span class="text-slate-200 font-medium">{{ business.name }}</span>
        <span class="text-slate-500">({{ business.slug }})</span>
      </p>
    </section>

    <!-- Content layout -->
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-4">
      <!-- Left: profile + hours -->
      <div class="space-y-4">
        <!-- Profile card -->
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 space-y-3">
          <div>
            <h2 class="text-sm font-semibold text-slate-50">Business profile</h2>
            <p class="cms-caption">
              Basic details shown on your booking page and inside the dashboard.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div class="space-y-1">
              <label class="block cms-label">Name</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
                placeholder="Your business name"
              />
            </div>

            <div class="space-y-1">
              <label class="block cms-label">Slug</label>
              <div
                class="w-full rounded-xl bg-slate-950 border border-slate-900 px-3 py-2 text-sm text-slate-500 flex items-center gap-1"
              >
                <span>/</span>
                <span class="truncate">{{ business?.slug || 'auto-generated' }}</span>
              </div>
            </div>

            <div class="space-y-1">
              <label class="block cms-label">Timezone</label>
              <select
                v-model="form.timezone"
                class="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500/80"
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Manila">Asia/Manila</option>
                <option value="Asia/Singapore">Asia/Singapore</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
              <p class="cms-caption-muted">
                Used to calculate available slots and display times to customers.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <BaseButton variant="outline" size="sm" :loading="savingProfile" @click="saveProfile">
              Save changes
            </BaseButton>
          </div>
        </div>

        <BrandingCard v-model="branding" :saving="savingBranding" @save="saveBranding" />
        <AddressCard v-model="address" :saving="savingAddress" @save="saveAddress" />

        <!-- NEW: ContactCard component -->
        <ContactCard v-model="contact" :saving="savingContact" @save="saveContact" />

        <!-- Hours card -->
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <div>
              <h2 class="text-sm font-semibold text-slate-50">Opening hours</h2>
              <p class="cms-caption">
                Default weekly hours for this location. Staff availability can further restrict
                slots.
              </p>
            </div>
            <span class="cms-chip px-2 py-0.5 rounded-full border border-slate-800 text-slate-400">
              {{ form.timezone || 'UTC' }}
            </span>
          </div>

          <div v-if="loadingHours" class="cms-helper">Loading hours...</div>

          <BusinessHoursEditor v-else v-model="hoursDraft" />

          <div class="flex justify-between items-center pt-1">
            <p class="cms-caption-muted">
              These hours power your public booking widget. Closed days won’t show any slots.
            </p>
            <BaseButton variant="primary" size="sm" :loading="savingHours" @click="saveHours">
              Save hours
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Right: meta + danger -->
      <div class="space-y-4">
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 space-y-2">
          <div>
            <h2 class="text-sm font-semibold text-slate-50">Plan & usage</h2>
            <p class="cms-caption">
              High-level info about this workspace. (Hook to real plan data later.)
            </p>
          </div>
          <div class="flex flex-col gap-1 cms-helper text-slate-400">
            <div class="flex items-center justify-between">
              <span>Status</span>
              <span
                class="cms-chip px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-700/70"
              >
                Active
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span>Businesses allowed per account</span>
              <span>2</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Current business ID</span>
              <span class="cms-caption-muted text-slate-500 truncate max-w-[160px]">
                {{ business?.id || '—' }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-slate-950/90 border border-rose-900/60 rounded-2xl px-4 py-3 space-y-2">
          <div>
            <h2 class="text-sm font-semibold text-rose-300">Danger zone</h2>
            <p class="cms-helper text-slate-400">
              Soft-delete this business. Existing data is preserved in the backend but hidden from
              normal use.
            </p>
          </div>
          <BaseButton variant="danger" size="sm" :loading="deleting" @click="confirmDelete = true">
            Delete this business
          </BaseButton>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmDelete"
      :loading="deleting"
      title="Delete this business?"
      :message="deleteMessage"
      confirm-label="Delete"
      cancel-label="Cancel"
      confirm-variant="danger"
      @close="onCloseDelete"
      @confirm="performDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBusinessStore } from '../../stores/business';
import { useToastsStore } from '../../stores/toasts';

import BaseButton from '../../components/ui/BaseButton.vue';
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue';
import BusinessHoursEditor from '../../components/business/BusinessHoursEditor.vue';
import BrandingCard from '../../components/business/BrandingCard.vue';
import AddressCard from '../../components/business/AddressCard.vue';
import ContactCard from '../../components/business/ContactCard.vue';

import {
  getBusiness,
  updateBusiness,
  replaceBusinessHours,
  softDeleteBusiness,
  type Business,
  type BusinessHourItem,
} from '../../api/business';

const route = useRoute();
const router = useRouter();
const businessStore = useBusinessStore();
const toasts = useToastsStore();

const business = ref<Business | null>(null);

const form = ref({
  name: '',
  timezone: 'UTC',
});

const hoursDraft = ref<BusinessHourItem[]>([]);

const loading = ref(true);
const loadingHours = ref(true);
const savingProfile = ref(false);
const savingHours = ref(false);
const deleting = ref(false);
const confirmDelete = ref(false);

const savingBranding = ref(false);
const savingAddress = ref(false);
const savingContact = ref(false);

const branding = ref({
  logoUrl: '',
  primaryColor: '#3b82f6',
  tagline: 'Book your appointment in seconds.',
});

const address = ref({
  line1: '',
  line2: '',
  city: '',
  province: '',
  postalCode: '',
  country: '',
});

const contact = ref({
  email: '',
  phone: '',
  website: '',
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  messenger: '',
  viber: '',
});

const deleteMessage = computed(() => {
  if (!business.value) return 'Are you sure you want to delete this business?';
  return `You are about to delete “${business.value.name}”. This will disable its bookings and hide it from your dashboard. You can keep other businesses active.`;
});

onMounted(async () => {
  const current = businessStore.current;
  const slug = route.params.businessSlug as string | undefined;

  try {
    if (!current && slug && businessStore.list.length) {
      businessStore.setCurrentBySlug(slug);
    }

    const effectiveBiz =
      businessStore.current || (businessStore.list.length ? businessStore.list[0] : null);

    if (!effectiveBiz) {
      router.push({ name: 'business-select' });
      return;
    }

    const full = await getBusiness(effectiveBiz.id);
    business.value = full;

    form.value.name = full.name;
    form.value.timezone = full.timezone || 'UTC';
    hoursDraft.value = full.hours || [];

    branding.value = {
      logoUrl: full.logoUrl ?? '',
      primaryColor: normalizeHex(full.primaryColor) ?? '#3b82f6',
      tagline: full.tagline ?? 'Book your appointment in seconds.',
    };

    const a: any = (full as any).addressJson || (full as any).address || {};
    address.value = {
      line1: a.line1 || '',
      line2: a.line2 || '',
      city: a.city || '',
      province: a.province || '',
      postalCode: a.postalCode || '',
      country: a.country || '',
    };

    const c: any = (full as any).contactJson || (full as any).contact || {};
    contact.value = {
      email: c.email || '',
      phone: c.phone || '',
      website: c.website || '',
      facebookUrl: c.facebookUrl || '',
      instagramUrl: c.instagramUrl || '',
      tiktokUrl: c.tiktokUrl || '',
      messenger: c.messenger || '',
      viber: c.viber || '',
    };
  } catch (e) {
    toasts.error('Failed to load business settings.');
  } finally {
    loading.value = false;
    loadingHours.value = false;
  }
});

async function saveProfile() {
  if (!business.value) return;
  if (!form.value.name.trim()) {
    toasts.error('Business name is required.');
    return;
  }

  savingProfile.value = true;
  try {
    const updated = await updateBusiness(business.value.id, {
      name: form.value.name.trim(),
      timezone: form.value.timezone,
    });
    business.value = updated;

    businessStore.setCurrent({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      role: (businessStore.current?.role as any) || 'OWNER',
    });

    toasts.success('Business profile updated.');
  } catch (e) {
    toasts.error('Failed to update business.');
  } finally {
    savingProfile.value = false;
  }
}

async function saveHours() {
  if (!business.value) return;
  savingHours.value = true;
  try {
    const updated = await replaceBusinessHours(business.value.id, hoursDraft.value);
    business.value = updated;
    hoursDraft.value = updated.hours || [];
    toasts.success('Opening hours updated.');
  } catch (e) {
    toasts.error('Failed to update hours.');
  } finally {
    savingHours.value = false;
  }
}

async function saveBranding() {
  if (!business.value) return;
  const hex = branding.value.primaryColor?.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
    toasts.error('Primary color must be a valid hex.');
    return;
  }
  savingBranding.value = true;
  try {
    const updated = await updateBusiness(business.value.id, {
      logoUrl: branding.value.logoUrl || null,
      primaryColor: hex,
      tagline: branding.value.tagline || null,
    });
    business.value = updated;
    toasts.success('Branding updated.');
  } catch {
    toasts.error('Failed to update branding.');
  } finally {
    savingBranding.value = false;
  }
}

async function saveAddress() {
  if (!business.value) return;
  savingAddress.value = true;
  try {
    const updated = await updateBusiness(business.value.id, { address: { ...address.value } });
    business.value = updated;
    toasts.success('Address saved.');
  } catch {
    toasts.error('Failed to save address.');
  } finally {
    savingAddress.value = false;
  }
}

async function saveContact() {
  if (!business.value) return;
  savingContact.value = true;

  try {
    const src = contact.value;
    const clean: Record<string, string> = {};

    (Object.keys(src) as (keyof typeof src)[]).forEach((key) => {
      const raw = src[key] ?? '';
      const v = typeof raw === 'string' ? raw.trim() : raw;
      if (v) clean[key] = v;
    });

    const payload: any = { contact: clean };

    const updated = await updateBusiness(business.value.id, payload);
    business.value = updated;

    const c: any = (updated as any).contactJson || (updated as any).contact || {};
    contact.value = {
      email: c.email || '',
      phone: c.phone || '',
      website: c.website || '',
      facebookUrl: c.facebookUrl || '',
      instagramUrl: c.instagramUrl || '',
      tiktokUrl: c.tiktokUrl || '',
      messenger: c.messenger || '',
      viber: c.viber || '',
    };

    toasts.success('Contact details saved.');
  } catch {
    toasts.error('Failed to save contact details.');
  } finally {
    savingContact.value = false;
  }
}

function onCloseDelete() {
  if (deleting.value) return;
  confirmDelete.value = false;
}

async function performDelete() {
  if (!business.value) return;
  deleting.value = true;
  try {
    await softDeleteBusiness(business.value.id);
    toasts.success('Business deleted.');

    await businessStore.fetchMyBusinesses();
    businessStore.current = null as any;

    router.push({ name: 'business-select' });
  } catch (e) {
    toasts.error('Failed to delete business.');
  } finally {
    deleting.value = false;
    confirmDelete.value = false;
  }
}

function normalizeHex(v?: string | null) {
  if (!v) return null;
  let x = v.trim().toLowerCase();
  if (!x.startsWith('#')) x = `#${x}`;
  if (/^#[0-9a-f]{3}$/i.test(x)) {
    x = `#${x[1]}${x[1]}${x[2]}${x[2]}${x[3]}${x[3]}`;
  }
  return /^#[0-9a-f]{6}$/i.test(x) ? x : null;
}
</script>
