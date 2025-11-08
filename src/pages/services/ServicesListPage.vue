<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-50">Services</h1>
        <p class="text-[10px] text-slate-500">
          Manage what customers can book. Keep it clear, priced right, and easy to choose.
        </p>
      </div>
      <BaseButton variant="primary" @click="openCreate">
        <Plus class="w-3.5 h-3.5" />
        <span>New service</span>
      </BaseButton>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col md:flex-row md:items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-3 py-3"
    >
      <div class="flex-1">
        <TextInput v-model="filters.q" placeholder="Search by name or description..." />
      </div>
      <div class="flex items-center gap-2 text-[10px] text-slate-400">
        <label class="inline-flex items-center gap-1 cursor-pointer">
          <input type="checkbox" v-model="filters.activeOnly" class="w-3 h-3 accent-brand-500" />
          <span>Active only</span>
        </label>
        <select
          v-model="filters.sortBy"
          class="bg-slate-950 border border-slate-800 rounded-xl text-[10px] px-2 py-1 text-slate-300 outline-none"
        >
          <option disabled value="">Sort by</option>
          <option value="createdAt">Newest</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="duration">Duration</option>
        </select>
      </div>
      <div class="flex items-center gap-2 text-[10px]">
        <div class="flex items-center gap-2 text-[10px]">
          <BaseButton variant="ghost" @click="resetFilters">
            <RefreshCcw class="w-3.5 h-3.5" />
            <span>Reset</span>
          </BaseButton>
          <BaseButton variant="outline" @click="loadServices">
            <Filter class="w-3.5 h-3.5" />
            <span>Apply</span>
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl">
      <div
        class="grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 px-4 py-2 text-[9px] text-slate-500 border-b border-slate-800"
      >
        <div>Service</div>
        <div>Price</div>
        <div>Duration</div>
        <div>Status</div>
        <div class="text-right">Actions</div>
      </div>

      <div v-if="loading" class="px-4 py-6 text-xs text-slate-500">Loading services...</div>

      <div v-else-if="services.length === 0" class="px-4 py-6 text-xs text-slate-500">
        No services yet. Create your first service to start accepting bookings.
      </div>

      <div v-else class="divide-y divide-slate-800">
        <div
          v-for="s in services"
          :key="s.id"
          class="grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 px-4 py-3 text-[10px] items-center hover:bg-slate-900"
        >
          <!-- Service name + description -->
          <div class="flex flex-col">
            <div class="font-medium text-slate-100">
              {{ s.name }}
            </div>
            <div v-if="s.description" class="text-[9px] text-slate-500 line-clamp-1">
              {{ s.description }}
            </div>
          </div>

          <!-- Price -->
          <div class="text-slate-100">
            ₱{{ s.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) }}
          </div>

          <!-- Duration -->
          <div class="text-slate-300">{{ s.durationMin }} min</div>

          <!-- Status -->
          <div>
            <Badge :variant="s.active ? 'success' : 'muted'">
              {{ s.active ? 'Active' : 'Hidden' }}
            </Badge>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-1">
            <IconButton :icon="Pencil" title="Edit service" @click="openEdit(s)" />
            <IconButton :icon="Trash2" title="Delete service" @click="confirmDelete(s)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      :open="showForm"
      :title="editing ? 'Edit service' : 'New service'"
      :subtitle="
        editing
          ? 'Update details and availability for this service.'
          : 'Create a service that customers can book online.'
      "
      @close="closeForm"
    >
      <form class="space-y-3" @submit.prevent="save">
        <TextInput
          v-model="form.name"
          label="Service name"
          required
          placeholder="e.g. General Consultation"
        />

        <TextInput
          v-model="form.description"
          label="Description"
          placeholder="Short description shown to customers"
        />

        <div class="grid grid-cols-2 gap-3">
          <TextInput
            v-model="form.durationMin"
            label="Duration (minutes)"
            required
            type="number"
            min="1"
          />
          <TextInput
            v-model="form.price"
            label="Price (₱)"
            required
            type="number"
            min="0"
            step="0.01"
            hint="Exact price customers will see"
          />
        </div>

        <label class="flex items-center gap-2 text-[10px] text-slate-300">
          <input type="checkbox" v-model="form.active" class="w-3 h-3 accent-brand-500" />
          <span>Service is active & visible for booking</span>
        </label>

        <div class="flex justify-end gap-2 pt-2">
          <BaseButton variant="ghost" type="button" @click="closeForm"> Cancel </BaseButton>
          <BaseButton variant="primary" type="submit" :loading="saving">
            {{ editing ? 'Save changes' : 'Create service' }}
          </BaseButton>
        </div>
      </form>
    </Modal>
    <ConfirmDialog
      :open="confirmDeleteOpen"
      :loading="confirmDeleteLoading"
      title="Delete service"
      :message="confirmDeleteMessage"
      confirm-label="Delete service"
      cancel-label="Cancel"
      confirm-variant="danger"
      @close="
        () => {
          if (!confirmDeleteLoading) {
            confirmDeleteOpen = false;
            toDelete = null;
          }
        }
      "
      @confirm="performDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useBusinessStore } from '../../stores/business';
import { Pencil, Trash2, Plus, RefreshCcw, Filter } from 'lucide-vue-next';
import BaseButton from '../../components/ui/BaseButton.vue';
import TextInput from '../../components/ui/TextInput.vue';
import Modal from '../../components/ui/Modal.vue';
import Badge from '../../components/ui/Badge.vue';
import IconButton from '../../components/ui/ActionButton.vue';
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue';
import {
  listServices,
  createService,
  updateService,
  deleteService,
  type Service,
} from '../../api/services';
import { useToastsStore } from '../../stores/toasts';
const toasts = useToastsStore();

const businessStore = useBusinessStore();

const services = ref<Service[]>([]);
const loading = ref(false);
const saving = ref(false);

const showForm = ref(false);
const editing = ref<Service | null>(null);

const confirmDeleteOpen = ref(false);
const confirmDeleteLoading = ref(false);
const toDelete = ref<Service | null>(null);

const confirmDeleteMessage = computed(() =>
  toDelete.value
    ? `Are you sure you want to delete "${toDelete.value.name}"? Existing bookings will keep this service attached, but new customers will no longer see or book it.`
    : 'Are you sure you want to delete this service?'
);

const form = ref({
  name: '',
  description: '',
  durationMin: '60',
  price: '0',
  active: true,
});

const filters = ref({
  q: '',
  activeOnly: false,
  sortBy: 'createdAt' as 'name' | 'price' | 'duration' | 'createdAt' | '',
});

async function loadServices() {
  if (!businessStore.current) return;

  loading.value = true;
  try {
    const { items } = await listServices({
      q: filters.value.q || undefined,
      active: filters.value.activeOnly ? true : undefined,
      sortBy: filters.value.sortBy || undefined,
      order: filters.value.sortBy ? 'asc' : undefined,
    });
    services.value = items;
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.value = {
    q: '',
    activeOnly: false,
    sortBy: 'createdAt',
  };
  loadServices();
}

function openCreate() {
  editing.value = null;
  form.value = {
    name: '',
    description: '',
    durationMin: '60',
    price: '0',
    active: true,
  };
  showForm.value = true;
}

function openEdit(s: Service) {
  editing.value = s;
  form.value = {
    name: s.name,
    description: s.description || '',
    durationMin: String(s.durationMin),
    price: String(s.price),
    active: s.active,
  };
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editing.value = null;
}

async function save() {
  if (!businessStore.current) return;
  saving.value = true;
  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || '',
      durationMin: Number(form.value.durationMin),
      price: String(form.value.price),
      active: form.value.active,
    };

    let updated: Service;
    if (editing.value) {
      updated = await updateService(editing.value.id, payload);
      toasts.success('Service updated successfully.');
      services.value = services.value.map((s) => (s.id === updated.id ? updated : s));
    } else {
      updated = await createService(payload);
      toasts.success('Service created successfully.');
      services.value = [updated, ...services.value];
    }

    closeForm();
  } catch {
    toasts.error('Failed creating service.');
  } finally {
    saving.value = false;
  }
}

function confirmDelete(s: Service) {
  toDelete.value = s;
  confirmDeleteOpen.value = true;
}

async function performDelete() {
  if (!toDelete.value) return;

  confirmDeleteLoading.value = true;
  try {
    await deleteService(toDelete.value.id);
    services.value = services.value.filter((x) => x.id !== toDelete.value?.id);
    confirmDeleteOpen.value = false;
    toDelete.value = null;
    toasts.success('Service deleted successfully.');
  } finally {
    confirmDeleteLoading.value = false;
  }
}

onMounted(() => {
  loadServices();
});
</script>
