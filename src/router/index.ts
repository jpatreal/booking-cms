import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useBusinessStore } from '../stores/business';

const routes: any[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/auth/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/app',
    name: 'business-select',
    component: () => import('../pages/businesses/SelectBusiness.vue'),
  },
  {
    path: '/app/:businessSlug',
    component: () => import('../layouts/AppLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../pages/dashboard/DashboardPage.vue'),
      },
      // {
      //   path: 'bookings',
      //   name: 'bookings',
      //   component: () => import('@/pages/bookings/BookingsListPage.vue'),
      // },
      {
        path: 'staff',
        name: 'staff-list',
        component: () => import('../pages/staff/StaffListPage.vue'),
      },
      // {
      //   path: 'staff/availability',
      //   name: 'staff-availability',
      //   component: () => import('@/pages/staff/StaffAvailabilityPage.vue'),
      // },
      {
        path: 'services',
        name: 'services-list',
        component: () => import('../pages/services/ServicesListPage.vue'),
      },
      // {
      //   path: 'customers',
      //   name: 'customers-list',
      //   component: () => import('@/pages/customers/CustomersListPage.vue'),
      // },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login' };
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return '/app';
  }

  if (to.params.businessSlug) {
    const bizStore = useBusinessStore();
    const slug = String(to.params.businessSlug);

    if (!bizStore.list.length) {
      await bizStore.fetchMyBusinesses();
    }

    bizStore.setCurrentBySlug(slug);
  }

  return true;
});

export default router;
