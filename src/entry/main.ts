import { createApp } from 'vue'

import App from "../main/MainApp.vue";
import PrimeVue from 'primevue/config';

const app = createApp(App);
app.use(PrimeVue);

app.mount('#app')
