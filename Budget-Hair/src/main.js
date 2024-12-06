import './assets/css/tailwind.css';
import { createPinia } from 'pinia';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'

const app = createApp(App)
const pinia = createPinia();

app.use(pinia);
app.use(router)

app.mount('#app')
