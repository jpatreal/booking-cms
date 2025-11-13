<template>
  <header
    class="h-14 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md"
  >
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5">
        <!-- <div
          class="w-6 h-6 rounded-xl bg-brand-600/90 text-[10px] font-semibold flex items-center justify-center text-slate-950"
        >
          B
        </div> -->
        <div class="flex flex-col leading-none gap-y-1">
          <span class="text-[11px] uppercase tracking-[0.16em] text-slate-500"> Booking CMS </span>
          <span class="text-[10px] text-slate-400"> Admin </span>
        </div>
      </div>

      <div class="relative">
        <button
          v-if="currentBiz && businesses.length > 1"
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-[10px] text-slate-100 hover:border-brand-500/70 hover:bg-slate-900/90 transition"
          @click="toggleBizMenu"
        >
          <Building2 class="w-3.5 h-3.5 text-brand-400" />
          <span class="max-w-[160px] truncate">
            {{ currentBiz.name }}
          </span>
          <ChevronDown
            class="w-3 h-3 text-slate-500 transition-transform"
            :class="{ 'rotate-180': bizMenuOpen }"
          />
        </button>

        <div
          v-else-if="currentBiz"
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-200"
        >
          <Building2 class="w-3.5 h-3.5 text-brand-400" />
          <span class="max-w-[180px] truncate">
            {{ currentBiz.name }}
          </span>
        </div>

        <button
          v-else
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-[10px] text-amber-300 hover:bg-slate-900/90 transition"
          @click="goToBusinessSelect"
        >
          <AlertCircle class="w-3.5 h-3.5" />
          <span>Select a business</span>
        </button>

        <transition name="fade-scale">
          <div
            v-if="bizMenuOpen"
            class="absolute mt-1 w-56 z-50 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl py-1.5"
          >
            <div class="px-2 pb-1">
              <div class="text-[11px] text-slate-500">Switch business</div>
            </div>

            <button
              v-for="b in businesses"
              :key="b.id"
              class="w-full flex items-center gap-2 px-2.5 py-1.5 text-[10px] text-left hover:bg-slate-900/90 transition"
              @click="selectBusiness(b)"
            >
              <div
                class="w-4 h-4 rounded-md bg-slate-800 flex items-center justify-center text-[8px] text-slate-300"
              >
                {{ b.name.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col">
                <span
                  class="text-slate-100 truncate"
                  :class="{
                    'font-semibold text-brand-400': currentBiz && b.id === currentBiz.id,
                  }"
                >
                  {{ b.name }}
                </span>
                <span class="text-[8px] text-slate-500 truncate">
                  {{ b.slug }}
                </span>
              </div>
              <span
                v-if="currentBiz && b.id === currentBiz.id"
                class="ml-auto text-[8px] text-emerald-400"
              >
                Current
              </span>
            </button>

            <div class="border-t border-slate-900 mt-1 pt-1">
              <button
                class="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 transition"
                @click="goToBusinessSelect"
              >
                <ArrowLeftRight class="w-3.5 h-3.5" />
                <span>Manage / view all businesses</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="relative">
      <button
        class="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-900/80 text-[10px] text-slate-300 border border-transparent hover:border-slate-800 transition"
        @click="toggleUserMenu"
      >
        <div
          class="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-semibold text-slate-200"
        >
          {{ userInitials }}
        </div>
        <div class="hidden sm:flex flex-col leading-tight text-left">
          <span class="text-[11px] text-slate-400">
            {{ authStore.loadingMe ? 'Loading account…' : 'Logged in' }}
          </span>

          <span class="text-[11px] text-slate-200 truncate max-w-[120px]">
            {{ userEmail || 'Account' }}
          </span>
        </div>
        <ChevronDown
          class="w-3 h-3 text-slate-500 transition-transform"
          :class="{ 'rotate-180': userMenuOpen }"
        />
      </button>

      <transition name="fade-scale">
        <div
          v-if="userMenuOpen"
          class="absolute right-0 mt-1 w-40 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50"
        >
          <button
            class="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-slate-900/90 transition"
            @click="goToBusinessSelect"
          >
            <Building2 class="w-3.5 h-3.5 text-slate-500" />
            <span>Switch business</span>
          </button>
          <button
            class="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-rose-300 hover:bg-rose-500/10 transition"
            @click="logout"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useBusinessStore } from '../../stores/business';
import { useAuthStore } from '../../stores/auth';
import { Building2, ChevronDown, LogOut, AlertCircle, ArrowLeftRight } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const businessStore = useBusinessStore();
const authStore = useAuthStore();

const { list: businesses, current: currentBiz } = storeToRefs(businessStore);

const bizMenuOpen = ref(false);
const userMenuOpen = ref(false);

const userEmail = computed(() => authStore.me?.email || '');
const userInitials = computed(() => {
  if (authStore.me?.email) return authStore.me.email.charAt(0).toUpperCase();
  return 'U';
});

function toggleBizMenu() {
  if (!currentBiz.value || businesses.value.length <= 1) return;
  bizMenuOpen.value = !bizMenuOpen.value;
  if (bizMenuOpen.value) userMenuOpen.value = false;
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
  if (userMenuOpen.value) bizMenuOpen.value = false;
}

function closeAll() {
  bizMenuOpen.value = false;
  userMenuOpen.value = false;
}

function goToBusinessSelect() {
  closeAll();
  router.push({ name: 'business-select' }); // /app
}

function selectBusiness(biz: (typeof businesses.value)[number]) {
  businessStore.setCurrent(biz);
  closeAll();
  router.push({
    name: 'dashboard',
    params: { businessSlug: biz.slug },
  });
}

onMounted(async () => {
  if (!businesses.value.length) {
    try {
      await businessStore.fetchMyBusinesses();
    } catch {}
  }

  const slug = route.params.businessSlug as string | undefined;
  if (slug && businesses.value.length) {
    businessStore.setCurrentBySlug(slug);
  }
});

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  if (!target) return;
  if (!target.closest('header')) {
    closeAll();
  }
}

window.addEventListener('click', handleClickOutside);
onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

function logout() {
  closeAll();
  authStore.logout();
  router.push({ name: 'login' });
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.14s ease-out;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
