import { createApp } from 'vue'

import App from "./MainApp.vue";
import PrimeVue from 'primevue/config';


const app = createApp(App);
app.use(PrimeVue);

app.mount('#app')