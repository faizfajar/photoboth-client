import { createApp } from "vue";
import { createPinia } from "pinia";
import './assets/styles/filters.css'
import App from "./App.vue";

// Import CSS Tailwind
import "./style.css";

const app = createApp(App);
const pinia = createPinia();

// Pasang Pinia ke aplikasi
app.use(pinia);

// Jalankan aplikasi
app.mount("#app");
