import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './assets/tailwind.css';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
app.use(createPinia());
const auth = useAuthStore();
await auth.fetchMe();
app.use(router);
app.mount('#app');
