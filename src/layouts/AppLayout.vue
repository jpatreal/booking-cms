<template>
  <div class="min-h-screen flex bg-slate-950 text-slate-100">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Topbar />
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '../components/layout/Sidebar.vue';
import Topbar from '../components/layout/Topbar.vue';
</script>
