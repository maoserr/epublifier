import { createApp } from 'vue'

import * as App from "./MainApp.vue";
import PrimeVue from 'primevue/config';


const app = createApp(App);
app.use(PrimeVue);

app.mount('#app')